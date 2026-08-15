
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

                if (window.innerWidth <= 768) {
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
const width = 4000;
const height = 3000;
let focusLocked = false;
let isClosingViewer = false;
let currentVideo = null;
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let currentImageGroup = [];
let currentImageIndex = -1;
const pdfScale = 2;
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

const overlay = L.imageOverlay(
    'assets/ruin-map.svg',
    bounds
).addTo(map);

overlay.on('load', () => {
    const el = overlay.getElement();
    if (!el) return;
    el.style.filter =
        'blur(0.40px) contrast(1.8) brightness(1.02) sepia(0.33)';
});

map.fitBounds(bounds);


let membraneOpacityRaf = null;

function getMembraneState(currentZoom = map.getZoom()) {
    const triggerZoom = 1;
    const maxZoom = 8;

    if (currentZoom <= triggerZoom) {
        return {
            opacity: 1,
            filter: 'blur(0.4px) contrast(1.8) brightness(1.02) sepia(0.33)',
            blend: 'normal'
        };
    }

    const ratio = Math.min((currentZoom - triggerZoom) / (maxZoom - triggerZoom), 1);
    const dynamicBlur = 0.40 + (ratio * 2.3);
    const dynamicContrast = 1.8 - (ratio * 0.8);
    const dynamicBrightness = 1.02 + (ratio * 0.7);
    const dynamicInvert = ratio * 0.15;

    return {
        opacity: 1 - (ratio * 0.45),
        filter: `blur(${dynamicBlur}px) contrast(${dynamicContrast}) brightness(${dynamicBrightness}) sepia(0.33) invert(${dynamicInvert})`,
        blend: 'multiply'
    };
}


function updateMembraneDuringZoom() {
    if (membraneOpacityRaf !== null) return;

    membraneOpacityRaf = requestAnimationFrame(() => {
        const el = overlay.getElement();
        if (el) {
            const { opacity } = getMembraneState();
            const nextOpacity = String(opacity);
            if (el.style.opacity !== nextOpacity) el.style.opacity = nextOpacity;
        }
        membraneOpacityRaf = null;
    });
}


function applyMembraneFinalEffect() {
    const el = overlay.getElement();
    if (!el) return;

    const state = getMembraneState();
    if (el.style.filter !== state.filter) el.style.filter = state.filter;
    if (el.style.mixBlendMode !== state.blend) el.style.mixBlendMode = state.blend;

    const nextOpacity = String(state.opacity);
    if (el.style.opacity !== nextOpacity) el.style.opacity = nextOpacity;
}

map.on('zoom', updateMembraneDuringZoom);
map.on('zoomend', applyMembraneFinalEffect);
applyMembraneFinalEffect();


const mapCenter = L.latLng(height / 2, width / 2);


const maxRadius = width / 2;


map.on('drag', function () {
    const currentCenter = map.getCenter();


    const dy = currentCenter.lat - mapCenter.lat;
    const dx = currentCenter.lng - mapCenter.lng;
    const distance = Math.sqrt(dx * dx + dy * dy);


    if (distance > maxRadius) {

        const angle = Math.atan2(dy, dx);


        const limitedLat = mapCenter.lat + maxRadius * Math.sin(angle);
        const limitedLng = mapCenter.lng + maxRadius * Math.cos(angle);


        map.panTo([limitedLat, limitedLng], { animate: false });
    }
});


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
            <iframe class="archive-text-frame" src="${item.src}"></iframe>
        `;
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
              <div id="pdf-loading" style="position: absolute;" data-i18n="ui_pdf_loading">讀取圖紙中...</div>
              <canvas id="pdf-canvas" class="attachment-image"></canvas>
          `;
            if (pdfHud) pdfHud.style.display = 'flex';

            window.pdfjsLib.getDocument(item.src).promise.then(function (pdf) {
                pdfDoc = pdf;
                document.getElementById('pdf-page-num').innerText = `1 / ${pdfDoc.numPages}`;
                renderPage(1);
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
      if (pdfDoc) {
          pdfDoc.destroy().then(() => {
              pdfDoc = null;
          });
      }

  v.ontimeupdate = null;

  v.src = '';
  v.load();
});


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

    if (e.target.id === 'pdf-prev') {
        e.stopPropagation();
        if (pdfDoc && pageNum > 1) {
            pageNum--;
            queueRenderPage(pageNum);
        }
        return;
    }

    if (e.target.id === 'pdf-next') {
        e.stopPropagation();
        if (pdfDoc && pageNum < pdfDoc.numPages) {
            pageNum++;
            queueRenderPage(pageNum);
        }
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


    const i18nKey = titleKey === '遺構錄' ? 'ui_record' : titleKey;


    const titleFallback = titleKey === '遺構錄' ? '遺構錄' : titleKey;

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
        'specimen_visual': '視覺標本',
        'specimen_audio': '聲音標本',
        'specimen_object': '物件標本',
        'specimen_note': '註釋卡'
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
        site.name === "瘟豬壩沉墟";
    const isRadio =
        site.name === "電臺路焦土";
    const isYellow =
        site.name === "山葬灰脈";
    const isWalled =
        site.name === "琉棘庭";
    const isNorth =
        site.name === "裂翼坪";
    const isRail =
        site.name === "軌畔孤構";
    const isPole =
        site.name === "残柱林";
    const isBath =
        site.name === "池骸灣";
    const isQuarry =
        site.name === "褶層灣";
    const isMembrane =
        site.name === "釉骸拓壁";
    const isFish =
        site.name === "疊骸構陣";
    const isGloss =
        site.name === "苔網塬";
    const isBrick =
        site.name === "陸塢艦骸";
    const isMirror =
        site.name === "墟響廳";
    const isWave =
        site.name === "波蝕脊堤";
    const isSolar =
        site.name === "曜原驛";
    const isAquarium =
        site.name === "溶境遺廊";
    const isSignal =
        site.name === "荒娛敖包";
    const isRoof =
        site.name === "削巖殘居";
    const isCastle =
        site.name === "彩殼堡";
    const isDock =
        site.name === "遷痕空埠";
    const isPhospho =
        site.name === "山骸窟殿";


    const currentSiteName = site.name;
    const siteTags = siteTagsMapping[currentSiteName] || "";

    let treeHTML = '';

    if (isRadio) {
        treeHTML = `
  <div class="archive-tree">
  <div class="fault-node fault-root tree-folder" onclick="toggleArchiveTree(this)">
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_garden_archive">廢墟園林檔案</span>
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
  <span data-i18n="ui_record">遺構錄</span>
</div>
<div class="tree-collapse archive-record-collapse">

  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_img_files">圖像檔案</span> (12)
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
  <span data-i18n="ui_map_files">測繪檔案</span> (1)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-map-1')">
      &nbsp;&nbsp;&nbsp;&nbsp;└── mapping.pdf
    </div>
  </div>

<div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_txt_files">文字檔案</span> (1)
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
[<span data-i18n="ui_graphic_score">圖形記譜</span>]
</div>
  <div class="fault-line-c">
    ╲
  </div>
  <div class="tree-file crack-b" onclick="openAttachmentViewer('radio-instrument')">
[<span data-i18n="ui_instrument_demo">樂器演示</span>]
  </div>
  <div class="fault-line-d">
    ╱
  </div>
  <div class="tree-file crack-c" onclick="openAttachmentViewer('radio-film')">
[<span data-i18n="ui_ruin_theater">廢墟劇場</span>]
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
    <span data-i18n="ui_garden_archive">廢墟園林檔案</span>
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
  <span data-i18n="ui_record">遺構錄</span>
</div>
<div class="tree-collapse archive-record-collapse">

  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_img_files">圖像檔案</span> (12)
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
  <span data-i18n="ui_map_files">測繪檔案</span> (1)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('plague-map-1')">
      &nbsp;&nbsp;&nbsp;&nbsp;└── mapping.pdf
    </div>
  </div>

<div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_txt_files">文字檔案</span> (1)
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
      [<span data-i18n="ui_graphic_score">圖形記譜</span>]
    </div>
    <div class="fault-line-c">
      ╲
    </div>
    <div class="tree-file crack-b" onclick="openAttachmentViewer('plague-audio')">
      [<span data-i18n="ui_instrument_demo">樂器演示</span>]
    </div>
    <div class="fault-line-d">
      ╱
    </div>
    <div class="tree-file crack-c" onclick="openAttachmentViewer('plague-film')">
      [<span data-i18n="ui_ruin_theater">廢墟劇場</span>]
    </div>
  </div>
</div>
`;


    }
else if (isNorth) {

        treeHTML =
            buildArchiveTree(
                'north',
                '遺構錄'
            );

    }
else if (isSignal) {

    treeHTML =
        buildArchiveTree(
            'signal',
            '遺構錄'
        );

}
else if (isWave) {

    treeHTML =
        buildArchiveTree(
            'wave',
            '遺構錄'
        );

} else if (isBrick) {

    treeHTML =
        buildArchiveTree(
            'brick',
            '遺構錄'
        );

}
else if (isQuarry) {

    treeHTML =
        buildArchiveTree(
            'quarry',
            '遺構錄'
        );

}
else if (isBath) {

    treeHTML =
        buildArchiveTree(
            'bath',
            '遺構錄'
        );

}

else if (isYellow) {

    treeHTML =
        buildArchiveTree(
            'yellow',
            '遺構錄'
        );

}
else if (isFish) {

    treeHTML =
        buildArchiveTree(
            'fish',
            '遺構錄'
        );

}
else if (isGloss) {

    treeHTML =
        buildArchiveTree(
            'gloss',
            '遺構錄'
        );

}
else if (isPole) {

    treeHTML =
        buildArchiveTree(
            'pole',
            '遺構錄'
        );

}
else if (isAquarium) {

    treeHTML =
        buildArchiveTree(
            'aquarium',
            '遺構錄'
        );

    }
    else if (isRoof) {

        treeHTML =
            buildArchiveTree(
                'roof',
                '遺構錄'
            );

    }
    else if (isPhospho) {

        treeHTML =
            buildArchiveTree(
                'phospho',
                '遺構錄'
            );

    }
    else if (isCastle) {

        treeHTML =
            buildArchiveTree(
                'castle',
                '遺構錄'
            );

    }
    else if (isDock) {

        treeHTML =
            buildArchiveTree(
                'dock',
                '遺構錄'
            );

    }
    else if (isWalled) {

        treeHTML =
            buildArchiveTree(
                'walled',
                '遺構錄'
            );

    }
    else if (isMembrane) {

        treeHTML =
            buildArchiveTree(
                'membrane',
                '遺構錄'
            );

    }
    else if (isMirror) {

        treeHTML =
            buildArchiveTree(
                'mirror',
                '遺構錄'
            );

    }
    else if (isSolar) {

        treeHTML =
            buildArchiveTree(
                'solar',
                '遺構錄'
            );

    }
    else if (isRail) {

        treeHTML =
            buildArchiveTree(
                'rail',
                '遺構錄'
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
    startHold(() => currentZoom += 0.02);
  }

  else if (e.target.id === 'zoom-out') {
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
    }
  }

  requestAnimationFrame(animate);
}
document.addEventListener('touchstart', (e) => {
  const step = 40;

  const target = e.target;

  if (target.id === 'zoom-in') {
    startHold(() => currentZoom += 0.02);
  }

  else if (target.id === 'zoom-out') {
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
        { time: 0, label: '引序：滯岸之殼', key: 'ch1_0' },
        { time: 20, label: '階段一：餘存維持', key: 'ch1_1' },
        { time: 42, label: '階段二：枯蝕應力', key: 'ch1_2' },
        { time: 56, label: '階段三：磨損掙扎', key: 'ch1_3' },
        { time: 84, label: '階段四：徒勞空撐', key: 'ch1_4' },
        { time: 124, label: '尾聲：崩塌餘響', key: 'ch1_5' }
    ],
    'folly-2': [
        { time: 0, label: '引序：并和狹間', key: 'ch2_0' },
        { time: 28, label: '階段一：非諧構合', key: 'ch2_1' },
        { time: 67, label: '階段二：磨盤震顫', key: 'ch2_2' },
        { time: 105, label: '階段三：風蝕噪層', key: 'ch2_3' },
        { time: 142, label: '階段四：嗡鳴共振', key: 'ch2_4' },
        { time: 198, label: '階段五：以太餘鳴', key: 'ch2_5' },
        { time: 231, label: '尾聲：無實之基', key: 'ch2_6' }
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

  x = x / width;
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

    "瘟豬壩沉墟": "ruin, sunken, water, crack",
    "電臺路焦土": "scorched, ash, desolate, sand, tower",


    "山葬灰脈": "factory, ash, mountain, ruin",
    "琉棘庭": "room, spike, desolate",
    "裂翼坪": "tree, crack, water, rail, plateau",
    "軌畔孤構": "rail, factory",
    "残柱林": "tree, column, crack, ruin",
    "池骸灣": "remains, water, bay",
    "褶層灣": "bay, factory, eroded",
    "釉骸拓壁": "crack, remains, membrane",
    "疊骸構陣": "ash, factory, remains",
    "苔網塬": "vine, wave, membrane, plateau",
    "陸塢艦骸": "bay, vessel, remains",
    "墟響廳": "ruin, column, room",
    "波蝕脊堤": "water, wave, eroded, shore",
    "曜原驛": "desolate, plateau, dwelling",
    "溶境遺廊": "water, corridor, room, tunnel",
    "荒娛敖包": "desolate, relocated, slope",
    "削巖殘居": "ruin, dwelling, slope",
    "彩殼堡": "fort, tower",
    "遷痕空埠": "relocated, port",
    "山骸窟殿": "factory, rail, mountain, remains, tunnel, hall"
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
        name: "瘟豬壩沉墟",
        desc: "人工湖的蓄水持續滲入地下，水沿裂隙緩慢滲入舊地基與溶洞，在低窪地勢孕育出一片沉墟。污水與地下水在此緩慢交換，整片廢墟終於壞死為一灘沉默的黑水，如同建築始終無法結痂的傷口。",
        lat: 30.454417,
        lng: 104.047667,
        archiveDate: "2025.04",

        type: "garden"
    },
    {
        name: "電臺路焦土",
        desc: "短波天線與工業遺構曾共同構成一片震盪的電磁場域。廠房雖已夷為平地，那些曾高速撕裂空氣的無線電噪聲卻彷彿仍殘留於此。場域沒有隨建築消失，而是沉積在拉線鐵塔切割出的土地、鏽蝕鋼纜的張力，以及焦土的空間秩序之中。",
        lat: 31.225833,
        lng: 121.618333,
        archiveDate: "2026.03",

        type: "garden"
    },
   {
       name: "山葬灰脈",
       desc: "廢棄多年的舊水泥廠，部分建築已經坍毀，其餘危樓仍等待著下一次崩塌。風化、滲水與重力持續完成這場漫長的山葬，植物沿著磚縫與裂隙緩慢生長，如同撬開沉積岩般，一寸寸拆解著這座工廠，直至它重新回歸山體。",
    lat: 32.04174,
    lng: 119.83912,
    archiveDate: "2017.08",
    type: "record"
    },
{
    name: "琉棘庭",
    desc: "巨大的荒土殘構之間，一塊被圍牆封存的空地孤立其中。它沒有房屋，也沒有窗戶，只留下一道狹窄的出口，彷彿從建成之初便已被遺忘。牆頂嵌滿的玻璃碎片原為防越而設，而當牆體逐漸風化崩裂，它們仍透明、鋒利，繼續守護著一片始終無人問津的空地。",
        lat: 31.2270054,
            lng: 121.6191375,
                archiveDate: "2018.07",
                    type: "record"
},

    {
        name: "裂翼坪",
        desc: "湖中的機場停用後，整條跑道被挖裂，重新恢復為草原地貌。引擎的轟鳴早已散去，只剩崩裂的跑道殘片散落於邊緣。裂縫之間，一棵形似單翼的樹木抱著跑道殘片生長，彷彿替這片再也無法起飛的土地，保留了最後一片翅膀。",
        lat: 41.860278,
        lng: -87.606111,
        archiveDate: "2021.08",

        type: "record"
    },
    {
        name: "軌畔孤構",
        desc: "這裡曾是蒸汽機車的維修工場。工場消失後，鐵軌仍將列車送往遠方，而留在原地的混凝土遺構，漸漸成為鐵路旁一座無人光顧的工業廢丘。",
        lat: 32.5525070,
        lng: -94.3644399,
        archiveDate: "2022.06",
        type: "record"
    },
{
    name: "残柱林",
    desc: "	這片樹木來自近百年前城市規劃時留下的樹苗。數十年後，巨樹因自身重量折裂，枝幹劈開了石柱建築的屋頂。這場坍塌並非偶然，而是從樹苗落地那天便開始累積。當人們驚訝於屋頂被巨樹劈開時，才發現真正被遺忘的，或許一直都是那棵不斷長大的樹。",
            lat: 41.77502,
                lng: -87.56954,
                    archiveDate: "2022.10",
                        type: "record"
},
{
    name: "池骸灣",
    desc: "人們曾以巨大的工程將海水引入建築，把海洋馴服成一座浴場；如今，海重新將建築收回體內，建築開始遵循潮汐，而非人們。潮水持續侵蝕池壁與地基，碎石與綠藻逐漸覆滿池底。海沒有淹沒建築，只是讓海岸重新長進了建築裡。",
            lat: 37.78060,
                lng: -122.51370,
                    archiveDate: "2023.08",
                        type: "record"
},
{
    name: "褶層灣",
    desc: "數萬年前，冰川留下砂礫層；百年間，人類又以採礦、鐵路與工業反覆雕刻這片土地。當一切功能依序消失後，唯有一列列菱形混凝土構造仍裸露於地景之中，如同文明在地層間留下的一道剖面。",
            lat: 47.1808,
                lng: -122.5537,
                    archiveDate: "2023.12",
                        type: "record"
    },
    {
        name: "釉骸拓壁",
        desc: "工程塑料布緊密包覆著殘牆，連磁磚裂紋與牆面的起伏都被完整轉印。它並未修復廢墟，而是在拆除之前，替建築留下最後一次完整的形體，如同覆蓋於遺構表面的一層拓膜。",
        lat: 30.7023424,
        lng: 104.0714623,
        archiveDate: "2024.04",
        type: "record"
    },
{
    name: "疊骸構陣",
    desc: "工廠依丘陵展開，起伏的地勢、高低錯落的樓層、交錯的框架與各異的朝向，共同編織出一套複雜的空間。工廠運作時，牆體、功能與路牌維持著這套秩序，也掩蓋了其中難以被看穿的構造。直到牆面剝落、樓板坍塌，建築只剩交錯的骨架與陰影，那座始終潛藏其中的迷宮才緩緩現身。",
            lat: 30.4416944,
                lng: 104.0347500,
                    archiveDate: "2024.05",
                        type: "record"
    },
    {
        name: "苔網塬",
        desc: "巨大的綠色工程紗網覆蓋著建築殘骸，如同一層蔓延於工業遺址上的工業苔蘚。混凝土碎塊托起網面，樹木從鋼筋與碎石間緩緩將它頂起，使整片地表微微起伏。原本覆蓋廢墟的工程材料，在漫長風化中逐漸承接泥土、孕育植物，最終成為建築消失後的第一層生命。",
        lat: 30.66457,
        lng: 104.15798,
        archiveDate: "2024.05",
        type: "record"
    },
{
    name: "陸塢艦骸",
    desc: "這裡或許是距離海洋最遙遠的地方之一，卻矗立著一艘航空母艦。它從未航行，也從未真正停泊，只是在池塘中央維繫著一場關於海洋的想像。當池水乾涸、金屬蒙皮逐漸拆除，航母開始顯露混凝土與鋼筋的本體。海洋的幻象隨之層層剝落，只留下池塘中央一座混凝土遺構。",
  lat: 30.5854444,
  lng: 104.0365278,
  archiveDate: "2024.06",
  type: "record"
},

    {
        name: "墟響廳",
        desc: "厚重的屋頂、誇張的柱列與傾斜牆面共同塑造出一組為展示而存在的建築。建築內部充滿因外部造型而產生的剩餘空間。玻璃展櫃依然鑲嵌在斜牆之中，只是櫃內早已空無一物。鏡面於是開始反射彼此，讓空間不斷展示自己的空殼。",
        lat: 30.5886698,
        lng: 104.0341997,
        archiveDate: "2024.06",
        type: "record"
    },
    {
        name: "波蝕脊堤",
        desc: "波浪般起伏的爛尾樓只剩混凝土骨架裸露於海風之中，海風穿過層層空洞，整座建築發出如骸骨般低沉的嗚鳴。海岸上的人造物，似乎都擁有共同的宿命。消波塊因抵擋海浪而耗盡自身，這座建築則因失去建造的目的，長年風化於鹽霧與海風之中。兩者都在走向毀滅，一者因使命而消耗，一者因失去使命而風化。最荒誕的是，消波塊至今仍默默消耗著自己，只為守護一座早已失去存在理由的建築。",
                lat: 30.8227055,
                    lng: 121.5305626,
                        archiveDate: "2024.07",
                            type: "record"
    },

    {
        name: "曜原驛",
        desc: "四千五百畝光伏陣列覆蓋了原本的土地，如同另一種收割陽光的農田。曾經服務道路的驛站被留在其中，卻失去了道路，也失去了旅人，只剩無盡的光伏板向地平線延展。它不再等待任何人，只與每日升起的太陽共同維持著這片新的地景。",
        lat: 38.83587,
        lng: 117.55678,
        archiveDate: "2024.08",
        type: "record"
    },
    {
        name: "溶境遺廊",
        desc: "地下商業街與隧道荒廢多年後，逐漸受到雨水與地下滲流侵蝕。封閉的店鋪中，人體模特、鏡面與陳列仍停留於原位，替代早已消失的人群，而裂紋、霉斑與鏽跡則持續覆寫其上。隧道穹頂仍保留著美人魚雕塑與海洋壁畫，維持著一場人工海洋的幻象。隨著地下水持續湧入，這片幻象最終被真正的水重新佔據。",
        lat: 30.6602710,
        lng: 104.0676944,
        archiveDate: "2024.08",
        type: "record"
    },
    {
        name: "荒娛敖包",
        desc: "在這片難以離開的寒冬荒原上，人們或許期待信標中出現地圖、電話，或任何能與外界建立聯繫的工具。然而留下的卻是成堆的遊戲機臺。它們被堆疊成一座電子敖包，像一份錯誤抵達的禮物，也像一次許錯了願，在一無所有之地留下了最無用、也荒誕到令人絕望的存在。",
                lat: 41.72871,
                    lng: 110.51296,
                        archiveDate: "2024.12",

                            type: "record"
    },
    {
        name: "彩殼堡",
        desc: "農田之上矗立著一座未完成的城堡。混凝土與鋼筋仍裸露於外，外牆卻已塗滿鮮豔的色彩。童話比建築更早完成，也比建築更早荒廢。",
                lat: 40.2368611,
                    lng: 116.1637500,
                        archiveDate: "2025.01",
                            type: "record"
    },
        {
            name: "削巖殘居",
            desc: "整座山體被開採成層層階地，散落其上的屋舍如同被收割過的作物，只剩殘牆停留於巖層之間。當礦石被運走後，它們仍留在原地，與裸露的山體一同緩慢風化。",
        lat: 30.425167,
        lng: 104.096167,
        archiveDate: "2025.02",
            type: "record"
    },

    {
        name: "遷痕空埠",
        desc: "沿江舊碼頭逐漸退出城市，「拆」與「未簽字」記錄著這場搬遷。拆除後，生活痕跡仍停留於原處：盆栽沿裂縫生長，線束仍牽引著墜落的牆板，高處的椅子與「請留意您的貴重物品」標語，依然停留在早已沒有人的日常裡。人離開後，殘骸、植物與生活的痕跡，仍共同維持著這片岸線。",
        lat: 30.4325100,
        lng: 104.0406300,
        archiveDate: "2026.06",
        type: "record"
    },
    {
        name: "山骸窟殿",
        desc: "這座沿山而建的磷礦工廠，因層層堆疊的體量與巨大尺度，被稱為「小布達拉宮」。遠望時，它像一座矗立於山間的宮殿；走近後，映入眼前的卻是輸送帶與廠房。神聖的形態與工業的功能在此重疊，山體最終留下了一座為礦石而建、也隨礦石一同廢棄的宮殿。",
                lat: 34.5275555,
                    lng: 119.1429722,
                        archiveDate: "2026.07",
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

sites.forEach((site, index) => {

    const pos = geoToSVG(site.lat, site.lng);

    const marker = L.marker(pos, {
        icon: createIcon(site.type)
    }).addTo(map);

    marker.bindPopup(`
    <div class="archive-popup">
      <div class="archive-content">
        <div class="archive-name" data-i18n="site_name_${site.name}">${site.name}</div>
        <div class="archive-coords">
          ${site.lat >= 0 ? formatLat(-site.lat) : formatLat(Math.abs(site.lat))}
          &nbsp;&nbsp;
          ${formatLng(site.lng)}
        </div>
        <div class="archive-date"><span data-i18n="ui_archive_date">歸檔: </span>${site.archiveDate}</div>
        <div class="archive-drawer-link" onclick="window.openDrawerByIndex(${index}, this)">
          <span class="label" data-i18n="${site.type === "garden" ? "ui_garden" : "ui_record"}">${site.type === "garden" ? "廢墟園林" : "遺構錄"}</span>
        </div>
      </div>
    </div>
  `, {
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
    markers.push({
        site,
        marker,
        index
    });
});

function updateRecordNav() {
    const site = recordSites[currentRecordIndex];
    const recordLinkEl = document.getElementById('record-link');
    if (!recordLinkEl) return;


    const compassOverlay = document.getElementById('compass-overlay');
    const isOpen = compassOverlay && compassOverlay.classList.contains('show');

    if (isOpen) {

        recordLinkEl.classList.add('compass-active');
        recordLinkEl.innerHTML = `<span style="font-weight: 300; margin-right: 12px; display: inline-block;">➢</span>[ <span data-i18n="ui_record">遺構錄</span> | <span data-i18n="site_name_${site.name}">${site.name}</span> ]`;
    } else {

        recordLinkEl.classList.remove('compass-active');
        recordLinkEl.innerHTML = `[ <span data-i18n="ui_record">遺構錄</span> | <span data-i18n="site_name_${site.name}">${site.name}</span> ]`;
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


    if (overlayElement && overlayElement.classList.contains('show') && typeof currentCompassMarker !== 'undefined' && currentCompassMarker) {

        if (!currentCompassMarker.isPopupOpen()) {
            const dist = window.compassDistance;
            const radius = window.compassRingRadius || 140;
            const triggerThreshold = radius * 0.04;

            if (dist !== undefined && dist < triggerThreshold) {
                if (!window.compassLockTimer) {
                    window.compassLockTimer = setTimeout(() => {
                        if (!currentCompassMarker.isPopupOpen()) {
                            currentCompassMarker.openPopup();
                            lockedMarker = currentCompassMarker;

                            map.flyTo(currentCompassMarker.getLatLng(), 5.5, {
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
        map.flyToBounds(bounds, {
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
    currentCompassMarker = marker;

    const { overlay } = getCompassElements();
    if (overlay && overlay.classList.contains('show')) {
        window.updateCompassDirection();
    }
};

window.updateCompassDirection = function () {
    const { overlay, arrow } = getCompassElements();
    const compassRing = document.querySelector('.compass-ring');
    const safeMap = getSafeMap();

    if (!currentCompassMarker || !overlay || !overlay.classList.contains('show') || !safeMap || !compassRing || !arrow) {
        return;
    }


    const compassCenterX = compassX;
    const compassCenterY = compassY;

    const markerLatLng = currentCompassMarker.getLatLng();
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

    const pos = geoToSVG(site.lat, site.lng);
    markers.forEach(m => m.marker.closePopup());


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
        const el = m.marker.getElement();
        const isActive = m.index === activeSiteIndex;


        m.marker.setZIndexOffset(isActive ? 1000 : 0);
        if (el) {
            el.classList.toggle('active-marker', isActive);
        }
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


function renderPage(num) {
    pageRendering = true;

    pdfDoc.getPage(num).then(function (page) {
        const canvas = document.getElementById('pdf-canvas');
        if (!canvas) return;


        let currentScale = pdfScale;
        let viewport = page.getViewport({ scale: currentScale });


        if (viewport.width * viewport.height > 15000000) {
            console.warn("PDF 尺寸極大，自動啟動降級渲染以防崩潰。");
            currentScale = 1.0;
            viewport = page.getViewport({ scale: currentScale });
        }

        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        const renderTask = page.render(renderContext);

        renderTask.promise.then(function () {
            pageRendering = false;


            canvas.style.opacity = 1;
            const loadingText = document.getElementById('pdf-loading');
            if (loadingText) loadingText.style.display = 'none';

            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('pdf-page-num').innerText = `${num} / ${pdfDoc.numPages}`;
}


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
            const typeText = isGarden ? '廢墟園林' : '遺構錄';
            const creatorKey = isGarden ? 'ui_creator' : 'ui_recorder';
            const creatorText = isGarden ? '墟構師: 羅清源' : '記錄者: 羅清源';

            const navKey = 'ui_auto_nav';
            const navText = '自動導航 ⌖';


            const titleTextHtml = isGarden
                ? `<span data-i18n="ui_garden">廢墟園林</span> · <span data-i18n="ui_seq_${index + 1}">其${seq}</span> | <span data-i18n="site_name_${site.name}">${site.name}</span>`
                : `<span data-i18n="ui_record">遺構錄</span> | <span data-i18n="site_name_${site.name}">${site.name}</span>`;


            let interactionSection = `
                <div class="doc-meta" style="margin-bottom: 8px;">${latStr.trim()} ${lngStr.trim()}</div>
                <div class="doc-coord-btn ${isGarden ? 'garden-nav-btn' : 'compass-btn'}" data-i18n="${navKey}">${navText}</div>
            `;

            docEl.innerHTML = `
                <div class="doc-meta">[ <span data-i18n="${typeKey}">${typeText}</span> ] | <span data-i18n="ui_archive_date">歸檔: </span>${site.archiveDate}</div>
                <div class="doc-title">${titleTextHtml}</div>
                <div class="doc-meta" data-i18n="${creatorKey}">${creatorText}</div>
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


function switchLanguage(targetLang) {
    const vault = languageVault[targetLang];
    if (!vault) return;


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
                titleEl.innerHTML = `<span data-i18n="bottom_trigger_ruin">⁙廢墟園林・編</span>`;
            } else {
                titleEl.innerHTML = `<span data-i18n="bottom_trigger_record">遺構錄・卷</span>`;
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
