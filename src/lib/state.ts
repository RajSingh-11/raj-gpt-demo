import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyTheme, type ThemeKey } from './themes';
import { supabase, saveMessage, saveUserSettings } from './supabase';
import { createConversation, createMessage, loadUserConversations, type Conversation } from './database';
import { callOpenAI, streamOpenAI, callOpenAIWithWebSearch, type OpenAIMessage, type SourceCitation } from './openai';

export type Persona = 'Maths Tutor' | 'Test Cases Generator' | 'Finance Analyst' | 'Cybersecure Specialist';
export type MusicTool = 'ElevenLabs' | 'Suno';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  images?: string[];
  persona?: Persona;
  isTyping?: boolean;
  sources?: SourceCitation[];
}

export interface Settings {
  webSearch: boolean;
  voice: boolean;
  persona?: Persona;
  music?: MusicTool;
  gameMode: boolean;
  languages: string[];
  theme: ThemeKey;
  personalisedPanelOpen: boolean;
}

interface Store {
  settings: Settings;
  messages: Message[];
  conversations: Conversation[];
  currentConversationId: string | null;
  isGenerating: boolean;
  currentTypingId: string | null;
  userId: string | null;
  
  // Actions
  updateSettings: (updates: Partial<Settings>) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  sendMessage: (content: string, attachments?: Attachment[]) => void;
  stopGeneration: () => void;
  clearChat: () => void;
  createNewConversation: () => void;
  loadConversations: () => void;
  switchConversation: (conversationId: string) => void;
  exportToMarkdown: () => void;
  exportToPDF: () => void;
  setUserId: (userId: string | null) => void;
  syncWithSupabase: () => void;
}

