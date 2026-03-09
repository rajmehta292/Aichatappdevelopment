# Contributing Guide

Guide for developers and AI assistants working on this codebase.

## 🎯 For AI Assistants

This project is designed to be easily understood and extended by AI coding assistants. All critical integration points are clearly marked and documented.

### Primary Integration Task

**File:** `/src/app/context/FullChatContext.tsx`  
**Function:** `simulateStreamingResponse` (line ~339)  
**Task:** Replace simulated streaming with real AI provider API calls

**Complete implementation examples are in [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)**

## 📁 Project Structure

```
ai-chat-app/
├── src/app/
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components (Radix)
│   │   ├── ChatMessage.tsx  # Message rendering
│   │   ├── EnhancedChatInput.tsx  # Input with file upload
│   │   ├── ModelSwitcher.tsx      # Model selection dropdown
│   │   ├── ProviderSetupWizard.tsx  # Provider onboarding
│   │   ├── ExtendedChatSidebar.tsx  # Sidebar with folders
│   │   └── ...
│   ├── context/
│   │   └── FullChatContext.tsx  # 🔴 MAIN STATE & INTEGRATION POINT
│   ├── pages/
│   │   ├── FullChatPage.tsx       # Main chat UI
│   │   └── AdvancedSettingsPage.tsx  # Settings UI
│   ├── types/
│   │   └── chat.ts          # All TypeScript types
│   ├── routes.ts            # React Router config
│   └── App.tsx              # App entry point
├── docs/                    # Documentation (you are here)
├── public/                  # Static assets
└── package.json
```

## 🔑 Key Files to Understand

### 1. FullChatContext.tsx
**Location:** `/src/app/context/FullChatContext.tsx`  
**Purpose:** Central state management and API integration  
**Key Functions:**
- `sendMessage()` - Handles user message submission
- `simulateStreamingResponse()` - **REPLACE THIS** with real API calls
- `addMessage()`, `updateMessage()` - Message management
- `addModelProvider()` - Provider configuration

### 2. chat.ts
**Location:** `/src/app/types/chat.ts`  
**Purpose:** All TypeScript type definitions  
**Key Types:**
- `Message`, `Conversation`, `Attachment`
- `ModelProvider`, `ChatSettings`
- `RAGDocument`, `MCPServer`, `Skill`, `Rule`, `Persona`

### 3. FullChatPage.tsx
**Location:** `/src/app/pages/FullChatPage.tsx`  
**Purpose:** Main chat interface  
**Key Features:**
- Message list rendering
- Chat input handling
- Settings integration
- Model switching UI

## 🔄 Data Flow

```
User Action (EnhancedChatInput)
    ↓
FullChatPage.handleSend()
    ↓
FullChatContext.sendMessage(content, attachments)
    ↓
1. Create user message
2. Add to conversation
3. Create empty assistant message
4. Call simulateStreamingResponse()
    ↓
🔴 simulateStreamingResponse() - INTEGRATION POINT
    ↓
Determine provider type (settings.activeProvider)
    ↓
Call appropriate API (Ollama/OpenAI/Anthropic)
    ↓
Stream response chunks
    ↓
Update assistant message in real-time
    ↓
Mark complete (isStreaming: false)
    ↓
Auto-save to localStorage
```

## 🛠️ Development Workflow

### Setup
```bash
git clone <repo>
cd ai-chat-app
npm install
npm run dev
```

### Making Changes

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature
```

2. **Make changes**
- Follow existing code patterns
- Use TypeScript types
- Update relevant documentation

3. **Test locally**
```bash
npm run dev
# Manually test your changes
```

4. **Build**
```bash
npm run build
```

5. **Commit**
```bash
git add .
git commit -m "feat: your feature description"
```

## 📝 Code Style

### TypeScript

```typescript
// ✅ Good - Explicit types
interface MessageProps {
  message: Message;
  onRegenerate: (id: string) => void;
}

// ❌ Bad - No types
function handleMessage(msg, callback) {
  // ...
}
```

### React Components

```typescript
// ✅ Good - Functional component with props interface
interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return <div>{message.content}</div>;
}

// ❌ Bad - No interface, any types
export function ChatMessage(props: any) {
  return <div>{props.message.content}</div>;
}
```

### State Updates

```typescript
// ✅ Good - Immutable update
setConversations(prev => prev.map(conv =>
  conv.id === id ? { ...conv, title: newTitle } : conv
));

