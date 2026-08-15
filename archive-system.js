// Archive submission system
const MAP_WIDTH = 4000;
const MAP_HEIGHT = 3000;
const GEO_SCALE = 1.0;
const WORLD_SCALE = 1.0;
const OFFSET_X = 0;
const OFFSET_Y = 0;
const SUBMISSION_ENDPOINT = 'https://ruin-archive-submission.lliquidcat.workers.dev/submit';
const TURNSTILE_SITE_KEY = '';
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
    "archiveDate": "2025.01"
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
  }
];

const i18n = {
  zh: {
    panel_title:'遺構館 · 檔案系統', search_place:'搜索地點', coord_convert:'坐標轉換', copy_coord:'複製至檔案系統',
    layers_title:'顯示層', layer_border:'國家邊界', layer_ocean:'海洋', layer_human:'人類居住痕跡', layer_archive:'已檔案的遺構', layer_visitors:'他人投稿地點',
    archivist:'歸檔者', coordinate:'坐標', attachment:'添加附件', place_title:'地名標題', description:'簡介', admin_archive:'歸檔', visitor_submit:'訪客投稿', place_source:'地名資料',
    search_ready:'輸入地名以查找坐標。', google_missing:'Google Places 尚未連接：請先設定 API Key。', coord_invalid:'坐標格式無效。', coord_copied:'坐標已寫入新建檔案。', required:'請完整填寫歸檔者、坐標、時間、地名與簡介。', sending:'正在傳送檔案…', sent_admin:'管理員檔案已送出。', sent_visitor:'訪客投稿已送出。', submit_failed:'投稿失敗。', files_too_large:'附件最多 5 個，總大小不超過 8 MB。'
  },
  en: {
    panel_title:'Relic Archive · Filing System', search_place:'Search Place', coord_convert:'Coordinate', copy_coord:'Copy to Filing System',
    layers_title:'Visible Layers', layer_border:'National Borders', layer_ocean:'Ocean', layer_human:'Human Settlement Traces', layer_archive:'Archived Relics', layer_visitors:'Visitor Submissions',
    archivist:'Archivist', coordinate:'Coordinates', attachment:'Add Attachment', place_title:'Place Title', description:'Description', admin_archive:'Archive', visitor_submit:'Visitor Submit', place_source:'Place data',
    search_ready:'Type a place name to resolve coordinates.', google_missing:'Google Places is not connected. Set the API key first.', coord_invalid:'Invalid coordinates.', coord_copied:'Coordinates copied to the new record.', required:'Complete archivist, coordinates, date, title and description.', sending:'Transmitting archive…', sent_admin:'Administrator archive sent.', sent_visitor:'Visitor submission sent.', submit_failed:'Submission failed.', files_too_large:'Maximum 5 attachments and 8 MB total.'
  },
  ja: {
    panel_title:'遺構館・アーカイブシステム', search_place:'地点検索', coord_convert:'座標変換', copy_coord:'アーカイブへ座標を転送',
    layers_title:'表示レイヤー', layer_border:'国境', layer_ocean:'海洋', layer_human:'人間居住の痕跡', layer_archive:'収蔵済み遺構', layer_visitors:'来訪者投稿地点',
    archivist:'記録者', coordinate:'座標', attachment:'添付追加', place_title:'地点名', description:'概要', admin_archive:'収蔵', visitor_submit:'来訪者投稿', place_source:'地点データ',
    search_ready:'地点名を入力して座標を検索。', google_missing:'Google Places が未接続です。API Key を設定してください。', coord_invalid:'座標形式が無効です。', coord_copied:'座標を新規アーカイブへ転送しました。', required:'記録者・座標・日付・地点名・概要を入力してください。', sending:'アーカイブを送信中…', sent_admin:'管理者アーカイブを送信しました。', sent_visitor:'来訪者投稿を送信しました。', submit_failed:'送信に失敗しました。', files_too_large:'添付は5件・合計8 MBまでです。'
  }
};

let currentLang = new URLSearchParams(location.search).get('lang') || 'zh';
if (!i18n[currentLang]) currentLang = 'zh';
function tr(key) { return i18n[currentLang][key] || i18n.zh[key] || key; }
function applyI18n() {
  document.documentElement.lang = currentLang === 'ja' ? 'ja' : currentLang === 'en' ? 'en' : 'zh-Hant';
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = tr(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = tr(el.dataset.i18nPlaceholder));
}
applyI18n();

function geoToSVG(lat, lng) {
  let shiftedLng = lng + 180;
  if (shiftedLng > 180) shiftedLng -= 360;
  let x = ((shiftedLng + 180) / 360 - 0.5) * GEO_SCALE + 0.5;
  let y = ((lat + 90) / 180 - 0.5) * GEO_SCALE + 0.5;
  x = (x - 0.5) * WORLD_SCALE + 0.5;
  y = (y - 0.5) * WORLD_SCALE + 0.5;
  x += OFFSET_X; y += OFFSET_Y;
  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));
  return [y * MAP_HEIGHT, x * MAP_WIDTH];
}

