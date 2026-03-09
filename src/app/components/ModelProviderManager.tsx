import { useState } from 'react';
import { ModelProvider } from '../types/chat';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Switch } from './ui/switch';
import { ProviderSetupWizard } from './ProviderSetupWizard';
import { Plus, Server, Check, Trash2 } from 'lucide-react';

interface ModelProviderManagerProps {
  providers: ModelProvider[];
  onAddProvider: (provider: Omit<ModelProvider, 'id'>) => void;
  onUpdateProvider: (id: string, updates: Partial<ModelProvider>) => void;
  onSetActive: (id: string) => void;
}

export function ModelProviderManager({
  providers,
  onAddProvider,
  onUpdateProvider,
  onSetActive,
}: ModelProviderManagerProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  const activeProvider = providers.find(p => p.enabled);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Model Providers</h3>
          <p className="text-sm text-zinc-500">
            Connect to AI model providers (Ollama, OpenAI, Claude)
          </p>
        </div>
        <Button onClick={() => setIsWizardOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Provider
        </Button>
      </div>

      {providers.length === 0 ? (
        <Card className="bg-zinc-50 dark:bg-zinc-900 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">🔌</div>
            <h3 className="font-semibold mb-2">No providers configured</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Add a model provider to start chatting with AI
            </p>
            <Button onClick={() => setIsWizardOpen(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Provider
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <Card
              key={provider.id}
              className={
                activeProvider?.id === provider.id
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                  : ''
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Server size={16} />
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      {activeProvider?.id === provider.id && (
                        <Badge className="bg-blue-500">
                          <Check size={12} className="mr-1" />
                          Active
                        </Badge>
                      )}
                      <Badge variant="outline">{provider.type}</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {provider.apiUrl}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={provider.enabled}
                      onCheckedChange={(checked) => {
                        onUpdateProvider(provider.id, { enabled: checked });
                        if (checked) {
                          onSetActive(provider.id);
                        }
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                      Available Models ({provider.models.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {provider.models.map((model) => (
                        <Badge key={model} variant="secondary" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t">
                    {activeProvider?.id !== provider.id && provider.enabled && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => onSetActive(provider.id)}
                      >
                        Set as Active
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Remove ${provider.name}? This cannot be undone.`)) {
                          // In a real app, you'd have a remove function
                          console.log('Remove provider', provider.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProviderSetupWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onComplete={onAddProvider}
      />
    </div>
  );
}