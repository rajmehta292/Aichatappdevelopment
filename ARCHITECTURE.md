# Application Architecture

This document provides a comprehensive overview of the AI chat application's architecture, component relationships, and data flow.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Router (Data Mode)                  │  │
│  │  ┌─────────────────┐  ┌──────────────────────────┐   │  │
│  │  │  FullChatPage   │  │ AdvancedSettingsPage     │   │  │
│  │  │  (/)            │  │ (/settings)              │   │  │
│  │  └─────────────────┘  └──────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           FullChatContext (State Management)          │  │
│  │  • Conversations, Messages, Settings                  │  │
│  │  • Folders, Providers, RAG, MCP                       │  │
│  │  • Skills, Rules, Personas, Global Context           │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↕️                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              localStorage (Persistence)               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↕️
┌─────────────────────────────────────────────────────────────┐
│                    AI Provider APIs                          │
│  • Ollama (http://localhost:11434)                          │
│  • OpenAI (https://api.openai.com/v1)                       │
│  • Anthropic (https://api.anthropic.com/v1)                 │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Component Hierarchy

### Main Application
```
App.tsx
└── RouterProvider
    ├── FullChatPage (/)
    │   ├── ExtendedChatSidebar
    │   │   ├── FolderTree
    │   │   ├── ConversationList
    │   │   └── SearchBar
    │   ├── ChatHeader
    │   │   ├── ModelSwitcher
    │   │   ├── SettingsButton
    │   │   └── ExportButton
    │   ├── ChatMessages
    │   │   └── ChatMessage (repeated)
    │   │       ├── MarkdownRenderer
    │   │       ├── CodeBlock
    │   │       └── AttachmentPreview
    │   ├── EnhancedChatInput
    │   │   ├── FileUploadButton
    │   │   └── AttachmentList
    │   ├── BasicSettingsDialog
    │   └── ConversationSettingsDialog
    └── AdvancedSettingsPage (/settings)
        └── Tabs (10 tabs)
            ├── Providers → ModelProviderManager → ProviderSetupWizard
            ├── RAG → RAGDocumentManager
            ├── MCP → MCPServerManager
            ├── Prompts → CustomPromptsManager
            ├── Plugins → PluginManager
            ├── Skills → SkillsManager
            ├── Rules → RulesManager
            ├── Context → GlobalContextManager
            ├── Personas → PersonasManager
            └── Data → DataManagement
```

## 🔄 Data Flow

### 1. Message Sending Flow

```
User Input
    ↓
EnhancedChatInput.tsx
    ↓ (calls onSend with message + attachments)
FullChatPage.tsx
    ↓ (calls sendMessage from context)
FullChatContext.tsx → sendMessage()
    ↓
1. Create user message with attachments
2. Add to conversations array
3. Create empty assistant message
4. Add to conversations array
    ↓
simulateStreamingResponse() [INTEGRATION POINT]
    ↓
[Choose provider based on activeProvider]
    ↓
├─ Ollama → streamOllamaResponse()
├─ OpenAI → streamOpenAIResponse()
└─ Anthropic → streamAnthropicResponse()
    ↓
Stream response chunks
    ↓
Update assistant message in real-time
    ↓
Mark message as complete (isStreaming: false)
    ↓
Auto-save to localStorage
    ↓
UI re-renders with new message
```

### 2. Settings Update Flow

```
User modifies setting
    ↓
BasicSettingsDialog or AdvancedSettingsPage
    ↓ (calls updateSettings from context)
FullChatContext.tsx → updateSettings()
    ↓
Merge new settings with existing settings
    ↓
Update settings state
    ↓
useEffect triggers
    ↓
Save to localStorage
    ↓
Next API call uses updated settings
```

### 3. Provider Setup Flow

```
User clicks "Add Provider"
    ↓
ProviderSetupWizard opens
    ↓
Step 1: Select provider type (Ollama/OpenAI/Anthropic)
    ↓
Step 2: Configure (name, URL, API key)
    ↓
Step 3: Test connection
    ↓ (calls onComplete with provider data)
ModelProviderManager → onAddProvider
    ↓ (calls addModelProvider from context)
FullChatContext.tsx → addModelProvider()
    ↓
Add to modelProviders array with unique ID
    ↓
Auto-save to localStorage
    ↓
Provider available in ModelSwitcher
```

### 4. File Upload Flow

```
User selects file(s)
    ↓
EnhancedChatInput → handleFileSelect()
    ↓
Read file using FileReader API
    ↓
Create Attachment object:
    - id, name, type, size
    - content (base64 for images/videos, text for documents)
    ↓
Add to attachments state
    ↓
Display attachment preview
    ↓
User sends message
    ↓
Message created with attachments array
    ↓
In API call, extract attachments:
    - Images → Convert to vision API format
    - Documents → Add to context/system prompt
```

## 🗄️ State Management

### FullChatContext State Structure

```typescript
{
  // Core Chat
  conversations: Conversation[],
  currentConversationId: string | null,
  settings: ChatSettings,
  abortController: AbortController | null,

  // Organization
  folders: Folder[],

  // Advanced Features
  mcpServers: MCPServer[],
  ragDocuments: RAGDocument[],
  customPrompts: CustomPrompt[],
  modelProviders: ModelProvider[],
  skills: Skill[],
  rules: Rule[],
  globalContexts: GlobalContext[],
  personas: Persona[],
}
```

### localStorage Keys

All data is persisted to localStorage with these keys:

```typescript
'ai-chat-conversations'     → Conversation[]
'ai-chat-settings'          → ChatSettings
'ai-chat-folders'           → Folder[]
'ai-chat-mcp'               → MCPServer[]
'ai-chat-rag'               → RAGDocument[]
'ai-chat-prompts'           → CustomPrompt[]
'ai-chat-providers'         → ModelProvider[]
'ai-chat-skills'            → Skill[]
'ai-chat-rules'             → Rule[]
'ai-chat-global-context'    → GlobalContext[]
'ai-chat-personas'          → Persona[]
```

## 🎯 Key Integration Points

### 1. Main Integration Point
**File:** `/src/app/context/FullChatContext.tsx`
**Function:** `simulateStreamingResponse()`
**Purpose:** Replace simulation with real API calls

### 2. Provider Configuration
**File:** `/src/app/context/FullChatContext.tsx`
**State:** `modelProviders`
**Purpose:** List of configured providers with API URLs and keys

### 3. Settings Management
**File:** `/src/app/context/FullChatContext.tsx`
**State:** `settings`
**Purpose:** Global configuration (temperature, maxTokens, etc.)

### 4. Conversation-Level Settings
**File:** `/src/app/types/chat.ts`
**Type:** `Conversation.settings: ConversationSettings`
**Purpose:** Override global settings per conversation

## 📊 Type System

### Core Types

```typescript
// Message in a conversation
Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
  attachments?: Attachment[]
  model?: string  // Which model generated this response
}

// Conversation
Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  model?: string  // Default model for this conversation
  folderId?: string
  settings?: ConversationSettings  // Override global settings
  isPrivate?: boolean
  personaId?: string
}

// Global settings
ChatSettings {
  activeProvider: string
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  enableRAG: boolean
  enableMCP: boolean
  enableSkills: boolean
  enableGlobalContext: boolean
  contextMode: 'global' | 'local' | 'hybrid'
  // ... more settings
}

// AI Provider
ModelProvider {
  id: string
  name: string
  type: 'ollama' | 'openai' | 'anthropic' | 'custom'
  apiUrl: string
  apiKey?: string
  models: string[]
  enabled: boolean
}

// File attachment
Attachment {
  id: string
  name: string
  type: string  // MIME type
  size: number
  content?: string  // base64 or text content
}
```

See [API_REFERENCE.md](./API_REFERENCE.md) for complete type definitions.

## 🔐 Security Architecture

### Privacy-First Design

```
User Data
    ↓
Browser localStorage (local only)
    ↓
React State (in-memory)
    ↓
Direct API calls to chosen provider
    ↓
AI Provider Servers (Ollama/OpenAI/Anthropic)

❌ No intermediary servers
❌ No data collection
❌ No telemetry
✅ All data stays local
✅ API keys stored in browser only
✅ Private mode disables learning
```

### API Key Handling

```typescript
// Storage
localStorage → encrypted or plain (configurable)

// Usage
Provider API calls only
Never sent to any other server

// Visibility
Password fields with toggle
Never logged or exposed

// Deletion
Clear all data functionality in settings
```

## 🧩 Feature Modules

### RAG (Retrieval Augmented Generation)

```
Document Upload
    ↓
Parse/chunk document
    ↓
Store in ragDocuments state
    ↓
When enabled:
    ↓
Extract relevant chunks (future: vector similarity)
    ↓
Add to system prompt
    ↓
Include in API call context
```

### MCP (Model Context Protocol)

```
Add MCP Server
    ↓
Fetch available tools
    ↓
Store in mcpServers state
    ↓
When enabled:
    ↓
Format tools as functions
    ↓
Include in API call (function calling)
    ↓
Execute tool if called
    ↓
Return result to conversation
```

### Global Context & Learning

```
User sends message (non-private conversation)
    ↓
Auto-learning enabled?
    ↓
Extract insights/preferences
    ↓
Store in globalContexts
    ↓
Future conversations:
    ↓
Load relevant global contexts
    ↓
Add to system prompt
    ↓
AI has context from previous conversations
```

### Skills System

```
Skills enabled in settings
    ↓
Available skills: web search, code execution, etc.
    ↓
AI determines when to use skill
    ↓
Execute skill (future implementation)
    ↓
Return result to AI
    ↓
AI incorporates into response
```

## 🎨 UI Component Architecture

### Component Communication Pattern

```typescript
// Parent → Child (Props)
<ChatMessage message={msg} onRegenerate={handleRegenerate} />

// Child → Parent (Callbacks)
const handleRegenerate = (messageId: string) => {
  regenerateResponse(messageId);
};

// Sibling Communication (Context)
useFullChat() // Shared state across all components
```

### State Update Pattern

```typescript
// Immutable updates
setConversations(prev => prev.map(conv => 
  conv.id === conversationId 
    ? { ...conv, messages: [...conv.messages, newMessage] }
    : conv
));

// Automatic localStorage sync via useEffect
useEffect(() => {
  localStorage.setItem('ai-chat-conversations', JSON.stringify(conversations));
}, [conversations]);
```

## 🔄 Routing Architecture

Using React Router Data Mode:

```typescript
// routes.ts
createBrowserRouter([
  {
    path: '/',
    Component: FullChatPage,
  },
  {
    path: '/settings',
    Component: AdvancedSettingsPage,
  },
]);

// Navigation
import { useNavigate } from 'react-router';
const navigate = useNavigate();
navigate('/settings');
```

## 📱 Responsive Design

```
Mobile (< 768px)
├── Collapsible sidebar
├── Full-width chat
└── Stacked settings tabs

Desktop (≥ 768px)
├── Fixed sidebar (280px)
├── Flexible chat area
└── Side-by-side settings tabs

All breakpoints use Tailwind CSS utility classes
```

## ⚡ Performance Considerations

### Optimization Strategies

1. **Memoization** - Use React.memo for expensive components
2. **Lazy Loading** - Code splitting for settings page
3. **Virtual Scrolling** - For long conversation lists (future)
4. **Debouncing** - Search input, auto-save
5. **Streaming** - Real-time response rendering

### State Updates

```typescript
// Efficient updates - only affected conversations re-render
setConversations(prev => prev.map(conv => 
  conv.id === conversationId ? updated : conv
));

// Avoid: Full array reconstruction
setConversations([...conversations, newConv]);
```

## 🧪 Testing Strategy

### Component Testing
- Render components with mock context
- Test user interactions
- Verify state updates

### Integration Testing
- Test full message flow
- Test provider switching
- Test file uploads

### E2E Testing
- Complete conversation flows
- Settings persistence
- Error handling

## 🚀 Deployment

### Build Process
```bash
npm run build
```

Output: `/dist` directory with static assets

### Hosting Options
- **Static hosting:** Vercel, Netlify, GitHub Pages
- **Self-hosted:** Any web server (Nginx, Apache)
- **Electron:** Desktop app wrapper

### Environment Variables
```
VITE_OLLAMA_URL=http://localhost:11434
VITE_DEFAULT_MODEL=llama2
```

## 📈 Future Architecture Enhancements

1. **Backend API** - Optional proxy server for API key security
2. **Vector Database** - For semantic RAG search
3. **WebSockets** - For real-time collaboration
4. **IndexedDB** - For larger data storage
5. **Service Workers** - Offline functionality
6. **Web Workers** - Background processing
7. **Plugin System** - Runtime plugin loading

## 🔍 Debugging

### Common Debug Points

```typescript
// Check current conversation
console.log('Current conversation:', getCurrentConversation());

// Check active provider
console.log('Active provider:', modelProviders.find(p => p.enabled));

// Check settings
console.log('Settings:', settings);

// Monitor message updates
useEffect(() => {
  console.log('Messages updated:', conversation?.messages);
}, [conversation?.messages]);
```

### localStorage Inspection
```javascript
// In browser console
Object.keys(localStorage)
  .filter(k => k.startsWith('ai-chat'))
  .forEach(k => console.log(k, JSON.parse(localStorage.getItem(k))));
```

---

This architecture is designed for simplicity, privacy, and extensibility. All components are loosely coupled through the context API, making it easy to modify or extend any part of the system.
