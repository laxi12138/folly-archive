// script.js
document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.getElementById('archive-drawer');
  const mask = document.getElementById('drawer-mask');

  if (drawer) drawer.classList.remove('open');
  if (mask) mask.classList.remove('show');
});
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
const pdfScale = 2; // 渲染清晰度（数值越大越清晰，但也越吃性能，2是标准视网膜级别）
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


}
    const scoreHUD = document.getElementById('score-hud');

    const scoreHUDShadow =
        document.getElementById('score-hud-shadow');

    if (scoreHUD) {
        // 最大允许移动的像素范围（数值越大，随鼠标挪动的幅度越明显，建议 10~20 之间）
        const maxMovePx = 15;

        // 1. 监听鼠标在 score-hud 区域内的移动轨迹
scoreHUD.addEventListener(
'mousemove',
(e)=>{

    if (focusLocked) {
        return;
    }
            const rect = scoreHUD.getBoundingClientRect();
            const localX =
                e.clientX - rect.left;

            const localY =
                e.clientY - rect.top;
            const triggerZoneX =
                rect.width * 0.125;

            const triggerZoneY =
                rect.height * 0.9;


            const mouseXPercent = (e.clientX - rect.left) / rect.width - 0.5;
            const mouseYPercent = (e.clientY - rect.top) / rect.height - 0.5;

    
            const moveX = mouseXPercent * maxMovePx;
            const moveY = mouseYPercent * maxMovePx;
            console.log('mousemove');
            // 悬浮移动时，临时将 transition 设为 0s，保证鼠标跟随毫无延迟、极其跟手
            scoreHUD.style.setProperty('transition', 'opacity 1.2s ease-out, transform 0s linear', 'important');

            if (!focusLocked) {

                scoreHUD.style.setProperty(
                    'transform',
                    `translate(${moveX}px, ${moveY}px)`
                );

            }
            if (
                localX < triggerZoneX &&
                localY > triggerZoneY &&
                !focusLocked
            ) {

                console.log("LOCK");
                console.log(
                    scoreHUD.style.transform
                );

                focusLocked = true;

                scoreHUD.style.setProperty(
                    'transition',
                    'transform .22s cubic-bezier(.17,.84,.44,1)',
                    'important'
                );

                scoreHUD.style.setProperty(
                    'transform',
                    'translate(-12px, 17px)',
                    'important'
                );

                scoreHUD.classList.add(
                    'magnetic-lock'
                );

                scoreHUDShadow.classList.add(
                    'locked'
                );

                triggerFocusConfirm();

                console.log(
                    scoreHUDShadow.className
                );
            }

        });
        scoreHUD.addEventListener(
            'mouseleave',
            () => {

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
  /* >>>>>>>>>>>>>>> 新代码插入结束 >>>>>>>>>>>>>>> */
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
/* =========================
   world shape params
========================= */

const geoScale = 1.0;
const worldScale = 1.0;
const offsetX = 0;
const offsetY = 0;

/* =========================
   map init
========================= */

const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 8,
  zoomControl: false,
  attributionControl: false,
  inertia: true
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
map.setMaxBounds(null);
setTimeout(() => {

    const center = map.getCenter();

    map.flyTo(
        [
            center.lat + 233,   // 往上
            center.lng - 200  
        ],
        map.getZoom() + 0.8,
        {
            duration: 5
        }
    );

}, 1000);

/* =========================
   state
========================= */

let activeSiteIndex = null;
const markers = [];

/* =========================
   attachment registry
========================= */

const attachmentRegistry = {

'radio-score': {
  title: ' 圖形記譜 | 焦土以太',
  type: 'graphic score',
  mode: 'card',
  front: 'attachments/aether-scorched-earth/score-2.png',
  back: 'attachments/aether-scorched-earth/score-2b.png',
  desc: '以太共振場圖形記譜。'
},

  'radio-instrument': {
    title: '廢墟樂器 | 以太狹間',
    type: 'instrument demonstration',
    mode: 'video',
    src: 'attachments/aether-scorched-earth/instrument-2.mp4',
    desc: '高頻迴路臨界聲學實驗。'
  },

  'radio-film': {
    title: '廢墟園林·其二 | 焦土以太鐵塔',
    type: 'ruin garden footage',
    mode: 'video',
    src: 'attachments/aether-scorched-earth/folly-2.mp4',
    desc: '殘構電磁諧謔演奏。'
    },
    'radio-rec-1': {
        title: '電臺路焦土 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-1.jpg',
        desc: '-'
    },
    'radio-rec-2': {
        title: '電臺路焦土 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-2.jpg',
        desc: '-'
    },
    'radio-rec-3': {
        title: '電臺路焦土 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-3.jpg',
        desc: '-'
    },
    'radio-rec-4': {
        title: '電臺路焦土 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-4.jpg',
        desc: '-'
    },

    'radio-rec-5': {
        title: '電臺路焦土 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-5.jpg',
        desc: '-'
    },
    'radio-rec-6': {
        title: '電臺路焦土 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-6.jpg',
        desc: '-'
    },

    'radio-map-1': {
        title: '電臺路焦土 | 遺構錄',
        type: 'ruin garden record',
        mode: 'pdf',
        src: 'attachments/aether-scorched-earth/mapping.pdf',
        desc: '-'
    },
    'radio-note-1': {
        title: '電臺路焦土 | 遺構錄',
        type: 'ruin garden record',
        mode: 'text',
        src: 'attachments/aether-scorched-earth/statement.txt',
        desc: '-'
    },


'plague-scan': {
  title: '圖形記譜 | 心臟殘響',
  type: 'graphic score',
  mode: 'card',
  front: 'attachments/effluent-sedimentation/score-1.png',
  back: 'attachments/effluent-sedimentation/score-1b.png',
  desc: '死水沉積圖形記譜。'
},

  'plague-audio': {
      title: '廢墟樂器 | 鏽血心臟',
    type: 'instrument demonstration',
    mode: 'video',
    src: 'attachments/effluent-sedimentation/instrument-1.mp4',
    desc: '殘片心臟敲擊聲學實驗。'
  },

  'plague-film': {
      title: '廢墟園林·其一 | 沉墟死水心室',
    type: 'ruin garden footage',
    mode: 'video',
    src: 'attachments/effluent-sedimentation/folly-1.mp4',
      desc: '沉墟內核坍縮回響演奏。'
    },
    'plague-rec-1': {
        title: '瘟豬壩沉墟 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-1.jpg',
        desc: '-'
    },
    'plague-rec-2': {
        title: '瘟豬壩沉墟 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-2.jpg',
        desc: '-'
    },
    'plague-rec-3': {
        title: '瘟豬壩沉墟 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-3.jpg',
        desc: '-'
    },
    'plague-rec-4': {
        title: '瘟豬壩沉墟 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-4.jpg',
        desc: '-'
    },

    'plague-rec-5': {
        title: '瘟豬壩沉墟 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-5.jpg',
        desc: '-'
    },
    'plague-rec-6': {
        title: '瘟豬壩沉墟 | 遺構錄',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/effluent-sedimentation/film-scan-6.jpg',
        desc: '-'
    },
    'plague-map-1': {
        title: '瘟豬壩沉墟 | 遺構錄',
        type: 'ruin garden record',
        mode: 'pdf',
        src: 'attachments/effluent-sedimentation/mapping.pdf',
        desc: '-'
    },
    'plague-note-1': {
        title: '瘟豬壩沉墟 | 遺構錄',
        type: 'ruin garden record',
        mode: 'text',
        src: 'attachments/effluent-sedimentation/statement.txt',
        desc: '-'
    },


  
    'north-01': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-1.jpg',
        desc: ''
    },

    'north-02': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-2.jpg',
        desc: ''
    },
    'north-03': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-3.jpg',
        desc: ''
    },
    'north-04': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-4.jpg',
        desc: ''
    },
    'north-05': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-5.jpg',
        desc: ''
    },
    'north-06': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-6.jpg',
        desc: ''
    },
    'north-07': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-7.jpg',
        desc: ''
    },
    'north-08': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-8.jpg',
        desc: ''
    },
    'north-09': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/photo-9.jpg',
        desc: ''
    },

    'north-hum': {
        title: '聲音標本',
        mode: 'audio',
        src: 'attachments/fallen-wing-field/wave.wav',
        desc: ''
    },

    'north-ticket': {
        title: '物件標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/object-wood-dolomite.jpg',
        desc: ''
    },
    'north-ticket-2': {
        title: '物件標本',
        mode: 'image',
        src: 'attachments/fallen-wing-field/object-wood-dolomite-2.jpg',
        desc: ''
    },


'signal-1': {
    title: '視覺標本',
        mode: 'image',
            src: 'attachments/mountain-signal/film-scan-1.jpg',
                desc: ''
    },

    'signal-2': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-2.jpg',
        desc: ''
    },
    'signal-3': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-3.jpg',
        desc: ''
    },

    'signal-4': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mountain-signal/film-scan-4.jpg',
        desc: ''
    },
'signal-corridor': {
    title: '視覺標本',
        mode: 'image',
            src: 'attachments/mountain-signal/pano-film-scan-1.jpg',
                desc: ''
},
    'signal-corridor-2': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mountain-signal/pano-film-scan-2.jpg',
        desc: ''
    },


'signal-ticket': {
    title: '物件標本',
        mode: 'image',
            src: 'attachments/mountain-signal/object-doodle-on-rock-1.jpg',
                desc: ''
    },
    'signal-ticket-2': {
        title: '物件標本',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-2.jpg',
        desc: ''
    },
    'signal-ticket-3': {
        title: '物件標本',
        mode: 'image',
        src: 'attachments/mountain-signal/object-doodle-on-rock-3.jpg',
        desc: ''
    },

'signal-note': {
    title: '註釋卡',
    mode: 'text',
    src: 'attachments/mountain-signal/note.txt',
    desc: ''
},
/* =========================
   wave-eroded structure
========================= */

