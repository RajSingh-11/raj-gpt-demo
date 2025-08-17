import { supabase } from './supabase';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferences: any;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  persona: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: any;
  created_at: string;
  attachments?: Attachment[];
  media?: Media[];
}

export interface Attachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

export interface Media {
  id: string;
  message_id: string;
  media_type: 'image' | 'audio' | 'video';
  file_name: string;
  storage_path: string;
  metadata: any;
  created_at: string;
}

// Conversation operations
export const createConversation = async (title: string, persona?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('conversations')
    .insert([{
      user_id: user.id,
      title,
      persona,
      settings: {},
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
};

export const getConversations = async () => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages (
        id,
        role,
        content,
        metadata,
        created_at,
        attachments (*),
        media (*)
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as Conversation[];
};

export const getConversation = async (id: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages (
        id,
        role,
        content,
        metadata,
        created_at,
        attachments (*),
        media (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Conversation;
};

export const updateConversation = async (id: string, updates: Partial<Conversation>) => {
  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
};

export const deleteConversation = async (id: string) => {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Message operations
export const createMessage = async (
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata: any = {}
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      role,
      content,
      metadata,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Message;
};

export const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      attachments(*),
      media(*)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

// File upload operations
export const uploadFile = async (
  bucket: 'attachments' | 'media',
  file: File,
  userId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) throw error;
  return fileName;
};

export const getFileUrl = async (bucket: 'attachments' | 'media', path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

// Create attachment record
export const createAttachment = async (
  messageId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  storagePath: string
) => {
  const { data, error } = await supabase
    .from('attachments')
    .insert([{
      message_id: messageId,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      storage_path: storagePath,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Attachment;
};

// Create media record
export const createMedia = async (
  messageId: string,
  mediaType: 'image' | 'audio' | 'video',
  fileName: string,
  storagePath: string,
  metadata: any = {}
) => {
  const { data, error } = await supabase
    .from('media')
    .insert([{
      message_id: messageId,
      media_type: mediaType,
      file_name: fileName,
      storage_path: storagePath,
      metadata,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Media;
};

// Conversation management with proper data persistence
export const saveConversationWithMessages = async (
  title: string,
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: any;
  }>,
  persona?: string
) => {
  try {
    // Create conversation
    const conversation = await createConversation(title, persona);
    
    // Save all messages
    const savedMessages = [];
    for (const message of messages) {
      const savedMessage = await createMessage(
        conversation.id,
        message.role,
        message.content,
        message.metadata || {}
      );
      savedMessages.push(savedMessage);
    }
    
    return {
      conversation,
      messages: savedMessages
    };
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
};

// Load user's conversation history
export const loadUserConversations = async () => {
  try {
    const conversations = await getConversations();
    return conversations;
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
};