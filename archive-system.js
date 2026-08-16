// Archive submission system
const MAP_WIDTH = 4000;
const MAP_HEIGHT = 3000;
const GEO_SCALE = 1.0;
const WORLD_SCALE = 1.0;
const OFFSET_X = 0;
const OFFSET_Y = 0;
const SUBMISSION_ENDPOINT = 'https://ruin-archive-submission.lliquidcat.workers.dev/submit';
const TURNSTILE_SITE_KEY = '0x4AAAAAAERYVdvIxjBH2aXP';
const TURNSTILE_ACTION = 'archive_submit';
const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY && !TURNSTILE_SITE_KEY.startsWith('PASTE_'));
const ALLOWED_CLIENT_MIME_TYPES = new Set([
  'image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif',
  'application/pdf','text/plain',
  'audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/x-wav',
  'video/mp4','video/quicktime','video/webm'
]);
const MAX_FILES = 5;
const MAX_TOTAL_FILE_BYTES = 8 * 1024 * 1024;

const EXISTING_SITES = [
  {
    "name": "瘟豬壩沉墟",
    "lat": 30.454417,
    "lng": 104.047667,
    "type": "garden",
    "archiveDate": "2025.04"
  },
  {
    "name": "電臺路焦土",
    "lat": 31.225833,
    "lng": 121.618333,
    "type": "garden",
    "archiveDate": "2026.03"
  },
  {
    "name": "山葬灰脈",
    "lat": 32.04174,
    "lng": 119.83912,
    "type": "record",
    "archiveDate": "2017.08"
  },
  {
    "name": "琉棘庭",
    "lat": 31.2270054,
    "lng": 121.6191375,
    "type": "record",
    "archiveDate": "2018.07"
  },
  {
    "name": "裂翼坪",
    "lat": 41.860278,
    "lng": -87.606111,
    "type": "record",
    "archiveDate": "2021.08"
  },
  {
    "name": "軌畔孤構",
    "lat": 32.552507,
    "lng": -94.3644399,
    "type": "record",
    "archiveDate": "2022.06"
  },
  {
    "name": "残柱林",
    "lat": 41.77502,
    "lng": -87.56954,
    "type": "record",
    "archiveDate": "2022.10"
  },
  {
    "name": "池骸灣",
    "lat": 37.7806,
    "lng": -122.5137,
    "type": "record",
    "archiveDate": "2023.08"
  },
  {
    "name": "褶層灣",
    "lat": 47.1808,
    "lng": -122.5537,
    "type": "record",
    "archiveDate": "2023.12"
  },
  {
    "name": "釉骸拓壁",
    "lat": 30.7023424,
    "lng": 104.0714623,
    "type": "record",
    "archiveDate": "2024.04"
  },
  {
    "name": "疊骸構陣",
    "lat": 30.4416944,
    "lng": 104.03475,
    "type": "record",
    "archiveDate": "2024.05"
  },
  {
    "name": "苔網塬",
    "lat": 30.66457,
    "lng": 104.15798,
    "type": "record",
    "archiveDate": "2024.05"
  },
  {
    "name": "陸塢艦骸",
    "lat": 30.5854444,
    "lng": 104.0365278,
    "type": "record",
    "archiveDate": "2024.06"
  },
  {
    "name": "墟響廳",
    "lat": 30.5886698,
    "lng": 104.0341997,
    "type": "record",
    "archiveDate": "2024.06"
  },
  {
    "name": "波蝕脊堤",
    "lat": 30.8227055,
    "lng": 121.5305626,
    "type": "record",
    "archiveDate": "2024.07"
  },
  {
    "name": "曜原驛",
    "lat": 38.83587,
    "lng": 117.55678,
    "type": "record",
    "archiveDate": "2024.08"
  },
  {
    "name": "溶境遺廊",
    "lat": 30.660271,
    "lng": 104.0676944,
    "type": "record",
    "archiveDate": "2024.08"
  },
  {
    "name": "荒娛敖包",
    "lat": 41.72871,
    "lng": 110.51296,
    "type": "record",
    "archiveDate": "2024.12"
  },
  {
    "name": "彩殼堡",
    "lat": 40.2368611,
    "lng": 116.16375,
    "type": "record",
    "archiveDate": "2025.01",
    "recorder": "王一川"
  },
  {
    "name": "削巖殘居",
    "lat": 30.425167,
    "lng": 104.096167,
    "type": "record",
    "archiveDate": "2025.02"
  },
  {
    "name": "遷痕空埠",
    "lat": 30.43251,
    "lng": 104.04063,
    "type": "record",
    "archiveDate": "2026.06"
  },
  {
    "name": "山骸窟殿",
    "lat": 34.5275555,
    "lng": 119.1429722,
    "type": "record",
    "archiveDate": "2026.07"
  },
  {
    "name": "土還灶垣",
    "lat": 31.664444,
    "lng": 99.679444,
    "type": "record",
    "archiveDate": "2026.08",
    "recorder": "王一川"
  }
];

