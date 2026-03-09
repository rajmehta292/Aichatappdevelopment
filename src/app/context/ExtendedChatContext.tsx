import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Conversation,
  Message,
  ChatSettings,
  Folder,
  MCPServer,
  MCPTool,
  RAGDocument,
  CustomPrompt,
} from '../types/chat';

interface ExtendedChatContextType {
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: ChatSettings;
  createConversation: (folderId?: string) => string;
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
  moveConversationToFolder: (conversationId: string, folderId: string | undefined) => void;

  // Folders
  folders: Folder[];
  createFolder: (name: string, color?: string, parentId?: string) => void;
  updateFolder: (id: string, name: string, color?: string) => void;
  deleteFolder: (id: string) => void;

  // MCP
  mcpServers: MCPServer[];
  addMCPServer: (name: string, url: string) => void;
  removeMCPServer: (id: string) => void;
  toggleMCPServer: (id: string, enabled: boolean) => void;
  toggleMCPTool: (serverId: string, toolId: string, enabled: boolean) => void;
  refreshMCPServer: (id: string) => void;

  // RAG
  ragDocuments: RAGDocument[];
  uploadRAGDocument: (file: File) => Promise<void>;
  removeRAGDocument: (id: string) => void;
  toggleRAGDocument: (id: string, enabled: boolean) => void;

  // Prompts
  customPrompts: CustomPrompt[];
  createPrompt: (name: string, content: string, category: string) => void;
  updatePrompt: (id: string, name: string, content: string, category: string) => void;
  deletePrompt: (id: string) => void;
}

const ExtendedChatContext = createContext<ExtendedChatContextType | undefined>(undefined);

const DEFAULT_SETTINGS: ChatSettings = {
  ollamaUrl: 'http://localhost:11434',
  model: 'llama2',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: 'You are a helpful AI assistant.',
  enableRAG: false,
  enableMCP: false,
  topK: 40,
  topP: 0.9,
  repeatPenalty: 1.1,
};

