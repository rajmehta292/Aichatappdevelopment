import { useState } from 'react';
import { useFullChat } from '../context/FullChatContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Settings2 } from 'lucide-react';
import { Link } from 'react-router';

interface BasicSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BasicSettingsDialog({ open, onOpenChange }: BasicSettingsDialogProps) {
  const { settings, updateSettings, modelProviders } = useFullChat();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onOpenChange(false);
  };

  const activeProvider = modelProviders.find(p => p.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your AI chat experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={localSettings.defaultModel}
              onValueChange={(value) =>
                setLocalSettings({ ...localSettings, defaultModel: value })
              }
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama2">llama2</SelectItem>
                <SelectItem value="llama3">llama3</SelectItem>
                <SelectItem value="codellama">codellama</SelectItem>
                <SelectItem value="mistral">mistral</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo (OpenAI)</SelectItem>
                <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              </SelectContent>
            </Select>
            {activeProvider && (
              <p className="text-xs text-muted-foreground">
                Using {activeProvider.name} ({activeProvider.type})
              </p>
            )}
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={localSettings.systemPrompt}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, systemPrompt: e.target.value })
              }
              placeholder="You are a helpful AI assistant."
              className="min-h-[100px]"
            />
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Temperature: {localSettings.temperature.toFixed(1)}</Label>
            </div>
            <Slider
              value={[localSettings.temperature]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, temperature: value })
              }
              min={0}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower values make output more focused, higher values make it more creative
            </p>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Streaming Responses</Label>
                <p className="text-xs text-muted-foreground">
                  Show responses as they are generated
                </p>
              </div>
              <Switch
                checked={localSettings.streamResponse}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, streamResponse: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Private Mode by Default</Label>
                <p className="text-xs text-muted-foreground">
                  Disable auto-learning for new chats
                </p>
              </div>
              <Switch
                checked={localSettings.defaultPrivateMode}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, defaultPrivateMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Token Count</Label>
                <p className="text-xs text-muted-foreground">
                  Display token usage information
                </p>
              </div>
              <Switch
                checked={localSettings.showTokenCount}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, showTokenCount: checked })
                }
              />
            </div>
          </div>

          {/* Link to Advanced Settings */}
          <div className="pt-4 border-t">
            <Link to="/settings">
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                <Settings2 className="mr-2" size={16} />
                Advanced Settings & Extensions
              </Button>
            </Link>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
