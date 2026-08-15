// Cloudflare Worker for ruin-archive.site submissions
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const MAX_FILES = 5;
const MAX_TOTAL_FILE_BYTES = 8 * 1024 * 1024;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || 'https://ruin-archive.site').split(',').map(v => v.trim());
    const corsOrigin = allowed.includes(origin) ? origin : allowed[0];
    const cors = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:cors});
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/submit') {
      return json({error:'Not found'},404,cors);
    }

    try {
      const form = await request.formData();
      const mode = String(form.get('mode') || 'visitor');
      if (!['admin','visitor'].includes(mode)) return json({error:'Invalid mode'},400,cors);

      if (mode === 'admin') {
        const password = String(form.get('adminPassword') || '');
        if (!env.ADMIN_PASSWORD || !timingSafeEqual(password, env.ADMIN_PASSWORD)) {
          return json({error:'Invalid administrator password'},401,cors);
        }
      }

      if (env.TURNSTILE_SECRET) {
        const token = String(form.get('turnstileToken') || '');
        const ok = await verifyTurnstile(token, request, env.TURNSTILE_SECRET);
        if (!ok) return json({error:'Human verification failed'},403,cors);
      }

      const archive = {
        archivist: clean(form.get('archivist'),120),
        coordinate: clean(form.get('coordinate'),120),
        date: clean(form.get('date'),40),
        title: clean(form.get('title'),180),
        description: clean(form.get('description'),5000),
        placeSearch: clean(form.get('placeSearch'),300)
      };
      if (!archive.archivist || !archive.coordinate || !archive.date || !archive.title || !archive.description) {
        return json({error:'Missing required fields'},400,cors);
      }

      const files = form.getAll('attachments').filter(v => v instanceof File && v.size > 0);
      if (files.length > MAX_FILES) return json({error:'Too many attachments'},413,cors);
      const total = files.reduce((sum,f)=>sum+f.size,0);
      if (total > MAX_TOTAL_FILE_BYTES) return json({error:'Attachments exceed 8 MB'},413,cors);

      const attachments = [];
      for (const file of files) {
        attachments.push({filename:safeFilename(file.name), content:arrayBufferToBase64(await file.arrayBuffer())});
      }

      const prefix = mode === 'admin' ? '[ADMIN ARCHIVE]' : '[VISITOR SUBMISSION]';
      const subject = `${prefix} ${archive.title} · ${archive.archivist}`;
      const html = renderEmail(archive, mode, new Date().toISOString());

      const response = await fetch(RESEND_ENDPOINT, {
        method:'POST',
        headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({
          from: env.FROM_EMAIL,
          to: [env.TO_EMAIL],
          subject,
          html,
          attachments
        })
      });
      const result = await response.json().catch(()=>({}));
      if (!response.ok) return json({error:result.message || 'Email provider rejected request'},502,cors);
      return json({ok:true,id:result.id || null},200,cors);
    } catch (error) {
      console.error(error);
      return json({error:'Submission service error'},500,cors);
    }
  }
};

function json(data,status,headers) {
  return new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
}
function clean(value,max) { return String(value || '').trim().slice(0,max); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
function safeFilename(name) { return String(name || 'attachment').replace(/[\\/\0\r\n]/g,'_').slice(0,180); }
function timingSafeEqual(a,b) {
  const aa=new TextEncoder().encode(a), bb=new TextEncoder().encode(b);
  if (aa.length !== bb.length) return false;
  let diff=0; for (let i=0;i<aa.length;i++) diff |= aa[i]^bb[i]; return diff===0;
}
function arrayBufferToBase64(buffer) {
  const bytes=new Uint8Array(buffer); let binary=''; const chunk=0x8000;
  for (let i=0;i<bytes.length;i+=chunk) binary += String.fromCharCode(...bytes.subarray(i,i+chunk));
  return btoa(binary);
}
async function verifyTurnstile(token,request,secret) {
  if (!token) return false;
  const data=new FormData(); data.set('secret',secret); data.set('response',token);
  const ip=request.headers.get('CF-Connecting-IP'); if (ip) data.set('remoteip',ip);
  const res=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:data});
  const body=await res.json().catch(()=>({})); return body.success === true;
}
function renderEmail(a,mode,submittedAt) {
  const row=(k,v)=>`<tr><td style="padding:8px 12px;border:1px solid #ccc;font-weight:600;vertical-align:top">${k}</td><td style="padding:8px 12px;border:1px solid #ccc">${escapeHtml(v)}</td></tr>`;
  return `<div style="font-family:Arial,sans-serif;color:#111"><h2>${mode==='admin'?'Administrator Archive':'Visitor Submission'}</h2><table style="border-collapse:collapse;width:100%;max-width:760px">${row('Archivist',a.archivist)}${row('Coordinates',a.coordinate)}${row('Date',a.date)}${row('Place',a.title)}${row('Search reference',a.placeSearch)}${row('Description',a.description)}${row('Submitted at',submittedAt)}</table></div>`;
}
