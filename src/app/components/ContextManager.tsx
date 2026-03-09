import { useState } from 'react';
import { GlobalContext } from '../types/chat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Plus, 
  Brain, 
  Trash2, 
  TrendingUp,
  Info,
  Lock,
  Unlock,
} from 'lucide-react';

interface ContextManagerProps {
  contexts: GlobalContext[];
  enableGlobalContext: boolean;
  enableAutoLearning: boolean;
  onToggleGlobalContext: (enabled: boolean) => void;
  onToggleAutoLearning: (enabled: boolean) => void;
  onAddContext: (content: string, category: string) => void;
  onRemoveContext: (id: string) => void;
}

const CATEGORIES = [
  'Personal Info',
  'Preferences',
  'Work Context',
  'Projects',
  'Knowledge',
  'Guidelines',
  'Custom',
];

export function ContextManager({
  contexts,
  enableGlobalContext,
  enableAutoLearning,
  onToggleGlobalContext,
  onToggleAutoLearning,
  onAddContext,
  onRemoveContext,
}: ContextManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal Info');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onAddContext(content, category);
    setContent('');
    setCategory('Personal Info');
    setIsOpen(false);
  };

  const filteredContexts = filterCategory === 'All'
    ? contexts
    : contexts.filter((c) => c.category === filterCategory);

  const learnedCount = contexts.filter((c) => c.source === 'learned').length;
  const manualCount = contexts.filter((c) => c.source === 'manual').length;
  const totalTokens = Math.floor(
    contexts.reduce((sum, c) => sum + c.content.length / 4, 0)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Context Management</h3>
          <p className="text-sm text-zinc-500">
            Manage global context that persists across all conversations
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Context
        </Button>
      </div>

      {/* Controls */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="global-context" className="font-semibold">
                  Global Context
                </Label>
                <p className="text-xs text-zinc-500 mt-1">
                  Include saved context in all chats
                </p>
              </div>
              <Switch
                id="global-context"
                checked={enableGlobalContext}
                onCheckedChange={onToggleGlobalContext}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <Label htmlFor="auto-learning" className="font-semibold">
                  Auto-Learning
                </Label>
                <p className="text-xs text-zinc-500 mt-1">
                  Learn from conversations automatically
                </p>
              </div>
              <Switch
                id="auto-learning"
                checked={enableAutoLearning}
                onCheckedChange={onToggleAutoLearning}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{contexts.length}</div>
                <div className="text-xs text-zinc-500">Total Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              <div>
                <div className="text-2xl font-bold">{learnedCount}</div>
                <div className="text-xs text-zinc-500">Auto-Learned</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Info size={20} className="text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{totalTokens}</div>
                <div className="text-xs text-zinc-500">Est. Tokens</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info size={16} />
            How Context Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300">
          <p>
            <strong>Global Context:</strong> Information that's included in all conversations 
            (e.g., "I'm a software engineer", "I prefer Python").
          </p>
          <p>
            <strong>Local Context:</strong> Information specific to a single conversation 
            (exists only in that chat's history).
          </p>
          <p>
            <strong>Auto-Learning:</strong> When enabled, the AI learns patterns from your 
            conversations and saves important info to global context automatically.
          </p>
          <p>
            <strong>Private Mode:</strong> Disables learning for sensitive conversations. 
            Nothing is saved to global context, but the chat is still stored locally.
          </p>
        </CardContent>
      </Card>

      {/* Filter */}
      {contexts.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterCategory === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory('All')}
          >
            All ({contexts.length})
          </Button>
          {CATEGORIES.map((cat) => {
            const count = contexts.filter((c) => c.category === cat).length;
            if (count === 0) return null;
            return (
              <Button
                key={cat}
                variant={filterCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory(cat)}
              >
                {cat} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {/* Context List */}
      {filteredContexts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain size={48} className="mx-auto mb-4 text-zinc-400" />
            <h4 className="font-semibold mb-2">No Context Yet</h4>
            <p className="text-sm text-zinc-500 mb-4">
              Add context to help the AI understand you better across all conversations
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Context
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredContexts.map((ctx) => (
            <Card key={ctx.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{ctx.category}</Badge>
                      <Badge
                        variant={ctx.source === 'learned' ? 'default' : 'secondary'}
                      >
                        {ctx.source === 'learned' ? (
                          <>
                            <TrendingUp size={12} className="mr-1" />
                            Auto-learned
                          </>
                        ) : (
                          'Manual'
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm">{ctx.content}</p>
                    <div className="text-xs text-zinc-500 mt-2">
                      Used {ctx.usageCount} times • Last used{' '}
                      {new Date(ctx.lastUsed).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveContext(ctx.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Global Context</DialogTitle>
            <DialogDescription>
              Add information that will be available to the AI in all conversations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
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
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="I'm a software engineer who prefers Python and React..."
                rows={6}
              />
              <p className="text-xs text-zinc-500">
                Examples: Your role, preferences, coding style, project info, guidelines
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Example Contexts</h4>
              <ul className="text-xs space-y-1 text-zinc-700 dark:text-zinc-300">
                <li>• "I'm a senior developer specializing in React and TypeScript"</li>
                <li>• "I prefer concise code examples with comments"</li>
                <li>• "I'm working on a healthcare app with strict privacy requirements"</li>
                <li>• "Use UK English spelling in all responses"</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Context</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
