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
  ModelProvider,
  Skill,
  Rule,
  GlobalContext,
  Persona,
  ConversationSettings,
  Attachment,
} from '../types/chat';

interface FullChatContextType {
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: ChatSettings;
  createConversation: (folderId?: string, isPrivate?: boolean) => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  clearConversation: (conversationId: string) => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  getCurrentConversation: () => Conversation | null;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
  stopGeneration: () => void;
  moveConversationToFolder: (conversationId: string, folderId: string | undefined) => void;
  updateConversationSettings: (conversationId: string, settings: ConversationSettings, isPrivate: boolean, personaId?: string) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;

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

  // Model Providers
  modelProviders: ModelProvider[];
  addModelProvider: (provider: Omit<ModelProvider, 'id'>) => void;
  updateModelProvider: (id: string, updates: Partial<ModelProvider>) => void;
  setActiveProvider: (id: string) => void;

  // Skills
  skills: Skill[];
  toggleSkill: (id: string, enabled: boolean) => void;

  // Rules
  rules: Rule[];
  addRule: (rule: Omit<Rule, 'id'>) => void;
  updateRule: (id: string, updates: Partial<Rule>) => void;
  removeRule: (id: string) => void;

  // Global Context
  globalContexts: GlobalContext[];
  addGlobalContext: (content: string, category: string) => void;
  removeGlobalContext: (id: string) => void;

  // Personas
  personas: Persona[];
  addPersona: (persona: Omit<Persona, 'id'>) => void;
  updatePersona: (id: string, updates: Partial<Persona>) => void;
  removePersona: (id: string) => void;
}

const FullChatContext = createContext<FullChatContextType | undefined>(undefined);

const DEFAULT_SETTINGS: ChatSettings = {
  activeProvider: 'ollama',
  ollamaUrl: 'http://localhost:11434',
  model: 'llama2',
  defaultModel: 'llama2',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: 'You are a helpful AI assistant.',
  enableRAG: false,
  enableMCP: false,
  enableSkills: true,
  enableGlobalContext: true,
  enableAutoLearning: false,
  enableContextRetention: false,
  contextMode: 'hybrid',
  maxContextTokens: 4000,
  maxConversationHistory: 100,
  defaultPrivateMode: false,
  saveConversations: true,
  streamingEnabled: true,
  streamResponse: true,
  codeHighlighting: true,
  showTokenCount: false,
  topK: 40,
  topP: 0.9,
  repeatPenalty: 1.1,
};

const DEFAULT_SKILLS: Skill[] = [
  { id: '1', name: 'Web Search', description: 'Search the internet for current information', enabled: false, category: 'search', requiresApi: true },
  { id: '2', name: 'Code Execution', description: 'Execute code in a sandboxed environment', enabled: false, category: 'code', requiresApi: false },
  { id: '3', name: 'Image Generation', description: 'Generate images from text descriptions', enabled: false, category: 'image', requiresApi: true },
  { id: '4', name: 'Data Analysis', description: 'Analyze and visualize data', enabled: true, category: 'data', requiresApi: false },
  { id: '5', name: 'Web Scraping', description: 'Extract data from websites', enabled: false, category: 'web', requiresApi: false },
  { id: '6', name: 'File Processing', description: 'Process various file formats', enabled: true, category: 'other', requiresApi: false },
];

