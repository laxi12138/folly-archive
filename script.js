
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
const membraneEffectInterval = 1000 / 30;

function getMembraneState(currentZoom = map.getZoom()) {
    const triggerZoom = 1;
    const maxZoom = 8;

    if (currentZoom <= triggerZoom) {
        return {
            opacity: 1,
            filter: 'blur(0.4px) contrast(1.8) brightness(1.02) sepia(0.33) invert(0)',
            blend: 'normal'
        };
    }

    const ratio = Math.min(Math.max((currentZoom - triggerZoom) / (maxZoom - triggerZoom), 0), 1);
    const dynamicBlur = 0.40 + (ratio * 2.3);
    const dynamicContrast = 1.8 - (ratio * 0.8);
    const dynamicBrightness = 1.02 + (ratio * 0.7);
    const dynamicInvert = ratio * 0.15;

    return {
        opacity: 1 - (ratio * 0.45),
        filter: `blur(${dynamicBlur.toFixed(3)}px) contrast(${dynamicContrast.toFixed(3)}) brightness(${dynamicBrightness.toFixed(3)}) sepia(0.33) invert(${dynamicInvert.toFixed(3)})`,
        blend: 'multiply'
    };
}

function applyMembraneState(currentZoom = map.getZoom()) {
    const el = ruinWorldPane;
    if (!el) return;

    const state = getMembraneState(currentZoom);

    if (el.style.filter !== state.filter) {
        el.style.filter = state.filter;
    }
    if (el.style.mixBlendMode !== state.blend) {
        el.style.mixBlendMode = state.blend;
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

        // The large SVG filter is expensive. ~30 fps is visually continuous
        // during flyTo while avoiding duplicate filter work on every event.
        if (now - lastMembraneEffectTime < membraneEffectInterval) return;
        lastMembraneEffectTime = now;

        applyMembraneState(map.getZoom());
    });
}

function beginMembraneZoomEffect() {
    const el = ruinWorldPane;
    if (!el) return;
    el.style.willChange = 'filter, opacity';
    lastMembraneEffectTime = 0;
    applyMembraneState(map.getZoom());
}

