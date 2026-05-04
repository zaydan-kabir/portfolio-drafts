(function () {
  var storageKey = 'zaydan-theme';
  var root = document.documentElement;

  function getThemeOrder() {
    return ['light', 'dark'];
  }

  function getDefaultTheme() {
    return 'light';
  }

  function normalizeTheme(theme) {
    return theme === 'light' || theme === 'dark' ? theme : getDefaultTheme();
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
    getThemeOrder().forEach(function (themeName) {
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
    document.body.appendChild(toggle);
    applyTheme(theme);
  }

  function initPanel2Manuscript() {
    var panel = document.getElementById('panel-2');
    var inner = document.getElementById('panel-2-inner');
    var fig = document.getElementById('panel-2-fig');
    var quote = document.querySelector('.p2-quote-text');
    var attr = document.querySelector('.p2-quote-attr');
    if (!panel || !inner || !fig || !quote) return;

    var style = document.createElement('style');
    style.textContent = [
      '#panel-2-inner{display:block!important;padding:0!important;overflow:hidden!important;}',
      '#panel-2-manuscript{position:absolute;inset:clamp(96px,12vh,140px) clamp(28px,7vw,120px) clamp(64px,8vh,100px);z-index:1;display:block;}',
      '#panel-2 .p2-quote-wrap{display:none!important;}',
      '#panel-2-fig{left:50%!important;top:50%!important;right:auto!important;bottom:auto!important;width:clamp(118px,15vw,230px)!important;z-index:4!important;transform:translate(-50%,-50%)!important;filter:drop-shadow(0 14px 28px rgba(0,0,0,.32));will-change:left,top;}',
      '@media(max-width:600px){#panel-2-manuscript{inset:96px 22px 54px;}#panel-2-fig{width:clamp(92px,32vw,132px)!important;}}'
    ].join('\n');
    document.head.appendChild(style);

    var canvas = document.getElementById('panel-2-manuscript');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'panel-2-manuscript';
      canvas.setAttribute('aria-hidden', 'true');
      inner.insertBefore(canvas, inner.firstChild);
    }
    var ctx = canvas.getContext('2d');
    var text = quote.textContent.trim();
    var attribution = attr ? attr.textContent.trim() : '';
    var isMobile = window.innerWidth < 600;
    var figX = panel.clientWidth * 0.5;
    var figY = panel.clientHeight * 0.5;
    var targetX = figX;
    var targetY = figY;
    var prepareWithSegments = null;

    import('./node_modules/@chenglou/pretext/dist/layout.js')
      .then(function (mod) { prepareWithSegments = mod.prepareWithSegments; })
      .catch(function () { prepareWithSegments = null; });

    function measure(value, font) {
      if (prepareWithSegments) {
        try {
          var prepared = prepareWithSegments(value, font);
          if (prepared && prepared.widths && prepared.widths.length) {
            return prepared.widths.reduce(function (sum, width) { return sum + width; }, 0);
          }
        } catch (err) {}
      }
      return ctx.measureText(value).width;
    }

    function setTarget(clientX, clientY) {
      var rect = panel.getBoundingClientRect();
      var figRect = fig.getBoundingClientRect();
      var margin = Math.max(figRect.width, figRect.height) * 0.5;
      targetX = Math.max(margin, Math.min(rect.width - margin, clientX - rect.left));
      targetY = Math.max(margin + 70, Math.min(rect.height - margin, clientY - rect.top));
    }

    document.addEventListener('mousemove', function (event) {
      var rect = panel.getBoundingClientRect();
      if (event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom) {
        setTarget(event.clientX, event.clientY);
      }
    });

    document.addEventListener('touchmove', function (event) {
      if (!event.touches.length) return;
      var touch = event.touches[0];
      var rect = panel.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        setTarget(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    function resizeCanvas() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      var width = Math.max(1, Math.round(rect.width * dpr));
      var height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    }

    function rangesForLine(lineY, lineHeight, obstacle) {
      var overlaps = lineY + lineHeight > obstacle.top && lineY < obstacle.bottom;
      if (!overlaps) return [{ start: 0, end: obstacle.width }];
      var ranges = [];
      if (obstacle.left > 120) ranges.push({ start: 0, end: obstacle.left });
      if (obstacle.width - obstacle.right > 120) ranges.push({ start: obstacle.right, end: obstacle.width });
      return ranges.length ? ranges : [{ start: 0, end: obstacle.width }];
    }

    function draw() {
      var rect = resizeCanvas();
      figX += (targetX - figX) * 0.14;
      figY += (targetY - figY) * 0.14;
      fig.style.left = figX.toFixed(1) + 'px';
      fig.style.top = figY.toFixed(1) + 'px';

      var figRect = fig.getBoundingClientRect();
      var figCenterX = figRect.left - rect.left + figRect.width / 2;
      var figCenterY = figRect.top - rect.top + figRect.height / 2;
      var radius = Math.max(figRect.width, figRect.height) * 0.58;
      var obstacle = {
        left: figCenterX - radius,
        right: figCenterX + radius,
        top: figCenterY - radius,
        bottom: figCenterY + radius,
        width: rect.width
      };

      var theme = root.dataset.theme;
      var textColor = theme === 'light' ? 'rgba(10,10,10,.72)' : 'rgba(240,240,240,.68)';
      var attrColor = theme === 'light' ? 'rgba(10,10,10,.38)' : 'rgba(240,240,240,.34)';
      var fontSize = Math.max(13, Math.min(18, rect.width * (isMobile ? 0.043 : 0.018)));
      var lineHeight = fontSize * 1.68;
      var font = 'italic 400 ' + fontSize + 'px Lora, Georgia, serif';
      var words = text.split(/\s+/);
      var wordIndex = 0;
      var lineY = 0;

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.font = font;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'top';

      while (wordIndex < words.length && lineY < rect.height - lineHeight * 2) {
        rangesForLine(lineY, lineHeight, obstacle).forEach(function (range) {
          var x = range.start;
          while (wordIndex < words.length) {
            var word = words[wordIndex] + (wordIndex === words.length - 1 ? '' : ' ');
            var wordWidth = measure(word, font);
            if (x > range.start && x + wordWidth > range.end) break;
            ctx.fillText(word, x, lineY);
            x += wordWidth;
            wordIndex++;
          }
        });
        lineY += lineHeight;
      }

      if (attribution) {
        ctx.font = '400 ' + Math.max(11, fontSize * 0.78) + 'px VT323, monospace';
        ctx.fillStyle = attrColor;
        ctx.fillText(attribution, 0, Math.min(rect.height - lineHeight, lineY + lineHeight * 0.5));
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', function () {
      figX = panel.clientWidth * 0.5;
      figY = panel.clientHeight * 0.5;
      targetX = figX;
      targetY = figY;
      isMobile = window.innerWidth < 600;
    });

    requestAnimationFrame(draw);
  }

  function initAll() {
    initThemeToggle();
    initPanel2Manuscript();
  }

  if (document.body) initAll();
  else document.addEventListener('DOMContentLoaded', initAll);
})();
