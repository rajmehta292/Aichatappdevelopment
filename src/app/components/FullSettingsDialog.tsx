import { useState } from 'react';
import { useFullChat } from '../context/FullChatContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MCPManager } from './MCPManager';
import { RAGManager } from './RAGManager';
import { PromptsLibrary } from './PromptsLibrary';
import { ModelProviderManager } from './ModelProviderManager';
import { ContextManager } from './ContextManager';
import { SkillsManager } from './SkillsManager';
import { RulesManager } from './RulesManager';
import { PersonasManager } from './PersonasManager';
import { PrivacyExplainer } from './PrivacyExplainer';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';

interface FullSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FullSettingsDialog({ open, onOpenChange }: FullSettingsDialogProps) {
  const {
    settings,
    updateSettings,
    conversations,
    modelProviders,
    addModelProvider,
    updateModelProvider,
    setActiveProvider,
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
    skills,
    toggleSkill,
    rules,
    addRule,
    updateRule,
    removeRule,
    globalContexts,
    addGlobalContext,
    removeGlobalContext,
    personas,
    addPersona,
    updatePersona,
    removePersona,
  } = useFullChat();

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
    navigator.clipboard.writeText(content);
    alert('Prompt copied to clipboard! Paste it in the chat input.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Settings & Extensions</DialogTitle>
          <DialogDescription>
            Configure your complete AI chat experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="providers" className="flex-1">
          <div className="border-b px-6">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
              <TabsTrigger value="providers">Providers</TabsTrigger>
              <TabsTrigger value="context">Context</TabsTrigger>
              <TabsTrigger value="personas">Personas</TabsTrigger>
              <TabsTrigger value="mcp">MCP</TabsTrigger>
              <TabsTrigger value="rag">RAG</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <TabsContent value="providers" className="px-6 pb-6 space-y-4">
              <ModelProviderManager
                providers={modelProviders}
                activeProvider={settings.activeProvider}
                onAddProvider={addModelProvider}
                onUpdateProvider={updateModelProvider}
                onSetActiveProvider={(id) => {
                  setActiveProvider(id);
                  const provider = modelProviders.find(p => p.id === id);
                  if (provider?.defaultModel) {
                    setLocalSettings({ ...localSettings, model: provider.defaultModel });
                  }
                }}
              />

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Basic Settings</h4>
                
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    value={localSettings.systemPrompt}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, systemPrompt: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Temperature: {localSettings.temperature}</Label>
                  <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    value={[localSettings.temperature]}
                    onValueChange={([value]) =>
                      setLocalSettings({ ...localSettings, temperature: value })
                    }
                  />
                </div>

                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="streaming">Streaming Responses</Label>
                    <Switch
                      id="streaming"
                      checked={localSettings.streamingEnabled}
                      onCheckedChange={(checked) =>
                        setLocalSettings({ ...localSettings, streamingEnabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="private-default">Private Mode by Default</Label>
                    <Switch
                      id="private-default"
                      checked={localSettings.defaultPrivateMode}
                      onCheckedChange={(checked) =>
                        setLocalSettings({ ...localSettings, defaultPrivateMode: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-tokens">Show Token Count</Label>
                    <Switch
                      id="show-tokens"
                      checked={localSettings.showTokenCount}
                      onCheckedChange={(checked) =>
                        setLocalSettings({ ...localSettings, showTokenCount: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="context" className="px-6 pb-6">
              <ContextManager
                contexts={globalContexts}
                enableGlobalContext={localSettings.enableGlobalContext}
                enableAutoLearning={localSettings.enableAutoLearning}
                onToggleGlobalContext={(enabled) =>
                  setLocalSettings({ ...localSettings, enableGlobalContext: enabled })
                }
                onToggleAutoLearning={(enabled) =>
                  setLocalSettings({ ...localSettings, enableAutoLearning: enabled })
                }
                onAddContext={addGlobalContext}
                onRemoveContext={removeGlobalContext}
              />
            </TabsContent>

            <TabsContent value="personas" className="px-6 pb-6">
              <PersonasManager
                personas={personas}
                onAddPersona={addPersona}
                onUpdatePersona={updatePersona}
                onRemovePersona={removePersona}
              />
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

            <TabsContent value="skills" className="px-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <div>
                    <Label htmlFor="enable-skills">Enable AI Skills</Label>
                    <p className="text-xs text-zinc-500">
                      Advanced capabilities like search, code execution, etc.
                    </p>
                  </div>
                  <Switch
                    id="enable-skills"
                    checked={localSettings.enableSkills}
                    onCheckedChange={(checked) =>
                      setLocalSettings({ ...localSettings, enableSkills: checked })
                    }
                  />
                </div>

                <SkillsManager skills={skills} onToggleSkill={toggleSkill} />
              </div>
            </TabsContent>

            <TabsContent value="rules" className="px-6 pb-6">
              <RulesManager
                rules={rules}
                onAddRule={addRule}
                onUpdateRule={updateRule}
                onRemoveRule={removeRule}
              />
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

            <TabsContent value="privacy" className="px-6 pb-6">
              <PrivacyExplainer />
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
                        'Are you sure you want to delete ALL data including conversations, folders, settings, context, and documents? This cannot be undone.'
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
