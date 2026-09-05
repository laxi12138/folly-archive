
// UI init
document.addEventListener('DOMContentLoaded', () => {
    const drawer = document.getElementById('archive-drawer');
    const mask = document.getElementById('drawer-mask');

    if (drawer) drawer.classList.remove('open');
    if (mask) mask.classList.remove('show');

    let globalTopZIndex = 10000;


    function bringDrawerToFront(element) {
        if (!element) return;
        globalTopZIndex += 1;
        element.style.zIndex = globalTopZIndex;
    }

        function toggleIndexDrawerWithAnim() {
            const indexDrawer = document.getElementById('index-drawer');
            const decor = document.getElementById('drawer-opened-bottom-decor');
            const stacks = document.querySelectorAll('.file-stack');
            if (!indexDrawer) return;

            const isOpen = indexDrawer.classList.contains('open');

            if (!isOpen) {


                stacks.forEach(s => s.classList.add('sink-down'));


                indexDrawer.classList.add('open');
                if (decor) decor.classList.add('show');
                if (typeof bringDrawerToFront === 'function') bringDrawerToFront(indexDrawer);


                setTimeout(() => {
                    stacks.forEach(s => {
                        s.classList.add('elevated-z');
                        s.classList.remove('sink-down');
                    });
                }, 400);
            } else {

                closeIndexDrawerWithAnim();
            }

        }

    function closeIndexDrawerWithAnim(skipRestore = false) {
        const indexDrawer = document.getElementById('index-drawer');
        const decor = document.getElementById('drawer-opened-bottom-decor');
        const stacks = document.querySelectorAll('.file-stack');


        stacks.forEach(s => s.classList.add('sink-down'));


        if (indexDrawer) indexDrawer.classList.remove('open');
        if (decor) decor.classList.remove('show');


        if (!skipRestore) {
            setTimeout(() => {
                stacks.forEach(s => {
                    s.classList.remove('elevated-z');
                    s.classList.remove('sink-down');
                });
            }, 400);
        }
    }
    window.bringDrawerToFront = bringDrawerToFront;
    window.toggleIndexDrawerWithAnim = toggleIndexDrawerWithAnim;
    window.closeIndexDrawerWithAnim = closeIndexDrawerWithAnim;

    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });


    document.addEventListener('selectstart', function (e) {
        e.preventDefault();
    });


    document.addEventListener('keydown', function (e) {
        if (
            (e.ctrlKey || e.metaKey) &&
            (e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')
        ) {
            e.preventDefault();
        }
    });

    const indexDrawer = document.getElementById('index-drawer');


    const triggers = document.querySelectorAll('[id^="bottom-trigger-"], .bottom-trigger');
    const drawerLeft = document.getElementById('mobile-left-drawer');
    const drawerRight = document.getElementById('mobile-right-drawer');


    [indexDrawer, drawerLeft, drawerRight].forEach(drawer => {
        if (drawer) {
            drawer.addEventListener('pointerdown', () => {
                bringDrawerToFront(drawer);
            });
        }
    });
    if (indexDrawer && triggers.length > 0) {
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();

                if (isCompactViewport()) {
                    const trigId = trigger.id;


                    if (trigId === 'bottom-trigger-record' && drawerLeft) {
                        drawerLeft.classList.toggle('open');
                        if (drawerLeft.classList.contains('open')) {
                            bringDrawerToFront(drawerLeft);
                        }
                        if (drawerRight) drawerRight.classList.remove('open');
                        return;
                    }


                    if (trigId === 'bottom-trigger-ruin' && drawerRight) {
                        drawerRight.classList.toggle('open');
                        if (drawerRight.classList.contains('open')) {
                            bringDrawerToFront(drawerRight);
                        }
                        if (drawerLeft) drawerLeft.classList.remove('open');
                        return;
                    }
                }


                toggleIndexDrawerWithAnim();
            });
        });
    }

    document.addEventListener('click', (e) => {

        if (indexDrawer && indexDrawer.classList.contains('open')) {
            const isClickInsideDrawer =
                indexDrawer.contains(e.target);

            const isClickOnTrigger =
                Array.from(triggers).some(trigger =>
                    trigger.contains(e.target)
                );


            const isClickOnLanguage =
                document
                    .getElementById('language-switcher')
                    ?.contains(e.target);


            if (
                !isClickInsideDrawer &&
                !isClickOnTrigger &&
                !isClickOnLanguage
            ) {
                closeIndexDrawerWithAnim();
            }
        }
    });
});
// Viewport
function updateVH() {

  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  );

}

updateVH();

window.addEventListener(
  'resize',
  updateVH
);

function isCompactViewport() {
    return window.innerWidth <= 768 || (window.innerWidth <= 950 && window.innerHeight <= 520);
}
window.isCompactViewport = isCompactViewport;

// ============================================================================
// v77 · Shared reading environment
// ----------------------------------------------------------------------------
// Main atlas now shares the same localStorage key used by Manifesto/Mechanics:
//     ruin-reader-tone
//
// 0   = original paper-white archive
// 45  = warm eye-care paper
// 100 = low-contrast charcoal night archive
//
// Only the UI + authored atlas membrane change tone. Real photos, video,
// PDFs and attachment media are not inverted.
// ============================================================================
const READER_TONE_KEY = 'ruin-reader-tone';
const READER_WARM_POINT = 45;

const READER_PALETTES = Object.freeze({
    paper: {
        bg: [255, 255, 251],
        paper: [255, 255, 251],
        text: [28, 28, 26],
        muted: [103, 103, 97],
        faint: [169, 169, 160],
        line: [205, 205, 197],
        lineStrong: [102, 102, 96],
        marker: [17, 17, 17],
        shadow: [0, 0, 0, 0.12],
        thumbBrightness: 1,
        thumbContrast: 1,
        mineFace: [224, 224, 219, 0.48],
        mineHover: [235, 235, 231, 0.68],
        mineActive: [211, 211, 206, 0.54],
        mineHi: [255, 255, 255, 0.98],
        mineLo: [82, 82, 78, 0.58],
        mineActiveHi: [0, 0, 0, 0.30],
        mineActiveLo: [255, 255, 255, 0.94]
    },
    warm: {
        bg: [235, 227, 209],
        paper: [243, 235, 218],
        text: [50, 47, 42],
        muted: [103, 96, 84],
        faint: [159, 150, 132],
        line: [193, 183, 161],
        lineStrong: [112, 105, 91],
        marker: [57, 52, 44],
        shadow: [58, 48, 35, 0.12],
        thumbBrightness: 0.93,
        thumbContrast: 0.98,
        mineFace: [207, 199, 181, 0.62],
        mineHover: [221, 212, 193, 0.76],
        mineActive: [190, 181, 163, 0.66],
        mineHi: [249, 242, 225, 0.92],
        mineLo: [105, 96, 82, 0.62],
        mineActiveHi: [86, 79, 68, 0.56],
        mineActiveLo: [244, 236, 217, 0.88]
    },
    night: {
        bg: [25, 26, 24],
        paper: [31, 32, 30],
        text: [204, 201, 191],
        muted: [143, 141, 133],
        faint: [86, 87, 81],
        line: [66, 67, 62],
        lineStrong: [121, 120, 112],
        marker: [202, 199, 188],
        shadow: [0, 0, 0, 0.28],
        thumbBrightness: 0.70,
        thumbContrast: 0.94,
        /* Night keeps the old minesweeper relation inverted:
           the key face is a medium gray visibly LIGHTER than the charcoal page. */
        mineFace: [72, 73, 68, 0.82],
        mineHover: [88, 89, 83, 0.90],
        mineActive: [60, 61, 57, 0.88],
        mineHi: [120, 121, 113, 0.84],
        mineLo: [38, 39, 36, 0.92],
        mineActiveHi: [38, 39, 36, 0.94],
        mineActiveLo: [112, 113, 105, 0.86]
    }
});

let readerToneValue = 0;
let readerToneUiRaf = 0;
let readerTonePending = null;
let readerToneMapRefresh = null;

function clampReaderTone(value) {
    return Math.max(0, Math.min(100, Number(value) || 0));
}

function readerToneMix(a, b, t) {
    return a + (b - a) * t;
}

function readerToneMixArray(a, b, t) {
    return a.map((value, index) => readerToneMix(value, b[index], t));
}

function readerToneInterpolate(value, key) {
    const tone = clampReaderTone(value);

    if (tone <= READER_WARM_POINT) {
        const t = tone / READER_WARM_POINT;
        const a = READER_PALETTES.paper[key];
        const b = READER_PALETTES.warm[key];
        return Array.isArray(a)
            ? readerToneMixArray(a, b, t)
            : readerToneMix(a, b, t);
    }

    const t = (tone - READER_WARM_POINT) / (100 - READER_WARM_POINT);
    const a = READER_PALETTES.warm[key];
    const b = READER_PALETTES.night[key];

    return Array.isArray(a)
        ? readerToneMixArray(a, b, t)
        : readerToneMix(a, b, t);
}

function readerRgb(values) {
    return `rgb(${values.slice(0, 3).map(v => Math.round(v)).join(', ')})`;
}

function readerRgba(values, alphaOverride = null) {
    const alpha = alphaOverride == null
        ? (values.length > 3 ? values[3] : 1)
        : alphaOverride;

    return `rgba(${values.slice(0, 3).map(v => Math.round(v)).join(', ')}, ${Math.max(0, Math.min(1, alpha)).toFixed(4)})`;
}

function readReaderTone() {
    try {
        const saved = localStorage.getItem(READER_TONE_KEY);
        if (saved !== null && saved !== '') return clampReaderTone(saved);
    } catch (_) {}
    return 0;
}

function saveReaderTone(value) {
    try {
        localStorage.setItem(READER_TONE_KEY, String(Math.round(clampReaderTone(value))));
    } catch (_) {}
}

function applyReaderTone(value, persist = false) {
    const tone = clampReaderTone(value);
    readerToneValue = tone;

    const root = document.documentElement;
    const bg = readerToneInterpolate(tone, 'bg');
    const paper = readerToneInterpolate(tone, 'paper');
    const text = readerToneInterpolate(tone, 'text');
    const muted = readerToneInterpolate(tone, 'muted');
    const faint = readerToneInterpolate(tone, 'faint');
    const line = readerToneInterpolate(tone, 'line');
    const lineStrong = readerToneInterpolate(tone, 'lineStrong');
    const marker = readerToneInterpolate(tone, 'marker');
    const shadow = readerToneInterpolate(tone, 'shadow');

    root.style.setProperty('--reader-bg', readerRgb(bg));
    root.style.setProperty('--reader-paper', readerRgb(paper));
    root.style.setProperty('--reader-paper-95', readerRgba(paper, 0.95));
    root.style.setProperty('--reader-paper-90', readerRgba(paper, 0.90));
    root.style.setProperty('--reader-paper-85', readerRgba(paper, 0.85));
    root.style.setProperty('--reader-paper-80', readerRgba(paper, 0.80));
    root.style.setProperty('--reader-paper-55', readerRgba(paper, 0.55));
    root.style.setProperty('--reader-paper-30', readerRgba(paper, 0.30));

    root.style.setProperty('--reader-text', readerRgb(text));
    root.style.setProperty('--reader-text-85', readerRgba(text, 0.85));
    root.style.setProperty('--reader-text-67', readerRgba(text, 0.67));
    root.style.setProperty('--reader-muted', readerRgb(muted));
    root.style.setProperty('--reader-muted-70', readerRgba(muted, 0.70));
    root.style.setProperty('--reader-faint', readerRgb(faint));
    root.style.setProperty('--reader-line', readerRgb(line));
    root.style.setProperty('--reader-line-strong', readerRgb(lineStrong));
    root.style.setProperty('--reader-marker', readerRgb(marker));
    root.style.setProperty('--reader-marker-soft', readerRgba(marker, 0.20));
    root.style.setProperty('--reader-shadow', readerRgba(shadow));

    root.style.setProperty(
        '--reader-thumb-brightness',
        readerToneInterpolate(tone, 'thumbBrightness').toFixed(4)
    );
    root.style.setProperty(
        '--reader-thumb-contrast',
        readerToneInterpolate(tone, 'thumbContrast').toFixed(4)
    );

    root.style.setProperty('--reader-mine-face', readerRgba(readerToneInterpolate(tone, 'mineFace')));
    root.style.setProperty('--reader-mine-hover', readerRgba(readerToneInterpolate(tone, 'mineHover')));
    root.style.setProperty('--reader-mine-active', readerRgba(readerToneInterpolate(tone, 'mineActive')));
    root.style.setProperty('--reader-mine-hi', readerRgba(readerToneInterpolate(tone, 'mineHi')));
    root.style.setProperty('--reader-mine-lo', readerRgba(readerToneInterpolate(tone, 'mineLo')));
    root.style.setProperty('--reader-mine-active-hi', readerRgba(readerToneInterpolate(tone, 'mineActiveHi')));
    root.style.setProperty('--reader-mine-active-lo', readerRgba(readerToneInterpolate(tone, 'mineActiveLo')));

    root.dataset.readerToneValue = String(Math.round(tone));
    root.style.colorScheme = tone >= 72 ? 'dark' : 'light';

    const slider = document.getElementById('main-reader-tone');
    if (slider && Number(slider.value) !== tone) {
        slider.value = String(tone);
    }
    slider?.setAttribute('aria-valuenow', String(Math.round(tone)));

    if (persist) saveReaderTone(tone);
    if (readerToneMapRefresh) readerToneMapRefresh();

    window.dispatchEvent(new CustomEvent('ruinreaderchange', {
        detail: { value: tone }
    }));
}

function queueReaderTone(value) {
    readerTonePending = clampReaderTone(value);
    if (readerToneUiRaf) return;

    readerToneUiRaf = requestAnimationFrame(() => {
        readerToneUiRaf = 0;
        const next = readerTonePending;
        readerTonePending = null;
        applyReaderTone(next, false);
    });
}

function bindMainReaderTone() {
    const slider = document.getElementById('main-reader-tone');
    if (!slider) return;

    slider.value = String(readerToneValue);

    slider.addEventListener('input', () => {
        queueReaderTone(slider.value);
    });

    slider.addEventListener('change', () => {
        applyReaderTone(slider.value, true);
    });

    slider.addEventListener('pointerdown', () => {
        slider.classList.add('is-dragging');
    });

    slider.addEventListener('pointerup', () => {
        slider.classList.remove('is-dragging');
        applyReaderTone(slider.value, true);
    });

    slider.addEventListener('pointercancel', () => {
        slider.classList.remove('is-dragging');
    });

    slider.addEventListener('keydown', event => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
            requestAnimationFrame(() => applyReaderTone(slider.value, true));
        }
    });
}

// Apply the saved cross-page preference before Leaflet builds the atlas.
applyReaderTone(readReaderTone(), false);
bindMainReaderTone();


const width = 4000;
const height = 3000;
let focusLocked = false;
let isClosingViewer = false;
let currentVideo = null;
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let activePdfLoadingTask = null;
let pdfJsLoadPromise = null;

function ensurePdfJsLoaded() {
    if (window.pdfjsLib) {
        if (window.pdfjsLib.GlobalWorkerOptions) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }
        return Promise.resolve(window.pdfjsLib);
    }
    if (pdfJsLoadPromise) return pdfJsLoadPromise;

    pdfJsLoadPromise = new Promise((resolve, reject) => {
        const tag = document.createElement('script');
        tag.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        tag.async = true;
        tag.onload = () => {
            if (!window.pdfjsLib) {
                pdfJsLoadPromise = null;
                reject(new Error('PDF.js did not initialize'));
                return;
            }
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            resolve(window.pdfjsLib);
        };
        tag.onerror = () => {
            pdfJsLoadPromise = null;
            reject(new Error('PDF.js failed to load'));
        };
        document.head.appendChild(tag);
    });
    return pdfJsLoadPromise;
}

// PDF / TXT inline translation
const DOCUMENT_TRANSLATION_ENDPOINT = 'https://ruin-archive-translation.lliquidcat.workers.dev/translate';
const documentTranslationCache = new Map();
let activeAttachmentId = null;
let activeAttachmentItem = null;
let activeTextSource = '';
let activePdfTextBlocks = [];
let documentTranslationToken = 0;
let documentTranslationEnabled = false;
let documentTranslationUserChoice = null;
let currentImageGroup = [];
let currentImageIndex = -1;
let pdfFitMode = true;
let pdfFitRenderToken = 0;
const PDF_FIT_PADDING = 0.90;
const PDF_MAX_OUTPUT_SCALE = 2;
const defaultViewerState = {
  zoom: 1,
  x: 0,
  y: 0,
  rotX: -12,
  rotY: 18,
  rotZ: 0,
  flipped: false
};
document.addEventListener('DOMContentLoaded', () => {
const chapterToggle =
  document.querySelector("#chapter-toggle");

const videoChapters =
  document.querySelector(".video-chapters");

if (chapterToggle && videoChapters) {

  chapterToggle.addEventListener("click", () => {

    videoChapters.classList.toggle("open");

  });

    const closeBtns = document.querySelectorAll('.btn-close-drawer');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeIndexDrawerWithAnim();
        });
    });

}
    const scoreHUD = document.getElementById('score-hud');
    const scoreHUDShadow = document.getElementById('score-hud-shadow');

    if (scoreHUD) {
        const maxMovePx = 15;
        let hudMoveRaf = null;


        let lastMouseX = 0;
        let lastMouseY = 0;


        scoreHUD.addEventListener('mousemove', (e) => {
            if (focusLocked) return;

            const clientX = e.clientX;
            const clientY = e.clientY;


            if (Math.abs(clientX - lastMouseX) < 2 && Math.abs(clientY - lastMouseY) < 2) {
                return;
            }
            lastMouseX = clientX;
            lastMouseY = clientY;


            if (hudMoveRaf) return;
            hudMoveRaf = requestAnimationFrame(() => {
                const rect = scoreHUD.getBoundingClientRect();


                const localX = clientX - rect.left;
                const localY = clientY - rect.top;

                const triggerZoneX = rect.width * 0.125;
                const triggerZoneY = rect.height * 0.9;

                const mouseXPercent = localX / rect.width - 0.5;
                const mouseYPercent = localY / rect.height - 0.5;

                const moveX = mouseXPercent * maxMovePx;
                const moveY = mouseYPercent * maxMovePx;

                scoreHUD.style.setProperty('transition', 'opacity 1.2s ease-out, transform 0s linear', 'important');

                if (!focusLocked) {
                    scoreHUD.style.setProperty(
                        'transform',
                        `translate(${moveX}px, ${moveY}px)`
                    );
                }


                if (localX < triggerZoneX && localY > triggerZoneY && !focusLocked) {
                    focusLocked = true;

                    scoreHUD.style.setProperty('transition', 'transform .22s cubic-bezier(.17,.84,.44,1)', 'important');
                    scoreHUD.style.setProperty('transform', 'translate(-12px, 17px)', 'important');

                    scoreHUD.classList.add('magnetic-lock');
                    scoreHUDShadow.classList.add('locked');

                    triggerFocusConfirm();
                }

                hudMoveRaf = null;
            });
        });


        scoreHUD.addEventListener('mouseleave', () => {
            if (!focusLocked) {
                scoreHUD.style.setProperty(
                    'transition',
                    'opacity 1.2s ease-out, transform 0.8s cubic-bezier(0.25,1,0.5,1)',
                    'important'
                );
                scoreHUD.style.setProperty(
                    'transform',
                    'translate(0px,0px)',
                    'important'
                );
            }
        });
    }

  if (scoreHUD) {
    scoreHUD.style.display = 'none';
    scoreHUD.classList.remove('open');
    }
    if (scoreHUDShadow) {
        scoreHUDShadow.style.display = 'none';
        scoreHUDShadow.classList.remove('locked');
    }
});
function triggerFocusConfirm() {

    const shadow =
        document.getElementById(
            'score-hud-shadow'
        );

    if (!shadow) return;

    shadow.classList.remove(
        'focus-confirm'
    );

    void shadow.offsetWidth;

    shadow.classList.add(
        'focus-confirm'
    );

}


const geoScale = 1.0;
const worldScale = 1.0;
const offsetX = 0;
const offsetY = 0;


// Map
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1.8,
    maxZoom: 8,
    zoomControl: false,
    attributionControl: false,
    inertia: true,
});

const bounds = [
    [0, 0],
    [height, width]
];

// Horizontal world wrap -------------------------------------------------
// The atlas is a cylindrical world: the right edge continues directly
// into the left edge. Three visual copies give Leaflet enough runway for
// drags and flyTo animations across the seam; the center is recentered only
// after it has travelled half a world beyond the canonical copy.
const WORLD_WIDTH = width;
const WORLD_COPY_OFFSETS = [-1, 0, 1];
const WORLD_WRAP_MIN = -WORLD_WIDTH * 0.5;
const WORLD_WRAP_MAX = WORLD_WIDTH * 1.5;
const WORLD_VERTICAL_MARGIN = width / 8;
let worldRecenterGuard = false;

map.createPane('ruinWorldPane');
const ruinWorldPane = map.getPane('ruinWorldPane');
if (ruinWorldPane) {
    ruinWorldPane.style.zIndex = '400';
    ruinWorldPane.style.pointerEvents = 'none';
}

const worldOverlays = WORLD_COPY_OFFSETS.map((copyOffset) => {
    const x0 = copyOffset * WORLD_WIDTH;
    const layerBounds = [
        [0, x0],
        [height, x0 + WORLD_WIDTH]
    ];

    return L.imageOverlay(
        'assets/ruin-map.svg',
        layerBounds,
        { pane: 'ruinWorldPane', interactive: false }
    ).addTo(map);
});

// Keep the old name for code that expects the central atlas overlay.
const overlay = worldOverlays[1];

