(() => {
  const VALID = ['zh', 'en', 'ja'];
  const KEY = 'ruin-archive-language';
  const GLYPHS = '·—░▒▓0123456789';
  let activeToken = 0;

  function read() {
    try {
      const saved = localStorage.getItem(KEY);
      if (VALID.includes(saved)) return saved;
    } catch (_) {}
    const raw = (document.documentElement.lang || '').toLowerCase();
    if (raw.startsWith('en')) return 'en';
    if (raw.startsWith('ja')) return 'ja';
    return 'zh';
  }

  function save(lang) {
    try { localStorage.setItem(KEY, lang); } catch (_) {}
  }

  function htmlLang(lang) {
    return lang === 'zh' ? 'zh-Hans' : lang;
  }

  function scramble(text, ratio) {
    if (!text) return text;
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (/\s/.test(ch) || /[，。！？、：；（）《》“”"'·/↗\-—–]/.test(ch)) {
        out += ch;
        continue;
      }
      out += Math.random() < ratio
        ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        : ch;
    }
    return out;
  }

  function decodeElement(el, finalText, token) {
    if (!el || el.textContent === finalText) return;
    const start = performance.now();
    const duration = 230;
    el.classList.add('ruin-decoding');

    function frame(now) {
      if (token !== activeToken) return;
      const t = Math.min(1, (now - start) / duration);
      const corruption = Math.max(0, 0.76 * (1 - t));
      el.textContent = t >= 0.9 ? finalText : scramble(finalText, corruption);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = finalText;
        el.classList.remove('ruin-decoding');
      }
    }
    requestAnimationFrame(frame);
  }

  function applyMap(map, lang, root = document, animated = true) {
    const token = ++activeToken;
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const entry = map[key];
      if (!entry) return;
      const finalText = typeof entry === 'string' ? entry : (entry[lang] ?? entry.zh ?? '');
      if (animated && el.getBoundingClientRect().bottom >= 0 && el.getBoundingClientRect().top <= innerHeight) {
        decodeElement(el, finalText, token);
      } else {
        el.textContent = finalText;
      }
    });
  }

  function set(lang, options = {}) {
    if (!VALID.includes(lang)) lang = 'zh';
    save(lang);
    document.documentElement.lang = htmlLang(lang);
    document.documentElement.dataset.lang = lang;
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      const active = btn.dataset.langSwitch === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-current', active ? 'true' : 'false');
    });
    window.dispatchEvent(new CustomEvent('ruinlanguagechange', { detail: { lang, animated: options.animated !== false } }));
    return lang;
  }

  function bind() {
    document.addEventListener('click', event => {
      const btn = event.target.closest('[data-lang-switch]');
      if (!btn) return;
      event.preventDefault();
      set(btn.dataset.langSwitch, { animated: true });
    });
    set(read(), { animated: false });
  }

  window.RuinLanguage = { read, set, bind, applyMap, htmlLang };
})();