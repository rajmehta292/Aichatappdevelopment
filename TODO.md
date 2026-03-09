# TODO - Backend Integration Checklist

Quick checklist for AI assistants or developers implementing the backend integration.

## 🎯 Primary Task: Connect Real AI Providers

**File:** `/src/app/context/FullChatContext.tsx`  
**Function:** `simulateStreamingResponse` (line ~339)  
**Guide:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

---

## ✅ Checklist

### Setup & Understanding
- [ ] Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- [ ] Understand [ARCHITECTURE.md](./ARCHITECTURE.md) data flow
- [ ] Review type definitions in [API_REFERENCE.md](./API_REFERENCE.md)
- [ ] Locate `simulateStreamingResponse` function in FullChatContext.tsx

### Code Implementation
- [ ] Copy `streamOllamaResponse` function from INTEGRATION_GUIDE.md
- [ ] Copy `streamOpenAIResponse` function from INTEGRATION_GUIDE.md
- [ ] Copy `streamAnthropicResponse` function from INTEGRATION_GUIDE.md
- [ ] Replace main `simulateStreamingResponse` function with router code
- [ ] Ensure proper error handling is in place
- [ ] Verify AbortController integration for stop functionality

### Testing - Ollama (Local)
- [ ] Install Ollama (`brew install ollama` or from ollama.ai)
- [ ] Pull a model (`ollama pull llama2`)
- [ ] Start Ollama (`ollama serve`)
- [ ] Add Ollama provider in app settings
- [ ] Send test message
- [ ] Verify streaming works
- [ ] Test stop generation
- [ ] Test with image attachment (if model supports)

### Testing - OpenAI (Cloud)
- [ ] Get API key from platform.openai.com
- [ ] Add OpenAI provider in app settings
- [ ] Enter API key
- [ ] Send test message
- [ ] Verify streaming works
- [ ] Test with gpt-4o (vision model)
- [ ] Test image attachment
- [ ] Verify error handling (invalid key, rate limits)

### Testing - Anthropic/Claude (Cloud)
- [ ] Get API key from console.anthropic.com
- [ ] Add Anthropic provider in app settings
- [ ] Enter API key
- [ ] Send test message
- [ ] Verify streaming works
- [ ] Test with Claude 3 model
- [ ] Test image attachment
- [ ] Verify error handling

### Feature Testing
- [ ] Test model switching mid-conversation
- [ ] Test file uploads (images, documents, code)
- [ ] Test conversation-level settings overrides
- [ ] Test private mode (no learning)
- [ ] Test system prompt customization
- [ ] Test temperature adjustment
- [ ] Test max tokens limit
- [ ] Test conversation export

### Advanced Features (Optional)
- [ ] Implement RAG document context
- [ ] Implement vector embeddings for RAG
- [ ] Implement MCP tool calling
- [ ] Implement skills execution
- [ ] Implement rules enforcement
- [ ] Implement token counting (tiktoken)
- [ ] Implement auto-learning

### Production Preparation
- [ ] Add proper error messages for users
- [ ] Add retry logic for failed requests
- [ ] Add rate limiting handling
- [ ] Consider API key encryption
- [ ] Test CORS configuration
- [ ] Setup environment variables
- [ ] Review security considerations
- [ ] Test on different browsers
- [ ] Test on mobile devices

### Deployment (Optional)
- [ ] Build for production (`npm run build`)
- [ ] Test production build (`npm run preview`)
- [ ] Choose deployment platform (Vercel, Netlify, etc.)
- [ ] Configure environment variables
- [ ] Deploy application
- [ ] Test deployed version
- [ ] Setup custom domain (optional)
- [ ] Configure HTTPS

---

## 📝 Quick Code Reference

### Where to Add Code

```typescript
// File: /src/app/context/FullChatContext.tsx
// Around line 339

// 1. Add these three functions:
const streamOllamaResponse = async (...) => { /* See INTEGRATION_GUIDE.md */ };
const streamOpenAIResponse = async (...) => { /* See INTEGRATION_GUIDE.md */ };
const streamAnthropicResponse = async (...) => { /* See INTEGRATION_GUIDE.md */ };

// 2. Replace simulateStreamingResponse with:
const simulateStreamingResponse = async (conversationId: string, messageId: string) => {
  const controller = new AbortController();
  setAbortController(controller);

  const conversation = conversations.find(c => c.id === conversationId);
  const activeProvider = modelProviders.find(p => p.enabled);
  const messages = conversation.messages.filter(m => m.id !== messageId);
  
  try {
    switch (activeProvider.type) {
      case 'ollama':
        await streamOllamaResponse(conversationId, messageId, messages, settings, activeProvider, controller);
        break;
      case 'openai':
        await streamOpenAIResponse(conversationId, messageId, messages, settings, activeProvider, controller);
        break;
      case 'anthropic':
        await streamAnthropicResponse(conversationId, messageId, messages, settings, activeProvider, controller);
        break;
    }
  } catch (error) {
    // Error handling
  }
  
  setAbortController(null);
};
```

### Complete Code

**See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Has complete, copy-paste ready code for all three providers.

---

## 🐛 Common Issues & Solutions

### Issue: "No models configured"
**Solution:** Add a provider in Settings → Providers → Add Provider

### Issue: Ollama connection error
**Solution:** 
1. Ensure Ollama is running: `ollama serve`
2. Check URL is `http://localhost:11434`
3. Try `ollama list` to verify installation

### Issue: OpenAI/Anthropic API error
**Solution:**
1. Verify API key is correct
2. Check you have credits/billing enabled
3. Ensure model name matches exactly (e.g., `gpt-4o` not `gpt4`)

### Issue: CORS error
**Solution:**
1. For Ollama: Configure CORS in Ollama settings
2. For cloud APIs: May need backend proxy in production

### Issue: Streaming not working
**Solution:**
1. Ensure `stream: true` in API request
2. Check response is properly parsed
3. Verify state updates are working

### Issue: Stop generation not working
**Solution:**
1. Ensure AbortController is passed to fetch
2. Verify controller.signal.aborted is checked in loops
3. Test with `onStop` prop in UI

---

## 📚 Resources

- **Integration Guide:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)

### Provider Documentation
- **Ollama:** https://github.com/ollama/ollama/blob/main/docs/api.md
- **OpenAI:** https://platform.openai.com/docs/api-reference/chat
- **Anthropic:** https://docs.anthropic.com/claude/reference/messages_post

---

## ⏱️ Time Estimate

- **Reading docs:** 15-30 minutes
- **Code implementation:** 15-30 minutes
- **Testing:** 30-60 minutes
- **Total:** 1-2 hours for complete integration

---

## 🎯 Success Criteria

Integration is complete when:
- ✅ Can send messages to Ollama and receive responses
- ✅ Can send messages to OpenAI and receive responses
- ✅ Can send messages to Anthropic and receive responses
- ✅ Streaming works for all providers
- ✅ Stop generation works
- ✅ File attachments work (images with vision models)
- ✅ Error handling shows user-friendly messages
- ✅ Model switching works mid-conversation
- ✅ Settings (temperature, etc.) are applied correctly

---

**Ready to start?** Open [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) and follow the code examples! 🚀
