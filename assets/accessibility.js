(function () {
  const STORAGE_KEY = 'blendedBeautyAccessibility';
  const defaultSettings = {
    fontScale: 1,
    highContrast: false,
    linksHighlighted: false,
    reduceMotion: false,
  };

  function readSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaultSettings, ...saved };
    } catch (error) {
      return { ...defaultSettings };
    }
  }

  function writeSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function init() {
    const toggleButton = document.getElementById('a11y-toggle');
    const panel = document.getElementById('a11y-panel');
    const optionButtons = panel ? panel.querySelectorAll('.a11y-option') : [];
    const closeButton = panel ? panel.querySelector('[data-action="reset"]') : null;
    const settings = readSettings();

    function applySettings() {
      document.body.style.setProperty('--site-font-scale', String(settings.fontScale));
      document.body.classList.toggle('a11y-large-text', settings.fontScale > 1);
      document.body.classList.toggle('a11y-high-contrast', settings.highContrast);
      document.body.classList.toggle('a11y-link-highlight', settings.linksHighlighted);
      document.body.classList.toggle('a11y-reduced-motion', settings.reduceMotion);

      optionButtons.forEach((button) => {
        const action = button.dataset.action;
        const isPressed = action === 'text'
          ? settings.fontScale > 1
          : action === 'contrast'
            ? settings.highContrast
            : action === 'links'
              ? settings.linksHighlighted
              : settings.reduceMotion;

        button.setAttribute('aria-pressed', String(isPressed));
      });
    }

    function closePanel() {
      if (!panel) return;
      panel.hidden = true;
      toggleButton.setAttribute('aria-expanded', 'false');
    }

    function openPanel() {
      if (!panel) return;
      panel.hidden = false;
      toggleButton.setAttribute('aria-expanded', 'true');
    }

    function resetSettings() {
      Object.assign(settings, defaultSettings);
      writeSettings(settings);
      applySettings();
      closePanel();
    }

    function toggleAction(action) {
      if (!action) return;

      if (action === 'text') {
        settings.fontScale = settings.fontScale > 1 ? 1 : 1.15;
      }

      if (action === 'contrast') {
        settings.highContrast = !settings.highContrast;
      }

      if (action === 'links') {
        settings.linksHighlighted = !settings.linksHighlighted;
      }

      if (action === 'motion') {
        settings.reduceMotion = !settings.reduceMotion;
      }

      writeSettings(settings);
      applySettings();
    }

    if (toggleButton && panel) {
      toggleButton.addEventListener('click', () => {
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          closePanel();
        } else {
          openPanel();
        }
      });

      panel.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-action]');
        if (!actionButton) return;

        const action = actionButton.dataset.action;
        if (action === 'reset') {
          resetSettings();
          return;
        }

        toggleAction(action);
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) {
          closePanel();
        }
      });
    }

    applySettings();
  }

  init();
})();
