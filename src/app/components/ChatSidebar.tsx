import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import {
  MessageSquarePlus,
  Settings,
  Trash2,
  MoreVertical,
  Menu,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { format } from 'date-fns';

interface ChatSidebarProps {
  onOpenSettings: () => void;
}

export function ChatSidebar({ onOpenSettings }: ChatSidebarProps) {
  const {
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    deleteConversation,
    clearConversation,
  } = useChat();

  const [isOpen, setIsOpen] = useState(true);

  const handleNewChat = () => {
    createConversation();
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(id);
    }
  };

  const handleClearConversation = (id: string) => {
    if (confirm('Are you sure you want to clear all messages in this conversation?')) {
      clearConversation(id);
    }
  };

  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = new Date(conv.updatedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    let key: string;
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      key = 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      key = 'Yesterday';
    } else if (date > lastWeek) {
      key = 'Last 7 Days';
    } else {
      key = format(date, 'MMMM yyyy');
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(conv);
    return groups;
  }, {} as Record<string, typeof conversations>);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 bg-zinc-900 text-white flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 space-y-2 border-b border-zinc-800">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start"
            variant="secondary"
          >
            <MessageSquarePlus size={18} className="mr-2" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-4 py-4">
            {Object.entries(groupedConversations).map(([group, convs]) => (
              <div key={group}>
                <div className="px-3 py-2 text-xs font-semibold text-zinc-400">
                  {group}
                </div>
                <div className="space-y-1">
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors ${
                        currentConversationId === conv.id
                          ? 'bg-zinc-800'
                          : ''
                      }`}
                      onClick={() => setCurrentConversation(conv.id)}
                    >
                      <div className="flex-1 truncate text-sm">
                        {conv.title}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-zinc-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleClearConversation(conv.id)}
                          >
                            Clear messages
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv.id, e as any);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <Button
            onClick={onOpenSettings}
            variant="ghost"
            className="w-full justify-start"
          >
            <Settings size={18} className="mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
