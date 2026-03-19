'use client';
import { useState, useEffect } from 'react';
import BuildTab from '@/components/BuildTab';
import PreviewTab from '@/components/PreviewTab';
import TemplatesTab from '@/components/TemplatesTab';
import FontsTab from '@/components/FontsTab';
import ExportTab from '@/components/ExportTab';

const TABS = [
  { id: 'build',     label: 'Build',     icon: '🔨' },
  { id: 'preview',   label: 'Preview',   icon: '📱' },
  { id: 'templates', label: 'Templates', icon: '🎨' },
  { id: 'fonts',     label: 'Fonts',     icon: 'Aa' },
  { id: 'export',    label: 'Export',    icon: '📤' },
];

export default function Home() {
  const [activeTab, setActiveTab]             = useState('build');
  const [generatedHTML, setGeneratedHTML]     = useState('');
  const [selectedFont, setSelectedFont]       = useState('Inter');
  const [selectedPalette, setSelectedPalette] = useState('Clean White');
  const [pageTitle, setPageTitle]             = useState('');
  const [pageSlug, setPageSlug]               = useState('');
  const [images, setImages]                   = useState([]);
  const [history, setHistory]                 = useState([]);
  const [isGenerating, setIsGenerating]       = useState(false);
  const [templatePrompt, setTemplatePrompt]   = useState('');

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem('pageHistory') || '[]')); } catch {}
  }, []);

  const addToHistory = (html, title) => {
    const next = [{ html, title, timestamp: Date.now() }, ...history].slice(0, 5);
    setHistory(next);
    try { localStorage.setItem('pageHistory', JSON.stringify(next)); } catch {}
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <div className="flex-1 overflow-hidden">
        {[
          ['build',     <BuildTab key="b" generatedHTML={generatedHTML} setGeneratedHTML={setGeneratedHTML} selectedFont={selectedFont} selectedPalette={selectedPalette} pageTitle={pageTitle} setPageTitle={setPageTitle} pageSlug={pageSlug} setPageSlug={setPageSlug} images={images} setImages={setImages} isGenerating={isGenerating} setIsGenerating={setIsGenerating} addToHistory={addToHistory} onPreview={() => setActiveTab('preview')} templatePrompt={templatePrompt} clearTemplatePrompt={() => setTemplatePrompt('')} />],
          ['preview',   <PreviewTab key="p" generatedHTML={generatedHTML} setGeneratedHTML={setGeneratedHTML} selectedFont={selectedFont} isGenerating={isGenerating} setIsGenerating={setIsGenerating} addToHistory={addToHistory} pageTitle={pageTitle} />],
          ['templates', <TemplatesTab key="t" onSelectTemplate={(p) => { setTemplatePrompt(p); setActiveTab('build'); }} />],
          ['fonts',     <FontsTab key="f" selectedFont={selectedFont} setSelectedFont={setSelectedFont} selectedPalette={selectedPalette} setSelectedPalette={setSelectedPalette} />],
          ['export',    <ExportTab key="e" generatedHTML={generatedHTML} pageTitle={pageTitle} pageSlug={pageSlug} images={images} history={history} onRestoreHistory={(entry) => { setGeneratedHTML(entry.html); setPageTitle(entry.title || ''); setActiveTab('preview'); }} />],
        ].map(([id, component]) => (
          <div key={id} className={`tab-content ${activeTab === id ? '' : 'hidden'}`}>
            {component}
          </div>
        ))}
      </div>

      <nav className="flex border-t border-gray-800 bg-gray-900 shrink-0" style={{ height: 56 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${activeTab === tab.id ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}>
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
