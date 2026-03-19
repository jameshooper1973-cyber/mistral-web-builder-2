'use client';
import { useState, useEffect } from 'react';

const CAT_COLORS = {
  'Business': 'bg-blue-900 text-blue-300', 'Portfolio': 'bg-purple-900 text-purple-300',
  'Event': 'bg-yellow-900 text-yellow-300', 'Restaurant': 'bg-orange-900 text-orange-300',
  'Personal': 'bg-green-900 text-green-300', 'Blog': 'bg-pink-900 text-pink-300',
  'Landing Page': 'bg-cyan-900 text-cyan-300', 'Band/Music': 'bg-red-900 text-red-300',
  'Product': 'bg-indigo-900 text-indigo-300', 'Coming Soon': 'bg-gray-700 text-gray-300',
};
const CATS = ['All','Business','Portfolio','Event','Restaurant','Personal','Blog','Landing Page','Band/Music','Product','Coming Soon'];
const STYLE_ICONS = { 'Dark': '🖤', 'Clean': '⬜', 'Vibrant': '🎨', 'Elegant': '✨', 'Rustic': '🌿', 'Futuristic': '🚀', 'Vintage': '📻', 'Bold': '💥' };
const getIcon = (style = '') => { for (const [k, v] of Object.entries(STYLE_ICONS)) { if (style.includes(k)) return v; } return '🎨'; };

export default function TemplatesTab({ onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('All');

  const fetchTemplates = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 12 }) });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setTemplates(prev => [...prev, ...(data.templates || [])]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const filtered = filter === 'All' ? templates : templates.filter(t => t.category === filter);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 overflow-x-auto px-4 py-2 shrink-0" style={{ scrollbarWidth: 'none' }}>
        {CATS.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === cat ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-700 text-gray-400'}`}>{cat}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-3 py-2 mb-3">⚠️ {error}</div>}
        {loading && templates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="text-4xl mb-3 animate-pulse">🎨</div>
            <p className="text-sm animate-pulse">AI is designing templates...</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((t, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col hover:border-purple-700 transition-colors">
              <div className="h-24 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <span className="text-3xl">{getIcon(t.style)}</span>
              </div>
              <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full w-fit ${CAT_COLORS[t.category] || 'bg-gray-800 text-gray-400'}`}>{t.category}</span>
                <p className="text-white text-xs font-semibold leading-tight">{t.name}</p>
                <p className="text-gray-500 text-[10px] leading-tight flex-1">{t.description}</p>
                <button onClick={() => onSelectTemplate(t.prompt)} className="mt-1 w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg py-1.5 transition-colors">Use This →</button>
              </div>
            </div>
          ))}
        </div>
        <div className="py-4 flex justify-center">
          <button onClick={fetchTemplates} disabled={loading} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-xl px-6 py-2.5 disabled:opacity-50">
            {loading ? '⏳ Loading...' : '✨ Generate More Templates'}
          </button>
        </div>
      </div>
    </div>
  );
}