function wrapWorldX(x) {
    return ((x % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH;
}

function nearestWrappedX(baseX, referenceX = map.getCenter().lng) {
    const canonicalX = wrapWorldX(baseX);
    const worldShift = Math.round((referenceX - canonicalX) / WORLD_WIDTH);
    return canonicalX + worldShift * WORLD_WIDTH;
}

function getNearestWrappedLatLng(latlng, referenceX = map.getCenter().lng) {
    const point = L.latLng(latlng);
    return L.latLng(point.lat, nearestWrappedX(point.lng, referenceX));
}

function getWrappedWorldBounds(referenceX = map.getCenter().lng) {
    const copyIndex = Math.round((referenceX - WORLD_WIDTH / 2) / WORLD_WIDTH);
    const x0 = copyIndex * WORLD_WIDTH;
    return [
        [0, x0],
        [height, x0 + WORLD_WIDTH]
    ];
}

function normalizeWorldPosition() {
    if (worldRecenterGuard) return;

    const center = map.getCenter();
    let nextX = center.lng;
    let nextY = center.lat;

    while (nextX < WORLD_WRAP_MIN) nextX += WORLD_WIDTH;
    while (nextX > WORLD_WRAP_MAX) nextX -= WORLD_WIDTH;

    nextY = Math.max(
        -WORLD_VERTICAL_MARGIN,
        Math.min(height + WORLD_VERTICAL_MARGIN, nextY)
    );

    if (Math.abs(nextX - center.lng) < 0.001 && Math.abs(nextY - center.lat) < 0.001) {
        return;
    }

    worldRecenterGuard = true;
    map.setView([nextY, nextX], map.getZoom(), { animate: false });
    requestAnimationFrame(() => {
        worldRecenterGuard = false;
        if (currentCompassMarker) window.updateCompassDirection?.();
    });
}

worldOverlays.forEach((layer) => {
    layer.on('load', () => {
        // The filter is applied once to the shared pane rather than once per
        // copy, which keeps the three-world seam much cheaper to composite.
        applyMembraneFinalEffect();
    });
});

map.fitBounds(bounds);


let membraneEffectRaf = null;
let lastMembraneEffectTime = 0;
const membraneEffectInterval = 1000 / 12;
let lastMembraneZoom = Number.NaN;

function getMembraneState(currentZoom = map.getZoom()) {
    const triggerZoom = 1;
    const maxZoom = 8;

    const ratio = currentZoom <= triggerZoom
        ? 0
        : Math.min(Math.max((currentZoom - triggerZoom) / (maxZoom - triggerZoom), 0), 1);

    const tone = clampReaderTone(readerToneValue);
    const warmT = Math.min(1, tone / READER_WARM_POINT);
    const nightT = tone <= READER_WARM_POINT
        ? 0
        : Math.min(1, (tone - READER_WARM_POINT) / (100 - READER_WARM_POINT));

    // Keep the authored zoom membrane, then gently bias it toward the selected
    // reading environment. Warm mode remains paper-like; night mode gradually
    // reverses the atlas itself without touching photos or other media.
    const dynamicBlur = 0.40 + (ratio * 2.3);

    const zoomContrast = 1.8 - (ratio * 0.8);
    const warmContrastScale = readerToneMix(1, 0.96, warmT);
    const nightContrastScale = readerToneMix(1, 0.91, nightT);
    const dynamicContrast = zoomContrast * warmContrastScale * nightContrastScale;

    const zoomBrightness = 1.02 + (ratio * 0.7);
    const warmBrightnessScale = readerToneMix(1, 0.92, warmT);
    const nightBrightnessScale = readerToneMix(1, 0.84, nightT);
    const dynamicBrightness = zoomBrightness * warmBrightnessScale * nightBrightnessScale;

    const warmSepia = readerToneMix(0.33, 0.50, warmT);
    const dynamicSepia = readerToneMix(warmSepia, 0.08, nightT);

    const nightInvert = readerToneMix(0, 0.88, nightT);
    const zoomInvert = ratio * 0.15;
    const dynamicInvert = nightInvert + ((1 - nightInvert) * zoomInvert);

    const zoomOpacity = 1 - (ratio * 0.45);
    const warmOpacityScale = readerToneMix(1, 0.94, warmT);
    const dynamicOpacity = zoomOpacity * warmOpacityScale;

    return {
        opacity: dynamicOpacity,
        filter:
            `blur(${dynamicBlur.toFixed(3)}px) ` +
            `contrast(${dynamicContrast.toFixed(3)}) ` +
            `brightness(${dynamicBrightness.toFixed(3)}) ` +
            `sepia(${dynamicSepia.toFixed(3)}) ` +
            `invert(${dynamicInvert.toFixed(3)})`,
        // multiply is part of the existing parchment membrane, but once the
        // atlas turns into a dark reversed drawing it must return to normal
        // compositing or the pale lines disappear into the charcoal ground.
        blend: nightT > 0.12
            ? 'normal'
            : ((ratio > 0 || tone > 3) ? 'multiply' : 'normal')
    };
}

function applyMembraneState(currentZoom = map.getZoom(), interactive = false) {
    const el = ruinWorldPane;
    if (!el) return;

    const state = getMembraneState(currentZoom);

    if (el.style.filter !== state.filter) {
        el.style.filter = state.filter;
    }
    // mix-blend-mode on a full-viewport moving SVG is one of the most
    // expensive compositing operations. During the gesture use normal blend;
    // zoomend restores the exact authored state.
    const nextBlend = interactive ? 'normal' : state.blend;
    if (el.style.mixBlendMode !== nextBlend) {
        el.style.mixBlendMode = nextBlend;
    }

    const nextOpacity = String(state.opacity);
    if (el.style.opacity !== nextOpacity) {
        el.style.opacity = nextOpacity;
    }
}

function updateMembraneDuringZoom() {
    if (membraneEffectRaf !== null) return;

    membraneEffectRaf = requestAnimationFrame((now) => {
        membraneEffectRaf = null;

        // The 4000×3000 membrane is the largest paint surface on the page.
        // Quantize its filter updates; Leaflet's transform itself stays smooth.
        if (now - lastMembraneEffectTime < membraneEffectInterval) return;
        const zoom = map.getZoom();
        if (Number.isFinite(lastMembraneZoom) && Math.abs(zoom - lastMembraneZoom) < 0.045) return;
        lastMembraneEffectTime = now;
        lastMembraneZoom = zoom;

        applyMembraneState(zoom, true);
    });
}

function beginMembraneZoomEffect() {
    const el = ruinWorldPane;
    if (!el) return;
    // Do not permanently promote the huge filtered pane to its own texture.
    // Opacity is cheap to composite; filter is updated at a controlled rate.
    el.style.willChange = 'opacity';
    lastMembraneEffectTime = 0;
    lastMembraneZoom = Number.NaN;
    applyMembraneState(map.getZoom(), true);
}

function applyMembraneFinalEffect() {
    if (membraneEffectRaf !== null) {
        cancelAnimationFrame(membraneEffectRaf);
        membraneEffectRaf = null;
    }

    lastMembraneZoom = Number.NaN;
    applyMembraneState(map.getZoom(), false);

    const el = ruinWorldPane;
    if (el) {
        requestAnimationFrame(() => {
            el.style.willChange = '';
        });
    }
}

map.on('zoomstart', beginMembraneZoomEffect);
map.on('zoom', updateMembraneDuringZoom);
map.on('zoomend', applyMembraneFinalEffect);
map.on('moveend', normalizeWorldPosition);
applyMembraneFinalEffect();

// Reader-tone changes update the huge 4000×3000 atlas at a controlled rate.
// UI paper/text variables remain 60fps; the expensive membrane stays ~20fps.
let readerToneMapTimer = null;
readerToneMapRefresh = () => {
    if (readerToneMapTimer !== null) return;

    readerToneMapTimer = window.setTimeout(() => {
        readerToneMapTimer = null;
        applyMembraneFinalEffect();
    }, 50);
};


// v52 · Dynamic UI should never retrigger a full-page language pass.
// Popup hover is a hot path; translate only the newly created subtree.
function syncLanguageSubtree(root, targetLang = window.currentLang) {
    if (!root || !targetLang) return;
    let vault;
    try {
        vault = languageVault[targetLang];
    } catch (_) {
        return;
    }
    if (!vault) return;

    const applyNode = (el) => {
        const key = el?.getAttribute?.('data-i18n');
        if (!key) return;
        const value = vault[key];
        if (value != null && el.textContent !== value) el.textContent = value;
    };

    if (root.matches?.('[data-i18n]')) applyNode(root);
    root.querySelectorAll?.('[data-i18n]').forEach(applyNode);
}
window.syncLanguageSubtree = syncLanguageSubtree;

map.on('popupopen', function (event) {
    syncLanguageSubtree(event?.popup?.getElement?.());
});


setTimeout(() => {
    const center = map.getCenter();
    map.flyTo(
        [
            center.lat + 377,
            center.lng - 410
        ],
        map.getZoom() + 1.1,
        {
            duration: 5
        }
    );
}, 1000);


let activeSiteIndex = null;
const markers = [];


// Attachments
let attachmentRegistry = null;

function createAttachmentRegistry() {
    return {
    'radio-score': {
        title: 'title_radio_score',
        type: 'graphic score',
        mode: 'card',
        front: 'attachments/aether-scorched-earth/score-2.png',
        back: 'attachments/aether-scorched-earth/score-2b.png',
        desc: 'desc_radio_score'
    },
    'radio-instrument': {
        title: 'title_radio_instrument',
        type: 'instrument demonstration',
        mode: 'video',
        src: 'attachments/aether-scorched-earth/instrument-2.mp4',
        desc: 'desc_radio_instrument'
    },
    'radio-film': {
        title: 'title_radio_film',
        type: 'ruin garden footage',
        mode: 'video',
        src: 'attachments/aether-scorched-earth/folly-2.mp4',
        desc: 'desc_radio_film'
    },
    'radio-rec-1': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-1.jpg',
        desc: ''
    },
    'radio-rec-2': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-2.jpg',
        desc: ''
    },
    'radio-rec-3': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-3.jpg',
        desc: ''
    },
    'radio-rec-4': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-4.jpg',
        desc: ''
    },
    'radio-rec-5': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-5.jpg',
        desc: ''
    },
    'radio-rec-6': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-6.jpg',
        desc: ''
    },
    'radio-rec-7': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-7.jpg',
        desc: ''
    },
    'radio-rec-8': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-8.jpg',
        desc: ''
    },
    'radio-rec-9': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-9.jpg',
        desc: ''
    },
    'radio-rec-10': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-10.jpg',
        desc: ''
    },
    'radio-rec-11': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-11.jpg',
        desc: ''
    },
    'radio-rec-12': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-12.jpg',
        desc: ''
    },
    'radio-map-1': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'pdf',
        src: 'attachments/aether-scorched-earth/mapping.pdf',
        desc: ''
    },
    'radio-note-1': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'text',
        src: 'attachments/aether-scorched-earth/statement.txt',
        desc: ''
    },

    'plague-scan': {
        title: 'title_plague_score',
        type: 'graphic score',
        mode: 'card',
        front: 'attachments/effluent-sedimentation/score-1.png',
        back: 'attachments/effluent-sedimentation/score-1b.png',
        desc: 'desc_plague_score'
    },
    'plague-audio': {
        title: 'title_plague_instrument',
        type: 'instrument demonstration',
        mode: 'video',
        src: 'attachments/effluent-sedimentation/instrument-1.mp4',
        desc: 'desc_plague_instrument'
    },
    'plague-film': {
        title: 'title_plague_film',
        type: 'ruin garden footage',
        mode: 'video',
        src: 'attachments/effluent-sedimentation/folly-1.mp4',
        desc: 'desc_plague_film'
    },
    'plague-rec-1': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-1.jpg',
        desc: ''
    },
    'plague-rec-2': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-2.jpg',
        desc: ''
    },
    'plague-rec-3': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-3.jpg',
        desc: ''
    },
    'plague-rec-4': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-4.jpg',
        desc: ''
    },
    'plague-rec-5': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-5.jpg',
        desc: ''
    },
    'plague-rec-6': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-6.jpg',
        desc: ''
    },
    'plague-rec-7': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-7.jpg',
        desc: ''
    },
    'plague-rec-8': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-1.jpg',
        desc: ''
    },
    'plague-rec-9': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-2.jpg',
        desc: ''
    },
    'plague-rec-10': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-3.jpg',
        desc: ''
    },
    'plague-rec-11': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-4.jpg',
        desc: ''
    },
    'plague-rec-12': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-5.jpg',
        desc: ''
    },
    'plague-map-1': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'pdf',
        src: 'attachments/effluent-sedimentation/mapping.pdf',
        desc: ''
    },
    'plague-note-1': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'text',
        src: 'attachments/effluent-sedimentation/statement.txt',
        desc: ''
    },

    'silicon-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/silicon-vein-works/video-to-pic.jpg',
        desc: 'desc_recorded_2018_05'
    },
    'silicon-audio': {
        title: 'specimen_audio',
        mode: 'audio',
        src: 'attachments/silicon-vein-works/ambient.wav',
        desc: 'desc_recorded_2018_05'
    },

    'suspended-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/suspended-homeland/photo-1.jpg',
        desc: 'desc_recorded_2024_01_27'
    },
    'suspended-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/suspended-homeland/photo-2.jpg',
        desc: 'desc_recorded_2024_01_27'
    },
    'suspended-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/suspended-homeland/photo-3.jpg',
        desc: 'desc_recorded_2024_01_27'
    },

    'foghut-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mist-eroded-hut/photo-1.jpg',
        desc: 'desc_recorded_2024_01_27'
    },

    'hiddenstair-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/hidden-stair-villa/photo-1.jpg',
        desc: 'desc_recorded_2025_11_21'
    },
    'hiddenstair-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/hidden-stair-villa/photo-2.jpg',
        desc: 'desc_recorded_2025_11_21'
    },
    'hiddenstair-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/hidden-stair-villa/photo-3.jpg',
        desc: 'desc_recorded_2025_11_21'
    },

    'church-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-1.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-2.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-3.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-4.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-5.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-6.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-7.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-8.jpg',
        desc: 'desc_recorded_2022_11_30'
    },
    'church-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bell-silent-church/film-scan-9.jpg',
        desc: 'desc_recorded_2022_11_30'
    },

    'garychurch-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-1.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-2.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-3.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-4.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-5.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-6.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-7.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-8.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-9.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'garychurch-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rust-prayer-sanctuary/film-scan-10.jpg',
        desc: 'desc_recorded_2024_02_11'
    },
    'midco-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-1.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-2.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-3.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-4.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-5.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-6.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-7.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-8.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-9.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-10.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-11.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/film-scan-12.jpg',
        desc: 'desc_recorded_2023_10_20'
    },
    'midco-object-strip-curtain': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/object-strip-curtain.jpg',
        desc: 'desc_midco_object_strip_curtain'
    },
    'midco-object-yacht': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/object-yacht.jpg',
        desc: 'desc_midco_object_yacht'
    },
    'midco-object-terminal': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/toxic-tire-pyre/object-terminal.jpg',
        desc: 'desc_midco_object_terminal'
    },

    'north-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-1.jpg',
        desc: 'desc_recorded_2023_06_19'
    },
    'north-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-2.jpg',
        desc: 'desc_recorded_2023_04_06'
    },
    'north-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-3.jpg',
        desc: 'desc_recorded_2023_09_14'
    },
    'north-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-4.jpg',
        desc: 'desc_recorded_2023_03_24'
    },
    'north-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-5.jpg',
        desc: 'desc_recorded_2022_06_07'
    },
    'north-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-6.jpg',
        desc: 'desc_recorded_2022_10_01'
    },
    'north-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-7.jpg',
        desc: 'desc_recorded_2022_10_01'
    },
    'north-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-8.jpg',
        desc: 'desc_recorded_2022_10_01'
    },
    'north-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-9.jpg',
        desc: 'desc_recorded_2023_07_29'
    },
    'north-hum': {
        title: 'specimen_audio',
        mode: 'audio',
        src: 'attachments/fallen-wing-field/wave.wav',
        desc: 'desc_north_hum'
    },
    'north-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/fallen-wing-field/object-wood-dolomite.jpg',
        desc: 'desc_north_ticket'
    },
    'north-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/fallen-wing-field/object-wood-dolomite-2.jpg',
        desc: 'desc_north_ticket_2'
    },

    'signal-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-1.jpg',
        desc: 'desc_recorded_2024_12_29'
    },
    'signal-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-2.jpg',
        desc: 'desc_recorded_2024_12_29'
    },
    'signal-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-3.jpg',
        desc: 'desc_recorded_2024_12_29'
    },
    'signal-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-4.jpg',
        desc: 'desc_recorded_2024_12_29'
    },
    'signal-corridor': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/pano-film-scan-1.jpg',
        desc: 'desc_recorded_2024_12_30'
    },
    'signal-corridor-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/pano-film-scan-2.jpg',
        desc: 'desc_recorded_2024_12_30'
    },
    'signal-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-1.jpg',
        desc: 'desc_recorded_2024_12_30'
    },
    'signal-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-2.jpg',
        desc: 'desc_recorded_2024_12_30'
    },
    'signal-ticket-3': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-3.jpg',
        desc: 'desc_recorded_2024_12_30'
    },
    'signal-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/mountain-signal/note.txt',
        desc: ''
    },

    'wave-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-1.jpg',
        desc: 'desc_recorded_2024_07_04'
    },
    'wave-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-2.jpg',
        desc: 'desc_recorded_2024_07_04'
    },
    'wave-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-3.jpg',
        desc: 'desc_recorded_2024_07_04'
    },
    'wave-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-4.jpg',
        desc: 'desc_recorded_2024_07_04'
    },
    'wave-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-1.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-2.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-3.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-4.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-5.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-6.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-7.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-8.jpg',
        desc: 'desc_recorded_2026_06_24'
    },
    'wave-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-9.jpg',
        desc: 'desc_wave_pilgrimage_chen'
    },
    'wave-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-10.jpg',
        desc: 'desc_wave_pilgrimage_chen'
    },
    'wave-15': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-11.jpg',
        desc: 'desc_wave_pilgrimage_chen'
    },
    'wave-16': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-12.jpg',
        desc: 'desc_wave_pilgrimage_chen'
    },
    'wave-audio': {
        title: 'specimen_audio',
        mode: 'audio',
        src: 'attachments/wave-eroded-structure/ambient.wav',
        desc: 'desc_wave_audio'
    },

    'brick-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-1.jpg',
        desc: 'desc_recorded_2024_06_07'
    },
    'brick-011': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-2.jpg',
        desc: 'desc_brick_pilgrimage_wang'
    },
    'brick-012': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-3.jpg',
        desc: 'desc_brick_pilgrimage_wang'
    },
    'brick-013': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/infrared-photo-1.jpg',
        desc: 'desc_recorded_2024_06_07'
    },
    'brick-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/film-scan-1.jpg',
        desc: 'desc_recorded_2024_06_07'
    },
    'brick-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/film-scan-2.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'brick-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/film-scan-3.jpg',
        desc: 'desc_recorded_2024_09_03'
    },

    'quarry-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-1.jpg',
        desc: 'desc_recorded_2023_12_25'
    },
    'quarry-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-2.jpg',
        desc: 'desc_recorded_2023_12_25'
    },
    'quarry-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-3.jpg',
        desc: 'desc_recorded_2023_12_25'
    },
    'quarry-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-4.jpg',
        desc: 'desc_recorded_2023_12_25'
    },
    'quarry-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/object-pebble-stack.jpg',
        desc: 'desc_quarry_ticket'
    },

    'bath-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-1.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-2.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-3.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-4.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-5.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-6.jpg',
        desc: 'desc_recorded_2023_08_09'
    },
    'bath-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-7.jpg',
        desc: 'desc_recorded_2023_08_09'
    },

    'yellow-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-1.jpg',
        desc: 'desc_recorded_2017_08'
    },
    'yellow-012': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-2.jpg',
        desc: 'desc_recorded_2024_03_03'
    },
    'yellow-013': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-3.jpg',
        desc: 'desc_recorded_2024_03_03'
    },
    'yellow-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-1.jpg',
        desc: 'desc_recorded_2025_01_28'
    },
    'yellow-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-2.jpg',
        desc: 'desc_recorded_2025_01_28'
    },
    'yellow-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-3.jpg',
        desc: 'desc_recorded_2025_01_28'
    },
    'yellow-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-4.jpg',
        desc: 'desc_recorded_2025_01_28'
    },
    'yellow-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-5.jpg',
        desc: 'desc_recorded_2025_01_28'
    },

    'fish-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-1.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-2.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-3.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-4.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-041': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-5.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-042': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-6.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-043': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-7.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-044': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-8.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'fish-045': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-9.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'fish-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-1.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'fish-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-2.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-3.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-4.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-5.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-6.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-7.jpg',
        desc: 'desc_recorded_2024_09_04'
    },
    'fish-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/fish-mouth/object-bamboo-weaved-cast.jpg',
        desc: 'desc_fish_ticket'
    },
    'fish-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/fish-mouth/note.txt',
        desc: ''
    },

    'gloss-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-1.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'gloss-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-2.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'gloss-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-3.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'gloss-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-4.jpg',
        desc: 'desc_recorded_2024_05_28'
    },
    'gloss-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/gloss-veil/object-net.jpg',
        desc: ''
    },

    'pole-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/concrete-pole/photo-1.jpg',
        desc: 'desc_recorded_2022_10_03'
    },
    'pole-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/concrete-pole/photo-2.jpg',
        desc: 'desc_recorded_2022_10_03'
    },
    'pole-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/concrete-pole/photo-3.jpg',
        desc: 'desc_recorded_2022_06_17'
    },

    'aquarium-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-1.jpg',
        desc: 'desc_recorded_2024_12_20'
    },
    'aquarium-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-2.jpg',
        desc: 'desc_recorded_2024_12_20'
    },
    'aquarium-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-3.jpg',
        desc: 'desc_recorded_2024_12_20'
    },
    'aquarium-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-4.jpg',
        desc: 'desc_recorded_2024_12_20'
    },
    'aquarium-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-5.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'aquarium-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-6.jpg',
        desc: ''
    },
    'aquarium-011': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-1.jpg',
        desc: 'desc_recorded_2024_08_31'
    },
    'aquarium-012': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-2.jpg',
        desc: 'desc_recorded_2024_08_31'
    },
    'aquarium-013': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-3.jpg',
        desc: 'desc_recorded_2024_08_31'
    },
    'aquarium-014': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-4.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'aquarium-015': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-5.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'aquarium-016': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-6.jpg',
        desc: 'desc_recorded_2024_08_31'
    },
    'aquarium-object-one-eyed-elf': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/aquarium-bunker/object-one-eyed-elf.jpg',
        desc: 'desc_aquarium_one_eyed_elf'
    },

    'roof-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-1.jpg',
        desc: 'desc_recorded_2025_02_07'
    },
    'roof-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-2.jpg',
        desc: 'desc_recorded_2025_02_07'
    },
    'roof-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-3.jpg',
        desc: 'desc_recorded_2025_02_07'
    },
    'roof-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/film-scan-1.jpg',
        desc: 'desc_recorded_2025_02_04'
    },
    'roof-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/film-scan-2.jpg',
        desc: 'desc_recorded_2025_02_04'
    },
    'roof-ticket-1': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-1.jpg',
        desc: 'desc_recorded_2025_02_06'
    },
    'roof-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-2.jpg',
        desc: 'desc_recorded_2025_03_16'
    },
    'roof-ticket-3': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-3.jpg',
        desc: 'desc_recorded_2025_03_17'
    },
    'roof-ticket-4': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-4.jpg',
        desc: 'desc_recorded_2025_02_04'
    },
    'roof-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/roof/note.txt',
        desc: ''
    },

    'phospho-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-1.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-2.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-3.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-4.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-5.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-6': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-6.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-7': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-7.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-1.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-2.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-3.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-4.jpg',
        desc: 'desc_recorded_2026_07_05'
    },
    'phospho-15': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-5.jpg',
        desc: 'desc_recorded_2026_07_05'
    },

    'castle-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-1.jpg',
        desc: 'desc_recorded_2025_01_27'
    },
    'castle-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-2.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-3.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-4.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-5.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-6': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-6.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-7': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-7.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-8': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-8.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'castle-9': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-9.jpg',
        desc: 'desc_recorded_2026_09_05'
    },

    'grassdwelling-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/grass-child-dwelling/photo-1.jpg',
        desc: 'desc_recorded_2026_09_05'
    },
    'grassdwelling-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/grass-child-dwelling/photo-2.jpg',
        desc: 'desc_recorded_2026_09_05'
    },


    'earthwall-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-1.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-2.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-3.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-4.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-5.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-6.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-7.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-8.jpg',
        desc: 'desc_recorded_2026_08_15'
    },
    'earthwall-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-9.jpg',
        desc: 'desc_recorded_2026_08_15'
    },

    'cliffgranary-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-1.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-2.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-3.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-4.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-5.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-6.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-7.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-8.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-9.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-10.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-11.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-12.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-13.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-14.jpg',
        desc: 'desc_recorded_2026_08_16'
    },
    'cliffgranary-15': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/cliff-granary/object-fence-1.jpg',
        desc: 'desc_cliff_fence_1'
    },
    'cliffgranary-16': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/cliff-granary/object-fence-2.jpg',
        desc: ''
    },

    'afterglow-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/afterglow-palace/photo-1.jpg',
        desc: 'desc_recorded_2026_02_23'
    },
    'afterglow-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/afterglow-palace/photo-2.jpg',
        desc: 'desc_recorded_2026_02_23'
    },
    'afterglow-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/afterglow-palace/photo-3.jpg',
        desc: 'desc_recorded_2026_02_23'
    },
    'afterglow-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/afterglow-palace/note.txt',
        desc: ''
    },

    'compressed-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-1.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-2.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-3.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-4.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-5.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-6.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-7.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-8.jpg',
        desc: 'desc_recorded_2026_08_18'
    },
    'compressed-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/compressed-courtyard/photo-9.jpg',
        desc: 'desc_recorded_2026_08_18'
    },

    'dock-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-1.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-2.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-3.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-4.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-5.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-6': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-6.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-7': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-7.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-8': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-8.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-9': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-9.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-10.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-11.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-12.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-13.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-14.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-15': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-15.jpg',
        desc: 'desc_recorded_2026_06_30'
    },
    'dock-16': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-16.jpg',
        desc: 'desc_recorded_2026_06_30'
    },

    'walled-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/film-scan-1.jpg',
        desc: 'desc_recorded_2018_07_31'
    },
    'walled-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-1.jpg',
        desc: 'desc_recorded_2018_07_31'
    },
    'walled-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-2.jpg',
        desc: 'desc_recorded_2019_05_27'
    },
    'walled-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-3.jpg',
        desc: 'desc_recorded_2018_07_31'
    },
    'walled-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-4.jpg',
        desc: 'desc_recorded_2018_07_31'
    },
    'walled-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-5.jpg',
        desc: 'desc_recorded_2019_12_02'
    },
    'walled-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/walled-gallery/object-wrecked-van.jpg',
        desc: 'desc_walled_van'
    },
    'walled-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/walled-gallery/note.txt',
        desc: ''
    },

    'membrane-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/membrane/film-scan-1.jpg',
        desc: 'desc_recorded_2024_06_10'
    },
    'membrane-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/membrane/film-scan-2.jpg',
        desc: 'desc_recorded_2024_06_10'
    },
    'membrane-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/membrane/film-scan-3.jpg',
        desc: 'desc_recorded_2024_06_10'
    },

    'mirror-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-1.jpg',
        desc: 'desc_recorded_2024_06_07'
    },
    'mirror-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-2.jpg',
        desc: 'desc_recorded_2024_06_07'
    },
    'mirror-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-3.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'mirror-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-4.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'mirror-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-5.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'mirror-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-6.jpg',
        desc: 'desc_recorded_2024_09_03'
    },
    'mirror-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mirror/object-mirror-pattern.jpg',
        desc: ''
    },
    'mirror-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mirror/object-doll-unknown.jpg',
        desc: ''
    },
    'mirror-note': {
        title: 'specimen_note',
        mode: 'text',
        src: 'attachments/mirror/note.txt',
        desc: ''
    },

    'solar-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/solar/film-scan-1.jpg',
        desc: 'desc_recorded_2024_08_15'
    },
    'solar-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/solar/film-scan-2.jpg',
        desc: 'desc_recorded_2024_08_15'
    },

    'rail-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rail-side/photo-1.jpg',
        desc: 'desc_recorded_2022_06_08'
    },

};
}

function ensureAttachmentRegistry() {
    if (!attachmentRegistry) attachmentRegistry = createAttachmentRegistry();
    return attachmentRegistry;
}



function getRecordCounts(folderName) {

    const counts = {
        visual: 0,
        audio: 0,
        object: 0,
        note: 0
    };

    Object.values(ensureAttachmentRegistry()).forEach(item => {

        const path =
            item.src ||
            item.front ||
            '';

        if (!path.includes(folderName))
            return;


        if (item.title === 'specimen_visual')
            counts.visual++;

        else if (item.title === 'specimen_audio')
            counts.audio++;

        else if (item.title === 'specimen_object')
            counts.object++;

        else if (item.title === 'specimen_note')
            counts.note++;

    });

    return counts;
}


const attachmentViewer =
  document.getElementById('attachment-viewer');
let currentZoom = 1;
let currentX = 0;
let currentY = 0;

// Viewer
function openAttachmentViewer(id) {

  const registry = ensureAttachmentRegistry();
  const item = registry[id];
  if (!item) return;

  activeAttachmentId = id;
  activeAttachmentItem = item;
  activeTextSource = '';
  syncDocumentTranslationPreference({ onOpen: true });
  activePdfTextBlocks = [];
  documentTranslationToken++;
  clearInlineDocumentTranslation();

  const stage = document.getElementById('attachment-stage');


    const wrapper = document.getElementById('media-wrapper');

    const titleEl = document.getElementById('attachment-title');
    titleEl.setAttribute('data-i18n', item.title);

    titleEl.innerText = item.title;
    const descEl = document.getElementById('attachment-desc');
    descEl.setAttribute('data-i18n', item.desc);
    descEl.innerText = item.desc;
    if (window.currentLang) {
        const vault = languageVault[window.currentLang];
        if (vault) {
            titleEl.innerText = vault[item.title] || item.title;
            descEl.innerText = vault[item.desc] || item.desc;
        }
    }
    document.getElementById('attachment-filename').innerText = '';
  document.querySelector('.attachment-hud')?.classList.add('show');
const hud = document.querySelector('.attachment-hud');

if (hud && !hud.querySelector('#reset')) {
  const resetBtn = document.createElement('div');
  resetBtn.id = 'reset';
  resetBtn.className = 'hud-btn';
  resetBtn.innerText = 'reset';

  hud.appendChild(resetBtn);
}

  currentZoom = 1;
  currentX = 0;
  currentY = 0;

  wrapper.innerHTML = '';

if (item.mode === 'card') {

  wrapper.innerHTML = `

  <div class="score-card-space">

    <div class="score-card" id="score-card">

      <div class="score-face score-front">
        <img
          class="attachment-image"
          src="${item.front}"
        />
      </div>

      <div class="score-face score-back">
        <img
          class="attachment-image"
          src="${item.back}"
        />
      </div>

    </div>

  </div>

  `;

  initScoreCard();

    }


    if (item.mode === 'text') {
        wrapper.innerHTML = `
            <div class="archive-text-document">
                <div class="archive-text-surface">
                    <pre id="archive-text-content" class="archive-note archive-text-content"></pre>
                    <div id="archive-text-translation-layer" class="archive-text-translation-layer" aria-hidden="true">
                        <pre id="archive-text-translation-content" class="archive-note archive-text-translation-content"></pre>
                    </div>
                </div>
                <div id="text-loading" class="document-loading">TEXT DATA LOADING…</div>
            </div>
        `;

        fetch(item.src)
            .then(response => {
                if (!response.ok) throw new Error(`TXT HTTP ${response.status}`);
                return response.text();
            })
            .then(text => {
                if (activeAttachmentId !== id) return;
                activeTextSource = text;
                const content = document.getElementById('archive-text-content');
                const loading = document.getElementById('text-loading');
                if (content) content.textContent = text;
                if (loading) loading.remove();
                refreshInlineDocumentTranslation();
            })
            .catch(error => {
                console.error('TXT load failed:', error);
                const loading = document.getElementById('text-loading');
                if (loading) loading.textContent = 'TEXT DATA UNAVAILABLE';
            });
    }


    const pdfHud = document.getElementById('pdf-page-hud');
    if (pdfHud) pdfHud.style.display = 'none';

    const imageHud = document.getElementById('image-page-hud');
    if (imageHud) imageHud.style.display = 'none';


    if (item.mode === 'image') {
        wrapper.innerHTML = `<img class="attachment-image" src="${item.src}" />`;

        const dir = item.src.substring(0, item.src.lastIndexOf('/') + 1);
        const currentType = classifyAttachment(item.src);

        currentImageGroup = Object.keys(registry).filter(key => {
            const regItem = registry[key];
            return regItem.mode === 'image' &&
                regItem.src &&
                regItem.src.startsWith(dir) &&
                classifyAttachment(regItem.src) === currentType;
        });

        currentImageIndex = currentImageGroup.indexOf(id);


        if (imageHud) {
            imageHud.style.display = 'flex';
            document.getElementById('image-page-num').innerText = `${currentImageIndex + 1}/${currentImageGroup.length}`;

            const prevBtn = document.getElementById('image-prev');
            const nextBtn = document.getElementById('image-next');


            if (prevBtn) {
                prevBtn.style.opacity = currentImageIndex === 0 ? '0.2' : '1';
                prevBtn.style.pointerEvents = currentImageIndex === 0 ? 'none' : 'auto';
            }
            if (nextBtn) {
                nextBtn.style.opacity = currentImageIndex === currentImageGroup.length - 1 ? '0.2' : '1';
                nextBtn.style.pointerEvents = currentImageIndex === currentImageGroup.length - 1 ? 'none' : 'auto';
            }
        }
    }


    if (item.mode === 'pdf') {
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            wrapper.innerHTML = `
              <iframe src="${item.src}" class="attachment-image" style="border:none; width:100%; height:100%;"></iframe>
              <div style="position:absolute; bottom:10px; color:#666; font-size:10px;" data-i18n="ui_local_preview_hint">
                  提示：本地预览模式 (file:///)，不支持翻页 HUD。请使用 Live Server 以获得完整体验。
              </div>
          `;
            if (pdfHud) pdfHud.style.display = 'none';
        } else {
            wrapper.innerHTML = `
              <div id="pdf-loading" style="position: absolute;" data-i18n="ui_pdf_loading">读取图纸中...</div>
              <div id="pdf-page-stack" class="pdf-page-stack">
                  <canvas id="pdf-canvas" class="attachment-image"></canvas>
                  <canvas id="pdf-translation-canvas" class="pdf-translation-canvas" aria-hidden="true"></canvas>
              </div>
          `;
            if (pdfHud) pdfHud.style.display = 'flex';

            pageNum = 1;
            pageNumPending = null;
            pageRendering = false;
            pdfFitMode = true;
            currentZoom = 1;
            currentX = 0;
            currentY = 0;
            applyTransform();
            updatePdfHudState();

            if (activePdfLoadingTask) {
                try { activePdfLoadingTask.destroy(); } catch (_) {}
                activePdfLoadingTask = null;
            }

            ensurePdfJsLoaded().then(pdfjsLib => {
                if (activeAttachmentId !== id) return null;
                activePdfLoadingTask = pdfjsLib.getDocument(item.src);
                return activePdfLoadingTask.promise;
            }).then(function (pdf) {
                if (!pdf) return;
                if (activeAttachmentId !== id) {
                    try { pdf.destroy(); } catch (_) {}
                    return;
                }
                pdfDoc = pdf;
                activePdfLoadingTask = null;
                pageNum = 1;
                pageNumPending = null;
                updatePdfHudState();
                renderPage(1);
            }).catch(error => {
                activePdfLoadingTask = null;
                console.error('PDF load failed:', error);
                pageRendering = false;
                const loadingText = document.getElementById('pdf-loading');
                if (loadingText) loadingText.textContent = 'PDF DATA UNAVAILABLE';
                updatePdfHudState();
            });
        }
    }


    if (item.mode === 'audio') {
        wrapper.innerHTML = `
            <audio class="attachment-audio" controls preload="metadata">
                <source src="${item.src}" />
            </audio>
        `;
    }


    if (item.mode === 'video') {
  wrapper.innerHTML = `
    <video class="attachment-video" autoplay playsinline>
      <source src="${item.src}" />
    </video>
  `;

  setTimeout(() => {
    currentVideo = wrapper.querySelector('video');
    bindVideoUI();
  }, 50);
    }


    attachmentViewer.classList.remove('view-folly', 'view-score', 'view-pdf', 'view-image', 'view-txt', 'mode-instrument', 'mode-folly-video');


    if (id === 'plague-film' || id === 'radio-film') {
        attachmentViewer.classList.add('view-folly');
    } else if (id === 'plague-scan' || id === 'radio-score') {
        attachmentViewer.classList.add('view-score');
    } else if (item.mode === 'pdf') {
        attachmentViewer.classList.add('view-pdf');
    } else if (item.mode === 'image') {
        attachmentViewer.classList.add('view-image');
    } else if (item.mode === 'text') {
        attachmentViewer.classList.add('view-txt');
    }


    if (item.src) {
        if (item.src.includes('instrument-1.mp4') || item.src.includes('instrument-2.mp4')) {
            attachmentViewer.classList.add('mode-instrument');
        } else if (item.src.includes('folly-1.mp4') || item.src.includes('folly.mp4') || item.src.includes('folly-2.mp4')) {

            attachmentViewer.classList.add('mode-folly-video');
        }
    }


    setViewerMode(item.mode, id);
    attachmentViewer.classList.add('open');
    updateDocumentTranslationControls();


    syncLanguageSubtree(attachmentViewer);
}

