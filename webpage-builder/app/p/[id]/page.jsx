export const dynamic = 'force-dynamic';

export default async function PublishedPage({ params }) {
  const blobBase = process.env.BLOB_READ_WRITE_TOKEN
    ? `https://blob.vercel-storage.com`
    : null;

  // We store pages in Vercel Blob — fetch the JSON by constructing the URL
  // The actual URL is stored when we publish, so we use the API to look it up
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({
      prefix: `pages/${params.id}.json`,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blobs.length) {
      return notFound();
    }

    const res = await fetch(blobs[0].url);
    const { html } = await res.json();

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const headMatch = html.match(/<head[^>]*>([\s\S]*)<\/head>/i);

    return (
      <html>
        <head dangerouslySetInnerHTML={{ __html: headMatch ? headMatch[1] : '' }} />
        <body dangerouslySetInnerHTML={{ __html: bodyMatch ? bodyMatch[1] : html }} />
      </html>
    );
  } catch (err) {
    return (
      <html>
        <head><title>Error</title></head>
        <body style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '4rem', background: '#0a0a0a', color: '#fff' }}>
          <h1>Error loading page</h1>
          <p style={{ color: '#aaa', marginTop: '1rem' }}>{err.message}</p>
        </body>
      </html>
    );
  }
}

function notFound() {
  return (
    <html>
      <head><title>Not Found</title></head>
      <body style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '4rem', background: '#0a0a0a', color: '#fff' }}>
        <h1 style={{ fontSize: '2rem' }}>404</h1>
        <p style={{ color: '#aaa', marginTop: '1rem' }}>Page not found.</p>
      </body>
    </html>
  );
}