const i18n = {
  zh: {
    document_title:'遺構館 · 檔案系統', panel_title:'遺構館 · 檔案系統', form_title:'檔案投稿', mark_location:'標記地點', layers_title:'圖層',
        layer_border: '疆界', layer_satellite: '衛星影像', layer_terrain: '地形線', layer_human: '聚居痕跡', layer_archive: '館藏遺構', layer_visitors:'客錄遺構', archive_label:'歸檔：', recorder_label:'記錄者：',
    section_meta:'定位與歸檔', section_record:'檔案內容', section_submit:'提交方式', archivist_label:'歸檔者', coordinate_label:'坐標', place_reference_label:'地點名稱', date_label:'時間', place_title_label:'地名標題', description_label:'簡介',
    archivist:'歸檔者', coordinate:'坐標', place_reference:'地點名稱／地址', attachment:'添加附件', drag_pin:'拖放標記', place_title:'地名標題', description:'簡介', admin_archive:'歸檔', visitor_submit:'訪客投稿', admin_password:'需要管理員密碼', mobile_pick_map:'在地圖上選點',
    location_hint:'坐標與地點名稱任填其一。若不清楚坐標，可直接填寫地址。',
    dms_title:'度分秒坐標', dms_lat:'緯', dms_lng:'經', dms_convert:'轉為十進制度', dms_invalid:'度分秒坐標格式無效。', dms_converted:'已轉為十進制度，可繼續標記地點。',
    coord_invalid:'坐標格式無效。', locating:'正在定位坐標…', locate_ready:'已定位。可拖動地圖檢查位置，或點擊地圖微調。',
    add_location:'添加地點', location_added:'地點已添加，檔案投稿已展開。', draft_tooltip:'待歸檔地點',
    required:'請完整填寫歸檔者、時間、地名與簡介，並填寫坐標或地點名稱其中一項。', sending:'正在傳送檔案…', sent_admin:'管理員檔案已送出。', sent_visitor:'訪客投稿已送出。', submit_failed:'投稿失敗。', files_too_large:'附件最多 5 個，總大小不超過 8 MB。', unsupported_file:'附件格式不支援。', human_required:'請完成人機驗證。', rate_limited:'提交過於頻繁，請稍後再試。',
    new_record_confirm_title:'新建檔案', new_record_confirm_body:'清除目前未提交的內容並建立一份新檔案？', confirm:'確認', cancel:'取消', new_record_title:'新建檔案', form_open:'展開檔案投稿', form_close:'收起檔案投稿'
  },
  en: {
    document_title:'Relic Archive · Filing System', panel_title:'Relic Archive · Filing System', form_title:'Archive Submission', mark_location:'Mark Location', layers_title:'Layers',
    layer_border:'Boundaries', layer_satellite:'Satellite Imagery', layer_terrain:'Terrain Lines', layer_human:'Settlement Traces', layer_archive:'Collection Relics', layer_visitors:'Guest-recorded Relics', archive_label:'Archive: ', recorder_label:'Recorder: ',
    section_meta:'Location / Identity', section_record:'Archive Content', section_submit:'Submission', archivist_label:'Archivist', coordinate_label:'Coordinates', place_reference_label:'Place Name', date_label:'Date', place_title_label:'Archive Title', description_label:'Description',
    archivist:'Archivist', coordinate:'Coordinates', place_reference:'Place Name / Address', attachment:'Add Attachment', drag_pin:'Drag Marker', place_title:'Place Title', description:'Description', admin_archive:'Archive', visitor_submit:'Visitor Submit', admin_password:'Admin password required', mobile_pick_map:'Pick on Map',
    location_hint:'Fill either coordinates or place name / address. If you are unsure of the coordinates, an address alone is acceptable.',
    dms_title:'DMS Coordinates', dms_lat:'Lat', dms_lng:'Lng', dms_convert:'Convert to Decimal', dms_invalid:'Invalid degrees/minutes/seconds coordinates.', dms_converted:'Converted to decimal degrees. Ready to mark the location.',
    coord_invalid:'Invalid coordinates.', locating:'Locating coordinates…', locate_ready:'Located. Drag the map to inspect, or click the map to refine the point.',
    add_location:'Add Location', location_added:'Location added. Submission form opened.', draft_tooltip:'Pending archive point',
    required:'Complete archivist, date, title and description, and enter either coordinates or a place name.', sending:'Transmitting archive…', sent_admin:'Administrator archive sent.', sent_visitor:'Visitor submission sent.', submit_failed:'Submission failed.', files_too_large:'Maximum 5 attachments and 8 MB total.', unsupported_file:'Unsupported attachment type.', human_required:'Complete the human verification.', rate_limited:'Too many submissions. Please try again later.',
    new_record_confirm_title:'New Record', new_record_confirm_body:'Clear all unsubmitted content and create a new archive record?', confirm:'Confirm', cancel:'Cancel', new_record_title:'New record', form_open:'Open archive submission', form_close:'Close archive submission'
  },
  ja: {
    document_title:'遺構館・アーカイブシステム', panel_title:'遺構館・アーカイブシステム', form_title:'アーカイブ投稿', mark_location:'地点を標記', layers_title:'レイヤー',
    layer_border:'境界', layer_satellite:'衛星画像', layer_terrain:'地形線', layer_human:'居住痕跡', layer_archive:'収蔵遺構', layer_visitors:'客録遺構', archive_label:'収蔵：', recorder_label:'記録者：',
    section_meta:'位置と記録情報', section_record:'アーカイブ内容', section_submit:'送信', archivist_label:'記録者', coordinate_label:'座標', place_reference_label:'地点名', date_label:'日時', place_title_label:'地点名題', description_label:'概要',
    archivist:'記録者', coordinate:'座標', place_reference:'地点名／住所', attachment:'添付追加', drag_pin:'標記をドラッグ', place_title:'地点名', description:'概要', admin_archive:'収蔵', visitor_submit:'来訪者投稿', admin_password:'管理者パスワードが必要', mobile_pick_map:'地図上で選択',
    location_hint:'座標または地点名のどちらか一方を記入してください。座標が不明な場合は住所のみでも構いません。',
    dms_title:'度分秒座標', dms_lat:'緯', dms_lng:'経', dms_convert:'十進度へ変換', dms_invalid:'度分秒座標の形式が無効です。', dms_converted:'十進度へ変換しました。地点を標記できます。',
    coord_invalid:'座標形式が無効です。', locating:'座標を定位中…', locate_ready:'定位しました。地図を動かして確認するか、地図をクリックして微調整できます。',
    add_location:'地点を追加', location_added:'地点を追加し、投稿フォームを展開しました。', draft_tooltip:'収蔵待ち地点',
    required:'記録者・日時・地点名・概要を入力し、さらに座標または地点名のいずれかを記入してください。', sending:'アーカイブを送信中…', sent_admin:'管理者アーカイブを送信しました。', sent_visitor:'来訪者投稿を送信しました。', submit_failed:'送信に失敗しました。', files_too_large:'添付は5件・合計8 MBまでです。', unsupported_file:'対応していない添付形式です。', human_required:'人間確認を完了してください。', rate_limited:'送信回数が多すぎます。しばらくしてから再試行してください。',
    new_record_confirm_title:'新規アーカイブ', new_record_confirm_body:'未送信の内容をすべて消去し、新しいアーカイブを作成しますか？', confirm:'確認', cancel:'取消', new_record_title:'新規アーカイブ', form_open:'投稿フォームを開く', form_close:'投稿フォームを閉じる'
  }
};
const decodeTokens = new WeakMap();
let languageSwitchToken = 0;
let initialLanguageTimer = null;
let currentLang = 'en';

