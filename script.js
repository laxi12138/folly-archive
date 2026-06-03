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
let isClosingViewer = false;
let currentVideo = null;
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
  if (scoreHUD) {
    scoreHUD.style.display = 'none';
    scoreHUD.classList.remove('open');
  }
});
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
  maxZoom: 3,
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
    'blur(0.39px) contrast(1.8) brightness(1.02) sepia(0.25)';
});

map.fitBounds(bounds);
map.setMaxBounds(null);

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

'plague-scan': {
  title: '圖形記譜 | 心臟殘響',
  type: 'graphic score',
  mode: 'card',
  front: 'attachments/effluent-sedimentation/score-1.png',
  back: 'attachments/effluent-sedimentation/score-1b.png',
  desc: '死水沉積圖形記譜。'
},

  'plague-audio': {
    title: '廢墟樂器 | 廢墟盆栽心臟',
    type: 'instrument demonstration',
    mode: 'video',
    src: 'attachments/effluent-sedimentation/instrument-1.mp4',
    desc: '殘片心臟敲擊聲學實驗。'
  },

  'plague-film': {
    title: '廢墟園林·其一 | 沉墟死水心臟',
    type: 'ruin garden footage',
    mode: 'video',
    src: 'attachments/effluent-sedimentation/folly-1.mp4',
    desc: '廢墟內核坍縮回響演奏。'
  },

  'north-score': {
  title: '圖形記譜 | 殘影星圖',
  type: 'graphic score',
  mode: 'card',
  front: 'attachments/fallen-wing-field/score-3.png',
  back: 'attachments/fallen-wing-field/score-3b.png',
  desc: '自轉與星象圖形記譜。'
},

'north-instrument': {
  title: '廢墟樂器 | 空轉陀螺儀',
  type: 'instrument demonstration',
  mode: 'video',
  src: 'attachments/fallen-wing-field/instrument-3.mp4',
  desc: '陀芯失衡聲學實驗。'
},

'north-film': {
  title: '廢墟園林·其三 | 墜翼沉鏡天軸',
  type: 'ruin garden footage',
  mode: 'video',
  src: 'attachments/fallen-wing-field/folly-3.mp4',
  desc: '定轴性空间混沌演奏。'
    },

/* =========================
   mountain signal ruin
========================= */

'signal-hall': {
    title: '視覺標本',
        mode: 'image',
            src: 'attachments/mountain-signal/35mm-scan-1.jpg',
                desc: ''
},

'signal-corridor': {
    title: '視覺標本',
        mode: 'image',
            src: 'attachments/mountain-signal/pano-scan-1.jpg',
                desc: ''
},


'signal-hum': {
    title: '聲音標本',
        mode: 'audio',
            src: 'attachments/mountain-signal/hum.wav',
                desc: ''
},

'signal-ticket': {
    title: '物件標本',
        mode: 'image',
            src: 'attachments/mountain-signal/ticket.jpg',
                desc: ''
},

'signal-note': {
    title: '註釋卡',
    mode: 'text',
    src: 'attachments/mountain-signal/note.txt',
    desc: ''
}
};

/* =========================
   attachment count system
========================= */

function getSignalCounts() {

  const counts = {
    visual: 0,
    audio: 0,
    object: 0,
    note: 0
  };

  Object.values(attachmentRegistry).forEach(item => {

    // 只统计 mountain-signal
    const path =
      item.src ||
      item.front ||
      '';

    if (!path.includes('mountain-signal'))
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

  isClosingViewer = false;

}, 220);
}


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
    el.parentElement.querySelector('.tree-collapse');

  const toggle =
    el.querySelector('.tree-toggle');

  if (!collapse || !toggle) return;

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

    const isNorth =
        site.name === "北風島墜翼原";

    const isSignal =
        site.name === "山地信號廢墟";

let treeHTML = '';

