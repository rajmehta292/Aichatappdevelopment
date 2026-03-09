import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send, Square, Paperclip, X, FileText, FileImage, FileVideo, File, FileArchive } from 'lucide-react';
import { Attachment } from '../types/chat';

interface EnhancedChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

export function EnhancedChatInput({ onSend, onStop, disabled, isStreaming }: EnhancedChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((input.trim() || attachments.length > 0) && !disabled) {
      onSend(input.trim(), attachments.length > 0 ? attachments : undefined);
      setInput('');
      setAttachments([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const attachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          content: event.target?.result as string,
        };
        
        setAttachments(prev => [...prev, attachment]);
      };
      
      // For images, videos, and text files, read as data URL
      // For other files, read as text if small enough, otherwise just metadata
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('text/') || file.size < 1024 * 1024) {
        reader.readAsText(file);
      } else {
        // For large files, just store metadata
        const attachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
        };
        setAttachments(prev => [...prev, attachment]);
      }
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return FileImage;
    if (type.startsWith('video/')) return FileVideo;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar')) return FileArchive;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="border-t bg-white dark:bg-zinc-950 px-4 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map(attachment => {
              const Icon = getFileIcon(attachment.type);
              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg border"
                >
                  <Icon size={16} className="text-zinc-600 dark:text-zinc-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-zinc-500">{formatFileSize(attachment.size)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAttachment(attachment.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X size={14} />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              disabled={disabled}
              className="min-h-[52px] max-h-[200px] resize-none pr-24"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="h-8 w-8 p-0"
                title="Attach files"
              >
                <Paperclip size={16} />
              </Button>
              {isStreaming ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onStop}
                  className="h-8 w-8 p-0"
                  title="Stop generation"
                >
                  <Square size={16} />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={(!input.trim() && attachments.length === 0) || disabled}
                  className="h-8 w-8 p-0"
                  title="Send message"
                >
                  <Send size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="*/*"
        />

        <p className="text-xs text-center text-zinc-500 mt-2">
          Upload images, documents, videos, code files, or any file type to discuss with AI
        </p>
      </div>
    </div>
  );
}