// Exact inverse of geoToSVG for the filing page.
function mapToGeo(y, x) {
  x = x / MAP_WIDTH; y = y / MAP_HEIGHT;
  x -= OFFSET_X; y -= OFFSET_Y;
  x = (x - 0.5) / WORLD_SCALE + 0.5;
  y = (y - 0.5) / WORLD_SCALE + 0.5;
  x = (x - 0.5) / GEO_SCALE + 0.5;
  y = (y - 0.5) / GEO_SCALE + 0.5;
  const lng = ((x + 0.5) % 1) * 360 - 180;
  return { lat: y * 180 - 90, lng };
}

function dms(value, latAxis) {
  const abs = Math.abs(value), deg = Math.floor(abs), minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat), sec = Math.floor((minFloat - min) * 60);
  const dir = latAxis ? (value >= 0 ? '◒' : '◓') : (value >= 0 ? '◑' : '◐');
  return `${deg}° ${min}′ ${sec}″ ${dir}`;
}

const map = L.map('archive-map', {
  crs: L.CRS.Simple, minZoom: -1.8, maxZoom: 8, zoomControl: false,
  attributionControl: false, inertia: true
});
const bounds = [[0,0],[MAP_HEIGHT,MAP_WIDTH]];
map.createPane('oceanArchivePane');
map.createPane('humanArchivePane');
map.createPane('borderArchivePane');
map.getPane('oceanArchivePane').style.zIndex = '180';
map.getPane('humanArchivePane').style.zIndex = '200';
map.getPane('borderArchivePane').style.zIndex = '220';
for (const paneName of ['oceanArchivePane','humanArchivePane','borderArchivePane']) {
  map.getPane(paneName).style.pointerEvents = 'none';
}
const ruinLayer = L.imageOverlay('assets/ruin-map.svg', bounds, {pane:'humanArchivePane'}).addTo(map);
ruinLayer.on('load', () => {
  const el = ruinLayer.getElement();
  if (el) el.style.filter = 'blur(0.40px) contrast(1.8) brightness(1.02) sepia(0.33)';
});
map.fitBounds(bounds);

let membraneRaf = null;
function membraneState(z = map.getZoom()) {
  if (z <= 1) return {opacity:1, filter:'blur(0.4px) contrast(1.8) brightness(1.02) sepia(0.33)', blend:'normal'};
  const r = Math.min((z - 1) / 7, 1);
  return {
    opacity: 1 - r * .45,
    filter:`blur(${.4 + r*2.3}px) contrast(${1.8-r*.8}) brightness(${1.02+r*.7}) sepia(0.33) invert(${r*.15})`,
    blend:'multiply'
  };
}
map.on('zoom', () => {
  if (membraneRaf) return;
  membraneRaf = requestAnimationFrame(() => {
    const el = ruinLayer.getElement();
    if (el) el.style.opacity = membraneState().opacity;
    membraneRaf = null;
  });
});
map.on('zoomend', () => {
  const el = ruinLayer.getElement(); if (!el) return;
  const s = membraneState(); el.style.opacity=s.opacity; el.style.filter=s.filter; el.style.mixBlendMode=s.blend;
});

const archiveMarkers = L.layerGroup().addTo(map);
const visitorMarkers = L.layerGroup();
function addExistingMarkers() {
  archiveMarkers.clearLayers();
  for (const site of EXISTING_SITES) {
    const cls = site.type === 'garden' ? 'garden-dot' : 'record-dot';
    const icon = L.divIcon({className:'archive-marker', html:`<span class="${cls}"></span>`, iconSize:[10,10], iconAnchor:[5,5]});
    L.marker(geoToSVG(site.lat, site.lng), {icon})
      .bindTooltip(`${site.name}${site.archiveDate ? ' · ' + site.archiveDate : ''}`, {className:'archive-tooltip', direction:'top', offset:[0,-4]})
      .addTo(archiveMarkers);
  }
}
addExistingMarkers();

let optionalLayers = {};
function setImageLayer(key, file, enabled) {
  if (enabled) {
    const pane = key === 'border' ? 'borderArchivePane' : 'oceanArchivePane';
    if (!optionalLayers[key]) optionalLayers[key] = L.imageOverlay(file, bounds, {interactive:false, pane});
    if (!map.hasLayer(optionalLayers[key])) optionalLayers[key].addTo(map);
  } else if (optionalLayers[key] && map.hasLayer(optionalLayers[key])) {
    map.removeLayer(optionalLayers[key]);
  }
}