function tr(key) {
  return i18n[currentLang][key] || i18n.zh[key] || key;
}

function cyberDecodeTranslate(element, targetText, duration = 1000) {
  const originalText = element.textContent || '';
  const originalLen = originalText.length;
  const targetLen = targetText.length;
  const startTime = performance.now();
  const token = (decodeTokens.get(element) || 0) + 1;
  decodeTokens.set(element, token);
  let lastString = null;

  function updateFrame(now) {
    if (decodeTokens.get(element) !== token) return;

    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const targetCut = Math.round(targetLen * eased);
    const originalCut = Math.round(originalLen * eased);
    const nextText = targetText.substring(0, targetCut) + originalText.substring(originalCut);

    if (nextText !== lastString) {
      element.textContent = nextText;
      lastString = nextText;
    }

    if (progress < 1) {
      requestAnimationFrame(updateFrame);
    } else if (element.textContent !== targetText) {
      element.textContent = targetText;
    }
  }

  requestAnimationFrame(updateFrame);
}

function isElementOnScreen(element) {
  const style = getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 &&
    rect.bottom >= 0 && rect.right >= 0 &&
    rect.top <= window.innerHeight && rect.left <= window.innerWidth;
}

function applyI18n({ animate = false } = {}) {
  const switchToken = ++languageSwitchToken;
  document.documentElement.lang = currentLang === 'ja' ? 'ja' : currentLang === 'en' ? 'en' : 'zh-Hant';
  document.title = tr('document_title');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const targetText = tr(el.dataset.i18n);
    if (el.textContent === targetText) return;

    if (!animate || !isElementOnScreen(el)) {
      decodeTokens.set(el, (decodeTokens.get(el) || 0) + 1);
      el.textContent = targetText;
      return;
    }

    const delay = Math.random() * 200;
    setTimeout(() => {
      if (switchToken !== languageSwitchToken) return;
      if (!isElementOnScreen(el)) {
        decodeTokens.set(el, (decodeTokens.get(el) || 0) + 1);
        el.textContent = targetText;
        return;
      }
      cyberDecodeTranslate(el, targetText, 1000);
    }, delay);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = tr(el.dataset.i18nPlaceholder);
  });

  document.querySelectorAll('#language-switcher [data-lang]').forEach(button => {
    button.classList.toggle('active', button.dataset.lang === currentLang);
  });

  const handle = document.getElementById('form-handle');
  if (handle) handle.title = tr(document.body.classList.contains('form-open') ? 'form_close' : 'form_open');
  const newRecord = document.getElementById('new-record');
  if (newRecord) newRecord.title = tr('new_record_title');
  if (locatorActive && candidateGeo) showCandidatePopup();
  if (draftMarker) draftMarker.setTooltipContent(tr('draft_tooltip'));
}

function switchLanguage(lang, { animate = true, updateUrl = true } = {}) {
  if (!i18n[lang]) return;
  currentLang = lang;
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  }
  applyI18n({ animate });
}

document.querySelectorAll('#language-switcher [data-lang]').forEach(button => {
  button.addEventListener('click', () => {
    if (initialLanguageTimer) {
      clearTimeout(initialLanguageTimer);
      initialLanguageTimer = null;
    }
    if (button.dataset.lang === currentLang) return;
    switchLanguage(button.dataset.lang, { animate: true, updateUrl: true });
  });
});

function geoToSVG(lat, lng) {
  let shiftedLng = lng + 180;
  if (shiftedLng > 180) shiftedLng -= 360;
  let x = ((shiftedLng + 180) / 360 - 0.5) * GEO_SCALE + 0.5;
  let y = ((lat + 90) / 180 - 0.5) * GEO_SCALE + 0.5;
  x = (x - 0.5) * WORLD_SCALE + 0.5;
  y = (y - 0.5) * WORLD_SCALE + 0.5;
  x += OFFSET_X;
  y += OFFSET_Y;
  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));
  return [y * MAP_HEIGHT, x * MAP_WIDTH];
}

function mapToGeo(y, x) {
  x /= MAP_WIDTH;
  y /= MAP_HEIGHT;
  x -= OFFSET_X;
  y -= OFFSET_Y;
  x = (x - 0.5) / WORLD_SCALE + 0.5;
  y = (y - 0.5) / WORLD_SCALE + 0.5;
  x = (x - 0.5) / GEO_SCALE + 0.5;
  y = (y - 0.5) / GEO_SCALE + 0.5;
  const lng = ((x + 0.5) % 1) * 360 - 180;
  return { lat: y * 180 - 90, lng };
}


