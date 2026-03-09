export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  attachments?: Attachment[];
  sources?: Source[];
  toolCalls?: ToolCall[];
  tokenCount?: number;
  model?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
}

export interface Source {
  id: string;
  title: string;
  content: string;
  url?: string;
  relevance: number;
}

export interface ToolCall {
  id: string;
  name: string;
  input: any;
  output?: any;
  status: 'pending' | 'running' | 'complete' | 'error';
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  folderId?: string;
  tags?: string[];
  settings?: ConversationSettings;
  summary?: string;
  tokenCount?: number;
  isPrivate?: boolean;
  personaId?: string;
}

export interface ConversationSettings {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  repeatPenalty?: number;
  systemPrompt?: string;
  enableRAG?: boolean;
  enableMCP?: boolean;
  enableSkills?: boolean;
  contextMode?: 'global' | 'local' | 'hybrid';
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  createdAt: number;
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  tools: MCPTool[];
  status: 'connected' | 'disconnected' | 'error';
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  parameters: any;
  enabled: boolean;
}

export interface RAGDocument {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  chunks: number;
  uploadedAt: number;
  enabled: boolean;
}

export interface CustomPrompt {
  id: string;
  name: string;
  content: string;
  category: string;
  createdAt: number;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  settings?: any;
}

export interface ModelProvider {
  id: string;
  name: string;
  type: 'ollama' | 'openai' | 'anthropic' | 'custom';
  apiUrl: string;
  apiKey?: string;
  models: string[];
  enabled: boolean;
  defaultModel?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'search' | 'code' | 'image' | 'data' | 'web' | 'other';
  requiresApi?: boolean;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  type: 'content' | 'behavior' | 'output' | 'privacy';
  enabled: boolean;
  rule: string;
  priority: number;
}

export interface GlobalContext {
  id: string;
  content: string;
  source: 'learned' | 'manual' | 'imported';
  category: string;
  createdAt: number;
  lastUsed: number;
  usageCount: number;
  relevanceScore: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  avatar?: string;
  temperature: number;
  creativity: 'low' | 'medium' | 'high';
  verbosity: 'concise' | 'normal' | 'detailed';
}

export interface ChatSettings {
  // Model Provider
  activeProvider: string;
  ollamaUrl: string;
  model: string;
  
  // API Keys (encrypted in real app)
  openaiApiKey?: string;
  anthropicApiKey?: string;
  
  // Generation Settings
  temperature: number;
  maxTokens: number;
  topK?: number;
  topP?: number;
  repeatPenalty?: number;
  systemPrompt: string;
  
  // Features
  enableRAG: boolean;
  enableMCP: boolean;
  enableSkills: boolean;
  
  // Context Management
  enableGlobalContext: boolean;
  enableAutoLearning: boolean;
  enableContextRetention?: boolean;
  contextMode: 'global' | 'local' | 'hybrid';
  maxContextTokens: number;
  maxConversationHistory?: number;
  
  // Privacy
  defaultPrivateMode: boolean;
  saveConversations: boolean;
  
  // UI
  streamingEnabled: boolean;
  streamResponse?: boolean;
  codeHighlighting: boolean;
  showTokenCount: boolean;
  defaultModel?: string;
}