export function FullChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [ragDocuments, setRagDocuments] = useState<RAGDocument[]>([]);
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([]);
  const [modelProviders, setModelProviders] = useState<ModelProvider[]>([]);
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [rules, setRules] = useState<Rule[]>([]);
  const [globalContexts, setGlobalContexts] = useState<GlobalContext[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);

  // Load from localStorage
  useEffect(() => {
    const loadData = (key: string, setter: any, defaultValue: any = []) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setter(JSON.parse(saved));
        } catch (e) {
          console.error(`Error loading ${key}:`, e);
          setter(defaultValue);
        }
      }
    };

    loadData('ai-chat-conversations', setConversations);
    loadData('ai-chat-settings', setSettings, DEFAULT_SETTINGS);
    loadData('ai-chat-folders', setFolders);
    loadData('ai-chat-mcp', setMcpServers);
    loadData('ai-chat-rag', setRagDocuments);
    loadData('ai-chat-prompts', setCustomPrompts);
    loadData('ai-chat-providers', setModelProviders);
    loadData('ai-chat-skills', setSkills, DEFAULT_SKILLS);
    loadData('ai-chat-rules', setRules);
    loadData('ai-chat-global-context', setGlobalContexts);
    loadData('ai-chat-personas', setPersonas);

    const saved = localStorage.getItem('ai-chat-conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        setCurrentConversationId(parsed[0].id);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('ai-chat-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => { localStorage.setItem('ai-chat-settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('ai-chat-folders', JSON.stringify(folders)); }, [folders]);
  useEffect(() => { localStorage.setItem('ai-chat-mcp', JSON.stringify(mcpServers)); }, [mcpServers]);
  useEffect(() => { localStorage.setItem('ai-chat-rag', JSON.stringify(ragDocuments)); }, [ragDocuments]);
  useEffect(() => { localStorage.setItem('ai-chat-prompts', JSON.stringify(customPrompts)); }, [customPrompts]);
  useEffect(() => { localStorage.setItem('ai-chat-providers', JSON.stringify(modelProviders)); }, [modelProviders]);
  useEffect(() => { localStorage.setItem('ai-chat-skills', JSON.stringify(skills)); }, [skills]);
  useEffect(() => { localStorage.setItem('ai-chat-rules', JSON.stringify(rules)); }, [rules]);
  useEffect(() => { localStorage.setItem('ai-chat-global-context', JSON.stringify(globalContexts)); }, [globalContexts]);
  useEffect(() => { localStorage.setItem('ai-chat-personas', JSON.stringify(personas)); }, [personas]);

  // Conversation functions
  const createConversation = (folderId?: string, isPrivate?: boolean) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.model,
      folderId,
      isPrivate: isPrivate || settings.defaultPrivateMode,
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

  const updateConversationSettings = (conversationId: string, convSettings: ConversationSettings, isPrivate: boolean, personaId?: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, settings: convSettings, isPrivate, personaId } : conv
    ));
  };

  const updateConversation = (conversationId: string, updates: Partial<Conversation>) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, ...updates } : conv
    ));
  };

  const moveConversationToFolder = (conversationId: string, folderId: string | undefined) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, folderId } : conv
    ));
  };

  const setCurrentConversation = (id: string) => setCurrentConversationId(id);

  const addMessage = (conversationId: string, message: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, message];
        const title = conv.title === 'New Chat' && message.role === 'user' 
          ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
          : conv.title;
        
        return { ...conv, messages: updatedMessages, title, updatedAt: Date.now() };
      }
      return conv;
    }));

    // Auto-learning (if enabled and not private)
    if (settings.enableAutoLearning && message.role === 'user') {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation && !conversation.isPrivate) {
        // Simulate learning - in real app, use AI to extract insights
        const hasPreference = message.content.toLowerCase().includes('prefer');
        if (hasPreference && globalContexts.length < 10) {
          addGlobalContext(message.content, 'Preferences');
        }
      }
    }
  };

  const updateMessage = (conversationId: string, messageId: string, content: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: conv.messages.map(msg => msg.id === messageId ? { ...msg, content } : msg),
          updatedAt: Date.now(),
        };
      }
      return conv;
    }));
  };

  const deleteMessage = (conversationId: string, messageId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, messages: conv.messages.filter(msg => msg.id !== messageId), updatedAt: Date.now() };
      }
      return conv;
    }));
  };

  const clearConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, messages: [], title: 'New Chat', updatedAt: Date.now() };
      }
      return conv;
    }));
  };

  const updateSettings = (newSettings: Partial<ChatSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getCurrentConversation = () => conversations.find(c => c.id === currentConversationId) || null;

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const sendMessage = async (content: string, attachments?: Attachment[]) => {
    if (!currentConversationId) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now(), attachments };
    addMessage(currentConversationId, userMessage);

    const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true };
    addMessage(currentConversationId, assistantMessage);
    
    await simulateStreamingResponse(currentConversationId, assistantMessage.id);
  };

  const regenerateResponse = async (messageId: string) => {
    if (!currentConversationId) return;
    
    const conversation = getCurrentConversation();
    if (!conversation) return;

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const newMessages = conversation.messages.slice(0, messageIndex);
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) return { ...conv, messages: newMessages };
      return conv;
    }));

    const assistantMessage: Message = { id: Date.now().toString(), role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true };
    addMessage(currentConversationId, assistantMessage);
    await simulateStreamingResponse(currentConversationId, assistantMessage.id);
  };

  const simulateStreamingResponse = async (conversationId: string, messageId: string) => {
    const controller = new AbortController();
    setAbortController(controller);

    const conversation = conversations.find(c => c.id === conversationId);
    const contextInfo = settings.enableGlobalContext ? `\n\n**Global Context Active:** ${globalContexts.length} items loaded` : '';
    const ragInfo = settings.enableRAG ? `\n**RAG Active:** ${ragDocuments.filter(d => d.enabled).length} documents` : '';
    const mcpInfo = settings.enableMCP ? `\n**MCP Active:** ${mcpServers.filter(s => s.enabled).length} servers` : '';
    const skillsInfo = settings.enableSkills ? `\n**Skills Active:** ${skills.filter(s => s.enabled).length} capabilities` : '';
    const privateInfo = conversation?.isPrivate ? '\n\n🔒 **Private Mode:** Learning disabled for this conversation' : '';

    const sampleResponse = `I'm ready to connect to your AI provider (${settings.activeProvider})!${contextInfo}${ragInfo}${mcpInfo}${skillsInfo}${privateInfo}

**Current Configuration:**
- Provider: ${settings.activeProvider}
- Model: ${settings.model}
- Temperature: ${settings.temperature}
- Context Mode: ${settings.contextMode}

To integrate with real AI, update the \`simulateStreamingResponse\` function in FullChatContext.tsx with actual API calls to Ollama, OpenAI, or Anthropic.`;

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
              messages: conv.messages.map(msg => msg.id === messageId ? { ...msg, content: currentText } : msg),
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
          messages: conv.messages.map(msg => msg.id === messageId ? { ...msg, isStreaming: false } : msg),
        };
      }
      return conv;
    }));

    setAbortController(null);
  };

  // Folder functions
  const createFolder = (name: string, color?: string, parentId?: string) => {
    setFolders(prev => [...prev, { id: Date.now().toString(), name, color, parentId, createdAt: Date.now() }]);
  };

  const updateFolder = (id: string, name: string, color?: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name, color } : f));
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setConversations(prev => prev.map(conv => conv.folderId === id ? { ...conv, folderId: undefined } : conv));
  };

  // MCP functions
  const addMCPServer = (name: string, url: string) => {
    const newServer: MCPServer = { id: Date.now().toString(), name, url, enabled: true, status: 'disconnected', tools: [] };
    setMcpServers(prev => [...prev, newServer]);
    setTimeout(() => refreshMCPServer(newServer.id), 1000);
  };

  const removeMCPServer = (id: string) => setMcpServers(prev => prev.filter(s => s.id !== id));

  const toggleMCPServer = (id: string, enabled: boolean) => {
    setMcpServers(prev => prev.map(s => s.id === id ? { ...s, enabled } : s));
  };

  const toggleMCPTool = (serverId: string, toolId: string, enabled: boolean) => {
    setMcpServers(prev => prev.map(s =>
      s.id === serverId ? { ...s, tools: s.tools.map(t => t.id === toolId ? { ...t, enabled } : t) } : s
    ));
  };

  const refreshMCPServer = (id: string) => {
    const mockTools: MCPTool[] = [
      { id: '1', name: 'search', description: 'Search the web', parameters: {}, enabled: true },
      { id: '2', name: 'calculator', description: 'Perform calculations', parameters: {}, enabled: true },
    ];
    setMcpServers(prev => prev.map(s => s.id === id ? { ...s, tools: mockTools, status: 'connected' } : s));
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
      chunks: Math.ceil(content.length / 500),
      uploadedAt: Date.now(),
      enabled: true,
    };
    setRagDocuments(prev => [...prev, newDoc]);
  };

  const removeRAGDocument = (id: string) => setRagDocuments(prev => prev.filter(d => d.id !== id));
  const toggleRAGDocument = (id: string, enabled: boolean) => {
    setRagDocuments(prev => prev.map(d => d.id === id ? { ...d, enabled } : d));
  };

  // Prompts functions
  const createPrompt = (name: string, content: string, category: string) => {
    setCustomPrompts(prev => [...prev, { id: Date.now().toString(), name, content, category, createdAt: Date.now() }]);
  };

  const updatePrompt = (id: string, name: string, content: string, category: string) => {
    setCustomPrompts(prev => prev.map(p => p.id === id ? { ...p, name, content, category } : p));
  };

  const deletePrompt = (id: string) => setCustomPrompts(prev => prev.filter(p => p.id !== id));

  // Model Provider functions
  const addModelProvider = (provider: Omit<ModelProvider, 'id'>) => {
    setModelProviders(prev => [...prev, { ...provider, id: Date.now().toString() }]);
  };

  const updateModelProvider = (id: string, updates: Partial<ModelProvider>) => {
    setModelProviders(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const setActiveProvider = (id: string) => {
    const provider = modelProviders.find(p => p.id === id);
    if (provider) {
      updateSettings({ activeProvider: provider.type });
    }
  };

  // Skills functions
  const toggleSkill = (id: string, enabled: boolean) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled } : s));
  };

  // Rules functions
  const addRule = (rule: Omit<Rule, 'id'>) => {
    setRules(prev => [...prev, { ...rule, id: Date.now().toString() }]);
  };

  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id));

  // Global Context functions
  const addGlobalContext = (content: string, category: string) => {
    setGlobalContexts(prev => [...prev, {
      id: Date.now().toString(),
      content,
      source: 'manual',
      category,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      usageCount: 0,
      relevanceScore: 1,
    }]);
  };

  const removeGlobalContext = (id: string) => setGlobalContexts(prev => prev.filter(c => c.id !== id));

  // Personas functions
  const addPersona = (persona: Omit<Persona, 'id'>) => {
    setPersonas(prev => [...prev, { ...persona, id: Date.now().toString() }]);
  };

  const updatePersona = (id: string, updates: Partial<Persona>) => {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePersona = (id: string) => setPersonas(prev => prev.filter(p => p.id !== id));

  return (
    <FullChatContext.Provider
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
        updateConversationSettings,
        updateConversation,
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
        modelProviders,
        addModelProvider,
        updateModelProvider,
        setActiveProvider,
        skills,
        toggleSkill,
        rules,
        addRule,
        updateRule,
        removeRule,
        globalContexts,
        addGlobalContext,
        removeGlobalContext,
        personas,
        addPersona,
        updatePersona,
        removePersona,
      }}
    >
      {children}
    </FullChatContext.Provider>
  );
}

export function useFullChat() {
  const context = useContext(FullChatContext);
  if (!context) {
    throw new Error('useFullChat must be used within FullChatProvider');
  }
  return context;
}