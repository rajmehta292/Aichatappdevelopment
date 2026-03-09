import { useState } from 'react';
import { Rule } from '../types/chat';
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
import { Plus, Shield, Trash2, Edit } from 'lucide-react';

interface RulesManagerProps {
  rules: Rule[];
  onAddRule: (rule: Omit<Rule, 'id'>) => void;
  onUpdateRule: (id: string, updates: Partial<Rule>) => void;
  onRemoveRule: (id: string) => void;
}

const RULE_TYPES = [
  { value: 'content', label: 'Content Filter' },
  { value: 'behavior', label: 'Behavior Guideline' },
  { value: 'output', label: 'Output Format' },
  { value: 'privacy', label: 'Privacy Control' },
];

const DEFAULT_RULES: Omit<Rule, 'id'>[] = [
  {
    name: 'No Medical Advice',
    description: 'Prevent providing medical diagnoses or treatment advice',
    type: 'content',
    enabled: true,
    rule: 'Do not provide medical diagnoses or treatment advice. Always suggest consulting healthcare professionals.',
    priority: 10,
  },
  {
    name: 'Code Quality',
    description: 'Ensure code examples follow best practices',
    type: 'output',
    enabled: true,
    rule: 'All code examples must include error handling, be well-commented, and follow industry best practices.',
    priority: 5,
  },
  {
    name: 'Professional Tone',
    description: 'Maintain professional communication',
    type: 'behavior',
    enabled: false,
    rule: 'Always maintain a professional, respectful tone in all responses.',
    priority: 3,
  },
];

export function RulesManager({
  rules,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
}: RulesManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Rule['type']>('content');
  const [rule, setRule] = useState('');
  const [priority, setPriority] = useState(5);

  const handleSubmit = () => {
    if (!name.trim() || !rule.trim()) return;

    if (editingRule) {
      onUpdateRule(editingRule.id, { name, description, type, rule, priority });
    } else {
      onAddRule({
        name,
        description,
        type,
        enabled: true,
        rule,
        priority,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setType('content');
    setRule('');
    setPriority(5);
    setEditingRule(null);
    setIsOpen(false);
  };

  const handleEdit = (r: Rule) => {
    setEditingRule(r);
    setName(r.name);
    setDescription(r.description);
    setType(r.type);
    setRule(r.rule);
    setPriority(r.priority);
    setIsOpen(true);
  };

  const allRules = [...rules, ...DEFAULT_RULES.map((r, i) => ({
    ...r,
    id: `default-${i}`,
  }))];

  const enabledCount = allRules.filter((r) => r.enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Rules & Guardrails</h3>
          <p className="text-sm text-zinc-500">
            Set guidelines and constraints for AI behavior
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Rule
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-green-500" />
            <div>
              <div className="text-2xl font-bold">{enabledCount}</div>
              <div className="text-xs text-zinc-500">Active Rules</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-zinc-500">
                {allRules.length} total configured
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {allRules
          .sort((a, b) => b.priority - a.priority)
          .map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{r.name}</div>
                      <Badge variant="outline">
                        {RULE_TYPES.find((t) => t.value === r.type)?.label}
                      </Badge>
                      <Badge variant="secondary">Priority: {r.priority}</Badge>
                    </div>
                    {r.description && (
                      <p className="text-xs text-zinc-500 mb-2">
                        {r.description}
                      </p>
                    )}
                    <p className="text-sm bg-zinc-50 dark:bg-zinc-900 p-2 rounded">
                      {r.rule}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!r.id.startsWith('default-') && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(r)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveRule(r.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                    <Switch
                      checked={r.enabled}
                      onCheckedChange={(checked) =>
                        onUpdateRule(r.id, { enabled: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Rule' : 'Add New Rule'}
            </DialogTitle>
            <DialogDescription>
              Create guidelines for how the AI should behave
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="No Personal Data"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">Description (optional)</Label>
              <Input
                id="rule-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Prevent handling of sensitive personal data"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Rule['type'])}>
                <SelectTrigger id="rule-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-content">Rule Content</Label>
              <Textarea
                id="rule-content"
                value={rule}
                onChange={(e) => setRule(e.target.value)}
                placeholder="Never ask for, store, or process personal identifying information..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-priority">
                Priority: {priority} (higher = more important)
              </Label>
              <Input
                id="rule-priority"
                type="number"
                min={1}
                max={10}
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 5)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingRule ? 'Save Changes' : 'Add Rule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