function mapPointFromGeo(lat, lng) {
  const [y, x] = geoToSVG(lat, lng);
  return L.latLng(y, x);
}

const map = L.map('archive-map', {
  crs: L.CRS.Simple,
  minZoom: -1.8,
  maxZoom: 8,
  zoomControl: false,
  attributionControl: false,
  inertia: true
});
const bounds = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];

map.createPane('satelliteArchivePane');
map.createPane('terrainArchivePane');
map.createPane('humanArchivePane');
map.createPane('borderArchivePane');
map.getPane('satelliteArchivePane').style.zIndex = '160';
map.getPane('terrainArchivePane').style.zIndex = '180';
map.getPane('humanArchivePane').style.zIndex = '200';
map.getPane('borderArchivePane').style.zIndex = '220';
for (const paneName of ['satelliteArchivePane', 'terrainArchivePane', 'humanArchivePane', 'borderArchivePane']) {
  map.getPane(paneName).style.pointerEvents = 'none';
}

const ruinLayer = L.imageOverlay('assets/ruin-map-clean.svg', bounds, { pane: 'humanArchivePane' }).addTo(map);
map.fitBounds(bounds, { animate: false });
requestAnimationFrame(() => {
  const initialShift = map.getSize().x * 0.10;
  map.panBy([-initialShift, 0], { animate: false });
});

const OWNER_RECORDER_NAMES = new Set(['羅清源', '罗清源']);

function recorderOf(site) {
  const recorder = String(site.recorder || '羅清源').trim();
  return recorder || '羅清源';
}

function isVisitorRecord(site) {
  return site.type === 'record' && !OWNER_RECORDER_NAMES.has(recorderOf(site));
}

const archiveMarkers = L.layerGroup().addTo(map);
const visitorMarkers = L.layerGroup();
let hoverSiteMarker = null;
let lockedSiteMarker = null;

const markerRippleOverlay = document.createElement('div');
markerRippleOverlay.className = 'marker-ripple-overlay';
markerRippleOverlay.setAttribute('aria-hidden', 'true');
document.body.appendChild(markerRippleOverlay);
let markerPulseTimer = null;

function sitePopupContent(site, showRecorder = false) {
  const content = document.createElement('div');
  content.className = 'site-info-popup-content';

  const name = document.createElement('div');
  name.className = 'site-info-name';
  name.textContent = site.name;

  const coords = document.createElement('div');
  coords.className = 'site-info-coords';
  coords.textContent = `${Number(site.lat).toFixed(7)}, ${Number(site.lng).toFixed(7)}`;

  const date = document.createElement('div');
  date.className = 'site-info-meta';
  const dateLabel = document.createElement('span');
  dateLabel.dataset.i18n = 'archive_label';
  dateLabel.textContent = tr('archive_label');
  date.append(dateLabel, document.createTextNode(site.archiveDate || '—'));

  content.append(name, coords, date);

  if (showRecorder) {
    const recorder = document.createElement('div');
    recorder.className = 'site-info-meta site-info-recorder';
    const recorderLabel = document.createElement('span');
    recorderLabel.dataset.i18n = 'recorder_label';
    recorderLabel.textContent = tr('recorder_label');
    recorder.append(recorderLabel, document.createTextNode(recorderOf(site)));
    content.appendChild(recorder);
  }

  return content;
}

function bindSitePopup(marker, site, showRecorder = false) {
  marker.bindPopup(sitePopupContent(site, showRecorder), {
    closeButton: false,
    autoClose: false,
    closeOnClick: false,
    className: 'archive-site-popup',
    offset: [18, -18]
  });

  marker.on('mouseover', () => {
    if (hoverSiteMarker && hoverSiteMarker !== marker && hoverSiteMarker !== lockedSiteMarker) {
      hoverSiteMarker.closePopup();
    }
    marker.openPopup();
    hoverSiteMarker = marker;
  });

  marker.on('mouseout', () => {
    window.setTimeout(() => {
      if (lockedSiteMarker === marker) return;
      if (hoverSiteMarker === marker) {
        marker.closePopup();
        hoverSiteMarker = null;
      }
    }, 120);
  });

  marker.on('click', e => {
    if (lockedSiteMarker && lockedSiteMarker !== marker) lockedSiteMarker.closePopup();
    lockedSiteMarker = marker;
    marker.openPopup();
    hoverSiteMarker = marker;
    L.DomEvent.stopPropagation(e);
  });
}