'wave-01': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/wave-eroded-structure/film-scan-1.jpg',
  desc: ''
},

'wave-02': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/wave-eroded-structure/film-scan-2.jpg',
  desc: ''
},
'wave-03': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/wave-eroded-structure/film-scan-3.jpg',
  desc: ''
},
'wave-04': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/wave-eroded-structure/film-scan-4.jpg',
  desc: ''
},
    'wave-05': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-1.jpg',
        desc: ''
    },
    'wave-06': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-2.jpg',
        desc: ''
    },
    'wave-07': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-3.jpg',
        desc: ''
    },
    'wave-08': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-4.jpg',
        desc: ''
    },
    'wave-09': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-5.jpg',
        desc: ''
    },
    'wave-10': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-6.jpg',
        desc: ''
    },
    'wave-11': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-7.jpg',
        desc: ''
    },
    'wave-12': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/wave-eroded-structure/photo-8.jpg',
        desc: ''
    },

'wave-audio': {
  title: '聲音標本',
  mode: 'audio',
  src: 'attachments/wave-eroded-structure/ambient.wav',
  desc: ''
},


'brick-01': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/brick-battleship/photo-1.jpg',
  desc: ''
},
    'brick-011': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-2.jpg',
        desc: ''
    },
    'brick-012': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/brick-battleship/photo-3.jpg',
        desc: ''
    },
    'brick-013': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/brick-battleship/infrared-photo-1.jpg',
        desc: ''
    },
'brick-02': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/brick-battleship/film-scan-1.jpg',
  desc: ''
},
'brick-03': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/brick-battleship/film-scan-2.jpg',
  desc: ''
    },
    'brick-04': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/brick-battleship/film-scan-3.jpg',
        desc: ''
    },

'quarry-01': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/quarry-bay-stairway/photo-1.jpg',
  desc: ''
},

'quarry-02': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/quarry-bay-stairway/photo-2.jpg',
  desc: ''
},
'quarry-03': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/quarry-bay-stairway/photo-3.jpg',
  desc: ''
    },
'quarry-04': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/quarry-bay-stairway/photo-4.jpg',
  desc: ''
},
    'quarry-ticket': {
        title: '物件標本',
        mode: 'image',
        src: 'attachments/quarry-bay-stairway/object-pebble-stack.jpg',
        desc: ''
    },

'bath-01': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/bath-crack/photo-1.jpg',
  desc: ''
},

'bath-02': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/bath-crack/photo-2.jpg',
  desc: ''
},

'bath-03': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/bath-crack/photo-3.jpg',
  desc: ''
    },
 'bath-04': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/bath-crack/photo-4.jpg',
        desc: ''
    },
    'bath-05': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/bath-crack/photo-5.jpg',
        desc: ''
    },
    'bath-06': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/bath-crack/photo-6.jpg',
        desc: ''
    },
    'bath-07': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/bath-crack/photo-7.jpg',
        desc: ''
    },
    'bath-08': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/bath-crack/photo-8.jpg',
        desc: ''
    },

'yellow-01': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/yellow-mountain/photo-1.jpg',
  desc: ''
    },
    'yellow-012': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-2.jpg',
        desc: ''
    },
    'yellow-013': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/yellow-mountain/photo-3.jpg',
        desc: ''
    },
    'yellow-02': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-1.jpg',
        desc: ''
    },

'yellow-03': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/yellow-mountain/film-scan-2.jpg',
  desc: ''
    },
    'yellow-04': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-3.jpg',
        desc: ''
    },
    'yellow-05': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-4.jpg',
        desc: ''
    },
    'yellow-06': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/yellow-mountain/film-scan-5.jpg',
        desc: ''
    },

'fish-01': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/fish-mouth/photo-1.jpg',
  desc: ''
},

'fish-02': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/fish-mouth/photo-2.jpg',
  desc: ''
},
'fish-03': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/fish-mouth/photo-3.jpg',
  desc: ''
    },
    'fish-04': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-4.jpg',
        desc: ''
    },
    'fish-041': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-5.jpg',
        desc: ''
    },
    'fish-042': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-6.jpg',
        desc: ''
    },
    'fish-043': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/photo-7.jpg',
        desc: ''
    },
    'fish-05': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-1.jpg',
        desc: ''
    },
    'fish-06': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-2.jpg',
        desc: ''
    },
    'fish-07': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-3.jpg',
        desc: ''
    },
    'fish-08': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-4.jpg',
        desc: ''
    },
    'fish-09': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-5.jpg',
        desc: ''
    },
    'fish-10': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-6.jpg',
        desc: ''
    },
    'fish-11': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/fish-mouth/film-scan-7.jpg',
        desc: ''
    },

    'fish-ticket': {
        title: '物件標本',
        mode: 'image',
        src: 'attachments/fish-mouth/object-bamboo-weaved-cast.jpg',
        desc: ''
    },
'fish-note': {
  title: '註釋卡',
  mode: 'text',
  src: 'attachments/fish-mouth/note.txt',
  desc: ''
},
'gloss-01': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/gloss-veil/film-scan-1.jpg',
  desc: ''
},

'gloss-02': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/gloss-veil/film-scan-2.jpg',
  desc: ''
},
'gloss-03': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/gloss-veil/film-scan-3.jpg',
  desc: ''
    },
    'gloss-04': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/gloss-veil/film-scan-4.jpg',
        desc: ''
    },

    'gloss-ticket': {
        title: '物件標本',
        mode: 'image',
        src: 'attachments/gloss-veil/object-net.jpg',
        desc: ''
    },

'pole-01': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/concrete-pole/photo-1.jpg',
  desc: ''
},

'pole-02': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/concrete-pole/photo-2.jpg',
  desc: ''
    },
    'pole-03': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/concrete-pole/photo-3.jpg',
        desc: ''
    },

'aquarium-01': {
  title: '視覺標本',
  mode: 'image',
  src: 'attachments/aquarium-bunker/photo-1.jpg',
  desc: ''
},
    'aquarium-02': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-2.jpg',
        desc: ''
    },

    'aquarium-03': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-3.jpg',
        desc: ''
    },

    'aquarium-04': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-4.jpg',
        desc: ''
    },

    'aquarium-05': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/aquarium-bunker/photo-5.jpg',
        desc: ''
    },

    'aquarium-011': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-1.jpg',
        desc: ''
    },

    'aquarium-012': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-2.jpg',
        desc: ''
    },

    'aquarium-013': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-3.jpg',
        desc: ''
    },

    'aquarium-014': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-4.jpg',
        desc: ''
    },
'aquarium-015': {
  title: '視覺標本',
  mode: 'image',
    src: 'attachments/aquarium-bunker/film-scan-5.jpg',
  desc: ''
    },
    'aquarium-016': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/aquarium-bunker/film-scan-6.jpg',
        desc: ''
    },


    'roof-1': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-1.jpg',
        desc: ''
    },
    'roof-2': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/roof/infrared-film-scan-2.jpg',
        desc: ''
    },
    'roof-3': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/roof/film-scan-1.jpg',
        desc: ''
    },
    'roof-4': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/roof/film-scan-2.jpg',
        desc: ''
    },
    'phospho-1': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-1.jpg',
        desc: ''
    },
    'phospho-2': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-2.jpg',
        desc: ''
    },
    'phospho-3': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-3.jpg',
        desc: ''
    },
    'phospho-4': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-4.jpg',
        desc: ''
    },
    'phospho-5': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-5.jpg',
        desc: ''
    },
    'phospho-6': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-6.jpg',
        desc: ''
    },
    'phospho-7': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/pano-film-scan-7.jpg',
        desc: ''
    },
    'phospho-11': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/photo-1.jpg',
        desc: ''
    },
    'phospho-12': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/photo-2.jpg',
        desc: ''
    },
    'phospho-13': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/photo-3.jpg',
        desc: ''
    },
    'phospho-14': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/photo-4.jpg',
        desc: ''
    },
    'phospho-15': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/phospho/photo-5.jpg',
        desc: ''
    },
    'castle-1': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/castle/photo-1.jpg',
        desc: ''
    },
    'dock-1': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-1.jpg',
        desc: ''
    },
    'dock-2': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-2.jpg',
        desc: ''
    },
    'dock-3': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-3.jpg',
        desc: ''
    },
    'dock-4': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-4.jpg',
        desc: ''
    },
    'dock-5': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-5.jpg',
        desc: ''
    },
    'dock-6': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-6.jpg',
        desc: ''
    },
    'dock-7': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-7.jpg',
        desc: ''
    },
    'dock-8': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-8.jpg',
        desc: ''
    },
    'dock-9': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-9.jpg',
        desc: ''
    },
    'dock-10': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-10.jpg',
        desc: ''
    },
    'dock-11': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-11.jpg',
        desc: ''
    },
    'dock-12': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-12.jpg',
        desc: ''
    },
    'dock-13': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-13.jpg',
        desc: ''
    },
    'dock-14': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-14.jpg',
        desc: ''
    },
    'dock-15': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-15.jpg',
        desc: ''
    },
    'dock-16': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/dock/photo-16.jpg',
        desc: ''
    },

    'walled-01': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/walled-gallery/film-scan-1.jpg',
        desc: ''
    },

    'walled-02': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/walled-gallery/film-scan-2.jpg',
        desc: ''
    },

    'walled-03': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-1.jpg',
        desc: ''
    },
    'walled-04': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-2.jpg',
        desc: ''
    },
    'walled-05': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-3.jpg',
        desc: ''
    },
    'walled-06': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-4.jpg',
        desc: ''
    },
    'walled-07': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/walled-gallery/photo-5.jpg',
        desc: ''
    },

    'walled-ticket': {
        title: '物件標本',
        mode: 'image',
        src: 'attachments/walled-gallery/object-fence-shard.jpg',
        desc: ''
    },

    'walled-note': {
        title: '註釋卡',
        mode: 'text',
        src: 'attachments/walled-gallery/note.txt',
        desc: ''
    },

    'membrane-01': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/membrane/film-scan-1.jpg',
        desc: ''
    },
    'membrane-02': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/membrane/film-scan-2.jpg',
        desc: ''
    },
    'membrane-03': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/membrane/film-scan-3.jpg',
        desc: ''
    },
    'mirror-01': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mirror/film-scan-1.jpg',
        desc: ''
    },
    'mirror-02': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mirror/film-scan-2.jpg',
        desc: ''
    },

    'mirror-03': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mirror/film-scan-3.jpg',
        desc: ''
    },

    'mirror-04': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mirror/film-scan-4.jpg',
        desc: ''
    },
    'mirror-05': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mirror/film-scan-5.jpg',
        desc: ''
    },
    'mirror-06': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mirror/film-scan-6.jpg',
        desc: ''
    },
    'mirror-07': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/mirror/film-scan-7.jpg',
        desc: ''
    },
    'solar-01': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/solar/film-scan-1.jpg',
        desc: ''
    },
    'solar-02': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/solar/film-scan-2.jpg',
        desc: ''
    },

    'rail-1': {
        title: '視覺標本',
        mode: 'image',
        src: 'attachments/rail-side/photo-1.jpg',
        desc: ''
    },



};

