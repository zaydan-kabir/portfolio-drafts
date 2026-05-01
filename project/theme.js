(function () {
  var storageKey = 'zaydan-theme';
  var root = document.documentElement;
  var themes = ['dark', 'light'];

  function normalizeTheme(theme) {
    return themes.indexOf(theme) === -1 ? 'dark' : theme;
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (err) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (err) {}
  }

  root.dataset.theme = normalizeTheme(getStoredTheme());

  function applyTheme(theme) {
    theme = normalizeTheme(theme);
    root.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#f0f0f0' : '#0a0a0a');
    }
    var wordmarkFilter = theme === 'light'
      ? 'invert(1) drop-shadow(0 0 22px rgba(0,0,0,0.08))'
      : 'none';
    var textColor = theme === 'light' ? '#0a0a0a' : '#f0f0f0';
    var guideColor = theme === 'light' ? 'rgba(10,10,10,.42)' : 'rgba(255,255,255,.24)';
    document.querySelectorAll('#intro-wordmark, #masthead-reference').forEach(function (img) {
      img.style.filter = wordmarkFilter;
    });
    document.querySelectorAll('#intro-title, #intro-name, #masthead-text, #z-masthead-text').forEach(function (el) {
      el.style.color = textColor;
    });
    document.querySelectorAll('#masthead-guide, #masthead-replay').forEach(function (el) {
      el.style.color = guideColor;
    });
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.querySelectorAll('button[data-theme-option]').forEach(function (button) {
        var active = button.dataset.themeOption === theme;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
  }

  function initThemeToggle() {
    var theme = normalizeTheme(getStoredTheme());
    applyTheme(theme);

    if (document.getElementById('theme-toggle')) return;

    var toggle = document.createElement('div');
    toggle.id = 'theme-toggle';
    toggle.setAttribute('role', 'group');
    toggle.setAttribute('aria-label', 'Theme');
    themes.forEach(function (themeName) {
      var button = document.createElement('button');
      button.type = 'button';
      button.dataset.themeOption = themeName;
      button.textContent = themeName;
      button.addEventListener('click', function () {
        theme = themeName;
        setStoredTheme(theme);
        applyTheme(theme);
      });
      toggle.appendChild(button);
    });
    toggle.addEventListener('mouseenter', function () {
      document.body.classList.add('theme-picker-hover');
    });
    toggle.addEventListener('mouseleave', function () {
      document.body.classList.remove('theme-picker-hover');
    });
    document.body.appendChild(toggle);
    applyTheme(theme);
  }

  if (document.body) initThemeToggle();
  else document.addEventListener('DOMContentLoaded', initThemeToggle);
})();
