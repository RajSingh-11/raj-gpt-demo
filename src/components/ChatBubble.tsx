import { useState } from 'react';
import { Copy, Check, User, Bot, ExternalLink, Globe } from 'lucide-react';
import type { Message } from '../lib/state';

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';
  const formattedTime = message.timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex gap-4 mb-8 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
          : 'bg-gradient-to-r from-emerald-500 to-teal-600'
      }`}>
        {isUser ? (
          <User size={18} className="text-white" />
        ) : (
          <Bot size={18} className="text-white" />
        )}
      </div>
      
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        {/* Persona badge for assistant */}
        {!isUser && message.persona && (
          <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30 mb-2">
            {message.persona}
          </div>
        )}
        
        <div className={`relative inline-block max-w-full p-4 rounded-2xl shadow-lg ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto' 
            : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white'
        } ${message.isTyping ? 'animate-pulse' : ''}`}>
          {/* Message content */}
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
            {message.isTyping && (
              <div className="inline-flex ml-2 items-center gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id} className="px-2 py-1 bg-white/20 rounded-lg text-xs">
                  {attachment.name}
                </div>
              ))}
            </div>
          )}
          
          {/* Generated images */}
          {message.images && message.images.length > 0 && (
            <div className="mt-3 grid gap-2">
              {message.images.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt="Generated image"
                  className="rounded-xl max-w-full h-auto shadow-lg"
                />
              ))}
            </div>
          )}
          
          {/* Copy button */}
          {!isUser && !message.isTyping && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/20 text-white/70 hover:text-white hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
        </div>
        
        {/* Source citations */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.sources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-full text-blue-400 hover:text-blue-300 text-xs font-medium transition-all duration-200 group/source"
              >
                <Globe size={12} />
                <span className="max-w-32 truncate">{source.title}</span>
                <ExternalLink size={10} className="opacity-60 group-hover/source:opacity-100" />
              </a>
            ))}
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs text-white/50 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
}