(function () {
  const STORAGE_KEY = 'blendedBeautyCookieConsent';
  const GA_SCRIPT_URL = 'https://www.googletagmanager.com/gtag/js?id=G-LCTXQ1WJH5';
  const ELSIGHT_SCRIPT_URL = 'https://elfsightcdn.com/platform.js';
  const DEFAULT_CONSENT = {
    essential: true,
    analytics: false,
    marketing: false,
    consented: false,
  };

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...DEFAULT_CONSENT, ...saved };
    } catch (error) {
      return { ...DEFAULT_CONSENT };
    }
  }

  function writeConsent(pref) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
  }

  function getBanner() {
    return document.getElementById('cookie-banner');
  }

  function getSettingsPanel() {
    return document.getElementById('cookie-settings-panel');
  }

  function setBannerVisibility(show) {
    const banner = getBanner();
    if (!banner) return;
    banner.hidden = !show;
  }

  function setSettingsState(consent) {
    const analyticsInput = document.querySelector('[data-cookie-setting="analytics"]');
    const marketingInput = document.querySelector('[data-cookie-setting="marketing"]');

    if (analyticsInput) analyticsInput.checked = Boolean(consent.analytics);
    if (marketingInput) marketingInput.checked = Boolean(consent.marketing);
  }

  function showSettingsPanel() {
    const panel = getSettingsPanel();
    if (!panel) return;
    panel.hidden = false;
  }

  function hideSettingsPanel() {
    const panel = getSettingsPanel();
    if (!panel) return;
    panel.hidden = true;
  }

  function loadAnalytics() {
    if (document.querySelector('script[data-cookie-analytics="true"]')) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = GA_SCRIPT_URL;
    script.setAttribute('data-cookie-analytics', 'true');
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.textContent = "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-LCTXQ1WJH5');";
    document.head.appendChild(inline);
  }

  function loadMarketingScripts() {
    if (!document.querySelector('script[src="https://elfsightcdn.com/platform.js"]')) {
      const script = document.createElement('script');
      script.src = ELSIGHT_SCRIPT_URL;
      script.async = true;
      script.setAttribute('data-cookie-marketing', 'true');
      document.body.appendChild(script);
    }

    document.querySelectorAll('[data-cookie-service="marketing"][data-map-src]').forEach((container) => {
      if (container.querySelector('iframe')) return;

      const iframe = document.createElement('iframe');
      iframe.src = container.dataset.mapSrc;
      iframe.title = container.dataset.mapTitle || 'Map';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.className = 'map';
      container.replaceChildren(iframe);
    });
  }

  function applyConsent(consent) {
    const analyticsAllowed = Boolean(consent.analytics);
    const marketingAllowed = Boolean(consent.marketing);

    if (analyticsAllowed) {
      loadAnalytics();
    }

    if (marketingAllowed) {
      loadMarketingScripts();
    }

    const banner = getBanner();
    if (banner) {
      banner.hidden = consent.consented;
    }

    const settingsPanel = getSettingsPanel();
    if (settingsPanel && !consent.consented) {
      settingsPanel.hidden = true;
    }

    document.body.classList.toggle('cookie-consent-ready', consent.consented);
  }

  function saveAndApply(nextConsent, shouldHideBanner = true) {
    const storedConsent = {
      ...DEFAULT_CONSENT,
      ...nextConsent,
      essential: true,
      consented: true,
    };

    writeConsent(storedConsent);
    setSettingsState(storedConsent);
    if (shouldHideBanner) {
      setBannerVisibility(false);
    }
    applyConsent(storedConsent);
  }

  function bindBannerEvents() {
    const banner = getBanner();
    if (!banner) return;

    const acceptButton = banner.querySelector('[data-cookie-action="accept-all"]');
    const rejectButton = banner.querySelector('[data-cookie-action="reject"]');
    const settingsButton = banner.querySelector('[data-cookie-action="settings"]');
    const saveButton = banner.querySelector('[data-cookie-action="save-settings"]');

    acceptButton?.addEventListener('click', () => {
      saveAndApply({ essential: true, analytics: true, marketing: true, consented: true });
    });

    rejectButton?.addEventListener('click', () => {
      saveAndApply({ essential: true, analytics: false, marketing: false, consented: true });
    });

    settingsButton?.addEventListener('click', () => {
      showSettingsPanel();
      settingsButton.setAttribute('aria-expanded', 'true');
    });

    saveButton?.addEventListener('click', () => {
      const analyticsInput = document.querySelector('[data-cookie-setting="analytics"]');
      const marketingInput = document.querySelector('[data-cookie-setting="marketing"]');
      saveAndApply({
        essential: true,
        analytics: analyticsInput ? analyticsInput.checked : false,
        marketing: marketingInput ? marketingInput.checked : false,
        consented: true,
      });
      hideSettingsPanel();
    });

    document.querySelectorAll('[data-cookie-settings]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const banner = getBanner();
        if (banner) {
          setBannerVisibility(true);
          showSettingsPanel();
          banner.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      });
    });
  }

  function init() {
    const consent = readConsent();
    setSettingsState(consent);
    bindBannerEvents();

    if (!consent.consented) {
      setBannerVisibility(true);
      hideSettingsPanel();
      return;
    }

    setBannerVisibility(false);
    applyConsent(consent);
  }

  init();
})();