function applyMembraneFinalEffect() {
    if (membraneEffectRaf !== null) {
        cancelAnimationFrame(membraneEffectRaf);
        membraneEffectRaf = null;
    }

    applyMembraneState(map.getZoom());

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


map.on('popupopen', function () {
    if (window.currentLang) switchLanguage(window.currentLang);
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
const attachmentRegistry = {
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
        desc: '-'
    },
    'radio-rec-2': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-2.jpg',
        desc: '-'
    },
    'radio-rec-3': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-3.jpg',
        desc: '-'
    },
    'radio-rec-4': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-4.jpg',
        desc: '-'
    },
    'radio-rec-5': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-5.jpg',
        desc: '-'
    },
    'radio-rec-6': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-6.jpg',
        desc: '-'
    },
    'radio-rec-7': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-7.jpg',
        desc: '-'
    },
    'radio-rec-8': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-8.jpg',
        desc: '-'
    },
    'radio-rec-9': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-9.jpg',
        desc: '-'
    },
    'radio-rec-10': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-10.jpg',
        desc: '-'
    },
    'radio-rec-11': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-11.jpg',
        desc: '-'
    },
    'radio-rec-12': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/photo-12.jpg',
        desc: '-'
    },
    'radio-map-1': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'pdf',
        src: 'attachments/aether-scorched-earth/mapping.pdf',
        desc: '-'
    },
    'radio-note-1': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'text',
        src: 'attachments/aether-scorched-earth/statement.txt',
        desc: '-'
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
        desc: '-'
    },
    'plague-rec-2': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-2.jpg',
        desc: '-'
    },
    'plague-rec-3': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-3.jpg',
        desc: '-'
    },
    'plague-rec-4': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-4.jpg',
        desc: '-'
    },
    'plague-rec-5': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-5.jpg',
        desc: '-'
    },
    'plague-rec-6': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-6.jpg',
        desc: '-'
    },
    'plague-rec-7': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-7.jpg',
        desc: '-'
    },
    'plague-rec-8': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-1.jpg',
        desc: '-'
    },
    'plague-rec-9': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-2.jpg',
        desc: '-'
    },
    'plague-rec-10': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-3.jpg',
        desc: '-'
    },
    'plague-rec-11': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-4.jpg',
        desc: '-'
    },
    'plague-rec-12': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/photo-5.jpg',
        desc: '-'
    },
    'plague-map-1': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'pdf',
        src: 'attachments/effluent-sedimentation/mapping.pdf',
        desc: '-'
    },
    'plague-note-1': {
        title: 'title_plague_rec',
        type: 'ruin garden record',
        mode: 'text',
        src: 'attachments/effluent-sedimentation/statement.txt',
        desc: '-'
    },

    'north-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-1.jpg',
        desc: ''
    },
    'north-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-2.jpg',
        desc: ''
    },
    'north-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-3.jpg',
        desc: ''
    },
    'north-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-4.jpg',
        desc: ''
    },
    'north-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-5.jpg',
        desc: ''
    },
    'north-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-6.jpg',
        desc: ''
    },
    'north-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-7.jpg',
        desc: ''
    },
    'north-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-8.jpg',
        desc: ''
    },
    'north-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-9.jpg',
        desc: ''
    },
    'north-hum': {
        title: 'specimen_audio',
        mode: 'audio',
        src: 'attachments/fallen-wing-field/wave.wav',
        desc: ''
    },
    'north-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/fallen-wing-field/object-wood-dolomite.jpg',
        desc: ''
    },
    'north-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/fallen-wing-field/object-wood-dolomite-2.jpg',
        desc: ''
    },

    'signal-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-1.jpg',
        desc: ''
    },
    'signal-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-2.jpg',
        desc: ''
    },
    'signal-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-3.jpg',
        desc: ''
    },
    'signal-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-4.jpg',
        desc: ''
    },
    'signal-corridor': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/pano-film-scan-1.jpg',
        desc: ''
    },
    'signal-corridor-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mountain-signal/pano-film-scan-2.jpg',
        desc: ''
    },
    'signal-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-1.jpg',
        desc: ''
    },
    'signal-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-2.jpg',
        desc: ''
    },
    'signal-ticket-3': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-3.jpg',
        desc: ''
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
        desc: ''
    },
    'wave-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-2.jpg',
        desc: ''
    },
    'wave-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-3.jpg',
        desc: ''
    },
    'wave-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/film-scan-4.jpg',
        desc: ''
    },
    'wave-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-1.jpg',
        desc: ''
    },
    'wave-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-2.jpg',
        desc: ''
    },
    'wave-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-3.jpg',
        desc: ''
    },
    'wave-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-4.jpg',
        desc: ''
    },
    'wave-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-5.jpg',
        desc: ''
    },
    'wave-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-6.jpg',
        desc: ''
    },
    'wave-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-7.jpg',
        desc: ''
    },
    'wave-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-8.jpg',
        desc: ''
    },
    'wave-audio': {
        title: 'specimen_audio',
        mode: 'audio',
        src: 'attachments/wave-eroded-structure/ambient.wav',
        desc: ''
    },

    'brick-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-1.jpg',
        desc: ''
    },
    'brick-011': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-2.jpg',
        desc: ''
    },
    'brick-012': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-3.jpg',
        desc: ''
    },
    'brick-013': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/infrared-photo-1.jpg',
        desc: ''
    },
    'brick-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/film-scan-1.jpg',
        desc: ''
    },
    'brick-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/film-scan-2.jpg',
        desc: ''
    },
    'brick-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/brick-battleship/film-scan-3.jpg',
        desc: ''
    },

    'quarry-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-1.jpg',
        desc: ''
    },
    'quarry-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-2.jpg',
        desc: ''
    },
    'quarry-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-3.jpg',
        desc: ''
    },
    'quarry-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/photo-4.jpg',
        desc: ''
    },
    'quarry-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/object-pebble-stack.jpg',
        desc: ''
    },

    'bath-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-1.jpg',
        desc: ''
    },
    'bath-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-2.jpg',
        desc: ''
    },
    'bath-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-3.jpg',
        desc: ''
    },
    'bath-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-4.jpg',
        desc: ''
    },
    'bath-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-5.jpg',
        desc: ''
    },
    'bath-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-6.jpg',
        desc: ''
    },
    'bath-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-7.jpg',
        desc: ''
    },

    'yellow-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-1.jpg',
        desc: ''
    },
    'yellow-012': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-2.jpg',
        desc: ''
    },
    'yellow-013': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-3.jpg',
        desc: ''
    },
    'yellow-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-1.jpg',
        desc: ''
    },
    'yellow-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-2.jpg',
        desc: ''
    },
    'yellow-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-3.jpg',
        desc: ''
    },
    'yellow-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-4.jpg',
        desc: ''
    },
    'yellow-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-5.jpg',
        desc: ''
    },

    'fish-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-1.jpg',
        desc: ''
    },
    'fish-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-2.jpg',
        desc: ''
    },
    'fish-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-3.jpg',
        desc: ''
    },
    'fish-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-4.jpg',
        desc: ''
    },
    'fish-041': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-5.jpg',
        desc: ''
    },
    'fish-042': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-6.jpg',
        desc: ''
    },
    'fish-043': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-7.jpg',
        desc: ''
    },
    'fish-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-1.jpg',
        desc: ''
    },
    'fish-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-2.jpg',
        desc: ''
    },
    'fish-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-3.jpg',
        desc: ''
    },
    'fish-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-4.jpg',
        desc: ''
    },
    'fish-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-5.jpg',
        desc: ''
    },
    'fish-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-6.jpg',
        desc: ''
    },
    'fish-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-7.jpg',
        desc: ''
    },
    'fish-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/fish-mouth/object-bamboo-weaved-cast.jpg',
        desc: ''
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
        desc: ''
    },
    'gloss-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-2.jpg',
        desc: ''
    },
    'gloss-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-3.jpg',
        desc: ''
    },
    'gloss-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-4.jpg',
        desc: ''
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
        desc: ''
    },
    'pole-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/concrete-pole/photo-2.jpg',
        desc: ''
    },
    'pole-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/concrete-pole/photo-3.jpg',
        desc: ''
    },

    'aquarium-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-1.jpg',
        desc: ''
    },
    'aquarium-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-2.jpg',
        desc: ''
    },
    'aquarium-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-3.jpg',
        desc: ''
    },
    'aquarium-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-4.jpg',
        desc: ''
    },
    'aquarium-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-5.jpg',
        desc: ''
    },
    'aquarium-011': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-1.jpg',
        desc: ''
    },
    'aquarium-012': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-2.jpg',
        desc: ''
    },
    'aquarium-013': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-3.jpg',
        desc: ''
    },
    'aquarium-014': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-4.jpg',
        desc: ''
    },
    'aquarium-015': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-5.jpg',
        desc: ''
    },
    'aquarium-016': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-6.jpg',
        desc: ''
    },

    'roof-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-1.jpg',
        desc: ''
    },
    'roof-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-2.jpg',
        desc: ''
    },
    'roof-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-3.jpg',
        desc: ''
    },
    'roof-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/film-scan-1.jpg',
        desc: ''
    },
    'roof-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/roof/film-scan-2.jpg',
        desc: ''
    },
    'roof-ticket-1': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-1.jpg',
        desc: ''
    },
    'roof-ticket-2': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-2.jpg',
        desc: ''
    },
    'roof-ticket-3': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-3.jpg',
        desc: ''
    },
    'roof-ticket-4': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/roof/object-hut-4.jpg',
        desc: ''
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
        desc: ''
    },
    'phospho-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-2.jpg',
        desc: ''
    },
    'phospho-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-3.jpg',
        desc: ''
    },
    'phospho-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-4.jpg',
        desc: ''
    },
    'phospho-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-5.jpg',
        desc: ''
    },
    'phospho-6': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-6.jpg',
        desc: ''
    },
    'phospho-7': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-7.jpg',
        desc: ''
    },
    'phospho-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-1.jpg',
        desc: ''
    },
    'phospho-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-2.jpg',
        desc: ''
    },
    'phospho-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-3.jpg',
        desc: ''
    },
    'phospho-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-4.jpg',
        desc: ''
    },
    'phospho-15': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/phospho/photo-5.jpg',
        desc: ''
    },

    'castle-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/castle/photo-1.jpg',
        desc: ''
    },


    'earthwall-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-1.jpg',
        desc: ''
    },
    'earthwall-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-2.jpg',
        desc: ''
    },
    'earthwall-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-3.jpg',
        desc: ''
    },
    'earthwall-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-4.jpg',
        desc: ''
    },
    'earthwall-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-5.jpg',
        desc: ''
    },
    'earthwall-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-6.jpg',
        desc: ''
    },
    'earthwall-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-7.jpg',
        desc: ''
    },
    'earthwall-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-8.jpg',
        desc: ''
    },
    'earthwall-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/earthwall/photo-9.jpg',
        desc: ''
    },

    'cliffgranary-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-1.jpg',
        desc: ''
    },
    'cliffgranary-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-2.jpg',
        desc: ''
    },
    'cliffgranary-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-3.jpg',
        desc: ''
    },
    'cliffgranary-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-4.jpg',
        desc: ''
    },
    'cliffgranary-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-5.jpg',
        desc: ''
    },
    'cliffgranary-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-6.jpg',
        desc: ''
    },
    'cliffgranary-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-7.jpg',
        desc: ''
    },
    'cliffgranary-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-8.jpg',
        desc: ''
    },
    'cliffgranary-09': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-9.jpg',
        desc: ''
    },
    'cliffgranary-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-10.jpg',
        desc: ''
    },
    'cliffgranary-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-11.jpg',
        desc: ''
    },
    'cliffgranary-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-12.jpg',
        desc: ''
    },
    'cliffgranary-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-13.jpg',
        desc: ''
    },
    'cliffgranary-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/cliff-granary/photo-14.jpg',
        desc: ''
    },
    'cliffgranary-15': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/cliff-granary/object-fence-1.jpg',
        desc: ''
    },
    'cliffgranary-16': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/cliff-granary/object-fence-2.jpg',
        desc: ''
    },

    'dock-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-1.jpg',
        desc: ''
    },
    'dock-2': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-2.jpg',
        desc: ''
    },
    'dock-3': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-3.jpg',
        desc: ''
    },
    'dock-4': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-4.jpg',
        desc: ''
    },
    'dock-5': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-5.jpg',
        desc: ''
    },
    'dock-6': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-6.jpg',
        desc: ''
    },
    'dock-7': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-7.jpg',
        desc: ''
    },
    'dock-8': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-8.jpg',
        desc: ''
    },
    'dock-9': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-9.jpg',
        desc: ''
    },
    'dock-10': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-10.jpg',
        desc: ''
    },
    'dock-11': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-11.jpg',
        desc: ''
    },
    'dock-12': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-12.jpg',
        desc: ''
    },
    'dock-13': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-13.jpg',
        desc: ''
    },
    'dock-14': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-14.jpg',
        desc: ''
    },
    'dock-15': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-15.jpg',
        desc: ''
    },
    'dock-16': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/dock/photo-16.jpg',
        desc: ''
    },

    'walled-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/film-scan-1.jpg',
        desc: ''
    },
    'walled-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/film-scan-2.jpg',
        desc: ''
    },
    'walled-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-1.jpg',
        desc: ''
    },
    'walled-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-2.jpg',
        desc: ''
    },
    'walled-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-3.jpg',
        desc: ''
    },
    'walled-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-4.jpg',
        desc: ''
    },
    'walled-07': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-5.jpg',
        desc: ''
    },
    'walled-ticket': {
        title: 'specimen_object',
        mode: 'image',
        src: 'attachments/walled-gallery/object-fence-shard.jpg',
        desc: ''
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
        desc: ''
    },
    'membrane-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/membrane/film-scan-2.jpg',
        desc: ''
    },
    'membrane-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/membrane/film-scan-3.jpg',
        desc: ''
    },

    'mirror-01': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-1.jpg',
        desc: ''
    },
    'mirror-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-2.jpg',
        desc: ''
    },
    'mirror-03': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-3.jpg',
        desc: ''
    },
    'mirror-04': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-4.jpg',
        desc: ''
    },
    'mirror-05': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-5.jpg',
        desc: ''
    },
    'mirror-06': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/mirror/film-scan-6.jpg',
        desc: ''
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
        desc: ''
    },
    'solar-02': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/solar/film-scan-2.jpg',
        desc: ''
    },

    'rail-1': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/rail-side/photo-1.jpg',
        desc: ''
    },

};


