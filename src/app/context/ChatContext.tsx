import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message, ChatSettings } from '../types/chat';

interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: ChatSettings;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  clearConversation: (conversationId: string) => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  getCurrentConversation: () => Conversation | null;
  sendMessage: (content: string) => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
  stopGeneration: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DEFAULT_SETTINGS: ChatSettings = {
  ollamaUrl: 'http://localhost:11434',
  model: 'llama2',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: 'You are a helpful AI assistant.',
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai-chat-conversations');
    const savedSettings = localStorage.getItem('ai-chat-settings');
    
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed);
      if (parsed.length > 0) {
        setCurrentConversationId(parsed[0].id);
      }
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('ai-chat-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('ai-chat-settings', JSON.stringify(settings));
  }, [settings]);

  const createConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.model,
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    return newConversation.id;
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const setCurrentConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, message];
        // Auto-generate title from first user message
        const title = conv.title === 'New Chat' && message.role === 'user' 
          ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
          : conv.title;
        
        return {
          ...conv,
          messages: updatedMessages,
          title,
          updatedAt: Date.now(),
        };
      }
      return conv;
    }));
  };

  const updateMessage = (conversationId: string, messageId: string, content: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: conv.messages.map(msg => 
            msg.id === messageId ? { ...msg, content } : msg
          ),
          updatedAt: Date.now(),
        };
      }
      return conv;
    }));
  };

  const deleteMessage = (conversationId: string, messageId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: conv.messages.filter(msg => msg.id !== messageId),
          updatedAt: Date.now(),
        };
      }
      return conv;
    }));
  };

  const clearConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [],
          title: 'New Chat',
          updatedAt: Date.now(),
        };
      }
      return conv;
    }));
  };

  const updateSettings = (newSettings: Partial<ChatSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getCurrentConversation = () => {
    return conversations.find(c => c.id === currentConversationId) || null;
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    addMessage(currentConversationId, userMessage);

    // Create assistant message with streaming indicator
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    addMessage(currentConversationId, assistantMessage);

    // Simulate streaming response - replace with actual Ollama API call
    await simulateStreamingResponse(currentConversationId, assistantMessage.id);
  };

  const regenerateResponse = async (messageId: string) => {
    if (!currentConversationId) return;
    
    const conversation = getCurrentConversation();
    if (!conversation) return;

    // Find the message and remove all messages after it
    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Keep messages up to and including the user message before this assistant message
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0) return;

    const newMessages = conversation.messages.slice(0, messageIndex);
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        return { ...conv, messages: newMessages };
      }
      return conv;
    }));

    // Create new assistant message
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    addMessage(currentConversationId, assistantMessage);
    await simulateStreamingResponse(currentConversationId, assistantMessage.id);
  };

  // Simulated streaming - replace with actual Ollama API
  const simulateStreamingResponse = async (conversationId: string, messageId: string) => {
    const controller = new AbortController();
    setAbortController(controller);

    const sampleResponse = `I'm a simulated response. To connect to your Ollama instance:

1. **Set up Ollama**: Make sure Ollama is running on your system
2. **Configure the URL**: Go to Settings and update the Ollama URL (default: http://localhost:11434)
3. **Replace the API call**: In ChatContext.tsx, replace the \`simulateStreamingResponse\` function with actual Ollama API calls

Here's example code to integrate with Ollama:

\`\`\`javascript
async function callOllama(messages) {
  const response = await fetch('${settings.ollamaUrl}/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: '${settings.model}',
      messages: messages,
      stream: true,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\\n').filter(l => l.trim());
    
    for (const line of lines) {
      const json = JSON.parse(line);
      if (json.message) {
        // Update message content here
      }
    }
  }
}
\`\`\`

You can also try other models like:
- llama3
- mistral
- codellama
- vicuna

**Need help?** Check the Ollama documentation at https://ollama.ai/`;

    const words = sampleResponse.split(' ');
    let currentText = '';

    try {
      for (let i = 0; i < words.length; i++) {
        if (controller.signal.aborted) break;
        
        currentText += (i > 0 ? ' ' : '') + words[i];
        
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === messageId 
                  ? { ...msg, content: currentText }
                  : msg
              ),
            };
          }
          return conv;
        }));

        await new Promise(resolve => setTimeout(resolve, 30));
      }
    } catch (error) {
      console.error('Streaming error:', error);
    }

    // Mark streaming as complete
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: conv.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, isStreaming: false }
              : msg
          ),
        };
      }
      return conv;
    }));

    setAbortController(null);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        settings,
        createConversation,
        deleteConversation,
        setCurrentConversation,
        addMessage,
        updateMessage,
        deleteMessage,
        clearConversation,
        updateSettings,
        getCurrentConversation,
        sendMessage,
        regenerateResponse,
        stopGeneration,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
