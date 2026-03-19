'use client';
import { useState, useEffect, useRef } from 'react';

const PALETTES = {
  'Void Black':    { bg: '#0a0a0a', text: '#ffffff', accent: '#7c3aed', secondary: '#1a1a2e' },
  'Blood Red':     { bg: '#1a0000', text: '#ffffff', accent: '#dc2626', secondary: '#2d0000' },
  'Rusted Gold':   { bg: '#1c1410', text: '#f5e6c8', accent: '#b7791f', secondary: '#2d1f0a' },
  'Frost Blue':    { bg: '#0a1628', text: '#e2f4ff', accent: '#3b82f6', secondary: '#0f2040' },
  'Forest Green':  { bg: '#0a1a0a', text: '#e8f5e9', accent: '#22c55e', secondary: '#0f280f' },
  'Clean White':   { bg: '#ffffff', text: '#111111', accent: '#6366f1', secondary: '#f5f5f5' },
  'Ocean Deep':    { bg: '#0a1929', text: '#e8f4f8', accent: '#0ea5e9', secondary: '#0f2940' },
  'Sunset Orange': { bg: '#1a0f00', text: '#fff7ed', accent: '#f97316', secondary: '#2d1a00' },
};

const resizeImage = (file, maxWidth = 1200) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve({ base64: canvas.toDataURL('image/jpeg', 0.85), name: file.name });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function BuildTab({
  generatedHTML, setGeneratedHTML, selectedFont, selectedPalette,
  pageTitle, setPageTitle, pageSlug, setPageSlug,
  images, setImages, isGenerating, setIsGenerating,
  addToHistory, onPreview, templatePrompt, clearTemplatePrompt,
}) {
  const [prompt, setPrompt]       = useState('');
  const [error, setError]         = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const fileRef                   = useRef();

  useEffect(() => {
    if (templatePrompt) { setPrompt(templatePrompt); clearTemplatePrompt(); }
  }, [templatePrompt]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      const resized = await Promise.all(files.map(f => resizeImage(f)));
      setImages(prev => [...prev, ...resized].slice(0, 8));
    } catch { setError('Image too large or unsupported format'); }
    e.target.value = '';
  };

  const generate = async (isRefinement = false) => {
    if (!prompt.trim()) { setError('Enter a prompt first'); return; }
    setError(''); setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt, images,
          font: selectedFont,
          palette: PALETTES[selectedPalette] || PALETTES['Clean White'],
          pageTitle,
          existingHTML: isRefinement ? generatedHTML : '',
          isRefinement,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      if (generatedHTML) { setUndoStack(p => [generatedHTML, ...p].slice(0, 20)); setRedoStack([]); }
      setGeneratedHTML(data.html);
      addToHistory(data.html, pageTitle || prompt.slice(0, 40));
      onPreview();
    } catch (err) { setError(`Network error: ${err.message}`); }
    finally { setIsGenerating(false); }
  };

  const undo = () => { if (!undoStack.length) return; setRedoStack(p => [generatedHTML, ...p]); setGeneratedHTML(undoStack[0]); setUndoStack(p => p.slice(1)); };
  const redo = () => { if (!redoStack.length) return; setUndoStack(p => [generatedHTML, ...p]); setGeneratedHTML(redoStack[0]); setRedoStack(p => p.slice(1)); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex gap-2 text-xs flex-wrap">
        <span className="bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full">{selectedFont}</span>
        <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{selectedPalette}</span>
        {images.length > 0 && <span className="bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">{images.length} image{images.length > 1 ? 's' : ''}</span>}
      </div>

      <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        placeholder="Page title (e.g. My Restaurant)" value={pageTitle}
        onChange={e => { setPageTitle(e.target.value); setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }} />
      {pageSlug && <p className="text-xs text-gray-500 px-1">URL: <span className="text-purple-400">/{pageSlug}</span></p>}

      <textarea className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
        rows={4} placeholder="Describe your webpage... (e.g. A dark metal band page with hero image, tour dates, and merch cards)"
        value={prompt} onChange={e => setPrompt(e.target.value)} />

      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img.base64} alt={img.name} className="w-16 h-16 object-cover rounded-lg border border-gray-700" />
              <button onClick={() => setImages(p => p.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">×</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 transition-colors">📷 Images</button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
        <button onClick={() => generate(false)} disabled={isGenerating} className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors">
          {isGenerating ? '⏳ Generating...' : '✨ Generate'}
        </button>
      </div>

      {generatedHTML && (
        <div className="flex gap-2">
          <button onClick={() => generate(true)} disabled={isGenerating} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-purple-700 text-purple-300 text-sm rounded-lg px-3 py-2 disabled:opacity-50">🔧 Refine</button>
          <button onClick={undo} disabled={!undoStack.length || isGenerating} className="bg-gray-800 border border-gray-700 text-gray-400 text-sm rounded-lg px-3 py-2 disabled:opacity-30">↩</button>
          <button onClick={redo} disabled={!redoStack.length || isGenerating} className="bg-gray-800 border border-gray-700 text-gray-400 text-sm rounded-lg px-3 py-2 disabled:opacity-30">↪</button>
        </div>
      )}

      {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-3 py-2">⚠️ {error}</div>}
      {isGenerating && <div className="text-center text-gray-400 text-sm py-4 animate-pulse">🤖 Mistral is designing your page...</div>}

      {!generatedHTML && !isGenerating && (
        <div className="mt-2 bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs font-medium mb-2">💡 Try prompts like:</p>
          <ul className="text-gray-500 text-xs space-y-1.5">
            <li>"Dark metal band page with hero image, tour dates, merch cards"</li>
            <li>"Restaurant menu with food cards, booking CTA, dark wood theme"</li>
            <li>"Portfolio page with project gallery, bio card, contact button"</li>
            <li>"Coming soon page with countdown, email signup, dramatic background"</li>
          </ul>
        </div>
      )}
    </div>
  );
}
