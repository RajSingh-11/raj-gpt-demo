import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import QuickPrompts from './QuickPrompts';
import useStore from '../lib/state';

export default function ChatInterface() {
  const { messages } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4">
        {messages.length === 0 ? (
          <QuickPrompts />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <ChatBubble message={message} />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}