/* =========================
   attachment count system
========================= */

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

    if (item.title === '視覺標本')
      counts.visual++;

    else if (item.title === '聲音標本')
      counts.audio++;

    else if (item.title === '物件標本')
      counts.object++;

    else if (item.title === '註釋卡')
      counts.note++;

  });

  return counts;
}
/* =========================
   attachment viewer
========================= */

const attachmentViewer =
  document.getElementById('attachment-viewer');
let currentZoom = 1;
let currentX = 0;
let currentY = 0;

function openAttachmentViewer(id) {

  const item = attachmentRegistry[id];
  if (!item) return;

  const stage = document.getElementById('attachment-stage');

  // ✅ 每次重新获取（关键修复点）
    const wrapper = document.getElementById('media-wrapper');
    
document.getElementById(
  'attachment-title'
).innerText = item.title || '';
  
  document.getElementById('attachment-filename').innerText = '';
  document.getElementById('attachment-desc').innerText = item.desc;

  document.querySelector('.attachment-hud')?.classList.add('show');
const hud = document.querySelector('.attachment-hud');

if (hud && !hud.querySelector('#reset')) {
  const resetBtn = document.createElement('div');
  resetBtn.id = 'reset';
  resetBtn.className = 'hud-btn';
  resetBtn.innerText = 'reset';

  hud.appendChild(resetBtn);
}
  // reset
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
    if (item.mode === 'image') {

        wrapper.innerHTML = `
    <img
      class="attachment-image"
      src="${item.src}"
    />
  `;

    }
    if (item.mode === 'audio') {

        wrapper.innerHTML = `
    <audio
      class="attachment-audio"
      controls
      autoplay>

      <source src="${item.src}">
    </audio>
  `;

    }
 if (item.mode === 'text') {

  wrapper.innerHTML = `
    <iframe
      class="archive-text-frame"
      src="${item.src}">
    </iframe>
  `;

    }

// 每次打开附件前，确保重置翻页 HUD 显示状态
    const pdfHud = document.getElementById('pdf-page-hud');
    if (pdfHud) pdfHud.style.display = 'none';

    if (item.mode === 'pdf') {
        // 判断当前是否在 file:/// 协议下运行
        const isFileProtocol = window.location.protocol === 'file:';

        if (isFileProtocol) {
            // 🌟 降级方案：如果是双击打开的 file:///，使用原生 iframe 预览
            // 原生 iframe 浏览器允许在本地 file:/// 协议下加载同文件夹下的 pdf
            wrapper.innerHTML = `
                <iframe src="${item.src}" class="attachment-image" style="border:none; width:100%; height:100%;"></iframe>
                <div style="position:absolute; bottom:10px; color:#666; font-size:10px;">
                    提示：本地预览模式 (file:///)，不支持翻页 HUD。请使用 Live Server 以获得完整体验。
                </div>
            `;
            // 隐藏翻页器，因为 iframe 内部无法被 JS 控制翻页
            const pdfHud = document.getElementById('pdf-page-hud');
            if (pdfHud) pdfHud.style.display = 'none';
        } else {
            // 🌟 正常模式：在服务器环境下，继续使用功能强大的 PDF.js Canvas 渲染
            wrapper.innerHTML = `
                <div id="pdf-loading" style="position: absolute;">讀取圖紙中...</div>
                <canvas id="pdf-canvas" class="attachment-image"></canvas>
            `;
            const pdfHud = document.getElementById('pdf-page-hud');
            if (pdfHud) pdfHud.style.display = 'flex';

            // ... 这里继续你之前的 PDF.js 加载逻辑 ...
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

    /* ========================================================
     🌟 新增：控制指南面板 (HUD Manual) 状态切换
     ======================================================== */
    // 1. 每次打开新附件前，先清除掉旧的所有指南状态类名
    attachmentViewer.classList.remove('view-folly', 'view-score', 'view-pdf', 'view-image', 'view-txt');

    // 2. 根据附件属性进行精确分发（注意：这里使用的是你的全局变量 attachmentViewer 和局部变量 item）
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

    // ====== 保持你原有的最后两行不变 ======
    setViewerMode(item.mode, id);
    attachmentViewer.classList.add('open');
}
function bindVideoUI() {
  
  const video = currentVideo;
  if (!video) return;

  const playBtn = document.getElementById('video-play');
  const pauseBtn = document.getElementById('video-pause');
  const bar = document.getElementById('video-progress-bar');

  // play / pause
  playBtn.onclick = () => video.play();
  pauseBtn.onclick = () => video.pause();

  // progress update
 video.ontimeupdate = () => {

  const p =
    (video.currentTime / video.duration) * 100;

  bar.style.height = p + '%';

};

  // progress click jump
  document.querySelector('.video-progress').onclick = (e) => {

  const rect =
    e.currentTarget.getBoundingClientRect();

  // ⭐ 从下往上
  const ratio =
  (e.clientY - rect.top) / rect.height;

  video.currentTime =
    ratio * video.duration;

};
const playhead = document.getElementById('score-playhead');
const playhead2 =
  document.getElementById('score-playhead-2');
const scoreBody = document.querySelector('.score-body');

video.ontimeupdate = () => {

  const progress =
    video.currentTime / video.duration;

  // =========================
  // progress bar
  // =========================

  document.getElementById(
    'video-progress-bar'
  ).style.height =
    (progress * 100) + '%';

  // =========================
  // ARC EXPANSION
  // =========================

  const arcsContainer =
    document.getElementById('arcs-container');

  if (arcsContainer) {

    const minScale = 1;
    const maxScale = 4.5;

    const currentScale =
      minScale +
      (maxScale - minScale) * progress;

    arcsContainer.style.transform =
      `scale(${currentScale})`;

  }

  // =========================
  // score sync
  // =========================

  if (!playhead || !scoreBody) return;

  const viewer =
    document.querySelector('.attachment-viewer');

  // ========================================
  // SCORE-1
  // 横向扫描
  // ========================================

  if (viewer.classList.contains('score-linear')) {

  const w = scoreBody.offsetWidth;

  // ====================================
  // 横向扫描线
  // ====================================

  const startX = w * 0.12;
  const endX = w * 1.0;

  const x =
    startX + (endX - startX) * progress;
    const scanProgress =
  (x - startX) / (endX - startX);

  playhead.style.transform =
    `translateX(${x}px)`;


  const pulse =
document.getElementById('score-pulse');

if (pulse) {
// 1:55 后彻底消失
if (video.currentTime >= 113) {
  pulse.style.opacity = 0;
  return;
}
  // ====================================
  // pulse 跟随扫描线横向移动
  // ====================================

  const pulseX = x - 3;

  // ====================================
  // 在扫描线内部上升
  // 从线底部 → 顶部
  // ====================================

  const lineTop = scoreBody.offsetHeight * 0.72;
  const lineHeight = scoreBody.offsetHeight * 0.22;

  // progress 0~1
  // 底部 → 顶部

  const pulseY =
    lineTop +
    lineHeight -
    (lineHeight * scanProgress);

  pulse.style.transform =
    `translate(${pulseX}px, ${pulseY}px)`;


  // ====================================
  // 闪烁速度变化
  // 2秒一次 → 1秒3次
  // ====================================

  const minFreq = 0.8; // 2秒一次
  const maxFreq = 3.0; // 1秒3次

  const freq =
    minFreq +
    (maxFreq - minFreq) * scanProgress;

  const blink =
    Math.sin(
      performance.now()
      * 0.001
      * freq
      * Math.PI
    );

  pulse.style.opacity =
    blink > 0
      ? 1
      : 0.12;
}
}

  // ========================================
  // SCORE-2
  // 仪表盘旋转
  // ========================================

 // ========================================
// SCORE-RADIAL
// 双仪表系统
// ========================================

else if (viewer.classList.contains('score-radial')) {

  // ====================================
  // NEEDLE 1
  // ====================================

  const start1 = -65;
  const end1 = 30;

  const target1 =
    start1 + (end1 - start1) * progress;

  if (!playhead.currentAngle) {
    playhead.currentAngle = start1;
  }

  // 惯性
  playhead.currentAngle +=
    (target1 - playhead.currentAngle) * 1;

  playhead.style.transform =
    `rotate(${playhead.currentAngle}deg)`;


  // ====================================
  // NEEDLE 2
  // 独立系统
  // ====================================

  if (playhead2) {

    // ⭐ 第二根自己的进度
    // 可以比主视频快/慢

    const progress2 =
      Math.min(1, progress * 1.2);

    // 第二根自己的范围
    const start2 = -55;
    const end2 = 74;

    // 第二根自己的目标角度
    const target2 =
      start2 + (end2 - start2) * progress2;

    if (!playhead2.currentAngle) {
      playhead2.currentAngle = start2;
    }

    // 第二根自己的惯性
    playhead2.currentAngle +=
      (target2 - playhead2.currentAngle) * 1;

    playhead2.style.transform =
      `rotate(${playhead2.currentAngle}deg)`;
  }
}
};
 
}
/* =========================
   score card system
========================= */

let cardRotX = -12;
let cardRotY = 18;
let cardRotZ = 0;
let cardFlipped = false;

function initScoreCard() {

  const card =
    document.getElementById('score-card');

  if (!card) return;

  // 初始状态
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
    resetViewerState(); // ⭐ 核心：退出自动恢复

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

  // ⭐ 清除事件
  v.ontimeupdate = null;

  v.src = '';
  v.load();
});
// =========================
// reset score system
// =========================

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

  // ⭐ 关键：彻底隐藏
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

    // 🌟 新增：关闭容器时彻底移除指南 Class，保持 DOM 干净
    viewer.classList.remove('view-folly', 'view-score', 'view-pdf', 'view-image', 'view-txt');

    isClosingViewer = false;
}, 220);
}
document.addEventListener('click', (e) => {
    // 🌟 1. 最高优先级：PDF 翻页拦截
    if (e.target.id === 'pdf-prev') {
        e.stopPropagation(); // 阻止事件冒泡到其他地方
        console.log("上一页被点击"); // 调试用，看看控制台是否有输出
        if (pdfDoc && pageNum > 1) {
            pageNum--;
            queueRenderPage(pageNum);
        }
        return; // 处理完直接返回，不走下面的代码
    }

    if (e.target.id === 'pdf-next') {
        e.stopPropagation();
        console.log("下一页被点击"); // 调试用
        if (pdfDoc && pageNum < pdfDoc.numPages) {
            pageNum++;
            queueRenderPage(pageNum);
        }
        return;
    }

    // 🌟 2. 你原本其他的点击逻辑（比如关闭菜单等，放在下面）
    // ...
});

