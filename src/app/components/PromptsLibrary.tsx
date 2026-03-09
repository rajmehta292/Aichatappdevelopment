import { useState } from 'react';
import { CustomPrompt } from '../types/chat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2, 
  Copy,
  Sparkles,
} from 'lucide-react';

interface PromptsLibraryProps {
  prompts: CustomPrompt[];
  onCreatePrompt: (name: string, content: string, category: string) => void;
  onUpdatePrompt: (id: string, name: string, content: string, category: string) => void;
  onDeletePrompt: (id: string) => void;
  onUsePrompt: (content: string) => void;
}

const CATEGORIES = [
  'General',
  'Writing',
  'Coding',
  'Analysis',
  'Creative',
  'Business',
  'Education',
  'Custom',
];

const DEFAULT_PROMPTS: Omit<CustomPrompt, 'id' | 'createdAt'>[] = [
  {
    name: 'Code Review',
    content: 'Review the following code for bugs, performance issues, and best practices. Provide specific suggestions for improvement.',
    category: 'Coding',
  },
  {
    name: 'Explain Like I\'m 5',
    content: 'Explain the following concept in simple terms that a 5-year-old would understand, using analogies and examples.',
    category: 'Education',
  },
  {
    name: 'Blog Post Writer',
    content: 'Write an engaging blog post about the following topic. Include an introduction, main points with examples, and a conclusion. Make it SEO-friendly.',
    category: 'Writing',
  },
  {
    name: 'Data Analyzer',
    content: 'Analyze the following data and provide insights, patterns, trends, and actionable recommendations.',
    category: 'Analysis',
  },
];

export function PromptsLibrary({
  prompts,
  onCreatePrompt,
  onUpdatePrompt,
  onDeletePrompt,
  onUsePrompt,
}: PromptsLibraryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<CustomPrompt | null>(null);
  const [promptName, setPromptName] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [promptCategory, setPromptCategory] = useState('General');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const handleSubmit = () => {
    if (!promptName.trim() || !promptContent.trim()) return;

    if (editingPrompt) {
      onUpdatePrompt(editingPrompt.id, promptName, promptContent, promptCategory);
    } else {
      onCreatePrompt(promptName, promptContent, promptCategory);
    }

    resetForm();
  };

  const resetForm = () => {
    setPromptName('');
    setPromptContent('');
    setPromptCategory('General');
    setEditingPrompt(null);
    setIsOpen(false);
  };

  const handleEdit = (prompt: CustomPrompt) => {
    setEditingPrompt(prompt);
    setPromptName(prompt.name);
    setPromptContent(prompt.content);
    setPromptCategory(prompt.category);
    setIsOpen(true);
  };

  const handleNewPrompt = () => {
    resetForm();
    setIsOpen(true);
  };

  const allPrompts = [...prompts, ...DEFAULT_PROMPTS.map((p, i) => ({
    ...p,
    id: `default-${i}`,
    createdAt: Date.now(),
  }))];

  const filteredPrompts = filterCategory === 'All'
    ? allPrompts
    : allPrompts.filter((p) => p.category === filterCategory);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = allPrompts.filter((p) => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Prompts Library</h3>
          <p className="text-sm text-zinc-500">
            Save and reuse your favorite prompts
          </p>
        </div>
        <Button onClick={handleNewPrompt}>
          <Plus size={16} className="mr-2" />
          New Prompt
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterCategory === 'All' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterCategory('All')}
        >
          All ({allPrompts.length})
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={filterCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(cat)}
          >
            {cat} ({categoryCounts[cat] || 0})
          </Button>
        ))}
      </div>

      {filteredPrompts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-zinc-400" />
            <h4 className="font-semibold mb-2">No Prompts Yet</h4>
            <p className="text-sm text-zinc-500 mb-4">
              Create custom prompts to streamline your workflow
            </p>
            <Button onClick={handleNewPrompt}>
              <Plus size={16} className="mr-2" />
              Create Your First Prompt
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{prompt.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {prompt.category}
                    </Badge>
                  </div>
                  {!prompt.id.startsWith('default-') && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(prompt)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletePrompt(prompt.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-3">
                  {prompt.content}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onUsePrompt(prompt.content)}
                    className="flex-1"
                  >
                    <Sparkles size={14} className="mr-2" />
                    Use Prompt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(prompt.content);
                    }}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
            </DialogTitle>
            <DialogDescription>
              Build reusable prompts for common tasks
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-name">Prompt Name</Label>
              <Input
                id="prompt-name"
                value={promptName}
                onChange={(e) => setPromptName(e.target.value)}
                placeholder="My Custom Prompt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-category">Category</Label>
              <Select value={promptCategory} onValueChange={setPromptCategory}>
                <SelectTrigger id="prompt-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-content">Prompt Content</Label>
              <Textarea
                id="prompt-content"
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                placeholder="Enter your prompt template here..."
                rows={8}
              />
              <p className="text-xs text-zinc-500">
                Tip: Use placeholders like [TOPIC] or [CODE] that you can fill in when using the prompt
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingPrompt ? 'Save Changes' : 'Create Prompt'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
