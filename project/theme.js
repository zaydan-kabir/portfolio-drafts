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
    document.querySelectorAll('#intro-wordmark, #masthead-reference').forEach(function (img) {
      img.style.filter = theme === 'light'
        ? 'invert(1) drop-shadow(0 0 22px rgba(0,0,0,0.08))'
        : 'drop-shadow(0 0 22px rgba(255,255,255,0.14))';
    });
    document.querySelectorAll('#intro-title, #intro-name, #masthead-text, #z-masthead-text').forEach(function (el) {
      el.style.color = theme === 'light' ? '#0a0a0a' : '#f0f0f0';
    });
    document.querySelectorAll('#masthead-guide, #masthead-replay').forEach(function (el) {
      el.style.color = theme === 'light' ? 'rgba(10,10,10,.42)' : 'rgba(255,255,255,.24)';
    });
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
