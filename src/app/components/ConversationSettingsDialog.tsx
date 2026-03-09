import { useState, useEffect } from 'react';
import { ConversationSettings, Persona } from '../types/chat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
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
import { Badge } from './ui/badge';
import { Settings2, Lock, Unlock } from 'lucide-react';

interface ConversationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings?: ConversationSettings;
  isPrivate?: boolean;
  personas: Persona[];
  selectedPersonaId?: string;
  onSave: (settings: ConversationSettings, isPrivate: boolean, personaId?: string) => void;
}

export function ConversationSettingsDialog({
  open,
  onOpenChange,
  settings,
  isPrivate = false,
  personas,
  selectedPersonaId,
  onSave,
}: ConversationSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<ConversationSettings>(
    settings || {}
  );
  const [localPrivate, setLocalPrivate] = useState(isPrivate);
  const [localPersona, setLocalPersona] = useState<string | undefined>(selectedPersonaId);

  useEffect(() => {
    setLocalSettings(settings || {});
    setLocalPrivate(isPrivate);
    setLocalPersona(selectedPersonaId);
  }, [settings, isPrivate, selectedPersonaId, open]);

  const handleSave = () => {
    onSave(localSettings, localPrivate, localPersona);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalSettings({});
    setLocalPrivate(false);
    setLocalPersona(undefined);
  };

  const hasCustomSettings = Object.keys(localSettings).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 size={20} />
            Chat Settings
          </DialogTitle>
          <DialogDescription>
            Override global settings for this conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Privacy Mode */}
          <div className="p-4 rounded-lg border-2 border-dashed">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Label htmlFor="private-mode" className="font-semibold flex items-center gap-2">
                  {localPrivate ? (
                    <Lock size={16} className="text-amber-500" />
                  ) : (
                    <Unlock size={16} />
                  )}
                  Private Mode
                </Label>
                <p className="text-xs text-zinc-500 mt-1">
                  {localPrivate
                    ? 'Learning disabled - nothing saved to global context'
                    : 'Normal mode - auto-learning enabled if configured'}
                </p>
              </div>
              <Switch
                id="private-mode"
                checked={localPrivate}
                onCheckedChange={setLocalPrivate}
              />
            </div>
            {localPrivate && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg mt-2">
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  <strong>Private Mode Active:</strong> This conversation won't contribute to
                  auto-learning. The chat is still saved locally on your device, but no patterns
                  will be added to your global context. Perfect for sensitive topics!
                </p>
              </div>
            )}
          </div>

          {/* Persona Selection */}
          {personas.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="persona">AI Persona</Label>
              <Select value={localPersona || 'default'} onValueChange={setLocalPersona}>
                <SelectTrigger id="persona">
                  <SelectValue placeholder="Use global default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Global Default</SelectItem>
                  {personas.map((persona) => (
                    <SelectItem key={persona.id} value={persona.id}>
                      {persona.name} - {persona.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Context Mode */}
          <div className="space-y-2">
            <Label htmlFor="context-mode">Context Mode</Label>
            <Select
              value={localSettings.contextMode || 'global'}
              onValueChange={(value: any) =>
                setLocalSettings({ ...localSettings, contextMode: value })
              }
            >
              <SelectTrigger id="context-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  Global - Use all saved context
                </SelectItem>
                <SelectItem value="local">
                  Local - Only this conversation
                </SelectItem>
                <SelectItem value="hybrid">
                  Hybrid - Smart selection
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">
              Control whether global context is included in this chat
            </p>
          </div>

          {/* System Prompt Override */}
          <div className="space-y-2">
            <Label htmlFor="system-prompt">Custom System Prompt</Label>
            <Textarea
              id="system-prompt"
              value={localSettings.systemPrompt || ''}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  systemPrompt: e.target.value,
                })
              }
              placeholder="Leave empty to use global setting"
              rows={3}
            />
            <p className="text-xs text-zinc-500">
              Override the default system prompt for this conversation
            </p>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">
              Temperature:{' '}
              {localSettings.temperature !== undefined
                ? localSettings.temperature.toFixed(1)
                : 'Global'}
            </Label>
            <div className="flex items-center gap-2">
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[localSettings.temperature ?? 0.7]}
                onValueChange={([value]) =>
                  setLocalSettings({ ...localSettings, temperature: value })
                }
              />
              {localSettings.temperature !== undefined && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const { temperature, ...rest } = localSettings;
                    setLocalSettings(rest);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="max-tokens">Max Tokens</Label>
            <Input
              id="max-tokens"
              type="number"
              value={localSettings.maxTokens || ''}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  maxTokens: parseInt(e.target.value) || undefined,
                })
              }
              placeholder="Use global setting"
            />
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 p-4 border rounded-lg">
            <Label className="font-semibold">Feature Overrides</Label>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">RAG (Knowledge Base)</div>
                <div className="text-xs text-zinc-500">
                  {localSettings.enableRAG === undefined
                    ? 'Using global setting'
                    : localSettings.enableRAG
                    ? 'Enabled for this chat'
                    : 'Disabled for this chat'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {localSettings.enableRAG !== undefined && (
                  <Badge variant="secondary">Custom</Badge>
                )}
                <Switch
                  checked={localSettings.enableRAG ?? true}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, enableRAG: checked })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">MCP Tools</div>
                <div className="text-xs text-zinc-500">
                  {localSettings.enableMCP === undefined
                    ? 'Using global setting'
                    : localSettings.enableMCP
                    ? 'Enabled for this chat'
                    : 'Disabled for this chat'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {localSettings.enableMCP !== undefined && (
                  <Badge variant="secondary">Custom</Badge>
                )}
                <Switch
                  checked={localSettings.enableMCP ?? true}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, enableMCP: checked })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">AI Skills</div>
                <div className="text-xs text-zinc-500">
                  {localSettings.enableSkills === undefined
                    ? 'Using global setting'
                    : localSettings.enableSkills
                    ? 'Enabled for this chat'
                    : 'Disabled for this chat'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {localSettings.enableSkills !== undefined && (
                  <Badge variant="secondary">Custom</Badge>
                )}
                <Switch
                  checked={localSettings.enableSkills ?? true}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, enableSkills: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2 pt-4 border-t">
          <div>
            {hasCustomSettings && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset All
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
