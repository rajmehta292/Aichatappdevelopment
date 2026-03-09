import { useState } from 'react';
import { Persona } from '../types/chat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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
import { Plus, User, Edit, Trash2, Sparkles } from 'lucide-react';
import { Slider } from './ui/slider';

interface PersonasManagerProps {
  personas: Persona[];
  onAddPersona: (persona: Omit<Persona, 'id'>) => void;
  onUpdatePersona: (id: string, updates: Partial<Persona>) => void;
  onRemovePersona: (id: string) => void;
}

const DEFAULT_PERSONAS: Omit<Persona, 'id'>[] = [
  {
    name: 'Professional Assistant',
    description: 'Formal, detail-oriented, perfect for work',
    systemPrompt: 'You are a professional AI assistant. Provide detailed, accurate, and well-structured responses. Maintain a formal yet friendly tone. Always cite sources when possible.',
    temperature: 0.5,
    creativity: 'low',
    verbosity: 'detailed',
  },
  {
    name: 'Creative Partner',
    description: 'Imaginative and expressive for creative work',
    systemPrompt: 'You are a creative AI partner. Think outside the box, provide innovative ideas, and use vivid language. Be encouraging and enthusiastic about creative endeavors.',
    temperature: 1.2,
    creativity: 'high',
    verbosity: 'normal',
  },
  {
    name: 'Code Mentor',
    description: 'Technical expert focused on programming',
    systemPrompt: 'You are an experienced software engineer and mentor. Provide clear code examples, explain best practices, and help debug issues. Focus on writing clean, maintainable code.',
    temperature: 0.3,
    creativity: 'low',
    verbosity: 'normal',
  },
  {
    name: 'Casual Friend',
    description: 'Relaxed and conversational',
    systemPrompt: 'You are a friendly, casual AI companion. Use a relaxed tone, be personable, and keep responses concise and easy to understand. Use occasional emojis when appropriate.',
    temperature: 0.8,
    creativity: 'medium',
    verbosity: 'concise',
  },
];

export function PersonasManager({
  personas,
  onAddPersona,
  onUpdatePersona,
  onRemovePersona,
}: PersonasManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [creativity, setCreativity] = useState<Persona['creativity']>('medium');
  const [verbosity, setVerbosity] = useState<Persona['verbosity']>('normal');

  const handleSubmit = () => {
    if (!name.trim() || !systemPrompt.trim()) return;

    if (editingPersona) {
      onUpdatePersona(editingPersona.id, {
        name,
        description,
        systemPrompt,
        temperature,
        creativity,
        verbosity,
      });
    } else {
      onAddPersona({
        name,
        description,
        systemPrompt,
        temperature,
        creativity,
        verbosity,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setSystemPrompt('');
    setTemperature(0.7);
    setCreativity('medium');
    setVerbosity('normal');
    setEditingPersona(null);
    setIsOpen(false);
  };

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setName(persona.name);
    setDescription(persona.description);
    setSystemPrompt(persona.systemPrompt);
    setTemperature(persona.temperature);
    setCreativity(persona.creativity);
    setVerbosity(persona.verbosity);
    setIsOpen(true);
  };

  const handleTemplateSelect = (template: typeof DEFAULT_PERSONAS[0]) => {
    setName(template.name);
    setDescription(template.description);
    setSystemPrompt(template.systemPrompt);
    setTemperature(template.temperature);
    setCreativity(template.creativity);
    setVerbosity(template.verbosity);
  };

  const allPersonas = [...personas, ...DEFAULT_PERSONAS.map((p, i) => ({
    ...p,
    id: `default-${i}`,
  }))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">AI Personas</h3>
          <p className="text-sm text-zinc-500">
            Create different AI personalities for different tasks
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus size={16} className="mr-2" />
          New Persona
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {allPersonas.map((persona) => (
          <Card key={persona.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} />
                    <CardTitle className="text-base">{persona.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    {persona.description}
                  </CardDescription>
                </div>
                {!persona.id.startsWith('default-') && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(persona)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemovePersona(persona.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Badge variant="outline">
                    Creativity: {persona.creativity}
                  </Badge>
                  <Badge variant="outline">
                    Verbosity: {persona.verbosity}
                  </Badge>
                </div>
                <div className="text-xs text-zinc-500">
                  Temperature: {persona.temperature.toFixed(1)}
                </div>
                <p className="text-xs bg-zinc-50 dark:bg-zinc-900 p-2 rounded line-clamp-2">
                  {persona.systemPrompt}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>
              {editingPersona ? 'Edit Persona' : 'Create New Persona'}
            </DialogTitle>
            <DialogDescription>
              Define a unique AI personality with custom behavior
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-200px)]">
            {!editingPersona && (
              <div className="space-y-2">
                <Label>Quick Start Templates</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_PERSONAS.map((template, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <Sparkles size={14} className="mr-2" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="persona-name">Persona Name</Label>
              <Input
                id="persona-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Custom Persona"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="persona-description">Description</Label>
              <Input
                id="persona-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this persona"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                id="system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are..."
                rows={6}
              />
              <p className="text-xs text-zinc-500">
                Define the personality, tone, and behavior of this AI persona
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">
                Temperature: {temperature.toFixed(1)}
              </Label>
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[temperature]}
                onValueChange={([value]) => setTemperature(value)}
              />
              <p className="text-xs text-zinc-500">
                Lower = more focused, higher = more creative
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creativity">Creativity Level</Label>
                <Select value={creativity} onValueChange={(v: any) => setCreativity(v)}>
                  <SelectTrigger id="creativity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Precise</SelectItem>
                    <SelectItem value="medium">Medium - Balanced</SelectItem>
                    <SelectItem value="high">High - Innovative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verbosity">Verbosity</Label>
                <Select value={verbosity} onValueChange={(v: any) => setVerbosity(v)}>
                  <SelectTrigger id="verbosity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingPersona ? 'Save Changes' : 'Create Persona'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
