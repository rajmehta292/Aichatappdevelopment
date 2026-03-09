import { useState } from 'react';
import { useFullChat } from '../context/FullChatContext';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { FolderManager } from './FolderManager';
import {
  MessageSquarePlus,
  Settings,
  Trash2,
  MoreVertical,
  Menu,
  X,
  FolderOpen,
  MessageSquare,
  Lock,
  Settings2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './ui/dropdown-menu';
import { format } from 'date-fns';

interface ExtendedChatSidebarProps {
  onOpenSettings: () => void;
}

export function ExtendedChatSidebar({ onOpenSettings }: ExtendedChatSidebarProps) {
  const {
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    deleteConversation,
    clearConversation,
    moveConversationToFolder,
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
  } = useFullChat();

  const [isOpen, setIsOpen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

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

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
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

  const conversationsWithoutFolder = conversations.filter(c => !c.folderId);
  const conversationsByFolder = folders.reduce((acc, folder) => {
    acc[folder.id] = conversations.filter(c => c.folderId === folder.id);
    return acc;
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
            {/* Folders */}
            <FolderManager
              folders={folders}
              onCreateFolder={createFolder}
              onUpdateFolder={updateFolder}
              onDeleteFolder={deleteFolder}
            />

            {folders.map((folder) => (
              <div key={folder.id} className="space-y-1">
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 rounded-lg text-left"
                >
                  <FolderOpen size={16} style={{ color: folder.color }} />
                  <span className="flex-1 text-sm truncate">{folder.name}</span>
                  <span className="text-xs text-zinc-500">
                    {conversationsByFolder[folder.id]?.length || 0}
                  </span>
                </button>
                {expandedFolders.has(folder.id) && conversationsByFolder[folder.id] && (
                  <div className="ml-6 space-y-1">
                    {conversationsByFolder[folder.id].map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={currentConversationId === conv.id}
                        onClick={() => setCurrentConversation(conv.id)}
                        onDelete={handleDeleteConversation}
                        onClear={() => handleClearConversation(conv.id)}
                        onMoveToFolder={(folderId) =>
                          moveConversationToFolder(conv.id, folderId)
                        }
                        folders={folders}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Conversations without folder */}
            {conversationsWithoutFolder.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-zinc-400">
                  Uncategorized
                </div>
                <div className="space-y-1">
                  {conversationsWithoutFolder.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={currentConversationId === conv.id}
                      onClick={() => setCurrentConversation(conv.id)}
                      onDelete={handleDeleteConversation}
                      onClear={() => handleClearConversation(conv.id)}
                      onMoveToFolder={(folderId) =>
                        moveConversationToFolder(conv.id, folderId)
                      }
                      folders={folders}
                    />
                  ))}
                </div>
              </>
            )}
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

interface ConversationItemProps {
  conversation: any;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClear: () => void;
  onMoveToFolder: (folderId: string | undefined) => void;
  folders: any[];
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
  onClear,
  onMoveToFolder,
  folders,
}: ConversationItemProps) {
  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors ${
        isActive ? 'bg-zinc-800' : ''
      }`}
      onClick={onClick}
    >
      <MessageSquare size={14} className="text-zinc-500 flex-shrink-0" />
      <div className="flex-1 truncate text-sm">{conversation.title}</div>
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderOpen size={14} className="mr-2" />
              Move to folder
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onMoveToFolder(undefined)}>
                <MessageSquare size={14} className="mr-2" />
                Uncategorized
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => onMoveToFolder(folder.id)}
                >
                  <FolderOpen
                    size={14}
                    className="mr-2"
                    style={{ color: folder.color }}
                  />
                  {folder.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={onClear}>Clear messages</DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conversation.id, e as any);
            }}
            className="text-red-600"
          >
            <Trash2 size={14} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}