function bindVideoUI() {

    const video = currentVideo;
    if (!video) return;

    const playBtn = document.getElementById('video-play');
    const pauseBtn = document.getElementById('video-pause');
    const bar = document.getElementById('video-progress-bar');


    playBtn.onclick = () => video.play();
    pauseBtn.onclick = () => video.pause();


    document.querySelector('.video-progress').onclick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        const ratio = (e.clientY - rect.top) / rect.height;
        video.currentTime = ratio * video.duration;
    };

    const playhead = document.getElementById('score-playhead');
    const playhead2 = document.getElementById('score-playhead-2');
    const scoreBody = document.querySelector('.score-body');


    let cachedScoreBodyWidth = 0;
    let cachedScoreBodyHeight = 0;

    video.ontimeupdate = () => {

        const progress = video.currentTime / video.duration;


        if (bar) {
            bar.style.height = (progress * 100) + '%';
        }


        const arcsContainer = document.getElementById('arcs-container');

        if (arcsContainer) {
            const minScale = 1;
            const maxScale = 4.5;
            const currentScale = minScale + (maxScale - minScale) * progress;
            arcsContainer.style.transform = `scale(${currentScale})`;
        }


        if (!playhead || !scoreBody) return;

        const viewer = document.querySelector('.attachment-viewer');


        if (viewer.classList.contains('score-linear')) {


            if (!cachedScoreBodyWidth || !cachedScoreBodyHeight) {
                cachedScoreBodyWidth = scoreBody.offsetWidth;
                cachedScoreBodyHeight = scoreBody.offsetHeight;
            }


            const w = cachedScoreBodyWidth;


            const startX = w * 0.12;

            const endX = w * 0.88;

            const x = startX + (endX - startX) * progress;
            const scanProgress = (x - startX) / (endX - startX);

            playhead.style.transform = `translateX(${x}px)`;

            const pulse = document.getElementById('score-pulse');

            if (pulse) {

                if (video.currentTime >= 113) {
                    pulse.style.opacity = 0;
                    return;
                }


                const pulseX = x - 3;

                const lineTop = cachedScoreBodyHeight * 0.72;
                const lineHeight = cachedScoreBodyHeight * 0.22;
                const pulseY = lineTop + lineHeight - (lineHeight * scanProgress);


                const minFreq = 0.8;
                const maxFreq = 3.0;
                const freq = minFreq + (maxFreq - minFreq) * scanProgress;


                const sineVal = Math.sin(performance.now() * 0.001 * freq * Math.PI);
                const isBeating = sineVal > 0;


                pulse.style.opacity = isBeating ? 1 : 0.12;


                const scale = isBeating ? (1 - Math.pow(sineVal, 2) * 0.4) : 1.0;


                pulse.style.transform = `translate(${pulseX}px, ${pulseY}px) scale(${scale})`;
            }
        }


else if (viewer.classList.contains('score-radial')) {


  const start1 = -65;
  const end1 = 30;

  const target1 =
    start1 + (end1 - start1) * progress;

  if (!playhead.currentAngle) {
    playhead.currentAngle = start1;
  }


  playhead.currentAngle +=
    (target1 - playhead.currentAngle) * 1;

  playhead.style.transform =
    `rotate(${playhead.currentAngle}deg)`;


  if (playhead2) {


    const progress2 =
      Math.min(1, progress * 1.2);


    const start2 = -55;
    const end2 = 74;


    const target2 =
      start2 + (end2 - start2) * progress2;

    if (!playhead2.currentAngle) {
      playhead2.currentAngle = start2;
    }


    playhead2.currentAngle +=
      (target2 - playhead2.currentAngle) * 1;

    playhead2.style.transform =
      `rotate(${playhead2.currentAngle}deg)`;
  }
}
};

}


let cardRotX = -12;
let cardRotY = 18;
let cardRotZ = 0;
let cardFlipped = false;

function initScoreCard() {

  const card =
    document.getElementById('score-card');

  if (!card) return;


  updateCardTransform(card);

}

function updateCardTransform(card) {

  if (!card) return;

  const flipY =
    cardFlipped ? 180 : 0;

  card.style.transform = `
    rotateX(${cardRotX}deg)
    rotateY(${cardRotY + flipY}deg)
    rotateZ(${cardRotZ}deg)
  `;

}
function closeAttachmentViewer() {

  isClosingViewer = true;
  currentVideo = null;
    resetViewerState();

  const viewer = document.getElementById('attachment-viewer');
  const stage = document.getElementById('attachment-stage');

  document.querySelector('.attachment-hud')
    ?.classList.remove('show');

  const videos = stage.querySelectorAll('video, audio');

  videos.forEach(v => {

      v.pause();
      focusLocked = false;

      const scoreHUD =
          document.getElementById('score-hud');

      const scoreHUDShadow =
          document.getElementById('score-hud-shadow');

      if (scoreHUD) {

          scoreHUD.classList.remove(
              'magnetic-lock'
          );

          scoreHUD.style.removeProperty(
              'transform'
          );

          scoreHUD.style.removeProperty(
              'transition'
          );

      }

      if (scoreHUDShadow) {

          scoreHUDShadow.classList.remove(
              'locked'
          );

          scoreHUDShadow.classList.remove(
              'focus-confirm'
          );

      }
  v.ontimeupdate = null;

  v.src = '';
  v.load();
});

// PDF cleanup must not live inside videos.forEach(): PDF viewers contain no <video>.
if (activePdfLoadingTask) {
    try { activePdfLoadingTask.destroy(); } catch (_) {}
    activePdfLoadingTask = null;
}
if (pdfDoc) {
    const docToDestroy = pdfDoc;
    pdfDoc = null;
    try {
        const result = docToDestroy.destroy();
        if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch (_) {}
}
pageNum = 1;
pageNumPending = null;
pageRendering = false;
activeAttachmentId = null;
activeAttachmentItem = null;
activeTextSource = '';
activePdfTextBlocks = [];
documentTranslationToken++;
clearInlineDocumentTranslation();
updateDocumentTranslationControls();

const playhead =
  document.getElementById('score-playhead');

const playhead2 =
  document.getElementById('score-playhead-2');

const pulse =
  document.getElementById('score-pulse');

if (playhead) {

  playhead.style.transform =
    '';

  playhead.currentAngle = null;
}

if (playhead2) {

  playhead2.style.transform =
    '';

  playhead2.currentAngle = null;


  playhead2.style.opacity = 0;
}

if (pulse) {

  pulse.style.transform = '';
  pulse.style.opacity = 0;
}
document.getElementById('media-wrapper').style.transform = '';
viewer.classList.add('closing');

setTimeout(() => {

  viewer.classList.remove('open');
  viewer.classList.remove('closing');

    viewer.classList.remove('view-folly', 'view-score', 'view-pdf', 'view-image', 'view-txt');
    isClosingViewer = false;
}, 220);
}
document.addEventListener('click', (e) => {

    if (e.target.closest('#pdf-prev')) {
        e.stopPropagation();
        if (pdfDoc && pageNum > 1) queueRenderPage(pageNum - 1);
        return;
    }

    if (e.target.closest('#pdf-next')) {
        e.stopPropagation();
        if (pdfDoc && pageNum < pdfDoc.numPages) queueRenderPage(pageNum + 1);
        return;
    }


    if (e.target.id === 'image-prev') {
        e.stopPropagation();
        if (currentImageIndex > 0) {
            openAttachmentViewer(currentImageGroup[currentImageIndex - 1]);
        }
        return;
    }

    if (e.target.id === 'image-next') {
        e.stopPropagation();
        if (currentImageIndex < currentImageGroup.length - 1) {
            openAttachmentViewer(currentImageGroup[currentImageIndex + 1]);
        }
        return;
    }
});


attachmentViewer.addEventListener('click', (e) => {

  const inner = document.querySelector('.attachment-viewer-inner');
  if (!inner) return;

  if (!inner.contains(e.target)) {
    closeAttachmentViewer();
  }

});


document.addEventListener('click', (e) => {

  if (e.target.closest('.attachment-close')) {
    closeAttachmentViewer();
  }

});


function classifyAttachment(filePath, item = null) {

    // Prefer the explicit specimen metadata. File names are intentionally
    // free-form (for example video-to-pic.jpg), so they should not decide
    // whether a file belongs to the visual/audio/object/note archive.
    if (item?.title === 'specimen_visual') return 'visualFiles';
    if (item?.title === 'specimen_audio') return 'audioFiles';
    if (item?.title === 'specimen_object') return 'objectFiles';
    if (item?.title === 'specimen_note') return 'noteFiles';

    const file =
        filePath.split('/').pop().toLowerCase();


    if (
        file.includes('photo') ||
        file.includes('film') ||
        file.includes('film-scan')
    ) {
        return 'visualFiles';
    }


    if (
        file.includes('object')
    ) {
        return 'objectFiles';
    }


    if (
        file.endsWith('.wav') ||
        file.endsWith('.mp3')
    ) {
        return 'audioFiles';
    }


    if (
        file.endsWith('.txt')
    ) {
        return 'noteFiles';
    }

    return 'otherFiles';
}
function buildArchiveGroups(prefix) {

    const groups = {

        visualFiles: [],
        objectFiles: [],
        audioFiles: [],
        noteFiles: []

    };

    Object.entries(
        ensureAttachmentRegistry()
    ).forEach(([id, item]) => {

        if (!item.src) return;

        if (!id.startsWith(prefix))
            return;

        const type =
            classifyAttachment(item.src, item);

        if (groups[type]) {

            groups[type].push({
                id,
                item
            });

        }

    });

    return groups;
}
function makeTreeFiles(list) {

    return list.map((file, index) => {

        const isLast =
            index === list.length - 1;

        const branch =
            isLast
                ? '└──'
                : '├──';

        const name =
            file.item.src
                .split('/')
                .pop();

        return `

      <div
        class="tree-file"
        onclick="openAttachmentViewer('${file.id}')">

        ${branch} ${name}

      </div>

    `;

    }).join('');

}
// Archive tree
function buildArchiveTree(prefix, titleKey) {
    const groups = buildArchiveGroups(prefix);


    const i18nKey = titleKey === '遗构录' ? 'ui_record' : titleKey;


    const titleFallback = titleKey === '遗构录' ? '遗构录' : titleKey;

    return `
<div class="wander-tree">
  <div class="wander-root tree-folder" onclick="toggleArchiveTree(this)">
    <span class="tree-toggle">[+]</span>

    <span data-i18n="${i18nKey}">${titleFallback}</span>
  </div>
  <div class="tree-collapse">
    ${makeFolder(prefix + '-visual', 'visual', 'specimen_visual', groups.visualFiles)}
    ${makeFolder(prefix + '-audio', 'audio', 'specimen_audio', groups.audioFiles)}
    ${makeFolder(prefix + '-object', 'object', 'specimen_object', groups.objectFiles)}
    ${makeFolder(prefix + '-note', 'note', 'specimen_note', groups.noteFiles, true)}
  </div>
</div>
`;
}

function makeFolder(folderId, icon, labelKey, files = [], isLastFolder = false) {
    const count = files.length;
    const branch = isLastFolder ? '└──' : '├──';


    const fallbackText = {
        'specimen_visual': '视觉标本',
        'specimen_audio': '声音标本',
        'specimen_object': '物件标本',
        'specimen_note': '注释卡'
    }[labelKey] || labelKey;

    return `
<div class="tree-branch tree-folder" onclick="toggleFolder(this)">
  <span class="tree-line">${branch}</span>
  <span class="tree-folder-toggle">[+]</span>

  <span data-i18n="${labelKey}">${fallbackText}</span> (${count})
</div>
<div class="tree-children" data-folder-id="${folderId}">
  ${makeTreeFiles(files)}
</div>
`;
}


const drawer =
  document.getElementById('archive-drawer');

const mask =
  document.getElementById('drawer-mask');
  mask?.addEventListener('click', () => {
    if (window.__multiSiteDrawerLock) return;
    closeDrawer();
  });


function toggleArchiveTree(el) {

    const collapse =
        el.nextElementSibling;

    const toggle =
        el.querySelector('.tree-toggle');

    if (
        !collapse ||
        !collapse.classList.contains('tree-collapse')
    ) return;

    const isOpen =
        getComputedStyle(collapse).display !== 'none';

    collapse.style.display =
        isOpen ? 'none' : 'block';

    toggle.innerText =
        isOpen ? '[+]' : '[-]';
}
function toggleFolder(trigger) {
    if (!trigger) return;
    const folder = trigger.nextElementSibling;
    const icon = trigger.querySelector('.tree-folder-toggle');
    if (!folder || !folder.classList.contains('tree-children') || !icon) return;

    const isOpen = folder.classList.contains('open');
    folder.classList.toggle('open', !isOpen);
    folder.style.display = isOpen ? 'none' : 'block';
    icon.innerText = isOpen ? '[+]' : '[-]';
}


function getSecondaryRecords(site) {
    return Array.isArray(site?.secondaryRecords) ? site.secondaryRecords : [];
}

function buildDrawerSecondaryRecords(site) {
    const records = getSecondaryRecords(site);
    if (!records.length) return '';

    return `<div class="drawer-secondary-records">${records.map(record => `
        <div class="drawer-secondary-record">
            <span class="secondary-record-mode">[<span data-i18n="ui_pilgrimage">循景</span>]</span>
            <span data-i18n="ui_recorder_label">记录者: </span><span class="secondary-record-name">${record.recorder}</span>
            <span class="secondary-record-separator"> · </span>
            <span data-i18n="ui_record_date">记录时间: </span><span class="secondary-record-date">${record.recordDate}</span>
        </div>`).join('')}</div>`;
}

function buildArchiveDocSecondaryRecords(entrySites) {
    const records = [];
    const seen = new Set();

    entrySites.forEach(site => {
        getSecondaryRecords(site).forEach(record => {
            const key = `${record.recorder}|${record.mode || 'pilgrimage'}`;
            if (seen.has(key)) return;
            seen.add(key);
            records.push(record);
        });
    });

    return records.map(record => `
        <span class="doc-secondary-inline">
            <span data-i18n="ui_secondary_recorder_sep">，</span><span class="doc-secondary-recorder-name">${record.recorder}</span><span data-i18n="ui_secondary_mode_open">（</span><span data-i18n="ui_pilgrimage">循景</span><span data-i18n="ui_secondary_mode_close">）</span>
        </span>`).join('');
}

function openDrawer(site, marker) {
    if (!window.__openingMultiSiteDrawers) removeMultiSiteDrawers();
const drawer = document.getElementById('archive-drawer');

    if (marker) {

        const point =
            map.latLngToContainerPoint(
                marker.getLatLng()
            );

        const drawerWidth = 420;
        const drawerHeight = 600;

        let left =
            point.x + 40;

        let top =
            point.y - 60;


        if (
            left + drawerWidth >
            window.innerWidth
        ) {
            left =
                point.x - drawerWidth - 40;
        }


        if (
            top + drawerHeight >
            window.innerHeight
        ) {
            top =
                window.innerHeight -
                drawerHeight -
                20;
        }


        if (top < 20) {
            top = 20;
        }

        drawer.style.left =
            `${left}px`;

        drawer.style.top =
            `${top}px`;
    }
  const el =
    document.getElementById('drawer-content');

    const isGarden =
        site.type === "garden";

    const isRecord =
        site.type === "record";

    const isPlague =
        site.name === "瘟猪坝沉墟";
    const isRadio =
        site.name === "电台路焦土";
    const isYellow =
        site.name === "山葬灰脉";
    const isSiliconVein =
        site.name === "硅脉遗厂";
    const isSuspendedHomeland =
        site.name === "隐染悬里";
    const isFogHut =
        site.name === "雾蚀空庐";
    const isRustPrayerSanctuary =
        site.name === "锈祷圣堂";
    const isHiddenStairVilla =
        site.name === "隐阶空墅";
    const isWalled =
        site.name === "琉棘庭";
    const isNorth =
        site.name === "裂翼坪";
    const isRail =
        site.name === "轨畔孤构";
    const isPole =
        site.name === "残柱林";
    const isBellSilentChurch =
        site.name === "钟寂残堂";
    const isToxicTirePyre =
        site.name === "毒烬轮冢";
    const isBath =
        site.name === "池骸湾";
    const isQuarry =
        site.name === "褶层湾";
    const isMembrane =
        site.name === "釉骸拓壁";
    const isFish =
        site.name === "叠骸构阵";
    const isGloss =
        site.name === "苔网塬";
    const isBrick =
        site.name === "陆坞舰骸";
    const isMirror =
        site.name === "墟响厅";
    const isWave =
        site.name === "波蚀脊堤";
    const isSolar =
        site.name === "曜原驿";
    const isAquarium =
        site.name === "溶境遗廊";
    const isSignal =
        site.name === "荒娱敖包";
    const isRoof =
        site.name === "削岩残居";
    const isCastle =
        site.name === "彩壳堡";
    const isDock =
        site.name === "迁痕空埠";
    const isPhospho =
        site.name === "山骸窟殿";
    const isEarthwall =
        site.name === "山融灶垣";
    const isCliffGranary =
        site.name === "崖隐蚀垣";
    const isAfterglow =
        site.name === "暮辉骸殿";

    const isCompressedCourtyard =
        site.name === "褶脊胚庭";

    const isGrassChildDwelling =
        site.name === "草间稚居";


    const currentSiteName = site.name;
    const siteTags = siteTagsMapping[currentSiteName] || "";

    let treeHTML = '';

    if (isRadio) {
        treeHTML = `
  <div class="archive-tree">
  <div class="fault-node fault-root tree-folder" onclick="toggleArchiveTree(this)">
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_garden_archive">废墟园林档案</span>
</div>
<div class="tree-collapse">
 <div class="fault-line line-1">
    ╲
  </div>
  <div class="fault-line line-2">
    ╲
  </div>
<div class="tree-folder sub-folder archive-record-folder" onclick="toggleArchiveTree(this)">
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_record">遗构录</span>
</div>
<div class="tree-collapse archive-record-collapse">

  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_img_files">图像档案</span> (12)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-1')">
     ├── photo-1.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-2')">
   ├── photo-2.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-3')">
 ├── photo-3.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-4')">
   ├── photo-4.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-5')">
   ├── photo-5.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-6')">
   ├── photo-6.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-7')">
   ├── photo-7.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-8')">
   ├── photo-8.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-9')">
   ├── photo-9.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-10')">
   ├── photo-10.jpg
    </div>
 <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-11')">
   ├── photo-11.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-12')">
 └── photo-12.jpg
    </div>
  </div>


  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_map_files">测绘档案</span> (1)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-map-1')">
      &nbsp;&nbsp;&nbsp;&nbsp;└── mapping.pdf
    </div>
  </div>

<div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_txt_files">文字档案</span> (1)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-note-1')">
      └── statement.txt
    </div>
  </div>
</div>
<div class="fault-line-b">
  ╲
</div>
<div class="tree-file crack-a" onclick="openAttachmentViewer('radio-score')">
[<span data-i18n="ui_graphic_score">图形记谱</span>]
</div>
  <div class="fault-line-c">
    ╲
  </div>
  <div class="tree-file crack-b" onclick="openAttachmentViewer('radio-instrument')">
[<span data-i18n="ui_instrument_demo">乐器演示</span>]
  </div>
  <div class="fault-line-d">
    ╱
  </div>
  <div class="tree-file crack-c" onclick="openAttachmentViewer('radio-film')">
[<span data-i18n="ui_ruin_theater">废墟剧场</span>]
  </div>
</div>
</div>
`;
    }
    else if (isPlague) {
        treeHTML = `
<div class="archive-tree">
  <div class="fault-node fault-root tree-folder" onclick="toggleArchiveTree(this)">
    <span class="tree-toggle">[+]</span>
    <span data-i18n="ui_garden_archive">废墟园林档案</span>
</div>
<div class="tree-collapse">
 <div class="fault-line line-1">
    ╲
  </div>
  <div class="fault-line line-2">
    ╲
  </div>
<div class="tree-folder sub-folder archive-record-folder" onclick="toggleArchiveTree(this)">
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_record">遗构录</span>
</div>
<div class="tree-collapse archive-record-collapse">

  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_img_files">图像档案</span> (12)
</div>

  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-1')">
   ├── film-scan-1.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-2')">
  ├── film-scan-2.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-3')">
    ├── film-scan-3.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-4')">
 ├── film-scan-4.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-5')">
      ├── film-scan-5.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-6')">
      ├── film-scan-6.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-7')">
      ├── film-scan-7.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-8')">
      ├── photo-1.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-9')">
      ├── photo-2.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-10')">
      ├── photo-3.jpg
    </div>
   <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-11')">
      ├── photo-4.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-rec-12')">
      └── photo-5.jpg
    </div>
  </div>

  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_map_files">测绘档案</span> (1)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-map-1')">
      &nbsp;&nbsp;&nbsp;&nbsp;└── mapping.pdf
    </div>
  </div>

<div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_txt_files">文字档案</span> (1)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-note-1')">
       └── statement.txt
    </div>
  </div>
</div>    <div class="fault-line-b">
      ╲
    </div>
    <div class="tree-file crack-a" onclick="openAttachmentViewer('plague-scan')">
      [<span data-i18n="ui_graphic_score">图形记谱</span>]
    </div>
    <div class="fault-line-c">
      ╲
    </div>
    <div class="tree-file crack-b" onclick="openAttachmentViewer('plague-audio')">
      [<span data-i18n="ui_instrument_demo">乐器演示</span>]
    </div>
    <div class="fault-line-d">
      ╱
    </div>
    <div class="tree-file crack-c" onclick="openAttachmentViewer('plague-film')">
      [<span data-i18n="ui_ruin_theater">废墟剧场</span>]
    </div>
  </div>
</div>
`;


    }
else if (isNorth) {

        treeHTML =
            buildArchiveTree(
                'north',
                '遗构录'
            );

    }
else if (isSignal) {

    treeHTML =
        buildArchiveTree(
            'signal',
            '遗构录'
        );

}
else if (isWave) {

    treeHTML =
        buildArchiveTree(
            'wave',
            '遗构录'
        );

} else if (isBrick) {

    treeHTML =
        buildArchiveTree(
            'brick',
            '遗构录'
        );

}
else if (isQuarry) {

    treeHTML =
        buildArchiveTree(
            'quarry',
            '遗构录'
        );

}
else if (isBellSilentChurch) {

    treeHTML =
        buildArchiveTree(
            'church',
            '遗构录'
        );

}
else if (isToxicTirePyre) {

    treeHTML =
        buildArchiveTree(
            'midco',
            '遗构录'
        );

}
else if (isBath) {

    treeHTML =
        buildArchiveTree(
            'bath',
            '遗构录'
        );

}

else if (isYellow) {

    treeHTML =
        buildArchiveTree(
            'yellow',
            '遗构录'
        );

}
else if (isSiliconVein) {

    treeHTML =
        buildArchiveTree(
            'silicon',
            '遗构录'
        );

}
else if (isSuspendedHomeland) {

    treeHTML =
        buildArchiveTree(
            'suspended',
            '遗构录'
        );

}
else if (isFogHut) {

    treeHTML =
        buildArchiveTree(
            'foghut',
            '遗构录'
        );

}
else if (isRustPrayerSanctuary) {

    treeHTML =
        buildArchiveTree(
            'garychurch',
            '遗构录'
        );

}
else if (isHiddenStairVilla) {

    treeHTML =
        buildArchiveTree(
            'hiddenstair',
            '遗构录'
        );

}
else if (isFish) {

    treeHTML =
        buildArchiveTree(
            'fish',
            '遗构录'
        );

}
else if (isGloss) {

    treeHTML =
        buildArchiveTree(
            'gloss',
            '遗构录'
        );

}
else if (isPole) {

    treeHTML =
        buildArchiveTree(
            'pole',
            '遗构录'
        );

}
else if (isAquarium) {

    treeHTML =
        buildArchiveTree(
            'aquarium',
            '遗构录'
        );

    }
    else if (isRoof) {

        treeHTML =
            buildArchiveTree(
                'roof',
                '遗构录'
            );

    }
    else if (isPhospho) {

        treeHTML =
            buildArchiveTree(
                'phospho',
                '遗构录'
            );

    }
    else if (isEarthwall) {

        treeHTML =
            buildArchiveTree(
                'earthwall',
                '遗构录'
            );

    }
    else if (isCliffGranary) {

        treeHTML =
            buildArchiveTree(
                'cliffgranary',
                '遗构录'
            );

    }
    else if (isAfterglow) {

        treeHTML =
            buildArchiveTree(
                'afterglow',
                '遗构录'
            );

    }
    else if (isCompressedCourtyard) {

        treeHTML =
            buildArchiveTree(
                'compressed',
                '遗构录'
            );

    }
    else if (isGrassChildDwelling) {

        treeHTML =
            buildArchiveTree(
                'grassdwelling',
                '遗构录'
            );

    }
    else if (isCastle) {

        treeHTML =
            buildArchiveTree(
                'castle',
                '遗构录'
            );

    }
    else if (isDock) {

        treeHTML =
            buildArchiveTree(
                'dock',
                '遗构录'
            );

    }
    else if (isWalled) {

        treeHTML =
            buildArchiveTree(
                'walled',
                '遗构录'
            );

    }
    else if (isMembrane) {

        treeHTML =
            buildArchiveTree(
                'membrane',
                '遗构录'
            );

    }
    else if (isMirror) {

        treeHTML =
            buildArchiveTree(
                'mirror',
                '遗构录'
            );

    }
    else if (isSolar) {

        treeHTML =
            buildArchiveTree(
                'solar',
                '遗构录'
            );

    }
    else if (isRail) {

        treeHTML =
            buildArchiveTree(
                'rail',
                '遗构录'
            );

    }
else {

  treeHTML = `
  ...
  `;
}


    if (el) {
        el.setAttribute('data-tags', siteTags);
        el.innerHTML = `
  <div class="-section title">
    <div class="drawer-site-title" data-i18n="site_name_${site.name}">
      ${site.name}
    </div>
  </div>

  <div class="drawer-section desc">
    <div class="drawer-description">
      <div class="desc-text" data-i18n="site_desc_${site.name}" style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 6; overflow: hidden;">
        ${site.desc}
      </div>

      <div class="desc-toggle-btn" style="display: none; cursor: pointer; color: #888; margin-top: 6px; font-family: monospace; font-size: 12px; user-select: none;">[...]</div>
    </div>
  </div>

  <div class="drawer-section tree">
    ${treeHTML}
  </div>
`;


        setTimeout(() => {
            const descText = el.querySelector('.desc-text');
            const toggleBtn = el.querySelector('.desc-toggle-btn');

            if (descText && toggleBtn) {

                const checkOverflow = () => {

                    if (descText.style.webkitLineClamp !== 'unset') {
                        if (descText.scrollHeight > descText.clientHeight) {
                            toggleBtn.style.display = 'inline-block';
                        } else {
                            toggleBtn.style.display = 'none';
                        }
                    }
                };


                toggleBtn.addEventListener('click', () => {
                    const isExpanded = descText.style.webkitLineClamp === 'unset';
                    if (isExpanded) {

                        descText.style.webkitLineClamp = '6';
                        toggleBtn.innerText = '[...]';
                        checkOverflow();
                    } else {

                        descText.style.webkitLineClamp = 'unset';
                        toggleBtn.innerText = '[ ^ ]';
                    }
                });


                checkOverflow();


                const observer = new MutationObserver(() => {
                    checkOverflow();
                });


                observer.observe(descText, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
        }, 50);
    }

    drawer.classList.add('open');
    mask.classList.add('show');
    syncLanguageSubtree(drawer);
}


function closeDrawer(force = false) {
  const drawer = document.getElementById('archive-drawer');
  const mask = document.getElementById('drawer-mask');

  // During a combined-record session, outside clicks and the mask are inert.
  // Programmatic navigation may pass force=true to clear the whole session.
  if (window.__multiSiteDrawerLock && !force) return;

  removeMultiSiteDrawers();
  if (!drawer) return;

  drawer.classList.remove('open');
  if (mask) mask.classList.remove('show');
}


document.addEventListener('mousedown', (e) => {
  const step = 40;

  if (e.target.id === 'zoom-in') {
    if (pdfDoc) pdfFitMode = false;
    startHold(() => currentZoom += 0.02);
  }

  else if (e.target.id === 'zoom-out') {
    if (pdfDoc) pdfFitMode = false;
    startHold(() => {
      currentZoom -= 0.02;
      if (currentZoom < 0.2) currentZoom = 0.2;
    });
  }

  else if (e.target.id === 'move-up') {
    startHold(() => currentY += step * 0.2);
  }

  else if (e.target.id === 'move-down') {
    startHold(() => currentY -= step * 0.2);
  }

  else if (e.target.id === 'move-left') {
    startHold(() => currentX += step * 0.2);
  }

  else if (e.target.id === 'move-right') {
    startHold(() => currentX -= step * 0.2);
  }


else if (e.target.id === 'rot-x-plus') {
  startHold(() => {
    cardRotX += 1.2;

    const card =
      document.getElementById('score-card');

    CardTransform(card);
  });
}

else if (e.target.id === 'rot-x-minus') {
  startHold(() => {
    cardRotX -= 1.2;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);
  });
}

else if (e.target.id === 'rot-y-plus') {
  startHold(() => {
    cardRotY += 1.2;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);
  });
}

else if (e.target.id === 'rot-y-minus') {
  startHold(() => {
    cardRotY -= 1.2;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);
  });
}

else if (e.target.id === 'rot-z-plus') {
  startHold(() => {
    cardRotZ += 1.2;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);
  });
}

else if (e.target.id === 'rot-z-minus') {
  startHold(() => {
    cardRotZ -= 1.2;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);
  });
}
});
document.addEventListener('click', (e) => {
  if (e.target.id === 'reset') {
    resetViewer();
  }
  if (e.target.id === 'card-flip') {

  cardFlipped = !cardFlipped;

  const card =
    document.getElementById('score-card');
}
});
document.addEventListener('mouseup', stopHold);
document.addEventListener('mouseleave', stopHold);
document.addEventListener('touchend', stopHold);
document.addEventListener('touchcancel', stopHold);
function resetViewer() {
  const wrapper = document.getElementById('media-wrapper');
  if (!wrapper) return;

  const resettingPdf = Boolean(pdfDoc && document.getElementById('pdf-canvas'));
  if (resettingPdf) pdfFitMode = true;

  const startX = currentX;
  const startY = currentY;
  const startZ = currentZoom;

  const duration = 600;
  const startTime = performance.now();

  function ease(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const k = ease(t);

    currentX = startX * (1 - k);
    currentY = startY * (1 - k);
    currentZoom = startZ + (1 - startZ) * k;

    applyTransform();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else if (resettingPdf && pdfDoc) {
      // Recalculate fit against the current viewer size.
      queueRenderPage(pageNum);
    }
  }

  requestAnimationFrame(animate);
}
document.addEventListener('touchstart', (e) => {
  const step = 40;

  const target = e.target;

  if (target.id === 'zoom-in') {
    if (pdfDoc) pdfFitMode = false;
    startHold(() => currentZoom += 0.02);
  }

  else if (target.id === 'zoom-out') {
    if (pdfDoc) pdfFitMode = false;
    startHold(() => {
      currentZoom -= 0.02;
      if (currentZoom < 0.2) currentZoom = 0.2;
    });
  }

  else if (target.id === 'move-up') {
    startHold(() => currentY += step * 0.2);
  }

  else if (target.id === 'move-down') {
    startHold(() => currentY -= step * 0.2);
  }

  else if (target.id === 'move-left') {
    startHold(() => currentX += step * 0.2);
  }

  else if (target.id === 'move-right') {
    startHold(() => currentX -= step * 0.2);
  }
});

