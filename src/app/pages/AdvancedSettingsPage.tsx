import { useState } from 'react';
import { useFullChat } from '../context/FullChatContext';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MCPManager } from '../components/MCPManager';
import { RAGManager } from '../components/RAGManager';
import { PromptsLibrary } from '../components/PromptsLibrary';
import { ModelProviderManager } from '../components/ModelProviderManager';
import { ContextManager } from '../components/ContextManager';
import { SkillsManager } from '../components/SkillsManager';
import { RulesManager } from '../components/RulesManager';
import { PersonasManager } from '../components/PersonasManager';
import { PrivacyExplainer } from '../components/PrivacyExplainer';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { Link } from 'react-router';

export function AdvancedSettingsPage() {
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
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Chat
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Advanced Settings & Extensions</h1>
                <p className="text-sm text-muted-foreground">
                  Configure your complete AI chat experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-8">
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

          {/* Model Providers */}
          <TabsContent value="providers" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Model Providers</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Connect to AI model providers (Ollama, OpenAI, Claude)
              </p>
            </div>
            <ModelProviderManager
              providers={modelProviders}
              onAddProvider={addModelProvider}
              onUpdateProvider={updateModelProvider}
              onSetActive={setActiveProvider}
            />
          </TabsContent>

          {/* Global Context */}
          <TabsContent value="context" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Global Context</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage context that applies to all conversations
              </p>
            </div>
            <ContextManager
              contexts={globalContexts}
              onAdd={addGlobalContext}
              onRemove={removeGlobalContext}
            />
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Enable Global Context</Label>
                <p className="text-xs text-muted-foreground">
                  Include global context in all conversations
                </p>
              </div>
              <Switch
                checked={localSettings.enableGlobalContext}
                onCheckedChange={(checked) => {
                  const newSettings = { ...localSettings, enableGlobalContext: checked };
                  setLocalSettings(newSettings);
                  updateSettings(newSettings);
                }}
              />
            </div>
          </TabsContent>

          {/* Personas */}
          <TabsContent value="personas" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">AI Personas</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Create AI assistants with different personalities and expertise
              </p>
            </div>
            <PersonasManager
              personas={personas}
              onAdd={addPersona}
              onUpdate={updatePersona}
              onRemove={removePersona}
            />
          </TabsContent>

          {/* MCP */}
          <TabsContent value="mcp" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Model Context Protocol (MCP)</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Connect external tools and services via MCP
              </p>
            </div>
            <MCPManager
              servers={mcpServers}
              onAddServer={addMCPServer}
              onRemoveServer={removeMCPServer}
              onToggleServer={toggleMCPServer}
              onToggleTool={toggleMCPTool}
              onRefreshServer={refreshMCPServer}
            />
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Enable MCP Tools</Label>
                <p className="text-xs text-muted-foreground">
                  Allow AI to use MCP tools in responses
                </p>
              </div>
              <Switch
                checked={localSettings.enableMCP}
                onCheckedChange={(checked) => {
                  const newSettings = { ...localSettings, enableMCP: checked };
                  setLocalSettings(newSettings);
                  updateSettings(newSettings);
                }}
              />
            </div>
          </TabsContent>

          {/* RAG */}
          <TabsContent value="rag" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">RAG Documents</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Upload documents for retrieval-augmented generation
              </p>
            </div>
            <RAGManager
              documents={ragDocuments}
              onUpload={uploadRAGDocument}
              onRemove={removeRAGDocument}
              onToggle={toggleRAGDocument}
            />
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Enable RAG</Label>
                <p className="text-xs text-muted-foreground">
                  Use document knowledge in responses
                </p>
              </div>
              <Switch
                checked={localSettings.enableRAG}
                onCheckedChange={(checked) => {
                  const newSettings = { ...localSettings, enableRAG: checked };
                  setLocalSettings(newSettings);
                  updateSettings(newSettings);
                }}
              />
            </div>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">AI Skills & Capabilities</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Enable specific AI capabilities and skills
              </p>
            </div>
            <SkillsManager skills={skills} onToggle={toggleSkill} />
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Enable Skills System</Label>
                <p className="text-xs text-muted-foreground">
                  Allow AI to use configured skills
                </p>
              </div>
              <Switch
                checked={localSettings.enableSkills}
                onCheckedChange={(checked) => {
                  const newSettings = { ...localSettings, enableSkills: checked };
                  setLocalSettings(newSettings);
                  updateSettings(newSettings);
                }}
              />
            </div>
          </TabsContent>

          {/* Rules */}
          <TabsContent value="rules" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Rules & Guidelines</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Set rules for how AI should behave and respond
              </p>
            </div>
            <RulesManager
              rules={rules}
              onAdd={addRule}
              onUpdate={updateRule}
              onRemove={removeRule}
            />
          </TabsContent>

          {/* Prompts Library */}
          <TabsContent value="prompts" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Prompts Library</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Save and reuse your favorite prompts
              </p>
            </div>
            <PromptsLibrary
              prompts={customPrompts}
              onCreate={createPrompt}
              onUpdate={updatePrompt}
              onDelete={deletePrompt}
            />
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Privacy & Learning</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Understand how your data is used and stored
              </p>
            </div>
            <PrivacyExplainer />
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Learning System</Label>
                  <p className="text-xs text-muted-foreground">
                    Learn from your conversations to improve responses
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableAutoLearning}
                  onCheckedChange={(checked) => {
                    const newSettings = { ...localSettings, enableAutoLearning: checked };
                    setLocalSettings(newSettings);
                    updateSettings(newSettings);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Context Retention</Label>
                  <p className="text-xs text-muted-foreground">
                    Remember context across conversations
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableContextRetention}
                  onCheckedChange={(checked) => {
                    const newSettings = { ...localSettings, enableContextRetention: checked };
                    setLocalSettings(newSettings);
                    updateSettings(newSettings);
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Data Management</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Export, import, and manage your chat data
              </p>
            </div>
            <div className="space-y-4 rounded-lg border p-6">
              <div>
                <h3 className="font-semibold mb-2">Export Conversations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all your conversations as JSON
                </p>
                <Button onClick={handleExportChats}>
                  <Download size={16} className="mr-2" />
                  Export All Chats
                </Button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Import Conversations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Restore conversations from a JSON file
                </p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportChats}
                  className="max-w-md"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Clear all data (this cannot be undone)
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        'Are you sure? This will delete all conversations, settings, and data.'
                      )
                    ) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                >
                  Clear All Data
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <Label>Max Conversation History</Label>
                <span className="text-sm text-muted-foreground">
                  {localSettings.maxConversationHistory} messages
                </span>
              </div>
              <Slider
                value={[localSettings.maxConversationHistory]}
                onValueChange={([value]) => {
                  const newSettings = { ...localSettings, maxConversationHistory: value };
                  setLocalSettings(newSettings);
                }}
                min={10}
                max={200}
                step={10}
              />
              <Button onClick={handleSave} className="mt-4">
                Save History Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}