document.getElementById('layer-human').addEventListener('change', e => e.target.checked ? ruinLayer.addTo(map) : map.removeLayer(ruinLayer));
document.getElementById('layer-border').addEventListener('change', e => setImageLayer('border','assets/border-map.svg',e.target.checked));
document.getElementById('layer-ocean').addEventListener('change', e => setImageLayer('ocean','assets/ocean-map.svg',e.target.checked));
document.getElementById('layer-archive').addEventListener('change', e => e.target.checked ? archiveMarkers.addTo(map) : map.removeLayer(archiveMarkers));
document.getElementById('layer-visitors').addEventListener('change', async e => {
  if (!e.target.checked) { map.removeLayer(visitorMarkers); return; }
  if (!visitorMarkers.getLayers().length) await loadVisitorSites();
  visitorMarkers.addTo(map);
});

async function loadVisitorSites() {
  try {
    const res = await fetch('assets/visitor-sites.json', {cache:'no-store'});
    if (!res.ok) return;
    const list = await res.json();
    for (const site of list) {
      if (!Number.isFinite(Number(site.lat)) || !Number.isFinite(Number(site.lng))) continue;
      const icon=L.divIcon({className:'archive-marker',html:'<span class="visitor-dot"></span>',iconSize:[10,10],iconAnchor:[5,5]});
      L.marker(geoToSVG(Number(site.lat),Number(site.lng)),{icon}).bindTooltip(site.title || site.name || 'visitor', {className:'archive-tooltip'}).addTo(visitorMarkers);
    }
  } catch (_) {}
}

const latInput = document.getElementById('coord-lat');
const lngInput = document.getElementById('coord-lng');
const coordReadout = document.getElementById('coordinate-readout');
const searchStatus = document.getElementById('search-status');
let centerRaf = null;
function syncCenterCoordinates() {
  if (centerRaf) return;
  centerRaf = requestAnimationFrame(() => {
    const c = map.getCenter();
    const geo = mapToGeo(c.lat, c.lng);
    latInput.value = geo.lat.toFixed(7);
    lngInput.value = geo.lng.toFixed(7);
    coordReadout.textContent = `${dms(geo.lat,true)} · ${dms(geo.lng,false)}`;
    centerRaf = null;
  });
}
map.on('move zoom', syncCenterCoordinates);
map.whenReady(syncCenterCoordinates);

function flyToGeo(lat,lng,zoom=4.3) {
  map.flyTo(geoToSVG(lat,lng), Math.max(map.getZoom(),zoom), {duration:1.2});
}
function readCoordInputs() {
  const lat=Number(latInput.value.trim()), lng=Number(lngInput.value.trim());
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return {lat,lng};
}
document.getElementById('locate-coordinate').addEventListener('click', () => {
  const p=readCoordInputs();
  if (!p) { searchStatus.textContent=tr('coord_invalid'); return; }
  flyToGeo(p.lat,p.lng);
});
document.getElementById('copy-coordinate').addEventListener('click', () => {
  const p=readCoordInputs();
  if (!p) { searchStatus.textContent=tr('coord_invalid'); return; }
  document.getElementById('archive-coordinate').value=`${p.lat.toFixed(7)}, ${p.lng.toFixed(7)}`;
  searchStatus.textContent=tr('coord_copied');
});