function addExistingMarkers() {
  archiveMarkers.clearLayers();
  for (const site of EXISTING_SITES) {
    if (isVisitorRecord(site)) continue;
    const cls = site.type === 'garden' ? 'garden-dot' : 'record-dot';
    const icon = L.divIcon({
      className: 'archive-marker',
      html: `<span class="${cls}"></span>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });
    const marker = L.marker(mapPointFromGeo(site.lat, site.lng), { icon });
    bindSitePopup(marker, site, false);
    marker.addTo(archiveMarkers);
  }
}

function buildVisitorMarkers() {
  visitorMarkers.clearLayers();
  for (const site of EXISTING_SITES) {
    if (!isVisitorRecord(site)) continue;
    const icon = L.divIcon({
      className: 'archive-marker',
      html: '<span class="record-dot"></span>',
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });
    const marker = L.marker(mapPointFromGeo(site.lat, site.lng), { icon });
    bindSitePopup(marker, site, true);
    marker.addTo(visitorMarkers);
  }
}

function pulseMarkerSites(sites) {
  markerRippleOverlay.replaceChildren();
  if (markerPulseTimer) window.clearTimeout(markerPulseTimer);

  const mapRect = map.getContainer().getBoundingClientRect();
  for (const site of sites) {
    const point = map.latLngToContainerPoint(mapPointFromGeo(site.lat, site.lng));
    const x = mapRect.left + point.x;
    const y = mapRect.top + point.y;
    if (x < -80 || x > window.innerWidth + 80 || y < -80 || y > window.innerHeight + 80) continue;

    const node = document.createElement('span');
    node.className = 'marker-ripple-node';
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    markerRippleOverlay.appendChild(node);
  }

  markerPulseTimer = window.setTimeout(() => {
    markerRippleOverlay.replaceChildren();
    markerPulseTimer = null;
  }, 1600);
}

function bindMarkerLayerPulse(inputId, filterFn) {
  const input = document.getElementById(inputId);
  const row = input?.closest('.layer-row');
  if (!row) return;
  const pulse = () => pulseMarkerSites(EXISTING_SITES.filter(filterFn));
  row.addEventListener('mouseenter', pulse);
  row.addEventListener('focusin', pulse);
}

addExistingMarkers();
buildVisitorMarkers();
bindMarkerLayerPulse('layer-archive', site => !isVisitorRecord(site));
bindMarkerLayerPulse('layer-visitors', isVisitorRecord);

const optionalLayers = {};
function setImageLayer(key, file, enabled, pane) {
  if (enabled) {
    if (!optionalLayers[key]) optionalLayers[key] = L.imageOverlay(file, bounds, { interactive: false, pane });
    if (!map.hasLayer(optionalLayers[key])) optionalLayers[key].addTo(map);
  } else if (optionalLayers[key] && map.hasLayer(optionalLayers[key])) {
    map.removeLayer(optionalLayers[key]);
  }
}

setImageLayer('terrain', 'assets/terrain-map.svg', true, 'terrainArchivePane');

document.getElementById('layer-human').addEventListener('change', e => e.target.checked ? ruinLayer.addTo(map) : map.removeLayer(ruinLayer));
document.getElementById('layer-border').addEventListener('change', e => setImageLayer('border', 'assets/border-map.svg', e.target.checked, 'borderArchivePane'));
document.getElementById('layer-satellite').addEventListener('change', e => setImageLayer('satellite', 'assets/satellite.jpg', e.target.checked, 'satelliteArchivePane'));
document.getElementById('layer-terrain').addEventListener('change', e => setImageLayer('terrain', 'assets/terrain-map.svg', e.target.checked, 'terrainArchivePane'));
document.getElementById('layer-archive').addEventListener('change', e => {
  if (e.target.checked) {
    archiveMarkers.addTo(map);
    pulseMarkerSites(EXISTING_SITES.filter(site => !isVisitorRecord(site)));
  } else {
    map.removeLayer(archiveMarkers);
  }
});

document.getElementById('layer-visitors').addEventListener('change', e => {
  if (e.target.checked) {
    visitorMarkers.addTo(map);
    pulseMarkerSites(EXISTING_SITES.filter(isVisitorRecord));
  } else {
    map.removeLayer(visitorMarkers);
  }
});

const dragLocationPin = document.getElementById('drag-location-pin');
let pinDragGhost = null;
let pinDragPointerId = null;

function movePinGhost(clientX, clientY) {
  if (!pinDragGhost) return;
  pinDragGhost.style.left = `${clientX}px`;
  pinDragGhost.style.top = `${clientY}px`;
}

function clearPinDrag() {
  document.body.classList.remove('pin-dragging');
  if (pinDragGhost) pinDragGhost.remove();
  pinDragGhost = null;
  pinDragPointerId = null;
}

function isMapDropTarget(clientX, clientY) {
  const target = document.elementFromPoint(clientX, clientY);
  return Boolean(target && target.closest('#archive-map'));
}

dragLocationPin.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  pinDragPointerId = event.pointerId;
  document.body.classList.add('pin-dragging');

  pinDragGhost = document.createElement('div');
  pinDragGhost.className = 'pin-drag-ghost';
  pinDragGhost.innerHTML = dragLocationPin.innerHTML;
  document.body.appendChild(pinDragGhost);
  movePinGhost(event.clientX, event.clientY);

  try { dragLocationPin.setPointerCapture(event.pointerId); } catch (_) {}
});

window.addEventListener('pointermove', event => {
  if (pinDragPointerId !== event.pointerId || !pinDragGhost) return;
  movePinGhost(event.clientX, event.clientY);
});

window.addEventListener('pointerup', event => {
  if (pinDragPointerId !== event.pointerId || !pinDragGhost) return;

  if (isMapDropTarget(event.clientX, event.clientY)) {
    const rect = map.getContainer().getBoundingClientRect();
    const mapPoint = L.point(event.clientX - rect.left, event.clientY - rect.top);
    const latLng = map.containerPointToLatLng(mapPoint);
    const point = mapToGeo(latLng.lat, latLng.lng);
    setCandidate(point, { fly: false });
  }

  clearPinDrag();
});

window.addEventListener('pointercancel', event => {
  if (pinDragPointerId === event.pointerId) clearPinDrag();
});

const latInput = document.getElementById('coord-lat');
const lngInput = document.getElementById('coord-lng');
const dmsInputs = {
  latDeg: document.getElementById('dms-lat-deg'),
  latMin: document.getElementById('dms-lat-min'),
  latSec: document.getElementById('dms-lat-sec'),
  latDir: document.getElementById('dms-lat-dir'),
  lngDeg: document.getElementById('dms-lng-deg'),
  lngMin: document.getElementById('dms-lng-min'),
  lngSec: document.getElementById('dms-lng-sec'),
  lngDir: document.getElementById('dms-lng-dir')
};
const searchStatus = document.getElementById('search-status');
const crosshair = document.getElementById('archive-crosshair');

let locatorActive = false;
let candidateGeo = null;
let locatorPopup = null;
let draftMarker = null;
let crossRaf = null;

function readCoordInputs() {
  const latText = latInput.value.trim();
  const lngText = lngInput.value.trim();
  if (!latText || !lngText) return null;
  const lat = Number(latText);
  const lng = Number(lngText);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function decimalToDMS(value, axis) {
  const abs = Math.abs(value);
  let deg = Math.floor(abs);
  const minutesRaw = (abs - deg) * 60;
  let min = Math.floor(minutesRaw);
  let sec = Math.round((minutesRaw - min) * 60 * 1000) / 1000;

  if (sec >= 60) { sec = 0; min += 1; }
  if (min >= 60) { min = 0; deg += 1; }

  const dir = axis === 'lat' ? (value < 0 ? 'S' : 'N') : (value < 0 ? 'W' : 'E');
  return { deg, min, sec, dir };
}

function writeDMSInputs(point) {
  const lat = decimalToDMS(point.lat, 'lat');
  const lng = decimalToDMS(point.lng, 'lng');
  dmsInputs.latDeg.value = String(lat.deg);
  dmsInputs.latMin.value = String(lat.min);
  dmsInputs.latSec.value = lat.sec.toFixed(3).replace(/\.?0+$/, '');
  dmsInputs.latDir.value = lat.dir;
  dmsInputs.lngDeg.value = String(lng.deg);
  dmsInputs.lngMin.value = String(lng.min);
  dmsInputs.lngSec.value = lng.sec.toFixed(3).replace(/\.?0+$/, '');
  dmsInputs.lngDir.value = lng.dir;
}

function clearDMSInputs() {
  for (const key of ['latDeg','latMin','latSec','lngDeg','lngMin','lngSec']) dmsInputs[key].value = '';
  dmsInputs.latDir.value = 'N';
  dmsInputs.lngDir.value = 'E';
}

function dmsAxisToDecimal(degValue, minValue, secValue, dir, maxDeg) {
  if (degValue === '' || minValue === '' || secValue === '') return null;
  const deg = Number(degValue);
  const min = Number(minValue);
  const sec = Number(secValue);
  if (!Number.isFinite(deg) || !Number.isFinite(min) || !Number.isFinite(sec)) return null;
  if (deg < 0 || deg > maxDeg || min < 0 || min >= 60 || sec < 0 || sec >= 60) return null;
  if (deg === maxDeg && (min !== 0 || sec !== 0)) return null;
  const sign = dir === 'S' || dir === 'W' ? -1 : 1;
  return sign * (deg + min / 60 + sec / 3600);
}

function readDMSInputs() {
  const lat = dmsAxisToDecimal(dmsInputs.latDeg.value.trim(), dmsInputs.latMin.value.trim(), dmsInputs.latSec.value.trim(), dmsInputs.latDir.value, 90);
  const lng = dmsAxisToDecimal(dmsInputs.lngDeg.value.trim(), dmsInputs.lngMin.value.trim(), dmsInputs.lngSec.value.trim(), dmsInputs.lngDir.value, 180);
  if (lat === null || lng === null) return null;
  return { lat, lng };
}

function writeCoordInputs(point) {
  latInput.value = point.lat.toFixed(7);
  lngInput.value = point.lng.toFixed(7);
  writeDMSInputs(point);
}

function coordinateString(point) {
  return `${point.lat.toFixed(7)}, ${point.lng.toFixed(7)}`;
}

function syncDMSFromDecimalInputs() {
  const point = readCoordInputs();
  if (point) writeDMSInputs(point);
}

latInput.addEventListener('change', syncDMSFromDecimalInputs);
lngInput.addEventListener('change', syncDMSFromDecimalInputs);

document.getElementById('convert-dms').addEventListener('click', () => {
  const point = readDMSInputs();
  if (!point) { searchStatus.textContent = tr('dms_invalid'); return; }
  writeCoordInputs(point);
  searchStatus.textContent = tr('dms_converted');
});

for (const input of [dmsInputs.latDeg, dmsInputs.latMin, dmsInputs.latSec, dmsInputs.lngDeg, dmsInputs.lngMin, dmsInputs.lngSec]) {
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('convert-dms').click();
    }
  });
}


function updateCrosshair() {
  if (!locatorActive || !candidateGeo || crossRaf) return;
  crossRaf = requestAnimationFrame(() => {
    const point = map.latLngToContainerPoint(mapPointFromGeo(candidateGeo.lat, candidateGeo.lng));
    const x = Math.max(0, Math.min(window.innerWidth, point.x));
    const y = Math.max(0, Math.min(window.innerHeight, point.y));
    crosshair.style.setProperty('--cross-x', `${x}px`);
    crosshair.style.setProperty('--cross-y', `${y}px`);
    crossRaf = null;
  });
}

function setCandidate(point, { fly = false } = {}) {
  candidateGeo = { lat: point.lat, lng: point.lng };
  locatorActive = true;
  writeCoordInputs(candidateGeo);
  crosshair.classList.add('active');
  updateCrosshair();
  showCandidatePopup();

  if (fly) {
    searchStatus.textContent = tr('locating');
    const target = mapPointFromGeo(candidateGeo.lat, candidateGeo.lng);
    map.flyTo(target, Math.max(map.getZoom(), 4.8), { duration: 1.25 });
    window.setTimeout(() => {
      if (locatorActive) searchStatus.textContent = tr('locate_ready');
    }, 1300);
  } else {
    searchStatus.textContent = tr('locate_ready');
  }
}

function showCandidatePopup() {
  if (!candidateGeo) return;
  if (locatorPopup) map.closePopup(locatorPopup);

  const content = document.createElement('div');
  content.className = 'locator-popup-content';

  const coords = document.createElement('div');
  coords.className = 'locator-popup-coord';
  coords.textContent = coordinateString(candidateGeo);

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'add-location-button';
  addButton.textContent = `[${tr('add_location')}]`;
  addButton.addEventListener('click', addCandidateLocation);

  content.append(coords, addButton);
  locatorPopup = L.popup({ className: 'locator-popup', closeButton: false, autoPan: false, offset: [0, -10] })
    .setLatLng(mapPointFromGeo(candidateGeo.lat, candidateGeo.lng))
    .setContent(content)
    .openOn(map);
}

function addCandidateLocation() {
  if (!candidateGeo) return;
  if (draftMarker) map.removeLayer(draftMarker);

  const icon = L.divIcon({ className: 'archive-marker', html: '<span class="draft-dot"></span>', iconSize: [12, 12], iconAnchor: [6, 6] });
  draftMarker = L.marker(mapPointFromGeo(candidateGeo.lat, candidateGeo.lng), { icon, draggable: true })
    .bindTooltip(tr('draft_tooltip'), { className: 'archive-tooltip', direction: 'top', offset: [0, -6] })
    .addTo(map);

  draftMarker.on('dragend', () => {
    const p = draftMarker.getLatLng();
    candidateGeo = mapToGeo(p.lat, p.lng);
    writeCoordInputs(candidateGeo);
    document.getElementById('archive-coordinate').value = coordinateString(candidateGeo);
    });

  document.getElementById('archive-coordinate').value = coordinateString(candidateGeo);
  locatorActive = false;
  crosshair.classList.remove('active');
  map.closePopup();
  locatorPopup = null;
  searchStatus.textContent = tr('location_added');
  setFormOpen(true);
}

const mobileMapPick = document.getElementById('mobile-map-pick');
if (mobileMapPick) {
  mobileMapPick.addEventListener('click', () => {
    const center = map.getCenter();
    const point = mapToGeo(center.lat, center.lng);
    if (draftMarker) { map.removeLayer(draftMarker); draftMarker = null; }
    setCandidate(point, { fly: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => map.invalidateSize({ pan: false }), 260);
  });
}

document.getElementById('locate-coordinate').addEventListener('click', () => {
  const point = readCoordInputs();
  if (!point) { searchStatus.textContent = tr('coord_invalid'); return; }
  if (draftMarker) { map.removeLayer(draftMarker); draftMarker = null; }
  setCandidate(point, { fly: true });
});

map.on('click', e => {
  if (!locatorActive) {
    if (lockedSiteMarker) {
      lockedSiteMarker.closePopup();
      lockedSiteMarker = null;
      hoverSiteMarker = null;
    }
    return;
  }
  const point = mapToGeo(e.latlng.lat, e.latlng.lng);
  setCandidate(point, { fly: false });
});

map.on('move zoom resize', updateCrosshair);

const formShell = document.getElementById('archive-form-shell');
const formHandle = document.getElementById('form-handle');
const formHandleGlyph = formHandle.querySelector('.form-handle-glyph');
function setFormOpen(open) {
  formShell.classList.toggle('open', open);
  document.body.classList.toggle('form-open', open);
  formShell.setAttribute('aria-hidden', String(!open));
  formHandle.setAttribute('aria-expanded', String(open));
  formHandleGlyph.textContent = open ? '›' : '‹';
  formHandle.title = tr(open ? 'form_close' : 'form_open');
}
formHandle.addEventListener('click', () => setFormOpen(!formShell.classList.contains('open')));

let turnstileWidgetId = null;
let currentSubmissionId = (crypto && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
let submitting = false;

function refreshSubmissionId() {
  currentSubmissionId = (crypto && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resetTurnstileWidget() {
  if (TURNSTILE_ENABLED && window.turnstile && turnstileWidgetId !== null) {
    try { turnstile.reset(turnstileWidgetId); } catch (_) {}
  }
}

function setSubmittingState(active) {
  submitting = active;
  document.getElementById('admin-submit').disabled = active;
  document.getElementById('visitor-submit').disabled = active;
}

const attachments = document.getElementById('attachments');
const attachmentCount = document.getElementById('attachment-count');
const fileList = document.getElementById('file-list');
attachments.addEventListener('change', () => {
  const files = [...attachments.files];
  attachmentCount.textContent = String(files.length);
  fileList.textContent = files.map(f => `${f.name} · ${(f.size / 1024 / 1024).toFixed(2)} MB`).join(' / ');
});

const newRecordDialog = document.getElementById('new-record-dialog');
const newRecordConfirm = document.getElementById('new-record-confirm');
const newRecordCancel = document.getElementById('new-record-cancel');

function hasArchiveWork() {
  const form = document.getElementById('archive-form');
  const hasFormValue = [...form.querySelectorAll('input:not([type="file"]), textarea')].some(el => el.value.trim());
  const hasCoordinateValue = [
    latInput, lngInput,
    dmsInputs.latDeg, dmsInputs.latMin, dmsInputs.latSec,
    dmsInputs.lngDeg, dmsInputs.lngMin, dmsInputs.lngSec
  ].some(el => el.value.trim());
  return hasFormValue || hasCoordinateValue || attachments.files.length > 0 || Boolean(candidateGeo) || Boolean(draftMarker) || locatorActive;
}

function openNewRecordDialog() {
  newRecordDialog.hidden = false;
  newRecordDialog.setAttribute('aria-hidden', 'false');
}

function closeNewRecordDialog() {
  newRecordDialog.hidden = true;
  newRecordDialog.setAttribute('aria-hidden', 'true');
}

function resetArchiveWorkspace() {
  document.getElementById('archive-form').reset();
  attachmentCount.textContent = '0';
  fileList.textContent = '';
  const status = document.getElementById('submit-status');
  status.textContent = '';
  status.className = 'submit-status';
  searchStatus.textContent = '';
  latInput.value = '';
  lngInput.value = '';
  clearDMSInputs();
  candidateGeo = null;
  locatorActive = false;
  crosshair.classList.remove('active');
  if (locatorPopup) { map.closePopup(locatorPopup); locatorPopup = null; }
  if (draftMarker) { map.removeLayer(draftMarker); draftMarker = null; }
  refreshSubmissionId();
  resetTurnstileWidget();
  setFormOpen(true);
}

document.getElementById('new-record').addEventListener('click', () => {
  if (hasArchiveWork()) openNewRecordDialog();
  else resetArchiveWorkspace();
});
newRecordCancel.addEventListener('click', closeNewRecordDialog);
newRecordConfirm.addEventListener('click', () => { closeNewRecordDialog(); resetArchiveWorkspace(); });
newRecordDialog.querySelector('.system-dialog-backdrop').addEventListener('click', closeNewRecordDialog);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !newRecordDialog.hidden) closeNewRecordDialog();
});

function formValid() {
  const requiredIds = ['archivist', 'archive-date', 'place-title', 'description'];
  const requiredFilled = requiredIds.every(id => document.getElementById(id).value.trim());
  const hasLocationReference = Boolean(document.getElementById('archive-coordinate').value.trim() || document.getElementById('archive-place-reference').value.trim());
  return requiredFilled && hasLocationReference;
}
function filesValid() {
  const files = [...attachments.files];
  return files.length <= MAX_FILES && files.reduce((sum, file) => sum + file.size, 0) <= MAX_TOTAL_FILE_BYTES;
}
function fileTypesValid() {
  return [...attachments.files].every(file => ALLOWED_CLIENT_MIME_TYPES.has((file.type || '').toLowerCase()));
}

async function submitArchive(mode) {
  if (submitting) return;
  const status = document.getElementById('submit-status');
  if (!formValid()) { status.className = 'submit-status error'; status.textContent = tr('required'); return; }
  if (!filesValid()) { status.className = 'submit-status error'; status.textContent = tr('files_too_large'); return; }
  if (!fileTypesValid()) { status.className = 'submit-status error'; status.textContent = tr('unsupported_file'); return; }
  const turnstileInput = document.querySelector('[name="cf-turnstile-response"]');
  if (TURNSTILE_ENABLED && (!turnstileInput || !turnstileInput.value)) { status.className = 'submit-status error'; status.textContent = tr('human_required'); return; }

  const data = new FormData();
  data.set('mode', mode);
  data.set('submissionId', currentSubmissionId);
  data.set('website', document.getElementById('contact-website').value || '');
  data.set('archivist', document.getElementById('archivist').value.trim());
  data.set('coordinate', document.getElementById('archive-coordinate').value.trim());
  data.set('date', document.getElementById('archive-date').value);
  data.set('title', document.getElementById('place-title').value.trim());
  data.set('description', document.getElementById('description').value.trim());
  data.set('placeSearch', document.getElementById('archive-place-reference').value.trim());
  if (mode === 'admin') data.set('adminPassword', document.getElementById('admin-password').value);
  for (const file of attachments.files) data.append('attachments', file, file.name);

  const turnstile = document.querySelector('[name="cf-turnstile-response"]');
  if (turnstile) data.set('turnstileToken', turnstile.value);

  status.className = 'submit-status';
  status.textContent = tr('sending');
  setSubmittingState(true);
  try {
    const res = await fetch(SUBMISSION_ENDPOINT, { method: 'POST', body: data });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 429) throw new Error(tr('rate_limited'));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    status.className = 'submit-status success';
    status.textContent = mode === 'admin' ? tr('sent_admin') : tr('sent_visitor');
    if (mode === 'visitor') document.getElementById('admin-password').value = '';
  } catch (err) {
    console.error(err);
    status.className = 'submit-status error';
    status.textContent = `${tr('submit_failed')} ${err.message || ''}`;
  } finally {
    setSubmittingState(false);
    resetTurnstileWidget();
  }
}

document.getElementById('admin-submit').addEventListener('click', () => void submitArchive('admin'));
document.getElementById('visitor-submit').addEventListener('click', () => void submitArchive('visitor'));

const dmsPanel = document.querySelector('.dms-panel');
function syncArchiveCompactLayout() {
  const portraitPhone = window.innerWidth <= 760 && window.innerHeight >= window.innerWidth;
  if (dmsPanel && portraitPhone && !dmsPanel.dataset.mobileInitialized) {
    dmsPanel.open = false;
    dmsPanel.dataset.mobileInitialized = '1';
  }
  if (portraitPhone) setFormOpen(true);
  window.setTimeout(() => map.invalidateSize({ pan: false }), 80);
}
syncArchiveCompactLayout();
window.addEventListener('resize', syncArchiveCompactLayout, { passive: true });

applyI18n({ animate: false });
initialLanguageTimer = setTimeout(() => {
  initialLanguageTimer = null;
  switchLanguage('zh', { animate: true, updateUrl: true });
}, 800);

if (TURNSTILE_ENABLED) {
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    turnstileWidgetId = turnstile.render('#turnstile-slot', {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'light',
      size: 'flexible',
      action: TURNSTILE_ACTION,
      'refresh-expired': 'auto'
    });
  };
  document.head.appendChild(script);
}
