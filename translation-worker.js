const ALLOWED_ORIGINS = new Set([
  'https://ruin-archive.site',
  'https://www.ruin-archive.site',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:8000',
  'http://localhost:8000'
]);

const MAX_TEXT_CHARS = 6000;
const SUPPORTED = new Set(['zh', 'en', 'ja']);

function corsHeaders(origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin',
    'Cache-Control': 'no-store'
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin)
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      if (!ALLOWED_ORIGINS.has(origin)) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin'
        }
      });
    }

    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, origin);
    }
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json({ error: 'origin_not_allowed' }, 403, origin);
    }
    if (!env.AI) {
      return json({ error: 'ai_binding_missing' }, 500, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400, origin);
    }

    const text = String(body?.text || '').trim();
    const source_lang = String(body?.source_lang || 'zh').toLowerCase();
    const target_lang = String(body?.target_lang || 'en').toLowerCase();

    if (!text) {
      return json({ error: 'empty_text' }, 400, origin);
    }
    if (text.length > MAX_TEXT_CHARS) {
      return json({ error: 'text_too_long' }, 413, origin);
    }
    if (!SUPPORTED.has(source_lang) || !SUPPORTED.has(target_lang)) {
      return json({ error: 'unsupported_language' }, 400, origin);
    }
    if (source_lang === target_lang) {
      return json({ translated_text: text }, 200, origin);
    }

    try {
      const result = await env.AI.run('@cf/meta/m2m100-1.2b', {
        text,
        source_lang,
        target_lang
      });

      const translated = typeof result === 'string'
        ? result
        : result?.translated_text ??
          result?.translation ??
          result?.response ??
          result?.result ??
          '';

      if (!translated) {
        console.log('Unexpected Workers AI response:', JSON.stringify(result));
        return json({ error: 'empty_model_response' }, 502, origin);
      }

      return json({ translated_text: String(translated) }, 200, origin);
    } catch (error) {
      console.error('Workers AI translation failed:', error);
      return json({ error: 'translation_failed' }, 502, origin);
    }
  }
};
