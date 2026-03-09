import { useState, useEffect, useRef } from 'react';
import { useExtendedChat } from '../context/ExtendedChatContext';
import { ExtendedChatSidebar } from '../components/ExtendedChatSidebar';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { ExtendedSettingsDialog } from '../components/ExtendedSettingsDialog';
import { Button } from '../components/ui/button';
import { Download, Sparkles } from 'lucide-react';

export function ChatPage() {
  const {
    getCurrentConversation,
    sendMessage,
    updateMessage,
    deleteMessage,
    regenerateResponse,
    stopGeneration,
    createConversation,
  } = useExtendedChat();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversation = getCurrentConversation();

  // Create initial conversation if none exists
  useEffect(() => {
    if (!conversation) {
      createConversation();
    }
  }, [conversation, createConversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const handleExportConversation = () => {
    if (!conversation) return;

    const markdown = conversation.messages
      .map((msg) => {
        const role = msg.role === 'user' ? '**You:**' : '**Assistant:**';
        return `${role}\n\n${msg.content}\n\n---\n`;
      })
      .join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${conversation.title}-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isStreaming = conversation?.messages.some((m) => m.isStreaming);

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      <ExtendedChatSidebar onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        {conversation && conversation.messages.length > 0 && (
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h1 className="font-semibold truncate">{conversation.title}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportConversation}
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          {conversation?.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md px-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold">
                  Welcome to AI Chat Pro
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Your advanced AI assistant with MCP tools, RAG knowledge base, folders, and custom prompts. Connect to Ollama to get started.
                </p>
                <div className="grid grid-cols-1 gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() =>
                      handleSend('Explain quantum computing in simple terms')
                    }
                  >
                    <span className="text-left">
                      Explain quantum computing in simple terms
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() =>
                      handleSend('Write a Python function to sort a list')
                    }
                  >
                    <span className="text-left">
                      Write a Python function to sort a list
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleSend('Help me plan a weekend trip')}
                  >
                    <span className="text-left">
                      Help me plan a weekend trip
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {conversation?.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onEdit={(id, content) => {
                    if (conversation) {
                      updateMessage(conversation.id, id, content);
                      // Resend after editing user message
                      sendMessage(content);
                    }
                  }}
                  onDelete={(id) => {
                    if (conversation) {
                      deleteMessage(conversation.id, id);
                    }
                  }}
                  onRegenerate={regenerateResponse}
                />
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={stopGeneration}
          isStreaming={isStreaming}
        />
      </div>

      <ExtendedSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}