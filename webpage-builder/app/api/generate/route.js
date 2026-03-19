const SYSTEM_PROMPT = `You are an expert mobile webpage designer and developer.
Generate complete, beautiful, self-contained HTML pages for mobile devices.

STRICT RULES:
- Return ONLY the raw HTML document. No markdown. No backticks. No explanations.
- Start with <!DOCTYPE html> and end with </html>
- Include ALL CSS inside a <style> tag in <head>. No external CSS files.
- Mobile-first design, max-width 420px centered on desktop.
- For user images use: <img src="images/FILENAME" alt="description"> — relative paths only.
- NEVER use base64 images or external image URLs in the final output HTML.
- Include viewport meta tag.
- Use smooth CSS animations and transitions.
- Use modern card-based layouts.
- Look professionally designed, not generic.
- Support: hero cards, content cards, carousels/sliders, CTA buttons, nav headers.
- All sliders must work with pure CSS or minimal vanilla JS only.`;

export async function POST(request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'API key missing — add MISTRAL_API_KEY in Vercel Project Settings > Environment Variables.' },
      { status: 500 }
    );
  }

  try {
    const { prompt, images = [], font = 'Inter', palette, pageTitle = '', existingHTML = '', isRefinement = false } = await request.json();

    const paletteStr = palette
      ? `Color palette: bg=${palette.bg}, text=${palette.text}, accent=${palette.accent}`
      : 'Clean white background, dark text, purple accent';

    const fontStr = `Primary font: "${font}" — include Google Fonts @import for this font.`;

    let userContent;
    if (isRefinement && existingHTML) {
      userContent = [{ type: 'text', text: `You generated this webpage:\n\n${existingHTML}\n\nModify it: "${prompt}"\n\n${paletteStr}\n${fontStr}\n\nReturn the complete updated HTML only.` }];
    } else {
      userContent = [{ type: 'text', text: `Create a mobile webpage: "${prompt}"\nPage title: "${pageTitle || prompt}"\n${paletteStr}\n${fontStr}\n${images.length > 0 ? `User uploaded ${images.length} image(s): ${images.map(i => i.name).join(', ')}. Reference as <img src="images/FILENAME">.` : ''}\n\nGenerate the complete HTML now.` }];
      if (images.length > 0) {
        images.forEach(img => userContent.push({ type: 'image_url', image_url: { url: img.base64 } }));
      }
    }

    const model = images.length > 0 && !isRefinement ? 'pixtral-large-latest' : 'mistral-large-latest';

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userContent }],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `Mistral API error ${response.status}: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    let html = data.choices?.[0]?.message?.content || '';
    html = html.replace(/^```html\n?/i, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

    if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
      return Response.json({ error: 'Generation failed — try rephrasing your prompt.' }, { status: 500 });
    }

    return Response.json({ html });
  } catch (err) {
    return Response.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}
