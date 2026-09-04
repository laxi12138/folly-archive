(() => {
  const KEY = 'ruin-reader-tone';
  const WARM_POINT = 45;

  const PALETTES = {
    paper: {
      bg: [255,255,251],
      paper: [255,255,251],
      text: [28,28,26],
      muted: [103,103,97],
      faint: [169,169,160],
      line: [205,205,197],
      lineStrong: [102,102,96],
      marker: [17,17,17],
      shadow: [0,0,0,.12],
      mapInvert: 0,
      mapBrightness: 1,
      mapContrast: 1,
      mapSepia: .02,
      satelliteBrightness: 1
    },
    warm: {
      bg: [235,227,209],
      paper: [243,235,218],
      text: [50,47,42],
      muted: [103,96,84],
      faint: [159,150,132],
      line: [193,183,161],
      lineStrong: [112,105,91],
      marker: [57,52,44],
      shadow: [58,48,35,.12],
      mapInvert: 0,
      mapBrightness: .93,
      mapContrast: 1.02,
      mapSepia: .18,
      satelliteBrightness: .82
    },
    night: {
      bg: [25,26,24],
      paper: [31,32,30],
      text: [204,201,191],
      muted: [143,141,133],
      faint: [86,87,81],
      line: [66,67,62],
      lineStrong: [121,120,112],
      marker: [202,199,188],
      shadow: [0,0,0,.28],
      mapInvert: .88,
      mapBrightness: .84,
      mapContrast: .94,
      mapSepia: .04,
      satelliteBrightness: .46
    }
  };

  const clamp = value => Math.max(0, Math.min(100, Number(value) || 0));
  const mix = (a,b,t) => a + (b-a)*t;
  const mixArray = (a,b,t) => a.map((v,i) => mix(v,b[i],t));

  function interpolate(value, key) {
    const v = clamp(value);
    if (v <= WARM_POINT) {
      const t = v / WARM_POINT;
      const a = PALETTES.paper[key];
      const b = PALETTES.warm[key];
      return Array.isArray(a) ? mixArray(a,b,t) : mix(a,b,t);
    }
    const t = (v-WARM_POINT)/(100-WARM_POINT);
    const a = PALETTES.warm[key];
    const b = PALETTES.night[key];
    return Array.isArray(a) ? mixArray(a,b,t) : mix(a,b,t);
  }

  const rgb = a => `rgb(${a.slice(0,3).map(v=>Math.round(v)).join(', ')})`;
  const rgba = (a, alpha) =>
    `rgba(${a.slice(0,3).map(v=>Math.round(v)).join(', ')}, ${alpha.toFixed(4)})`;

  function read() {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored !== null && stored !== '') return clamp(stored);
    } catch (_) {}
    return 0;
  }

  function save(value) {
    try { localStorage.setItem(KEY, String(Math.round(clamp(value)))); } catch (_) {}
  }

  function apply(value, persist=false) {
    const v = clamp(value);
    const root = document.documentElement;

    const bg = interpolate(v,'bg');
    const paper = interpolate(v,'paper');
    const text = interpolate(v,'text');
    const muted = interpolate(v,'muted');
    const faint = interpolate(v,'faint');
    const line = interpolate(v,'line');
    const lineStrong = interpolate(v,'lineStrong');
    const marker = interpolate(v,'marker');
    const shadow = interpolate(v,'shadow');

    root.style.setProperty('--as-bg', rgb(bg));
    root.style.setProperty('--as-paper', rgb(paper));
    root.style.setProperty('--as-paper-98', rgba(paper,.98));
    root.style.setProperty('--as-paper-94', rgba(paper,.94));
    root.style.setProperty('--as-paper-86', rgba(paper,.86));
    root.style.setProperty('--as-paper-72', rgba(paper,.72));
    root.style.setProperty('--as-paper-55', rgba(paper,.55));
    root.style.setProperty('--as-paper-35', rgba(paper,.35));
    root.style.setProperty('--as-text', rgb(text));
    root.style.setProperty('--as-text-82', rgba(text,.82));
    root.style.setProperty('--as-muted', rgb(muted));
    root.style.setProperty('--as-faint', rgb(faint));
    root.style.setProperty('--as-line', rgb(line));
    root.style.setProperty('--as-line-strong', rgb(lineStrong));
    root.style.setProperty('--as-marker', rgb(marker));
    root.style.setProperty('--as-marker-soft', rgba(marker,.28));
    root.style.setProperty('--as-shadow', rgba(shadow, shadow[3] ?? .12));

    root.style.setProperty('--as-map-invert', interpolate(v,'mapInvert').toFixed(4));
    root.style.setProperty('--as-map-brightness', interpolate(v,'mapBrightness').toFixed(4));
    root.style.setProperty('--as-map-contrast', interpolate(v,'mapContrast').toFixed(4));
    root.style.setProperty('--as-map-sepia', interpolate(v,'mapSepia').toFixed(4));
    root.style.setProperty('--as-satellite-brightness', interpolate(v,'satelliteBrightness').toFixed(4));

    root.dataset.readerToneValue = String(Math.round(v));
    root.style.colorScheme = v >= 72 ? 'dark' : 'light';

    const slider = document.getElementById('archive-reader-tone');
    if (slider && Number(slider.value) !== v) slider.value = String(v);

    if (persist) save(v);
  }

  const CSS = `
  :root {
    --as-bg:#fffffb;
    --as-paper:#fffffb;
    --as-paper-98:rgba(255,255,251,.98);
    --as-paper-94:rgba(255,255,251,.94);
    --as-paper-86:rgba(255,255,251,.86);
    --as-paper-72:rgba(255,255,251,.72);
    --as-paper-55:rgba(255,255,251,.55);
    --as-paper-35:rgba(255,255,251,.35);
    --as-text:#1c1c1a;
    --as-text-82:rgba(28,28,26,.82);
    --as-muted:#676761;
    --as-faint:#a9a9a0;
    --as-line:#cdcdc5;
    --as-line-strong:#666660;
    --as-marker:#111;
    --as-marker-soft:rgba(17,17,17,.28);
    --as-shadow:rgba(0,0,0,.12);
    --as-map-invert:0;
    --as-map-brightness:1;
    --as-map-contrast:1;
    --as-map-sepia:.02;
    --as-satellite-brightness:1;
  }

  html, body, #archive-map, .leaflet-container {
    background: var(--as-bg) !important;
    color: var(--as-text) !important;
  }

  /* ---- tone control ---- */
  .archive-reader-tone-control {
    position: fixed;
    left: calc(var(--panel-w, 320px) + 22px);
    top: 12px;
    z-index: 90;
    display:flex;
    align-items:center;
    gap:7px;
    height:30px;
    color:var(--as-muted);
    user-select:none;
    pointer-events:auto;
  }
  .archive-reader-tone-icon {
    width:12px;
    text-align:center;
    font:300 10px/1 "IBM Plex Mono",monospace;
    opacity:.62;
    pointer-events:none;
  }
  .archive-reader-tone-track {
    position:relative;
    width:116px;
    height:30px;
    display:grid;
    align-items:center;
  }
  .archive-reader-tone-slider {
    appearance:none;
    -webkit-appearance:none;
    width:116px;
    height:30px;
    margin:0;
    padding:0;
    border:0;
    outline:0;
    background:transparent;
    cursor:ew-resize;
    touch-action:pan-y;
  }
  .archive-reader-tone-slider::-webkit-slider-runnable-track {
    height:1px;
    background:linear-gradient(90deg,#bdbdb6 0%,#aa9b7e 45%,#77756d 67%,#343630 100%);
  }
  .archive-reader-tone-slider::-moz-range-track {
    height:1px;border:0;
    background:linear-gradient(90deg,#bdbdb6 0%,#aa9b7e 45%,#77756d 67%,#343630 100%);
  }
  .archive-reader-tone-slider::-webkit-slider-thumb {
    -webkit-appearance:none;
    width:11px;height:11px;margin-top:-5px;
    border-radius:50%;
    border:1px solid var(--as-line-strong);
    background:var(--as-paper);
    box-shadow:0 0 0 1px var(--as-shadow);
  }
  .archive-reader-tone-slider::-moz-range-thumb {
    width:11px;height:11px;border-radius:50%;
    border:1px solid var(--as-line-strong);
    background:var(--as-paper);
    box-shadow:0 0 0 1px var(--as-shadow);
  }
  .archive-reader-tone-warm-mark {
    position:absolute;
    left:45%;
    top:13px;
    width:1px;height:4px;
    background:var(--as-line-strong);
    opacity:.42;
    pointer-events:none;
  }

  /* ---- authored atlas layers only ---- */
  #archive-map img.leaflet-image-layer[src*="ruin-map-clean"],
  #archive-map img.leaflet-image-layer[src*="terrain-map"],
  #archive-map img.leaflet-image-layer[src*="border-map"] {
    filter:
      invert(var(--as-map-invert))
      brightness(var(--as-map-brightness))
      contrast(var(--as-map-contrast))
      sepia(var(--as-map-sepia)) !important;
  }

  /* Satellite remains photographic; dim it rather than invert it. */
  #archive-map img.leaflet-image-layer[src*="satellite"] {
    filter:
      brightness(var(--as-satellite-brightness))
      contrast(.92)
      saturate(.72) !important;
  }

  /* ---- filing panels / forms ---- */
  .search-panel,
  .archive-form-shell,
  .system-dialog-panel,
  .real-map-shell,
  .real-map-topbar,
  .real-map-footer,
  .real-map-search-row,
  .real-map-search-results {
    background:var(--as-paper) !important;
    color:var(--as-text) !important;
  }

  .panel-outline path,
  .form-handle-outline path {
    stroke:var(--as-line-strong) !important;
  }

  .search-panel .back-link,
  .search-panel h1,
  .archive-form-title,
  .section-heading,
  .field-label,
  .real-map-heading,
  .real-map-entry-title,
  .contributors-wall,
  .language-switcher,
  .coordinate-mode-button,
  .coordinate-mode-label,
  .layer-row,
  .pin-tool-label {
    color:var(--as-text) !important;
  }

  .real-map-entry,
  .coordinate-mode-panel,
  .form-section,
  .attachment-box,
  .admin-box,
  .real-map-shell,
  .real-map-search-row,
  .real-map-footer,
  .system-dialog-panel {
    border-color:var(--as-line) !important;
  }

  input,
  textarea,
  select,
  .real-map-entry,
  .attachment-box,
  .real-map-open,
  .real-map-use,
  .compact-mark-button {
    background:var(--as-paper-72) !important;
    color:var(--as-text) !important;
    border-color:var(--as-line-strong) !important;
  }

  input:focus,
  textarea:focus,
  select:focus {
    background:var(--as-paper-94) !important;
    outline-color:var(--as-line-strong) !important;
  }

  button {
    color:var(--as-text);
  }

  .checkmark {
    border-color:var(--as-line-strong) !important;
    background:transparent !important;
  }
  .layer-row input:checked + .checkmark::before,
  .layer-row input:checked + .checkmark::after {
    background:var(--as-marker) !important;
  }

  .panel-rule,
  .contributors-wall::before {
    border-color:var(--as-line) !important;
  }

  /* ---- archive-system site popup ---- */
  .archive-site-popup .leaflet-popup-content-wrapper {
    background:transparent !important;
    border:0 !important;
    box-shadow:none !important;
  }
  .site-info-popup-content {
    background:var(--as-paper-94) !important;
    border-left-color:var(--as-line-strong) !important;
    color:var(--as-text-82) !important;
  }

  /* ---- markers / crosshair / ripple ---- */
  .garden-dot,
  .record-dot,
  .candidate-marker-dot,
  .draft-marker-dot {
    background:var(--as-marker) !important;
  }

  .crosshair-h { border-top-color:var(--as-line-strong) !important; }
  .crosshair-v { border-left-color:var(--as-line-strong) !important; }
  .crosshair-core {
    border-color:var(--as-marker) !important;
    background:var(--as-paper) !important;
  }
  .crosshair-core::before,
  .crosshair-core::after {
    background:var(--as-marker) !important;
  }

  .marker-ripple-node::before,
  .marker-ripple-node::after {
    border-color:var(--as-marker-soft) !important;
  }

  /* ---- draggable archive pin ---- */
  .drag-location-pin .pin-sphere,
  .pin-drag-ghost .pin-sphere {
    fill:var(--as-paper) !important;
    stroke:var(--as-marker) !important;
  }
  .drag-location-pin .pin-stem,
  .pin-drag-ghost .pin-stem {
    stroke:var(--as-marker) !important;
  }
  .drag-location-pin .pin-point,
  .pin-drag-ghost .pin-point {
    fill:var(--as-marker) !important;
    stroke:var(--as-marker) !important;
  }

  /* ---- real-world locator ----
     OSM tiles stay photographic/cartographic; night mode simply dims them. */
  #real-map .leaflet-tile {
    filter:
      brightness(var(--as-satellite-brightness))
      saturate(.72)
      contrast(.92) !important;
  }
  .real-map-reticle span,
  .real-map-reticle i {
    border-color:var(--as-marker) !important;
    background:var(--as-marker) !important;
  }
  .real-locator-marker-sphere {
    background:var(--as-paper-94) !important;
    border-color:var(--as-marker) !important;
  }
  .real-locator-marker-stem,
  .real-locator-marker-point {
    background:var(--as-marker) !important;
    border-color:var(--as-marker) !important;
  }

  /* ---- dialog veil ---- */
  .system-dialog-backdrop {
    background:rgba(0,0,0,.16) !important;
  }


  /* ---- archive / directory trees ----
     Some older tree graphics explicitly use #000 for ╲ ╱ and branch glyphs.
     Force all connector glyphs to follow the current tone. */
  .archive-tree,
  .archive-tree .fault-node,
  .archive-tree .tree-file,
  .archive-tree .tree-folder,
  .archive-tree .tree-toggle,
  .archive-tree .tree-folder-toggle,
  .archive-tree .tree-line,
  .archive-tree .fault-line,
  .archive-tree .fault-line-a,
  .archive-tree .fault-line-b,
  .archive-tree .fault-line-c,
  .archive-tree .fault-line-d,
  .archive-tree .line-1,
  .archive-tree .line-2,
  .archive-tree .line-3,
  .archive-tree .line-4,
  .archive-tree .line-5,
  .directory-tree,
  .directory-tree *,
  .attachment-tree,
  .attachment-tree * {
    color:var(--as-text) !important;
  }

  .archive-tree .fault-line,
  .archive-tree .fault-line-a,
  .archive-tree .fault-line-b,
  .archive-tree .fault-line-c,
  .archive-tree .fault-line-d,
  .archive-tree .line-1,
  .archive-tree .line-2,
  .archive-tree .line-3,
  .archive-tree .line-4,
  .archive-tree .line-5,
  .archive-tree .tree-line {
    opacity:.72;
  }

  @media (max-width:760px) {
    .archive-reader-tone-control {
      left:auto;
      right:14px;
      top:9px;
    }
    .archive-reader-tone-track,
    .archive-reader-tone-slider {
      width:86px;
    }
    .search-panel,
    .archive-form-shell {
      border-top-color:var(--as-line-strong) !important;
    }
  }
  `;

  function ensureStyle() {
    if (document.getElementById('archive-reader-tone-style')) return;
    const style = document.createElement('style');
    style.id = 'archive-reader-tone-style';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function ensureControl() {
    let control = document.getElementById('archive-reader-tone-control');
    if (control) return control;

    control = document.createElement('div');
    control.id = 'archive-reader-tone-control';
    control.className = 'archive-reader-tone-control';
    control.innerHTML = `
      <span class="archive-reader-tone-icon" aria-hidden="true">☼</span>
      <div class="archive-reader-tone-track">
        <input id="archive-reader-tone"
               class="archive-reader-tone-slider"
               type="range"
               min="0"
               max="100"
               step="1"
               value="0"
               aria-label="阅读环境">
        <span class="archive-reader-tone-warm-mark" aria-hidden="true"></span>
      </div>
      <span class="archive-reader-tone-icon" aria-hidden="true">☾</span>
    `;
    document.body.appendChild(control);
    return control;
  }

  function boot() {
    ensureStyle();
    ensureControl();

    const slider = document.getElementById('archive-reader-tone');
    let raf = 0;
    let pending = null;

    slider.value = String(read());

    slider.addEventListener('input', () => {
      pending = slider.value;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply(pending, false);
      });
    });

    slider.addEventListener('change', () => apply(slider.value, true));
    slider.addEventListener('pointerup', () => apply(slider.value, true));
    slider.addEventListener('keydown', event => {
      if (['ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(event.key)) {
        requestAnimationFrame(() => apply(slider.value, true));
      }
    });

    window.addEventListener('storage', event => {
      if (event.key === KEY && event.newValue != null) {
        apply(event.newValue, false);
      }
    });

    apply(read(), false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }
})();
