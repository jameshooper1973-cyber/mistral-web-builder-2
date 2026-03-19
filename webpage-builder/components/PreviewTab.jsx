'use client';
import { useState } from 'react';

export default function PreviewTab({ generatedHTML, setGeneratedHTML, selectedFont, isGenerating, setIsGenerating, addToHistory, pageTitle }) {
  const [refineOpen, setRefineOpen]     = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [darkUI, setDarkUI]             = useState(true);
  const [error, setError]               = useState('');

  const refine = async () => {
    if (!refinePrompt.trim() || !generatedHTML) return;
    setError(''); setIsGenerating(true); setRefineOpen(false);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: refinePrompt, font: selectedFont, existingHTML: generatedHTML, isRefinement: true }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setGeneratedHTML(data.html);
      addToHistory(data.html, pageTitle || 'Refined page');
      setRefinePrompt('');
    } catch (err) { setError(`Network error: ${err.message}`); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className={`flex flex-col h-full ${darkUI ? 'bg-gray-950' : 'bg-gray-100'} transition-colors`}>
      <div className={`flex items-center justify-between px-4 py-2 border-b ${darkUI ? 'border-gray-800' : 'border-gray-200'} shrink-0`}>
        <span className={`text-xs font-medium ${darkUI ? 'text-gray-500' : 'text-gray-400'}`}>Preview</span>
        <button onClick={() => setDarkUI(d => !d)} className={`text-xs px-3 py-1 rounded-full border ${darkUI ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
          {darkUI ? '☀️ Light UI' : '🌙 Dark UI'}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-auto py-4 px-2">
        {isGenerating ? (
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-3 animate-pulse">📱</div>
            <p className="text-sm animate-pulse">Generating your page...</p>
          </div>
        ) : generatedHTML ? (
          <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-4 border-gray-700" style={{ width: 320, height: 640, background: '#000', flexShrink: 0 }}>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-10" />
            <div className="absolute inset-0 overflow-hidden rounded-[36px]">
              <iframe srcDoc={generatedHTML} className="w-full h-full border-0" title="Preview" sandbox="allow-scripts allow-same-origin" style={{ background: '#fff' }} />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <div className="text-5xl mb-3">📄</div>
            <p className="text-sm">No page generated yet</p>
            <p className="text-xs mt-1">Go to Build tab to create one</p>
          </div>
        )}
      </div>

      {error && <div className="mx-4 mb-2 bg-red-950 border border-red-800 text-red-300 text-xs rounded-lg px-3 py-2">⚠️ {error}</div>}

      {generatedHTML && !isGenerating && (
        <div className="px-4 pb-3 shrink-0">
          {refineOpen ? (
            <div className="flex gap-2">
              <input className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="What to change?" value={refinePrompt} onChange={e => setRefinePrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && refine()} autoFocus />
              <button onClick={refine} className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg px-3 py-2">Apply</button>
              <button onClick={() => setRefineOpen(false)} className="bg-gray-800 text-gray-400 rounded-lg px-3 py-2 text-sm">✕</button>
            </div>
          ) : (
            <button onClick={() => setRefineOpen(true)} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors">🔧 Refine Page</button>
          )}
        </div>
      )}
    </div>
  );
}
