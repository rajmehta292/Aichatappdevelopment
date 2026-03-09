# AI Chat Pro - Complete Feature Documentation

## Overview
A comprehensive, privacy-focused AI chat application with advanced features including multiple model providers, context management, RAG, MCP integration, and more.

## 🚀 Core Features

### 1. **Multiple AI Model Providers**
Connect to different AI services based on your needs:
- **Ollama** (Local, most private)
- **OpenAI** (GPT-4, GPT-3.5, etc.)
- **Anthropic Claude** (Claude 3 family)
- **Custom providers**

**Benefits:**
- Switch between models without changing apps
- Use local models for privacy-sensitive work
- Access to latest cloud models when needed
- Cost optimization by provider

### 2. **Context Management System**

#### Global Context
- Information that persists across ALL conversations
- Examples: Your role, preferences, coding style, project info
- Manually add or let auto-learning build it

#### Local Context
- Information specific to one conversation only
- Exists in the message history

#### Hybrid Context (Recommended)
- Smart selection of relevant global context per conversation
- Best balance of personalization and focus

#### Auto-Learning
- AI learns patterns from your conversations
- Extracts preferences, guidelines, and important info
- Builds your personal knowledge base automatically
- **Privacy Note:** This happens entirely on your device!

**What Auto-Learning Captures:**
- "I prefer TypeScript" → Added to global context
- "I work in healthcare" → Added to work context
- Coding style preferences
- Communication preferences
- Project-specific information

**What It Doesn't Do:**
- Send any data to external servers
- Train AI models for other users
- Share your information

### 3. **Private Mode**
Two types of privacy:

#### Normal Mode (Default)
- Conversations saved to localStorage
- Auto-learning enabled (if configured)
- Context builds over time
- Perfect for: General work, learning, building knowledge

#### Private Mode
- Conversations still saved locally
- **Auto-learning DISABLED** for this chat
- Nothing added to global context
- Perfect for: Sensitive topics, medical info, confidential work

**Key Distinction:** Your data NEVER leaves your browser anyway. Private Mode just prevents auto-learning from this specific conversation.

### 4. **RAG (Retrieval Augmented Generation)**
Upload your own documents to create a knowledge base:

**Supported Files:**
- PDF, TXT, MD, DOC, DOCX, CSV, JSON

**How It Works:**
1. Upload document → Split into chunks
2. Each chunk is indexed (simulated - you can add embeddings)
3. When you ask questions, relevant chunks are retrieved
4. AI uses these chunks to provide accurate answers

**Use Cases:**
- Company documentation
- Research papers
- Technical manuals
- Code repositories
- Personal notes

### 5. **MCP (Model Context Protocol) Integration**
Connect external tools and APIs to your AI:

**Popular MCP Servers:**
- **GitHub:** Access repos, issues, PRs
- **Google Drive:** Search and manage files
- **Slack:** Send messages, read channels
- **PostgreSQL:** Query databases
- **Web Search:** Real-time information
- **Custom:** Build your own!

**Benefits:**
- AI can take actions, not just talk
- Real-time data access
- Workflow automation
- Extended capabilities

### 6. **AI Skills & Capabilities**
Enable/disable specific AI abilities:

#### Search Skills
- Web search for current information
- Document search in your knowledge base

#### Code Skills
- Code execution in sandbox
- Syntax checking
- Debugging assistance

#### Image Skills
- Image generation (requires API)
- Image analysis (with vision models)

#### Data Skills
- Data analysis and visualization
- CSV/Excel processing
- Statistical calculations

#### Web Skills
- Web scraping
- API interaction
- Content extraction

### 7. **Rules & Guardrails**
Set guidelines for AI behavior:

**Content Filters:**
- "Never provide medical diagnoses"
- "No financial advice"
- "Avoid sensitive topics"

**Behavior Guidelines:**
- "Always maintain professional tone"
- "Be concise in responses"
- "Ask clarifying questions"

**Output Format:**
- "Include code comments"
- "Use UK English spelling"
- "Format JSON responses"

**Privacy Controls:**
- "Never ask for personal data"
- "Don't store sensitive information"

### 8. **AI Personas**
Different personalities for different tasks:

#### Pre-built Personas:
1. **Professional Assistant**
   - Formal, detailed, work-focused
   - Temperature: 0.5 (precise)
   - Verbosity: Detailed

2. **Creative Partner**
   - Imaginative, expressive
   - Temperature: 1.2 (creative)
   - Use for: Brainstorming, writing, ideation

3. **Code Mentor**
   - Technical expert
   - Temperature: 0.3 (very precise)
   - Focus: Best practices, clean code

4. **Casual Friend**
   - Relaxed, conversational
   - Temperature: 0.8 (balanced)
   - Perfect for: Casual chats

**Create Custom Personas:**
- Define personality in system prompt
- Set temperature/creativity
- Choose verbosity level
- Apply per-conversation

### 9. **Folder Organization**
Organize conversations by topic:
- Color-coded folders
- Drag conversations into folders
- Nested folder support (coming soon)
- Filter by folder

**Organization Ideas:**
- By project
- By topic
- By sensitivity level
- By client/team

### 10. **Custom Prompts Library**
Save and reuse your favorite prompts:

