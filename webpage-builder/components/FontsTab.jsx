'use client';

const FONTS = [
  { name: 'Cinzel Decorative',  cat: 'Metal / Dark',    css: "'Cinzel Decorative', serif" },
  { name: 'Metal Mania',        cat: 'Metal / Dark',    css: "'Metal Mania', cursive" },
  { name: 'Butcherman',         cat: 'Metal / Dark',    css: "'Butcherman', cursive" },
  { name: 'UnifrakturMaguntia', cat: 'Metal / Dark',    css: "'UnifrakturMaguntia', cursive" },
  { name: 'Bebas Neue',         cat: 'Bold / Impact',   css: "'Bebas Neue', sans-serif" },
  { name: 'Righteous',          cat: 'Bold / Impact',   css: "'Righteous', sans-serif" },
  { name: 'Boogaloo',           cat: 'Bold / Impact',   css: "'Boogaloo', sans-serif" },
  { name: 'Cormorant Garamond', cat: 'Elegant / Gothic',css: "'Cormorant Garamond', serif" },
  { name: 'Playfair Display',   cat: 'Elegant / Gothic',css: "'Playfair Display', serif" },
  { name: 'IM Fell English',    cat: 'Elegant / Gothic',css: "'IM Fell English', serif" },
  { name: 'Inter',              cat: 'Clean / Modern',  css: "'Inter', sans-serif" },
  { name: 'Space Grotesk',      cat: 'Clean / Modern',  css: "'Space Grotesk', sans-serif" },
  { name: 'DM Sans',            cat: 'Clean / Modern',  css: "'DM Sans', sans-serif" },
];

const PALETTES = [
  { name: 'Void Black',    preview: ['#0a0a0a','#7c3aed','#1a1a2e'] },
  { name: 'Blood Red',     preview: ['#1a0000','#dc2626','#2d0000'] },
  { name: 'Rusted Gold',   preview: ['#1c1410','#b7791f','#f5e6c8'] },
  { name: 'Frost Blue',    preview: ['#0a1628','#3b82f6','#e2f4ff'] },
  { name: 'Forest Green',  preview: ['#0a1a0a','#22c55e','#e8f5e9'] },
  { name: 'Clean White',   preview: ['#ffffff','#6366f1','#111111'] },
  { name: 'Ocean Deep',    preview: ['#0a1929','#0ea5e9','#e8f4f8'] },
  { name: 'Sunset Orange', preview: ['#1a0f00','#f97316','#fff7ed'] },
];

const CATS = ['Metal / Dark','Bold / Impact','Elegant / Gothic','Clean / Modern'];

export default function FontsTab({ selectedFont, setSelectedFont, selectedPalette, setSelectedPalette }) {
  return (
    <div className="overflow-y-auto h-full">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Font Style</h2>
        {CATS.map(cat => (
          <div key={cat} className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{cat}</p>
            <div className="flex flex-col gap-1.5">
              {FONTS.filter(f => f.cat === cat).map(font => (
                <button key={font.name} onClick={() => setSelectedFont(font.name)}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl border transition-all ${selectedFont === font.name ? 'border-purple-500 bg-purple-950' : 'border-gray-800 bg-gray-900 hover:border-gray-600'}`}>
                  <span style={{ fontFamily: font.css, fontSize: '1.1rem' }} className="text-white">Forge the Steel</span>
                  {selectedFont === font.name && <span className="text-purple-400 text-sm">✓</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-800 mx-4" />
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Color Palette</h2>
        <div className="grid grid-cols-2 gap-2">
          {PALETTES.map(p => (
            <button key={p.name} onClick={() => setSelectedPalette(p.name)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${selectedPalette === p.name ? 'border-purple-500 bg-purple-950' : 'border-gray-800 bg-gray-900 hover:border-gray-600'}`}>
              <div className="flex gap-0.5 shrink-0">
                {p.preview.map((color, i) => <div key={i} className="w-4 h-8 rounded" style={{ background: color }} />)}
              </div>
              <span className="text-xs text-gray-300 text-left leading-tight">{p.name}</span>
              {selectedPalette === p.name && <span className="text-purple-400 ml-auto text-sm">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