function setViewerMode(type, id) {
    const joystickHUD =
        document.getElementById('score-rotation-hud');
const chapterToggle =
  document.getElementById('chapter-toggle');

if (chapterToggle) {
  chapterToggle.style.display = 'none';
}
  const viewer =
    document.querySelector('.attachment-viewer');

  const scoreImage =
    document.getElementById('score-image');

    const scoreShadowImage =
        document.getElementById(
            "score-shadow-image"
        );
  const scoreHUD =
        document.getElementById('score-hud');

    const scoreHUDShadow =
        document.getElementById('score-hud-shadow');

  const imageHUD =
    document.querySelector('.attachment-hud');

  const videoUI =
        document.getElementById('video-ui');

    const scoreRotationHUD =
        document.getElementById('score-rotation-hud');


  viewer.classList.remove(
    'mode-image',
    'mode-video',
    'video-has-chapters',
    'folly-1',
    'folly-2',
    'score-linear',
    'score-radial'
    );

    if (joystickWrap) {
        joystickWrap.style.display = 'none';
    }


  if (imageHUD) {
    imageHUD.style.display = 'none';
  }

  if (videoUI) {
    videoUI.style.display = 'none';
  }

  if (scoreHUD) {
    scoreHUD.style.display = 'none';
    scoreHUD.classList.remove('open');
    }
 if (scoreHUDShadow) {
    scoreHUDShadow.style.display = 'none';
    scoreHUDShadow.classList.remove('locked');
}

    if (scoreRotationHUD) {
        scoreRotationHUD.style.display = 'none';
    }


    if (
        type === 'image' ||
        type === 'card' ||
        type === 'audio' ||
        type === 'text' ||
        type === 'pdf'
    ) {

        viewer.classList.add('mode-image');

        if (imageHUD) {
            imageHUD.style.display = 'flex';
        }

        if (
            type === 'card' &&
            joystickWrap
        ) {
            joystickWrap.style.display = 'flex';
        }

        return;
    }


  viewer.classList.add('mode-video');


  if (videoUI) {
    videoUI.style.display = 'flex';
  }


  if (id === 'plague-film') {

  viewer.classList.add(
    'video-has-chapters',
    'folly-1',
    'score-linear'
  );


  if (chapterToggle) {
    chapterToggle.style.display = 'flex';
  }

  if (scoreHUD) {
    scoreHUD.style.display = 'flex';
    scoreHUD.classList.add('open');
  }
      if (scoreHUDShadow) {
          scoreHUDShadow.style.display = 'flex';
      }
  scoreImage.src =
          'attachments/effluent-sedimentation/score-1.png';
      scoreShadowImage.src =
          'attachments/effluent-sedimentation/score-1.png';

  renderChapters('folly-1');

  const playhead2 =
   document.getElementById('score-playhead-2');

  const pulse =
    document.getElementById('score-pulse');

  if (playhead2) {
    playhead2.style.opacity = 0;
  }

  if (pulse) {
    pulse.style.opacity = 1;
  }
}


  else if (id === 'radio-film') {

  viewer.classList.add(
    'video-has-chapters',
    'folly-2',
    'score-radial'
  );


  if (chapterToggle) {
    chapterToggle.style.display = 'flex';
  }

  if (scoreHUD) {
    scoreHUD.style.display = 'flex';
    scoreHUD.classList.add('open');
  }

      if (scoreHUDShadow) {
          scoreHUDShadow.style.display = 'flex';
      }
  scoreImage.src =
          'attachments/aether-scorched-earth/score-2.png';
      scoreShadowImage.src =
          'attachments/aether-scorched-earth/score-2.png';

  renderChapters('folly-2');

  const playhead2 =
    document.getElementById('score-playhead-2');

  const pulse =
    document.getElementById('score-pulse');

  if (playhead2) {
    playhead2.style.opacity = 1;
  }

  if (pulse) {
    pulse.style.opacity = 0;
  }
}
}
const chapterData = {
    'folly-1': [
        { time: 0, label: '引序：滞岸之壳', key: 'ch1_0' },
        { time: 20, label: '阶段一：余存维持', key: 'ch1_1' },
        { time: 42, label: '阶段二：枯蚀应力', key: 'ch1_2' },
        { time: 56, label: '阶段三：磨损挣扎', key: 'ch1_3' },
        { time: 84, label: '阶段四：徒劳空撑', key: 'ch1_4' },
        { time: 124, label: '尾声：崩塌余响', key: 'ch1_5' }
    ],
    'folly-2': [
        { time: 0, label: '引序：并和狭间', key: 'ch2_0' },
        { time: 28, label: '阶段一：非谐构合', key: 'ch2_1' },
        { time: 67, label: '阶段二：磨盘震颤', key: 'ch2_2' },
        { time: 105, label: '阶段三：风蚀噪层', key: 'ch2_3' },
        { time: 142, label: '阶段四：嗡鸣共振', key: 'ch2_4' },
        { time: 198, label: '阶段五：以太余鸣', key: 'ch2_5' },
        { time: 231, label: '尾声：无实之基', key: 'ch2_6' }
    ]
};

function renderChapters(key) {
    const container = document.querySelector('#video-ui .video-chapters');
    if (!container) return;

    container.classList.add('open');
    container.innerHTML = '';

    chapterData[key].forEach(ch => {
        const div = document.createElement('div');
        div.classList.add('chapter-button');
        div.dataset.time = ch.time;


        div.setAttribute('data-i18n', ch.key);
        div.textContent = ch.label;

        div.onclick = () => {
            const video = document.querySelector('video');
            if (video) {
                video.currentTime = ch.time;
                video.play();
            }
        };

        container.appendChild(div);
    });

    const video = document.querySelector('video');
    if (video) {
        video.removeEventListener('timeupdate', updateActiveChapter);
        video.addEventListener('timeupdate', updateActiveChapter);
        updateActiveChapter();
    }


    syncLanguageSubtree(container);
}
function updateActiveChapter() {

    const video =
        document.querySelector('video');

    if (!video) return;

    const buttons =
        document.querySelectorAll(
            '.chapter-button'
        );

    let activeIndex = 0;

    buttons.forEach((btn, i) => {

        const t =
            Number(btn.dataset.time);

        if (
            video.currentTime >= t
        ) {

            activeIndex = i;

        }

    });

    buttons.forEach((btn, i) => {

        btn.classList.toggle(
            'active',
            i === activeIndex
        );

    });

}


function geoToSVG(lat, lng) {

    let shiftedLng = lng + 180;

    if (shiftedLng > 180) {
        shiftedLng -= 360;
    }

    let x =
        ((shiftedLng + 180) / 360 - 0.5)
        * geoScale + 0.5;

let y =
  ((lat + 90) / 180 - 0.5)
  * geoScale + 0.5;

  x =
    (x - 0.5) * worldScale + 0.5;

  y =
    (y - 0.5) * worldScale + 0.5;

  x += offsetX;
  y += offsetY;

  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));

  return [y * height, x * width];
}

function svgToGeo(y, x) {

  // Horizontal copies share one geographic longitude cycle. Always fold
  // the visual x coordinate back into the canonical 0..WORLD_WIDTH world.
  x = wrapWorldX(x) / width;
  y = y / height;

  x -= offsetX;
  y -= offsetY;

  x =
    (x - 0.5) / worldScale + 0.5;

  y =
    (y - 0.5) / worldScale + 0.5;

  x =
    (x - 0.5) / geoScale + 0.5;

  y =
    (y - 0.5) / geoScale + 0.5;

    let lng =
        ((x + 0.5) % 1) * 360 - 180;

    return {
        lat: 90 - y * 180,
        lng: lng
    };
}


function toDMS(v) {

  const a = Math.abs(v);

  const d = Math.floor(a);

  const mF =
    (a - d) * 60;

  const m =
    Math.floor(mF);

  const s =
    Math.floor((mF - m) * 60);

  return { d, m, s };
}

function formatDMS(v, type) {

  const d = toDMS(v);

  const axis =
    type === 'lat'
      ? ''
      : '';

  const dir =
    type === 'lat'
      ? (v >= 0 ? '◒' : '◓')
      : (v >= 0 ? '◑' : '◐');

  return `  ${axis}${d.d}°${d.m}′${d.s}″${dir} `;
}

function formatLat(lat) {
  return formatDMS(lat, 'lat');
}

function formatLng(lng) {
  return formatDMS(lng, 'lng');
}


// Tags
const siteTagsMapping = {

    "瘟猪坝沉墟": "ruin, sunken, water, crack, eroded, cliff, dam, seepage, chamber",
    "电台路焦土": "scorched, ash, desolate, sand, tower, plateau, wave, magnetic",


    "山葬灰脉": "factory, ash, mountain, ruin, valley",
    "硅脉遗厂": "factory, water, remains, ash, sand",
    "琉棘庭": "room, spike, desolate",
    "裂翼坪": "tree, crack, water, rail, plateau",
    "轨畔孤构": "rail, factory",
    "残柱林": "tree, column, crack, ruin",
    "钟寂残堂": "sacred, ruin, desolate, courtyard",
    "毒烬轮冢": "factory, contaminated, scorched, remains, ash",
    "池骸湾": "remains, water, bay, stair",
    "褶层湾": "bay, factory, eroded, valley",
    "隐染悬里": "relocated, seepage, dwelling, contaminated",
    "雾蚀空庐": "seepage, dwelling, eroded",
    "锈祷圣堂": "sacred, hall, vine, ruin",
    "隐阶空墅": "dwelling, wall, chamber, ruin, stair",
    "釉骸拓壁": "crack, remains, membrane",
    "叠骸构阵": "ash, factory, remains, stair",
    "苔网塬": "moss, wave, membrane, plateau",
    "陆坞舰骸": "bay, vessel, remains",
    "墟响厅": "ruin, column, room",
    "波蚀脊堤": "water, wave, eroded, shore",
    "曜原驿": "desolate, plateau, dwelling",
    "溶境遗廊": "water, corridor, room, tunnel, stair",
    "荒娱敖包": "desolate, relocated, slope, monument, placed",
    "削岩残居": "ruin, dwelling, slope, stair",
    "彩壳堡": "fort, tower, plateau",
    "迁痕空埠": "relocated, port",
    "山骸窟殿": "factory, rail, mountain, remains, tunnel, hall, stair",
    "山融灶垣": "slope, soil, eroded, wall, sacred",
    "崖隐蚀垣": "soil, mountain, slope, wall, eroded, cliff, chamber, sacred",
    "暮辉骸殿": "rail, fort, remains, hall",
    "褶脊胚庭": "courtyard, wall, tree, compressed, interstitial",
    "草间稚居": "placed, grass, interstitial, dwelling"
};

