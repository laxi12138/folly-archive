// script.js
document.addEventListener('DOMContentLoaded', () => {
    const drawer = document.getElementById('archive-drawer');
    const mask = document.getElementById('drawer-mask');

    if (drawer) drawer.classList.remove('open');
    if (mask) mask.classList.remove('show');
    // 初始化一个基准层级，确保它大于你 CSS 中的 9999
    let globalTopZIndex = 10000;

    // 通用函数：将被交互的抽屉提至最前
    function bringDrawerToFront(element) {
        if (!element) return;
        globalTopZIndex += 1; // 每次调用，最高层级+1
        element.style.zIndex = globalTopZIndex;
    }

    /* >>>>>>>>>>>> 精准绑定：仅点击 bottom-trigger 字符触发 >>>>>>>>>>>> */
    const indexDrawer = document.getElementById('index-drawer');

    // 匹配所有 ID 以 bottom-trigger- 开头或包含 .bottom-trigger 类名的节点
    const triggers = document.querySelectorAll('[id^="bottom-trigger-"], .bottom-trigger');
    const drawerLeft = document.getElementById('mobile-left-drawer');
    const drawerRight = document.getElementById('mobile-right-drawer');

    // 🌟 新增：只要用户点击或触摸到抽屉本体，也立刻将其提至最顶层
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
                e.stopPropagation(); // 阻止冒泡，防止与其他地图/页面点击事件冲突

                if (window.innerWidth <= 768) {
                    const trigId = trigger.id;

                    // 点击“遺構錄・卷”时打开左侧菜单
                    if (trigId === 'bottom-trigger-record' && drawerLeft) {
                        drawerLeft.classList.toggle('open');
                        if (drawerLeft.classList.contains('open')) {
                            bringDrawerToFront(drawerLeft); // 🌟 提升层级
                        }
                        if (drawerRight) drawerRight.classList.remove('open');
                        return;
                    }

                    // 点击“⁙廢墟園林・編”时打开右侧菜单
                    if (trigId === 'bottom-trigger-ruin' && drawerRight) {
                        drawerRight.classList.toggle('open');
                        if (drawerRight.classList.contains('open')) {
                            bringDrawerToFront(drawerRight); // 🌟 提升层级
                        }
                        if (drawerLeft) drawerLeft.classList.remove('open');
                        return;
                    }
                }

                // 默认桌面端或其他情况下的全局抽屉逻辑
                indexDrawer.classList.toggle('open');
                if (indexDrawer.classList.contains('open')) {
                    bringDrawerToFront(indexDrawer); // 🌟 提升层级
                }
            });
        });
    }
    /* >>>>>>>>>>>> 新增：点击外部空间时，关闭 index-drawer >>>>>>>>>>>> */
    document.addEventListener('click', (e) => {
        // 如果抽屉存在且处于打开状态
        if (indexDrawer && indexDrawer.classList.contains('open')) {
            const isClickInsideDrawer =
                indexDrawer.contains(e.target);

            const isClickOnTrigger =
                Array.from(triggers).some(trigger =>
                    trigger.contains(e.target)
                );

            // ⭐ 新增：点击语言切换器时，不关闭 drawer
            const isClickOnLanguage =
                document
                    .getElementById('language-switcher')
                    ?.contains(e.target);

            // 如果既不在 drawer 内、
            // 也不是 trigger、
            // 也不是语言按钮，才关闭
            if (
                !isClickInsideDrawer &&
                !isClickOnTrigger &&
                !isClickOnLanguage
            ) {
                indexDrawer.classList.remove('open');
            }
        }
    });
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
let currentImageGroup = [];
let currentImageIndex = -1;
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

// =========================
//   map init
// =========================
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
    [height, width] // height = 3000, width = 4000
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

/* =========================
   动态溶解薄膜效果 (Zoom 响应)
========================= */
function updateMembraneEffect() {
    const el = overlay.getElement();
    if (!el) return;

    const currentZoom = map.getZoom();

    // 你原本的基础滤镜参数
    const baseBlur = 0.40;
    const baseContrast = 1.8;
    const baseBrightness = 1.02;
    const baseSepia = 0.33;

    // ✨ 触发效果的缩放阈值：提前到 zoom = 3
    const triggerZoom = 1;
    const maxZoom = 8; // 地图的最大 zoom

    if (currentZoom <= triggerZoom) {
        // 未达到阈值，保持原始状态
        el.style.filter = `blur(${baseBlur}px) contrast(${baseContrast}) brightness(${baseBrightness}) sepia(${baseSepia})`;
        el.style.opacity = 1;
        el.style.mixBlendMode = 'normal'; // 恢复正常混合模式
    } else {
        // 计算溶解系数 (0 到 1 之间)
        // 越放大，这个值越接近 1，效果越强
        const dissolveRatio = Math.min((currentZoom - triggerZoom) / (maxZoom - triggerZoom), 1);

        // 1. 边缘模糊：随着放大，边缘逐渐虚化
        const dynamicBlur = baseBlur + (dissolveRatio * 3.5);

        // 2. 降低对比度：褪去粗暴的死黑
        const dynamicContrast = baseContrast - (dissolveRatio * 0.8);

        // 3. 提高亮度：让黑色块显得透光
        const dynamicBrightness = baseBrightness + (dissolveRatio * 0.7);

        // 4. 边缘光晕渗透：从外部向内部发光，制造溶解感
        const glowSpread = dissolveRatio * 20;
        const glowOpacity = dissolveRatio * 0.8;

        // 5. 轻微反相：赋予“膜”一样的光学质感
        const dynamicInvert = dissolveRatio * 0.15;

        // 组合滤镜
        el.style.filter = `
            blur(${dynamicBlur}px) 
            contrast(${dynamicContrast}) 
            brightness(${dynamicBrightness}) 
            sepia(${baseSepia})
            invert(${dynamicInvert})
            drop-shadow(0 0 ${glowSpread}px rgba(255, 255, 230, ${glowOpacity}))
        `;

        // 降低整体透明度，透出底层白底
        el.style.opacity = 1 - (dissolveRatio * 0.45);

        // 使用正片叠底，让颜色溶于背景，彻底去掉“贴图感”
        el.style.mixBlendMode = 'multiply';
    }
}

// 绑定缩放事件
map.on('zoom', updateMembraneEffect);

// 初始化时执行一次，防止初始状态刚好在大缩放级别
updateMembraneEffect();

/* 👇 修改开始：移除原先的 map.setMaxBounds(null)，替换为圆形拖动限制 👇 */

// 1. 设定圆心坐标 (地图正中心，基于 CRS.Simple，lat 对应 y，lng 对应 x)
const mapCenter = L.latLng(height / 2, width / 2);

// 2. 设定边界半径 (设定为整个 map 长度/宽度的一半，以形成内切圆，也可按需修改)
const maxRadius = width / 2;

