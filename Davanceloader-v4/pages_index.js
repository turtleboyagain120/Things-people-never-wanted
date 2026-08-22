import { useState, useEffect, useRef } from 'react';
import LicenseGate from '../components/LicenseGate';
import UrlChecker from '../components/UrlChecker';

export default function Home() {
  const [isLicensed, setIsLicensed] = useState(false);
  const [status, setStatus] = useState('Awaiting License Agreement');
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const allFeatures = [
      { id: 1, name: 'Model Downloader' },
      { id: 2, name: 'GPU Monitor' },
      { id: 3, name: 'Chat History' },
      { id: 4, name: 'Dark Mode' },
      { id: 5, name: 'Token Counter' },
      { id: 6, name: 'Model Selection' },
      { id: 7, name: 'Context Viewer' },
      { id: 8, name: 'Prompt Builder' },
      { id: 9, name: 'Response Analyzer' },
      { id: 10, name: 'Inference Timer' },
      { id: 11, name: 'Batch Processing' },
      { id: 12, name: 'Stream Output' },
      { id: 13, name: 'Code Highlighter' },
      { id: 14, name: 'Markdown Renderer' },
      { id: 15, name: 'Export Chat' },
      { id: 16, name: 'Import Chat' },
      { id: 17, name: 'Search History' },
      { id: 18, name: 'Favorite Models' },
      { id: 19, name: 'Model Compare' },
      { id: 20, name: 'Temperature Slider' },
      { id: 21, name: 'Top-p Selector' },
      { id: 22, name: 'Max Tokens Input' },
      { id: 23, name: 'Stop Sequences' },
      { id: 24, name: 'Frequency Penalty' },
      { id: 25, name: 'Presence Penalty' },
      { id: 26, name: 'Logit Bias Editor' },
      { id: 27, name: 'Seed Control' },
      { id: 28, name: 'System Prompt Editor' },
      { id: 29, name: 'User Template' },
      { id: 30, name: 'API Key Manager' },
      { id: 31, name: 'Endpoint Config' },
      { id: 32, name: 'Rate Limiter' },
      { id: 33, name: 'Cache Manager' },
      { id: 34, name: 'Token Usage Stats' },
      { id: 35, name: 'Session Manager' },
      { id: 36, name: 'Multi-turn Chats' },
      { id: 37, name: 'Branching Chats' },
      { id: 38, name: 'Prompt Templates' },
      { id: 39, name: 'Snippet Saver' },
      { id: 40, name: 'Keyboard Shortcuts' },
      { id: 41, name: 'Auto-save' },
      { id: 42, name: 'Undo/Redo' },
    ];
    setFeatures(allFeatures);
  }, []);

  const handleLicenseAgreed = () => {
    setIsLicensed(true);
    setStatus('License Accepted - Initializing...');
  };

  if (!isLicensed) {
    return <LicenseGate onAgreed={handleLicenseAgreed} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            MirrorNet System
          </h1>
          <div className="flex items-center space-x-4">
            <div className={`h-3 w-3 rounded-full ${status.includes('Connected') ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-gray-300">{status}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <UrlChecker onStatusChange={setStatus} />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              style={{ willChange: 'transform' }}
            >
              <h3 className="font-semibold text-lg">{feature.name}</h3>
              <p className="text-sm text-gray-400 mt-2">Feature #{feature.id}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}