import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFullChat } from '../context/FullChatContext';
import { ExtendedChatSidebar } from '../components/ExtendedChatSidebar';
import { ChatMessage } from '../components/ChatMessage';
import { FullSettingsDialog } from '../components/FullSettingsDialog';
import { ConversationSettingsDialog } from '../components/ConversationSettingsDialog';
import { FileUpload, ModelFileCapabilities } from '../components/FileUpload';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import {
  Download,
  Sparkles,
  Settings,
  Lock,
  Send,
  StopCircle,
  Paperclip,
  Zap,
  Brain,
  Database,
  Box,
  X,
} from 'lucide-react';

export function BeautifulChatPage() {
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
  const [input, setInput] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    const message = input.trim();
    setInput('');
    setAttachedFiles([]);
    setShowFileUpload(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    <div className="flex h-screen relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, hsl(var(--accent-blue)) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, hsl(var(--accent-purple)) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, hsl(var(--accent-pink)) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, hsl(var(--accent-blue)) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <ExtendedChatSidebar onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex-1 flex flex-col relative">
        {/* Header with glass effect */}
        {conversation && conversation.messages.length > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-b border-white/20 dark:border-zinc-800/50 px-6 py-4"
          >
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-semibold text-lg truncate">{conversation.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    {conversation.isPrivate && (
                      <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                        <Lock size={10} className="mr-1" />
                        Private
                      </Badge>
                    )}
                    {activePersona && (
                      <Badge variant="outline" className="text-xs">
                        {activePersona.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(enabledRAG || enabledMCP || enabledSkills || hasGlobalContext) && (
                  <div className="flex gap-1.5">
                    {hasGlobalContext && (
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Badge variant="secondary" className="text-xs">
                          <Brain size={12} className="mr-1" />
                          Context
                        </Badge>
                      </motion.div>
                    )}
                    {enabledRAG && (
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Badge variant="secondary" className="text-xs">
                          <Database size={12} className="mr-1" />
                          RAG
                        </Badge>
                      </motion.div>
                    )}
                    {enabledMCP && (
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Badge variant="secondary" className="text-xs">
                          <Box size={12} className="mr-1" />
                          MCP
                        </Badge>
                      </motion.div>
                    )}
                    {enabledSkills && (
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Badge variant="secondary" className="text-xs">
                          <Zap size={12} className="mr-1" />
                          Skills
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatSettingsOpen(true)}
                  className="hover:bg-white/50 dark:hover:bg-zinc-800/50"
                >
                  <Settings size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportConversation}
                  className="hover:bg-white/50 dark:hover:bg-zinc-800/50"
                >
                  <Download size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          {conversation?.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 max-w-2xl"
              >
                <motion.div
                  className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl"
                  animate={{
                    boxShadow: [
                      '0 20px 60px -15px rgba(59, 130, 246, 0.5)',
                      '0 20px 60px -15px rgba(168, 85, 247, 0.5)',
                      '0 20px 60px -15px rgba(236, 72, 153, 0.5)',
                      '0 20px 60px -15px rgba(59, 130, 246, 0.5)',
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles size={48} className="text-white" />
                </motion.div>
                
                <div>
                  <motion.h2
                    className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    style={{ backgroundSize: '200% auto' }}
                  >
                    AI Chat Pro
                  </motion.h2>
                  <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                    Next-generation AI assistant with advanced capabilities
                  </p>
                </div>

                {conversation.isPrivate && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900"
                  >
                    <p className="text-sm text-amber-900 dark:text-amber-100 flex items-center gap-2 justify-center">
                      <Lock size={16} />
                      <strong>Private Mode:</strong> Auto-learning disabled
                    </p>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 gap-3 pt-4">
                  {[
                    'Explain quantum computing in simple terms',
                    'Write a Python function to sort a list',
                    'Help me plan a weekend trip',
                  ].map((prompt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setInput(prompt);
                        handleSend();
                      }}
                      className="p-4 rounded-xl text-left bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span className="text-sm">{prompt}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-6 px-4">
              <AnimatePresence mode="popLayout">
                {conversation?.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ChatMessage
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
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Input with glass effect */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-t border-white/20 dark:border-zinc-800/50 p-4">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* File upload */}
            <AnimatePresence>
              {showFileUpload && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FileUpload
                    onFilesAdded={(files) => setAttachedFiles((prev) => [...prev, ...files])}
                  />
                  <ModelFileCapabilities model={settings.model} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attached files preview */}
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 flex-wrap"
              >
                {attachedFiles.map((file, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="pl-2 pr-1 py-1"
                  >
                    {file.name}
                    <button
                      onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))}
                      className="ml-1"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </motion.div>
            )}

            {/* Input field */}
            <div className="relative group">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Chat Pro..."
                className="min-h-[56px] max-h-[200px] resize-none rounded-2xl pr-24 pl-12 py-4 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 shadow-sm focus:shadow-md"
                rows={1}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="absolute left-2 top-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Paperclip size={18} />
              </Button>

              <div className="absolute right-2 top-3 flex gap-1">
                {isStreaming ? (
                  <Button
                    onClick={stopGeneration}
                    size="sm"
                    variant="ghost"
                    className="hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <StopCircle size={18} className="text-red-600" />
                  </Button>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() && attachedFiles.length === 0}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md disabled:opacity-50"
                    >
                      <Send size={18} />
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            <p className="text-xs text-center text-zinc-500">
              AI Chat Pro can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>

      <FullSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
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
