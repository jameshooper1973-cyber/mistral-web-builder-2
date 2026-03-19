const SYSTEM_PROMPT = `You are a creative web designer generating template ideas for a mobile webpage builder.
Return ONLY a valid JSON array. No markdown, no backticks, no explanations.
Each object must have: name, category, description, prompt, colors, style.
Categories: Business, Portfolio, Event, Restaurant, Personal, Blog, Landing Page, Band/Music, Product, Coming Soon.`;

export async function POST(request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'API key missing — add MISTRAL_API_KEY in Vercel environment variables.' }, { status: 500 });
  }

  try {
    const { count = 12 } = await request.json().catch(() => ({}));

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Generate ${count} diverse creative mobile webpage templates across all categories. Make prompts detailed. Return JSON array only.` },
        ],
        max_tokens: 3000,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      return Response.json({ error: `Mistral API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || '[]';
    text = text.replace(/^```json\n?/i, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

    let templates = [];
    try { templates = JSON.parse(text); } catch {}

    return Response.json({ templates });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