function getRecordCounts(folderName) {

    const counts = {
        visual: 0,
        audio: 0,
        object: 0,
        note: 0
    };

    Object.values(attachmentRegistry).forEach(item => {

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

  const item = attachmentRegistry[id];
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

        currentImageGroup = Object.keys(attachmentRegistry).filter(key => {
            const regItem = attachmentRegistry[key];
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

            activePdfLoadingTask = window.pdfjsLib.getDocument(item.src);
            activePdfLoadingTask.promise.then(function (pdf) {
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


    if (window.currentLang) switchLanguage(window.currentLang);
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

  const videos = stage.querySelectorAll('video');

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


function classifyAttachment(filePath) {

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
        attachmentRegistry
    ).forEach(([id, item]) => {

        if (!item.src) return;

        if (!id.startsWith(prefix))
            return;

        const type =
            classifyAttachment(item.src);

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
<div class="tree-branch tree-folder" onclick="toggleFolder('${folderId}')">
  <span class="tree-line">${branch}</span>
  <span id="${folderId}-icon">[+]</span>

  <span data-i18n="${labelKey}">${fallbackText}</span> (${count})
</div>
<div id="${folderId}" class="tree-children">
  ${makeTreeFiles(files)}
</div>
`;
}


const drawer =
  document.getElementById('archive-drawer');

const mask =
  document.getElementById('drawer-mask');
  mask?.addEventListener('click', closeDrawer);


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
function toggleFolder(id) {

  const folder =
    document.getElementById(id);

  const icon =
    document.getElementById(id + '-icon');

  if (!folder || !icon) return;

    const isOpen =
        folder.classList.contains('open');

    folder.classList.toggle('open');

    folder.style.display =
        isOpen ? 'none' : 'block';

  icon.innerText =
    isOpen ? '[+]' : '[-]';
}


function openDrawer(site, marker) {
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
    const isWalled =
        site.name === "琉棘庭";
    const isNorth =
        site.name === "裂翼坪";
    const isRail =
        site.name === "轨畔孤构";
    const isPole =
        site.name === "残柱林";
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
        site.name === "土还灶垣";
    const isCliffGranary =
        site.name === "崖仓蚀垣";


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
    if (window.currentLang) switchLanguage(window.currentLang);
}


function closeDrawer() {
  const drawer = document.getElementById('archive-drawer');
  const mask = document.getElementById('drawer-mask');

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


    if (window.currentLang) switchLanguage(window.currentLang);
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

    "瘟猪坝沉墟": "ruin, sunken, water, crack",
    "电台路焦土": "scorched, ash, desolate, sand, tower",


    "山葬灰脉": "factory, ash, mountain, ruin",
    "琉棘庭": "room, spike, desolate",
    "裂翼坪": "tree, crack, water, rail, plateau",
    "轨畔孤构": "rail, factory",
    "残柱林": "tree, column, crack, ruin",
    "池骸湾": "remains, water, bay",
    "褶层湾": "bay, factory, eroded",
    "釉骸拓壁": "crack, remains, membrane",
    "叠骸构阵": "ash, factory, remains",
    "苔网塬": "vine, wave, membrane, plateau",
    "陆坞舰骸": "bay, vessel, remains",
    "墟响厅": "ruin, column, room",
    "波蚀脊堤": "water, wave, eroded, shore",
    "曜原驿": "desolate, plateau, dwelling",
    "溶境遗廊": "water, corridor, room, tunnel",
    "荒娱敖包": "desolate, relocated, slope",
    "削岩残居": "ruin, dwelling, slope",
    "彩壳堡": "fort, tower",
    "迁痕空埠": "relocated, port",
    "山骸窟殿": "factory, rail, mountain, remains, tunnel, hall",
    "土还灶垣": "slope, soil, eroded, wall",
    "崖仓蚀垣": "soil, mountain, slope, wall, eroded"
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
    name: "池骸湾",
    desc: "人们曾以巨大的工程将海水引入建筑，把海洋驯服成一座浴场；如今，海重新将建筑收回体内，建筑开始遵循潮汐，而非人们。潮水持续侵蚀池壁与地基，碎石与绿藻逐渐覆满池底。海没有淹没建筑，只是让海岸重新长进了建筑里。",
            lat: 37.78060,
                lng: -122.51370,
                    archiveDate: "2023.08",
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
        desc: "农田之上矗立着一座未完成的城堡。混凝土与钢筋仍裸露于外，外墙却已涂满鲜艳的色彩。童话比建筑更早完成，也比建筑更早荒废。",
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
        name: "土还灶垣",
        desc: "据说这片夯土残墙曾是一座寺院的厨房。风雨沿着夯层逐年削去墙体，棱角变钝，泥土与碎石重新显露。这些墙原本从山土中一层层夯筑而成，如今又一层层剥落回到土地，远看时已逐渐分不清是建筑正在消失，还是山体正在将它收回。",
        lat: 31.6644440,
        lng: 99.6794440,
        archiveDate: "2026.08",
        recorder: "王一川",
        type: "record"
    },
    {
        name: "崖仓蚀垣",
        desc: "这处夯土残构高悬于坡崖之上，墙面一列列孔洞像是木梁曾经穿入后留下的骨位。从形制与位置判断，它或许曾是一座依坡而筑的仓房，也可能兼作守望之所：粮食、柴薪与日常之物被抬上高处，远离潮湿与兽扰，同时俯视着山下的聚落。如今木构早已朽尽，只剩厚重的土墙仍嵌在山体边缘，任风雨沿着梁孔与裂缝持续掏空它，仿佛整座房子正被山坡缓慢吞回。",
        lat: 31.6727778,
        lng: 99.6750000,
        archiveDate: "2026.08",
        recorder: "王一川",
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
            if (currentHoverMarker && currentHoverMarker !== marker) {
                currentHoverMarker.closePopup();
            }
            marker.openPopup();
            currentHoverMarker = marker;
        });

        marker.on('mouseout', () => {
            setTimeout(() => {
                if (lockedMarker === marker) return;
                if (currentHoverMarker === marker) {
                    marker.closePopup();
                    currentHoverMarker = null;
                }
            }, 120);
        });

        marker.on('click', (e) => {
            if (lockedMarker && lockedMarker !== marker) {
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


    if (window.currentLang) switchLanguage(window.currentLang);
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
    ring: document.querySelector('.compass-ring'),
    asterisk: document.querySelector('.compass-asterisk'),
    pointer: document.querySelector('.compass-pointer')
};

function animateCompassPhysics() {

    const overlayElement = document.getElementById('compass-overlay');
    if (!overlayElement || !overlayElement.classList.contains('show')) {
        compassPhysicsRaf = null;
        return;
    }


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

    const asterisk = compassPhysicsEls.asterisk;
    if (asterisk) asterisk.style.transform = `translate(-50%, -50%)`;


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


    compassPhysicsRaf = requestAnimationFrame(animateCompassPhysics);
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

    if (compassPhysicsRaf === null) {
        compassPhysicsRaf = requestAnimationFrame(animateCompassPhysics);
    }

    updateRecordNav();


    updateCompassRingCache();

    window.updateCompassDirection();

    const safeMap = getSafeMap();
    if (safeMap) {
        safeMap.on('move viewreset zoomanim', window.updateCompassDirection);
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
        safeMap.off('move viewreset zoomanim', window.updateCompassDirection);
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

    const rotationAngleDeg = currentRingAngle;
    const rotationAngleRad = rotationAngleDeg * (Math.PI / 180);
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


function flyToSite(site, index, fromIndexDrawer = false) {
    if (typeof closeDrawer === 'function') {
        closeDrawer();
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

map.on('mousemove', e => {
    if (coordsRaf) return;

    coordsRaf = requestAnimationFrame(() => {
        const geo = svgToGeo(e.latlng.lat, e.latlng.lng);
        document.getElementById('coords').innerText = `${formatLat(geo.lat)}   ${formatLng(geo.lng)}`;
        coordsRaf = null;
    });
});


document.addEventListener('click', (e) => {
    if (typeof isClosingViewer !== 'undefined' && isClosingViewer) return;

    const archiveDrawer = document.getElementById('archive-drawer');
    const viewer = document.querySelector('.attachment-viewer');


    if (viewer && viewer.classList.contains('open')) return;


    if (archiveDrawer && archiveDrawer.classList.contains('open')) {
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

function buildFileStacks() {
    const stackGarden = document.getElementById('stack-garden');
    const stackRecord = document.getElementById('stack-record');
    if (!stackGarden || !stackRecord) return;

    stackGarden.innerHTML = '';
    stackRecord.innerHTML = '';

    const gardenSites = sites.filter(site => site.type === 'garden');
    const recordSites = sites.filter(site => site.type !== 'garden');

    function renderStack(siteArray, container, isGarden) {
        const total = siteArray.length;
        const cnNums = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

        siteArray.forEach((site, index) => {
            const docEl = document.createElement('div');
            docEl.className = 'archive-doc';


            const tags = siteTagsMapping[site.name] || "";
            docEl.setAttribute('data-tags', tags);
            docEl.setAttribute('data-tag', tags);


            const positionIndex = (total - 1) - index;
            const verticalGap = isGarden ? 32 : 18;

            docEl.style.top = `${positionIndex * verticalGap}px`;
            if (isGarden) {
                docEl.style.right = `-${positionIndex * 4}px`;
            } else {
                docEl.style.left = `-${positionIndex * 3}px`;
            }

            docEl.style.zIndex = positionIndex;
            docEl.dataset.zIndex = positionIndex;


            const latStr = site.lat >= 0 ? formatLat(-site.lat) : formatLat(Math.abs(site.lat));
            const lngStr = formatLng(site.lng);


            const seq = cnNums[index] || (index + 1);
            const typeKey = isGarden ? 'ui_garden' : 'ui_record';
            const typeText = isGarden ? '废墟园林' : '遗构录';
            const recorderName = site.recorder || '罗清源';
            const creatorMetaHtml = isGarden
                ? `<span data-i18n="ui_creator">墟构师: 罗清源</span>`
                : `<span data-i18n="ui_recorder_label">记录者: </span><span class="doc-recorder-name">${recorderName}</span>`;

            const navKey = 'ui_auto_nav';
            const navText = '自动导航 ⌖';


            const titleTextHtml = isGarden
                ? `<span data-i18n="ui_garden">废墟园林</span> · <span data-i18n="ui_seq_${index + 1}">其${seq}</span> | <span data-i18n="site_name_${site.name}">${site.name}</span>`
                : `<span data-i18n="ui_record">遗构录</span> | <span data-i18n="site_name_${site.name}">${site.name}</span>`;


            let interactionSection = `
                <div class="doc-meta" style="margin-bottom: 8px;">${latStr.trim()} ${lngStr.trim()}</div>
                <div class="doc-coord-btn ${isGarden ? 'garden-nav-btn' : 'compass-btn'}" data-i18n="${navKey}">${navText}</div>
            `;

            docEl.innerHTML = `
                <div class="doc-meta">[ <span data-i18n="${typeKey}">${typeText}</span> ] | <span data-i18n="ui_archive_date">归档: </span>${site.archiveDate}</div>
                <div class="doc-title">${titleTextHtml}</div>
                <div class="doc-meta">${creatorMetaHtml}</div>
                ${interactionSection}
            `;


            docEl.addEventListener('click', (e) => {
                if (e.target.closest('.doc-coord-btn') || e.target.closest('.doc-title')) return;
                e.stopPropagation();

                document.querySelectorAll('.archive-doc.extracted').forEach(el => {
                    if (el !== docEl) {
                        el.classList.remove('extracted');
                        el.style.zIndex = el.dataset.zIndex;
                    }
                });

                const isExtracted = docEl.classList.toggle('extracted');
                if (isExtracted) {
                    docEl.style.zIndex = docEl.dataset.zIndex;
                } else {
                    docEl.style.zIndex = docEl.dataset.zIndex;
                }
            });


            const coordBtn = docEl.querySelector('.doc-coord-btn');
            const titleEl = docEl.querySelector('.doc-title');

            if (coordBtn) {
                coordBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const originalIndex = sites.indexOf(site);


                    const indexDrawer = document.getElementById('index-drawer');
                    if (indexDrawer && indexDrawer.classList.contains('open')) {

                        window.closeIndexDrawerWithAnim(true);

                        setTimeout(() => {

                            if (typeof flyToSite === 'function') flyToSite(site, originalIndex, true);
                        }, 400);
                    } else {


                        if (typeof flyToSite === 'function') flyToSite(site, originalIndex, false);
                    }
                });
            }


            if (titleEl && coordBtn) {
                titleEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    coordBtn.click();
                });
            }
            container.appendChild(docEl);
        });
    }

    renderStack(gardenSites, stackGarden, true);
    renderStack(recordSites, stackRecord, false);

    if (window.currentLang) switchLanguage(window.currentLang);
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.archive-doc') && !e.target.closest('#collapse-compass-btn')) {
        document.querySelectorAll('.archive-doc.extracted').forEach(el => {
            el.classList.remove('extracted');
            el.style.zIndex = el.dataset.zIndex;
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
// Global compass
    const compassModule = document.getElementById('global-compass-module');
    const compassWheel = document.getElementById('compass-site-wheel');
    const compassBtn = document.getElementById('global-compass-btn');

    if (!compassModule || !compassWheel || !compassBtn) return;

    compassWheel.innerHTML = '';


    const loopCount = 5;

    for (let i = 0; i < loopCount; i++) {
        sites.forEach((site, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'compass-wheel-item';
            const tags = siteTagsMapping[site.name] || "";
            itemDiv.setAttribute('data-tags', tags);
            itemDiv.setAttribute('data-tag', tags);
            itemDiv.setAttribute('data-i18n', `site_name_${site.name}`);
            itemDiv.dataset.realIndex = index;
            itemDiv.innerText = site.name;


            itemDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                const wheelCenter = compassWheel.clientHeight / 2;
                compassWheel.scrollTo({
                    top: itemDiv.offsetTop - wheelCenter + itemDiv.offsetHeight / 2,
                    behavior: 'smooth'
                });
            });

            compassWheel.appendChild(itemDiv);
        });
    }


    requestAnimationFrame(() => {
        const items = compassWheel.querySelectorAll('.compass-wheel-item');
        if (items.length > 0) {
            const itemHeight = 18;
            const singleBlockHeight = itemHeight * sites.length;


            compassWheel.scrollTop = singleBlockHeight * 2;


            compassWheel.addEventListener('scroll', () => {

                if (compassWheel.scrollTop < singleBlockHeight) {
                    compassWheel.scrollTop += singleBlockHeight * 2;
                }

                else if (compassWheel.scrollTop >= singleBlockHeight * 3) {
                    compassWheel.scrollTop -= singleBlockHeight * 2;
                }
            });
        }
    });


    let scrollTimeout;
    let lastSelectedIndex = -1;

    compassWheel.addEventListener('scroll', () => {

        clearTimeout(scrollTimeout);


        scrollTimeout = setTimeout(() => {

            const wheelCenter = compassWheel.scrollTop + compassWheel.clientHeight / 2;
            let closestItem = null;
            let minDiff = Infinity;

            compassWheel.querySelectorAll('.compass-wheel-item').forEach(item => {
                const itemCenter = item.offsetTop + item.offsetHeight / 2;
                const diff = Math.abs(wheelCenter - itemCenter);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestItem = item;
                }
            });

            if (closestItem) {
                const realIndex = parseInt(closestItem.dataset.realIndex);


                if (realIndex !== lastSelectedIndex) {
                    lastSelectedIndex = realIndex;


                    compassWheel.querySelectorAll('.compass-wheel-item').forEach(el => el.classList.remove('active'));
                    compassWheel.querySelectorAll(`.compass-wheel-item[data-real-index="${realIndex}"]`)
                        .forEach(el => el.classList.add('active'));


                    const targetMarkerData = markers[realIndex];
                    if (targetMarkerData && targetMarkerData.marker) {
                        if (window.setCompassTarget) window.setCompassTarget(targetMarkerData.marker);
                    }
                }
            }
        }, 150);
    });


    compassBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = compassModule.classList.toggle('expanded');

        if (isExpanded) {
            if (window.showCompass) window.showCompass();

            compassWheel.dispatchEvent(new Event('scroll'));
        } else {
            if (window.hideCompass) window.hideCompass();
        }
    });


});


document.addEventListener('DOMContentLoaded', () => {

    function buildMobileLists() {
        const leftList = document.getElementById('mobile-record-list');
        const rightList = document.getElementById('mobile-garden-list');
        if (!leftList || !rightList) return;

        leftList.innerHTML = '';
        rightList.innerHTML = '';

        const gardenSites = sites.filter(site => site.type === 'garden');
        const recordSites = sites.filter(site => site.type !== 'garden');

        const renderList = (siteArray, container, isGarden) => {

            const titleEl = document.createElement('div');
            titleEl.className = 'mobile-drawer-title';
            if (isGarden) {
                titleEl.innerHTML = `<span data-i18n="bottom_trigger_ruin">⁙废墟园林・编</span>`;
            } else {
                titleEl.innerHTML = `<span data-i18n="bottom_trigger_record">遗构录・卷</span>`;
            }
            container.appendChild(titleEl);

            siteArray.forEach((site) => {
                const item = document.createElement('div');
                item.className = 'mobile-list-item';


                const tags = siteTagsMapping[site.name] || "";
                item.setAttribute('data-tags', tags);
                item.setAttribute('data-tag', tags);


                item.innerHTML = `<span data-i18n="site_name_${site.name}">${site.name}</span>`;


                item.onclick = (e) => {
                    e.stopPropagation();
                    const originalIndex = sites.indexOf(site);
                    if (typeof flyToSite === 'function') flyToSite(site, originalIndex);


                    document.getElementById('mobile-left-drawer').classList.remove('open');
                    document.getElementById('mobile-right-drawer').classList.remove('open');
                };
                container.appendChild(item);
            });
        };


        renderList(recordSites, leftList, false);
        renderList(gardenSites, rightList, true);
    }


    setTimeout(buildMobileLists, 350);


    const btnLeft = document.getElementById('btn-left-menu');
    const btnRight = document.getElementById('btn-right-menu');
    const drawerLeft = document.getElementById('mobile-left-drawer');
    const drawerRight = document.getElementById('mobile-right-drawer');

    if (btnLeft && drawerLeft) {
        btnLeft.addEventListener('click', (e) => {
            e.stopPropagation();
            drawerLeft.classList.toggle('open');
            if (drawerRight) drawerRight.classList.remove('open');
        });
    }

    if (btnRight && drawerRight) {
        btnRight.addEventListener('click', (e) => {
            e.stopPropagation();
            drawerRight.classList.toggle('open');
            if (drawerLeft) drawerLeft.classList.remove('open');
        });
    }


    document.addEventListener('click', (e) => {
        if (drawerLeft && drawerLeft.classList.contains('open') && !drawerLeft.contains(e.target)) {
            drawerLeft.classList.remove('open');
        }
        if (drawerRight && drawerRight.classList.contains('open') && !drawerRight.contains(e.target)) {
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