// ❌ Bad - Mutation
conversations[0].title = newTitle;
setConversations(conversations);
```

## 🧩 Adding New Features

### Adding a New Provider Type

1. **Update type definition** (`/src/app/types/chat.ts`)
```typescript
type ProviderType = 'ollama' | 'openai' | 'anthropic' | 'custom' | 'newprovider';
```

2. **Add template** (`/src/app/components/ProviderSetupWizard.tsx`)
```typescript
const PROVIDER_TEMPLATES = [
  // ... existing providers
  {
    name: 'New Provider',
    type: 'newprovider',
    description: 'Description',
    apiUrl: 'https://api.newprovider.com',
    models: ['model-1', 'model-2'],
    requiresKey: true,
    icon: '🆕',
    setup: {
      title: 'Setup New Provider',
      steps: ['Step 1', 'Step 2'],
      link: 'https://newprovider.com',
    },
  },
];
```

3. **Add API integration** (`/src/app/context/FullChatContext.tsx`)
```typescript
const simulateStreamingResponse = async (...) => {
  // ... existing code
  
  switch (activeProvider.type) {
    case 'ollama': /* ... */
    case 'openai': /* ... */
    case 'anthropic': /* ... */
    case 'newprovider':
      await streamNewProviderResponse(...);
      break;
  }
};

const streamNewProviderResponse = async (...) => {
  // Implementation
};
```

### Adding a New Skill

1. **Update DEFAULT_SKILLS** (`/src/app/context/FullChatContext.tsx`)
```typescript
const DEFAULT_SKILLS: Skill[] = [
  // ... existing skills
  {
    id: '7',
    name: 'New Skill',
    description: 'What this skill does',
    enabled: false,
    category: 'other',
    requiresApi: false,
  },
];
```

2. **Implement skill logic** (in API integration)
```typescript
if (settings.enableSkills && skills.find(s => s.name === 'New Skill' && s.enabled)) {
  // Execute skill logic
}
```

### Adding a Settings Tab

1. **Update AdvancedSettingsPage.tsx**
```typescript
<Tabs defaultValue="providers">
  <TabsList>
    {/* ... existing tabs */}
    <TabsTrigger value="newtab">New Tab</TabsTrigger>
  </TabsList>
  
  {/* ... existing content */}
  
  <TabsContent value="newtab">
    <div>
      <h2>New Feature</h2>
      {/* Your settings UI */}
    </div>
  </TabsContent>
</Tabs>
```

2. **Add state management** (if needed)
```typescript
// In FullChatContext.tsx
const [newFeatureData, setNewFeatureData] = useState([]);

