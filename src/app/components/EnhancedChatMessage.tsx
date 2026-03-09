import { useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Message } from '../types/chat';
import { Button } from './ui/button';
import { 
  Copy, 
  Check, 
  User, 
  Bot, 
  Edit, 
  Trash2, 
  RotateCcw,
  MoreVertical,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Textarea } from './ui/textarea';

interface EnhancedChatMessageProps {
  message: Message;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  onRegenerate?: (id: string) => void;
}

export function EnhancedChatMessage({ message, onEdit, onDelete, onRegenerate }: EnhancedChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { theme } = useTheme();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(message.id, editContent);
      setIsEditing(false);
    }
  };

  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative mb-6 ${isUser ? 'flex justify-end' : ''}`}
    >
      <div className={`flex gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <motion.div
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-purple-600'
              : 'bg-gradient-to-br from-emerald-500 to-cyan-600'
          }`}
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          {isUser ? (
            <User size={20} className="text-white" />
          ) : (
            <Sparkles size={20} className="text-white" />
          )}
        </motion.div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div
            className={`rounded-2xl p-4 backdrop-blur-sm ${
              isUser
                ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50'
                : 'bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] bg-white dark:bg-zinc-900"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save & Send
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="relative group/code">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(String(children).replace(/\n$/, ''))}
                            className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity"
                          >
                            {copied ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </Button>
                          <SyntaxHighlighter
                            style={theme === 'dark' ? oneDark : oneLight}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.75rem',
                              fontSize: '0.875rem',
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code
                          className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                
                {message.isStreaming && (
                  <motion.span
                    className="inline-block w-2 h-4 ml-1 bg-blue-500 rounded"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(message.content)}
                className="h-7 px-2 text-xs"
              >
                {copied ? (
                  <>
                    <Check size={12} className="mr-1 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} className="mr-1" />
                    Copy
                  </>
                )}
              </Button>

              {onEdit && isUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 px-2 text-xs"
                >
                  <Edit size={12} className="mr-1" />
                  Edit
                </Button>
              )}

              {onRegenerate && !isUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRegenerate(message.id)}
                  className="h-7 px-2 text-xs"
                >
                  <RotateCcw size={12} className="mr-1" />
                  Regenerate
                </Button>
              )}

              {onDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical size={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => onDelete(message.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </motion.div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-zinc-500 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
