import { useState } from 'react';
import { Folder } from '../types/chat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  FolderPlus,
  FolderOpen,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface FolderManagerProps {
  folders: Folder[];
  onCreateFolder: (name: string, color?: string, parentId?: string) => void;
  onUpdateFolder: (id: string, name: string, color?: string) => void;
  onDeleteFolder: (id: string) => void;
}

const FOLDER_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
];

export function FolderManager({
  folders,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
}: FolderManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value);

  const handleSubmit = () => {
    if (!folderName.trim()) return;

    if (editingFolder) {
      onUpdateFolder(editingFolder.id, folderName, selectedColor);
    } else {
      onCreateFolder(folderName, selectedColor);
    }

    setFolderName('');
    setSelectedColor(FOLDER_COLORS[0].value);
    setEditingFolder(null);
    setIsOpen(false);
  };

  const handleEdit = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setSelectedColor(folder.color || FOLDER_COLORS[0].value);
    setIsOpen(true);
  };

  const handleNewFolder = () => {
    setEditingFolder(null);
    setFolderName('');
    setSelectedColor(FOLDER_COLORS[0].value);
    setIsOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-semibold text-zinc-400">Folders</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleNewFolder}
          >
            <FolderPlus size={14} />
          </Button>
        </div>

        {folders.map((folder) => (
          <div
            key={folder.id}
            className="group flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 rounded-lg cursor-pointer"
          >
            <FolderOpen size={16} style={{ color: folder.color }} />
            <span className="flex-1 text-sm truncate">{folder.name}</span>
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
                <DropdownMenuItem onClick={() => handleEdit(folder)}>
                  <Edit size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteFolder(folder.id)}
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFolder ? 'Edit Folder' : 'New Folder'}
            </DialogTitle>
            <DialogDescription>
              Organize your conversations into folders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="My Folder"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingFolder ? 'Save' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
