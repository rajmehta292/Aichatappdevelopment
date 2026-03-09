# API Reference & Type Definitions

Complete TypeScript type definitions for the AI Chat Application.

## 📋 Table of Contents

- [Core Types](#core-types)
- [Context API](#context-api)
- [Component Props](#component-props)
- [Function Signatures](#function-signatures)
- [Enums & Constants](#enums--constants)

## Core Types

All types are defined in `/src/app/types/chat.ts`

### Message

```typescript
interface Message {
  id: string;                      // Unique identifier
  role: 'user' | 'assistant';      // Message sender
  content: string;                 // Message text (markdown supported)
  timestamp: number;               // Unix timestamp
  isStreaming?: boolean;           // Currently being generated
  attachments?: Attachment[];      // File attachments
  sources?: Source[];              // RAG sources (future)
  toolCalls?: ToolCall[];          // MCP tool calls (future)
  tokenCount?: number;             // Token count (future)
  model?: string;                  // Model that generated this message
}
```

**Usage Example:**
```typescript
const userMessage: Message = {
  id: Date.now().toString(),
  role: 'user',
  content: 'Hello, AI!',
  timestamp: Date.now(),
  attachments: [imageAttachment],
};
```

### Attachment

```typescript
interface Attachment {
  id: string;           // Unique identifier
  name: string;         // Original filename
  type: string;         // MIME type (e.g., 'image/png', 'application/pdf')
  size: number;         // File size in bytes
  url?: string;         // Blob URL or external URL
  content?: string;     // Base64 data URL or text content
}
```

**File Type Support:**
- Images: `image/png`, `image/jpeg`, `image/webp`, etc.
- Videos: `video/mp4`, `video/webm`, etc.
- Documents: `application/pdf`, `text/plain`, etc.
- Archives: `application/zip`, `application/x-rar`, etc.
- Code: `text/javascript`, `application/json`, etc.

**Usage Example:**
```typescript
const imageAttachment: Attachment = {
  id: 'att_123',
  name: 'screenshot.png',
  type: 'image/png',
  size: 245678,
  content: 'data:image/png;base64,iVBORw0KGgo...',
};
```

### Conversation

```typescript
interface Conversation {
  id: string;                        // Unique identifier
  title: string;                     // Auto-generated or user-set
  messages: Message[];               // All messages in conversation
  createdAt: number;                 // Unix timestamp
  updatedAt: number;                 // Unix timestamp
  model?: string;                    // Active model for this conversation
  folderId?: string;                 // Parent folder ID
  tags?: string[];                   // User-defined tags
  settings?: ConversationSettings;   // Override global settings
  summary?: string;                  // Auto-generated summary (future)
  tokenCount?: number;               // Total tokens used
  isPrivate?: boolean;               // Private mode (no learning)
  personaId?: string;                // Active persona ID
}
```

### ConversationSettings

```typescript
interface ConversationSettings {
  temperature?: number;              // 0.0 - 2.0
  maxTokens?: number;                // Max response length
  topP?: number;                     // Nucleus sampling
  topK?: number;                     // Top-K sampling
  repeatPenalty?: number;            // Repetition penalty
  systemPrompt?: string;             // Override global prompt
  enableRAG?: boolean;               // Enable document context
  enableMCP?: boolean;               // Enable tool calling
  enableSkills?: boolean;            // Enable skills
  contextMode?: 'global' | 'local' | 'hybrid';  // Context strategy
}
```

### ChatSettings

```typescript
interface ChatSettings {
  // Model Provider
  activeProvider: string;            // Provider ID
  ollamaUrl: string;                 // Ollama API URL
  model: string;                     // Default model name
  defaultModel?: string;             // Fallback model
  
  // API Keys (stored in localStorage)
  openaiApiKey?: string;
  anthropicApiKey?: string;
  
  // Generation Settings
  temperature: number;               // 0.0 - 2.0, default 0.7
  maxTokens: number;                 // Default 2048
  topK?: number;                     // Default 40
  topP?: number;                     // Default 0.9
  repeatPenalty?: number;            // Default 1.1
  systemPrompt: string;              // Default system message
  
  // Features
  enableRAG: boolean;                // Enable RAG globally
  enableMCP: boolean;                // Enable MCP globally
  enableSkills: boolean;             // Enable skills globally
  
  // Context Management
  enableGlobalContext: boolean;      // Use global context
  enableAutoLearning: boolean;       // Auto-extract preferences
  enableContextRetention?: boolean;  // Retain context between sessions
  contextMode: 'global' | 'local' | 'hybrid';
  maxContextTokens: number;          // Max context window
  maxConversationHistory?: number;   // Max messages to keep
  
  // Privacy
  defaultPrivateMode: boolean;       // New chats private by default
  saveConversations: boolean;        // Save to localStorage
  
  // UI
  streamingEnabled: boolean;         // Enable streaming responses
  streamResponse?: boolean;          // Alternative flag
  codeHighlighting: boolean;         // Syntax highlighting
  showTokenCount: boolean;           // Display token usage
}
```

### ModelProvider

```typescript
interface ModelProvider {
  id: string;                        // Unique identifier
  name: string;                      // Display name
  type: 'ollama' | 'openai' | 'anthropic' | 'custom';
  apiUrl: string;                    // API endpoint
  apiKey?: string;                   // API key (optional for Ollama)
  models: string[];                  // Available model names
  enabled: boolean;                  // Currently active
  defaultModel?: string;             // Default model for this provider
}
```

**Provider Examples:**
```typescript
// Ollama
{
  id: 'ollama_1',
  name: 'Ollama',
  type: 'ollama',
  apiUrl: 'http://localhost:11434',
  models: ['llama2', 'llama3', 'mistral', 'codellama'],
  enabled: true,
}

// OpenAI
{
  id: 'openai_1',
  name: 'OpenAI',
  type: 'openai',
  apiUrl: 'https://api.openai.com/v1',
  apiKey: 'sk-...',
  models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  enabled: false,
}

// Anthropic
{
  id: 'anthropic_1',
  name: 'Anthropic',
  type: 'anthropic',
  apiUrl: 'https://api.anthropic.com/v1',
  apiKey: 'sk-ant-...',
  models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
  enabled: false,
}
```

### Folder

```typescript
interface Folder {
  id: string;
  name: string;
  parentId?: string;      // For nested folders
  color?: string;         // Hex color code
  createdAt: number;
}
```

### RAGDocument

```typescript
interface RAGDocument {
  id: string;
  name: string;           // Original filename
  content: string;        // Full text content
  type: string;           // MIME type
  size: number;           // File size in bytes
  chunks: number;         // Number of chunks (for embedding)
  uploadedAt: number;     // Unix timestamp
  enabled: boolean;       // Include in context
}
```

### MCPServer

```typescript
interface MCPServer {
  id: string;
  name: string;
  url: string;                           // Server endpoint
  enabled: boolean;
  tools: MCPTool[];
  status: 'connected' | 'disconnected' | 'error';
}

interface MCPTool {
  id: string;
  name: string;
  description: string;
  parameters: any;        // JSON schema for parameters
  enabled: boolean;
}
```

### CustomPrompt

```typescript
interface CustomPrompt {
  id: string;
  name: string;           // Display name
  content: string;        // Prompt text
  category: string;       // User-defined category
  createdAt: number;
}
```

### Skill

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'search' | 'code' | 'image' | 'data' | 'web' | 'other';
  requiresApi?: boolean;  // Needs API key to function
}
```

### Rule

```typescript
interface Rule {
  id: string;
  name: string;
  description: string;
  type: 'content' | 'behavior' | 'output' | 'privacy';
  enabled: boolean;
  rule: string;           // Rule text/logic
  priority: number;       // Higher = more important
}
```

### GlobalContext

```typescript
interface GlobalContext {
  id: string;
  content: string;                           // Context text
  source: 'learned' | 'manual' | 'imported'; // How it was created
  category: string;                          // User-defined category
  createdAt: number;
  lastUsed: number;
  usageCount: number;
  relevanceScore: number;  // 0.0 - 1.0
}
```

### Persona

```typescript
interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;                      // Persona's system prompt
  avatar?: string;                           // Avatar image URL
  temperature: number;                       // Generation temperature
  creativity: 'low' | 'medium' | 'high';
  verbosity: 'concise' | 'normal' | 'detailed';
}
```

### Source (RAG)

```typescript
interface Source {
  id: string;
  title: string;          // Document/chunk title
  content: string;        // Relevant text
  url?: string;           // Source URL if applicable
  relevance: number;      // Relevance score (0.0 - 1.0)
}
```

### ToolCall (MCP)

```typescript
interface ToolCall {
  id: string;
  name: string;                              // Tool name
  input: any;                                // Tool input parameters
  output?: any;                              // Tool output
  status: 'pending' | 'running' | 'complete' | 'error';
}
```

## Context API

### FullChatContext

```typescript
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
  updateConversationSettings: (
    conversationId: string,
    settings: ConversationSettings,
    isPrivate: boolean,
    personaId?: string
  ) => void;

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
```

### Usage

```typescript
import { useFullChat } from '../context/FullChatContext';

function MyComponent() {
  const {
    conversations,
    sendMessage,
    createConversation,
    settings,
  } = useFullChat();

  const handleSend = async (text: string) => {
    await sendMessage(text);
  };

  return <div>{/* component JSX */}</div>;
}
```

## Component Props

### ChatMessage Props

```typescript
interface ChatMessageProps {
  message: Message;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}
```

### EnhancedChatInput Props

```typescript
interface EnhancedChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
}
```

### ModelSwitcher Props

```typescript
interface ModelSwitcherProps {
  conversationId?: string;
  currentModel?: string;
  onModelChange?: (model: string) => void;
}
```

### ProviderSetupWizard Props

```typescript
interface ProviderSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (provider: Omit<ModelProvider, 'id'>) => void;
}
```

### ModelProviderManager Props

```typescript
interface ModelProviderManagerProps {
  providers: ModelProvider[];
  onAddProvider: (provider: Omit<ModelProvider, 'id'>) => void;
  onUpdateProvider: (id: string, updates: Partial<ModelProvider>) => void;
  onSetActive: (id: string) => void;
}
```

## Function Signatures

### sendMessage

```typescript
async function sendMessage(
  content: string,
  attachments?: Attachment[]
): Promise<void>
```

**Description:** Sends a user message and triggers AI response

**Parameters:**
- `content` - Message text
- `attachments` - Optional array of file attachments

**Example:**
```typescript
await sendMessage('Hello!', [imageAttachment]);
```

### simulateStreamingResponse (Integration Point)

```typescript
async function simulateStreamingResponse(
  conversationId: string,
  messageId: string
): Promise<void>
```

**Description:** Main integration point - replace with real API calls

**Parameters:**
- `conversationId` - ID of conversation to update
- `messageId` - ID of assistant message to populate

**Integration Example:**
```typescript
const simulateStreamingResponse = async (conversationId, messageId) => {
  const conversation = conversations.find(c => c.id === conversationId);
  const provider = modelProviders.find(p => p.enabled);
  
  // Call real API based on provider.type
  if (provider.type === 'ollama') {
    await streamOllamaResponse(conversationId, messageId, ...);
  }
  // ... etc
};
```

### createConversation

```typescript
function createConversation(
  folderId?: string,
  isPrivate?: boolean
): string
```

**Returns:** New conversation ID

**Example:**
```typescript
const newId = createConversation('folder_123', false);
setCurrentConversation(newId);
```

### addModelProvider

```typescript
function addModelProvider(
  provider: Omit<ModelProvider, 'id'>
): void
```

**Example:**
```typescript
addModelProvider({
  name: 'My Ollama',
  type: 'ollama',
  apiUrl: 'http://localhost:11434',
  models: ['llama2', 'mistral'],
  enabled: true,
});
```

## Enums & Constants

### Provider Types

```typescript
type ProviderType = 'ollama' | 'openai' | 'anthropic' | 'custom';
```

### Context Modes

```typescript
type ContextMode = 'global' | 'local' | 'hybrid';

// global - Use global context across all conversations
// local - Only use current conversation context
// hybrid - Smart mix of both
```

### Message Roles

```typescript
type MessageRole = 'user' | 'assistant';
```

### MCP Status

```typescript
type MCPStatus = 'connected' | 'disconnected' | 'error';
```

### Skill Categories

```typescript
type SkillCategory = 'search' | 'code' | 'image' | 'data' | 'web' | 'other';
```

### Rule Types

```typescript
type RuleType = 'content' | 'behavior' | 'output' | 'privacy';
```

### Default Settings

```typescript
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
  contextMode: 'hybrid',
  maxContextTokens: 4000,
  defaultPrivateMode: false,
  saveConversations: true,
  streamingEnabled: true,
  codeHighlighting: true,
  showTokenCount: false,
  topK: 40,
  topP: 0.9,
  repeatPenalty: 1.1,
};
```

## API Request Formats

### Ollama Request

```typescript
interface OllamaRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    images?: string[];  // base64 images
  }>;
  stream: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_k?: number;
    top_p?: number;
    repeat_penalty?: number;
  };
}
```

### OpenAI Request

```typescript
interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: { url: string };
    }>;
  }>;
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}
```

### Anthropic Request

```typescript
interface AnthropicRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string | Array<{
      type: 'text' | 'image';
      text?: string;
      source?: {
        type: 'base64';
        media_type: string;
        data: string;
      };
    }>;
  }>;
  system?: string;
  stream: boolean;
  max_tokens: number;
  temperature?: number;
  top_p?: number;
}
```

---

This reference covers all types and interfaces used in the application. For implementation details, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md).
