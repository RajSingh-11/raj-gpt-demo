import { useEffect, useState } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import Composer from './components/Composer';
import PersonalisedPanel from './components/PersonalisedPanel';
import QuickPrompts from './components/QuickPrompts';
import AuthModal from './components/AuthModal';
import { applyTheme, loadGoogleFonts, getStoredTheme } from './lib/themes';
import useStore from './lib/state';
import { useAuth } from './hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { settings, updateSettings, messages } = useStore();
  const { user, loading } = useAuth();
  const { setUserId, syncWithSupabase } = useStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    // Load Google Fonts
    loadGoogleFonts();

    // Keyboard shortcuts
    const handleKeydown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus composer
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const textarea = document.querySelector('textarea');
        textarea?.focus();
      }
      
      // T to cycle themes
      if (e.key === 'T' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const themes = ['ironMan', 'hulk', 'captainAmerica', 'spiderMan', 'blackPanther', 'doctorStrange', 'thor'];
        const currentIndex = themes.indexOf(settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex] as any;
        updateSettings({ theme: nextTheme });
        applyTheme(nextTheme);
      }
      
      // / to toggle personalised panel
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.tagName !== 'TEXTAREA' && activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          updateSettings({ personalisedPanelOpen: !settings.personalisedPanelOpen });
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [settings.theme, settings.personalisedPanelOpen, updateSettings]);

  // Handle authentication state changes
  useEffect(() => {
    if (user) {
      setUserId(user.id);
      syncWithSupabase();
    } else {
      setUserId(null);
      // Apply stored theme for unauthenticated users
      const storedTheme = getStoredTheme();
      updateSettings({ theme: storedTheme });
      applyTheme(storedTheme);
    }
  }, [user, setUserId, syncWithSupabase, updateSettings]);

  // Show auth modal if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [loading, user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Loader2 className="animate-spin text-white" size={24} />
          </div>
          <p className="text-white/70 text-lg">Loading the app...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${getComputedStyle(document.documentElement).getPropertyValue('--theme-background')} 0%, #1A1F26 100%)` }}>
          <div className="text-center max-w-md mx-auto px-6">
            <div className="avatar avatar-xl mx-auto mb-6 shadow-2xl">
              <span className="text-3xl font-bold text-white">A</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gradient">Welcome to AKHILGPT</h1>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(238, 242, 246, 0.7)' }}>
              Your personal AI assistant with Marvel-inspired themes and advanced capabilities.
            </p>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  if (!hasMessages) {
    // Initial state - centered layout like ChatGPT
    return (
      <div className="min-h-screen" style={{ background: `var(--theme-background)` }}>
        <Header />
        
        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-4xl mx-auto">
            <QuickPrompts />
            
            <div className="mt-12 space-y-6">
              <div className="max-w-2xl mx-auto">
                <Composer isInitialState={true} />
              </div>
              <PersonalisedPanel />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Conversational state - standard chat layout
  return (
    <div className="min-h-screen" style={{ background: `var(--theme-background)` }}>
      <Header />
      
      <main className="flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 overflow-y-auto">
          <ChatInterface />
        </div>
        
        <div className="glass border-t p-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="max-w-4xl mx-auto space-y-4">
            <Composer />
            <PersonalisedPanel />
          </div>
        </div>
      </main>
    </div>
  );
}