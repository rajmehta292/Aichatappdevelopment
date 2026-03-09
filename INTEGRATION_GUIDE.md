# AI Provider Integration Guide

This guide shows you exactly how to connect real AI providers (Ollama, OpenAI, Anthropic) to this application.

## 📍 Integration Location

**File:** `/src/app/context/FullChatContext.tsx`
**Function:** `simulateStreamingResponse` (approximately line 339)

This is the ONLY function you need to modify to connect real AI providers.

## 🎯 Current Implementation

Currently, the function simulates a streaming response:

```typescript
const simulateStreamingResponse = async (conversationId: string, messageId: string) => {
  const controller = new AbortController();
  setAbortController(controller);

  // Simulated response...
  const sampleResponse = `I'm ready to connect to your AI provider...`;
  
  // Word-by-word streaming simulation
  const words = sampleResponse.split(' ');
  let currentText = '';

  for (let i = 0; i < words.length; i++) {
    if (controller.signal.aborted) break;
    currentText += (i > 0 ? ' ' : '') + words[i];
    
    // Update state with current text
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: conv.messages.map(msg => 
            msg.id === messageId ? { ...msg, content: currentText } : msg
          ),
        };
      }
      return conv;
    }));

    await new Promise(resolve => setTimeout(resolve, 30));
  }

  // Mark streaming as complete
  setConversations(prev => prev.map(conv => {
    if (conv.id === conversationId) {
      return {
        ...conv,
        messages: conv.messages.map(msg => 
          msg.id === messageId ? { ...msg, isStreaming: false } : msg
        ),
      };
    }
    return conv;
  }));

  setAbortController(null);
};
```

## 🔄 Real Implementation

Replace the entire `simulateStreamingResponse` function with this:

```typescript
const simulateStreamingResponse = async (conversationId: string, messageId: string) => {
  const controller = new AbortController();
  setAbortController(controller);

  const conversation = conversations.find(c => c.id === conversationId);
  if (!conversation) return;

  // Get the active provider
  const activeProvider = modelProviders.find(p => p.enabled);
  if (!activeProvider) {
    console.error('No active provider found');
    return;
  }

  // Get conversation messages for context
  const messages = conversation.messages.filter(m => m.id !== messageId);
  
  // Get effective settings (conversation-level overrides global)
  const effectiveSettings = {
    ...settings,
    ...conversation.settings,
  };

  // Determine which API to call
  try {
    switch (activeProvider.type) {
      case 'ollama':
        await streamOllamaResponse(conversationId, messageId, messages, effectiveSettings, activeProvider, controller);
        break;
      case 'openai':
        await streamOpenAIResponse(conversationId, messageId, messages, effectiveSettings, activeProvider, controller);
        break;
      case 'anthropic':
        await streamAnthropicResponse(conversationId, messageId, messages, effectiveSettings, activeProvider, controller);
        break;
      default:
        console.error('Unsupported provider type:', activeProvider.type);
    }
  } catch (error) {
    console.error('Error streaming response:', error);
    
    // Update message with error
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: conv.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, isStreaming: false } 
              : msg
          ),
        };
      }
      return conv;
    }));
  }

  setAbortController(null);
};
```

## 🦙 Ollama Integration

Add this function to FullChatContext.tsx:

```typescript
const streamOllamaResponse = async (
  conversationId: string,
  messageId: string,
  messages: Message[],
  settings: ChatSettings,
  provider: ModelProvider,
  controller: AbortController
) => {
  // Build messages array for Ollama
  const ollamaMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    // Include attachment info if present
    images: msg.attachments
      ?.filter(att => att.type.startsWith('image/'))
      .map(att => att.content?.split(',')[1]) // Extract base64
      .filter(Boolean),
  }));

  // Add system prompt if set
  if (settings.systemPrompt) {
    ollamaMessages.unshift({
      role: 'system',
      content: settings.systemPrompt,
    });
  }

  const response = await fetch(`${provider.apiUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: conversation.model || settings.model,
      messages: ollamaMessages,
      stream: true,
      options: {
        temperature: settings.temperature,
        num_predict: settings.maxTokens,
        top_k: settings.topK,
        top_p: settings.topP,
        repeat_penalty: settings.repeatPenalty,
      },
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());

    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.message?.content) {
          fullText += json.message.content;
          
          // Update the message content in state
          setConversations(prev => prev.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === messageId ? { ...msg, content: fullText } : msg
                ),
              };
            }
            return conv;
          }));
        }
      } catch (e) {
        console.error('Error parsing Ollama response:', e);
      }
    }
  }

  // Mark as complete
  setConversations(prev => prev.map(conv => {
    if (conv.id === conversationId) {
      return {
        ...conv,
        messages: conv.messages.map(msg =>
          msg.id === messageId ? { ...msg, isStreaming: false } : msg
        ),
      };
    }
    return conv;
  }));
};
```

## 🤖 OpenAI Integration

Add this function to FullChatContext.tsx:

```typescript
const streamOpenAIResponse = async (
  conversationId: string,
  messageId: string,
  messages: Message[],
  settings: ChatSettings,
  provider: ModelProvider,
  controller: AbortController
) => {
  // Build messages array for OpenAI
  const openaiMessages: any[] = messages.map(msg => {
    const message: any = {
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    };

    // Handle attachments (images for vision models)
    if (msg.attachments && msg.attachments.length > 0) {
      const imageAttachments = msg.attachments.filter(att => att.type.startsWith('image/'));
      if (imageAttachments.length > 0) {
        message.content = [
          { type: 'text', text: msg.content },
          ...imageAttachments.map(att => ({
            type: 'image_url',
            image_url: { url: att.content },
          })),
        ];
      }
    }

    return message;
  });

  // Add system message
  if (settings.systemPrompt) {
    openaiMessages.unshift({
      role: 'system',
      content: settings.systemPrompt,
    });
  }

  const response = await fetch(`${provider.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: conversation.model || settings.model,
      messages: openaiMessages,
      stream: true,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      top_p: settings.topP,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

    for (const line of lines) {
      const data = line.replace('data: ', '');
      if (data === '[DONE]') break;

      try {
        const json = JSON.parse(data);
        const content = json.choices?.[0]?.delta?.content;
        
        if (content) {
          fullText += content;
          
          // Update the message content in state
          setConversations(prev => prev.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === messageId ? { ...msg, content: fullText } : msg
                ),
              };
            }
            return conv;
          }));
        }
      } catch (e) {
        console.error('Error parsing OpenAI response:', e);
      }
    }
  }

  // Mark as complete
  setConversations(prev => prev.map(conv => {
    if (conv.id === conversationId) {
      return {
        ...conv,
        messages: conv.messages.map(msg =>
          msg.id === messageId ? { ...msg, isStreaming: false } : msg
        ),
      };
    }
    return conv;
  }));
};
```

## 🧠 Anthropic (Claude) Integration

Add this function to FullChatContext.tsx:

```typescript
const streamAnthropicResponse = async (
  conversationId: string,
  messageId: string,
  messages: Message[],
  settings: ChatSettings,
  provider: ModelProvider,
  controller: AbortController
) => {
  // Build messages array for Anthropic
  const anthropicMessages = messages.map(msg => {
    const message: any = {
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    };

    // Handle image attachments
    if (msg.attachments && msg.attachments.length > 0) {
      const imageAttachments = msg.attachments.filter(att => att.type.startsWith('image/'));
      if (imageAttachments.length > 0) {
        message.content = [
          ...imageAttachments.map(att => {
            const base64Data = att.content?.split(',')[1] || '';
            const mediaType = att.type;
            return {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            };
          }),
          { type: 'text', text: msg.content },
        ];
      }
    }

    return message;
  });

  const response = await fetch(`${provider.apiUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: conversation.model || settings.model,
      messages: anthropicMessages,
      system: settings.systemPrompt,
      stream: true,
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
      top_p: settings.topP,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

    for (const line of lines) {
      const data = line.replace('data: ', '');

      try {
        const json = JSON.parse(data);
        
        if (json.type === 'content_block_delta' && json.delta?.text) {
          fullText += json.delta.text;
          
          // Update the message content in state
          setConversations(prev => prev.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === messageId ? { ...msg, content: fullText } : msg
                ),
              };
            }
            return conv;
          }));
        }
      } catch (e) {
        console.error('Error parsing Anthropic response:', e);
      }
    }
  }

  // Mark as complete
  setConversations(prev => prev.map(conv => {
    if (conv.id === conversationId) {
      return {
        ...conv,
        messages: conv.messages.map(msg =>
          msg.id === messageId ? { ...msg, isStreaming: false } : msg
        ),
      };
    }
    return conv;
  }));
};
```

## 🎨 Advanced Features Integration

### RAG (Document Context)

When RAG is enabled, include document content in the system prompt:

```typescript
const buildSystemPrompt = (settings: ChatSettings, ragDocuments: RAGDocument[]) => {
  let systemPrompt = settings.systemPrompt;

  if (settings.enableRAG) {
    const enabledDocs = ragDocuments.filter(d => d.enabled);
    if (enabledDocs.length > 0) {
      systemPrompt += '\n\n**Relevant Documents:**\n';
      enabledDocs.forEach(doc => {
        systemPrompt += `\n---\n${doc.name}:\n${doc.content.slice(0, 2000)}...\n`;
      });
    }
  }

  return systemPrompt;
};

// Use in API calls:
const effectiveSystemPrompt = buildSystemPrompt(settings, ragDocuments);
```

### Global Context

Include global context items when enabled:

```typescript
const buildGlobalContext = (settings: ChatSettings, contexts: GlobalContext[]) => {
  if (!settings.enableGlobalContext) return '';

  const relevantContexts = contexts
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);

  if (relevantContexts.length === 0) return '';

  return '\n\n**Global Context:**\n' + 
    relevantContexts.map(c => `- ${c.content}`).join('\n');
};

// Add to system prompt:
systemPrompt += buildGlobalContext(settings, globalContexts);
```

### MCP (Model Context Protocol)

For MCP tools, you'd implement function calling:

```typescript
// For OpenAI/Anthropic with function calling
const tools = mcpServers
  .filter(s => s.enabled)
  .flatMap(server => server.tools.filter(t => t.enabled))
  .map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));

// Add to API request:
body: JSON.stringify({
  // ... other params
  tools: tools.length > 0 ? tools : undefined,
}),
```

### File Attachments

The file attachments are already included in the integration examples above. They're accessible via `msg.attachments`:

```typescript
// Extract text from document attachments
const documentContext = messages
  .flatMap(m => m.attachments || [])
  .filter(att => att.type.includes('text') || att.type.includes('pdf'))
  .map(att => `File: ${att.name}\n${att.content}`)
  .join('\n\n');

// Add to system prompt or user message
```

## 🔐 Security Considerations

### API Key Storage

The app stores API keys in localStorage. For production:

```typescript
// Option 1: Encrypt API keys before storing
const encryptApiKey = (key: string) => {
  // Use Web Crypto API or similar
  return encryptedKey;
};

// Option 2: Use environment variables (for server-side proxying)
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || provider.apiKey;

// Option 3: Proxy through your backend
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages, settings }),
});
```

### CORS Issues

If you encounter CORS errors:

1. **Use a proxy server** - Create a backend that forwards requests
2. **Ollama** - Enable CORS in Ollama config
3. **OpenAI/Anthropic** - Consider server-side proxy for production

## ✅ Testing Checklist

After integration:

- [ ] Test Ollama connection with local model
- [ ] Test OpenAI with API key
- [ ] Test Anthropic with API key
- [ ] Verify streaming works
- [ ] Test stop generation (AbortController)
- [ ] Test file attachments (images for vision models)
- [ ] Test error handling (invalid API key, network errors)
- [ ] Test settings (temperature, maxTokens, etc.)
- [ ] Test conversation context (multi-turn)
- [ ] Test system prompts
- [ ] Test private mode (no learning)
- [ ] Test model switching mid-conversation

## 📊 Response Format Handling

Each provider has slightly different response formats. The integration examples above handle this, but here's a quick reference:

### Ollama
```json
{"message": {"role": "assistant", "content": "text chunk"}}
```

### OpenAI
```
data: {"choices": [{"delta": {"content": "text chunk"}}]}
data: [DONE]
```

### Anthropic
```
data: {"type": "content_block_delta", "delta": {"text": "text chunk"}}
```

## 🐛 Common Issues

### Issue: No streaming
**Solution:** Ensure `stream: true` is set in API request

### Issue: CORS errors
**Solution:** Use a proxy server or enable CORS on provider

### Issue: API key not found
**Solution:** Check that provider.apiKey exists and is valid

### Issue: Wrong model format
**Solution:** Use `conversation.model || settings.model` to get the active model

### Issue: Attachments not working
**Solution:** Ensure base64 encoding is correct and model supports vision (GPT-4o, Claude 3)

## 🎯 Next Steps

After basic integration:

1. Add better error handling and user-friendly error messages
2. Implement retry logic for failed requests
3. Add token counting (use tiktoken library)
4. Implement RAG with vector embeddings
5. Add MCP tool execution
6. Implement skills (web search, code execution)
7. Add conversation export/import
8. Implement conversation summarization
9. Add typing indicators
10. Add cost tracking for API usage

## 📚 API Documentation

- **Ollama:** https://github.com/ollama/ollama/blob/main/docs/api.md
- **OpenAI:** https://platform.openai.com/docs/api-reference/chat
- **Anthropic:** https://docs.anthropic.com/claude/reference/messages_post

---

**Ready to integrate?** Copy the code examples above into `/src/app/context/FullChatContext.tsx` and replace the `simulateStreamingResponse` function. Everything else is already wired up!
