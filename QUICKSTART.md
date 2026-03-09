# Quick Start Guide

Get your AI Chat Application up and running in minutes.

## 🚀 Installation

### Prerequisites
- Node.js 18+ or npm/pnpm/yarn
- A modern web browser

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```

3. **Open in browser**
```
http://localhost:5173
```

That's it! The application is now running with simulated responses.

## 🔌 Connecting Real AI Providers

### Option 1: Ollama (Local, Free, Recommended for Testing)

**Step 1: Install Ollama**
```bash
# Visit https://ollama.ai and download for your OS
# Or use package manager:

# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

**Step 2: Pull a model**
```bash
ollama pull llama2
# or
ollama pull llama3
# or
ollama pull mistral
```

**Step 3: Start Ollama**
```bash
ollama serve
```

**Step 4: Configure in the app**
1. Click "Settings" in the sidebar
2. Go to "Providers" tab
3. Click "Add Provider"
4. Select "Ollama"
5. Use default URL: `http://localhost:11434`
6. Click through the wizard

**Step 5: Integrate the backend** (See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md))

### Option 2: OpenAI (Cloud, Paid)

**Step 1: Get API key**
1. Go to https://platform.openai.com/api-keys
2. Create an account or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Step 2: Configure in the app**
1. Click "Settings" in the sidebar
2. Go to "Providers" tab
3. Click "Add Provider"
4. Select "OpenAI"
5. Paste your API key
6. Click through the wizard

**Step 3: Integrate the backend** (See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md))

### Option 3: Anthropic/Claude (Cloud, Paid)

**Step 1: Get API key**
1. Go to https://console.anthropic.com/
2. Create an account or log in
3. Navigate to API Keys
4. Create a new key
5. Copy the key (starts with `sk-ant-`)

**Step 2: Configure in the app**
1. Click "Settings" in the sidebar
2. Go to "Providers" tab
3. Click "Add Provider"
4. Select "Anthropic (Claude)"
5. Paste your API key
6. Click through the wizard

**Step 3: Integrate the backend** (See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md))

## ⚡ 5-Minute Backend Integration

**File:** `/src/app/context/FullChatContext.tsx`
**Line:** ~339 (function `simulateStreamingResponse`)

1. **Find the function:**
```typescript
const simulateStreamingResponse = async (conversationId: string, messageId: string) => {
  // ... current simulation code
};
```

2. **Replace with real implementation:**