// Add to context value
return (
  <FullChatContext.Provider value={{
    // ... existing values
    newFeatureData,
    addNewFeature: (data) => setNewFeatureData(prev => [...prev, data]),
  }}>
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create new conversation
- [ ] Send message
- [ ] Upload file attachment
- [ ] Switch model mid-conversation
- [ ] Create folder
- [ ] Move conversation to folder
- [ ] Change settings
- [ ] Enable RAG
- [ ] Add provider
- [ ] Export conversation
- [ ] Enable private mode
- [ ] Test on mobile viewport

### Testing Provider Integration

```typescript
// After implementing real API calls

// Test 1: Basic message
await sendMessage('Hello');
// Expect: AI response streams back

// Test 2: With attachments
await sendMessage('What is this?', [imageAttachment]);
// Expect: AI describes the image

// Test 3: Stop generation
sendMessage('Long response...');
setTimeout(() => stopGeneration(), 1000);
// Expect: Response stops mid-stream

// Test 4: Error handling
// Remove API key, send message
// Expect: Error message shown to user
```

## 📦 Dependencies

### Core Dependencies
- `react` - UI framework
- `react-router` - Routing (NOT react-router-dom)
- `tailwindcss` - Styling
- `@radix-ui/*` - UI components

### Optional Future Dependencies
- `tiktoken` - Token counting
- `@langchain/*` - Advanced RAG/chains
- `vector-db-client` - Vector embeddings for RAG

### Installing New Packages

```bash
npm install package-name

# Update package.json
# Document why package is needed
```

## 🔐 Security Guidelines

### API Keys
```typescript
// ❌ Never commit API keys
const apiKey = 'sk-1234...';

// ✅ Use environment variables or user input
const apiKey = import.meta.env.VITE_OPENAI_KEY || provider.apiKey;
```

### localStorage Security
```typescript
// ⚠️ Current: Plain text in localStorage
localStorage.setItem('api-key', apiKey);

// ✅ Better: Encrypt before storing (for production)
const encrypted = await encrypt(apiKey);
localStorage.setItem('api-key', encrypted);
```

### XSS Prevention
```typescript
// ✅ Already handled by React
// React auto-escapes content
<div>{message.content}</div>

// ⚠️ Be careful with dangerouslySetInnerHTML
// Only use for markdown rendering with sanitization
```

## 📊 Performance Guidelines

### State Updates
```typescript
// ✅ Update only what changed
setConversations(prev => prev.map(conv =>
  conv.id === id ? { ...conv, messages: [...conv.messages, msg] } : conv
));

// ❌ Don't recreate entire array
setConversations([...conversations]);
```

### Component Optimization
```typescript
// ✅ Memoize expensive components
const ChatMessage = memo(({ message }) => {
  // ...
});

// ✅ Use useMemo for expensive computations
const sortedMessages = useMemo(
  () => messages.sort((a, b) => a.timestamp - b.timestamp),
  [messages]
);
```

### localStorage Limits
```typescript
// localStorage has ~5-10MB limit
// Monitor size:
const size = new Blob(Object.values(localStorage)).size;
console.log('localStorage size:', size / 1024 / 1024, 'MB');

// Consider IndexedDB for larger data
```

## 🐛 Debugging

### Enable Debug Logs

```typescript
// Add to FullChatContext.tsx
const DEBUG = true;

const sendMessage = async (content, attachments) => {
  if (DEBUG) {
    console.log('sendMessage called:', { content, attachments });
    console.log('Current conversation:', getCurrentConversation());
    console.log('Active provider:', modelProviders.find(p => p.enabled));
  }
  // ...
};
```

### Inspect localStorage

```javascript
// In browser console
// View all data
Object.keys(localStorage)
  .filter(k => k.startsWith('ai-chat'))
  .forEach(k => console.log(k, JSON.parse(localStorage.getItem(k))));

// Clear all data
Object.keys(localStorage)
  .filter(k => k.startsWith('ai-chat'))
  .forEach(k => localStorage.removeItem(k));
```

### React DevTools

1. Install React DevTools extension
2. Inspect component tree
3. View FullChatContext state
4. Monitor re-renders

## 📖 Documentation Updates

When adding features, update:

1. **API_REFERENCE.md** - If adding new types
2. **INTEGRATION_GUIDE.md** - If changing API integration
3. **ARCHITECTURE.md** - If changing data flow
4. **README.md** - If adding major features

## 🤝 Pull Request Process

1. **Create feature branch**
```bash
git checkout -b feature/amazing-feature
```

2. **Make changes**
- Follow code style
- Add types
- Test thoroughly

3. **Update documentation**
- Update relevant .md files
- Add code comments

4. **Create PR**
- Descriptive title
- List changes
- Link to issues (if applicable)

5. **Review**
- Address feedback
- Update as needed

## 🎯 Common Tasks for AI Assistants

### Task: Add Ollama Integration

**File:** `/src/app/context/FullChatContext.tsx`

```typescript
// 1. Add this function after simulateStreamingResponse
const streamOllamaResponse = async (conversationId, messageId, messages, settings, provider, controller) => {
  // See INTEGRATION_GUIDE.md for complete implementation
};

// 2. Update simulateStreamingResponse to call it
const simulateStreamingResponse = async (conversationId, messageId) => {
  // ... existing code
  
  if (activeProvider.type === 'ollama') {
    await streamOllamaResponse(conversationId, messageId, messages, settings, activeProvider, controller);
  }
};
```

### Task: Add File Preview for Attachments

**File:** `/src/app/components/ChatMessage.tsx`

```typescript
// Add after message content rendering
{message.attachments && message.attachments.length > 0 && (
  <div className="mt-2 space-y-2">
    {message.attachments.map(att => (
      <div key={att.id} className="border rounded p-2">
        {att.type.startsWith('image/') ? (
          <img src={att.content} alt={att.name} className="max-w-xs" />
        ) : (
          <div className="flex items-center gap-2">
            <FileIcon />
            <span>{att.name}</span>
          </div>
        )}
      </div>
    ))}
  </div>
)}
```

### Task: Add Token Counting

```typescript
// 1. Install tiktoken
// npm install tiktoken

// 2. Add function
import { encoding_for_model } from 'tiktoken';

const countTokens = (text: string, model: string) => {
  const encoder = encoding_for_model(model);
  const tokens = encoder.encode(text);
  return tokens.length;
};

// 3. Use in sendMessage
const tokenCount = countTokens(content, settings.model);
const userMessage: Message = {
  // ... existing fields
  tokenCount,
};
```

## 💡 Tips for Success

1. **Start with INTEGRATION_GUIDE.md** - It has complete code examples
2. **Understand the data flow** - See ARCHITECTURE.md
3. **Use TypeScript** - Types prevent bugs
4. **Test locally** - Always test before committing
5. **Update docs** - Keep documentation current
6. **Ask questions** - Check existing issues or documentation

## 🚀 Next Steps

1. Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. Understand [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Review [API_REFERENCE.md](./API_REFERENCE.md)
4. Start coding!

---

**Questions?** Check the documentation or create an issue. Happy coding! 🎉