function createSiteMarker(site) {

    const tags = siteTagsMapping[site.name] || "";

    const customIcon = L.divIcon({
        className: 'custom-map-marker',

        html: `<div class="site-character" data-tag="${tags}">${site.character || ''}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

}


// Sites
const sites = [

    {
        name: "瘟猪坝沉墟",
        desc: "人工湖的蓄水持续渗入地下，水沿裂隙缓慢渗入旧地基与溶洞，在低洼地势孕育出一片沉墟。污水与地下水在此缓慢交换，整片废墟终于坏死为一滩沉默的黑水，如同建筑始终无法结痂的伤口。",
        lat: 30.454417,
        lng: 104.047667,
        archiveDate: "2025.04",

        type: "garden"
    },
    {
        name: "电台路焦土",
        desc: "短波天线与工业遗构曾共同构成一片震荡的电磁场域。厂房虽已夷为平地，那些曾高速撕裂空气的无线电噪声却仿佛仍残留于此。场域没有随建筑消失，而是沉积在拉线铁塔切割出的土地、锈蚀钢缆的张力，以及焦土的空间秩序之中。",
        lat: 31.225833,
        lng: 121.618333,
        archiveDate: "2026.03",

        type: "garden"
    },
   {
       name: "山葬灰脉",
       desc: "废弃多年的旧水泥厂，部分建筑已经坍毁，其余危楼仍等待着下一次崩塌。风化、渗水与重力持续完成这场漫长的山葬，植物沿着砖缝与裂隙缓慢生长，如同撬开沉积岩般，一寸寸拆解着这座工厂，直至它重新回归山体。",
    lat: 32.04174,
    lng: 119.83912,
    archiveDate: "2017.08",
    type: "record"
    },
    {
        name: "硅脉遗厂",
        desc: "川杨河畔的旧筒仓与混凝土构筑物，曾属于由川沙冶炼厂转型而来的浦东水泥厂。2018年骑行经过时，工厂已经沉默，周围不断扩张的张江研发园区却正向它逼近。一种奇异的材料谱系在这里接续：水泥依靠硅酸钙的水化凝固城市，半导体则将高纯硅刻写成晶圆。硅没有离开张江，只从混凝土的硅酸盐化学迁入芯片的晶格。后来旧厂被纳入科技园更新，工业外壳、结构与新的建筑体量并置；于是“保存”本身也变得暧昧——遗构究竟被延续，还是被加工成新产业的布景？",
        lat: 31.1936472,
        lng: 121.6131444,
        archiveDate: "2018.05",
        visitMode: "discovery",
        type: "record"
    },
{
    name: "琉棘庭",
    desc: "巨大的荒土残构之间，一块被围墙封存的空地孤立其中。它没有房屋，也没有窗户，只留下一道狭窄的出口，仿佛从建成之初便已被遗忘。墙顶嵌满的玻璃碎片原为防越而设，而当墙体逐渐风化崩裂，它们仍透明、锋利，继续守护着一片始终无人问津的空地。",
        lat: 31.2270054,
            lng: 121.6191375,
                archiveDate: "2018.07",
                    type: "record"
},

    {
        name: "裂翼坪",
        desc: "湖中的机场停用后，整条跑道被挖裂，重新恢复为草原地貌。引擎的轰鸣早已散去，只剩崩裂的跑道残片散落于边缘。裂缝之间，一棵形似单翼的树木抱着跑道残片生长，仿佛替这片再也无法起飞的土地，保留了最后一片翅膀。",
        lat: 41.860278,
        lng: -87.606111,
        archiveDate: "2021.08",

        type: "record"
    },
    {
        name: "轨畔孤构",
        desc: "这里曾是蒸汽机车的维修工场。工场消失后，铁轨仍将列车送往远方，而留在原地的混凝土遗构，渐渐成为铁路旁一座无人光顾的工业废丘。",
        lat: 32.5525070,
        lng: -94.3644399,
        archiveDate: "2022.06",
        type: "record"
    },
{
    name: "残柱林",
    desc: "	这片树木来自近百年前城市规划时留下的树苗。数十年后，巨树因自身重量折裂，枝干劈开了石柱建筑的屋顶。这场坍塌并非偶然，而是从树苗落地那天便开始累积。当人们惊讶于屋顶被巨树劈开时，才发现真正被遗忘的，或许一直都是那棵不断长大的树。",
            lat: 41.77502,
                lng: -87.56954,
                    archiveDate: "2022.10",
                        type: "record"
},
{
    name: "钟寂残堂",
    desc: "芝加哥郊外的一座废弃教堂，坐落在市中心以南的黑人区，被人为破坏的铁栅栏成为了唯一的入口。破旧的院子里杂草丛生，还有些许流浪汉生活过的痕迹。\n\n教堂已成废墟，失去了钟声和彩绘玻璃，也失去了信徒相互握手祷告。没有了生机的教堂依旧耸立在郊外，残缺的建筑又在等待什么奇迹呢？",
    lat: 41.78746317602539,
    lng: -87.63330678898134,
    archiveDate: "2022.11",
    recordDate: "2022.11.30",
    recorder: "Sky Chen",
    visitMode: "discovery",
    type: "record"
},
{
    name: "池骸湾",
    desc: "人们曾以巨大的工程将海水引入建筑，把海洋驯服成一座浴场；如今，海重新将建筑收回体内，建筑开始遵循潮汐，而非人们。潮水持续侵蚀池壁与地基，碎石与绿藻逐渐覆满池底。海没有淹没建筑，只是让海岸重新长进了建筑里。",
            lat: 37.78060,
                lng: -122.51370,
                    archiveDate: "2023.08",
                        type: "record"
},
{
    name: "毒烬轮冢",
    desc: "这里曾是 MIDCO I 危险废弃物处理厂：一片在 20 世纪 70 年代用来储存、回收和堆放工业化学废料、废旧油桶、工业轮胎与重金属渣滓的场所。1979 年，一场毁灭性大火引爆了成千上万个装满毒废料的油桶，火焰烧毁了大部分厂房，也把污染压入了土壤与地下水之中。此后它被列入 Superfund 清理名单，数万吨有毒物质被移除，场地被彻底封禁废弃，只留下灾难迟迟不散的后果。\n\n如今这里最醒目的，是堆积如丘的废弃卡车轮胎，以及后来持续被偷倒进来的旧船、建筑垃圾和电子废料。它像一座同时容纳两次遗弃的场：第一次是工业体系在焚毁自身之后的退出，第二次是城市继续把无法消化的废物偷偷抛回此处。偏偏在拍摄这片垃圾场时，相机的对焦机构也恰好失灵，直到洗出胶卷才发现所有影像都失了焦。仿佛相机的机魂与这片充满毁灭的场所产生了共振；又或者，在毒烬与废轮之间，确有某种诅咒拒绝被清楚看见。",
    lat: 41.619424715904785,
    lng: -87.39637364538571,
    archiveDate: "2023.10",
    recordDate: "2023.10.20",
    recorder: "Sky Chen",
    visitMode: "discovery",
    type: "record"
},
{
    name: "褶层湾",
    desc: "数万年前，冰川留下砂砾层；百年间，人类又以采矿、铁路与工业反覆雕刻这片土地。当一切功能依序消失后，唯有一列列菱形混凝土构造仍裸露于地景之中，如同文明在地层间留下的一道剖面。",
            lat: 47.1808,
                lng: -122.5537,
                    archiveDate: "2023.12",
                        type: "record"
    },
    {
        name: "隐染悬里",
        desc: "这里的毁灭几乎没有形状。房屋、道路、商店与生活用品仍清晰地留在原处，没有被洪水掩埋，也没有在一场彻底的灾难中消失；真正迫使人离开的，是一种无法被肉眼辨认、却足以伤害生命的放射性污染。它将熟悉的日常悬置在透明之中，使人能够清楚看见自己的故乡，却无法再像过去那样进入、居住和使用它。这里没有时间胶囊式的浪漫，也不是一场瞬间完成的自然灾害，而是技术失控之后留下的一场漫长善后：物件没有消失，却逐渐失去与人的关系；故乡没有消失，却在人仍然看得见的时候，一点点失去原本的日常生活。",
        lat: 37.4543556,
        lng: 141.0370611,
        archiveDate: "2024.01",
        recorder: "党骁",
        visitMode: "discovery",
        type: "record"
    },
    {
        name: "雾蚀空庐",
        desc: "小屋的窗户已经破裂，雾从缺口穿入室内，掠过那些仍留在原处的物件。墙体仍维持着房间的边界，但内外之间早已失去阻隔；潮湿的空气反复进入，使霉斑、锈蚀与剥落不断加速。人离开后，这间小屋没有在某个瞬间毁坏，而是在一次次雾的穿行中继续老去，仿佛外部的天气已经进入建筑内部，替时间接管了这里。",
        lat: 37.4518000,
        lng: 141.0117028,
        archiveDate: "2024.01",
        recordDate: "2024.01.27",
        recorder: "党骁",
        visitMode: "discovery",
        type: "record"
    },
        {
        name: "锈祷圣堂",
        desc: "美国铁锈带的一座教堂，诞生于 Gary 钢铁工业最炽盛的年代。1926 年建成时，它曾是美国中西部最大的卫理公会教堂，可容纳三千人。高耸的拱顶、成排的长椅与巨大的采光窗，使它更像一座献给工业黄金时代的圣殿。\n\n当钢厂停火、人口流失、城市衰退，这座圣堂也随之空下来。藤蔓沿着窗花与砖缝攀爬，雨水和尘埃缓慢接管了祈祷厅。钟声没有回来，礼拜也早已结束；唯有建筑仍以巨大的体量站在 Gary 的废墟背景里，像一具曾为工业文明举行弥撒、如今只剩回声的空壳。",
        lat: 41.6014,
        lng: -87.3374,
        archiveDate: "2024.02",
        recordDate: "2024.02.11",
        recorder: "Sky Chen",
        visitMode: "discovery",
        type: "record"
    },
{
        name: "釉骸拓壁",
        desc: "工程塑料布紧密包覆着残墙，连磁砖裂纹与墙面的起伏都被完整转印。它并未修复废墟，而是在拆除之前，替建筑留下最后一次完整的形体，如同覆盖于遗构表面的一层拓膜。",
        lat: 30.7023424,
        lng: 104.0714623,
        archiveDate: "2024.04",
        type: "record"
    },
{
    name: "叠骸构阵",
    desc: "工厂依丘陵展开，起伏的地势、高低错落的楼层、交错的框架与各异的朝向，共同编织出一套复杂的空间。工厂运作时，墙体、功能与路牌维持着这套秩序，也掩盖了其中难以被看穿的构造。直到墙面剥落、楼板坍塌，建筑只剩交错的骨架与阴影，那座始终潜藏其中的迷宫才缓缓现身。",
            lat: 30.4416944,
                lng: 104.0347500,
                    archiveDate: "2024.05",
                        type: "record"
    },
    {
        name: "苔网塬",
        desc: "巨大的绿色工程纱网覆盖着建筑残骸，如同一层蔓延于工业遗址上的工业苔藓。混凝土碎块托起网面，树木从钢筋与碎石间缓缓将它顶起，使整片地表微微起伏。原本覆盖废墟的工程材料，在漫长风化中逐渐承接泥土、孕育植物，最终成为建筑消失后的第一层生命。",
        lat: 30.66457,
        lng: 104.15798,
        archiveDate: "2024.05",
        type: "record"
    },
{
    name: "陆坞舰骸",
    desc: "这里或许是距离海洋最遥远的地方之一，却矗立着一艘航空母舰。它从未航行，也从未真正停泊，只是在池塘中央维系着一场关于海洋的想像。当池水干涸、金属蒙皮逐渐拆除，航母开始显露混凝土与钢筋的本体。海洋的幻象随之层层剥落，只留下池塘中央一座混凝土遗构。",
  lat: 30.5854444,
  lng: 104.0365278,
  archiveDate: "2024.06",
  secondaryRecords: [
      { visitMode: 'pilgrimage', recorder: '王一川', recordDate: '2025.12.23', attachmentIds: ['brick-011', 'brick-012'] }
  ],
  type: "record"
},

    {
        name: "墟响厅",
        desc: "厚重的屋顶、夸张的柱列与倾斜墙面共同塑造出一组为展示而存在的建筑。建筑内部充满因外部造型而产生的剩余空间。玻璃展柜依然镶嵌在斜墙之中，只是柜内早已空无一物。镜面于是开始反射彼此，让空间不断展示自己的空壳。",
        lat: 30.5886698,
        lng: 104.0341997,
        archiveDate: "2024.06",
        type: "record"
    },
    {
        name: "波蚀脊堤",
        desc: "波浪般起伏的烂尾楼只剩混凝土骨架裸露于海风之中，海风穿过层层空洞，整座建筑发出如骸骨般低沉的呜鸣。海岸上的人造物，似乎都拥有共同的宿命。消波块因抵挡海浪而耗尽自身，这座建筑则因失去建造的目的，长年风化于盐雾与海风之中。两者都在走向毁灭，一者因使命而消耗，一者因失去使命而风化。最荒诞的是，消波块至今仍默默消耗着自己，只为守护一座早已失去存在理由的建筑。",
                lat: 30.8227055,
                    lng: 121.5305626,
                        archiveDate: "2024.07",
                        secondaryRecords: [
                            { visitMode: 'pilgrimage', recorder: '陈佳翔', recordDate: '2026.07.30', attachmentIds: ['wave-13', 'wave-14', 'wave-15', 'wave-16'] }
                        ],
                            type: "record"
    },

    {
        name: "曜原驿",
        desc: "四千五百亩光伏阵列覆盖了原本的土地，如同另一种收割阳光的农田。曾经服务道路的驿站被留在其中，却失去了道路，也失去了旅人，只剩无尽的光伏板向地平线延展。它不再等待任何人，只与每日升起的太阳共同维持着这片新的地景。",
        lat: 38.83587,
        lng: 117.55678,
        archiveDate: "2024.08",
        type: "record"
    },
    {
        name: "溶境遗廊",
        desc: "地下商业街与隧道荒废多年后，逐渐受到雨水与地下渗流侵蚀。封闭的店铺中，人体模特、镜面与陈列仍停留于原位，替代早已消失的人群，而裂纹、霉斑与锈迹则持续覆写其上。隧道穹顶仍保留着美人鱼雕塑与海洋壁画，维持着一场人工海洋的幻象。随着地下水持续涌入，这片幻象最终被真正的水重新占据。",
        lat: 30.6602710,
        lng: 104.0676944,
        archiveDate: "2024.08",
        type: "record"
    },
    {
        name: "荒娱敖包",
        desc: "在这片难以离开的寒冬荒原上，人们或许期待信标中出现地图、电话，或任何能与外界建立联系的工具。然而留下的却是成堆的游戏机台。它们被堆叠成一座电子敖包，像一份错误抵达的礼物，也像一次许错了愿，在一无所有之地留下了最无用、也荒诞到令人绝望的存在。",
                lat: 41.72871,
                    lng: 110.51296,
                        archiveDate: "2024.12",

                            type: "record"
    },
    {
        name: "彩壳堡",
        desc: "农田之上矗立着一座未完成的城堡。混凝土与钢筋仍裸露于外，外墙却早已涂满鲜艳的色彩。围墙的砖块陆续脱落，藏在墙体里的粗糙承重柱一根根显露出来，童话的外壳开始退回到结构本身。似乎后来来到这里涂鸦的人也继承了城堡的浪漫：墙上出现了长出腿脚的动物和形状怪异的小人，原本属于花纹与装饰的位置逐渐被杂乱的线条占据，想象中的皇室也被这些无名角色取代。童话比建筑更早完成，也比建筑更早荒废；如今，一群由涂鸦临时续写的居民正在占据这座空壳。",
                lat: 40.2368611,
                    lng: 116.1637500,
                        archiveDate: "2025.01",
                            recorder: "王一川",
                            type: "record"
    },
        {
            name: "削岩残居",
            desc: "整座山体被开采成层层阶地，散落其上的屋舍如同被收割过的作物，只剩残墙停留于岩层之间。当矿石被运走后，它们仍留在原地，与裸露的山体一同缓慢风化。",
        lat: 30.425167,
        lng: 104.096167,
        archiveDate: "2025.02",
            type: "record"
    },

    {
        name: "隐阶空墅",
        desc: "一座位于偏僻处、已经查封的别墅，门却仍敞开着，室内几乎被清空。站在院门外，最先看见的是那段异常的楼梯：房屋主体似乎已经完成，楼梯却像原本并不存在，整栋建筑一度显得像一座没有二层的房子。直到墙体被剥开，梯段才从其中显露出来，仿佛建筑曾把自己的垂直通道藏进墙里。废弃之后，剥落的墙面反而替房屋完成了一次意外的剖切，使原本被表面隐藏的结构重新暴露。",
        lat: 40.0366934,
        lng: 116.4889296,
        archiveDate: "2025.11",
        recordDate: "2025.11.21",
        recorder: "王一川",
        visitMode: "discovery",
        type: "record"
    },

    {
        name: "暮辉骸殿",
        desc: "这座未完成的巨型建筑紧邻铁路矗立。幕墙与装饰从未抵达，梁柱、楼板与核心结构因此长期裸露，在夕照下构成一座异常完整的混凝土骨架。纤细的柱网、开阔的楼层、重复的结构尺度与纵深，使它在失去建筑功能之前，先获得了一种近似巨型雕塑的庄严。它并未真正经历从繁荣到衰败的过程，而是在尚未完成时便被遗弃：一种从未实现的辉煌，只剩下结构自身继续维持它的轮廓。铁路成为它唯一持续运作的观众席，而所有观看都发生在高速掠过的车窗之中。",
        lat: 22.69915,
        lng: 114.12291,
        archiveDate: "2026.02",
        type: "record"
    },

    {
        name: "迁痕空埠",
        desc: "沿江旧码头逐渐退出城市，「拆」与「未签字」记录着这场搬迁。拆除后，生活痕迹仍停留于原处：盆栽沿裂缝生长，线束仍牵引着坠落的墙板，高处的椅子与「请留意您的贵重物品」标语，依然停留在早已没有人的日常里。人离开后，残骸、植物与生活的痕迹，仍共同维持着这片岸线。",
        lat: 30.4325100,
        lng: 104.0406300,
        archiveDate: "2026.06",
        type: "record"
    },
    {
        name: "山骸窟殿",
        desc: "这座沿山而建的磷矿工厂，因层层堆叠的体量与巨大尺度，被称为「小布达拉宫」。远望时，它像一座矗立于山间的宫殿；走近后，映入眼前的却是输送带与厂房。神圣的形态与工业的功能在此重叠，山体最终留下了一座为矿石而建、也随矿石一同废弃的宫殿。",
                lat: 34.5275555,
                    lng: 119.1429722,
                        archiveDate: "2026.07",
        type: "record"
    },
    {
        name: "山融灶垣",
        desc: "据说这片夯土残墙曾是一座寺院的厨房。风雨沿着夯层逐年削去墙体，棱角变钝，泥土与碎石重新显露。这些墙原本从山土中一层层夯筑而成，如今又一层层剥落回到土地，远看时已逐渐分不清是建筑正在消失，还是山体正在将它收回。",
        lat: 31.6644440,
        lng: 99.6794440,
        archiveDate: "2026.08",
        recorder: "王一川",
        type: "record"
    },
    {
        name: "崖隐蚀垣",
        desc: "这处夯土残构高悬于坡崖之上。据当地的说法，它大约已有三、四百年历史，过去曾是高僧居住与闭关修行的地方。沿坡再走一段，曾经还有一座寺院，如今已被夷平；这一带过去也分布着许多供人闭关的空间。墙面一列列孔洞仍保留着木梁曾经穿入的骨位。木构早已朽尽，只剩厚重土墙嵌在山体边缘，任风雨沿梁孔与裂缝持续掏空，像一处仍被山体保存着的修行遗址。",
        lat: 31.6727778,
        lng: 99.6750000,
        archiveDate: "2026.08",
        recorder: "王一川",
        type: "record"
    }
    ,{
        name: "褶脊胚庭",
        desc: "不规则石块砌成的石垣托起一座未完成的对称混凝土建筑。两翼在中央以廊桥连接，但连接处并未保持平直：结构向外鼓出，像两块尚未硬化的水泥胚体在相互挤压时，将中间的桥廊一并揉皱、顶起。站在斜下方仰望，很难判断这块突起究竟是在向上隆起，还是正从建筑表面向外挤出。挤压似乎也延伸到了两翼之间的庭院；狭窄空间里的树木与杂草比周围更加密集，仿佛左右两堵墙不断收拢，将植被像流体一样铲进这条人工形成的谷地。",
        lat: 34.6349414,
        lng: 135.5036092,
        archiveDate: "2026.08",
        recorder: "Suni",
        visitMode: "pilgrimage",
        type: "record"
    },
    {
        name: "草间稚居",
        desc: "我住在这块空地附近，经常从这里经过。原有的住宅被拆除后，地块空置了很久，杂草一点点从边缘向中央蔓延。一场雨后，我忽然发现草地中央多出了一栋小屋：红色屋顶、白色墙面、粉色小门，应该是孩子玩过家家留下的塑料屋。它没有像废弃物那样倒在角落，反而异常端正地立在空地中央，正面朝外，像是认真选择了这里作为自己的地址。杂草越长越高，小屋反而越来越像一栋真正的建筑。红色屋顶从高耸的杂草间顶出来，使这件轻薄的塑料玩具意外显出一种近乎厚重的存在感。我举起相机时，附近那只经常见到的猫正好从草丛里走出来。它看了看我，又看了看小屋，像是在打量这个刚刚搬进自己领地的新邻居。",
        lat: 35.7342317,
        lng: 139.7346722,
        archiveDate: "2026.09",
        recordDate: "2026.09.05",
        type: "record"
    }
];


if (typeof sites !== 'undefined' && sites.length > 0) {
    sites.forEach(site => {
        createSiteMarker(site);
    });
}


const recordSites = sites.filter(
    site => site.type === 'record'
);

let currentRecordIndex = 0;


function openDrawerByIndex(i) {
    const item = markers[i];
    if (!item) return;


    if (typeof window.hideCompass === 'function') {
        window.hideCompass();


        document.querySelectorAll('.compass-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    openDrawer(
        item.site,
        item.marker
    );
}


function createIcon(type = "garden") {

    const size =
        type === "record"
            ? 6
            : 10;

    return L.divIcon({

        className:
            type === "record"
                ? "ruin-marker ruin-marker-record"
                : "ruin-marker",

        html: `
<div class="${
            type === "record"
                ? "record-dot"
                : "garden-dot"
            }">
</div>
`,

        iconSize: [size, size],

        iconAnchor: [size / 2, size / 2]

    });

}
let lockedMarker = null;
let currentHoverMarker = null;
let compassTargetInside = false;


function flashMarkerCrosshair(marker) {
    if (!marker) return;
    const el = marker.getElement();
    if (!el) return;

    const crosshair = document.createElement('div');
    crosshair.className = 'record-crosshair';
    el.appendChild(crosshair);

    setTimeout(() => {
        crosshair.remove();
    }, 500);
}


let currentCompassMarker = null;
let currentCompassMarkerData = null;

function getNearestMarkerCopy(markerData, referenceX = map.getCenter().lng) {
    if (!markerData?.copies?.length) return markerData?.markerFallback || null;

    let nearest = markerData.copies[0];
    let nearestDistance = Math.abs(nearest.getLatLng().lng - referenceX);

    for (let i = 1; i < markerData.copies.length; i++) {
        const candidate = markerData.copies[i];
        const distance = Math.abs(candidate.getLatLng().lng - referenceX);
        if (distance < nearestDistance) {
            nearest = candidate;
            nearestDistance = distance;
        }
    }

    return nearest;
}

function closeMarkerDataPopups(markerData) {
    markerData?.copies?.forEach(marker => marker.closePopup());
}

function closeAllSitePopups() {
    markers.forEach(closeMarkerDataPopups);
}

function resolveCurrentCompassMarker() {
    if (currentCompassMarkerData) {
        const nearest = getNearestMarkerCopy(currentCompassMarkerData);
        if (nearest) currentCompassMarker = nearest;
    }
    return currentCompassMarker;
}

sites.forEach((site, index) => {

    const basePos = geoToSVG(site.lat, site.lng);
    const markerData = {
        site,
        index,
        basePos,
        copies: []
    };

    // Existing code can continue to use markerData.marker, but it now resolves
    // to whichever visual copy is closest to the current wrapped world.
    Object.defineProperty(markerData, 'marker', {
        enumerable: true,
        get() {
            return getNearestMarkerCopy(markerData);
        }
    });

    const popupHtml = `
    <div class="archive-popup">
      <div class="archive-content">
        <div class="archive-name" data-i18n="site_name_${site.name}">${site.name}</div>
        <div class="archive-coords">
          ${site.lat >= 0 ? formatLat(-site.lat) : formatLat(Math.abs(site.lat))}
          &nbsp;&nbsp;
          ${formatLng(site.lng)}
        </div>
        <div class="archive-date"><span data-i18n="ui_archive_date">归档: </span>${site.archiveDate}</div>
        <div class="archive-drawer-link" onclick="window.openDrawerByIndex(${index}, this)">
          <span class="label" data-i18n="${site.type === "garden" ? "ui_garden" : "ui_record"}">${site.type === "garden" ? "废墟园林" : "遗构录"}</span>
        </div>
      </div>
    </div>
  `;

    WORLD_COPY_OFFSETS.forEach((copyOffset) => {
        const pos = [basePos[0], basePos[1] + copyOffset * WORLD_WIDTH];
        const marker = L.marker(pos, {
            icon: createIcon(site.type)
        }).addTo(map);

        marker._ruinMarkerData = markerData;
        marker._ruinWorldCopyOffset = copyOffset;

        marker.bindPopup(popupHtml, {
            closeButton: false,
            autoClose: false,
            className: 'map-archive-popup',
            offset: [26, -26]
        });

        marker.on('mouseover', () => {
            if (currentHoverMarker && currentHoverMarker !== marker && !window.__multiSitePinnedMarkers?.has(currentHoverMarker)) {
                currentHoverMarker.closePopup();
            }
            marker.openPopup();
            currentHoverMarker = marker;
        });

        marker.on('mouseout', () => {
            setTimeout(() => {
                if (window.__multiSitePinnedMarkers?.has(marker)) return;
                if (lockedMarker === marker) return;
                if (currentHoverMarker === marker) {
                    marker.closePopup();
                    currentHoverMarker = null;
                }
            }, 120);
        });

        marker.on('click', (e) => {
            if (lockedMarker && lockedMarker !== marker && !window.__multiSitePinnedMarkers?.has(lockedMarker)) {
                lockedMarker.closePopup();
            }
            lockedMarker = marker;
            marker.openPopup();
            currentHoverMarker = marker;

            L.DomEvent.stopPropagation(e);
        });

        markerData.copies.push(marker);
    });

    markers.push(markerData);
});

function updateRecordNav() {
    const site = recordSites[currentRecordIndex];
    const recordLinkEl = document.getElementById('record-link');
    if (!recordLinkEl) return;


    const compassOverlay = document.getElementById('compass-overlay');
    const isOpen = compassOverlay && compassOverlay.classList.contains('show');

    if (isOpen) {

        recordLinkEl.classList.add('compass-active');
        recordLinkEl.innerHTML = `<span style="font-weight: 300; margin-right: 12px; display: inline-block;">➢</span>[ <span data-i18n="ui_record">遗构录</span> | <span data-i18n="site_name_${site.name}">${site.name}</span> ]`;
    } else {

        recordLinkEl.classList.remove('compass-active');
        recordLinkEl.innerHTML = `[ <span data-i18n="ui_record">遗构录</span> | <span data-i18n="site_name_${site.name}">${site.name}</span> ]`;
    }


    syncLanguageSubtree(recordLinkEl);
}


function getRecordMarker(siteName) {
    const item = markers.find(
        m => m.site.name === siteName
    );
    return item || null;
}


// Compass
let targetArrowAngle = 0;
let currentRingAngle = 45;
let currentRingScale = 1;
let currentRingMorph = 0;


let cachedRingWidth = 0;
let cachedRingHeight = 0;


function updateCompassRingCache() {
    const ring = document.querySelector('.compass-ring');
    if (ring) {
        cachedRingWidth = ring.offsetWidth;
        cachedRingHeight = ring.offsetHeight;
    }
}


window.addEventListener('resize', updateCompassRingCache);

document.addEventListener('DOMContentLoaded', updateCompassRingCache);


const DAMPING_FRICTION = 0.035;
let compassPhysicsRaf = null;


const compassPhysicsEls = {
    overlay: document.getElementById('compass-overlay'),
    ring: document.querySelector('.compass-ring'),
    asterisk: document.querySelector('.compass-asterisk'),
    pointer: document.querySelector('.compass-pointer')
};
let lastCompassPhysicsPaint = 0;
const COMPASS_PHYSICS_INTERVAL = 1000 / 30;

function ensureCompassPhysicsRunning() {
    if (compassPhysicsRaf === null && compassPhysicsEls.overlay?.classList.contains('show')) {
        compassPhysicsRaf = requestAnimationFrame(animateCompassPhysics);
    }
}

function animateCompassPhysics(now = performance.now()) {

    const overlayElement = compassPhysicsEls.overlay;
    if (!overlayElement || !overlayElement.classList.contains('show')) {
        compassPhysicsRaf = null;
        return;
    }

    if (now - lastCompassPhysicsPaint < COMPASS_PHYSICS_INTERVAL) {
        compassPhysicsRaf = requestAnimationFrame(animateCompassPhysics);
        return;
    }
    lastCompassPhysicsPaint = now;

    let targetRing = targetArrowAngle + 90;


    let diff = targetRing - currentRingAngle;
    diff = ((diff + 540) % 360) - 180;
    currentRingAngle += diff * DAMPING_FRICTION;


    const ring = compassPhysicsEls.ring;
    let scale = 1;
    const captureRadius = 140;
    const minScale = 0.23;

    if (
        window.compassDistance !== undefined &&
        window.compassDistance < captureRadius
    ) {
        const t = window.compassDistance / captureRadius;
        const targetScale = minScale + (1 - minScale) * t;
        currentRingScale += (targetScale - currentRingScale) * 0.06;


        const targetMorph = 1 - t;
        currentRingMorph += (targetMorph - currentRingMorph) * 0.06;
    }
    else {
        currentRingScale += (1 - currentRingScale) * 0.05;
        currentRingMorph += (0 - currentRingMorph) * 0.05;
    }

    if (ring) {
        const morphWidth = 1 - currentRingMorph * 0.65;
        const morphHeight = 1;


        const safeWidth = cachedRingWidth || 300;
        const safeHeight = cachedRingHeight || 150;

        const scaledA = safeWidth * currentRingScale * morphWidth / 2;
        const scaledB = safeHeight * currentRingScale * morphHeight / 2;

        const theta = targetArrowAngle * (Math.PI / 180);
        const alpha = currentRingAngle * (Math.PI / 180);
        const phi = theta - alpha;

        let radius = (scaledA * scaledB) / Math.sqrt(
            Math.pow(scaledB * Math.cos(phi), 2) +
            Math.pow(scaledA * Math.sin(phi), 2)
        );

        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);


        const pointer = compassPhysicsEls.pointer;
        if (pointer) {
            const arrowRotation = compassTargetInside ? targetArrowAngle + 270 : targetArrowAngle + 90;
            pointer.style.transform = `translate(${x}px, ${y}px) rotate(${arrowRotation}deg)`;

            if (ring) {
                const ringMorphWidth = 1 - currentRingMorph * 0.5;
                const ringMorphHeight = 1;
                const lineWeight = 1 + currentRingMorph * 7;

                ring.style.transform = `
                    rotate(${currentRingAngle}deg)
                    scaleX(${currentRingScale * ringMorphWidth})
                    scaleY(${currentRingScale * ringMorphHeight})
                `;
                ring.style.borderWidth = `${lineWeight}px`;
            }
        }
    }


    if (overlayElement && overlayElement.classList.contains('show') && typeof currentCompassMarker !== 'undefined' && resolveCurrentCompassMarker()) {

        const compassMarker = resolveCurrentCompassMarker();
        if (compassMarker && !compassMarker.isPopupOpen()) {
            const dist = window.compassDistance;
            const radius = window.compassRingRadius || 140;
            const triggerThreshold = radius * 0.04;

            if (dist !== undefined && dist < triggerThreshold) {
                if (!window.compassLockTimer) {
                    window.compassLockTimer = setTimeout(() => {
                        const targetMarker = resolveCurrentCompassMarker();
                        if (targetMarker && !targetMarker.isPopupOpen()) {
                            targetMarker.openPopup();
                            lockedMarker = targetMarker;

                            map.flyTo(targetMarker.getLatLng(), 5.5, {
                                animate: true,
                                duration: 2.8,
                                easeLinearity: 0.1
                            });
                        }
                        window.compassLockTimer = null;
                    }, 500);
                }
            } else {
                if (window.compassLockTimer) {
                    clearTimeout(window.compassLockTimer);
                    window.compassLockTimer = null;
                }
            }
        }
    } else {
        if (window.compassLockTimer) {
            clearTimeout(window.compassLockTimer);
            window.compassLockTimer = null;
        }
    }


    // Once the physical easing has converged there is no reason to burn an
    // animation frame forever. Map movement / target changes restart it.
    const angleSettled = Math.abs(diff) < 0.08;
    const scaleTarget = (window.compassDistance !== undefined && window.compassDistance < captureRadius)
        ? minScale + (1 - minScale) * (window.compassDistance / captureRadius)
        : 1;
    const morphTarget = (window.compassDistance !== undefined && window.compassDistance < captureRadius)
        ? 1 - (window.compassDistance / captureRadius)
        : 0;
    const settled = angleSettled &&
        Math.abs(currentRingScale - scaleTarget) < 0.002 &&
        Math.abs(currentRingMorph - morphTarget) < 0.002;

    if (settled) {
        compassPhysicsRaf = null;
    } else {
        compassPhysicsRaf = requestAnimationFrame(animateCompassPhysics);
    }
}


function getCompassElements() {
    return {
        overlay: document.getElementById('compass-overlay'),
        pointer: document.getElementById('compass-pointer'),
        arrow: document.querySelector('.compass-arrow')
    };
}


function getSafeMap() {
    if (typeof map !== 'undefined') return map;
    if (typeof window.map !== 'undefined') return window.map;
    return null;
}

let compassDirectionRaf = null;
function scheduleCompassDirectionUpdate() {
    if (compassDirectionRaf !== null) return;
    compassDirectionRaf = requestAnimationFrame(() => {
        compassDirectionRaf = null;
        window.updateCompassDirection?.();
    });
}

window.showCompass = function () {
    const { overlay } = getCompassElements();
    if (!overlay) return;

    if (typeof bounds !== 'undefined') {
        map.flyToBounds(getWrappedWorldBounds(), {
            animate: true,
            duration: 2.5,
            easeLinearity: 0.1
        });
    }

    const mainFrame = document.getElementById('main-viewport-frame');
    const compassContainer = document.querySelector('.compass-container');
    if (mainFrame && compassContainer) {
        const frameRect = mainFrame.getBoundingClientRect();
        const isPortrait = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;

        if (isPortrait) {
            compassX = window.innerWidth / 2;
            compassY = window.innerHeight / 2;
        } else {
            compassX = (frameRect.left + frameRect.width / 2) + 150;
            compassY = (frameRect.top + frameRect.height / 2) + 40;
        }

        compassContainer.style.left = `${compassX}px`;
        compassContainer.style.top = `${compassY}px`;
        compassContainer.style.transform = `translate(-50%, -50%)`;
    }

    overlay.classList.remove('hidden');
    overlay.offsetWidth;
    overlay.classList.add('show');

    lastCompassPhysicsPaint = 0;
    ensureCompassPhysicsRunning();

    updateRecordNav();


    updateCompassRingCache();

    window.updateCompassDirection();

    const safeMap = getSafeMap();
    if (safeMap) {
        safeMap.on('move viewreset zoomanim', scheduleCompassDirectionUpdate);
    }
};

window.hideCompass = function () {
    const { overlay } = getCompassElements();
    if (!overlay) return;

    overlay.classList.remove('show');
    updateRecordNav();

    if (compassPhysicsRaf !== null) {
        cancelAnimationFrame(compassPhysicsRaf);
        compassPhysicsRaf = null;
    }

    const safeMap = getSafeMap();
    if (safeMap) {
        safeMap.off('move viewreset zoomanim', scheduleCompassDirectionUpdate);
    }

    setTimeout(() => {
        if (!overlay.classList.contains('show')) {
            overlay.classList.add('hidden');
        }
    }, 400);
};

window.setCompassTarget = function (marker) {
    if (!marker) return;
    currentCompassMarkerData = marker._ruinMarkerData || null;
    currentCompassMarker = currentCompassMarkerData
        ? getNearestMarkerCopy(currentCompassMarkerData)
        : marker;

    const { overlay } = getCompassElements();
    if (overlay && overlay.classList.contains('show')) {
        window.updateCompassDirection();
    }
};

window.updateCompassDirection = function () {
    const { overlay, arrow } = getCompassElements();
    const compassRing = document.querySelector('.compass-ring');
    const safeMap = getSafeMap();
    const targetMarker = resolveCurrentCompassMarker();

    if (!targetMarker || !overlay || !overlay.classList.contains('show') || !safeMap || !compassRing || !arrow) {
        return;
    }


    const compassCenterX = compassX;
    const compassCenterY = compassY;

    const markerLatLng = targetMarker.getLatLng();
    const markerContainerPoint = safeMap.latLngToContainerPoint(markerLatLng);

    const deltaX = markerContainerPoint.x - compassCenterX;
    const deltaY = markerContainerPoint.y - compassCenterY;
    const distanceToTarget = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    window.compassDistance = distanceToTarget;


    const ringRadius = Math.min(cachedRingWidth || 300, cachedRingHeight || 150) * 0.5;

    window.compassRingRadius = ringRadius;
    compassTargetInside = distanceToTarget < ringRadius;

    const globalAngleRad = Math.atan2(deltaY, deltaX);
    targetArrowAngle = globalAngleRad * 180 / Math.PI;

    ensureCompassPhysicsRunning();
};


function handleRecordSwitch() {
    updateRecordNav();
    const markerData = getRecordMarker(recordSites[currentRecordIndex].name);
    if (markerData && markerData.marker) {
        flashMarkerCrosshair(markerData.marker);

        if (window.setCompassTarget) {
            window.setCompassTarget(markerData.marker);
        }
    }
}

document.getElementById('record-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    currentRecordIndex--;
    if (currentRecordIndex < 0) {
        currentRecordIndex = recordSites.length - 1;
    }
    handleRecordSwitch();
});

document.getElementById('record-next').addEventListener('click', (e) => {
    e.stopPropagation();
    currentRecordIndex++;
    if (currentRecordIndex >= recordSites.length) {
        currentRecordIndex = 0;
    }
    handleRecordSwitch();
});


const recordLink = document.getElementById('record-link');
if (recordLink) {
    recordLink.addEventListener('click', (e) => {
        e.stopPropagation();
        const compassOverlay = document.getElementById('compass-overlay');
        if (!compassOverlay) return;

        if (compassOverlay.classList.contains('show')) {
            window.hideCompass();
        } else {

            const markerData = getRecordMarker(recordSites[currentRecordIndex].name);
            if (markerData && markerData.marker && window.setCompassTarget) {
                window.setCompassTarget(markerData.marker);
            }
            window.showCompass();
        }
    });


    recordLink.addEventListener('mouseenter', () => {
        const target = getRecordMarker(recordSites[currentRecordIndex].name);
        if (target && target.marker) showMarkerCrosshair(target.marker);
    });
    recordLink.addEventListener('mouseleave', () => {
        const target = getRecordMarker(recordSites[currentRecordIndex].name);
        if (target && target.marker) hideMarkerCrosshair(target.marker);
    });
}

function showMarkerCrosshair(marker) {
    const el = marker.getElement();
    if (!el) return;
    let crosshair = el.querySelector('.record-crosshair');
    if (crosshair) return;
    crosshair = document.createElement('div');
    crosshair.className = 'record-crosshair';
    el.appendChild(crosshair);
}

function hideMarkerCrosshair(marker) {
    const el = marker.getElement();
    if (!el) return;
    const crosshair = el.querySelector('.record-crosshair');
    if (crosshair) {
        crosshair.classList.add('fade-out');
        setTimeout(() => { crosshair.remove(); }, 500);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const compassOverlay = document.getElementById('compass-overlay');
    if (compassOverlay) {

    }
});

function showNavHint(siteName) {
    const navHint = document.getElementById('map-nav-hint');
    const targetNameSpan = document.getElementById('nav-target-name');


    const dirHint = document.getElementById('map-dir-hint');
    if (dirHint) dirHint.style.opacity = '0';

    if (navHint && targetNameSpan) {
        const currentLang = window.currentLang || 'zh';
        const vault = languageVault[currentLang] || languageVault['zh'];
        const translatedName = vault[`site_name_${siteName}`] || siteName;

        targetNameSpan.innerText = translatedName;
        targetNameSpan.setAttribute('data-i18n', `site_name_${siteName}`);
        navHint.classList.add('show');
    }
}


function hideNavHint() {
    const navHint = document.getElementById('map-nav-hint');
    if (navHint) {
        navHint.classList.remove('show');
    }


    const dirHint = document.getElementById('map-dir-hint');
    if (dirHint) {
        dirHint.style.opacity = '0';
    }
}


function translateSiteName(site) {
    const lang = window.currentLang || 'zh';
    const vault = languageVault[lang] || languageVault.zh || {};
    return vault[`site_name_${site.name}`] || site.name;
}

function showNavHintForSites(groupSites) {
    const navHint = document.getElementById('map-nav-hint');
    const targetNameSpan = document.getElementById('nav-target-name');
    const dirHint = document.getElementById('map-dir-hint');
    if (dirHint) dirHint.style.opacity = '0';
    if (!navHint || !targetNameSpan) return;

    targetNameSpan.removeAttribute('data-i18n');
    targetNameSpan.innerText = groupSites.map(translateSiteName).join('  /  ');
    navHint.classList.add('show');
}

function autoExpandDrawerTreeIn(root) {
    if (!root) return;
    const content = root.matches?.('#drawer-content, .multi-drawer-content')
        ? root
        : root.querySelector?.('#drawer-content, .multi-drawer-content');
    if (!content) return;

    const wanderRoot = content.querySelector('.wander-root');
    if (wanderRoot && wanderRoot.nextElementSibling && getComputedStyle(wanderRoot.nextElementSibling).display === 'none') {
        toggleArchiveTree(wanderRoot);
        return;
    }

    const faultRoot = content.querySelector('.fault-root');
    if (faultRoot && faultRoot.nextElementSibling && getComputedStyle(faultRoot.nextElementSibling).display === 'none') {
        toggleArchiveTree(faultRoot);
        setTimeout(() => {
            const recordFolder = content.querySelector('.archive-record-folder');
            if (recordFolder && recordFolder.nextElementSibling && getComputedStyle(recordFolder.nextElementSibling).display === 'none') {
                toggleArchiveTree(recordFolder);
            }
        }, 1500);
    }
}

function setupGroupDrawerDescription(root) {
    const descText = root?.querySelector?.('.desc-text');
    const toggleBtn = root?.querySelector?.('.desc-toggle-btn');
    if (!descText || !toggleBtn || toggleBtn.dataset.groupBound === '1') return;
    toggleBtn.dataset.groupBound = '1';

    // Combined drawers are deliberately more compact than normal single-site
    // drawers. Keep four lines visible until the visitor explicitly expands it.
    descText.style.webkitLineClamp = '4';

    const checkOverflow = () => {
        if (descText.style.webkitLineClamp !== 'unset') {
            toggleBtn.style.display = descText.scrollHeight > descText.clientHeight ? 'inline-block' : 'none';
        }
    };
    toggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const expanded = descText.style.webkitLineClamp === 'unset';
        descText.style.webkitLineClamp = expanded ? '4' : 'unset';
        toggleBtn.innerText = expanded ? '[...]' : '[ ^ ]';
        if (expanded) checkOverflow();
    });
    requestAnimationFrame(checkOverflow);
}

// A combined-record navigation session pins several popups + drawers at once.
// Only the drawer's own × may dismiss that pair. Normal single-site drawers keep
// their original outside-click behavior.
window.__multiSiteDrawerLock = false;
window.__multiSitePinnedMarkers = new Set();
const multiSiteDrawerMarkerMap = new Map();

function setMultiSitePopupPinned(marker, pinned) {
    if (!marker) return;
    const popup = marker.getPopup?.();
    if (pinned) {
        window.__multiSitePinnedMarkers.add(marker);
        if (popup) {
            popup.options.autoClose = false;
            popup.options.closeOnClick = false;
            popup.options.autoPan = false;
        }
        marker.openPopup();
    } else {
        window.__multiSitePinnedMarkers.delete(marker);
        if (popup) {
            delete popup.options.closeOnClick;
            popup.options.autoPan = true;
            const popupEl = popup.getElement?.();
            if (popupEl) {
                popupEl.style.marginLeft = '';
                popupEl.style.marginTop = '';
                popupEl.style.translate = '';
                popupEl.classList.remove('multi-site-popup-shifted');
            }
        }
    }
}

function rectOverlapArea(a, b) {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
}

function rectFromPopupShift(baseRect, dx, dy) {
    return {
        left: baseRect.left + dx,
        top: baseRect.top + dy,
        right: baseRect.right + dx,
        bottom: baseRect.bottom + dy,
        width: baseRect.width,
        height: baseRect.height
    };
}

function expandCollisionRect(rect, padding = 0) {
    return {
        left: rect.left - padding,
        top: rect.top - padding,
        right: rect.right + padding,
        bottom: rect.bottom + padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
    };
}

function getVisiblePopupRect(popupEl) {
    if (!popupEl) return null;
    // The Leaflet popup container can be wider/taller than the actual visible
    // archive label. Collision should use the pixels the visitor actually sees.
    const visible = popupEl.querySelector('.archive-popup, .archive-content, .leaflet-popup-content-wrapper');
    const rect = (visible || popupEl).getBoundingClientRect();
    if (!rect || !Number.isFinite(rect.left)) return null;
    return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
    };
}

function clampPopupShift(baseRect, dx, dy) {
    const margin = 24;
    let nextDx = dx;
    let nextDy = dy;
    let rect = rectFromPopupShift(baseRect, nextDx, nextDy);

    if (rect.left < margin) nextDx += margin - rect.left;
    if (rect.right > window.innerWidth - margin) nextDx -= rect.right - (window.innerWidth - margin);
    if (rect.top < margin) nextDy += margin - rect.top;
    if (rect.bottom > window.innerHeight - margin) nextDy -= rect.bottom - (window.innerHeight - margin);

    return { dx: nextDx, dy: nextDy };
}

// Robust combined-popup layout ------------------------------------------------
// Leaflet owns `transform` on .leaflet-popup and may rewrite it whenever the map
// settles. v28 used margins, which meant the collision solver could measure one
// rectangle and Leaflet could subsequently place a slightly different one.
// The CSS `translate` longhand composes independently with Leaflet's transform,
// so our displacement survives Leaflet's own position updates.
function layoutCombinedSitePopups(markersToLayout) {
    const markerList = markersToLayout.filter(Boolean);
    const placed = [];
    const visualGap = 46; // real breathing room, not merely zero-overlap

    // Always derive candidates from the unshifted Leaflet position.
    markerList.forEach(marker => {
        const popupEl = marker.getPopup?.()?.getElement?.();
        if (!popupEl) return;
        popupEl.style.marginLeft = '';
        popupEl.style.marginTop = '';
        popupEl.style.translate = '0px 0px';
        popupEl.classList.add('multi-site-popup-shifted');
    });

    // Flush the reset once before measuring. Reading the rect forces layout and
    // gives us Leaflet's current canonical popup position.
    markerList.forEach(marker => marker.getPopup?.()?.getElement?.()?.getBoundingClientRect?.());

    markerList.forEach((marker, index) => {
        const popupEl = marker.getPopup?.()?.getElement?.();
        if (!popupEl) return;

        const baseRect = getVisiblePopupRect(popupEl);
        if (!baseRect) return;
        const w = Math.max(baseRect.width, 105);
        const h = Math.max(baseRect.height, 62);
        const sx = w + visualGap;
        const sy = h + visualGap;

        // Search in expanding rings. The alternating order deliberately sends
        // adjacent popups into opposite quadrants, so two nearby markers do not
        // read as one combined label even when their rectangles technically fit.
        const side = index % 2 === 0 ? -1 : 1;
        const vertical = Math.floor(index / 2) % 2 === 0 ? -1 : 1;
        const candidates = [];

        if (index === 0) candidates.push({ dx: 0, dy: 0 });

        [1, 1.35, 1.75, 2.2, 2.75].forEach(ring => {
            candidates.push(
                { dx: side * sx * ring, dy: vertical * sy * .35 * ring },
                { dx: side * sx * .72 * ring, dy: vertical * sy * ring },
                { dx: side * sx * ring, dy: 0 },
                { dx: 0, dy: vertical * sy * ring },
                { dx: -side * sx * ring, dy: -vertical * sy * .35 * ring },
                { dx: -side * sx * .72 * ring, dy: -vertical * sy * ring }
            );
        });

        let best = null;
        let bestScore = Infinity;
        for (const raw of candidates) {
            const shift = clampPopupShift(baseRect, raw.dx, raw.dy);
            const rect = rectFromPopupShift(baseRect, shift.dx, shift.dy);
            const padded = expandCollisionRect(rect, visualGap / 2);

            let overlap = 0;
            placed.forEach(other => {
                overlap += rectOverlapArea(padded, other.padded);
            });

            // Screen-edge pressure keeps popups from feeling crammed against the
            // frame even when no literal overlap occurs.
            const edgeClearance = Math.min(
                rect.left,
                window.innerWidth - rect.right,
                rect.top,
                window.innerHeight - rect.bottom
            );
            const edgePenalty = edgeClearance < 42 ? (42 - edgeClearance) * 800 : 0;
            const distance = Math.hypot(shift.dx, shift.dy);
            const score = overlap * 1000000 + edgePenalty + distance;

            if (score < bestScore) {
                bestScore = score;
                best = { shift, rect, padded };
            }
            if (overlap === 0 && edgePenalty === 0 && distance <= Math.hypot(sx * 1.4, sy * 1.4)) {
                // A clean nearby slot is already good enough; no need to search
                // the entire outer ring and risk choosing a visually remote spot.
                best = { shift, rect, padded };
                break;
            }
        }

        if (best) {
            popupEl.style.translate = `${best.shift.dx}px ${best.shift.dy}px`;
            // Measure the *actual* rendered result rather than trusting the model
            // rectangle. This catches font/layout differences across browsers.
            const actual = getVisiblePopupRect(popupEl) || best.rect;
            placed.push({
                rect: actual,
                padded: expandCollisionRect(actual, visualGap / 2)
            });
        }
    });

    return placed.map(item => item.rect);
}

function clampDrawerPosition(left, top, width, height) {
    const margin = 18;
    return {
        left: Math.max(margin, Math.min(window.innerWidth - width - margin, left)),
        top: Math.max(margin, Math.min(window.innerHeight - height - margin, top))
    };
}

function layoutCombinedSiteDrawers(entries) {
    if (!entries.length) return;
    const gap = 28;
    const popupRects = entries
        .map(entry => entry.marker?.getPopup?.()?.getElement?.()?.getBoundingClientRect?.())
        .filter(Boolean);
    const placed = [];

    entries.forEach((entry, index) => {
        const drawer = entry.drawer;
        const popupEl = entry.marker?.getPopup?.()?.getElement?.();
        const popupRect = popupEl?.getBoundingClientRect?.() || popupRects[index] || {
            left: window.innerWidth * .5 - 80,
            right: window.innerWidth * .5 + 80,
            top: window.innerHeight * .45 - 60,
            bottom: window.innerHeight * .45 + 60,
            width: 160,
            height: 120
        };
        const drawerRect = drawer.getBoundingClientRect();
        const dw = drawerRect.width || 300;
        const dh = drawerRect.height || 360;

        const candidates = [
            { left: popupRect.right + gap, top: popupRect.top - 8 },
            { left: popupRect.left - dw - gap, top: popupRect.top - 8 },
            { left: popupRect.right + gap, top: popupRect.bottom - dh + 8 },
            { left: popupRect.left - dw - gap, top: popupRect.bottom - dh + 8 },
            { left: popupRect.left, top: popupRect.bottom + gap },
            { left: popupRect.left, top: popupRect.top - dh - gap },
            { left: 22, top: 90 + index * (dh + 22) },
            { left: window.innerWidth - dw - 22, top: 90 + index * (dh + 22) }
        ];

        let best = null;
        let bestScore = Infinity;
        for (const raw of candidates) {
            const pos = clampDrawerPosition(raw.left, raw.top, dw, dh);
            const rect = {
                left: pos.left,
                top: pos.top,
                right: pos.left + dw,
                bottom: pos.top + dh
            };
            let overlap = 0;
            popupRects.forEach(r => { overlap += rectOverlapArea(rect, r); });
            placed.forEach(r => { overlap += rectOverlapArea(rect, r); });
            const dx = (rect.left + dw / 2) - (popupRect.left + popupRect.width / 2);
            const dy = (rect.top + dh / 2) - (popupRect.top + popupRect.height / 2);
            const distance = Math.hypot(dx, dy);
            const score = overlap * 10000 + distance;
            if (score < bestScore) {
                bestScore = score;
                best = { pos, rect };
            }
        }

        if (best) {
            drawer.style.left = `${best.pos.left}px`;
            drawer.style.top = `${best.pos.top}px`;
            placed.push(best.rect);
        }
    });
}


let combinedRelayoutRaf = 0;

function relayoutActiveCombinedUI() {
    const entries = (window.__activeCombinedDrawerEntries || []).filter(entry =>
        entry?.drawer?.isConnected && entry?.marker
    );
    if (entries.length < 2 || !window.__multiSiteDrawerLock) return;

    const popupMarkers = entries.map(entry => entry.marker).filter(Boolean);
    layoutCombinedSitePopups(popupMarkers);
    requestAnimationFrame(() => layoutCombinedSiteDrawers(entries));
}

function scheduleCombinedRelayout() {
    if (!window.__multiSiteDrawerLock || combinedRelayoutRaf) return;
    combinedRelayoutRaf = requestAnimationFrame(() => {
        combinedRelayoutRaf = 0;
        relayoutActiveCombinedUI();
    });
}

// If the visitor pans/zooms the map while a combined record is pinned, Leaflet
// moves the anchor points. Re-solve after the motion settles instead of letting
// the two popup labels drift back together.
map.on('moveend zoomend', scheduleCombinedRelayout);
window.addEventListener('resize', scheduleCombinedRelayout);

function updateMultiSiteMask() {
    const anyOpen = document.querySelector('#archive-drawer.multi-site-base.open, .multi-site-drawer.open');
    window.__multiSiteDrawerLock = Boolean(anyOpen);
    document.getElementById('drawer-mask')?.classList.toggle('show', Boolean(anyOpen));
}

function restoreBaseDrawerCloseButton() {
    const baseDrawer = document.getElementById('archive-drawer');
    const closeBtn = baseDrawer?.querySelector('.drawer-close');
    if (!closeBtn) return;
    closeBtn.onclick = (event) => {
        event?.stopPropagation?.();
        closeDrawer();
    };
}

function closeCombinedSiteDrawer(drawerEl) {
    if (!drawerEl) return;
    const marker = multiSiteDrawerMarkerMap.get(drawerEl);
    if (marker) {
        marker.closePopup();
        setMultiSitePopupPinned(marker, false);
    }
    multiSiteDrawerMarkerMap.delete(drawerEl);

    if (drawerEl.id === 'archive-drawer') {
        drawerEl.classList.remove('open', 'multi-site-base');
    } else {
        drawerEl.remove();
    }

    updateMultiSiteMask();
    if (!window.__multiSiteDrawerLock) {
        window.__activeCombinedDrawerEntries = [];
        restoreBaseDrawerCloseButton();
    }
}

function removeMultiSiteDrawers({ closePopups = true } = {}) {
    const base = document.getElementById('archive-drawer');
    const all = [base, ...document.querySelectorAll('.multi-site-drawer')].filter(Boolean);
    all.forEach(drawerEl => {
        const marker = multiSiteDrawerMarkerMap.get(drawerEl);
        if (closePopups && marker) marker.closePopup();
        if (marker) setMultiSitePopupPinned(marker, false);
        multiSiteDrawerMarkerMap.delete(drawerEl);
        if (drawerEl.id !== 'archive-drawer') drawerEl.remove();
    });
    base?.classList.remove('multi-site-base');
    window.__multiSitePinnedMarkers.clear();
    window.__multiSiteDrawerLock = false;
    window.__activeCombinedDrawerEntries = [];
    restoreBaseDrawerCloseButton();
}

function openMultiSiteDrawers(groupSites) {
    removeMultiSiteDrawers();
    const baseDrawer = document.getElementById('archive-drawer');
    const baseContent = document.getElementById('drawer-content');
    if (!baseDrawer || !baseContent || !groupSites.length) return;

    const snapshots = [];
    window.__openingMultiSiteDrawers = true;
    try {
        groupSites.forEach(site => {
            const siteIndex = sites.indexOf(site);
            const markerData = markers[siteIndex];
            const marker = getNearestMarkerCopy(markerData);
            openDrawer(site, marker);
            snapshots.push({
                site,
                siteIndex,
                marker,
                html: baseContent.innerHTML
            });
        });

        const first = snapshots[0];
        openDrawer(first.site, first.marker);
        baseDrawer.classList.add('multi-site-base', 'open');
        baseDrawer.dataset.multiSiteIndex = String(first.siteIndex);
        setupGroupDrawerDescription(baseDrawer);
        autoExpandDrawerTreeIn(baseDrawer);

        const drawerEntries = [{ drawer: baseDrawer, marker: first.marker, site: first.site }];
        setMultiSitePopupPinned(first.marker, true);
        multiSiteDrawerMarkerMap.set(baseDrawer, first.marker);

        const baseClose = baseDrawer.querySelector('.drawer-close');
        if (baseClose) {
            baseClose.removeAttribute('onclick');
            baseClose.onclick = event => {
                event.stopPropagation();
                closeCombinedSiteDrawer(baseDrawer);
            };
        }

        snapshots.slice(1).forEach((snap, offsetIndex) => {
            const clone = baseDrawer.cloneNode(true);
            clone.id = `archive-drawer-multi-${offsetIndex + 1}`;
            clone.classList.remove('multi-site-base');
            clone.classList.add('multi-site-drawer', 'open');
            clone.dataset.multiSiteIndex = String(snap.siteIndex);

            const content = clone.querySelector('#drawer-content');
            if (content) {
                content.removeAttribute('id');
                content.classList.add('multi-drawer-content');
                content.innerHTML = snap.html;
            }

            const closeBtn = clone.querySelector('.drawer-close');
            if (closeBtn) {
                closeBtn.removeAttribute('onclick');
                closeBtn.onclick = event => {
                    event.stopPropagation();
                    closeCombinedSiteDrawer(clone);
                };
            }

            clone.style.zIndex = String(10020 + offsetIndex);
            document.body.appendChild(clone);
            setupGroupDrawerDescription(clone);
            autoExpandDrawerTreeIn(clone);
            setMultiSitePopupPinned(snap.marker, true);
            multiSiteDrawerMarkerMap.set(clone, snap.marker);
            drawerEntries.push({ drawer: clone, marker: snap.marker, site: snap.site });
            if (window.bringDrawerToFront) window.bringDrawerToFront(clone);
        });

        window.__multiSiteDrawerLock = true;
        document.getElementById('drawer-mask')?.classList.add('show');

        window.__activeCombinedDrawerEntries = drawerEntries;

        const relayoutCombined = () => relayoutActiveCombinedUI();

        // Leaflet, the cyberpunk language transition and the auto-expanded tree
        // can all change measured sizes shortly after opening. Reflow during that
        // settling window, then keep a later safety pass for slower font/layout
        // changes on Safari/Chrome.
        requestAnimationFrame(() => requestAnimationFrame(relayoutCombined));
        setTimeout(relayoutCombined, 260);
        setTimeout(relayoutCombined, 760);
        setTimeout(relayoutCombined, 1500);
    } finally {
        window.__openingMultiSiteDrawers = false;
    }

    syncLanguageSubtree(document.getElementById('archive-drawer'));
    document.querySelectorAll('.multi-site-drawer').forEach(syncLanguageSubtree);
}

function getWrappedGroupPositions(groupSites) {
    const referenceX = map.getCenter().lng;
    return groupSites.map(site => {
        const base = geoToSVG(site.lat, site.lng);
        return L.latLng(base[0], nearestWrappedX(base[1], referenceX));
    });
}

function flyToSiteGroup(groupSites, fromIndexDrawer = false) {
    const members = groupSites.filter(Boolean);
    if (!members.length) return;
    if (members.length === 1) {
        const singleIndex = sites.indexOf(members[0]);
        flyToSite(members[0], singleIndex, fromIndexDrawer);
        return;
    }

    closeDrawer(true);
    closeAllSitePopups();
    activeSiteIndex = sites.indexOf(members[0]);
    showNavHintForSites(members);

    const stacks = document.querySelectorAll('.file-stack');
    const positions = getWrappedGroupPositions(members);
    const bounds = L.latLngBounds(positions);
    const center = bounds.getCenter();

    const finishFlyTo = () => {
        if (fromIndexDrawer) {
            stacks.forEach(stack => {
                stack.classList.remove('sink-down');
                stack.classList.remove('elevated-z');
            });
        }
        hideNavHint();
    };

    map.flyTo(center, 3, { duration: 4, easeLinearity: 0.2 });

    setTimeout(() => {
        map.flyToBounds(bounds.pad(0.55), {
            duration: 4,
            easeLinearity: 0.2,
            maxZoom: 5,
            padding: [70, 70]
        });

        map.once('moveend', () => {
            const openedMarkers = members.map(site => {
                const markerData = markers[sites.indexOf(site)];
                return getNearestMarkerCopy(markerData);
            }).filter(Boolean);

            openedMarkers.forEach((marker, i) => {
                setMultiSitePopupPinned(marker, true);
                setTimeout(() => flashMarkerCrosshair(marker), i * 110);
            });

            const dirHint = document.getElementById('map-dir-hint');
            if (dirHint) dirHint.style.opacity = '1';

            setTimeout(() => {
                openMultiSiteDrawers(members);
                finishFlyTo();
            }, 1200);
        });
    }, 3500);

    updateMarkerState();
}

function flyToSite(site, index, fromIndexDrawer = false) {
    if (typeof closeDrawer === 'function') {
        closeDrawer(true);
    }
    activeSiteIndex = index;

    const canonicalPos = geoToSVG(site.lat, site.lng);
    const pos = getNearestWrappedLatLng(canonicalPos);
    closeAllSitePopups();


    showNavHint(site.name);

    const stacks = document.querySelectorAll('.file-stack');


    const finishFlyTo = () => {

        if (fromIndexDrawer) {
            stacks.forEach(s => {
                s.classList.remove('sink-down');
                s.classList.remove('elevated-z');
            });
        }

        hideNavHint();
    };

    map.flyTo(pos, 3, {
        duration: 4,
        easeLinearity: 0.2
    });


    setTimeout(() => {
        map.flyTo(pos, 5, {
            duration: 4,
            easeLinearity: 0.2
        });

        map.once('moveend', () => {
            markers[index].marker.openPopup();


            const dirHint = document.getElementById('map-dir-hint');
            if (dirHint) dirHint.style.opacity = '1';

            setTimeout(() => {
                if (typeof window.openDrawerByIndex === 'function') {
                    window.openDrawerByIndex(index);
                } else if (typeof openDrawerByIndex === 'function') {
                    openDrawerByIndex(index);
                }

                setTimeout(() => {
                    const drawerContent = document.getElementById('drawer-content');
                    if (!drawerContent) {
                        finishFlyTo();
                        return;
                    }

                    let flowFinished = false;
                    const wanderRoot = drawerContent.querySelector('.wander-root');
                    if (wanderRoot && wanderRoot.nextElementSibling && wanderRoot.nextElementSibling.style.display !== 'block') {
                        toggleArchiveTree(wanderRoot);
                        flowFinished = true;
                        finishFlyTo();
                    }

                    const faultRoot = drawerContent.querySelector('.fault-root');
                    if (faultRoot && faultRoot.nextElementSibling && faultRoot.nextElementSibling.style.display !== 'block') {
                        toggleArchiveTree(faultRoot);

                        setTimeout(() => {
                            const recordFolder = drawerContent.querySelector('.archive-record-folder');
                            if (recordFolder && recordFolder.nextElementSibling && recordFolder.nextElementSibling.style.display !== 'block') {
                                toggleArchiveTree(recordFolder);
                            }
                            finishFlyTo();
                        }, 1500);
                        flowFinished = true;
                    }

                    if (!flowFinished) {
                        finishFlyTo();
                    }

                }, 1500);

            }, 3500);
        });
    }, 3500);

    updateMarkerState();
}


let markerOpacityRaf = null;

function updateMarkerOpacity() {
    if (markerOpacityRaf) return;

    markerOpacityRaf = requestAnimationFrame(() => {
        const currentZoom = map.getZoom();
        const triggerZoom = 0;
        const maxZoom = 3;

        let targetOpacity = 1.0;

        if (currentZoom > triggerZoom) {
            const ratio = (currentZoom - triggerZoom) / (maxZoom - triggerZoom);
            targetOpacity = 1.0 - (ratio * 0.7);
        }

        targetOpacity = Math.max(0.3, targetOpacity);


        const markerPane = map.getPane('markerPane');
        if (markerPane) {
            const nextOpacity = String(targetOpacity);
            if (markerPane.style.opacity !== nextOpacity) {
                markerPane.style.opacity = nextOpacity;
            }
        }

        markerOpacityRaf = null;
    });
}

map.on('zoom', updateMarkerOpacity);


updateMarkerOpacity();


function updateMarkerState() {
    markers.forEach(m => {
        const isActive = m.index === activeSiteIndex;

        m.copies.forEach(marker => {
            const el = marker.getElement();
            marker.setZIndexOffset(isActive ? 1000 : 0);
            if (el) {
                el.classList.toggle('active-marker', isActive);
            }
        });
    });
}


let coordsRaf = null;
let lastCoordsPaint = 0;
let pendingCoordsLatLng = null;
const coordsElement = document.getElementById('coords');

map.on('mousemove', e => {
    pendingCoordsLatLng = e.latlng;
    if (coordsRaf) return;

    coordsRaf = requestAnimationFrame((now) => {
        coordsRaf = null;
        if (!pendingCoordsLatLng || !coordsElement || now - lastCoordsPaint < 45) return;
        lastCoordsPaint = now;
        const geo = svgToGeo(pendingCoordsLatLng.lat, pendingCoordsLatLng.lng);
        const nextText = `${formatLat(geo.lat)}   ${formatLng(geo.lng)}`;
        if (coordsElement.textContent !== nextText) coordsElement.textContent = nextText;
    });
});


document.addEventListener('click', (e) => {
    if (typeof isClosingViewer !== 'undefined' && isClosingViewer) return;

    const archiveDrawer = document.getElementById('archive-drawer');
    const viewer = document.querySelector('.attachment-viewer');


    if (viewer && viewer.classList.contains('open')) return;


    if (archiveDrawer && archiveDrawer.classList.contains('open')) {
        if (window.__multiSiteDrawerLock) return;
        const clickedInsideArchiveDrawer = e.target.closest('#archive-drawer');
        const clickedArchiveTrigger = e.target.closest('.archive-drawer-link');
        if (clickedInsideArchiveDrawer) return;
        if (clickedArchiveTrigger) return;
        if (typeof closeDrawer === 'function') closeDrawer();
    }

});
let holdInterval = null;

function startHold(action) {
    stopHold();
    holdInterval = setInterval(() => {
        action();
        applyTransform();
    }, 50);
}

function stopHold() {
    if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
    }
}

function resetViewerState() {
    currentZoom = defaultViewerState.zoom;
    currentX = defaultViewerState.x;
    currentY = defaultViewerState.y;
    cardRotX = defaultViewerState.rotX;
    cardRotY = defaultViewerState.rotY;
    cardRotZ = defaultViewerState.rotZ;
    cardFlipped = defaultViewerState.flipped;

    applyTransform();


    const video = currentVideo;
    if (video) {
        video.pause();
        video.currentTime = 0;
    }


    const playhead = document.getElementById('score-playhead');
    const playhead2 = document.getElementById('score-playhead-2');
    const pulse = document.getElementById('score-pulse');

    if (playhead) playhead.style.transform = '';
    if (playhead2) playhead2.style.transform = '';
    if (pulse) pulse.style.opacity = 0;
}

function applyTransform() {
    const wrapper = document.getElementById('media-wrapper');
    if (!wrapper) return;

    const cardSpace = wrapper.querySelector('.score-card-space');
    const media = wrapper.querySelector('img, video');


    const transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
    wrapper.style.transform = transform;


    if (cardSpace) {
        const card = document.getElementById('score-card');
        if (card) {
            card.style.transform = `
        rotateX(${cardRotX}deg)
        rotateY(${cardRotY + (cardFlipped ? 180 : 0)}deg)
        rotateZ(${cardRotZ}deg)
      `;
        }
        return;
    }


    if (media) {
        media.style.transform = 'none';
    }
}


const joystickWrap = document.getElementById('joystick-wrap');
const knob = document.getElementById('joystick-knob');
let joyActive = false;
const joystick = document.getElementById('joystick');
const joyLight = document.getElementById('joystick-light');


let joyCenterX = 0;
let joyCenterY = 0;
let joyRaf = null;

if (joystick && knob) {

    joystick.addEventListener('pointerdown', () => {
        joyActive = true;


        const rect = joystick.getBoundingClientRect();
        joyCenterX = rect.left + rect.width / 2;
        joyCenterY = rect.top + rect.height / 2;

        if (joyLight) {
            joyLight.style.transition = 'opacity 0.2s ease, transform 0s linear';
        }
    });


    document.addEventListener('pointerup', () => {
        joyActive = false;
        if (joyRaf) {
            cancelAnimationFrame(joyRaf);
            joyRaf = null;
        }

        knob.style.transform = `translate(-50%, -50%)`;

        if (joyLight) {
            joyLight.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            joyLight.style.transform = `translate(0px, 0px)`;
            joyLight.style.opacity = 0;
        }
    });


    document.addEventListener('pointermove', (e) => {
        if (!joyActive) return;


        if (joyRaf) return;

        joyRaf = requestAnimationFrame(() => {

            let dx = e.clientX - joyCenterX;
            let dy = e.clientY - joyCenterY;
            const max = 32;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > max) {
                dx = (dx / dist) * max;
                dy = (dy / dist) * max;
            }

            knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

            if (joyLight) {
                const intensity = dist / max;
                const lightDx = dx * 1.3;
                const lightDy = dy * 1.3;

                joyLight.style.transform = `translate(${lightDx}px, ${lightDy}px)`;
                joyLight.style.opacity = Math.min(intensity * 1.6, 1);
            }

            cardRotY += dx * 0.18;
            cardRotX -= dy * 0.18;
            const card = document.getElementById('score-card');
            if (typeof updateCardTransform === 'function') updateCardTransform(card);

            joyRaf = null;
        });
    });
}


document.addEventListener('click', (e) => {
    const card = document.getElementById('score-card');
    if (!card) return;

    if (e.target.id === 'score-flip') {
        cardFlipped = !cardFlipped;
        updateCardTransform(card);
    }
    if (e.target.id === 'rot-left') {
        cardRotY -= 12;
        updateCardTransform(card);
    }
    if (e.target.id === 'rot-right') {
        cardRotY += 12;
        updateCardTransform(card);
    }
    if (e.target.id === 'rot-up') {
        cardRotX += 8;
        updateCardTransform(card);
    }
    if (e.target.id === 'rot-down') {
        cardRotX -= 8;
        updateCardTransform(card);
    }
});


function updatePdfHudState() {
    const display = document.getElementById('pdf-page-num');
    const prev = document.getElementById('pdf-prev');
    const next = document.getElementById('pdf-next');
    const total = pdfDoc ? pdfDoc.numPages : 0;

    if (display) display.textContent = total ? `${pageNum} / ${total}` : '— / —';

    if (prev) {
        const enabled = Boolean(pdfDoc && pageNum > 1);
        prev.style.opacity = enabled ? '1' : '0.22';
        prev.style.pointerEvents = enabled ? 'auto' : 'none';
        prev.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    }
    if (next) {
        const enabled = Boolean(pdfDoc && pageNum < total);
        next.style.opacity = enabled ? '1' : '0.22';
        next.style.pointerEvents = enabled ? 'auto' : 'none';
        next.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    }
}

function queueRenderPage(num) {
    if (!pdfDoc) return;

    const clamped = Math.max(1, Math.min(pdfDoc.numPages, Number(num) || 1));
    pageNum = clamped;
    updatePdfHudState();

    if (pageRendering) {
        pageNumPending = clamped;
    } else {
        renderPage(clamped);
    }
}

function getPdfFitMetrics(page) {
    const stage = document.getElementById('attachment-stage');
    const wrapper = document.getElementById('media-wrapper');
    const baseViewport = page.getViewport({ scale: 1 });

    // The stage is the real visible document area. Fall back to wrapper/window
    // dimensions only if layout has not completed yet.
    const stageRect = stage?.getBoundingClientRect();
    const wrapperRect = wrapper?.getBoundingClientRect();
    const availableWidth = Math.max(
        160,
        stageRect?.width || wrapperRect?.width || window.innerWidth * 0.55
    );
    const availableHeight = Math.max(
        160,
        stageRect?.height || wrapperRect?.height || window.innerHeight * 0.62
    );

    const cssScale = Math.min(
        availableWidth / baseViewport.width,
        availableHeight / baseViewport.height
    ) * PDF_FIT_PADDING;

    // Render a denser backing canvas for sharp text, while keeping its CSS box
    // fitted to the viewer. Translation coordinates use this same viewport.
    const outputScale = Math.min(
        PDF_MAX_OUTPUT_SCALE,
        Math.max(1, window.devicePixelRatio || 1)
    );

    return {
        cssScale: Math.max(0.05, cssScale),
        outputScale,
        renderScale: Math.max(0.05, cssScale * outputScale)
    };
}

function applyPdfCanvasDisplaySize(canvas, translationCanvas, viewport, outputScale) {
    const cssWidth = viewport.width / outputScale;
    const cssHeight = viewport.height / outputScale;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    if (translationCanvas) {
        translationCanvas.style.width = `${cssWidth}px`;
        translationCanvas.style.height = `${cssHeight}px`;
    }

    const stack = document.getElementById('pdf-page-stack');
    if (stack) {
        stack.style.width = `${cssWidth}px`;
        stack.style.height = `${cssHeight}px`;
    }
}

function renderPage(num) {
    if (!pdfDoc) return;

    const renderingDoc = pdfDoc;
    const renderToken = ++documentTranslationToken;
    activePdfTextBlocks = [];
    clearPdfTranslationCanvas();
    pageRendering = true;

    renderingDoc.getPage(num).then(function (page) {
        if (renderingDoc !== pdfDoc) return null;

        const canvas = document.getElementById('pdf-canvas');
        const translationCanvas = document.getElementById('pdf-translation-canvas');
        if (!canvas) {
            pageRendering = false;
            return null;
        }

        const fitMetrics = getPdfFitMetrics(page);
        let outputScale = fitMetrics.outputScale;
        let viewport = page.getViewport({ scale: fitMetrics.renderScale });

        // Guard against unusually large pages / high-DPI displays.
        if (viewport.width * viewport.height > 15000000) {
            const reduction = Math.sqrt(15000000 / (viewport.width * viewport.height));
            outputScale = Math.max(1, outputScale * reduction);
            viewport = page.getViewport({ scale: fitMetrics.cssScale * outputScale });
        }

        const ctx = canvas.getContext('2d');
        canvas.height = Math.max(1, Math.floor(viewport.height));
        canvas.width = Math.max(1, Math.floor(viewport.width));
        applyPdfCanvasDisplaySize(canvas, translationCanvas, viewport, outputScale);
        canvas.style.opacity = '0.72';

        if (translationCanvas) {
            translationCanvas.width = canvas.width;
            translationCanvas.height = canvas.height;
            translationCanvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        }

        const renderTask = page.render({ canvasContext: ctx, viewport });
        const textPromise = typeof page.getTextContent === 'function'
            ? page.getTextContent().catch(() => null)
            : Promise.resolve(null);

        return Promise.all([renderTask.promise, textPromise]).then(([, textContent]) => {
            if (renderingDoc !== pdfDoc) return;

            pageRendering = false;
            canvas.style.opacity = '1';

            const loadingText = document.getElementById('pdf-loading');
            if (loadingText) loadingText.style.display = 'none';

            const pending = pageNumPending;
            pageNumPending = null;

            // Only prepare/translate the page that remains visible after rapid paging.
            if ((pending === null || pending === num) && renderToken === documentTranslationToken) {
                if (textContent && Array.isArray(textContent.items)) {
                    activePdfTextBlocks = buildPdfTranslationBlocks(textContent.items, viewport);
                    refreshInlineDocumentTranslation();
                } else {
                    activePdfTextBlocks = [];
                    clearPdfTranslationCanvas();
                }
            }

            updatePdfHudState();

            if (pending !== null && pending !== num) {
                renderPage(pending);
            }
        });
    }).catch(error => {
        if (renderingDoc !== pdfDoc) return;
        console.error('PDF render failed:', error);
        pageRendering = false;
        pageNumPending = null;
        activePdfTextBlocks = [];
        clearPdfTranslationCanvas();
        updatePdfHudState();
    });
}

let pdfFitResizeTimer = null;
window.addEventListener('resize', () => {
    if (!pdfDoc || !pdfFitMode || !document.getElementById('pdf-canvas')) return;
    clearTimeout(pdfFitResizeTimer);
    pdfFitResizeTimer = setTimeout(() => {
        if (!pdfDoc || !pdfFitMode) return;
        currentZoom = 1;
        currentX = 0;
        currentY = 0;
        applyTransform();
        queueRenderPage(pageNum);
    }, 140);
});

const ARCHIVE_COMBINED_RECORD_GROUPS = [
    {
        id: 'monastic-retreat-pair',
        memberNames: ['山融灶垣', '崖隐蚀垣']
    },
    {
        // Reserved for the second Fukushima record. Once its site name is
        // appended here, this card automatically becomes a combined record.
        id: 'fukushima-solastalgia-pair',
        memberNames: ['隐染悬里', '雾蚀空庐']
    }
];

function buildRecordStackEntries(recordSiteList) {
    const byName = new Map(recordSiteList.map(site => [site.name, site]));
    const groupedNames = new Set();
    const groupByName = new Map();

    ARCHIVE_COMBINED_RECORD_GROUPS.forEach(group => {
        group.memberNames.forEach(name => groupByName.set(name, group));
    });

    const entries = [];
    recordSiteList.forEach(site => {
        if (groupedNames.has(site.name)) return;
        const group = groupByName.get(site.name);
        if (group) {
            const members = group.memberNames.map(name => byName.get(name)).filter(Boolean);
            if (members.length > 1) {
                entries.push({ isGroup: true, group, sites: members });
                members.forEach(member => groupedNames.add(member.name));
                return;
            }
        }
        entries.push({ isGroup: false, group: null, sites: [site] });
        groupedNames.add(site.name);
    });
    return entries;
}

function unionSiteTags(groupSites) {
    const tags = new Set();
    groupSites.forEach(site => {
        (siteTagsMapping[site.name] || '')
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
            .forEach(tag => tags.add(tag));
    });
    return [...tags].join(', ');
}


// ---------------------------------------------------------------------------
// v50 · Sliding archive-document stack
// Keep a fixed fan of 23 diagonal record cards. Records outside the fan are
// flattened against the fan's top/bottom edge instead of continuing the
// horizontal drift. Hovering near either end moves the fan through the archive.
// ---------------------------------------------------------------------------
const RECORD_STACK_FAN_COUNT = 23;
const RECORD_STACK_FAN_GAP_Y = 18;
const RECORD_STACK_FAN_GAP_X = 3;
const RECORD_STACK_FLAT_MAX_GAP = 18;
const RECORD_STACK_FLAT_MIN_GAP = 5;
const RECORD_STACK_SHIFT_Y = 5;
const RECORD_STACK_HOVER_X_LIMIT = 285;
const RECORD_STACK_HOVER_EDGE = 92;
const RECORD_STACK_STEP_MS = 160;

const recordStackSlider = {
    container: null,
    docs: [],
    total: 0,
    windowStart: 0,
    windowEnd: -1,
    initialWindowEnd: -1,
    activeTop: 0,
    activeBottom: 0,
    topExtent: 0,
    bottomExtent: 0,
    hoverDirection: 0,
    hoverTimer: null,
    hoverTickToken: 0,
    pointerRaf: null,
    pointerX: 0,
    pointerY: 0,
    extractedDoc: null,
    listenersBound: false
};

function getRecordStackFlatGap(available, count) {
    if (count <= 0) return RECORD_STACK_FLAT_MAX_GAP;
    if (!Number.isFinite(available) || available <= 0) return RECORD_STACK_FLAT_MIN_GAP;
    return Math.max(
        RECORD_STACK_FLAT_MIN_GAP,
        Math.min(RECORD_STACK_FLAT_MAX_GAP, available / count)
    );
}

function layoutRecordStackSlider() {
    const state = recordStackSlider;
    if (!state.container || !state.docs.length) return;

    const total = state.total;
    const start = state.windowStart;
    const end = state.windowEnd;
    const activeCount = Math.max(0, end - start + 1);
    const activeHeight = Math.max(0, activeCount - 1) * RECORD_STACK_FAN_GAP_Y;
    const viewportHeight = Math.max(560, window.innerHeight || 0);

    const travelled = Math.max(0, state.initialWindowEnd - end);
    const baseTop = Math.max(205, Math.min(300, viewportHeight * 0.285));
    const bottomReserve = 72;
    const maxActiveTop = Math.max(150, viewportHeight - bottomReserve - activeHeight - 72);
    const activeTop = Math.min(maxActiveTop, baseTop + travelled * RECORD_STACK_SHIFT_Y);
    const activeBottom = activeTop + activeHeight;

    const topCount = Math.max(0, total - 1 - end);
    const bottomCount = Math.max(0, start);
    const topMargin = 18;
    const bottomLimit = viewportHeight - bottomReserve;
    const topGap = getRecordStackFlatGap(activeTop - topMargin, topCount);
    const bottomGap = getRecordStackFlatGap(bottomLimit - activeBottom, bottomCount);
    const bottomFanX = -Math.max(0, activeCount - 1) * RECORD_STACK_FAN_GAP_X;

    state.activeTop = activeTop;
    state.activeBottom = activeBottom;
    state.topExtent = topCount ? activeTop - topCount * topGap : activeTop;
    state.bottomExtent = bottomCount ? activeBottom + bottomCount * bottomGap : activeBottom;

    state.docs.forEach((doc, index) => {
        doc.dataset.stackOrderIndex = String(index);

        let y = activeTop;
        let x = 0;
        let z = 1000;
        let mode = 'stack-fan';

        if (index > end) {
            const distance = index - end;
            y = activeTop - distance * topGap;
            x = 0;
            z = 900 + Math.max(0, topCount - distance);
            mode = 'stack-flat-top';
        } else if (index < start) {
            const distance = start - index;
            y = activeBottom + distance * bottomGap;
            x = bottomFanX;
            z = 1000 + activeCount + distance;
            mode = 'stack-flat-bottom';
        } else {
            const rank = end - index;
            y = activeTop + rank * RECORD_STACK_FAN_GAP_Y;
            x = -rank * RECORD_STACK_FAN_GAP_X;
            z = 1000 + rank;
            mode = 'stack-fan';
        }

        // top/left cause layout for every card. CSS variables feed one compositor
        // transform instead, keeping the 23-card fan GPU-cheap.
        const xValue = `${x}px`;
        const yValue = `${y}px`;
        if (doc.style.getPropertyValue('--stack-x') !== xValue) doc.style.setProperty('--stack-x', xValue);
        if (doc.style.getPropertyValue('--stack-y') !== yValue) doc.style.setProperty('--stack-y', yValue);

        const previousMode = doc.dataset.stackMode;
        if (previousMode !== mode) {
            if (previousMode) doc.classList.remove(previousMode);
            doc.classList.add(mode);
            doc.dataset.stackMode = mode;
        }

        const zValue = String(z);
        if (doc.dataset.zIndex !== zValue) doc.dataset.zIndex = zValue;
        if (state.extractedDoc !== doc && doc.style.zIndex !== zValue) doc.style.zIndex = zValue;
    });
}

function stopRecordStackHover() {
    const state = recordStackSlider;
    state.hoverDirection = 0;
    state.hoverTickToken += 1;
    if (state.hoverTimer) {
        clearTimeout(state.hoverTimer);
        state.hoverTimer = null;
    }
}

function shiftRecordStackWindow(direction) {
    const state = recordStackSlider;
    if (!state.docs.length) return false;
    if (state.extractedDoc) return false;

    if (direction < 0) {
        // Move down into older records.
        if (state.windowStart <= 0) return false;
        state.windowStart -= 1;
        state.windowEnd -= 1;
    } else if (direction > 0) {
        // Move up into newer records.
        if (state.windowEnd >= state.total - 1) return false;
        state.windowStart += 1;
        state.windowEnd += 1;
    } else {
        return false;
    }

    layoutRecordStackSlider();
    return true;
}

function setRecordStackHoverDirection(direction) {
    const state = recordStackSlider;
    if (state.hoverDirection === direction) return;
    stopRecordStackHover();
    state.hoverDirection = direction;
    if (!direction) return;

    // One immediate step, then a non-overlapping timer. The CSS transition is
    // shorter than the interval, so animations no longer pile up indefinitely.
    const token = ++state.hoverTickToken;
    shiftRecordStackWindow(direction);
    const tick = () => {
        if (token !== state.hoverTickToken || state.hoverDirection !== direction) return;
        if (!shiftRecordStackWindow(direction)) {
            stopRecordStackHover();
            return;
        }
        state.hoverTimer = setTimeout(tick, RECORD_STACK_STEP_MS);
    };
    state.hoverTimer = setTimeout(tick, RECORD_STACK_STEP_MS);
}

function processRecordStackPointerMove() {
    const state = recordStackSlider;
    state.pointerRaf = null;
    if (!state.container || !state.docs.length || isCompactViewport() || state.extractedDoc) {
        stopRecordStackHover();
        return;
    }

    const x = state.pointerX;
    const y = state.pointerY;
    const inHorizontalRail = x >= 0 && x <= RECORD_STACK_HOVER_X_LIMIT;
    const verticalMin = Math.max(0, state.topExtent - 38);
    const verticalMax = Math.min(window.innerHeight, state.bottomExtent + 38);

    if (!inHorizontalRail || y < verticalMin || y > verticalMax) {
        stopRecordStackHover();
        return;
    }

    if (state.windowEnd < state.total - 1 && y <= state.activeTop + RECORD_STACK_HOVER_EDGE) {
        setRecordStackHoverDirection(1);
        return;
    }

    if (state.windowStart > 0 && y >= state.activeBottom - RECORD_STACK_HOVER_EDGE) {
        setRecordStackHoverDirection(-1);
        return;
    }

    stopRecordStackHover();
}

function handleRecordStackPointerMove(event) {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const state = recordStackSlider;
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;
    if (state.pointerRaf !== null) return;
    state.pointerRaf = requestAnimationFrame(processRecordStackPointerMove);
}

function setupRecordStackSlider(container) {
    const state = recordStackSlider;
    stopRecordStackHover();

    state.container = container;
    state.docs = Array.from(container.querySelectorAll('.archive-doc'));
    state.total = state.docs.length;
    state.extractedDoc = null;
    state.docs.forEach(doc => {
        // Clear the legacy top/left fan positions once; subsequent movement is
        // compositor-only through --stack-x / --stack-y.
        doc.style.top = '0px';
        doc.style.left = '0px';
    });
    state.windowEnd = Math.max(-1, state.total - 1);
    state.windowStart = Math.max(0, state.windowEnd - RECORD_STACK_FAN_COUNT + 1);
    state.initialWindowEnd = state.windowEnd;

    container.classList.toggle('sliding-record-stack', state.total > RECORD_STACK_FAN_COUNT);
    layoutRecordStackSlider();

    if (!state.listenersBound) {
        document.addEventListener('pointermove', handleRecordStackPointerMove, { passive: true });
        window.addEventListener('blur', stopRecordStackHover);
        window.addEventListener('resize', () => {
            stopRecordStackHover();
            requestAnimationFrame(layoutRecordStackSlider);
        });
        state.listenersBound = true;
    }
}

// v55 · Smooth archive-doc retraction
// Keep the sheet in its extracted coordinate system while it animates back to
// the stack transform. Only remove the extracted state after the transition
// finishes, avoiding the one-frame jump to top: 0.
function retractArchiveDocSmooth(docEl) {
    if (!docEl || !docEl.classList.contains('extracted')) return;
    if (docEl.classList.contains('retracting')) return;

    const isRecordDoc = !!docEl.closest('#stack-record');

    // The right garden stack already has a stable CSS return path. Keep its
    // existing behavior; the extra retracting state is needed for the sliding
    // left record stack because its resting position lives in --stack-x/y.
    if (!isRecordDoc) {
        docEl.classList.remove('extracted');
        docEl.style.zIndex = docEl.dataset.zIndex;
        return;
    }

    docEl.classList.add('retracting');

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        docEl.classList.remove('retracting', 'extracted');
        docEl.style.zIndex = docEl.dataset.zIndex;
        if (recordStackSlider.extractedDoc === docEl) {
            recordStackSlider.extractedDoc = null;
        }
    };

    const onEnd = (event) => {
        if (event.target !== docEl) return;
        if (event.propertyName !== 'transform' && event.propertyName !== 'top') return;
        docEl.removeEventListener('transitionend', onEnd);
        finish();
    };

    docEl.addEventListener('transitionend', onEnd);
    // Safety fallback for interrupted transitions / background tabs.
    window.setTimeout(() => {
        docEl.removeEventListener('transitionend', onEnd);
        finish();
    }, 620);
}


// ============================================================================
// v72 · Static 128×128 thumbnail display
// ----------------------------------------------------------------------------
// These files are authored offline and placed directly in /thumbnails/.
// There is NO browser-side generator, JSON config, Python integration,
// source-photo fallback, or automatic thumbnail creation.
// Images are requested only when an archive sheet is actually extracted or
// when the expanded compass settles on a site.
// ============================================================================
const GARDEN_ARCHIVE_THUMBNAILS = Object.freeze({
    "瘟猪坝沉墟": "thumbnails/garden-128/effluent-sedimentation.webp",
    "电台路焦土": "thumbnails/garden-128/aether-scorched-earth.webp"
});

const SITE_THUMBNAILS = Object.freeze({
    "瘟猪坝沉墟": "thumbnails/effluent-sedimentation.webp",
    "电台路焦土": "thumbnails/aether-scorched-earth.webp",
    "山葬灰脉": "thumbnails/yellow-mountain.webp",
    "硅脉遗厂": "thumbnails/silicon-vein-works.webp",
    "琉棘庭": "thumbnails/walled-gallery.webp",
    "裂翼坪": "thumbnails/fallen-wing-field.webp",
    "轨畔孤构": "thumbnails/rail-side.webp",
    "残柱林": "thumbnails/concrete-pole.webp",
    "钟寂残堂": "thumbnails/bell-silent-church.webp",
    "池骸湾": "thumbnails/bath-crack.webp",
    "毒烬轮冢": "thumbnails/toxic-tire-pyre.webp",
    "褶层湾": "thumbnails/quarry-bay-stairway.webp",
    "隐染悬里": "thumbnails/suspended-homeland.webp",
    "雾蚀空庐": "thumbnails/mist-eroded-hut.webp",
    "锈祷圣堂": "thumbnails/rust-prayer-sanctuary.webp",
    "釉骸拓壁": "thumbnails/membrane.webp",
    "叠骸构阵": "thumbnails/fish-mouth.webp",
    "苔网塬": "thumbnails/gloss-veil.webp",
    "陆坞舰骸": "thumbnails/brick-battleship.webp",
    "墟响厅": "thumbnails/mirror.webp",
    "波蚀脊堤": "thumbnails/wave-eroded-structure.webp",
    "曜原驿": "thumbnails/solar.webp",
    "溶境遗廊": "thumbnails/aquarium-bunker.webp",
    "荒娱敖包": "thumbnails/mountain-signal.webp",
    "彩壳堡": "thumbnails/castle.webp",
    "削岩残居": "thumbnails/roof.webp",
    "隐阶空墅": "thumbnails/hidden-stair-villa.webp",
    "暮辉骸殿": "thumbnails/afterglow-palace.webp",
    "迁痕空埠": "thumbnails/dock.webp",
    "山骸窟殿": "thumbnails/phospho.webp",
    "山融灶垣": "thumbnails/earthwall.webp",
    "崖隐蚀垣": "thumbnails/cliff-granary.webp",
    "褶脊胚庭": "thumbnails/compressed-courtyard.webp",
    "草间稚居": "thumbnails/grass-child-dwelling.webp"
});

function getThumbnailSite(siteOrSites, sourceMap = SITE_THUMBNAILS) {
    const list = Array.isArray(siteOrSites) ? siteOrSites : [siteOrSites];
    return list.find(site => site?.name && sourceMap[site.name]) || null;
}

function mountStaticThumbnail(
    frame,
    site,
    sourceMap = SITE_THUMBNAILS,
    authoredSize = 128
) {
    if (!frame) return;

    const thumbnailSite = getThumbnailSite(site, sourceMap);
    const src = thumbnailSite ? sourceMap[thumbnailSite.name] : '';

    if (!src) {
        frame.replaceChildren();
        frame.classList.remove('has-image');
        frame.removeAttribute('data-thumbnail-src');
        return;
    }

    if (
        frame.dataset.thumbnailSrc === src &&
        frame.querySelector('img')
    ) {
        return;
    }

    frame.classList.remove('has-image');
    frame.dataset.thumbnailSrc = src;
    frame.replaceChildren();

    const img = new Image();
    img.className = 'site-preview-thumbnail';
    img.alt = '';
    img.width = authoredSize;
    img.height = authoredSize;
    img.decoding = 'async';
    img.loading = 'eager';
    img.fetchPriority = 'low';
    img.draggable = false;

    img.addEventListener('load', () => {
        if (frame.dataset.thumbnailSrc !== src) return;
        frame.classList.add('has-image');
    }, { once: true });

    img.addEventListener('error', () => {
        if (frame.dataset.thumbnailSrc !== src) return;
        frame.replaceChildren();
        frame.classList.remove('has-image');
        frame.removeAttribute('data-thumbnail-src');
    }, { once: true });

    frame.appendChild(img);
    img.src = src;
}


function buildFileStacks() {
    const stackGarden = document.getElementById('stack-garden');
    const stackRecord = document.getElementById('stack-record');
    if (!stackGarden || !stackRecord) return;

    stackGarden.innerHTML = '';
    stackRecord.innerHTML = '';

    const gardenSites = sites.filter(site => site.type === 'garden');
    const recordSiteList = sites.filter(site => site.type !== 'garden');
    const recordEntries = buildRecordStackEntries(recordSiteList);

    function renderStack(entries, container, isGarden) {
        const total = entries.length;
        const cnNums = ['一','二','三','四','五','六','七','八','九','十'];

        entries.forEach((entry, index) => {
            const entrySites = isGarden ? [entry] : entry.sites;
            const initialSite = entrySites[0];
            const isCombinedRecord = !isGarden && entrySites.length > 1;
            const docEl = document.createElement('div');
            docEl.className = `archive-doc${isGarden ? ' garden-archive-doc' : ''}${isCombinedRecord ? ' combined-record-doc' : ''}`;
            if (isCombinedRecord) docEl.dataset.archiveGroup = entry.group.id;

            const tags = isGarden ? (siteTagsMapping[initialSite.name] || '') : unionSiteTags(entrySites);
            docEl.setAttribute('data-tags', tags);
            docEl.setAttribute('data-tag', tags);

            const positionIndex = (total - 1) - index;
            const verticalGap = isGarden ? 32 : 18;
            if (isGarden) {
                docEl.style.top = `${positionIndex * verticalGap}px`;
                docEl.style.right = `-${positionIndex * 4}px`;
                docEl.style.zIndex = positionIndex;
                docEl.dataset.zIndex = positionIndex;
            } else {
                // v50: record-card coordinates are assigned by the sliding fan
                // after all cards exist in the DOM. This caps horizontal drift.
                docEl.style.top = '0px';
                docEl.style.left = '0px';
                docEl.style.zIndex = '1000';
                docEl.dataset.zIndex = '1000';
            }

            const seq = cnNums[index] || (index + 1);
            const typeKey = isGarden ? 'ui_garden' : 'ui_record';
            const typeText = isGarden ? '废墟园林' : '遗构录';
            const navKey = 'ui_auto_nav';
            const navText = '自动导航 ⌖';

            const uniqueDates = [...new Set(entrySites.map(site => site.archiveDate).filter(Boolean))];
            const archiveDateText = uniqueDates.join(' · ');
            const uniqueRecorders = [...new Set(entrySites.map(site => site.recorder || '罗清源'))];
            const recorderText = uniqueRecorders.join(' / ');
            const secondaryRecordHtml = isGarden ? '' : buildArchiveDocSecondaryRecords(entrySites);

            // v90: Ruin Garden archive-doc cards use a separate
            // thumbnail source set, displayed at 128×128. Compass and ordinary Record cards
            // continue using SITE_THUMBNAILS unchanged.
            const thumbnailSourceMap = isGarden
                ? GARDEN_ARCHIVE_THUMBNAILS
                : SITE_THUMBNAILS;
            const thumbnailAuthoredSize = 128;
            const thumbnailSite = getThumbnailSite(entrySites, thumbnailSourceMap);

            if (thumbnailSite) {
                docEl.classList.add('has-thumbnail');
                docEl.dataset.thumbnailSite = thumbnailSite.name;

                if (isGarden) {
                    docEl.classList.add('garden-large-thumbnail');
                }
            }

            const titleTextHtml = isGarden
                ? `<span data-i18n="ui_garden">废墟园林</span> · <span data-i18n="ui_seq_${index + 1}">其${seq}</span> | <span class="doc-site-name" data-i18n="site_name_${initialSite.name}">${initialSite.name}</span>`
                : isCombinedRecord
                    ? `<div class="combined-site-list">${entrySites.map((site, siteIndex) => `
                        <div class="combined-site-line">
                            <span class="combined-site-prefix" aria-hidden="true">-</span>
                            <span data-i18n="ui_record">遗构录</span>&nbsp;|&nbsp;<span data-i18n="site_name_${site.name}">${site.name}</span>
                        </div>`).join('')}</div>`
                    : `<span data-i18n="ui_record">遗构录</span> | <span class="doc-site-name" data-i18n="site_name_${initialSite.name}">${initialSite.name}</span>`;

            const coordinateHtml = isCombinedRecord
                ? entrySites.map((site, siteIndex) => {
                    const latStr = site.lat >= 0 ? formatLat(-site.lat) : formatLat(Math.abs(site.lat));
                    return `<div class="combined-coordinate-line">${latStr.trim()} ${formatLng(site.lng).trim()}</div>`;
                }).join('')
                : (() => {
                    const latStr = initialSite.lat >= 0 ? formatLat(-initialSite.lat) : formatLat(Math.abs(initialSite.lat));
                    return `${latStr.trim()} ${formatLng(initialSite.lng).trim()}`;
                })();

            docEl.innerHTML = `
                <div class="doc-meta">[ <span data-i18n="${typeKey}">${typeText}</span> ] | <span data-i18n="ui_archive_date">归档: </span><span class="doc-archive-date">${archiveDateText}</span></div>
                <div class="doc-title">${titleTextHtml}</div>
                <div class="archive-doc-thumbnail" aria-hidden="true"></div>
                <div class="doc-meta doc-identity-meta">${isGarden
                    ? `<span data-i18n="ui_creator">墟构师: 罗清源</span>`
                    : `<span data-i18n="ui_recorder_label">记录者: </span><span class="doc-recorder-name">${recorderText}</span>${secondaryRecordHtml}`}
                </div>
                <div class="doc-meta doc-coordinate-meta${isCombinedRecord ? ' combined-coordinate-meta' : ''}" style="margin-bottom: 8px;">${coordinateHtml}</div>
                <div class="doc-coord-btn ${isGarden ? 'garden-nav-btn' : 'compass-btn'}" data-i18n="${navKey}">${navText}</div>
            `;

            docEl.addEventListener('click', (event) => {
                if (event.target.closest('.doc-coord-btn') || event.target.closest('.doc-title')) return;
                event.stopPropagation();

                document.querySelectorAll('.archive-doc.extracted').forEach(el => {
                    if (el !== docEl) retractArchiveDocSmooth(el);
                });

                // Clicking the already extracted sheet sends it back along the
                // same physical path instead of dropping the class immediately.
                if (docEl.classList.contains('extracted')) {
                    retractArchiveDocSmooth(docEl);
                    return;
                }

                const willExtract = true;
                if (willExtract && !isGarden) {
                    const stackRect = container.getBoundingClientRect();

                    // v54: use the right-side garden archive-doc as the vertical
                    // reference instead of anchoring the record sheet to the
                    // viewport bottom. The left sheet sits at 70% of the right
                    // sheet's extracted Y position — visually about 30% higher.
                    // Reading the right stack's real CSS bottom/custom offset
                    // keeps the relationship stable across viewport heights.
                    const gardenStack = document.getElementById('stack-garden');
                    let gardenViewportTop = window.innerHeight - 120 - 233;
                    if (gardenStack) {
                        const gardenStyle = getComputedStyle(gardenStack);
                        const gardenBottom = parseFloat(gardenStyle.bottom);
                        const recordReferenceTop = parseFloat(
                            gardenStyle.getPropertyValue('--record-reference-garden-extract-top')
                        );
                        const gardenExtractTop = parseFloat(
                            gardenStyle.getPropertyValue('--garden-extract-top')
                        );
                        gardenViewportTop = window.innerHeight
                            - (Number.isFinite(gardenBottom) ? gardenBottom : 120)
                            + (Number.isFinite(recordReferenceTop)
                                ? recordReferenceTop
                                : (Number.isFinite(gardenExtractTop) ? gardenExtractTop : -233));
                    }

                    const targetViewportTop = Math.max(18, gardenViewportTop * 0.70);
                    const targetRelativeTop = targetViewportTop - stackRect.top;
                    docEl.style.setProperty('--record-extract-top', `${targetRelativeTop}px`);
                }

                docEl.classList.remove('retracting');
                docEl.classList.add('extracted');

                // v72: the 128×128 WebP enters the network/decode pipeline only
                // after the sheet is actually pulled out.
                if (thumbnailSite) {
                    mountStaticThumbnail(
                        docEl.querySelector('.archive-doc-thumbnail'),
                        thumbnailSite,
                        thumbnailSourceMap,
                        thumbnailAuthoredSize
                    );
                }

                if (!isGarden) {
                    recordStackSlider.extractedDoc = docEl;
                }

                // v51: pulling a document out must not promote it above the
                // entire archive stack. Keep the exact layer assigned by the
                // stack layout so the previous sheet still overlaps it while
                // the following sheet remains underneath — visually, the card
                // is being pulled from *between* its neighbours.
                docEl.style.zIndex = docEl.dataset.zIndex;

                if (docEl.classList.contains('extracted')) stopRecordStackHover();
            });

            const coordBtn = docEl.querySelector('.doc-coord-btn');
            const titleEl = docEl.querySelector('.doc-title');

            if (coordBtn) {
                coordBtn.addEventListener('click', event => {
                    event.stopPropagation();
                    const indexDrawer = document.getElementById('index-drawer');
                    const runNavigation = (fromIndexDrawer) => {
                        if (isCombinedRecord) {
                            flyToSiteGroup(entrySites, fromIndexDrawer);
                        } else {
                            flyToSite(initialSite, sites.indexOf(initialSite), fromIndexDrawer);
                        }
                    };

                    if (indexDrawer && indexDrawer.classList.contains('open')) {
                        window.closeIndexDrawerWithAnim(true);
                        setTimeout(() => runNavigation(true), 400);
                    } else {
                        runNavigation(false);
                    }
                });
            }

            if (titleEl && coordBtn) {
                titleEl.addEventListener('click', event => {
                    event.stopPropagation();
                    coordBtn.click();
                });
            }

            container.appendChild(docEl);
        });
    }

    renderStack(gardenSites, stackGarden, true);
    renderStack(recordEntries, stackRecord, false);
    setupRecordStackSlider(stackRecord);

    syncLanguageSubtree(stackGarden);
    syncLanguageSubtree(stackRecord);
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.archive-doc') && !e.target.closest('#collapse-compass-btn')) {
        document.querySelectorAll('.archive-doc.extracted').forEach(el => {
            retractArchiveDocSmooth(el);
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(buildFileStacks, 300);
});

document.addEventListener('DOMContentLoaded', () => {
    const bottomDrawer = document.getElementById('bottom-index-drawer');
    const drawerTrigger = document.getElementById('bottom-drawer-trigger');


    if (drawerTrigger && bottomDrawer) {
        drawerTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            bottomDrawer.classList.toggle('open');
        });
    }


    document.addEventListener('click', (e) => {
        if (bottomDrawer && bottomDrawer.classList.contains('open')) {

            if (!bottomDrawer.contains(e.target)) {
                bottomDrawer.classList.remove('open');
            }
        }
    });


    const indexTags = document.querySelectorAll('.index-tag');
    const archiveDocs = document.querySelectorAll('.archive-doc');

    indexTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();

            const isActive = tag.classList.contains('active');
            const keyword = tag.getAttribute('data-tags');


        });
    });
});


document.addEventListener("DOMContentLoaded", () => {

    const indexTags = document.querySelectorAll('.index-tag, .index-category');


    indexTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();


            if (tag.classList.contains('disabled')) {
                return;
            }


            tag.classList.toggle('active');


            updateArchiveDocs();
        });
    });


    function updateArchiveDocs() {

        const activeTags = Array.from(document.querySelectorAll('.index-tag.active, .index-category.active'))
            .map(tag => (tag.getAttribute('data-tag') || tag.getAttribute('data-tags') || '').trim())
            .filter(Boolean);


        const archiveDocs = document.querySelectorAll('.archive-doc, .site-character, .mobile-list-item, .compass-wheel-item');


        const availableTags = new Set();


        archiveDocs.forEach(doc => {
            const docTagsAttr = doc.getAttribute('data-tag') || doc.getAttribute('data-tags') || "";
            const docTags = docTagsAttr.split(',').map(t => t.trim()).filter(Boolean);

            if (activeTags.length === 0) {

                doc.classList.remove('matched-tag');
                doc.classList.remove('active-dot');
                doc.style.display = 'block';

                docTags.forEach(t => availableTags.add(t));
            } else {

                const isMatch = activeTags.every(activeTag => docTags.includes(activeTag));

                if (isMatch) {
                    doc.classList.add('matched-tag');
                    doc.classList.add('active-dot');
                    doc.style.display = 'block';


                    docTags.forEach(t => availableTags.add(t));
                } else {
                    doc.classList.remove('matched-tag');
                    doc.classList.remove('active-dot');

                }
            }
        });


        indexTags.forEach(tag => {
            const tagVal = (tag.getAttribute('data-tag') || tag.getAttribute('data-tags') || '').trim();

            if (activeTags.length === 0) {

                tag.classList.remove('disabled');
            } else {

                if (!availableTags.has(tagVal)) {
                    tag.classList.add('disabled');
                    tag.classList.remove('active');
                } else {
                    tag.classList.remove('disabled');
                }
            }
        });


        const layoutElements = document.querySelectorAll('.index-three-columns, .index-conclusion, .index-top-title');

        if (activeTags.length === 0) {

            layoutElements.forEach(el => el.classList.remove('disabled'));
        } else {

            layoutElements.forEach(el => el.classList.add('disabled'));
        }


        const ruinTriggers = document.querySelectorAll('#bottom-trigger-ruin, #opened-trigger-ruin');
        const recordTriggers = document.querySelectorAll('#bottom-trigger-record, #opened-trigger-record');


        if (activeTags.length === 0) {
            ruinTriggers.forEach(trigger => {
                const dots = trigger.querySelector('.filter-dots');
                if (dots) dots.textContent = "";
            });
            recordTriggers.forEach(trigger => {
                const dots = trigger.querySelector('.filter-dots');
                if (dots) dots.textContent = "";
            });
        } else {

            let gardenCount = 0;
            let recordCount = 0;


            sites.forEach(site => {
                const siteTags = (siteTagsMapping[site.name] || "").split(',').map(t => t.trim()).filter(Boolean);
                const isMatch = activeTags.every(activeTag => siteTags.includes(activeTag));

                if (isMatch) {
                    if (site.type === 'garden') gardenCount++;
                    if (site.type === 'record') recordCount++;
                }
            });


            ruinTriggers.forEach(trigger => {
                const dots = trigger.querySelector('.filter-dots');
                if (dots) dots.textContent = gardenCount > 0 ? `[${gardenCount}] ` : "";
            });
            recordTriggers.forEach(trigger => {
                const dots = trigger.querySelector('.filter-dots');
                if (dots) dots.textContent = recordCount > 0 ? ` [${recordCount}]` : "";
            });


        }

    }
});

document.addEventListener("DOMContentLoaded", () => {
    const frame = document.getElementById('main-viewport-frame');
    const handleShapes = document.querySelectorAll('#index-drawer-handle .frosted-shape, #drawer-opened-bottom-decor .frosted-shape');

    if (!frame || handleShapes.length === 0) return;


    const updateTrapezoidHandle = () => {
        const rect = frame.getBoundingClientRect();
        handleShapes.forEach(shape => {
            shape.style.setProperty('--frame-left', `${rect.left}px`);
            shape.style.setProperty('--frame-right', `${rect.right}px`);
        });
    };


    updateTrapezoidHandle();


    window.addEventListener('resize', updateTrapezoidHandle);


    const observer = new ResizeObserver(() => {
        updateTrapezoidHandle();
    });
    observer.observe(frame);
});



// =========================
// PDF / TXT inline translation
// =========================
function splitTranslationChunks(text, maxChars = 1800) {
    const clean = String(text || '').replace(/\r\n?/g, '\n').trim();
    if (!clean) return [];

    const paragraphs = clean.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
    const chunks = [];
    let buffer = '';

    const pushBuffer = () => {
        if (buffer.trim()) chunks.push(buffer.trim());
        buffer = '';
    };

    for (const paragraph of paragraphs) {
        if (paragraph.length > maxChars) {
            pushBuffer();
            for (let i = 0; i < paragraph.length; i += maxChars) {
                chunks.push(paragraph.slice(i, i + maxChars));
            }
            continue;
        }

        const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
        if (candidate.length > maxChars) {
            pushBuffer();
            buffer = paragraph;
        } else {
            buffer = candidate;
        }
    }

    pushBuffer();
    return chunks;
}

async function translateDocumentText(text, sourceLang, targetLang) {
    const clean = String(text || '').trim();
    if (!clean || sourceLang === targetLang) return clean;

    const cacheKey = `${sourceLang}>${targetLang}:${clean}`;
    if (documentTranslationCache.has(cacheKey)) {
        return documentTranslationCache.get(cacheKey);
    }

    const chunks = splitTranslationChunks(clean);
    const translated = [];

    for (const chunk of chunks) {
        const response = await fetch(DOCUMENT_TRANSLATION_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: chunk,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        });

        if (!response.ok) throw new Error(`Translation HTTP ${response.status}`);

        const data = await response.json();
        const value = String(
            data.translated_text || data.translation || data.response || ''
        ).trim();

        if (!value) throw new Error('Empty translation response');
        translated.push(value);
    }

    const result = translated.join('\n\n');
    documentTranslationCache.set(cacheKey, result);
    return result;
}

function isChineseSourceText(text) {
    return /[\u3400-\u9fff]/.test(String(text || ''));
}

function joinPdfTokens(left, right) {
    const a = String(left || '');
    const b = String(right || '');
    if (!a) return b;
    if (!b) return a;

    const aLast = a[a.length - 1];
    const bFirst = b[0];
    const cjk = ch => /[\u3400-\u9fff\u3040-\u30ff]/.test(ch || '');
    const punctuation = ch => /[，。！？；：、,.!?;:）》】』」]/.test(ch || '');

    if (cjk(aLast) || cjk(bFirst) || punctuation(bFirst)) return a + b;
    return `${a} ${b}`;
}

function buildPdfTranslationBlocks(items, viewport) {
    if (!window.pdfjsLib?.Util || !viewport) return [];

    const glyphs = [];
    for (const item of items || []) {
        const text = String(item?.str || '').trim();
        if (!text) continue;

        const raw = Array.isArray(item.transform) ? item.transform : [1, 0, 0, 1, 0, 0];
        const tx = window.pdfjsLib.Util.transform(viewport.transform, raw);
        const fontSize = Math.max(6, Math.hypot(tx[2], tx[3]) || Math.hypot(tx[0], tx[1]) || 10);
        const width = Math.max(
            2,
            Math.abs(Number(item.width || 0) * viewport.scale) || fontSize * Math.max(1, text.length) * 0.52
        );
        const baseline = Number(tx[5] || 0);
        const top = baseline - fontSize * 0.88;

        glyphs.push({
            text,
            x: Number(tx[4] || 0),
            baseline,
            top,
            width,
            height: fontSize * 1.12,
            fontSize,
            hasEOL: Boolean(item.hasEOL)
        });
    }

    if (!glyphs.length) return [];
    glyphs.sort((a, b) => Math.abs(a.baseline - b.baseline) > Math.max(3, Math.min(a.fontSize, b.fontSize) * .36)
        ? a.baseline - b.baseline
        : a.x - b.x);

    // Build visual rows first. Items on the same baseline but separated by a large
    // horizontal gap become separate rows, preventing two-column PDFs from mixing.
    const baselineRows = [];
    for (const glyph of glyphs) {
        let row = baselineRows.find(candidate =>
            Math.abs(candidate.baseline - glyph.baseline) <= Math.max(3, Math.min(candidate.fontSize, glyph.fontSize) * .4)
        );
        if (!row) {
            row = { baseline: glyph.baseline, fontSize: glyph.fontSize, items: [] };
            baselineRows.push(row);
        }
        row.items.push(glyph);
        row.fontSize = (row.fontSize + glyph.fontSize) / 2;
    }

    const lines = [];
    for (const row of baselineRows) {
        const sorted = row.items.sort((a, b) => a.x - b.x);
        let segment = null;

        const flush = () => {
            if (!segment) return;
            segment.width = Math.max(2, segment.xMax - segment.x);
            segment.height = Math.max(segment.fontSize * 1.2, segment.bottom - segment.top);
            lines.push(segment);
            segment = null;
        };

        for (const glyph of sorted) {
            if (!segment) {
                segment = {
                    text: glyph.text,
                    x: glyph.x,
                    xMax: glyph.x + glyph.width,
                    top: glyph.top,
                    bottom: glyph.top + glyph.height,
                    baseline: glyph.baseline,
                    fontSize: glyph.fontSize,
                    hasEOL: glyph.hasEOL
                };
                continue;
            }

            const gap = glyph.x - segment.xMax;
            const splitGap = Math.max(34, ((segment.fontSize + glyph.fontSize) / 2) * 4.2);
            if (gap > splitGap) {
                flush();
                segment = {
                    text: glyph.text,
                    x: glyph.x,
                    xMax: glyph.x + glyph.width,
                    top: glyph.top,
                    bottom: glyph.top + glyph.height,
                    baseline: glyph.baseline,
                    fontSize: glyph.fontSize,
                    hasEOL: glyph.hasEOL
                };
            } else {
                segment.text = joinPdfTokens(segment.text, glyph.text);
                segment.xMax = Math.max(segment.xMax, glyph.x + glyph.width);
                segment.top = Math.min(segment.top, glyph.top);
                segment.bottom = Math.max(segment.bottom, glyph.top + glyph.height);
                segment.fontSize = (segment.fontSize + glyph.fontSize) / 2;
                segment.hasEOL = segment.hasEOL || glyph.hasEOL;
            }
        }
        flush();
    }

    lines.sort((a, b) => Math.abs(a.top - b.top) > 3 ? a.top - b.top : a.x - b.x);

    // Merge only geometrically compatible adjacent lines. This keeps captions,
    // side notes, titles and columns independent while giving body paragraphs context.
    const blocks = [];
    for (const line of lines) {
        let best = null;
        let bestScore = Infinity;

        for (const block of blocks) {
            const verticalGap = line.top - block.bottom;
            if (verticalGap < -2 || verticalGap > Math.max(20, line.fontSize * 1.8, block.fontSize * 1.8)) continue;

            const overlap = Math.max(0, Math.min(block.xMax, line.x + line.width) - Math.max(block.x, line.x));
            const overlapRatio = overlap / Math.max(1, Math.min(block.width, line.width));
            const xDelta = Math.abs(block.x - line.x);
            const fontRatio = Math.max(block.fontSize, line.fontSize) / Math.max(1, Math.min(block.fontSize, line.fontSize));

            if (fontRatio > 1.45) continue;
            if (overlapRatio < .38 && xDelta > Math.max(28, line.fontSize * 3.2)) continue;
            if (block.text.length + line.text.length > 900) continue;

            const score = verticalGap + xDelta * .12 - overlapRatio * 8;
            if (score < bestScore) {
                best = block;
                bestScore = score;
            }
        }

        if (!best) {
            blocks.push({
                text: line.text,
                x: line.x,
                xMax: line.x + line.width,
                top: line.top,
                bottom: line.top + line.height,
                width: line.width,
                height: line.height,
                fontSize: line.fontSize
            });
        } else {
            best.text = joinPdfTokens(best.text, line.text);
            best.x = Math.min(best.x, line.x);
            best.xMax = Math.max(best.xMax, line.x + line.width);
            best.top = Math.min(best.top, line.top);
            best.bottom = Math.max(best.bottom, line.top + line.height);
            best.width = best.xMax - best.x;
            best.height = best.bottom - best.top;
            best.fontSize = (best.fontSize + line.fontSize) / 2;
        }
    }

    return blocks
        .filter(block => block.text.trim())
        .sort((a, b) => Math.abs(a.top - b.top) > 3 ? a.top - b.top : a.x - b.x);
}

function clearPdfTranslationCanvas() {
    const canvas = document.getElementById('pdf-translation-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.remove('active');
}

function clearInlineDocumentTranslation() {
    clearPdfTranslationCanvas();
    const layer = document.getElementById('archive-text-translation-layer');
    const translatedContent = document.getElementById('archive-text-translation-content');
    if (layer) layer.classList.remove('active', 'is-translating');
    if (translatedContent) translatedContent.textContent = '';
    setDocumentTranslationLoading(false);
}

function wrapCanvasText(ctx, text, maxWidth, targetLang) {
    const source = String(text || '').trim();
    if (!source) return [];

    const units = targetLang === 'en'
        ? source.split(/\s+/).filter(Boolean)
        : Array.from(source);
    const joiner = targetLang === 'en' ? ' ' : '';
    const lines = [];
    let line = '';

    for (const unit of units) {
        const candidate = line ? line + joiner + unit : unit;
        if (line && ctx.measureText(candidate).width > maxWidth) {
            lines.push(line);
            line = unit;
        } else {
            line = candidate;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function fitCanvasTranslation(ctx, text, maxWidth, maxHeight, startFont, targetLang) {
    const minFont = 5.5;
    let fontSize = Math.max(minFont, Math.min(startFont, 18));

    while (fontSize >= minFont) {
        ctx.font = `400 ${fontSize}px "IBM Plex Sans JP", sans-serif`;
        const lines = wrapCanvasText(ctx, text, maxWidth, targetLang);
        const lineHeight = fontSize * 1.28;
        if (lines.length * lineHeight <= maxHeight) {
            return { fontSize, lineHeight, lines };
        }
        fontSize -= .5;
    }

    ctx.font = `400 ${minFont}px "IBM Plex Sans JP", sans-serif`;
    const lines = wrapCanvasText(ctx, text, maxWidth, targetLang);
    return { fontSize: minFont, lineHeight: minFont * 1.24, lines };
}

function getPdfBlockAvailableHeight(block, allBlocks, canvasHeight) {
    let nextTop = canvasHeight - 3;
    for (const candidate of allBlocks) {
        if (candidate === block || candidate.top <= block.top) continue;
        const overlap = Math.max(0, Math.min(block.xMax, candidate.xMax) - Math.max(block.x, candidate.x));
        const ratio = overlap / Math.max(1, Math.min(block.width, candidate.width));
        if (ratio >= .25) nextTop = Math.min(nextTop, candidate.top - 2);
    }

    const freeHeight = Math.max(block.height * 1.15, nextTop - block.top);
    return Math.max(block.height * 1.15, Math.min(freeHeight, block.height * 2.6 + block.fontSize));
}

function paintPdfTranslationBlock(ctx, block, translated, targetLang, allBlocks, canvasWidth, canvasHeight) {
    if (!translated) return;

    const padX = Math.max(2, block.fontSize * .18);
    const padY = Math.max(1.5, block.fontSize * .12);
    const x = Math.max(0, block.x - padX);
    const y = Math.max(0, block.top - padY);
    const maxWidth = Math.max(16, Math.min(canvasWidth - x - 2, block.width + padX * 2));
    const maxHeight = Math.max(12, Math.min(canvasHeight - y - 2, getPdfBlockAvailableHeight(block, allBlocks, canvasHeight)));

    const fitted = fitCanvasTranslation(
        ctx,
        translated,
        Math.max(12, maxWidth - padX * 2),
        Math.max(10, maxHeight - padY * 2),
        block.fontSize * (targetLang === 'en' ? .82 : .92),
        targetLang
    );

    const actualHeight = Math.min(maxHeight, fitted.lines.length * fitted.lineHeight + padY * 2);

    ctx.save();
    // Semi-transparent grey tape: the source remains faintly readable underneath
    // and can be fully restored with the translation toggle.
    ctx.shadowColor = 'rgba(0,0,0,.10)';
    ctx.shadowBlur = Math.max(1, block.fontSize * .10);
    ctx.fillStyle = 'rgba(166,166,160,.72)';
    ctx.fillRect(x, y, maxWidth, actualHeight);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.20)';
    ctx.lineWidth = .6;
    ctx.strokeRect(x + .3, y + .3, Math.max(0, maxWidth - .6), Math.max(0, actualHeight - .6));
    ctx.fillStyle = 'rgba(16,16,16,.96)';
    ctx.textBaseline = 'top';
    ctx.font = `400 ${fitted.fontSize}px "IBM Plex Sans JP", sans-serif`;

    let drawY = y + padY;
    const maxLines = Math.floor((actualHeight - padY * 2) / fitted.lineHeight);
    fitted.lines.slice(0, Math.max(1, maxLines)).forEach(line => {
        ctx.fillText(line, x + padX, drawY, maxWidth - padX * 2);
        drawY += fitted.lineHeight;
    });
    ctx.restore();
}

async function translatePdfBlocksInline(targetLang, requestToken) {
    const canvas = document.getElementById('pdf-translation-canvas');
    if (!canvas || !activePdfTextBlocks.length || targetLang === 'zh' || !documentTranslationEnabled) {
        clearPdfTranslationCanvas();
        setDocumentTranslationLoading(false);
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.add('active');

    const blocks = activePdfTextBlocks.filter(block => isChineseSourceText(block.text));
    if (!blocks.length) {
        setDocumentTranslationLoading(false);
        return;
    }

    const concurrency = 3;
    let cursor = 0;
    let completed = 0;
    setDocumentTranslationLoading(true, completed, blocks.length);

    async function worker() {
        while (cursor < blocks.length) {
            const index = cursor++;
            const block = blocks[index];
            try {
                const translated = await translateDocumentText(block.text, 'zh', targetLang);
                if (requestToken !== documentTranslationToken || activeAttachmentItem?.mode !== 'pdf' || !documentTranslationEnabled) return;
                paintPdfTranslationBlock(ctx, block, translated, targetLang, activePdfTextBlocks, canvas.width, canvas.height);
            } catch (error) {
                console.warn('PDF inline translation block failed:', error);
            } finally {
                completed += 1;
                if (requestToken === documentTranslationToken && documentTranslationEnabled) {
                    setDocumentTranslationLoading(completed < blocks.length, completed, blocks.length);
                }
            }
        }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, blocks.length) }, () => worker()));
    if (requestToken === documentTranslationToken && documentTranslationEnabled) {
        setDocumentTranslationLoading(false);
    }
}

async function translateTxtInline(targetLang, requestToken) {
    const layer = document.getElementById('archive-text-translation-layer');
    const translatedContent = document.getElementById('archive-text-translation-content');
    if (!layer || !translatedContent || !activeTextSource) return;

    if (targetLang === 'zh' || !documentTranslationEnabled) {
        layer.classList.remove('active', 'is-translating');
        translatedContent.textContent = '';
        setDocumentTranslationLoading(false);
        return;
    }

    layer.classList.add('is-translating');
    layer.classList.remove('active');
    setDocumentTranslationLoading(true);

    try {
        const translated = await translateDocumentText(activeTextSource, 'zh', targetLang);
        if (requestToken !== documentTranslationToken || activeAttachmentItem?.mode !== 'text' || !documentTranslationEnabled) return;
        translatedContent.textContent = translated;
        layer.classList.remove('is-translating');
        layer.classList.add('active');
        setDocumentTranslationLoading(false);
    } catch (error) {
        if (requestToken !== documentTranslationToken) return;
        console.warn('TXT inline translation unavailable:', error);
        layer.classList.remove('active', 'is-translating');
        translatedContent.textContent = '';
        setDocumentTranslationLoading(false);
    }
}

function getDocumentTranslationTargetLang() {
    return ['zh', 'en', 'ja'].includes(window.currentLang) ? window.currentLang : 'zh';
}

function getDocumentTranslationUiText(lang = getDocumentTranslationTargetLang()) {
    if (lang === 'ja') return { button: '訳', loading: '翻訳中' };
    if (lang === 'en') return { button: 'TR', loading: 'TRANSLATING' };
    return { button: '译', loading: '等待翻译' };
}

function setDocumentTranslationLoading(active, completed = 0, total = 0) {
    const status = document.getElementById('document-translation-loading');
    if (!status) return;

    if (!active) {
        status.classList.remove('active');
        status.textContent = '';
        return;
    }

    const { loading } = getDocumentTranslationUiText();
    status.textContent = total > 0 ? `${loading} ${Math.min(completed, total)}/${total}` : `${loading}…`;
    status.classList.add('active');
}

function updateDocumentTranslationControls() {
    const button = document.getElementById('document-translation-toggle');
    const label = document.getElementById('document-translation-toggle-label');
    if (!button || !label) return;

    const isDocument = Boolean(activeAttachmentItem && ['pdf', 'text'].includes(activeAttachmentItem.mode));
    const targetLang = getDocumentTranslationTargetLang();
    const isSourceLanguage = targetLang === 'zh';
    const { button: buttonText } = getDocumentTranslationUiText(targetLang);

    label.textContent = buttonText;
    button.classList.toggle('visible', isDocument);
    button.classList.toggle('active', isDocument && documentTranslationEnabled && !isSourceLanguage);
    button.classList.toggle('source-language', isDocument && isSourceLanguage);
    button.disabled = !isDocument || isSourceLanguage;
    button.setAttribute('aria-pressed', String(Boolean(documentTranslationEnabled && !isSourceLanguage)));
    button.setAttribute('aria-label', isSourceLanguage ? 'Source language · translation off' : 'Toggle document translation');

    if (!isDocument || isSourceLanguage || !documentTranslationEnabled) {
        setDocumentTranslationLoading(false);
    }
}

function syncDocumentTranslationPreference({ onOpen = false } = {}) {
    const targetLang = getDocumentTranslationTargetLang();

    // Simplified Chinese is the archival source. Chinese UI always opens in original mode.
    if (targetLang === 'zh') {
        documentTranslationEnabled = false;
    } else if (documentTranslationUserChoice === null) {
        // EN / JA may auto-open the translation layer until the visitor explicitly
        // chooses a preference with the top-right switch.
        documentTranslationEnabled = true;
    } else {
        documentTranslationEnabled = documentTranslationUserChoice;
    }

    updateDocumentTranslationControls();
}

function refreshInlineDocumentTranslation() {
    const item = activeAttachmentItem;
    if (!item || !['pdf', 'text'].includes(item.mode)) {
        updateDocumentTranslationControls();
        return;
    }

    const targetLang = getDocumentTranslationTargetLang();
    const requestToken = ++documentTranslationToken;
    updateDocumentTranslationControls();

    if (targetLang === 'zh' || !documentTranslationEnabled) {
        clearInlineDocumentTranslation();
        return;
    }

    if (item.mode === 'pdf') {
        translatePdfBlocksInline(targetLang, requestToken);
    } else if (item.mode === 'text') {
        translateTxtInline(targetLang, requestToken);
    }
}

window.handleDocumentLanguageChange = function handleDocumentLanguageChange() {
    if (!activeAttachmentItem || !['pdf', 'text'].includes(activeAttachmentItem.mode)) return;
    syncDocumentTranslationPreference();
    refreshInlineDocumentTranslation();
};

document.addEventListener('click', event => {
    const button = event.target.closest('#document-translation-toggle');
    if (!button || button.disabled) return;

    event.preventDefault();
    event.stopPropagation();

    documentTranslationEnabled = !documentTranslationEnabled;
    documentTranslationUserChoice = documentTranslationEnabled;
    ++documentTranslationToken;
    updateDocumentTranslationControls();

    if (documentTranslationEnabled) {
        refreshInlineDocumentTranslation();
    } else {
        clearInlineDocumentTranslation();
    }
});

function switchLanguage(targetLang) {
    const vault = languageVault[targetLang];
    if (!vault) return;

    window.currentLang = targetLang;
    document.documentElement.lang = targetLang === 'ja' ? 'ja' : targetLang === 'en' ? 'en' : 'zh-Hans';
    if (vault.document_title) document.title = vault.document_title;
    window.handleDocumentLanguageChange?.(targetLang);

    const elementsToTranslate = document.querySelectorAll('[data-i18n]');

    elementsToTranslate.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const targetText = vault[key];

        if (targetText && el.innerText !== targetText) {

            const randomDelay = Math.random() * 200;

            setTimeout(() => {
                cyberDecodeTranslate(el, targetText, 1000);
            }, randomDelay);
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const wheelContainer = document.getElementById('title-language-wheel');
    const wheelTrack = document.getElementById('wheel-track');

    if (!wheelContainer || !wheelTrack) return;

    const items = wheelTrack.querySelectorAll('.wheel-item');

    const dots = wheelContainer.querySelectorAll('.indicator-row');

    let currentIndex = 0;
    const totalLangs = items.length;
    const itemHeight = 30;


    wheelContainer.addEventListener('click', (e) => {
        e.stopPropagation();


        currentIndex = (currentIndex + 1) % totalLangs;


        wheelTrack.style.transform = `translateY(-${currentIndex * itemHeight}px)`;


        items.forEach((item, idx) => {
            if (idx === currentIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });


        const targetLang = items[currentIndex].getAttribute('data-lang');

        if (typeof switchLanguage === 'function') {


            switchLanguage(targetLang);
        }
    });


    wheelContainer.addEventListener('wheel', (e) => {
        e.preventDefault();


        if (wheelContainer.isScrolling) return;
        wheelContainer.isScrolling = true;

        if (e.deltaY > 0) {
            currentIndex = (currentIndex + 1) % totalLangs;
        } else {
            currentIndex = (currentIndex - 1 + totalLangs) % totalLangs;
        }

        wheelTrack.style.transform = `translateY(-${currentIndex * itemHeight}px)`;

        items.forEach((item, idx) => item.classList.toggle('active', idx === currentIndex));
        dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentIndex));

        const targetLang = items[currentIndex].getAttribute('data-lang');
        if (typeof switchLanguage === 'function') switchLanguage(targetLang);

        setTimeout(() => { wheelContainer.isScrolling = false; }, 300);
    });
});


let isDraggingCompass = false;
let edgePanRAF = null;
let compassX = window.innerWidth / 2;
let compassY = window.innerHeight / 2;

document.addEventListener('DOMContentLoaded', () => {
    const compassContainer = document.querySelector('.compass-container');
    const compassHandle = document.getElementById('compass-handle');

    if (!compassContainer || !compassHandle) return;


    compassHandle.addEventListener('pointerdown', (e) => {
        isDraggingCompass = true;
        L.DomEvent.stopPropagation(e);
    });


    window.addEventListener('pointermove', (e) => {
        if (!isDraggingCompass) return;

        const halfW = compassContainer.offsetWidth / 2;
        const halfH = compassContainer.offsetHeight / 2;


        compassX = Math.max(15 + halfW, Math.min(e.clientX, window.innerWidth - 15 - halfW));
        compassY = Math.max(15 + halfH, Math.min(e.clientY, window.innerHeight - 15 - halfH));

        compassContainer.style.left = `${compassX}px`;
        compassContainer.style.top = `${compassY}px`;
        compassContainer.style.transform = `translate(-50%, -50%)`;

        window.updateCompassDirection();


        handleEdgePanning(e.clientX, e.clientY);
    });


    window.addEventListener('pointerup', () => {
        if (isDraggingCompass) {
            isDraggingCompass = false;
            cancelAnimationFrame(edgePanRAF);
            edgePanRAF = null;
        }
    });


    function handleEdgePanning(pointerX, pointerY) {
        cancelAnimationFrame(edgePanRAF);
        const edgeThreshold = 140;
        const maxSpeed = 18;

        let panX = 0;
        let panY = 0;


        if (pointerX < edgeThreshold) {
            panX = -((edgeThreshold - pointerX) / edgeThreshold) * maxSpeed;
        } else if (window.innerWidth - pointerX < edgeThreshold) {
            panX = ((edgeThreshold - (window.innerWidth - pointerX)) / edgeThreshold) * maxSpeed;
        }

        if (pointerY < edgeThreshold) {
            panY = -((edgeThreshold - pointerY) / edgeThreshold) * maxSpeed;
        } else if (window.innerHeight - pointerY < edgeThreshold) {
            panY = ((edgeThreshold - (window.innerHeight - pointerY)) / edgeThreshold) * maxSpeed;
        }


        if (panX !== 0 || panY !== 0) {
            function panLoop() {
                if (!isDraggingCompass) return;
                map.panBy([panX, panY], { animate: false });
                window.updateCompassDirection();
                edgePanRAF = requestAnimationFrame(panLoop);
            }
            panLoop();
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {
// Global compass · v56 lazy hydration
    const compassModule = document.getElementById('global-compass-module');
    const compassWheel = document.getElementById('compass-site-wheel');
    const compassBtn = document.getElementById('global-compass-btn');
    const compassThumbnailFrame = document.getElementById('compass-thumbnail-frame');

    if (!compassModule || !compassWheel || !compassBtn) return;

    let wheelBuilt = false;
    let scrollTimeout = null;
    let lastSelectedIndex = -1;

    function buildCompassWheelOnce() {
        if (wheelBuilt) return;
        wheelBuilt = true;
        compassWheel.innerHTML = '';

        // Keep the authored five-block looping behaviour, but allocate it only
        // after the visitor actually opens the compass.
        const loopCount = 5;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < loopCount; i++) {
            sites.forEach((site, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'compass-wheel-item';
                const tags = siteTagsMapping[site.name] || '';
                itemDiv.setAttribute('data-tags', tags);
                itemDiv.setAttribute('data-tag', tags);
                itemDiv.setAttribute('data-i18n', `site_name_${site.name}`);
                itemDiv.dataset.realIndex = index;
                itemDiv.innerText = site.name;
                fragment.appendChild(itemDiv);
            });
        }
        compassWheel.appendChild(fragment);
        syncLanguageSubtree(compassWheel);
        window.refreshArchiveIndexFilter?.();

        // One delegated click listener replaces one listener per wheel item.
        compassWheel.addEventListener('click', (e) => {
            const itemDiv = e.target.closest('.compass-wheel-item');
            if (!itemDiv) return;
            e.stopPropagation();
            const wheelCenter = compassWheel.clientHeight / 2;
            compassWheel.scrollTo({
                top: itemDiv.offsetTop - wheelCenter + itemDiv.offsetHeight / 2,
                behavior: 'smooth'
            });
        });

        compassWheel.addEventListener('scroll', () => {
            const itemHeight = 18;
            const singleBlockHeight = itemHeight * sites.length;
            if (compassWheel.scrollTop < singleBlockHeight) {
                compassWheel.scrollTop += singleBlockHeight * 2;
            } else if (compassWheel.scrollTop >= singleBlockHeight * 3) {
                compassWheel.scrollTop -= singleBlockHeight * 2;
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const wheelCenter = compassWheel.scrollTop + compassWheel.clientHeight / 2;
                const items = compassWheel.querySelectorAll('.compass-wheel-item');
                let closestItem = null;
                let minDiff = Infinity;

                items.forEach(item => {
                    const itemCenter = item.offsetTop + item.offsetHeight / 2;
                    const diff = Math.abs(wheelCenter - itemCenter);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestItem = item;
                    }
                });

                if (!closestItem) return;
                const realIndex = parseInt(closestItem.dataset.realIndex, 10);
                if (realIndex === lastSelectedIndex) return;
                lastSelectedIndex = realIndex;

                items.forEach(el => el.classList.toggle(
                    'active',
                    parseInt(el.dataset.realIndex, 10) === realIndex
                ));

                const selectedSite = sites[realIndex];
                if (compassThumbnailFrame) {
                    mountStaticThumbnail(compassThumbnailFrame, selectedSite);
                }

                const targetMarkerData = markers[realIndex];
                if (targetMarkerData?.marker && window.setCompassTarget) {
                    window.setCompassTarget(targetMarkerData.marker);
                }
            }, 150);
        }, { passive: true });

        requestAnimationFrame(() => {
            const itemHeight = 18;
            compassWheel.scrollTop = itemHeight * sites.length * 2;
            compassWheel.dispatchEvent(new Event('scroll'));
        });
    }

    compassBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = compassModule.classList.toggle('expanded');

        if (isExpanded) {
            buildCompassWheelOnce();
            if (window.showCompass) window.showCompass();
            requestAnimationFrame(() => compassWheel.dispatchEvent(new Event('scroll')));
        } else if (window.hideCompass) {
            window.hideCompass();
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    let mobileListsBuilt = false;

    function buildMobileListsOnce() {
        if (mobileListsBuilt) return;
        const leftList = document.getElementById('mobile-record-list');
        const rightList = document.getElementById('mobile-garden-list');
        if (!leftList || !rightList) return;
        mobileListsBuilt = true;

        leftList.innerHTML = '';
        rightList.innerHTML = '';

        const gardenSites = sites.filter(site => site.type === 'garden');
        const recordSites = sites.filter(site => site.type !== 'garden');

        const renderList = (siteArray, container, isGarden) => {
            const fragment = document.createDocumentFragment();
            const titleEl = document.createElement('div');
            titleEl.className = 'mobile-drawer-title';
            titleEl.innerHTML = isGarden
                ? `<span data-i18n="bottom_trigger_ruin">⁙废墟园林・编</span>`
                : `<span data-i18n="bottom_trigger_record">遗构录・卷</span>`;
            fragment.appendChild(titleEl);

            siteArray.forEach(site => {
                const item = document.createElement('div');
                item.className = 'mobile-list-item';
                const tags = siteTagsMapping[site.name] || '';
                item.setAttribute('data-tags', tags);
                item.setAttribute('data-tag', tags);
                item.dataset.siteIndex = String(sites.indexOf(site));
                item.innerHTML = `<span data-i18n="site_name_${site.name}">${site.name}</span>`;
                fragment.appendChild(item);
            });
            container.appendChild(fragment);
        };

        renderList(recordSites, leftList, false);
        renderList(gardenSites, rightList, true);
        syncLanguageSubtree(leftList);
        syncLanguageSubtree(rightList);
        window.refreshArchiveIndexFilter?.();
    }

    const btnLeft = document.getElementById('btn-left-menu');
    const btnRight = document.getElementById('btn-right-menu');
    const drawerLeft = document.getElementById('mobile-left-drawer');
    const drawerRight = document.getElementById('mobile-right-drawer');

    const handleMobileItemClick = (e) => {
        const item = e.target.closest('.mobile-list-item');
        if (!item) return;
        e.stopPropagation();
        const originalIndex = Number(item.dataset.siteIndex);
        const site = sites[originalIndex];
        if (site && typeof flyToSite === 'function') flyToSite(site, originalIndex);
        drawerLeft?.classList.remove('open');
        drawerRight?.classList.remove('open');
    };
    drawerLeft?.addEventListener('click', handleMobileItemClick);
    drawerRight?.addEventListener('click', handleMobileItemClick);

    if (btnLeft && drawerLeft) {
        btnLeft.addEventListener('click', (e) => {
            e.stopPropagation();
            buildMobileListsOnce();
            drawerLeft.classList.toggle('open');
            drawerRight?.classList.remove('open');
        });
    }

    if (btnRight && drawerRight) {
        btnRight.addEventListener('click', (e) => {
            e.stopPropagation();
            buildMobileListsOnce();
            drawerRight.classList.toggle('open');
            drawerLeft?.classList.remove('open');
        });
    }

    document.addEventListener('click', (e) => {
        if (drawerLeft?.classList.contains('open') && !drawerLeft.contains(e.target)) {
            drawerLeft.classList.remove('open');
        }
        if (drawerRight?.classList.contains('open') && !drawerRight.contains(e.target)) {
            drawerRight.classList.remove('open');
        }
    });
});


// Archive submission link
(() => {
    const link = document.getElementById('archive-add-link');
    if (!link) return;
    link.addEventListener('click', () => {
        const lang = window.currentLang || 'zh';
        link.href = `archive-system.html?lang=${encodeURIComponent(lang)}`;
    });
})();
