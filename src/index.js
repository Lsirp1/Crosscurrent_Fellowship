// Sharing Time — Prayer Requests
// A tiny Worker that serves the static app and stores its one JSON blob
// of data (people + requests) in a Workers KV namespace.

const DATA_KEY = 'prayer-requests';
const EMPTY_STATE = JSON.stringify({ people: [], requests: [] });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/data') {
      if (request.method === 'GET') {
        const value = await env.PRAYER_KV.get(DATA_KEY);
        return new Response(value || EMPTY_STATE, {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (request.method === 'POST') {
        const body = await request.text();
        try {
          JSON.parse(body); // just validate it's real JSON before storing it
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        await env.PRAYER_KV.put(DATA_KEY, body);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response('Method not allowed', { status: 405 });
    }

    // Everything else falls through to the static app (public/index.html, etc.)
    return env.ASSETS.fetch(request);
  }
};
