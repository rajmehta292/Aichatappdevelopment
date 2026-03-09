import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings, conversations } = useChat();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    onOpenChange(false);
  };

  const handleExportChats = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportChats = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        localStorage.setItem('ai-chat-conversations', JSON.stringify(imported));
        window.location.reload();
      } catch (error) {
        alert('Failed to import chats. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your AI chat experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="model" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="model" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="ollama-url">Ollama API URL</Label>
              <Input
                id="ollama-url"
                value={localSettings.ollamaUrl}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, ollamaUrl: e.target.value })
                }
                placeholder="http://localhost:11434"
              />
              <p className="text-xs text-zinc-500">
                The URL where your Ollama instance is running
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={localSettings.model}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, model: e.target.value })
                }
                placeholder="llama2"
              />
              <p className="text-xs text-zinc-500">
                Examples: llama2, llama3, mistral, codellama, vicuna
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">
                Temperature: {localSettings.temperature}
              </Label>
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[localSettings.temperature]}
                onValueChange={([value]) =>
                  setLocalSettings({ ...localSettings, temperature: value })
                }
              />
              <p className="text-xs text-zinc-500">
                Controls randomness. Lower is more focused, higher is more creative.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                value={localSettings.maxTokens}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    maxTokens: parseInt(e.target.value) || 2048,
                  })
                }
              />
              <p className="text-xs text-zinc-500">
                Maximum length of the response
              </p>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                id="system-prompt"
                value={localSettings.systemPrompt}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    systemPrompt: e.target.value,
                  })
                }
                rows={6}
                placeholder="You are a helpful AI assistant."
              />
              <p className="text-xs text-zinc-500">
                Instructions that guide the AI's behavior and personality
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold mb-2">Integration Guide</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-zinc-700 dark:text-zinc-300">
                <li>Install and run Ollama on your machine</li>
                <li>Pull a model: <code className="bg-white dark:bg-zinc-900 px-1 rounded">ollama pull llama2</code></li>
                <li>Enable CORS if needed</li>
                <li>Update the API URL in settings</li>
                <li>Replace the mock API in ChatContext.tsx</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Export Chat History</Label>
              <Button onClick={handleExportChats} variant="outline" className="w-full">
                Export All Chats (JSON)
              </Button>
              <p className="text-xs text-zinc-500">
                Download all your conversations as a JSON file
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-chats">Import Chat History</Label>
              <Input
                id="import-chats"
                type="file"
                accept=".json"
                onChange={handleImportChats}
              />
              <p className="text-xs text-zinc-500">
                Import conversations from a previously exported file
              </p>
            </div>

            <div className="space-y-2">
              <Label>Clear All Data</Label>
              <Button
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to delete all conversations? This cannot be undone.'
                    )
                  ) {
                    localStorage.removeItem('ai-chat-conversations');
                    window.location.reload();
                  }
                }}
                variant="destructive"
                className="w-full"
              >
                Delete All Conversations
              </Button>
              <p className="text-xs text-zinc-500">
                Permanently delete all your chat history
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