/* =========================
   outside click close
========================= */

attachmentViewer.addEventListener('click', (e) => {

  const inner = document.querySelector('.attachment-viewer-inner');
  if (!inner) return;

  if (!inner.contains(e.target)) {
    closeAttachmentViewer();
  }

});

/* =========================
   close button
========================= */

document.addEventListener('click', (e) => {

  if (e.target.closest('.attachment-close')) {
    closeAttachmentViewer();
  }

});
/* =========================
   archive auto tree
========================= */

function classifyAttachment(filePath) {

    const file =
        filePath.split('/').pop().toLowerCase();

    // =====================
    // visual
    // =====================

    if (
        file.includes('photo') ||
        file.includes('film') ||
        file.includes('film-scan')
    ) {
        return 'visualFiles';
    }

    // =====================
    // object
    // =====================

    if (
        file.includes('object')
    ) {
        return 'objectFiles';
    }

    // =====================
    // audio
    // =====================

    if (
        file.endsWith('.wav') ||
        file.endsWith('.mp3')
    ) {
        return 'audioFiles';
    }

    // =====================
    // note
    // =====================

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
function makeFolder(
    folderId,
    icon,
    label,
    files = [], // 🌟 加上默认值 []，防止未传入时报错
    isLastFolder = false
) {



    const count =
        files.length;

    const branch =
        isLastFolder
            ? '└──'
            : '├──';

    return `

<div
  class="tree-branch tree-folder"
  onclick="toggleFolder('${folderId}')">

  <span class="tree-line">
    ${branch}
  </span>

  <span id="${folderId}-icon">
    [+]
  </span>

  ${label} (${count})

</div>

<div
  id="${folderId}"
  class="tree-children">

  ${makeTreeFiles(files)}

</div>

`;

}
function buildArchiveTree(prefix, title) {

    const groups =
        buildArchiveGroups(prefix);

    return `

<div class="wander-tree">

  <div
    class="wander-root tree-folder"
    onclick="toggleArchiveTree(this)">

    <span class="tree-toggle">
      [+]
    </span>

    ${title}

  </div>

  <div class="tree-collapse">

    ${makeFolder(
        prefix + '-visual',
        'visual',
        '視覺標本',
        groups.visualFiles
    )}

    ${makeFolder(
        prefix + '-audio',
        'audio',
        '聲音標本',
        groups.audioFiles
    )}

    ${makeFolder(
        prefix + '-object',
        'object',
        '物件標本',
        groups.objectFiles
    )}

    ${makeFolder(
        prefix + '-note',
        'note',
        '註釋卡',
        groups.noteFiles,
        true
    )}

  </div>

</div>

`;

}

/* =========================
   drawer system
========================= */

const drawer =
  document.getElementById('archive-drawer');

const mask =
  document.getElementById('drawer-mask');
  mask?.addEventListener('click', closeDrawer);

/* =========================
   tree toggle
========================= */
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
function createRecordTree(config) {

  const counts =
    getRecordCounts(config.folder);

  return `

<div class="wander-tree">

  <div
    class="wander-root tree-folder"
    onclick="toggleArchiveTree(this)">

    <span class="tree-toggle">[+]</span>
    廢墟漫遊錄

  </div>

  <div class="tree-collapse">

    <!-- 視覺 -->

    <div
      class="tree-branch tree-folder"
      onclick="toggleFolder('${config.id}-visual')">

      <span class="tree-line">├──</span>

      <span
        id="${config.id}-visual-icon">

        [+]

      </span>

      視覺標本 (${counts.visual})

    </div>

    <div
      id="${config.id}-visual"
      class="tree-children">

      ${config.visualFiles}

    </div>

    <!-- 聲音 -->

    <div
      class="tree-branch tree-folder"
      onclick="toggleFolder('${config.id}-audio')">

      <span class="tree-line">├──</span>

      <span
        id="${config.id}-audio-icon">

        [+]

      </span>

      聲音標本 (${counts.audio})

    </div>

    <div
      id="${config.id}-audio"
      class="tree-children">

      ${config.audioFiles}

    </div>

    <!-- 物件 -->

    <div
      class="tree-branch tree-folder"
      onclick="toggleFolder('${config.id}-object')">

      <span class="tree-line">├──</span>

      <span
        id="${config.id}-object-icon">

        [+]

      </span>

      物件標本 (${counts.object})

    </div>

    <div
      id="${config.id}-object"
      class="tree-children">

      ${config.objectFiles || ''}

    </div>

    <!-- 註釋 -->

    <div
      class="tree-branch tree-folder"
      onclick="toggleFolder('${config.id}-note')">

      <span class="tree-line">└──</span>

      <span
        id="${config.id}-note-icon">

        [+]

      </span>

      註釋卡 (${counts.note})

    </div>

    <div
      id="${config.id}-note"
      class="tree-children">

      ${config.noteFiles}

    </div>

  </div>

</div>

`;
}

/* =========================
   open drawer
========================= */

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

        // 右侧超出
        if (
            left + drawerWidth >
            window.innerWidth
        ) {
            left =
                point.x - drawerWidth - 40;
        }

        // 下方超出
        if (
            top + drawerHeight >
            window.innerHeight
        ) {
            top =
                window.innerHeight -
                drawerHeight -
                20;
        }

        // 上方超出
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
        site.name === "遷痕舊埠";
    const isPhospho =
        site.name === "山骸窟殿";
  


let treeHTML = '';

    if (isRadio) {

        treeHTML = `
  <div class="archive-tree">

  <div
  class="fault-node fault-root tree-folder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-toggle">[+]</span>
  廢墟園林檔案

</div>

<div class="tree-collapse">

 <div class="fault-line line-1">
    ╲
  </div>

  <div class="fault-line line-2">
    ╲
  </div>

<div
  class="tree-folder sub-folder archive-record-folder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-toggle">[+]</span>
 遺構錄

</div>

<div class="tree-collapse archive-record-collapse">

  <!-- 圖像檔案 -->

  <div
  class="tree-folder archive-record-subfolder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-line">├──</span>

  <span class="tree-toggle">
    [+]
  </span>

  圖像檔案 (6)

</div>
  <div class="tree-collapse archive-record-subcollapse">

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('radio-rec-1')">

     ├── film-scan-1.jpg

    </div>

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('radio-rec-2')">

   ├── film-scan-2.jpg

    </div>

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('radio-rec-3')">

 ├── film-scan-3.jpg

    </div>

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('radio-rec-4')">

   ├── film-scan-4.jpg

    </div>

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('radio-rec-5')">

   ├── film-scan-5.jpg

    </div>

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('radio-rec-6')">

 └── film-scan-6.jpg

    </div>

  </div>

  
  <!-- 測繪檔案 -->

  <div
  class="tree-folder archive-record-subfolder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-line">├──</span>

  <span class="tree-toggle">
    [+]
  </span>

  測繪檔案 (1)

</div>

  <div class="tree-collapse archive-record-subcollapse">

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('radio-map-1')">

      &nbsp;&nbsp;&nbsp;&nbsp;└── mapping.pdf

    </div>

  </div>
<!-- 文字檔案 -->

 
<div
  class="tree-folder archive-record-subfolder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-line">├──</span>

  <span class="tree-toggle">
    [+]
  </span>

  文字檔案 (1)

</div>
  <div class="tree-collapse archive-record-subcollapse">

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('radio-note-1')">

      └── statement.txt

    </div>

  </div>

</div>

<div class="fault-line-b">
  ╲
</div>

<div
  class="tree-file crack-a"
  onclick="openAttachmentViewer('radio-score')">

[圖形記譜]

</div>

  <div class="fault-line-c">
    ╲
  </div>

  <div
    class="tree-file crack-b"
    onclick="openAttachmentViewer('radio-instrument')">

[樂器演示]

  </div>

  <div class="fault-line-d">
    ╱
  </div>

  <div
    class="tree-file crack-c"
    onclick="openAttachmentViewer('radio-film')">

[廢墟劇場]

  </div>
</div>
</div>
`;
    }
    else if (isPlague) {

        treeHTML = `

<div class="archive-tree">

  <div
    class="fault-node fault-root tree-folder"
    onclick="toggleArchiveTree(this)">

    <span class="tree-toggle">[+]</span>
 廢墟園林檔案

</div>

<div class="tree-collapse">

 <div class="fault-line line-1">
    ╲
  </div>
  <div class="fault-line line-2">
    ╲
  </div>

<div
  class="tree-folder sub-folder archive-record-folder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-toggle">[+]</span>
 遺構錄

</div>

<div class="tree-collapse archive-record-collapse">

  <!-- 圖像檔案 -->

  <div
  class="tree-folder archive-record-subfolder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-line">├──</span>

  <span class="tree-toggle">
    [+]
  </span>

  圖像檔案 (6)

</div>


  <div class="tree-collapse archive-record-subcollapse">

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('plague-rec-1')">

   ├── film-scan-1.jpg

    </div>

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('plague-rec-2')">
  ├── film-scan-2.jpg

    </div>

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('plague-rec-3')">

    ├── film-scan-3.jpg

    </div>

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('plague-rec-4')">

 ├── film-scan-4.jpg

    </div>

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('plague-rec-5')">

      ├── film-scan-5.jpg

    </div>

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('plague-rec-6')">

      └── film-scan-6.jpg

    </div>

  </div>

  <!-- 測繪檔案 -->

  <div
  class="tree-folder archive-record-subfolder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-line">├──</span>

  <span class="tree-toggle">
    [+]
  </span>

  測繪檔案 (1)

</div>

  <div class="tree-collapse archive-record-subcollapse">

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('plague-map-1')">

      &nbsp;&nbsp;&nbsp;&nbsp;└── mapping.pdf

    </div>

  </div>
<!-- 文字檔案 -->

   
<div
  class="tree-folder archive-record-subfolder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-line">├──</span>

  <span class="tree-toggle">
    [+]
  </span>

  文字檔案 (1)

</div>

  <div class="tree-collapse archive-record-subcollapse">

    <div
      class="tree-file archive-record-file"
      onclick="openAttachmentViewer('plague-note-1')">

       └── statement.txt

    </div>
  </div>
</div>    <div class="fault-line-b">
      ╲
    </div>

    <div
      class="tree-file crack-a"
      onclick="openAttachmentViewer('plague-scan')">

      [圖形記譜]

    </div>

    <div class="fault-line-c">
      ╲
    </div>

    <div
      class="tree-file crack-b"
      onclick="openAttachmentViewer('plague-audio')">

      [樂器演示]

    </div>

    <div class="fault-line-d">
      ╱
    </div>

    <div
      class="tree-file crack-c"
      onclick="openAttachmentViewer('plague-film')">

      [廢墟劇場]

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
/* =========================
   description
========================= */
    if (el) {

        el.innerHTML = `
  <div class="-section title">
    <div class="drawer-site-title">
      ${site.name}
    </div>
  </div>

  <div class="drawer-section desc">
    <div class="drawer-description">
      <!-- 【修改2：添加了样式限制最大6行，并隐藏溢出内容】 -->
      <div class="desc-text" style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 6; overflow: hidden;">
        ${site.desc}
      </div>
      <!-- 默认隐藏的展开按钮 -->
      <div class="desc-toggle-btn" style="display: none; cursor: pointer; color: #888; margin-top: 6px; font-family: monospace; font-size: 12px; user-select: none;">[...]</div>
    </div>
  </div>

  <div class="drawer-section tree">
    ${treeHTML}
  </div>
`;

        // 【修改2：使用 setTimeout 确保 DOM 渲染完毕后再检测高度】
        setTimeout(() => {
            const descText = el.querySelector('.desc-text');
            const toggleBtn = el.querySelector('.desc-toggle-btn');

            if (descText && toggleBtn) {
                // 判断内容的实际高度是否大于限制的高度 (即是否超过了 6 行)
                if (descText.scrollHeight > descText.clientHeight) {
                    // 超过了，显示展开按钮
                    toggleBtn.style.display = 'inline-block';

                    toggleBtn.addEventListener('click', () => {
                        const isExpanded = descText.style.webkitLineClamp === 'unset';
                        if (isExpanded) {
                            // 当前是展开状态 -> 点击后收回至6行
                            descText.style.webkitLineClamp = '6';
                            toggleBtn.innerText = '[···]';
                        } else {
                            // 当前是收起状态 -> 点击后完全展开
                            descText.style.webkitLineClamp = 'unset';
                            toggleBtn.innerText = '[ ^ ]';
                        }
                    });
                }
            }
        }, 50);
    }

    drawer.classList.add('open');
    mask.classList.add('show');
}


function closeDrawer() {
  const drawer = document.getElementById('archive-drawer');
  const mask = document.getElementById('drawer-mask');

  if (!drawer) return;

  drawer.classList.remove('open');
  if (mask) mask.classList.remove('show');
}

/* =========================
   image navigation system
========================= */

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
  // =========================
// SCORE ROTATE HUD
// =========================

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
  // =========================
  // RESET ALL STATES
  // =========================

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

  // 全部先隐藏
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
  // =========================
  // IMAGE MODE
  // =========================

    if (
        type === 'image' ||
        type === 'card' ||
        type === 'audio' ||
        type === 'text' ||
        type === 'pdf'        // 👈 【核心修复】：在这里加上这一行！
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

  // =========================
  // VIDEO MODE
  // =========================

  viewer.classList.add('mode-video');

  // 默认所有 video 都显示 video ui
  if (videoUI) {
    videoUI.style.display = 'flex';
  }

  // =========================
  // FOLLY-1
  // =========================

  if (id === 'plague-film') {

  viewer.classList.add(
    'video-has-chapters',
    'folly-1',
    'score-linear'
  );

  // ⭐ 显示 chapter toggle
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
  // =========================
  // FOLLY-2
  // =========================

  else if (id === 'radio-film') {

  viewer.classList.add(
    'video-has-chapters',
    'folly-2',
    'score-radial'
  );

  // ⭐ 显示 chapter toggle
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
    { time: 0, label: '引序：滯岸之殼' },
    { time: 20, label: '階段一：餘存維持' },
    { time: 42, label: '階段二：枯蝕應力' },
    { time: 56, label: '階段三：磨損掙扎' },
    { time: 84, label: '階段四：徒勞空撐' },
    { time: 124, label: '尾聲：崩塌餘響' }
  ],
  'folly-2': [
    { time: 0, label: '引序：并和狹間' },
    { time: 28, label: '階段一：非諧構合' },
    { time: 67, label: '階段二：磨盤震顫' },
    { time: 105, label: '階段三：風蝕噪層' },
    { time: 142, label: '階段四：嗡鳴共振' },
    { time: 198, label: '階段五：以太餘鳴' },
    { time: 231, label: '尾聲：無實之基' }
  ]
};

function renderChapters(key) {

    const container =
        document.querySelector(
            '#video-ui .video-chapters'
        );

    if (!container) return;

    container.classList.add('open');

  container.innerHTML = '';

  chapterData[key].forEach(ch => {
      const div =
          document.createElement('div');

      div.classList.add(
          'chapter-button'
      );

      div.dataset.time =
          ch.time;

      div.textContent =
          ch.label;

    div.onclick = () => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = ch.time;
        video.play();
      }
    };

      container.appendChild(div);

  });

    const video =
        document.querySelector('video');

    if (video) {

        video.removeEventListener(
            'timeupdate',
            updateActiveChapter
        );

        video.addEventListener(
            'timeupdate',
            updateActiveChapter
        );

        updateActiveChapter();

    }

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
/* =========================
   geo ↔ svg
========================= */

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

/* =========================
   coordinate format
========================= */

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

/* =========================
   sites
========================= */

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
       desc: "廢棄多年的舊水泥廠，一部分建築已經坍毀，其餘危樓仍等待著下一次崩塌。風化、滲水與重力持續完成這場漫長的山葬，植物沿著磚縫與裂隙緩慢生長，如同撬開沉積岩般，一寸寸拆解著這座工廠，直至它重新回歸山體。",
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
        desc: "市內機場停用後，整條跑道被挖裂成巨大的斷口，重新恢復為草原地貌。昔日引擎轟鳴的痕跡被逐步抹去，唯有景觀邊緣仍散落著崩裂的混凝土。裂縫之間，一棵形似單翼的樹木抱著跑道殘片生長，如同仍想帶著這片無法起飛的土地飛向天空。",
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
    desc: "他們曾經花費巨大的工程，将海水引入建筑，將海洋馴服成一座浴場；如今，海重新将建筑收回自己体内，建筑已经开始遵循潮汐，而不是遵循人們。潮水摧殘著殘存的池壁與地基，使駐足於此的我們不再踏入那些沉滿碎石與綠藻的池中，只沿著破裂的池緣緩慢穿行。海沒有淹沒建築，只是讓海岸重新長進了建築裡。",
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
        desc: "工程塑料布被緊密包覆於殘牆之上，連磁磚的裂紋與牆面的起伏都被逐一轉印。它並未修復廢墟，而是在拆除之前，替建築留下最後一次完整的形體，如同一張覆蓋於遺構表面的拓膜。",
        lat: 30.7023424,
        lng: 104.0714623,
        archiveDate: "2024.04",
        type: "record"
    },
{
    name: "疊骸構陣",
    desc: "工廠依丘陵展開，起伏地勢與錯位的建築共同構成了一套複雜的空間。高低不同的樓層、彼此交錯的框架與各異的建築朝向，使它自建成之初便帶有一種難以被看穿的結構。然而在工廠運作時，牆體、功能、路牌與工人的日常經驗維持著這套秩序，也掩蓋了它真正的樣貌。直到牆面剝落、樓板坍塌，建築只剩下交錯的骨架與陰影，那原本被秩序遮蔽的複雜與險峻才逐漸顯露。廢墟沒有創造迷宮，只是讓它終於現身。",
            lat: 30.4416944,
                lng: 104.0347500,
                    archiveDate: "2024.05",
                        type: "record"
    },
    {
        name: "苔網塬",
        desc: "巨大的綠色工程紗網覆蓋著建築殘骸，如同一層蔓延於工業遺址上的工業苔蘚。原本用來覆蓋廢墟的工程材料，在漫長的風化中逐漸承接泥土、保留水分、孕育植物，成為建築消失後的第一層生命。混凝土碎塊將網面層層托起，萌發於鋼筋與碎石間的樹木則以根系緩緩頂起柔軟的纖維，形成起伏如波的地形。整片工業苔蘚隨著下方持續生長的植物微微隆起，讓廢墟彷彿正以另一種方式緩慢呼吸。",
        lat: 30.66457,
        lng: 104.15798,
        archiveDate: "2024.05",
        type: "record"
    },
{
    name: "陸塢艦骸",
    desc: "這裡或許是距離海洋最遙遠的地方之一，卻矗立著一艘巨大的航空母艦。它從未航行，也從未真正停泊，只是在池塘中央長久維繫著一場關於海洋的想像。當池水乾涸、金屬蒙皮逐步拆除脫落，航母漸漸顯露出磚塊、鋼筋與混凝土的本體。直到最後，人們才發現，被拆解的並非一艘船，而是一整片曾被建造出來的海洋。",
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
        desc: "波浪般起伏的建築群停留在未完成的狀態，外牆逐漸剝落，只剩混凝土骨架裸露於海風之中，層層起伏的輪廓如同一具被侵蝕的巨大波狀骸骨。海岸上的人造物，似乎都擁有共同的宿命。消波塊因抵擋海浪而逐漸耗盡自身，這座建築則因失去建造的目的，長年承受鹽霧與海風的雕刻。兩者都在走向毀滅，只是一者因使命而消耗，一者因失去使命而風化。最荒誕的是，消波塊始終履行著自己的職責，而它所守護的，卻是一座早已被人放棄的建築。",
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
        desc: "地下商業街與隧道在荒廢多年後，逐漸受到雨水、地下滲流與潮氣侵蝕。封閉的店鋪中，人體模特、鏡面與陳列仍停留於原位，替代消失的人群，填補空間中的缺席，而裂紋、霉斑與鏽跡則持續覆寫其上。最底層隧道的穹頂仍保留著美人魚雕塑與海洋壁畫，將殘破的牆面維持成一處人工海洋的幻境。隨著地下水持續湧入，這座由幻象構成的水域，最終被真正的水重新佔據。",
        lat: 30.6602710,
        lng: 104.0676944,
        archiveDate: "2024.08",
        type: "record"
    },
    {
        name: "荒娛敖包",
        desc: "在這片難以離開的寒冬荒原上，人們或許期待信標中出現地圖、電話，或任何能與外界建立聯繫的工具。然而留下的卻是成堆的遊戲機臺。它們被堆疊成一座電子敖包，像一份錯誤抵達的禮物，在一無所有之地留下了最無用、也荒誕到令人絕望的存在。",
                lat: 41.72871,
                    lng: 110.51296,
                        archiveDate: "2024.12",

                            type: "record"
    },
    {
        name: "彩殼堡",
            desc: "農田之上升起一座未完成的城堡，一幅等待消費的風景。水泥仍保持裸露，塔尖仍是鋼筋骨架，而外牆卻已塗滿近乎玩具般的色彩。",
                lat: 40.2368611,
                    lng: 116.1637500,
                        archiveDate: "2025.01",
                            type: "record"
    },
        {
            name: "削巖殘居",
            desc: "整座山體被開採成階梯，散落其上的屋舍彷彿被收割過的作物，只留下失去屋頂的磚牆，在巖層間逐漸風化。",
        lat: 30.425167,
        lng: 104.096167,
        archiveDate: "2025.02",
        type: "record"
    },

    {
        name: "遷痕舊埠",
        desc: "沿江舊碼頭逐漸退出城市，牆上的「拆」與「未簽字」記錄著空間消失的過程。拆除後的碎裂地景中，生活痕跡仍停留於原處：盆栽沿裂縫生長，線束牽引著墜落的牆板，高處的椅子與「請留意您的貴重物品」標語仍保存著已無使用者的日常。人離開後，這片岸線成為一座由殘骸、植物與記憶構成的荒蕪花園。",
        lat: 30.4325100,
        lng: 104.0406300,
        archiveDate: "2026.06",
        type: "record"
    },
    {
        name: "山骸窟殿",
        desc: "這座沿山而建的磷礦工廠，因層層堆疊的牆體與巨大尺度，被當地人稱為「小布達拉宮」。遠望時，它像一座矗立於山間的宏偉宮殿；靠近後，卻只見輸送帶與廠房。神聖建築的形態與粗曠的功能在此重疊，最終留下了一座沒有信仰的宮殿，一副被資源消耗後遺留於山體上的工業幻象。",
                lat: 34.5275555,
                    lng: 119.1429722,
                        archiveDate: "2026.07",
                            type: "record"
    }
];
/* =========================
   record navigation
========================= */

const recordSites = sites.filter(
    site => site.type === 'record'
);

let currentRecordIndex = 0;

function openDrawerByIndex(i) {

    const item = markers[i];

    if (!item) return;

    openDrawer(
        item.site,
        item.marker
    );

}

/* =========================
   marker icon
========================= */

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
/* =========================
   markers & Compass 核心系统结合版
========================= */
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

// 罗盘底层核心变量，放置在最外层以供各方安全访问
let currentCompassMarker = null;

sites.forEach((site, index) => {
    const pos = geoToSVG(site.lat, site.lng);

    const marker = L.marker(pos, {
        icon: createIcon(site.type)
    }).addTo(map);

    marker.bindPopup(`
    <div class="archive-popup">
      <div class="archive-content">
        <div class="archive-name">${site.name}</div>
        <div class="archive-coords">
          ${site.lat >= 0 ? formatLat(-site.lat) : formatLat(Math.abs(site.lat))}
          &nbsp;&nbsp;
          ${formatLng(site.lng)}
        </div>
        <div class="archive-date">${site.archiveDate}</div>
        <div class="archive-drawer-link" onclick="window.openDrawerByIndex(${index}, this)">
          <span class="label">${site.type === "garden" ? "廢墟園林" : "遺構錄"}</span>
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

    // 检测罗盘当前是否处于显示状态
    const compassOverlay = document.getElementById('compass-overlay');
    const isOpen = compassOverlay && compassOverlay.classList.contains('show');

    if (isOpen) {
        // 1. 打开状态下：添加激活类名，并渲染你指定的带 <span> 箭头的 HTML 结构
        recordLinkEl.classList.add('compass-active');
        recordLinkEl.innerHTML = `<span style="font-weight: 300; margin-right: 12px; display: inline-block;">➢</span>[ 遺構錄 | ${site.name} ]`;
    } else {
        // 2. 关闭状态下：移除激活类名，恢复原样，把控制权交回给 CSS hover
        recordLinkEl.classList.remove('compass-active');
        recordLinkEl.textContent = `[ 遺構錄 | ${site.name} ]`;
    }
}

/* =========================
   record marker lookup
========================= */

function getRecordMarker(siteName) {
    const item = markers.find(
        m => m.site.name === siteName
    );
    return item || null;
}
/* ===================================================
   🧭 罗盘动态阻尼物理引擎
   =================================================== */

// 全局状态变量
let targetArrowAngle = 0;   // 箭头瞬间指向的最终地理角度
let currentRingAngle = 45;  // 椭圆环当前的实际角度 (初始为 45 度)
let currentRingScale = 1;
let currentRingMorph = 0; // 0=椭圆 1=圆

// 阻尼系数 (0.01 ~ 0.1 之间。数值越小，环转得越慢，粘滞感和重量感越强)
const DAMPING_FRICTION = 0.035;

function animateCompassPhysics() {
    // 1. 目标环角度：永远比箭头角度少 90 度
    // 这保证了环最终停下来时，箭头恰好落在椭圆的短轴顶点，即垂直于最长直径 (长轴)
    let targetRing = targetArrowAngle + 90;

    // 2. 计算环的最短路径阻尼平滑过渡 (Lerp)
    let diff = targetRing - currentRingAngle;
    diff = ((diff + 540) % 360) - 180; // 处理跨越 360 度的突变跳跃
    currentRingAngle += diff * DAMPING_FRICTION;

    // 3. 将阻尼角度应用给 椭圆环 和 米字刻度
    const ring = document.querySelector('.compass-ring');

    let scale = 1;

    const captureRadius = 140;
    const minScale = 0.23;

 if (
    window.compassDistance !== undefined &&
    window.compassDistance < captureRadius
) {

    const t =
        window.compassDistance /
        captureRadius;

    const targetScale =
        minScale +
        (1 - minScale) * t;

    currentRingScale +=
        (targetScale - currentRingScale)
        * 0.06;

    // ===== 椭圆→圆 =====

    const targetMorph =
        1 - t;

    currentRingMorph +=
        (targetMorph - currentRingMorph)
        * 0.06;

}
else {

    currentRingScale +=
        (1 - currentRingScale)
        * 0.05;

    currentRingMorph +=
        (0 - currentRingMorph)
        * 0.05;

}
    const asterisk =
        document.querySelector(
            '.compass-asterisk'
        );

    if (asterisk)
        asterisk.style.transform =
            `translate(-50%, -50%)`;

    // 4. 计算箭头在当前倾斜状态下，完美贴合椭圆边缘的坐标
    if (ring) {
        // 动态获取椭圆真正的长短半轴 (自动兼容屏幕缩放和 vmin)
        const morphWidth =
            1 - currentRingMorph * 0.65;

        const morphHeight = 1;

        const scaledA =
            ring.offsetWidth *
            currentRingScale *
            morphWidth / 2;

        const scaledB =
            ring.offsetHeight *
            currentRingScale *
            morphHeight / 2;
        // 角度转弧度
        const theta = targetArrowAngle * (Math.PI / 180); // 箭头的绝对方向
        const alpha = currentRingAngle * (Math.PI / 180); // 环的当前倾斜角

        // 箭头相对于椭圆环的局部夹角
        const phi = theta - alpha;

        // 极坐标椭圆半径方程：精确算出该角度下圆周离圆心的距离

        let radius =
            (scaledA * scaledB) /
            Math.sqrt(
                Math.pow(
                    scaledB * Math.cos(phi),
                    2
                ) +
                Math.pow(
                    scaledA * Math.sin(phi),
                    2
                )
            );
    
        // 转换回屏幕 XY 坐标系
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);

        // 5. 将坐标和旋转赋予箭头基座

        const pointer = document.querySelector('.compass-pointer');
        if (pointer) {
            // translate 控制位置，rotate 控制箭头符号本身的朝向 (抵消自身方向偏差)
            const arrowRotation =
                compassTargetInside
                    ? targetArrowAngle + 270
                    : targetArrowAngle + 90;

            pointer.style.transform =
                `translate(${x}px, ${y}px)
 rotate(${arrowRotation}deg)`;
            if (ring) {

                const morphWidth =
                    1 - currentRingMorph * 0.5;

                const morphHeight =
                    1;

                const lineWeight =
                    1 +
                    currentRingMorph * 7;

                ring.style.transform =
                    `
        rotate(${currentRingAngle}deg)
        scaleX(${currentRingScale * morphWidth})
        scaleY(${currentRingScale * morphHeight})
        `;

                ring.style.borderWidth =
                    `${lineWeight}px`;

            }
        }
    }

    // 持续逐帧渲染
    requestAnimationFrame(animateCompassPhysics);
}

