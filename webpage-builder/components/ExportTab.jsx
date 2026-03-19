'use client';
import { useState } from 'react';

export default function ExportTab({ generatedHTML, pageTitle, pageSlug, images, history, onRestoreHistory }) {
  const [publishing, setPublishing]     = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [copied, setCopied]             = useState(false);
  const [error, setError]               = useState('');
  const hasPage = !!generatedHTML;

  const exportZip = async () => {
    if (!hasPage) return;
    setError('');
    try {
      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');
      const zip = new JSZip();
      zip.file('index.html', generatedHTML);
      if (images?.length) {
        const folder = zip.folder('images');
        images.forEach(img => { folder.file(img.name || 'image.jpg', img.base64.split(',')[1], { base64: true }); });
      }
      saveAs(await zip.generateAsync({ type: 'blob' }), `${pageSlug || pageTitle || 'webpage'}.zip`);
    } catch (err) { setError(`Export failed: ${err.message}`); }
  };

  const publish = async () => {
    if (!hasPage) return;
    setError(''); setPublishing(true);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: generatedHTML, slug: pageSlug || `page-${Date.now()}`, title: pageTitle }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setPublishedUrl(data.url);
    } catch (err) { setError(`Publish failed: ${err.message}`); }
    finally { setPublishing(false); }
  };

  const copyHTML = async () => {
    if (!hasPage) return;
    try { await navigator.clipboard.writeText(generatedHTML); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setError('Copy failed'); }
  };

  const share = async () => {
    if (!publishedUrl) return;
    if (navigator.share) await navigator.share({ title: pageTitle || 'My Page', url: publishedUrl });
    else { await navigator.clipboard.writeText(publishedUrl); alert('URL copied!'); }
  };

  const fmt = ts => new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const Card = ({ icon, title, desc, label, disabled, onClick, success, extra }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          {extra}
        </div>
      </div>
      <button onClick={onClick} disabled={disabled} className={`mt-3 w-full text-sm font-medium rounded-lg py-2 transition-colors ${success ? 'bg-green-700 text-green-200' : disabled ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>
        {label}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {!hasPage && <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center text-gray-500 text-sm">Generate a page first in the Build tab</div>}
      {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-3 py-2">⚠️ {error}</div>}

      <Card icon="📦" title="Export ZIP" desc="Download HTML + images as a ZIP file" label="Download ZIP" disabled={!hasPage} onClick={exportZip} />

      <Card icon="🌐" title="Publish to Web" desc="Get a live URL on your Vercel domain"
        label={publishing ? 'Publishing...' : 'Publish Now'} disabled={!hasPage || publishing} onClick={publish}
        extra={publishedUrl && (
          <div className="mt-2 flex flex-col gap-2">
            <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 text-xs underline break-all">{publishedUrl}</a>
            <button onClick={share} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg px-3 py-1.5 w-fit">📤 Share</button>
          </div>
        )}
      />

      <Card icon="📋" title="Copy HTML" desc="Copy raw HTML to clipboard" label={copied ? '✓ Copied!' : 'Copy HTML'} disabled={!hasPage} onClick={copyHTML} success={copied} />

      {history.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">📂 History</h3>
          <div className="flex flex-col gap-2">
            {history.map((entry, i) => (
              <button key={i} onClick={() => onRestoreHistory(entry)} className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors text-left">
                <div>
                  <p className="text-white text-xs font-medium">{entry.title || 'Untitled'}</p>
                  <p className="text-gray-500 text-[10px]">{fmt(entry.timestamp)}</p>
                </div>
                <span className="text-gray-500 text-xs">Restore →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