// 3. 监听地图拖动事件，限制其在圆形范围内
map.on('drag', function () {
    const currentCenter = map.getCenter();

    // 计算当前中心点与圆心的距离 (dx, dy)
    const dy = currentCenter.lat - mapCenter.lat;
    const dx = currentCenter.lng - mapCenter.lng;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果当前距离超出了圆的半径，强制将其拉回边界
    if (distance > maxRadius) {
        // 利用反正切求出超出的角度
        const angle = Math.atan2(dy, dx);

        // 计算边界上的极限坐标点
        const limitedLat = mapCenter.lat + maxRadius * Math.sin(angle);
        const limitedLng = mapCenter.lng + maxRadius * Math.cos(angle);

        // 使用 panTo 平滑拉回中心点（animate: false 防止动画冲突产生抖动）
        map.panTo([limitedLat, limitedLng], { animate: false });
    }
});
/* 👆 修改结束 👆 */


/* 👇 新增：監聽 Popup 打開事件，動態翻譯氣泡內容 👇 */
map.on('popupopen', function () {
    if (window.currentLang) switchLanguage(window.currentLang);
});
/* 👆 新增結束 👆 */

setTimeout(() => {
    const center = map.getCenter();
    map.flyTo(
        [
            center.lat + 377,   // 往上
            center.lng - 410
        ],
        map.getZoom() + 1.1,
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
        src: 'attachments/aether-scorched-earth/film-scan-1.jpg',
        desc: '-'
    },
    'radio-rec-2': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-2.jpg',
        desc: '-'
    },
    'radio-rec-3': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-3.jpg',
        desc: '-'
    },
    'radio-rec-4': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-4.jpg',
        desc: '-'
    },
    'radio-rec-5': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-5.jpg',
        desc: '-'
    },
    'radio-rec-6': {
        title: 'title_radio_rec',
        type: 'ruin garden record',
        mode: 'image',
        src: 'attachments/aether-scorched-earth/film-scan-6.jpg',
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
    'bath-08': {
        title: 'specimen_visual',
        mode: 'image',
        src: 'attachments/bath-crack/photo-8.jpg',
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

        // 🌟 將中文判斷改為判斷 data-i18n 的 key
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
    
    const titleEl = document.getElementById('attachment-title');
    titleEl.setAttribute('data-i18n', item.title);
    // 暫時設定一個 placeholder，避免空白
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
    // ... 前面 audio 和 text 的逻辑保持不变 ...

    if (item.mode === 'text') {
        wrapper.innerHTML = `
            <iframe class="archive-text-frame" src="${item.src}"></iframe>
        `;
    }

    // 🌟 1. 统一隐藏 HUD
    const pdfHud = document.getElementById('pdf-page-hud');
    if (pdfHud) pdfHud.style.display = 'none';

    const imageHud = document.getElementById('image-page-hud');
    if (imageHud) imageHud.style.display = 'none';

    // 🌟 图片模式处理
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

        // 👇 🌟 核心修改：去掉了 currentImageGroup.length > 1 的限制条件
        if (imageHud) {
            imageHud.style.display = 'flex';
            document.getElementById('image-page-num').innerText = `${currentImageIndex + 1}/${currentImageGroup.length}`;

            const prevBtn = document.getElementById('image-prev');
            const nextBtn = document.getElementById('image-next');

            // 因为去掉了限制，如果只有 1 张图 (length 为 1)，index 必然是 0。
            // 下面的逻辑会自动把 prevBtn 和 nextBtn 都变灰 (opacity: 0.2) 且不可点击。
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

    // 🌟 3. PDF 模式处理（去掉了底部的 return）
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

    // ... 后面接着你原本的 video 逻辑 ...
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
    // 1. 每次打开新附件前，先清除掉旧的所有指南状态类名（新增清除 mode-instrument 和 mode-folly-video）
    attachmentViewer.classList.remove('view-folly', 'view-score', 'view-pdf', 'view-image', 'view-txt', 'mode-instrument', 'mode-folly-video');

    // 2. 根据附件属性进行精确分发
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

    // 3. 针对特定的 MP4 视频文件分配差异化类名，以触发精准的 CSS 动画
    if (item.src) {
        if (item.src.includes('instrument-1.mp4') || item.src.includes('instrument-2.mp4')) {
            attachmentViewer.classList.add('mode-instrument');
        } else if (item.src.includes('folly-1.mp4') || item.src.includes('folly.mp4') || item.src.includes('folly-2.mp4')) {
            // 注：此处我把 folly-2.mp4 也加上了，防止遗漏你数据源中的其他同类视频
            attachmentViewer.classList.add('mode-folly-video');
        }
    }

    // ====== 保持你原有的最后两行不变 ======
    setViewerMode(item.mode, id);
    attachmentViewer.classList.add('open');

    // 🌟 如果需要的話，在這裡觸發一次翻譯
    if (window.currentLang) switchLanguage(window.currentLang);
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
        // 1. 横向扫描线 (修改越界限制)
        // ====================================
        const startX = w * 0.12;
        // 【修改】：将扫描终点从 1.0 缩小至 0.88，防止扫出 scorehud 边界
        const endX = w * 0.88;

        const x = startX + (endX - startX) * progress;
        const scanProgress = (x - startX) / (endX - startX);

        playhead.style.transform = `translateX(${x}px)`;

        const pulse = document.getElementById('score-pulse');

        if (pulse) {
            // 1:55 后彻底消失
            if (video.currentTime >= 113) {
                pulse.style.opacity = 0;
                return;
            }

            // ====================================
            // pulse 跟随扫描线横向移动 & 上升
            // ====================================
            const pulseX = x - 3;
            const lineTop = scoreBody.offsetHeight * 0.72;
            const lineHeight = scoreBody.offsetHeight * 0.22;
            const pulseY = lineTop + lineHeight - (lineHeight * scanProgress);

            // ====================================
            // 闪烁速度与心跳缩放变化
            // ====================================
            const minFreq = 0.8; // 2秒一次
            const maxFreq = 3.0; // 1秒3次
            const freq = minFreq + (maxFreq - minFreq) * scanProgress;

            // 获取正弦波值 (-1 到 1 之间)
            const sineVal = Math.sin(performance.now() * 0.001 * freq * Math.PI);
            const isBeating = sineVal > 0;

            // 亮度控制
            pulse.style.opacity = isBeating ? 1 : 0.12;

            // 【修改】：生成心跳回弹效果。
            // 当处于跳动周期 (isBeating) 时，利用正弦波将其平滑缩小至 0.6，随后顺滑回弹至 1.0
            const scale = isBeating ? (1 - Math.pow(sineVal, 2) * 0.4) : 1.0;

            // 将位移和缩放效果合并在一行以防止 CSS 冲突
            pulse.style.transform = `translate(${pulseX}px, ${pulseY}px) scale(${scale})`;
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
      if (pdfDoc) {
          pdfDoc.destroy().then(() => {
              pdfDoc = null;
          });
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
    // 🌟 新增：关闭容器时彻底移除指南 Class 和 视频差异化 Class，保持 DOM 干净
    viewer.classList.remove('view-folly', 'view-score', 'view-pdf', 'view-image', 'view-txt');
    isClosingViewer = false;
}, 220);
}
document.addEventListener('click', (e) => {
    // 🌟 1. 最高优先级：PDF 翻页拦截
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

    // 🌟 2. 新增：圖像翻頁攔截
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
function buildArchiveTree(prefix, titleKey) {
    const groups = buildArchiveGroups(prefix);

    // 🌟 新增：將中文 '遺構錄' 映射到語言包中對應的鍵值 'ui_record'
    const i18nKey = titleKey === '遺構錄' ? 'ui_record' : titleKey;

    // 預設的中文 fallback 保持不變
    const titleFallback = titleKey === '遺構錄' ? '遺構錄' : titleKey;

    return `
<div class="wander-tree">
  <div class="wander-root tree-folder" onclick="toggleArchiveTree(this)">
    <span class="tree-toggle">[+]</span>
    <!-- 👇 修改：將 data-i18n 綁定為轉換後的 i18nKey -->
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

    // 👇 新增：建立一個簡單的字典作為預設文字
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
  <!-- 👇 修改：將預設文字塞入 span 中 -->
  <span data-i18n="${labelKey}">${fallbackText}</span> (${count})
</div>
<div id="${folderId}" class="tree-children">
  ${makeTreeFiles(files)}
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
  <!-- 圖像檔案 -->
  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_img_files">圖像檔案</span> (6)
</div>
  <div class="tree-collapse archive-record-subcollapse">
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-1')">
     ├── film-scan-1.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-2')">
   ├── film-scan-2.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-3')">
 ├── film-scan-3.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-4')">
   ├── film-scan-4.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-5')">
   ├── film-scan-5.jpg
    </div>
    <div class="tree-file archive-record-file" onclick="openAttachmentViewer('radio-rec-6')">
 └── film-scan-6.jpg
    </div>
  </div>
  
  <!-- 測繪檔案 -->
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
<!-- 文字檔案 -->
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
  <!-- 圖像檔案 -->
  <div class="tree-folder archive-record-subfolder" onclick="toggleArchiveTree(this)">
  <span class="tree-line">├──</span>
  <span class="tree-toggle">[+]</span>
  <span data-i18n="ui_img_files">圖像檔案</span> (6)
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
      └── film-scan-6.jpg
    </div>
  </div>
  <!-- 測繪檔案 -->
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
<!-- 文字檔案 -->
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
/* =========================
   description
========================= */
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
      <!-- 默认隐藏的展开按钮 -->
      <div class="desc-toggle-btn" style="display: none; cursor: pointer; color: #888; margin-top: 6px; font-family: monospace; font-size: 12px; user-select: none;">[...]</div>
    </div>
  </div>

  <div class="drawer-section tree">
    ${treeHTML}
  </div>
`;

        // 【修改2：使用 MutationObserver 动态监听翻译时的文本变化】
        setTimeout(() => {
            const descText = el.querySelector('.desc-text');
            const toggleBtn = el.querySelector('.desc-toggle-btn');

            if (descText && toggleBtn) {
                // 1. 抽离一个动态检测溢出的函数
                const checkOverflow = () => {
                    // 只有在收起（折叠）状态下，才需要判断是否要显示 [...] 按钮
                    if (descText.style.webkitLineClamp !== 'unset') {
                        if (descText.scrollHeight > descText.clientHeight) {
                            toggleBtn.style.display = 'inline-block';
                        } else {
                            toggleBtn.style.display = 'none';
                        }
                    }
                };

                // 2. 无论初始高度如何，先把点击事件独立绑定好
                toggleBtn.addEventListener('click', () => {
                    const isExpanded = descText.style.webkitLineClamp === 'unset';
                    if (isExpanded) {
                        // 当前是展开状态 -> 点击后收回至6行
                        descText.style.webkitLineClamp = '6';
                        toggleBtn.innerText = '[...]';
                        checkOverflow(); // 收回后重新检测一下高度
                    } else {
                        // 当前是收起状态 -> 点击后完全展开
                        descText.style.webkitLineClamp = 'unset';
                        toggleBtn.innerText = '[ ^ ]';
                    }
                });

                // 3. 初始执行一次检测
                checkOverflow();

                // 4. 核心：添加 MutationObserver，监听翻译打字机特效导致的 DOM 变化
                const observer = new MutationObserver(() => {
                    checkOverflow();
                });

                // 监听文字内容的实时更替
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

        // 👇 新增：綁定 i18n 鍵值，並以 label 作為生肉預設文字
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

    // 👇 新增：影片章節按鈕生成完畢後，立即觸發一次翻譯
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
   map markers 
========================= */
// 补充缺失的 siteTagsMapping 对象
const siteTagsMapping = {
    // 廢墟園林系列⁙
    "瘟豬壩沉墟": "ruin, sunken, water, crack",
    "電臺路焦土": "scorched, ash, desolate, sand, tower",

    // 遺構錄系列
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
// 在这里插入你提供的生成地图标记的函数
function createSiteMarker(site) {
    // 获取该地点的 tags，例如 "ruin, mountain"
    const tags = siteTagsMapping[site.name] || "";

    const customIcon = L.divIcon({
        className: 'custom-map-marker',
        // 👇 删除了 archive-doc，只保留 site-character
        html: `<div class="site-character" data-tag="${tags}">${site.character || ''}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

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
/* =========================
   Initialize Markers
========================= */

// 遍历 sites 数据，生成所有地图标记
if (typeof sites !== 'undefined' && sites.length > 0) {
    sites.forEach(site => {
        createSiteMarker(site);
    });
}
/* =========================
   record navigation
========================= */

const recordSites = sites.filter(
    site => site.type === 'record'
);

let currentRecordIndex = 0;

// 【修改后】加入关闭罗盘的指令
function openDrawerByIndex(i) {
    const item = markers[i];
    if (!item) return;

    // 🌟 新增：点击进入 popup 里的档案时，自动收起罗盘并隐藏右下角的关闭按钮
    if (typeof window.hideCompass === 'function') {
        window.hideCompass();

        // 同时清除卡片上的 active 状态
        document.querySelectorAll('.compass-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
    }

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

        // 🌟 核心修改：移除了手动点击时自动收起罗盘的逻辑，
        // 现在罗盘会一直保留，直到你点击 Popup 中的【遺構錄】按钮。

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
        recordLinkEl.innerHTML = `<span style="font-weight: 300; margin-right: 12px; display: inline-block;">➢</span>[ <span data-i18n="ui_record">遺構錄</span> | <span data-i18n="site_name_${site.name}">${site.name}</span> ]`;
    } else {
        // 2. 关闭状态下：移除激活类名，恢复原样，把控制权交回给 CSS hover
        recordLinkEl.classList.remove('compass-active');
        recordLinkEl.innerHTML = `[ <span data-i18n="ui_record">遺構錄</span> | <span data-i18n="site_name_${site.name}">${site.name}</span> ]`;
    }

    // 觸發局部更新以防止文字卡在舊語言
    if (window.currentLang) switchLanguage(window.currentLang);
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

    // ==========================================
    // 🌟 悬停延迟锁定系统 (极度逼近 + 0.5秒确认)
    // ==========================================
    const overlayElement = document.getElementById('compass-overlay');

    if (overlayElement && overlayElement.classList.contains('show') && currentCompassMarker) {

        // 只有在未最终锁定（弹窗未打开）时，才进行距离探测
        if (!currentCompassMarker.isPopupOpen()) {
            const dist = window.compassDistance;
            const radius = window.compassRingRadius || 140;

            // 🌟 极度逼近：要求距离圆心 1% 范围内 (几乎完美重合) 才算对准
            const triggerThreshold = radius * 0.04;

            if (dist !== undefined && dist < triggerThreshold) {

                // 如果已经对准，且还没有开始计时，则启动 0.5 秒的倒计时
                if (!window.compassLockTimer) {
                    window.compassLockTimer = setTimeout(() => {

                        // 0.5秒后，再次确认弹窗是否还没打开
                        if (!currentCompassMarker.isPopupOpen()) {
                            currentCompassMarker.openPopup();
                            lockedMarker = currentCompassMarker;

                            // 🌟 核心修改：不再在这里自动关闭罗盘，让它保留在画面中！
                            // (已删除了原有的 window.hideCompass() 及其关联逻辑)

                            // 触发飞行 (更慢、更平滑)
                            map.flyTo(currentCompassMarker.getLatLng(), 5.5, {
                                animate: true,
                                duration: 2.8,       // 👈 调大数值，让放大速度变慢 (原为 1.2)
                                easeLinearity: 0.1   // 👈 调小该数值，实现平滑开始与平滑结束 (原为 0.25)
                            });
                        }

                        // 动画触发后清除计时器状态
                        window.compassLockTimer = null;

                    }, 500); // 👈 500毫秒 = 0.5秒
                }

            } else {
                // 🌟 核心防抖防误触：如果鼠标不小心滑出了 1% 的范围，
                // 并且计时器正在运行，立刻打断施法，取消倒计时！
                if (window.compassLockTimer) {
                    clearTimeout(window.compassLockTimer);
                    window.compassLockTimer = null;
                }
            }
        }
    } else {
        // 如果罗盘被关闭，或者丢失了目标，也要确保清理干净计时器
        if (window.compassLockTimer) {
            clearTimeout(window.compassLockTimer);
            window.compassLockTimer = null;
        }
    }
    // 持续逐帧渲染
    requestAnimationFrame(animateCompassPhysics);
}

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

window.showCompass = function () {
    const { overlay } = getCompassElements();
    if (!overlay) return;

    // 1. 平滑拉回初始状态 (替代瞬间跳回的 fitBounds)
    if (typeof bounds !== 'undefined') {
        map.flyToBounds(bounds, {
            animate: true,
            duration: 2.5,
            easeLinearity: 0.1
        });
    }

    // 2. 动态判断屏幕方向与位置
    const mainFrame = document.getElementById('main-viewport-frame');
    const compassContainer = document.querySelector('.compass-container');
    if (mainFrame && compassContainer) {
        const frameRect = mainFrame.getBoundingClientRect();

        // 🌟 核心修改：判断是否为竖屏 (宽度小且高度大于宽度)
        const isPortrait = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;

        if (isPortrait) {
            // 竖屏：完全在屏幕正中央生成
            compassX = window.innerWidth / 2;
            compassY = window.innerHeight / 2;
        } else {
            // 横屏/电脑端：保持原有的右下方偏移
            compassX = (frameRect.left + frameRect.width / 2) + 150;
            compassY = (frameRect.top + frameRect.height / 2) + 40;
        }

        compassContainer.style.left = `${compassX}px`;
        compassContainer.style.top = `${compassY}px`;
        compassContainer.style.transform = `translate(-50%, -50%)`;
    }

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

window.hideCompass = function () {
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
    window.compassRingRadius = ringRadius;

    compassTargetInside =
        distanceToTarget < ringRadius;

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
       
    }
});

/* =========================
   fly system
========================= */

function flyToSite(site, index) {
    if (typeof closeDrawer === 'function') {
        closeDrawer();
    }
    activeSiteIndex = index;

    const pos = geoToSVG(site.lat, site.lng);

    markers.forEach(m => m.marker.closePopup());

    // 第一次飞行：拉高视角
    map.flyTo(pos, 3, {
        duration: 4,
        easeLinearity: 0.2
    });

    // 1.5秒后开始第二次飞行：俯冲降落
    setTimeout(() => {
        map.flyTo(pos, 5, {
            duration: 4,
            easeLinearity: 0.2
        });

        // 🌟 核心修复：必须在第二次 flyTo 之后再绑定 moveend！
        // 这样可以避免第一次飞行被打断时产生的“假 moveend”提前触发计时器
        map.once('moveend', () => {

            // 第一步：地图真正到达目标位置，自动弹出 Popup
            markers[index].marker.openPopup();

            // 第二步：等待一秒，自动打开 Drawer
            setTimeout(() => {
                if (window.openDrawerByIndex) window.openDrawerByIndex(index);

                // 第三步：等待一秒，tree 自动展开第一层，显示子文件夹
                setTimeout(() => {
                    const drawerContent = document.getElementById('drawer-content');
                    if (!drawerContent) return;

                    // 【遗构录系列】：展开并显示四大分类子文件夹
                    const wanderRoot = drawerContent.querySelector('.wander-root');
                    if (wanderRoot && wanderRoot.nextElementSibling && wanderRoot.nextElementSibling.style.display !== 'block') {
                        toggleArchiveTree(wanderRoot);
                    }

                    // 【废墟园林系列】：先展开总档案的根节点
                    const faultRoot = drawerContent.querySelector('.fault-root');
                    if (faultRoot && faultRoot.nextElementSibling && faultRoot.nextElementSibling.style.display !== 'block') {
                        toggleArchiveTree(faultRoot);

                        // 第四步：再等待一秒，展开内部的“遗构录”子节点
                        // 这次你将能清晰地看到抽屉拉开 -> 第一层展开 -> 第二层展开 的接力动画过程
                        setTimeout(() => {
                            const recordFolder = drawerContent.querySelector('.archive-record-folder');
                            if (recordFolder && recordFolder.nextElementSibling && recordFolder.nextElementSibling.style.display !== 'block') {
                                toggleArchiveTree(recordFolder);
                            }
                        }, 1500);
                    }

                }, 1500);

            }, 3500);
        });
    }, 3500);

    updateMarkerState();
}
/* =========================
   Marker 透明度随 Zoom 缩放动态变淡
========================= */
function updateMarkerOpacity() {
    const currentZoom = map.getZoom();
    const triggerZoom = 0; // 超过 zoom 3 开始变淡
    const maxZoom = 8;     // 极限 zoom 为 8

    let targetOpacity = 1.0;

    if (currentZoom > triggerZoom) {
        // 线性映射：当 zoom 从 3 放大到 8 时，透明度从 1.0 均匀降至 0.3
        const ratio = (currentZoom - triggerZoom) / (maxZoom - triggerZoom);
        targetOpacity = 1.0 - (ratio * 0.9);
    }

    // 保证极限最低值为 30% (0.3)
    targetOpacity = Math.max(0.1, targetOpacity);

    // 遍历所有地点标记并设置透明度
    markers.forEach(m => {
        if (m && m.marker) {
            m.marker.setOpacity(targetOpacity);
        }
    });
}

// 绑定到现有的 zoom 事件中
map.on('zoom', updateMarkerOpacity);

// 初始化时主动执行一次，确保初始层级渲染正确
updateMarkerOpacity();
/* =========================
   marker state
========================= */
function updateMarkerState() {
    markers.forEach(m => {
        const el = m.marker.getElement();
        const isActive = m.index === activeSiteIndex;

        // 【重要修改】：删除 m.marker.setOpacity(1); 
        // 现已将透明度控制权完全交接给 updateMarkerOpacity 动态函数

        m.marker.setZIndexOffset(isActive ? 1000 : 0);
        if (el) {
            el.classList.toggle('active-marker', isActive);
        }
    });
}
/* =========================
   HUD
========================= */

let coordsRaf = null;

map.on('mousemove', e => {
    if (coordsRaf) return; // 如果上一幀還沒處理完，丟棄這次事件

    coordsRaf = requestAnimationFrame(() => {
        const geo = svgToGeo(e.latlng.lat, e.latlng.lng);
        document.getElementById('coords').innerText = `${formatLat(geo.lat)}   ${formatLng(geo.lng)}`;
        coordsRaf = null; // 處理完畢，開放下一次
    });
});
/* =========================
global drawer close system
========================= */

document.addEventListener('click', (e) => {
    if (typeof isClosingViewer !== 'undefined' && isClosingViewer) return; // 确保 isClosingViewer 已定义

    const archiveDrawer = document.getElementById('archive-drawer');
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
const joyLight = document.getElementById('joystick-light'); // 🌟 新增：获取动态光源 DOM

if (joystick && knob) {
    // 1. 按下摇杆
    joystick.addEventListener('pointerdown', () => {
        joyActive = true;
        // 💡 交互优化：按下并拖拽时，移除光源的动画延迟，让光晕“零延迟”紧紧跟随鼠标
        if (joyLight) {
            joyLight.style.transition = 'opacity 0.2s ease, transform 0s linear';
        }
    });

    // 2. 松开摇杆
    document.addEventListener('pointerup', () => {
        joyActive = false;
        knob.style.transform = `translate(-50%, -50%)`;

        // 🌟 核心：摇杆松开时，光源回中并缓缓熄灭
        if (joyLight) {
            // 恢复过渡动画，实现丝滑的熄灭回弹效果
            joyLight.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            joyLight.style.transform = `translate(0px, 0px)`;
            joyLight.style.opacity = 0;
        }
    });

    // 3. 拖拽摇杆
    document.addEventListener('pointermove', (e) => {
        if (!joyActive) return;

        const rect = joystick.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = e.clientX - cx;
        let dy = e.clientY - cy;
        const max = 32; // 摇杆最大拉动半径
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 限制摇杆不能拖出物理边界
        if (dist > max) {
            dx = (dx / dist) * max;
            dy = (dy / dist) * max;
        }

        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        // 🌟 核心：计算光源的位移与渐变亮度
        if (joyLight) {
            // 亮度映射：距离拉得越远，intensity 值越大 (范围 0 到 1)
            const intensity = dist / max;

            // 视觉位移：让光斑移动幅度比物理摇杆稍微大一点（1.3倍），能产生更强烈的投射感
            const lightDx = dx * 1.3;
            const lightDy = dy * 1.3;

            joyLight.style.transform = `translate(${lightDx}px, ${lightDy}px)`;

            // 亮度增强：略微放大 intensity，让用户只需轻轻一拉就能看到明显的光晕
            joyLight.style.opacity = Math.min(intensity * 1.6, 1);
        }

        // 保持原有的卡片 3D 旋转控制逻辑
        cardRotY += dx * 0.18;
        cardRotX -= dy * 0.18;
        const card = document.getElementById('score-card');
        if (typeof updateCardTransform === 'function') updateCardTransform(card);
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

    function renderStack(siteArray, container, isGarden) {
        const total = siteArray.length;
        const cnNums = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

        siteArray.forEach((site, index) => {
            const docEl = document.createElement('div');
            docEl.className = 'archive-doc';
            // =========== 👇 新增这三行代码 👇 ===========
            // 匹配地点的标签，并绑定给刚生成的 DOM 节点
            const tags = siteTagsMapping[site.name] || "";
            docEl.setAttribute('data-tags', tags);
            docEl.setAttribute('data-tag', tags); // 双重绑定，兼容你底部脚本的不同写法
            // =========== 👆 新增结束 👆 ===========

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

            // 1. 座標計算 (補回缺失的 latStr 與 lngStr)
            const latStr = site.lat >= 0 ? formatLat(-site.lat) : formatLat(Math.abs(site.lat));
            const lngStr = formatLng(site.lng);

            // 2. 動態標題與翻譯參數
            const seq = cnNums[index] || (index + 1);
            const typeKey = isGarden ? 'ui_garden' : 'ui_record';
            const typeText = isGarden ? '廢墟園林' : '遺構錄';
            const creatorKey = isGarden ? 'ui_creator' : 'ui_recorder';
            const creatorText = isGarden ? '創作者: 羅清源' : '記錄者: 羅清源';
            // 🌟 统一所有卡片的按钮状态为自动导航
            const navKey = 'ui_auto_nav';
            const navText = '自動導航 ⌖';

            // 👇 將其${seq} 包裝進帶有 data-i18n 的 span 中，動態綁定 key 為 ui_seq_1, ui_seq_2...
            const titleTextHtml = isGarden
                ? `<span data-i18n="ui_garden">廢墟園林</span> · <span data-i18n="ui_seq_${index + 1}">其${seq}</span> | <span data-i18n="site_name_${site.name}">${site.name}</span>`
                : `<span data-i18n="ui_record">遺構錄</span> | <span data-i18n="site_name_${site.name}">${site.name}</span>`;

            // 3. 組裝互動區塊與最終 HTML
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

            // 4. 点击抽取/收回交互（加入对 doc-title 的拦截，避免点标题时只做卡片抽拉）
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

            // 5. 获取按钮与标题元素
            const coordBtn = docEl.querySelector('.doc-coord-btn');
            const titleEl = docEl.querySelector('.doc-title');

            if (coordBtn) {
                coordBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const originalIndex = sites.indexOf(site);
                    // 🌟 无论系列，全部改为一致的自动导航 (flyToSite)
                    if (typeof flyToSite === 'function') flyToSite(site, originalIndex);
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
    // 確保動態生成的 DOM 在初次載入時能被正確翻譯
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

    // =========================
    // 1. 抽屉拉起与收回逻辑
    // =========================
    if (drawerTrigger && bottomDrawer) {
        drawerTrigger.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            bottomDrawer.classList.toggle('open');
        });
    }

    // 点击外部空间收回抽屉
    document.addEventListener('click', (e) => {
        if (bottomDrawer && bottomDrawer.classList.contains('open')) {
            // 如果点击的区域不在抽屉内部，则关闭抽屉
            if (!bottomDrawer.contains(e.target)) {
                bottomDrawer.classList.remove('open');
            }
        }
    });

    // =========================
    // 2. 索引系统关联卡片逻辑
    // =========================
    const indexTags = document.querySelectorAll('.index-tag');
    const archiveDocs = document.querySelectorAll('.archive-doc');

    indexTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止点击标签时触发其他关闭逻辑

            const isActive = tag.classList.contains('active');
            const keyword = tag.getAttribute('data-tags');

            
        });
    });
});
/* =========================
   Archive Index Filtering System (严格多选/动态候选筛选)
========================= */
document.addEventListener("DOMContentLoaded", () => {
    // 1. 获取所有的索引标签和分类标签
    const indexTags = document.querySelectorAll('.index-tag, .index-category');

    // 2. 监听每个标签的点击事件
    indexTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止点击标签时触发全局关闭逻辑

            // 如果该标签处于禁用状态（不在候选池中），直接拦截点击
            if (tag.classList.contains('disabled')) {
                return;
            }

            // 切换当前标签的选中状态
            tag.classList.toggle('active');

            // 触发多选联动及候选池刷新
            updateArchiveDocs();
        });
    });

    // 3. 核心筛选与候选池更新函数
    function updateArchiveDocs() {
        // A. 收集当前所有被选中的 active 标签
        const activeTags = Array.from(document.querySelectorAll('.index-tag.active, .index-category.active'))
            .map(tag => (tag.getAttribute('data-tag') || tag.getAttribute('data-tags') || '').trim())
            .filter(Boolean);

        // B. 获取页面上的所有卡片和地图字符节点，包含新加的手机侧栏和罗盘滚动列表
        const archiveDocs = document.querySelectorAll('.archive-doc, .site-character, .mobile-list-item, .compass-wheel-item');

        // 用于收集所有匹配成功的地点所包含的标签（候选特征池）
        const availableTags = new Set();

        // C. 遍历所有地点卡片进行交集匹配
        archiveDocs.forEach(doc => {
            const docTagsAttr = doc.getAttribute('data-tag') || doc.getAttribute('data-tags') || "";
            const docTags = docTagsAttr.split(',').map(t => t.trim()).filter(Boolean);

            if (activeTags.length === 0) {
                // 如果未选中任何标签：显示所有卡片，所有卡片的标签都是候选标签
                doc.classList.remove('matched-tag');
                doc.classList.remove('active-dot');
                doc.style.display = 'block';

                docTags.forEach(t => availableTags.add(t));
            } else {
                // 多选匹配核心：卡片的标签必须包含【所有】选中的 activeTags
                const isMatch = activeTags.every(activeTag => docTags.includes(activeTag));

                if (isMatch) {
                    doc.classList.add('matched-tag');
                    doc.classList.add('active-dot');
                    doc.style.display = 'block';

                    // 将匹配成功的地点拥有的所有标签加入候选池
                    docTags.forEach(t => availableTags.add(t));
                } else {
                    doc.classList.remove('matched-tag');
                    doc.classList.remove('active-dot');
             
                }
            }
        });

        // D. 根据当前候选池 availableTags 刷新每一个 index-tag 的可用状态
        indexTags.forEach(tag => {
            const tagVal = (tag.getAttribute('data-tag') || tag.getAttribute('data-tags') || '').trim();

            if (activeTags.length === 0) {
                // 没有选中任何标签时，解除所有标签的禁用状态
                tag.classList.remove('disabled');
            } else {
                // 如果该标签不在当前候选池中，则将其禁用并变灰 (#777)
                if (!availableTags.has(tagVal)) {
                    tag.classList.add('disabled');
                    tag.classList.remove('active'); // 清除可能残留的选中状态
                } else {
                    tag.classList.remove('disabled');
                }
            }
        });
        /* ===================================================
           新增：只要有标签被激活，.index-three-columns 和 .index-top-title 一起变灰
           =================================================== */
        const layoutElements = document.querySelectorAll('.index-three-columns, .index-conclusion, .index-top-title');

        if (activeTags.length === 0) {
            // 没有选中标签，恢复正常状态
            layoutElements.forEach(el => el.classList.remove('disabled'));
        } else {
            // 有选中标签，添加 disabled 状态
            layoutElements.forEach(el => el.classList.add('disabled'));
        }

        /* ===================================================
           E. 新增：动态更新底部标签文本，显示筛选结果的数量（圆点）
           =================================================== */
        const ruinTrigger = document.getElementById('bottom-trigger-ruin');
        const recordTrigger = document.getElementById('bottom-trigger-record');

        if (ruinTrigger && recordTrigger) {
            // 获取专门用来显示圆点的 span
            const ruinDots = ruinTrigger.querySelector('.filter-dots');
            const recordDots = recordTrigger.querySelector('.filter-dots');

            // 如果没有任何选中的标签，清空圆点
            if (activeTags.length === 0) {
                if (ruinDots) ruinDots.textContent = "";
                if (recordDots) recordDots.textContent = "";
            } else {
                // 1. 初始化计数器
                let gardenCount = 0;
                let recordCount = 0;

                // 2. 遍历 sites 数组，进行交集匹配并统计各 type 的数量
                sites.forEach(site => {
                    const siteTags = (siteTagsMapping[site.name] || "").split(',').map(t => t.trim()).filter(Boolean);
                    const isMatch = activeTags.every(activeTag => siteTags.includes(activeTag));

                    if (isMatch) {
                        if (site.type === 'garden') gardenCount++;
                        if (site.type === 'record') recordCount++;
                    }
                });

                // 3. 生成圆点字符串
                const gardenDotsStr = Array(gardenCount).fill("•").join(" ");
                const recordDotsStr = Array(recordCount).fill("•").join(" ");

                // 4. 精准更新圆点容器（绝不触碰带有 data-i18n 的文字容器）
                if (ruinDots) {
                    ruinDots.textContent = gardenCount > 0 ? gardenDotsStr + " " : "";
                }
                if (recordDots) {
                    recordDots.textContent = recordCount > 0 ? " " + recordDotsStr : "";
                }

                // 注意：这里删除了原先重新触发 switchLanguage 的代码
                // 因为文本节点从未被破坏，不需要在每次点击筛选时重复触发打字机翻译动画。
            }
        }
        
    } // <-- 这是原有的 updateArchiveDocs 函数的结束大括号
}); // <-- 这是原有 DOMContentLoaded 事件的结束大括号
document.addEventListener("DOMContentLoaded", () => {
    const frame = document.getElementById('main-viewport-frame');
    const handleShape = document.querySelector('#index-drawer-handle .frosted-shape');

    if (!frame || !handleShape) return;

    // 更新梯形上边两点的函数
    const updateTrapezoidHandle = () => {
        // 获取目标元素的屏幕坐标位置
        const rect = frame.getBoundingClientRect();

        // rect.left 是相框左下角的 X 坐标
        // rect.right 是相框右下角的 X 坐标
        handleShape.style.setProperty('--frame-left', `${rect.left}px`);
        handleShape.style.setProperty('--frame-right', `${rect.right}px`);
    };

    // 1. 初始执行一次
    updateTrapezoidHandle();

    // 2. 监听窗口大小改变，确保缩放屏幕时梯形始终对齐
    window.addEventListener('resize', updateTrapezoidHandle);

    // 3. （可选）如果你相框的宽度/位置会通过动画动态改变，建议加上 ResizeObserver
    const observer = new ResizeObserver(() => {
        updateTrapezoidHandle();
    });
    observer.observe(frame);
});
// 执行全站翻译
function switchLanguage(targetLang) {
    const vault = languageVault[targetLang];
    if (!vault) return;

    // 找到所有带有 data-i18n 标签的元素
    const elementsToTranslate = document.querySelectorAll('[data-i18n]');

    elementsToTranslate.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const targetText = vault[key];

        if (targetText && el.innerText !== targetText) {
            // 给不同的句子加上微小的随机延迟，模拟义体系统的异步处理
            const randomDelay = Math.random() * 200;

            setTimeout(() => {
                cyberDecodeTranslate(el, targetText, 1000);
            }, randomDelay);
        }
    });
}
/* =========================
   標題語言滾輪系統 (Cipher Wheel)
========================= */
document.addEventListener('DOMContentLoaded', () => {
    const wheelContainer = document.getElementById('title-language-wheel');
    const wheelTrack = document.getElementById('wheel-track');

    if (!wheelContainer || !wheelTrack) return;

    const items = wheelTrack.querySelectorAll('.wheel-item');
    const dots = wheelContainer.querySelectorAll('.wheel-dot');

    let currentIndex = 0;
    const totalLangs = items.length;
    const itemHeight = 30; // 必須與 CSS 中的 height 一致

    // 點擊標題區域，觸發滾動與翻譯
    wheelContainer.addEventListener('click', (e) => {
        e.stopPropagation();

        // 索引加 1，如果到底了就回到 0 (zh -> en -> ja -> zh)
        currentIndex = (currentIndex + 1) % totalLangs;

        // 1. 物理滾動軌道
        wheelTrack.style.transform = `translateY(-${currentIndex * itemHeight}px)`;

        // 2. 更新視覺焦點狀態
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

        // 3. 讀取對應的語言代碼並觸發全站翻譯
        const targetLang = items[currentIndex].getAttribute('data-lang');

        if (typeof switchLanguage === 'function') {
            // 你原本的 switchLanguage 已經內建了 cyberDecodeTranslate 的駭客解碼特效
            // 這裡觸發會讓全站文字產生非常帥氣的同步解碼感
            switchLanguage(targetLang);
        }
    });

    // 支援滑鼠滾輪切換 (可選，增強機械儀表感)
    wheelContainer.addEventListener('wheel', (e) => {
        e.preventDefault(); // 防止頁面跟著滾

        // 防抖動，避免一次滾太多
        if (wheelContainer.isScrolling) return;
        wheelContainer.isScrolling = true;

        if (e.deltaY > 0) {
            currentIndex = (currentIndex + 1) % totalLangs; // 往下滾
        } else {
            currentIndex = (currentIndex - 1 + totalLangs) % totalLangs; // 往上滾
        }

        wheelTrack.style.transform = `translateY(-${currentIndex * itemHeight}px)`;

        items.forEach((item, idx) => item.classList.toggle('active', idx === currentIndex));
        dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentIndex));

        const targetLang = items[currentIndex].getAttribute('data-lang');
        if (typeof switchLanguage === 'function') switchLanguage(targetLang);

        setTimeout(() => { wheelContainer.isScrolling = false; }, 300);
    });
});
/* ===================================================
   🧭 罗盘拖拽引擎 & 边缘加速视差移动
   =================================================== */
let isDraggingCompass = false;
let edgePanRAF = null;
let compassX = window.innerWidth / 2;
let compassY = window.innerHeight / 2;

document.addEventListener('DOMContentLoaded', () => {
    const compassContainer = document.querySelector('.compass-container');
    const compassHandle = document.getElementById('compass-handle'); // 👈 新增获取把手

    if (!compassContainer || !compassHandle) return; // 👈 确保两者都存在

    // 1. 按下把手 (把监听器绑在 compassHandle 上)
    compassHandle.addEventListener('pointerdown', (e) => {
        isDraggingCompass = true;
        L.DomEvent.stopPropagation(e); // 阻止事件穿透到地图，避免拖拽罗盘时地图跟着乱跑
    });

    // 2. 拖拽逻辑保持不变 ...
    window.addEventListener('pointermove', (e) => {
        if (!isDraggingCompass) return;

        const halfW = compassContainer.offsetWidth / 2;
        const halfH = compassContainer.offsetHeight / 2;

        // 🌟 核心修改 1：解除原先 230/168/40/60 的方形空间限制，拓宽至全屏幕自由拖拽！
        // 保留 15px 的安全边缘防止拖出屏幕外拿不回来
        compassX = Math.max(15 + halfW, Math.min(e.clientX, window.innerWidth - 15 - halfW));
        compassY = Math.max(15 + halfH, Math.min(e.clientY, window.innerHeight - 15 - halfH));

        compassContainer.style.left = `${compassX}px`;
        compassContainer.style.top = `${compassY}px`;
        compassContainer.style.transform = `translate(-50%, -50%)`;

        window.updateCompassDirection();

        // 侦测边缘并移动地图
        handleEdgePanning(e.clientX, e.clientY);
    });

    // 3. 松开罗盘
    window.addEventListener('pointerup', () => {
        if (isDraggingCompass) {
            isDraggingCompass = false;
            cancelAnimationFrame(edgePanRAF);
            edgePanRAF = null;
        }
    });

    // 4. 边缘加速移动逻辑
    function handleEdgePanning(pointerX, pointerY) {
        cancelAnimationFrame(edgePanRAF);
        const edgeThreshold = 140; // 🌟 距离全屏幕边缘 140px 开始触发地图移动
        const maxSpeed = 18;       // 最大移动速度

        let panX = 0;
        let panY = 0;

        // 🌟 核心修改 2：改为基于全屏 (window) 进行边缘判断
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

        // 越靠近边缘越快，持续驱动地图移动
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
/* ========================================================
   右上角全局罗盘触发器及列表系统 (无级滚轮 + 自动对焦版)
   ======================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const compassModule = document.getElementById('global-compass-module');
    const compassWheel = document.getElementById('compass-site-wheel');
    const compassBtn = document.getElementById('global-compass-btn');

    if (!compassModule || !compassWheel || !compassBtn) return;

    compassWheel.innerHTML = ''; // 清空可能存在的内容

    // 1. 生成无限循环的滚轮内容 (生成 5 组，保证有足够的空间滑动)
    const loopCount = 5;

    for (let i = 0; i < loopCount; i++) {
        sites.forEach((site, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'compass-wheel-item';
            const tags = siteTagsMapping[site.name] || "";
            itemDiv.setAttribute('data-tags', tags);
            itemDiv.setAttribute('data-tag', tags);
            itemDiv.setAttribute('data-i18n', `site_name_${site.name}`);
            itemDiv.dataset.realIndex = index; // 记录真实的索引 (0 ~ sites.length-1)
            itemDiv.innerText = site.name;

            // 点击时平滑滚动到该项 (触发原生 scroll 动画)
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

    // 初始化滚动位置与无缝跳转逻辑
    requestAnimationFrame(() => {
        const items = compassWheel.querySelectorAll('.compass-wheel-item');
        if (items.length > 0) {
            const itemHeight = 18; // 与 CSS 中的 height: 38px 保持绝对一致
            const singleBlockHeight = itemHeight * sites.length;

            // 初始状态：将滚动条定位到最中间的一组 (第 3 组) 的开头
            compassWheel.scrollTop = singleBlockHeight * 2;

            // 监听滚动实现无缝循环跳转
            compassWheel.addEventListener('scroll', () => {
                // 如果滚到了顶部缓冲区（进入了第 1 组）
                if (compassWheel.scrollTop < singleBlockHeight) {
                    compassWheel.scrollTop += singleBlockHeight * 2; // 瞬间切回第 3 组
                }
                // 如果滚到了底部缓冲区（进入了第 5 组）
                else if (compassWheel.scrollTop >= singleBlockHeight * 3) {
                    compassWheel.scrollTop -= singleBlockHeight * 2; // 瞬间切回第 3 组
                }
            });
        }
    });

    // 2. ⭐ 核心：滚轮停止时，自动侦测中心元素并锁定目标
    let scrollTimeout;
    let lastSelectedIndex = -1;

    compassWheel.addEventListener('scroll', () => {
        // 每次滚动都重置定时器
        clearTimeout(scrollTimeout);

        // 当滚动停止 150ms 后触发计算
        scrollTimeout = setTimeout(() => {
            // 寻找最靠近中心的元素
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

                // 如果发现选中的是新的地名，则触发罗盘更新
                if (realIndex !== lastSelectedIndex) {
                    lastSelectedIndex = realIndex;

                    // 更新 UI：移除所有 active，给所有同源克隆体加上 active，使其全部高亮
                    compassWheel.querySelectorAll('.compass-wheel-item').forEach(el => el.classList.remove('active'));
                    compassWheel.querySelectorAll(`.compass-wheel-item[data-real-index="${realIndex}"]`)
                        .forEach(el => el.classList.add('active'));

                    // 自动向罗盘传递选中目标
                    const targetMarkerData = markers[realIndex];
                    if (targetMarkerData && targetMarkerData.marker) {
                        if (window.setCompassTarget) window.setCompassTarget(targetMarkerData.marker);
                    }
                }
            }
        }, 150); // 150ms 的防抖时间
    });

    // 3. 拉开扩展面板，打开 compass；面板合上，关闭 compass
    compassBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = compassModule.classList.toggle('expanded');

        if (isExpanded) {
            if (window.showCompass) window.showCompass();
            // 每次打开时主动触发一次滚动对准，确保首次打开就能读取状态
            compassWheel.dispatchEvent(new Event('scroll'));
        } else {
            if (window.hideCompass) window.hideCompass();
        }
    });

    // 4. 点击外部空白区域自动收起滚轮与罗盘
    
});
/* ========================================================
   🌟 移动端侧边栏生成与交互逻辑 (Mobile Drawers)
   ======================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. 生成手机端侧边栏的文字列表
    function buildMobileLists() {
        const leftList = document.getElementById('mobile-record-list');
        const rightList = document.getElementById('mobile-garden-list');
        if (!leftList || !rightList) return;

        leftList.innerHTML = '';
        rightList.innerHTML = '';

        const gardenSites = sites.filter(site => site.type === 'garden');
        const recordSites = sites.filter(site => site.type !== 'garden');

        const renderList = (siteArray, container, isGarden) => {
            // ⭐ 新增：上方标题注入
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

                // ⭐ 新增：提取地点的 tag 并双重绑定属性，打通与索引的联动
                const tags = siteTagsMapping[site.name] || "";
                item.setAttribute('data-tags', tags);
                item.setAttribute('data-tag', tags);

                // 绑定多语言 data-i18n
                item.innerHTML = `<span data-i18n="site_name_${site.name}">${site.name}</span>`;

                // 点击文字飞向目标地点
                item.onclick = (e) => {
                    e.stopPropagation();
                    const originalIndex = sites.indexOf(site);
                    if (typeof flyToSite === 'function') flyToSite(site, originalIndex);

                    // 点击后自动收起侧边栏
                    document.getElementById('mobile-left-drawer').classList.remove('open');
                    document.getElementById('mobile-right-drawer').classList.remove('open');
                };
                container.appendChild(item);
            });
        };

        // ⭐ 修改：传入 isGarden 参数区分左右和文字对齐
        renderList(recordSites, leftList, false);
        renderList(gardenSites, rightList, true);
    }

    // 延迟一点时间等 sites 数据加载完毕后构建
    setTimeout(buildMobileLists, 350);

    // 2. 绑定底部“三条横线”按钮的展开与收起
    const btnLeft = document.getElementById('btn-left-menu');
    const btnRight = document.getElementById('btn-right-menu');
    const drawerLeft = document.getElementById('mobile-left-drawer');
    const drawerRight = document.getElementById('mobile-right-drawer');

    if (btnLeft && drawerLeft) {
        btnLeft.addEventListener('click', (e) => {
            e.stopPropagation();
            drawerLeft.classList.toggle('open');
            if (drawerRight) drawerRight.classList.remove('open'); // 关掉另一侧
        });
    }

    if (btnRight && drawerRight) {
        btnRight.addEventListener('click', (e) => {
            e.stopPropagation();
            drawerRight.classList.toggle('open');
            if (drawerLeft) drawerLeft.classList.remove('open'); // 关掉另一侧
        });
    }

    // 3. 点击屏幕其他区域自动收起侧边栏
    document.addEventListener('click', (e) => {
        if (drawerLeft && drawerLeft.classList.contains('open') && !drawerLeft.contains(e.target)) {
            drawerLeft.classList.remove('open');
        }
        if (drawerRight && drawerRight.classList.contains('open') && !drawerRight.contains(e.target)) {
            drawerRight.classList.remove('open');
        }
    });
});