Copy the complete integration code from [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md#-real-implementation), which includes:
- Main `simulateStreamingResponse` function
- `streamOllamaResponse` for Ollama
- `streamOpenAIResponse` for OpenAI  
- `streamAnthropicResponse` for Anthropic

3. **Test your integration:**
```bash
# Start your app
npm run dev

# Open browser
# Select your provider in settings
# Start chatting!
```

## 📚 Key Features to Try

### 1. Basic Chat
- Type a message and press Enter
- Messages support **Markdown** formatting
- Code blocks have **syntax highlighting**

### 2. File Uploads
- Click the paperclip icon in the chat input
- Upload images, documents, videos, code files, ZIP files
- AI can "see" images (with vision-capable models like GPT-4o, Claude 3)

### 3. Model Switching
- Switch models mid-conversation using the dropdown in the chat header
- Try different models for different tasks

### 4. Conversation Organization
- Create folders in the sidebar
- Drag conversations into folders
- Tag conversations for easy searching

### 5. Settings
- **Quick Settings:** Click gear icon for basic settings
- **Advanced Settings:** Click main "Settings" in sidebar for all options
  - 10 tabs with complete configuration
  - Providers, RAG, MCP, Prompts, Skills, Rules, Context, Personas, Data

### 6. Advanced Features

**RAG (Document Chat)**
1. Go to Settings → RAG
2. Upload documents (PDF, TXT, MD, etc.)
3. Enable "RAG" in conversation settings
4. AI will reference your documents

**Private Mode**
1. Click conversation settings (gear in chat header)
2. Enable "Private Mode"
3. AI won't learn from this conversation

**AI Personas**
1. Go to Settings → Personas
2. Create a persona (e.g., "Code Tutor", "Creative Writer")
3. Select persona for a conversation
4. AI adapts its personality

**Custom Prompts**
1. Go to Settings → Prompts
2. Create reusable prompts
3. Organize by category
4. Quick-insert into conversations

## 🎯 Common Use Cases

### Use Case 1: Code Assistant
1. Set model to `codellama` (Ollama) or `gpt-4` (OpenAI)
2. Create persona: "Code Tutor" with technical system prompt
3. Upload code files as attachments
4. Ask for code review, debugging, or explanations

### Use Case 2: Document Research
1. Go to Settings → RAG
2. Upload research papers, documentation
3. Enable RAG in conversation
4. Ask questions about your documents

### Use Case 3: Creative Writing
1. Create persona: "Creative Writer"
2. Set temperature to 0.9 (more creative)
3. Use custom prompts for story templates
4. Generate and iterate on creative content

### Use Case 4: Private Journaling
1. Enable "Private Mode" in conversation settings
2. AI won't learn from these conversations
3. All data stays local in your browser
4. Export conversations as needed

## 🔒 Privacy & Security

**All data is stored locally:**
- Conversations → `localStorage`
- Settings → `localStorage`
- API keys → `localStorage` (consider encryption for production)

**No external servers:**
- API calls go directly to your chosen provider
- No intermediary servers
- No data collection or telemetry

**Private Mode:**
- Disables learning and context retention
- Perfect for sensitive conversations
- Can be enabled per-conversation

## 🐛 Troubleshooting

### Issue: "No models configured"
**Solution:** Add a provider in Settings → Providers

### Issue: Ollama connection failed
**Solution:** 
1. Make sure Ollama is running: `ollama serve`
2. Check URL is `http://localhost:11434`
3. Try: `ollama list` to see installed models

### Issue: OpenAI/Anthropic API error
**Solution:**
1. Verify API key is correct
2. Check you have credits/billing enabled
3. Ensure model name is correct (e.g., `gpt-4o`, not `gpt4`)

### Issue: File upload not working
**Solution:**
1. Ensure model supports vision (for images)
2. Check file size limits
3. For backend integration, handle attachments in API call

### Issue: Settings not saving
**Solution:**
1. Check browser console for errors
2. Ensure localStorage is enabled
3. Try clearing cache and reloading

### Issue: Streaming not working
**Solution:**
1. After backend integration, ensure `stream: true` in API request
2. Check network tab for streaming response
3. Verify response parsing matches provider format

## 📖 Next Steps

1. **Read the Integration Guide:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
   - Complete code examples for all providers
   - Streaming implementation
   - Error handling

2. **Understand the Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
   - Component structure
   - Data flow
   - State management

3. **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)
   - Complete type definitions
   - Function signatures
   - Usage examples

4. **Customize the App:**
   - Add new models to provider templates
   - Create custom personas
   - Build skills and tools
   - Add new UI components

## 🤝 Getting Help

**Documentation:**
- README.md - Project overview
- INTEGRATION_GUIDE.md - Backend integration
- ARCHITECTURE.md - System design
- API_REFERENCE.md - Type definitions

**Code Organization:**
- `/src/app/components/` - All React components
- `/src/app/context/` - State management
- `/src/app/pages/` - Route pages
- `/src/app/types/` - TypeScript types

**Key Files:**
- `FullChatContext.tsx` - Main state and integration point
- `FullChatPage.tsx` - Main chat UI
- `AdvancedSettingsPage.tsx` - Settings UI
- `chat.ts` - Type definitions

## ✨ Tips & Tricks

1. **Keyboard Shortcuts:**
   - `Enter` - Send message
   - `Shift + Enter` - New line
   - `Cmd/Ctrl + K` - New conversation (future)

2. **Markdown Support:**
   - Use `**bold**`, `*italic*`, `~~strikethrough~~`
   - Code blocks: ``` ```typescript ... ``` ```
   - Lists, headers, links all supported

3. **Model Selection:**
   - Small tasks: llama2, gpt-3.5-turbo, claude-haiku
   - Complex tasks: llama3, gpt-4o, claude-sonnet
   - Code: codellama, gpt-4, claude-sonnet
   - Vision: gpt-4o, claude-3 (with image uploads)

4. **Performance:**
   - Use local models (Ollama) for speed and privacy
   - Cloud models for advanced reasoning
   - Adjust temperature for creativity vs accuracy

5. **Cost Management:**
   - Use Ollama (free) for most tasks
   - Reserve OpenAI/Claude for complex queries
   - Monitor token usage in settings
   - Set max_tokens limits

---

**Ready to build?** Start chatting with the simulated responses, then follow the [Integration Guide](./INTEGRATION_GUIDE.md) to connect real AI providers!
