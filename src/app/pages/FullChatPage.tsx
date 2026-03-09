import { useState, useEffect, useRef } from 'react';
import { useFullChat } from '../context/FullChatContext';
import { ExtendedChatSidebar } from '../components/ExtendedChatSidebar';
import { ChatMessage } from '../components/ChatMessage';
import { EnhancedChatInput } from '../components/EnhancedChatInput';
import { BasicSettingsDialog } from '../components/BasicSettingsDialog';
import { ConversationSettingsDialog } from '../components/ConversationSettingsDialog';
import { ModelSwitcher } from '../components/ModelSwitcher';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Download, Sparkles, Settings, Lock, Unlock } from 'lucide-react';
import { Attachment } from '../types/chat';

export function FullChatPage() {
  const {
    getCurrentConversation,
    sendMessage,
    updateMessage,
    deleteMessage,
    regenerateResponse,
    stopGeneration,
    createConversation,
    updateConversationSettings,
    personas,
    globalContexts,
    ragDocuments,
    mcpServers,
    skills,
    settings,
  } = useFullChat();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversation = getCurrentConversation();

  useEffect(() => {
    if (!conversation) {
      createConversation();
    }
  }, [conversation, createConversation]);

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

  const activePersona = conversation?.personaId
    ? personas.find(p => p.id === conversation.personaId)
    : null;

  const enabledRAG = (conversation?.settings?.enableRAG ?? settings.enableRAG) && ragDocuments.some(d => d.enabled);
  const enabledMCP = (conversation?.settings?.enableMCP ?? settings.enableMCP) && mcpServers.some(s => s.enabled);
  const enabledSkills = (conversation?.settings?.enableSkills ?? settings.enableSkills) && skills.some(s => s.enabled);
  const hasGlobalContext = settings.enableGlobalContext && globalContexts.length > 0;

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      <ExtendedChatSidebar onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        {conversation && conversation.messages.length > 0 && (
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h1 className="font-semibold truncate">{conversation.title}</h1>
              {conversation.isPrivate && (
                <Badge variant="outline" className="text-amber-600">
                  <Lock size={12} className="mr-1" />
                  Private
                </Badge>
              )}
              {activePersona && (
                <Badge variant="outline">
                  {activePersona.name}
                </Badge>
              )}
              <div className="border-l pl-3 ml-1">
                <ModelSwitcher conversationId={conversation.id} currentModel={conversation.model} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(enabledRAG || enabledMCP || enabledSkills || hasGlobalContext) && (
                <div className="flex gap-1">
                  {hasGlobalContext && (
                    <Badge variant="secondary" className="text-xs">
                      Context
                    </Badge>
                  )}
                  {enabledRAG && (
                    <Badge variant="secondary" className="text-xs">
                      RAG
                    </Badge>
                  )}
                  {enabledMCP && (
                    <Badge variant="secondary" className="text-xs">
                      MCP
                    </Badge>
                  )}
                  {enabledSkills && (
                    <Badge variant="secondary" className="text-xs">
                      Skills
                    </Badge>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatSettingsOpen(true)}
              >
                <Settings size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportConversation}
              >
                <Download size={16} />
              </Button>
            </div>
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
                  AI Chat Pro
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Complete AI assistant with multiple providers (Ollama, OpenAI, Claude),
                  MCP tools, RAG knowledge base, auto-learning context, personas, and more.
                </p>
                
                {conversation.isPrivate && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-900">
                    <p className="text-sm text-amber-900 dark:text-amber-100 flex items-center gap-2">
                      <Lock size={16} />
                      <strong>Private Mode:</strong> Auto-learning disabled for this chat
                    </p>
                  </div>
                )}

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
        <EnhancedChatInput
          onSend={handleSend}
          onStop={stopGeneration}
          isStreaming={isStreaming}
        />
      </div>

      <BasicSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      {conversation && (
        <ConversationSettingsDialog
          open={chatSettingsOpen}
          onOpenChange={setChatSettingsOpen}
          settings={conversation.settings}
          isPrivate={conversation.isPrivate}
          personas={personas}
          selectedPersonaId={conversation.personaId}
          onSave={(convSettings, isPrivate, personaId) => {
            updateConversationSettings(conversation.id, convSettings, isPrivate, personaId);
          }}
        />
      )}
    </div>
  );
}