export function ExtendedChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  // Extended features
  const [folders, setFolders] = useState<Folder[]>([]);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [ragDocuments, setRagDocuments] = useState<RAGDocument[]>([]);
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai-chat-conversations');
    const savedSettings = localStorage.getItem('ai-chat-settings');
    const savedFolders = localStorage.getItem('ai-chat-folders');
    const savedMCP = localStorage.getItem('ai-chat-mcp');
    const savedRAG = localStorage.getItem('ai-chat-rag');
    const savedPrompts = localStorage.getItem('ai-chat-prompts');
    
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed);
      if (parsed.length > 0) {
        setCurrentConversationId(parsed[0].id);
      }
    }
    
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
    if (savedMCP) setMcpServers(JSON.parse(savedMCP));
    if (savedRAG) setRagDocuments(JSON.parse(savedRAG));
    if (savedPrompts) setCustomPrompts(JSON.parse(savedPrompts));
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('ai-chat-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('ai-chat-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('ai-chat-folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('ai-chat-mcp', JSON.stringify(mcpServers));
  }, [mcpServers]);

  useEffect(() => {
    localStorage.setItem('ai-chat-rag', JSON.stringify(ragDocuments));
  }, [ragDocuments]);

  useEffect(() => {
    localStorage.setItem('ai-chat-prompts', JSON.stringify(customPrompts));
  }, [customPrompts]);

  // Conversation functions
  const createConversation = (folderId?: string) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.model,
      folderId,
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

  const moveConversationToFolder = (conversationId: string, folderId: string | undefined) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, folderId } : conv
    ));
  };

  const setCurrentConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, message];
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

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    addMessage(currentConversationId, assistantMessage);
    await simulateStreamingResponse(currentConversationId, assistantMessage.id);
  };

  const regenerateResponse = async (messageId: string) => {
    if (!currentConversationId) return;
    
    const conversation = getCurrentConversation();
    if (!conversation) return;

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0) return;

    const newMessages = conversation.messages.slice(0, messageIndex);
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        return { ...conv, messages: newMessages };
      }
      return conv;
    }));

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

  const simulateStreamingResponse = async (conversationId: string, messageId: string) => {
    const controller = new AbortController();
    setAbortController(controller);

    const sampleResponse = `I'm a simulated response ready to connect to your Ollama instance.

**Current Configuration:**
- RAG: ${settings.enableRAG ? 'Enabled' : 'Disabled'} (${ragDocuments.filter(d => d.enabled).length} active documents)
- MCP: ${settings.enableMCP ? 'Enabled' : 'Disabled'} (${mcpServers.filter(s => s.enabled).length} active servers)
- Model: ${settings.model}
- Temperature: ${settings.temperature}

To integrate with Ollama, update the \`simulateStreamingResponse\` function in ExtendedChatContext.tsx with actual API calls.`;

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

  // Folder functions
  const createFolder = (name: string, color?: string, parentId?: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      color,
      parentId,
      createdAt: Date.now(),
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const updateFolder = (id: string, name: string, color?: string) => {
    setFolders(prev => prev.map(f =>
      f.id === id ? { ...f, name, color } : f
    ));
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    // Remove folder reference from conversations
    setConversations(prev => prev.map(conv =>
      conv.folderId === id ? { ...conv, folderId: undefined } : conv
    ));
  };

  // MCP functions
  const addMCPServer = (name: string, url: string) => {
    const newServer: MCPServer = {
      id: Date.now().toString(),
      name,
      url,
      enabled: true,
      status: 'disconnected',
      tools: [],
    };
    setMcpServers(prev => [...prev, newServer]);
    // Simulate fetching tools
    setTimeout(() => refreshMCPServer(newServer.id), 1000);
  };

  const removeMCPServer = (id: string) => {
    setMcpServers(prev => prev.filter(s => s.id !== id));
  };

  const toggleMCPServer = (id: string, enabled: boolean) => {
    setMcpServers(prev => prev.map(s =>
      s.id === id ? { ...s, enabled } : s
    ));
  };

  const toggleMCPTool = (serverId: string, toolId: string, enabled: boolean) => {
    setMcpServers(prev => prev.map(s =>
      s.id === serverId
        ? {
            ...s,
            tools: s.tools.map(t =>
              t.id === toolId ? { ...t, enabled } : t
            ),
          }
        : s
    ));
  };

  const refreshMCPServer = (id: string) => {
    // Simulate fetching tools from server
    const mockTools: MCPTool[] = [
      {
        id: '1',
        name: 'search',
        description: 'Search the web for information',
        parameters: { query: 'string' },
        enabled: true,
      },
      {
        id: '2',
        name: 'calculator',
        description: 'Perform mathematical calculations',
        parameters: { expression: 'string' },
        enabled: true,
      },
      {
        id: '3',
        name: 'weather',
        description: 'Get current weather information',
        parameters: { location: 'string' },
        enabled: true,
      },
    ];

    setMcpServers(prev => prev.map(s =>
      s.id === id ? { ...s, tools: mockTools, status: 'connected' } : s
    ));
  };

  // RAG functions
  const uploadRAGDocument = async (file: File) => {
    const content = await file.text();
    const newDoc: RAGDocument = {
      id: Date.now().toString(),
      name: file.name,
      content,
      type: file.type,
      size: file.size,
      chunks: Math.ceil(content.length / 500), // Simulate chunking
      uploadedAt: Date.now(),
      enabled: true,
    };
    setRagDocuments(prev => [...prev, newDoc]);
  };

  const removeRAGDocument = (id: string) => {
    setRagDocuments(prev => prev.filter(d => d.id !== id));
  };

  const toggleRAGDocument = (id: string, enabled: boolean) => {
    setRagDocuments(prev => prev.map(d =>
      d.id === id ? { ...d, enabled } : d
    ));
  };

  // Prompts functions
  const createPrompt = (name: string, content: string, category: string) => {
    const newPrompt: CustomPrompt = {
      id: Date.now().toString(),
      name,
      content,
      category,
      createdAt: Date.now(),
    };
    setCustomPrompts(prev => [...prev, newPrompt]);
  };

  const updatePrompt = (id: string, name: string, content: string, category: string) => {
    setCustomPrompts(prev => prev.map(p =>
      p.id === id ? { ...p, name, content, category } : p
    ));
  };

  const deletePrompt = (id: string) => {
    setCustomPrompts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ExtendedChatContext.Provider
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
        moveConversationToFolder,
        folders,
        createFolder,
        updateFolder,
        deleteFolder,
        mcpServers,
        addMCPServer,
        removeMCPServer,
        toggleMCPServer,
        toggleMCPTool,
        refreshMCPServer,
        ragDocuments,
        uploadRAGDocument,
        removeRAGDocument,
        toggleRAGDocument,
        customPrompts,
        createPrompt,
        updatePrompt,
        deletePrompt,
      }}
    >
      {children}
    </ExtendedChatContext.Provider>
  );
}

export function useExtendedChat() {
  const context = useContext(ExtendedChatContext);
  if (!context) {
    throw new Error('useExtendedChat must be used within ExtendedChatProvider');
  }
  return context;
}