if (isRadio) {

  treeHTML = `
  <div class="archive-tree">

  <div
  class="fault-node fault-root tree-folder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-toggle">[+]</span>
  廢墟劇場檔案

</div>

<div class="tree-collapse">

 <div class="fault-line line-1">
    ╲
  </div>

  <div class="fault-line line-2">
    ╲
  </div>

<div class="fault-node fault-branch-a is-text">
  焦土以太鐵塔
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

[廢墟終曲]

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
    廢墟劇場檔案

  </div>

  <div class="tree-collapse">

    <div class="fault-line line-1">
      ╲
    </div>

    <div class="fault-line line-2">
      ╲
    </div>

    <div class="fault-node fault-branch-a is-text">
      瘟豬壩沉墟
    </div>

    <div class="fault-line-b">
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

      [廢墟終曲]

    </div>

  </div>

</div>

`;

}
else if (isNorth) {

  treeHTML = `

<div class="archive-tree">

  <div
    class="fault-node fault-root tree-folder"
    onclick="toggleArchiveTree(this)">

    <span class="tree-toggle">[+]</span>
    廢墟劇場檔案

  </div>

  <div class="tree-collapse">

    <div class="fault-line line-1">
      ╲
    </div>

    <div class="fault-line line-2">
      ╲
    </div>

    <div class="fault-node fault-branch-a is-text">
      北風島墜翼原
    </div>

    <div class="fault-line-b">
      ╲
    </div>

    <div
      class="tree-file crack-a"
      onclick="openAttachmentViewer('north-score')">

      [圖形記譜]

    </div>

    <div class="fault-line-c">
      ╲
    </div>

    <div
      class="tree-file crack-b"
      onclick="openAttachmentViewer('north-instrument')">

      [樂器演示]

    </div>

    <div class="fault-line-d">
      ╱
    </div>

    <div
      class="tree-file crack-c"
      onclick="openAttachmentViewer('north-film')">

      [廢墟終曲]

    </div>

  </div>

</div>

`;
}
else if (isSignal) {
  const counts = getSignalCounts();

    treeHTML = `

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
      onclick="toggleFolder('signal-visual')">

      <span class="tree-line">├──</span>

      <span id="signal-visual-icon">[+]</span>

        視覺標本 (${counts.visual})

    </div>

    <div
      id="signal-visual"
      class="tree-children">

      <div
        class="tree-file"
        onclick="openAttachmentViewer('signal-hall')">

        ├── 35mm-scan-1.jpg

      </div>

      <div
        class="tree-file"
        onclick="openAttachmentViewer('signal-corridor')">

        └── pano-scan-1.jpg

      </div>

    </div>

    <!-- 聲音 -->

    <div
      class="tree-branch tree-folder"
      onclick="toggleFolder('signal-audio')">

      <span class="tree-line">├──</span>

      <span id="signal-audio-icon">[+]</span>

      聲音標本 (${counts.audio})

    </div>

    <div
      id="signal-audio"
      class="tree-children">



      <div
        class="tree-file"
        onclick="openAttachmentViewer('signal-hum')">

        └── hum.wav

      </div> 

    </div>

    <!-- 物件 -->

    <div
      class="tree-branch tree-folder"
      onclick="toggleFolder('signal-object')">

      <span class="tree-line">├──</span>

      <span id="signal-object-icon">[+]</span>

      物件標本 (${counts.object})

    </div>

    <div
      id="signal-object"
      class="tree-children">

      <div
        class="tree-file"
        onclick="openAttachmentViewer('signal-ticket')">

        └── ticket.jpg

      </div>

    </div>

    <!-- 註釋 -->

    <div
      class="tree-branch tree-folder"
      onclick="toggleFolder('signal-note')">

      <span class="tree-line">└──</span>

      <span id="signal-note-icon">[+]</span>

      註釋卡 (${counts.note})

    </div>

    <div
      id="signal-note"
      class="tree-children">

      <div
        class="tree-file"
        onclick="openAttachmentViewer('signal-note')">

        └── note.txt

      </div>

    </div>

  </div>

</div>

`;
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
  <div class="drawer-section title">
    <div class="drawer-site-title">
      ${site.name}
    </div>
  </div>

  <div class="drawer-section desc">
    <div class="drawer-description">
      ${site.desc}
    </div>
  </div>

  <div class="drawer-section tree">
    ${treeHTML}
  </div>
`;
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

    updateCardTransform(card);
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

  updateCardTransform(card);
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
const chapterToggle =
  document.getElementById('chapter-toggle');

if (chapterToggle) {
  chapterToggle.style.display = 'none';
}
  const viewer =
    document.querySelector('.attachment-viewer');

  const scoreImage =
    document.getElementById('score-image');

  const scoreHUD =
    document.getElementById('score-hud');

  const imageHUD =
    document.querySelector('.attachment-hud');

  const videoUI =
    document.getElementById('video-ui');

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

  // =========================
  // IMAGE MODE
  // =========================

    if (
        type === 'image' ||
        type === 'card' ||
        type === 'audio' ||
        type === 'text'
    ) {

    viewer.classList.add('mode-image');

    // 只有 image 开 image HUD
    if (imageHUD) {
      imageHUD.style.display = 'flex';
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

  scoreImage.src =
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

  scoreImage.src =
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
  const container = document.querySelector('#video-ui .video-chapters');
  if (!container) return;

  container.innerHTML = '';

  chapterData[key].forEach(ch => {
    const div = document.createElement('div');
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
}
/* =========================
   geo ↔ svg
========================= */

function geoToSVG(lat, lng) {

  let x =
    ((lng + 180) / 360 - 0.5)
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

  return {
    lat: 90 - y * 180,
    lng: x * 360 - 180
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
        name: "電臺路焦土",
        desc: "短波天線與玻璃金屬製品廠遺址共同構成電磁干擾場域。看似寂靜的荒土之中，電磁噪聲仍在高速撕裂空氣，使此地淪為無法再開發的技術焦土。",
        lat: 31.225833,
        lng: 121.618333,
        archiveDate: "2026.01",

        type: "garden"
    },

    {
        name: "瘟豬壩沉墟",
        desc: "溶洞、低窪斷層與舊地基共同圍合出長期積水的沉墟。污水、地下水與裂隙彼此滲透，廢墟逐漸壞死為一片靜止黑水，如同建築無法結痂的傷口。",
        lat: 30.454417,
        lng: 104.047667,
        archiveDate: "2025.05",

        type: "garden"
    },

    {
        name: "北風島墜翼原",
        desc: "舊飛行場跑道與停機坪被撕裂，大量混凝土碎塊散落於原地，裂縫積蓄雨水，形成散布於荒原之間的鏡狀水面。當天空映入其間，轉化為一處倒映星辰的觀測場域。",
        lat: 41.860278,
        lng: -87.606111,
        archiveDate: "2023.08",

        type: "garden"
    },

    {
        name: "山地信號廢墟",
        desc: "遊戲廳變成錯誤通信塔，一種一無所有中得到無用之物的絕望。",
        lat: 41.72871,
        lng: 110.51296,
        archiveDate: "2024.12",

         type: "record"
    }

];

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

/* =========================
   markers
========================= */

sites.forEach((site, index) => {

  const pos =
    geoToSVG(site.lat, site.lng);

  const marker =
    L.marker(pos, {
        icon: createIcon(site.type)
    }).addTo(map);

  marker.bindPopup(`

    <div class="archive-popup">

      <div class="archive-content">

        <div class="archive-name">
          ${site.name}
        </div>

        <div class="archive-coords">

  ${site.lat >= 0
    ? formatLat(-site.lat)
    : formatLat(Math.abs(site.lat))}

  &nbsp;&nbsp;

  ${formatLng(site.lng)}

</div>

        <div class="archive-date">
          ${site.archiveDate}
        </div>

<div
  class="archive-drawer-link"
  onclick="window.openDrawerByIndex(${index}, this)">

  <span class="label">
    ${site.type === "garden"
          ? "廢墟劇場"
          : "遺構誌"}
  </span>

</div>

      </div>

    </div>

  `, {

    closeButton: false,

    autoClose: false,

    className: 'map-archive-popup',

    offset: [26, -26]

  });

  markers.push({
    site,
    marker,
    index
  });

});

/* =========================
   fly system
========================= */

function flyToSite(site, index) {

  activeSiteIndex = index;

  const pos =
    geoToSVG(site.lat, site.lng);

  markers.forEach(m =>
    m.marker.closePopup()
  );

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

    markers[index]
      .marker
      .openPopup();

  });

  updateMarkerState();
}

/* =========================
   marker state
========================= */

function updateMarkerState() {

  markers.forEach(m => {

    const el =
      m.marker.getElement();

    const isActive =
      m.index === activeSiteIndex;

    m.marker.setOpacity(
      isActive ? 1 : 0.5
    );

    m.marker.setZIndexOffset(
      isActive ? 1000 : 0
    );

    if (el) {

      el.classList.toggle(
        'active-marker',
        isActive
      );

    }

  });

}

/* =========================
   ui
========================= */

const ui =
  document.createElement('div');

ui.className = 'archive-ui';

document.body.appendChild(ui);

function createLink(label, site, index) {

  const el =
    document.createElement('div');

  el.className = 'archive-link';

  el.innerHTML = `
    <span class="label">
      ${label}
    </span>
  `;

  el.onclick = () =>
    flyToSite(site, index);

  ui.appendChild(el);
}

createLink(
  "廢墟園林 · 其一 | 沉墟死水心臟",
  sites[1],
  1
);

createLink(
  "廢墟園林 · 其二 | 焦土以太鐵塔",
  sites[0],
  0
);

createLink(
  "廢墟園林 · 其三 | 北風島墜翼原",
  sites[2],
  2
);


/* =========================
   HUD
========================= */

map.on('mousemove', e => {

  const geo =
    svgToGeo(
      e.latlng.lat,
      e.latlng.lng
    );

  document.getElementById('coords').innerText =

    `${formatLat(geo.lat)}   ${formatLng(geo.lng)}`;

});
/* =========================
   global drawer close system
========================= */

document.addEventListener('click', (e) => {

  if (isClosingViewer) return;

  const archiveDrawer =
    document.getElementById('archive-drawer');

  const introDrawer =
    document.getElementById('intro-drawer');

  const viewer =
    document.querySelector('.attachment-viewer');

  // ====================================
  // attachment viewer 开着时不处理
  // ====================================

  if (
    viewer &&
    viewer.classList.contains('open')
  ) return;

  // ====================================
  // ARCHIVE DRAWER
  // ====================================

  if (
    archiveDrawer &&
    archiveDrawer.classList.contains('open')
  ) {

    const clickedInsideArchiveDrawer =
      e.target.closest('#archive-drawer');

    const clickedArchiveTrigger =
      e.target.closest(
        '.archive-drawer-link'
      );

    // 点击 drawer 内部
    if (clickedInsideArchiveDrawer) {
      return;
    }

    // 点击打开 drawer 的按钮
    if (clickedArchiveTrigger) {
      return;
    }

    // 其他任何地方 → 关闭
    closeDrawer();
  }

  // ====================================
  // INTRO DRAWER
  // ====================================

  if (
    introDrawer &&
    introDrawer.classList.contains('open')
  ) {

    const clickedInsideIntro =
      e.target.closest('#intro-drawer');

    const clickedTitle =
      e.target.closest('#main-title');

    // 点击 intro drawer 内部
    if (clickedInsideIntro) {
      return;
    }

    // 点击标题自身
    if (clickedTitle) {
      return;
    }

    // 外部关闭
    introDrawer.classList.remove('open');

titleDismissed = true;

mainTitle?.classList.add('hidden');

mainTitle.style.pointerEvents = 'none';
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
  const transform =
    `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;

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

const joystick =
  document.getElementById('joystick');

const knob =
  document.getElementById('joystick-knob');

let joyActive = false;

if (joystick && knob) {

  joystick.addEventListener('pointerdown', () => {
    joyActive = true;
  });

  document.addEventListener('pointerup', () => {

    joyActive = false;

    knob.style.transform =
      `translate(-50%, -50%)`;

  });

  document.addEventListener('pointermove', (e) => {

    if (!joyActive) return;

    const rect =
      joystick.getBoundingClientRect();

    const cx =
      rect.left + rect.width / 2;

    const cy =
      rect.top + rect.height / 2;

    let dx = e.clientX - cx;
    let dy = e.clientY - cy;

    const max = 32;

    const dist =
      Math.sqrt(dx * dx + dy * dy);

    if (dist > max) {

      dx = dx / dist * max;
      dy = dy / dist * max;

    }

    // knob movement
    knob.style.transform =
      `translate(calc(-50% + ${dx}px),
                 calc(-50% + ${dy}px))`;

    // score rotate
    cardRotY += dx * 0.18;
    cardRotX -= dy * 0.18;

    const card =
      document.getElementById('score-card');

    updateCardTransform(card);

  });

}
/* =========================
   SCORE ROTATE HUD
========================= */

document.addEventListener('click', (e) => {

  const card =
    document.getElementById('score-card');

  if (!card) return;

  // =====================
  // FLIP
  // =====================

  if (e.target.id === 'score-flip') {

    cardFlipped = !cardFlipped;

    updateCardTransform(card);

  }

  // =====================
  // LEFT / RIGHT
  // =====================

  if (e.target.id === 'rot-left') {

    cardRotY -= 12;

    updateCardTransform(card);

  }

  if (e.target.id === 'rot-right') {

    cardRotY += 12;

    updateCardTransform(card);

  }

  // =====================
  // UP / DOWN
  // =====================

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
const isMobile =
    window.matchMedia('(max-width: 768px)').matches;
if (!isMobile) {

    const mainTitle =
        document.getElementById('main-title');

    const hoverZone =
        document.getElementById('title-hover-zone');

    const introDrawer =
        document.getElementById('intro-drawer');

    const introClose =
        document.getElementById('intro-close');

    let titleDismissed = false;

    // 原来的全部 intro drawer 代码
}
const mainTitle =
  document.getElementById('main-title');
const hoverZone =
  document.getElementById('title-hover-zone');
const introDrawer =
  document.getElementById('intro-drawer');

const introClose =
  document.getElementById('intro-close');
let titleDismissed = false;
if (mainTitle && introDrawer) {

  mainTitle.addEventListener('click', () => {

  introDrawer.classList.add('open');

  // drawer 打开时强制显示
  mainTitle.classList.remove('hidden');

  // 恢复点击
  mainTitle.style.pointerEvents = 'auto';

});
}

if (introClose && introDrawer) {

  introClose.addEventListener('click', () => {

 introDrawer.classList.remove('open');

titleDismissed = true;

// 关闭后隐藏
mainTitle.classList.add('hidden');

mainTitle.style.pointerEvents = 'none';
});

}
/* =========================
   hide title on interaction
========================= */

document.addEventListener('click', (e) => {

  // 点击标题自己不隐藏
  if (
    e.target.closest('#main-title')
  ) return;

  mainTitle?.classList.add('hidden');
mainTitle.style.pointerEvents = 'none';
});
/* =========================
   hover reveal title
========================= */

const hoverField = document.getElementById('title-hover-field');

function showTitle() {
  if (introDrawer?.classList.contains('open')) return;

  mainTitle.classList.remove('hidden');
  mainTitle.style.pointerEvents = 'auto';
}

function hideTitle() {
  if (introDrawer?.classList.contains('open')) return;

  if (titleDismissed) {
    mainTitle.classList.add('hidden');
  }
}

/* =========================
   双区域 hover 控制
========================= */

if (mainTitle) {

  // title 本体 hover
  mainTitle.addEventListener('mouseenter', showTitle);

  mainTitle.addEventListener('mouseleave', hideTitle);
}

/* 扩展 hover 区域 */
if (hoverZone) {
  hoverZone.addEventListener('mouseenter', showTitle);
  hoverZone.addEventListener('mouseleave', hideTitle);
}

if (hoverField) {
  hoverField.addEventListener('mouseenter', showTitle);
  hoverField.addEventListener('mouseleave', hideTitle);
}
