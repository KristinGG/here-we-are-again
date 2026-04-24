export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: `API returned ${response.status}: ${err}` });
    }

    const data = await response.json();
    const imageData = data.data && data.data[0];
    if (!imageData) {
      return res.status(500).json({ error: 'No image in response' });
    }

    if (imageData.url) {
      return res.json({ url: imageData.url });
    } else if (imageData.b64_json) {
      return res.json({ url: `data:image/png;base64,${imageData.b64_json}` });
    } else {
      return res.status(500).json({ error: 'Unexpected response format' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate image: ' + err.message });
  }
}