const useStore = create<Store>()(
  persist(
    (set, get) => ({
      settings: {
        webSearch: false,
        voice: false,
        gameMode: false,
        languages: ['EN'],
        theme: 'ironMan',
        personalisedPanelOpen: true,
      },
      messages: [],
      conversations: [],
      currentConversationId: null,
      isGenerating: false,
      currentTypingId: null,
      userId: null,

      updateSettings: async (updates) => {
        const state = get();
        const newSettings = { ...get().settings, ...updates };
        set({ settings: newSettings });
        
        // Only sync with Supabase if user is authenticated
        if (state.userId) {
          try {
            await saveUserSettings({
              user_id: state.userId,
              web_search: newSettings.webSearch,
              voice: newSettings.voice,
              persona: newSettings.persona,
              music: newSettings.music,
              game_mode: newSettings.gameMode,
              languages: newSettings.languages,
              theme: newSettings.theme,
              personalised_panel_open: newSettings.personalisedPanelOpen,
            });
          } catch (error) {
            console.error('Failed to sync settings:', error);
            // Continue without throwing to prevent UI blocking
          }
        }
      },

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: Date.now().toString(),
              timestamp: new Date(),
            },
          ],
        })),

      sendMessage: async (content, attachments) => {
        const state = get();
        
        // Create new conversation if none exists
        let conversationId = state.currentConversationId;
        if (!conversationId && state.userId) {
          try {
            const conversation = await createConversation(
              content.slice(0, 50) + (content.length > 50 ? '...' : ''),
              state.settings.persona
            );
            conversationId = conversation.id;
            set({ currentConversationId: conversationId });
          } catch (error) {
            console.error('Failed to create conversation:', error);
          }
        }
        
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date(),
          attachments,
        };

        // Add assistant message with typing
        const assistantId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          persona: state.settings.persona,
          isTyping: true,
        };

        set((state) => ({
          messages: [...state.messages, userMessage, assistantMessage],
          isGenerating: true,
          currentTypingId: assistantId,
        }));

        // Only save to Supabase if user is authenticated
        if (state.userId) {
          try {
            if (conversationId) {
              await createMessage(conversationId, 'user', content, {
                attachments: attachments || [],
                persona: state.settings.persona
              });
            }
          } catch (error) {
            console.error('Failed to save user message:', error);
            // Continue without throwing to prevent chat blocking
          }
        }

        // Call OpenAI API for response
        try {
          let fullResponse = '';
          let sources: SourceCitation[] = [];

          if (state.settings.webSearch) {
            // Use web search API
            const webSearchResult = await callOpenAIWithWebSearch(content);
            fullResponse = webSearchResult.content;
            sources = webSearchResult.sources;

            // Update message with final content and sources
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: fullResponse, sources, isTyping: false }
                  : msg
              ),
              isGenerating: false,
              currentTypingId: null,
            }));
          } else {
            // Use regular chat API
            const messages: OpenAIMessage[] = [
              ...state.messages.slice(-10).map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
              })),
              { role: 'user', content }
            ];

            // Add system message if persona is selected
            if (state.settings.persona) {
              messages.unshift({
                role: 'system',
                content: `You are a ${state.settings.persona}. Respond accordingly to your role.`
              });
            }
            
            await streamOpenAI(
              messages,
              (chunk) => {
                fullResponse += chunk;
                set((state) => ({
                  messages: state.messages.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: fullResponse, isTyping: true }
                      : msg
                  ),
                }));
              }
            );

            // Mark as complete
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: fullResponse, isTyping: false }
                  : msg
              ),
              isGenerating: false,
              currentTypingId: null,
            }));
          }

          // Save final assistant message to Supabase
          if (state.userId && conversationId) {
            try {
              await createMessage(conversationId, 'assistant', fullResponse, {
                persona: state.settings.persona,
                sources
              });
            } catch (error) {
              console.error('Failed to save assistant message:', error);
              // Continue without throwing to prevent chat blocking
            }
          }
        } catch (error) {
          console.error('OpenAI API error:', error);
          
          // Show error message
          const errorMessage = error instanceof Error ? error.message : 'Failed to get response from AI';
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === assistantId
                ? { 
                    ...msg, 
                    content: `Sorry, I encountered an error: ${errorMessage}`, 
                    isTyping: false 
                  }
                : msg
            ),
            isGenerating: false,
            currentTypingId: null,
          }));
        }
      },

      stopGeneration: () =>
        set((state) => ({
          isGenerating: false,
          currentTypingId: null,
          messages: state.messages.map((msg) =>
            msg.isTyping ? { ...msg, isTyping: false } : msg
          ),
        })),

      clearChat: () =>
        set({
          messages: [],
          currentConversationId: null,
          isGenerating: false,
          currentTypingId: null,
        }),

      createNewConversation: () => {
        set({
          messages: [],
          currentConversationId: null,
          isGenerating: false,
          currentTypingId: null,
        });
      },

      loadConversations: async () => {
        const state = get();
        if (!state.userId) return;

        try {
          const conversations = await loadUserConversations();
          set({ conversations });
        } catch (error) {
          console.error('Failed to load conversations:', error);
        }
      },

      switchConversation: async (conversationId: string) => {
        const state = get();
        const conversation = state.conversations.find(c => c.id === conversationId);
        
        if (conversation && conversation.messages) {
          const messages: Message[] = conversation.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
            persona: msg.metadata?.persona,
            attachments: msg.attachments || [],
            images: msg.media?.filter((m: any) => m.media_type === 'image').map((m: any) => m.storage_path) || []
          }));
          
          set({
            currentConversationId: conversationId,
            messages,
            isGenerating: false,
            currentTypingId: null,
          });
        }
      },

      exportToMarkdown: () => {
        const { messages } = get();
        const markdown = messages
          .map((msg) => {
            const role = msg.role === 'user' ? 'You' : 'AKHILGPT';
            const timestamp = msg.timestamp.toLocaleString();
            return `## ${role} - ${timestamp}\n\n${msg.content}\n`;
          })
          .join('\n');

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `akhilgpt-chat-${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
      },

      exportToPDF: () => {
        const { messages } = get();
        const content = messages
          .map((msg) => {
            const role = msg.role === 'user' ? 'You' : 'AKHILGPT';
            const timestamp = msg.timestamp.toLocaleString();
            return `${role} - ${timestamp}\n\n${msg.content}\n\n`;
          })
          .join('\n');

        // Create a simple text-based "PDF" (actually a text file with PDF extension)
        const blob = new Blob([`AKHILGPT Chat Export\n\n${content}`], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `akhilgpt-chat-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },

      setUserId: (userId) => set({ userId }),

      syncWithSupabase: async () => {
        const state = get();
        if (!state.userId) return;

        try {
          // Load user settings from Supabase
          const { data: userSettings } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', state.userId)
            .single();

          if (userSettings) {
            // Apply settings from Supabase
            const settings: Settings = {
              webSearch: userSettings.web_search,
              voice: userSettings.voice,
              persona: userSettings.persona,
              music: userSettings.music,
              gameMode: userSettings.game_mode,
              languages: userSettings.languages,
              theme: userSettings.theme,
              personalisedPanelOpen: userSettings.personalised_panel_open,
            };
            set({ settings });
          } else {
            // Create default settings for new user
            const defaultSettings = get().settings;
            await saveUserSettings({
              user_id: state.userId,
              web_search: defaultSettings.webSearch,
              voice: defaultSettings.voice,
              persona: defaultSettings.persona,
              music: defaultSettings.music,
              game_mode: defaultSettings.gameMode,
              languages: defaultSettings.languages,
              theme: defaultSettings.theme,
              personalised_panel_open: defaultSettings.personalisedPanelOpen,
            });
          }

          // Load conversations and messages from Supabase
          const conversations = await loadUserConversations();
          set({ conversations });
          
          // Load the most recent conversation
          if (conversations.length > 0) {
            const latestConversation = conversations[0];
            get().switchConversation(latestConversation.id);
          }
        } catch (error) {
          console.error('Failed to sync with Supabase:', error);
        }
      },
    }),
    {
      name: 'akhilgpt-store',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

export default useStore;