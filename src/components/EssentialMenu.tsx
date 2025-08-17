import { useState, useRef } from 'react';
import { 
  ChevronDown, 
  Paperclip, 
  Search, 
  Mic, 
  Image, 
  Share,
  FileText,
  Download,
  MicIcon,
  MicOff
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { Textarea } from './ui/textarea';
import useStore from '../lib/state';

export default function EssentialMenu() {
  const { settings, updateSettings, exportToMarkdown, exportToPDF, addMessage } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isImageDrawerOpen, setIsImageDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachment = () => {
    fileInputRef.current?.click();
    setIsOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Selected files:', files);
  };

  const toggleWebSearch = () => {
    updateSettings({ webSearch: !settings.webSearch });
    setIsOpen(false);
  };

  const toggleVoice = () => {
    setIsRecording(!isRecording);
    updateSettings({ voice: !settings.voice });
    
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        addMessage({
          role: 'user',
          content: 'This is a simulated voice transcript: "How can I improve my JavaScript skills?"'
        });
      }, 3000);
    }
    setIsOpen(false);
  };

  const handleImageGeneration = () => {
    if (!imagePrompt.trim()) return;
    
    addMessage({
      role: 'assistant',
      content: `I've generated an image based on your prompt: "${imagePrompt}"`,
      images: ['https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=512&h=512&fit=crop']
    });
    
    setImagePrompt('');
    setIsImageDrawerOpen(false);
    setIsOpen(false);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="btn btn-secondary">
            Essential
            <ChevronDown size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2" align="end">
          <button 
            onClick={handleAttachment} 
            className="flex items-center gap-3 w-full p-3 text-sm text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <Paperclip size={16} />
            Add attachment
          </button>
          
          <button 
            onClick={toggleWebSearch} 
            className="dropdown-item"
          >
            <Search size={16} />
            <span className="flex-1">Web search</span>
            <div className="flex items-center gap-2">
              {settings.webSearch && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">ON</span>
              )}
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">beta</span>
            </div>
          </button>
          
          <button 
            onClick={toggleVoice} 
            className="dropdown-item"
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            <span className="flex-1">Voice search</span>
            {isRecording && (
              <span className="badge badge-primary text-xs animate-pulse">REC</span>
            )}
          </button>
          
          <Drawer open={isImageDrawerOpen} onOpenChange={setIsImageDrawerOpen}>
            <DrawerTrigger asChild>
              <button 
                onClick={() => setIsImageDrawerOpen(true)}
                className="dropdown-item"
              >
                <Image size={16} />
                Image generation
              </button>
            </DrawerTrigger>
            <DrawerContent className="surface">
              <DrawerHeader>
                <DrawerTitle>Generate Image</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="input-themed w-full min-h-[80px] resize-none"
                  rows={3}
                />
                <button 
                  onClick={handleImageGeneration}
                  disabled={!imagePrompt.trim()}
                  className="btn btn-primary w-full"
                >
                  Generate (stub)
                </button>
              </div>
            </DrawerContent>
          </Drawer>
          
          <div className="dropdown-separator" />
          
          <div className="relative group">
            <button className="dropdown-item">
              <Share size={16} />
              Share/Export
              <ChevronDown size={14} className="ml-auto" />
            </button>
            <div className="dropdown-submenu">
              <button onClick={exportToMarkdown} className="dropdown-item">
                <FileText size={16} />
                Markdown (.md)
              </button>
              <button onClick={exportToPDF} className="dropdown-item">
                <Download size={16} />
                PDF (.pdf)
              </button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