// 启动物理引擎

animateCompassPhysics();
/* =========================
   Compass 空间几何测绘运算 (全局防弹版)
========================= */

// 1. 动态获取元素工厂
function getCompassElements() {
    return {
        overlay: document.getElementById('compass-overlay'),
        pointer: document.getElementById('compass-pointer'),
        arrow: document.querySelector('.compass-arrow')
    };
}

// 2. 动态探测地图对象
function getSafeMap() {
    if (typeof map !== 'undefined') return map;
    if (typeof window.map !== 'undefined') return window.map;
    return null;
}

window.showCompass = function() {
    const { overlay } = getCompassElements();
    if (!overlay) return;

    overlay.classList.remove('hidden');
    overlay.offsetWidth; // 强制触发 CSS 重绘
    overlay.classList.add('show');

    // 立刻刷新一次导航栏，让“⌮”图标长出来
    updateRecordNav();

    window.updateCompassDirection();

    const safeMap = getSafeMap();
    if (safeMap) {
        safeMap.on('move viewreset zoomanim', window.updateCompassDirection);
    }
};

window.hideCompass = function() {
    const { overlay } = getCompassElements();
    if (!overlay) return;

    overlay.classList.remove('show');

    // 立刻刷新一次导航栏，把“⌮”图标收回去
    updateRecordNav();

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

// 【核心修复】：挂载到全局，供外部切换按钮安全调用
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

    // 1. 获取屏幕中心像素坐标 (利用不受旋转影响的 rect 中心点)
    const ringRect = compassRing.getBoundingClientRect();
    const compassCenterX = ringRect.left + ringRect.width / 2;
    const compassCenterY = ringRect.top + ringRect.height / 2;

    // 2. 将目标遗构 Marker 转换为屏幕坐标
    const markerLatLng = currentCompassMarker.getLatLng();
    const markerContainerPoint = safeMap.latLngToContainerPoint(markerLatLng);

    // 3. 计算全局坐标系下的连线向量与夹角
    const deltaX = markerContainerPoint.x - compassCenterX;
    const deltaY = markerContainerPoint.y - compassCenterY;
    const distanceToTarget = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    window.compassDistance =
        distanceToTarget;
    const ringRadius =
        Math.min(
            compassRing.offsetWidth,
            compassRing.offsetHeight
        ) * 0.5;

    compassTargetInside =
        distanceToTarget < ringRadius;
    const globalAngleRad = Math.atan2(deltaY, deltaX);
    targetArrowAngle =
        globalAngleRad *
        180 /
        Math.PI;

    // ==========================================
    // 🚀 倾斜椭圆极坐标算法（防畸变局部坐标系版）
    // ==========================================


    const rotationAngleDeg =
        currentRingAngle;
    const rotationAngleRad = rotationAngleDeg * (Math.PI / 180);

    
};

