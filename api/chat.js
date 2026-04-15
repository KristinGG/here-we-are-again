export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { messages, model, reasoning } = await req.json();
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = { model, messages, max_tokens: 5000, stream: true };
  if (reasoning) {
    body.reasoning = { effort: 'medium' };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://here-we-are-again.vercel.app',
        'X-Title': 'Here We Are Again',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: `API returned ${response.status}` }), {
        status: 502, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to connect to API' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
