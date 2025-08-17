// OpenAI API integration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SourceCitation {
  url: string;
  title: string;
  start_index: number;
  end_index: number;
}

export interface WebSearchResponse {
  content: string;
  sources: SourceCitation[];
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Web search with OpenAI
export async function callOpenAIWithWebSearch(
  input: string,
  model: string = 'gpt-5'
): Promise<WebSearchResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        tools: [{ type: "web_search_preview" }],
        input,
      }),
    });

    if (!response.ok) {
      // Fallback to regular chat if web search API is not available
      console.warn('Web search API not available, falling back to regular chat');
      const fallbackResponse = await callOpenAI([{ role: 'user', content: input }], model);
      return {
        content: fallbackResponse,
        sources: []
      };
    }

    const data = await response.json();
    
    // Find the message response
    const messageResponse = data.find((item: any) => item.type === 'message');
    if (!messageResponse || !messageResponse.content) {
      throw new Error('No message content in web search response');
    }

    const content = messageResponse.content[0];
    const sources: SourceCitation[] = content.annotations
      ?.filter((annotation: any) => annotation.type === 'url_citation')
      ?.map((annotation: any) => ({
        url: annotation.url,
        title: annotation.title,
        start_index: annotation.start_index,
        end_index: annotation.end_index,
      })) || [];

    return {
      content: content.text,
      sources,
    };
  } catch (error) {
    console.error('Web search API call failed, falling back to regular chat:', error);
    // Fallback to regular chat
    const fallbackResponse = await callOpenAI([{ role: 'user', content: input }], model);
    return {
      content: fallbackResponse,
      sources: []
    };
  }
}

export async function callOpenAI(
  messages: OpenAIMessage[],
  model: string = 'gpt-5',
  temperature: number = 0.7
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  try {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_completion_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: OpenAIResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

export async function streamOpenAI(
  messages: OpenAIMessage[],
  onChunk: (chunk: string) => void,
  model: string = 'gpt-5',
  temperature: number = 0.7
): Promise<void> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }

  try {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Ignore parsing errors for malformed chunks
          }
        }
      }
    }
  } catch (error) {
    console.error('OpenAI streaming failed:', error);
    throw error;
  }
}