/* =========================
   record navigator 交互控制
========================= */

// 抽取公共逻辑
function handleRecordSwitch() {
    updateRecordNav();
    const markerData = getRecordMarker(recordSites[currentRecordIndex].name);
    if (markerData && markerData.marker) {
        flashMarkerCrosshair(markerData.marker);
        // 【精准联动】传给罗盘
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

// 中央文字点击事件（修复版）
const recordLink = document.getElementById('record-link');
if (recordLink) {
    recordLink.addEventListener('click', (e) => {
        e.stopPropagation();
        const compassOverlay = document.getElementById('compass-overlay');
        if (!compassOverlay) return;

        if (compassOverlay.classList.contains('show')) {
            window.hideCompass();
        } else {
            // 打开罗盘前，首先获取当前高亮遗构的真实 marker
            const markerData = getRecordMarker(recordSites[currentRecordIndex].name);
            if (markerData && markerData.marker && window.setCompassTarget) {
                window.setCompassTarget(markerData.marker);
            }
            window.showCompass();
        }
    });

    // 悬停联动十字线保持原样
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

// 绑定遮罩层点击关闭
document.addEventListener('DOMContentLoaded', () => {
    const compassOverlay = document.getElementById('compass-overlay');
    if (compassOverlay) {
        compassOverlay.addEventListener('click', window.hideCompass);
    }
});

/* =========================
   fly system
========================= */

function flyToSite(site, index) {
    activeSiteIndex = index;

    const pos = geoToSVG(site.lat, site.lng);

    markers.forEach(m => m.marker.closePopup());

    map.flyTo(pos, 3, {
        duration: 4,
        easeLinearity: 0.2
    });

    setTimeout(() => {
        map.flyTo(pos, 5, {
            duration: 4,
            easeLinearity: 0.2
        });
    }, 1500);

    map.once('moveend', () => {
        markers[index].marker.openPopup();
    });

    updateMarkerState();
}

/* =========================
   marker state
========================= */

function updateMarkerState() {
    markers.forEach(m => {
        const el = m.marker.getElement();
        const isActive = m.index === activeSiteIndex;
        m.marker.setOpacity(isActive ? 1 : 0.5);
        m.marker.setZIndexOffset(isActive ? 1000 : 0);
        if (el) {
            el.classList.toggle('active-marker', isActive);
        }
    });
}

/* =========================
   HUD
========================= */

map.on('mousemove', e => {
    const geo = svgToGeo(e.latlng.lat, e.latlng.lng);
    document.getElementById('coords').innerText = `${formatLat(geo.lat)}   ${formatLng(geo.lng)}`;
});

/* =========================
global drawer close system
========================= */

document.addEventListener('click', (e) => {
    if (typeof isClosingViewer !== 'undefined' && isClosingViewer) return; // 确保 isClosingViewer 已定义

    const archiveDrawer = document.getElementById('archive-drawer');
    const introDrawer = document.getElementById('intro-drawer');
    const viewer = document.querySelector('.attachment-viewer');

    // attachment viewer 开着时不处理
    if (viewer && viewer.classList.contains('open')) return;

    // ARCHIVE DRAWER
    if (archiveDrawer && archiveDrawer.classList.contains('open')) {
        const clickedInsideArchiveDrawer = e.target.closest('#archive-drawer');
        const clickedArchiveTrigger = e.target.closest('.archive-drawer-link');
        if (clickedInsideArchiveDrawer) return;
        if (clickedArchiveTrigger) return;
        if (typeof closeDrawer === 'function') closeDrawer();
    }

    // INTRO DRAWER
    if (introDrawer && introDrawer.classList.contains('open')) {
        const clickedInsideIntro = e.target.closest('#intro-drawer');
        const clickedTitle = e.target.closest('#main-title');
        // 🌟 新增：检测是否点击了底部按钮，如果是，不要关闭抽屉
        const clickedBottomTrigger = e.target.closest('#bottom-trigger-ruin');

        if (clickedInsideIntro) return;
        if (clickedTitle) return;
        // 🌟 新增：拦截底部按钮的点击
        if (clickedBottomTrigger) return;

        introDrawer.classList.remove('open');
        titleDismissed = true;
        mainTitle?.classList.add('hidden');
        if (mainTitle) mainTitle.style.pointerEvents = 'none';
    }
});
let holdInterval = null;

function startHold(action) {
    stopHold(); // 防止重复
    holdInterval = setInterval(() => {
        action();
        applyTransform();
    }, 50); // 数值越小越“顺滑/敏感”
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

    // reset video
    const video = currentVideo;
    if (video) {
        video.pause();
        video.currentTime = 0;
    }

    // reset score UI
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

    // ====== 统一 transform ======
    const transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
    wrapper.style.transform = transform;

    // card 内部只负责 rotate，不再管 scale
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

    // media fallback
    if (media) {
        media.style.transform = 'none';
    }
}

/* =========================
   joystick rotate system
========================= */

const joystickWrap = document.getElementById('joystick-wrap');
const knob = document.getElementById('joystick-knob');
let joyActive = false;
const joystick = document.getElementById('joystick');

if (joystick && knob) {
    joystick.addEventListener('pointerdown', () => {
        joyActive = true;
    });

    document.addEventListener('pointerup', () => {
        joyActive = false;
        knob.style.transform = `translate(-50%, -50%)`;
    });

    document.addEventListener('pointermove', (e) => {
        if (!joyActive) return;

        const rect = joystick.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = e.clientX - cx;
        let dy = e.clientY - cy;
        const max = 32;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > max) {
            dx = dx / dist * max;
            dy = dy / dist * max;
        }

        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        cardRotY += dx * 0.18;
        cardRotX -= dy * 0.18;
        const card = document.getElementById('score-card');
        updateCardTransform(card);
    });
}

/* =========================
   SCORE ROTATE HUD
========================= */

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

/* =========================
   intro drawer
========================= */
const isMobile = window.innerWidth <= 768;
const isTouchDevice = window.matchMedia('(hover: none)').matches;
const mainTitle = document.getElementById('main-title');
const hoverZone = document.getElementById('title-hover-zone');
const introDrawer = document.getElementById('intro-drawer');
const introClose = document.getElementById('intro-close');

// 🌟 新增：获取底部“廢墟園林系列”按钮
const bottomTriggerRuin = document.getElementById('bottom-trigger-ruin');

let titleDismissed = false;

// 🌟 提取打开 Intro Drawer 的核心逻辑为一个函数，方便复用
function openIntroDrawer() {
    if (!introDrawer) return;
    introDrawer.classList.add('open');
    if (mainTitle) {
        mainTitle.classList.remove('hidden');
        mainTitle.style.pointerEvents = 'auto';
    }
}

// 绑定给原有的 mainTitle
if (mainTitle) {
    // 🌟 修改：调用封装好的函数
    mainTitle.addEventListener('click', openIntroDrawer);
}

// 🌟 新增：绑定给底部新按钮
if (bottomTriggerRuin) {
    bottomTriggerRuin.addEventListener('click', openIntroDrawer);
}


if (introClose && introDrawer) {
    introClose.addEventListener('click', () => {
        introDrawer.classList.remove('open');
        titleDismissed = true;
        if (mainTitle) {
            mainTitle.classList.add('hidden');
            mainTitle.style.pointerEvents = 'none';
        }
    });
}

/* =========================
   hide title on interaction
========================= */

document.addEventListener('click', (e) => {
    // 🌟 修改：如果点击的是标题本身 OR 底部的新按钮，就不隐藏标题
    if (e.target.closest('#main-title') || e.target.closest('#bottom-trigger-ruin')) return;

    if (mainTitle) {
        mainTitle.classList.add('hidden');
        mainTitle.style.pointerEvents = 'none';
    }
});

/* =========================
   hover reveal title
========================= */

const hoverField = document.getElementById('title-hover-field');

function showTitle() {
    if (introDrawer?.classList.contains('open')) return;
    if (mainTitle) {
        mainTitle.classList.remove('hidden');
        mainTitle.style.pointerEvents = 'auto';
    }
}

function hideTitle() {
    if (introDrawer?.classList.contains('open')) return;
    if (titleDismissed && mainTitle) {
        mainTitle.classList.add('hidden');
    }
}

/* =========================
   双区域 hover 控制
========================= */

if (mainTitle) {
    mainTitle.addEventListener('mouseenter', showTitle);
    mainTitle.addEventListener('mouseleave', hideTitle);
}

if (hoverZone) {
    hoverZone.addEventListener('mouseenter', showTitle);
    hoverZone.addEventListener('mouseleave', hideTitle);
}

if (hoverField) {
    hoverField.addEventListener('mouseenter', showTitle);
    hoverField.addEventListener('mouseleave', hideTitle);
}

document.addEventListener('DOMContentLoaded', () => {
    const introDrawer = document.getElementById('intro-drawer');
    if (window.matchMedia('(max-width: 1024px)').matches) {
        introDrawer?.classList.remove('open');
    }
});
/* =========================
   PDF 核心函数 (必须放在全局，不要放在任何函数内部)
========================= */
function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function (page) {
        const canvas = document.getElementById('pdf-canvas');
        if (!canvas) return;

        let currentScale = pdfScale;
        let viewport = page.getViewport({ scale: currentScale });

        // 内存防崩降级
        if (viewport.width * viewport.height > 15000000) {
            currentScale = 1.0;
            viewport = page.getViewport({ scale: currentScale });
        }

        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = { canvasContext: ctx, viewport: viewport };
        const renderTask = page.render(renderContext);

        renderTask.promise.then(function () {
            pageRendering = false;
            canvas.style.opacity = 1;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
    // 更新页码显示
    const pageNumDisplay = document.getElementById('pdf-page-num');
    if (pageNumDisplay) pageNumDisplay.innerText = `${num} / ${pdfDoc.numPages}`;
}

// 这个函数必须定义在这里，外部才能调用
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}
/* =========================
   PDF 渲染引擎 (防崩潰進化版)
========================= */
function renderPage(num) {
    pageRendering = true;

    pdfDoc.getPage(num).then(function (page) {
        const canvas = document.getElementById('pdf-canvas');
        if (!canvas) return;

        // 🌟 动态保护机制：如果是极大的测绘图，自动将 scale 降维，防止 Canvas 内存溢出白屏
        let currentScale = pdfScale;
        let viewport = page.getViewport({ scale: currentScale });

        // 浏览器安全极限通常在 1600 万像素左右，超过此数值极易白屏
        if (viewport.width * viewport.height > 15000000) {
            console.warn("PDF 尺寸極大，自動啟動降級渲染以防崩潰。");
            currentScale = 1.0; // 强制降回原生清晰度
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

            // 渲染完毕后，平滑淡入图纸，并隐藏“读取中”提示
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

/* =========================
   文件堆叠生成与交互逻辑
========================= */
function buildFileStacks() {
    const stackGarden = document.getElementById('stack-garden');
    const stackRecord = document.getElementById('stack-record');
    if (!stackGarden || !stackRecord) return;

    stackGarden.innerHTML = '';
    stackRecord.innerHTML = '';

    const gardenSites = sites.filter(site => site.type === 'garden');
    const recordSites = sites.filter(site => site.type !== 'garden');

    // 确保页面中存在右下角的“收起羅盤”按钮
    let collapseBtn = document.getElementById('collapse-compass-btn');
    if (!collapseBtn) {
        collapseBtn = document.createElement('button');
        collapseBtn.id = 'collapse-compass-btn';
        collapseBtn.innerText = '[ 收起羅盤 ×]';
        document.body.appendChild(collapseBtn);
    }

    // 统一的全局关闭罗盘函数
    function closeCompassGlobal() {
        document.querySelectorAll('.compass-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
        collapseBtn.style.display = 'none';
        if (typeof window.hideCompass === 'function') {
            window.hideCompass();
        }
    }

    collapseBtn.onclick = (e) => {
        e.stopPropagation();
        closeCompassGlobal();
    };

    function renderStack(siteArray, container, isGarden) {
        const total = siteArray.length;
        const cnNums = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

        siteArray.forEach((site, index) => {
            const docEl = document.createElement('div');
            docEl.className = 'archive-doc';

            const positionIndex = (total - 1) - index;
            const verticalGap = isGarden ? 23 : 18;

            docEl.style.top = `${positionIndex * verticalGap}px`;
            if (isGarden) {
                docEl.style.left = `-${positionIndex * 4}px`;
            } else {
                docEl.style.right = `-${positionIndex * 3}px`;
            }

            docEl.style.zIndex = positionIndex;
            docEl.dataset.zIndex = positionIndex;

            const seq = cnNums[index] || (index + 1);
            const titleText = isGarden
                ? ` 廢墟園林 · 其${seq} | ${site.name} `
                : ` 遺構錄 | ${site.name} `;
            const latStr = site.lat >= 0 ? formatLat(-site.lat) : formatLat(Math.abs(site.lat));
            const lngStr = formatLng(site.lng);

            const creatorText = isGarden ? '創作者: 羅清源' : '記錄者: 羅清源';
            let interactionSection = '';

            if (isGarden) {
                interactionSection = `
                    <div class="doc-meta" style="margin-bottom: 8px;">${latStr.trim()} ${lngStr.trim()}</div>
                    <div class="doc-coord-btn garden-nav-btn">自動導航 ⌖</div>
                `;
            } else {
                interactionSection = `
                    <div class="doc-meta" style="margin-bottom: 8px;">${latStr.trim()} ${lngStr.trim()}</div>
                    <div class="doc-coord-btn compass-btn">⊙ 導航羅盤</div>
                `;
            }

            docEl.innerHTML = `
                <div class="doc-meta">[ ${isGarden ? '廢墟園林' : '遺構錄'} ] | 歸檔: ${site.archiveDate}</div>
                <div class="doc-title">${titleText}</div>
                <div class="doc-meta">${creatorText}</div>
                ${interactionSection}
            `;

            // 点击抽取/收回交互（加入对 doc-title 的拦截，避免点标题时只做卡片抽拉）
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

            // 获取按钮与标题元素
            const coordBtn = docEl.querySelector('.doc-coord-btn');
            const titleEl = docEl.querySelector('.doc-title');

            // 按钮点击交互
            if (coordBtn) {
                coordBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const originalIndex = sites.indexOf(site);

                    if (isGarden) {
                        if (typeof flyToSite === 'function') flyToSite(site, originalIndex);
                    } else {
                        document.querySelectorAll('.compass-btn.active').forEach(btn => btn.classList.remove('active'));
                        coordBtn.classList.add('active');
                        collapseBtn.style.display = 'block';

                        const targetMarkerData = markers[originalIndex];
                        if (targetMarkerData && targetMarkerData.marker) {
                            if (window.setCompassTarget) window.setCompassTarget(targetMarkerData.marker);
                            if (window.showCompass) window.showCompass();
                        }
                    }
                });
            }

            // 🌟 核心：点击 doc-title 时联动触发下方按钮的点击
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

