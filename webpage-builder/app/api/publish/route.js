import { put } from '@vercel/blob';

export async function POST(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: 'Blob storage not set up — go to Vercel project > Storage tab > Create a Blob Store. The token is added automatically.' },
      { status: 500 }
    );
  }

  try {
    const { html, slug, title } = await request.json();
    if (!html) return Response.json({ error: 'No HTML to publish' }, { status: 400 });

    const cleanSlug = (slug || `page-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Store page data as JSON in Vercel Blob
    const pageData = JSON.stringify({ html, title: title || cleanSlug, publishedAt: new Date().toISOString() });

    const blob = await put(`pages/${cleanSlug}.json`, pageData, {
      access: 'public',
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}`;
    const pageUrl = `${appUrl}/p/${cleanSlug}`;

    return Response.json({ url: pageUrl, slug: cleanSlug, blobUrl: blob.url });
  } catch (err) {
    return Response.json({ error: `Publish failed: ${err.message}` }, { status: 500 });
  }
}