**Categories:**
- Writing
- Coding
- Analysis
- Creative
- Business
- Education

**Pre-built Prompts:**
- Code Review
- Explain Like I'm 5
- Blog Post Writer
- Data Analyzer

**Create Your Own:**
- Templates with placeholders
- One-click to use
- Share across conversations

### 11. **Conversation Settings**
Override global settings per chat:

**What You Can Customize:**
- Temperature
- Max tokens
- System prompt
- Enable/disable RAG
- Enable/disable MCP
- Enable/disable Skills
- Context mode
- Persona

**Use Cases:**
- Creative chat → High temperature
- Code chat → Low temperature, Code Mentor persona
- Research chat → Enable RAG with your papers

## 🔒 Privacy & Security

### What's Stored Locally
- All conversations
- Settings and preferences
- Global context
- RAG documents (content only, not files)
- API keys (unencrypted)
- Folders and organization

### What Leaves Your Browser
**Only when YOU initiate:**
- Messages to your chosen AI provider
- MCP tool calls to servers you configure

**Never:**
- No analytics
- No tracking
- No telemetry
- No cloud backups (unless you export)

### Best Practices
1. **Maximum Privacy:**
   - Use Ollama running locally
   - Enable Private Mode for sensitive chats
   - Disable Auto-Learning if preferred
   - Don't use on shared computers

2. **Best Experience:**
   - Keep Auto-Learning on
   - Use folders to organize by sensitivity
   - Review Global Context regularly
   - Use Personas for different roles

3. **Shared Computers:**
   - Use private browsing mode
   - Clear data after use
   - Don't save API keys

## 📊 Data Management

### Export Options
- **Conversations:** JSON format
- **Single Chat:** Markdown format
- All settings and context included

### Import
- Restore from exported JSON
- Merge with existing data
- Full conversation history preserved

### Clear Data
- Delete everything at once
- Clear specific folders
- Remove old conversations
- Clean global context

## 🎯 Use Cases

### For Developers
- Code review with RAG on your codebase
- Use Code Mentor persona
- MCP GitHub integration
- Rules for code style

### For Writers
- Creative Partner persona
- Custom prompts for different formats
- Context with style guidelines
- High temperature for creativity

### For Researchers
- RAG with research papers
- Organized folders by topic
- Context with methodologies
- Low temperature for accuracy

### For Business
- Professional Assistant persona
- MCP integrations (Slack, Drive)
- Rules for brand voice
- Context with company info

### For Students
- ELI5 prompts
- RAG with textbooks
- Organized by subject
- Context with course info

## 🔧 Technical Integration

### Ollama Integration
```javascript
// In FullChatContext.tsx, update simulateStreamingResponse:
const response = await fetch(`${settings.ollamaUrl}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: settings.model,
    prompt: content,
    stream: true,
    system: systemPrompt,
    options: {
      temperature: settings.temperature,
      top_k: settings.topK,
      top_p: settings.topP,
    },
  }),
});
```

### OpenAI Integration
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${settings.openaiApiKey}`,
  },
  body: JSON.stringify({
    model: settings.model,
    messages: conversationMessages,
    temperature: settings.temperature,
    stream: true,
  }),
});
```

### Claude Integration
```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': settings.anthropicApiKey,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: settings.model,
    messages: conversationMessages,
    max_tokens: settings.maxTokens,
    temperature: settings.temperature,
    stream: true,
  }),
});
```

## 🚀 Getting Started

1. **First Launch:**
   - App opens with default Ollama settings
   - Create your first conversation
   - Explore settings

2. **Add AI Provider:**
   - Go to Settings → Providers
   - Add Ollama/OpenAI/Claude
   - Enter API keys if needed
   - Select active provider

3. **Setup Context (Optional):**
   - Go to Settings → Context
   - Add information about yourself
   - Enable Auto-Learning
   - Choose context mode

4. **Create Personas (Optional):**
   - Go to Settings → Personas
   - Use templates or create custom
   - Apply to conversations

5. **Upload Documents (Optional):**
   - Go to Settings → RAG
   - Upload PDFs, docs, etc.
   - Enable for relevant chats

6. **Start Chatting:**
   - Create conversation
   - Select persona if desired
   - Chat Settings button for overrides
   - Private Mode toggle if needed

## 💡 Tips & Tricks

1. **Organize Early:** Create folders from the start
2. **Use Private Mode:** For anything sensitive
3. **Review Context:** Periodically check what's been learned
4. **Experiment with Personas:** Different tasks need different approaches
5. **Leverage Prompts:** Build a library of your common requests
6. **Set Rules:** Establish guidelines early
7. **Export Regularly:** Backup important conversations
8. **Per-Chat Settings:** Override for special cases

## 🔄 Future Enhancements

Potential additions (not yet implemented):
- Voice input/output
- Image upload and analysis
- Conversation branching
- Team collaboration
- Cloud sync (optional)
- Mobile app
- Browser extension
- API for integrations

## 📝 Notes

- **No Server Required:** Runs entirely in browser
- **No Account Needed:** Just use it
- **Open Source:** Modify as you wish
- **Privacy First:** Your data stays yours
- **Extensible:** Add your own features

---

**Remember:** This is YOUR AI assistant. Configure it however works best for you. There's no "right way" - experiment and find your perfect setup!
