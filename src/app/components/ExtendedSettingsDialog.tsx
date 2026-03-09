import { useState } from 'react';
import { useExtendedChat } from '../context/ExtendedChatContext';
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
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MCPManager } from './MCPManager';
import { RAGManager } from './RAGManager';
import { PromptsLibrary } from './PromptsLibrary';
import { ScrollArea } from './ui/scroll-area';

interface ExtendedSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExtendedSettingsDialog({ open, onOpenChange }: ExtendedSettingsDialogProps) {
  const {
    settings,
    updateSettings,
    conversations,
    mcpServers,
    addMCPServer,
    removeMCPServer,
    toggleMCPServer,
    toggleMCPTool,
    refreshMCPServer,
    ragDocuments,
    uploadRAGDocument,
    removeRAGDocument,
    toggleRAGDocument,
    customPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    sendMessage,
  } = useExtendedChat();

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

  const handleUsePrompt = (content: string) => {
    onOpenChange(false);
    // This will be used in the chat input
    navigator.clipboard.writeText(content);
    alert('Prompt copied to clipboard! Paste it in the chat input.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Settings & Extensions</DialogTitle>
          <DialogDescription>
            Configure your AI chat experience and manage extensions
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="model" className="flex-1">
          <div className="border-b px-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="model">Model</TabsTrigger>
              <TabsTrigger value="mcp">MCP Tools</TabsTrigger>
              <TabsTrigger value="rag">Knowledge Base</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto max-h-[calc(85vh-200px)]">
            <TabsContent value="model" className="space-y-4 px-6 pb-6">
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
                  Examples: llama2, llama3, mistral, codellama, vicuna, phi, gemma
                </p>
              </div>

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
                  rows={4}
                  placeholder="You are a helpful AI assistant."
                />
                <p className="text-xs text-zinc-500">
                  Instructions that guide the AI's behavior and personality
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

            <TabsContent value="mcp" className="px-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <div>
                    <Label htmlFor="enable-mcp">Enable MCP Integration</Label>
                    <p className="text-xs text-zinc-500">
                      Allow AI to use external tools and APIs
                    </p>
                  </div>
                  <Switch
                    id="enable-mcp"
                    checked={localSettings.enableMCP}
                    onCheckedChange={(checked) =>
                      setLocalSettings({ ...localSettings, enableMCP: checked })
                    }
                  />
                </div>

                <MCPManager
                  servers={mcpServers}
                  onAddServer={addMCPServer}
                  onRemoveServer={removeMCPServer}
                  onToggleServer={toggleMCPServer}
                  onToggleTool={toggleMCPTool}
                  onRefreshServer={refreshMCPServer}
                />
              </div>
            </TabsContent>

            <TabsContent value="rag" className="px-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <div>
                    <Label htmlFor="enable-rag">Enable RAG (Knowledge Base)</Label>
                    <p className="text-xs text-zinc-500">
                      Enhance responses with your own documents
                    </p>
                  </div>
                  <Switch
                    id="enable-rag"
                    checked={localSettings.enableRAG}
                    onCheckedChange={(checked) =>
                      setLocalSettings({ ...localSettings, enableRAG: checked })
                    }
                  />
                </div>

                <RAGManager
                  documents={ragDocuments}
                  onUploadDocument={uploadRAGDocument}
                  onRemoveDocument={removeRAGDocument}
                  onToggleDocument={toggleRAGDocument}
                />
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="px-6 pb-6">
              <PromptsLibrary
                prompts={customPrompts}
                onCreatePrompt={createPrompt}
                onUpdatePrompt={updatePrompt}
                onDeletePrompt={deletePrompt}
                onUsePrompt={handleUsePrompt}
              />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 px-6 pb-6">
              <div className="space-y-2">
                <Label htmlFor="top-k">Top K: {localSettings.topK}</Label>
                <Slider
                  id="top-k"
                  min={1}
                  max={100}
                  step={1}
                  value={[localSettings.topK || 40]}
                  onValueChange={([value]) =>
                    setLocalSettings({ ...localSettings, topK: value })
                  }
                />
                <p className="text-xs text-zinc-500">
                  Limits the next token selection to the K most probable tokens
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="top-p">Top P: {localSettings.topP}</Label>
                <Slider
                  id="top-p"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[localSettings.topP || 0.9]}
                  onValueChange={([value]) =>
                    setLocalSettings({ ...localSettings, topP: value })
                  }
                />
                <p className="text-xs text-zinc-500">
                  Cumulative probability threshold for nucleus sampling
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat-penalty">
                  Repeat Penalty: {localSettings.repeatPenalty}
                </Label>
                <Slider
                  id="repeat-penalty"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[localSettings.repeatPenalty || 1.1]}
                  onValueChange={([value]) =>
                    setLocalSettings({ ...localSettings, repeatPenalty: value })
                  }
                />
                <p className="text-xs text-zinc-500">
                  Penalizes repetition in generated text
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg mt-6">
                <h4 className="font-semibold mb-2">Ollama Integration Guide</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-zinc-700 dark:text-zinc-300">
                  <li>Install Ollama from https://ollama.ai</li>
                  <li>Run: <code className="bg-white dark:bg-zinc-900 px-1 rounded">ollama pull llama2</code></li>
                  <li>Start the server: <code className="bg-white dark:bg-zinc-900 px-1 rounded">ollama serve</code></li>
                  <li>Configure CORS if needed for browser access</li>
                  <li>Update API calls in ExtendedChatContext.tsx</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4 px-6 pb-6">
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
                        'Are you sure you want to delete all conversations, folders, and settings? This cannot be undone.'
                      )
                    ) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  Delete All Data
                </Button>
                <p className="text-xs text-zinc-500">
                  Permanently delete all your chat history and settings
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
