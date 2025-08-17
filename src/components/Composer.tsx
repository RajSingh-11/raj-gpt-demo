import { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, X } from 'lucide-react';
import useStore, { type Attachment } from '../lib/state';

interface ComposerProps {
  isInitialState?: boolean;
}

export default function Composer({ isInitialState = false }: ComposerProps) {
  const { sendMessage, stopGeneration, isGenerating, settings } = useStore();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;
    
    sendMessage(message, attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: Attachment[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const newAttachments: Attachment[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const containerClasses = isInitialState 
    ? "w-full max-w-3xl mx-auto" 
    : "w-full max-w-4xl mx-auto";

  return (
    <div className={containerClasses}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
            >
              <span className="truncate max-w-32">{attachment.name}</span>
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div
          className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              settings.gameMode 
                ? "Type a game idea; builder will scaffold steps..." 
                : isInitialState
                ? "Message AKHILGPT..."
                : "Type your message..."
            }
            className={`w-full bg-transparent text-white placeholder-white/50 border-none outline-none resize-none ${
              isInitialState 
                ? 'text-lg py-6 px-6 min-h-[80px]' 
                : 'text-base py-4 px-4 min-h-[60px]'
            } max-h-[200px] pr-24`}
            disabled={isGenerating}
            rows={1}
          />
          
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <Paperclip size={18} />
            </button>
            
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-lg"
              >
                <Square size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!message.trim() && attachments.length === 0}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg"
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </form>
      
      {/* Command hint */}
      {message.startsWith('/') && (
        <div className="mt-2 text-xs text-white/50 text-center">
          Press / to toggle Personalised panel
        </div>
      )}
    </div>
  );
}