// Google Places Autocomplete Data API
let PlacesAutocompleteSuggestion = null;
let PlacesAutocompleteSessionToken = null;
let placesToken = null;
let newestSearch = 0;
window.initGooglePlaces = async function initGooglePlaces() {
  try {
    const lib = await google.maps.importLibrary('places');
    PlacesAutocompleteSuggestion = lib.AutocompleteSuggestion;
    PlacesAutocompleteSessionToken = lib.AutocompleteSessionToken;
    placesToken = new PlacesAutocompleteSessionToken();
    searchStatus.textContent = tr('search_ready');
  } catch (err) {
    console.error(err); searchStatus.textContent = tr('google_missing');
  }
};
const placeSearch = document.getElementById('place-search');
const suggestionList = document.getElementById('place-suggestions');
const googleAttribution = document.getElementById('google-attribution');
let searchTimer = null;
placeSearch.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q=placeSearch.value.trim();
  if (q.length < 3) { suggestionList.replaceChildren(); suggestionList.classList.remove('open'); googleAttribution.classList.remove('visible'); return; }
  searchTimer=setTimeout(() => void fetchPlaceSuggestions(q), 280);
});
async function fetchPlaceSuggestions(input) {
  if (!PlacesAutocompleteSuggestion) { searchStatus.textContent=tr('google_missing'); return; }
  const requestId=++newestSearch;
  if (!placesToken) placesToken = new PlacesAutocompleteSessionToken();
  try {
    const {suggestions} = await PlacesAutocompleteSuggestion.fetchAutocompleteSuggestions({input, sessionToken:placesToken, language: currentLang==='zh'?'zh-TW':currentLang==='ja'?'ja':'en'});
    if (requestId !== newestSearch) return;
    suggestionList.replaceChildren();
    for (const suggestion of suggestions.slice(0,7)) {
      if (!suggestion.placePrediction) continue;
      const button=document.createElement('button'); button.type='button'; button.textContent=suggestion.placePrediction.text.toString();
      button.addEventListener('click', () => void selectPlace(suggestion.placePrediction));
      const li=document.createElement('li'); li.appendChild(button); suggestionList.appendChild(li);
    }
    suggestionList.classList.toggle('open', suggestionList.children.length>0);
    googleAttribution.classList.toggle('visible', suggestionList.children.length>0);
  } catch (err) { console.error(err); searchStatus.textContent=tr('google_missing'); }
}
async function selectPlace(prediction) {
  try {
    const place=prediction.toPlace();
    await place.fetchFields({fields:['displayName','formattedAddress','location']});
    if (!place.location) return;
    const lat=place.location.lat(), lng=place.location.lng();
    latInput.value=lat.toFixed(7); lngInput.value=lng.toFixed(7);
    placeSearch.value=place.displayName || place.formattedAddress || prediction.text.toString();
    document.getElementById('place-title').value=place.displayName || '';
    suggestionList.replaceChildren(); suggestionList.classList.remove('open'); googleAttribution.classList.remove('visible');
    placesToken = new PlacesAutocompleteSessionToken();
    flyToGeo(lat,lng,5.2);
    searchStatus.textContent=place.formattedAddress || '';
  } catch (err) { console.error(err); searchStatus.textContent=tr('google_missing'); }
}
document.addEventListener('click', e => {
  if (!e.target.closest('.search-line')) { suggestionList.classList.remove('open'); googleAttribution.classList.remove('visible'); }
});

const attachments = document.getElementById('attachments');
const attachmentCount = document.getElementById('attachment-count');
const fileList = document.getElementById('file-list');
attachments.addEventListener('change', () => {
  const files=[...attachments.files];
  attachmentCount.textContent=String(files.length);
  fileList.textContent=files.map(f=>`${f.name} · ${(f.size/1024/1024).toFixed(2)} MB`).join(' / ');
});

document.getElementById('new-record').addEventListener('click', () => {
  document.getElementById('archive-form').reset();
  attachmentCount.textContent='0'; fileList.textContent=''; document.getElementById('submit-status').textContent='';
  document.getElementById('copy-coordinate').click();
});

function formValid() {
  const ids=['archivist','archive-coordinate','archive-date','place-title','description'];
  return ids.every(id=>document.getElementById(id).value.trim());
}
function filesValid() {
  const files=[...attachments.files];
  return files.length<=MAX_FILES && files.reduce((sum,f)=>sum+f.size,0)<=MAX_TOTAL_FILE_BYTES;
}
async function submitArchive(mode) {
  const status=document.getElementById('submit-status');
  if (!formValid()) { status.className='submit-status error'; status.textContent=tr('required'); return; }
  if (!filesValid()) { status.className='submit-status error'; status.textContent=tr('files_too_large'); return; }
  const data=new FormData();
  data.set('mode',mode);
  data.set('archivist',document.getElementById('archivist').value.trim());
  data.set('coordinate',document.getElementById('archive-coordinate').value.trim());
  data.set('date',document.getElementById('archive-date').value);
  data.set('title',document.getElementById('place-title').value.trim());
  data.set('description',document.getElementById('description').value.trim());
  data.set('placeSearch',placeSearch.value.trim());
  if (mode==='admin') data.set('adminPassword',document.getElementById('admin-password').value);
  for (const file of attachments.files) data.append('attachments',file,file.name);
  const turnstile=document.querySelector('[name="cf-turnstile-response"]');
  if (turnstile) data.set('turnstileToken',turnstile.value);
  status.className='submit-status'; status.textContent=tr('sending');
  try {
    const res=await fetch(SUBMISSION_ENDPOINT,{method:'POST',body:data});
    const body=await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
    status.className='submit-status success'; status.textContent=mode==='admin'?tr('sent_admin'):tr('sent_visitor');
    if (mode==='visitor') document.getElementById('admin-password').value='';
  } catch (err) {
    console.error(err); status.className='submit-status error'; status.textContent=`${tr('submit_failed')} ${err.message || ''}`;
  }
}
document.getElementById('admin-submit').addEventListener('click',()=>void submitArchive('admin'));
document.getElementById('visitor-submit').addEventListener('click',()=>void submitArchive('visitor'));

if (TURNSTILE_SITE_KEY) {
  const s=document.createElement('script'); s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async=true; s.defer=true;
  s.onload=()=>turnstile.render('#turnstile-slot',{sitekey:TURNSTILE_SITE_KEY,theme:'light'}); document.head.appendChild(s);
}
