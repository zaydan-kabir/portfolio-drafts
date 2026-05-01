(function () {
  var storageKey = 'zaydan-theme';
  var root = document.documentElement;

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

  root.dataset.theme = getStoredTheme() || 'dark';

  function applyTheme(theme) {
    root.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f0f0f0' : '#0a0a0a');
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.textContent = theme === 'light' ? 'dark' : 'light';
      toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'light' ? 'dark' : 'light') + ' mode');
      toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
  }

  function initThemeToggle() {
    var theme = getStoredTheme() || 'dark';
    applyTheme(theme);

    if (document.getElementById('theme-toggle')) return;

    var toggle = document.createElement('button');
    toggle.id = 'theme-toggle';
    toggle.type = 'button';
    document.body.appendChild(toggle);
    applyTheme(theme);

    toggle.addEventListener('click', function () {
      theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      setStoredTheme(theme);
      applyTheme(theme);
    });
  }

  if (document.body) initThemeToggle();
  else document.addEventListener('DOMContentLoaded', initThemeToggle);
})();
