import { useFullChat } from '../context/FullChatContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Sparkles } from 'lucide-react';

interface ModelSwitcherProps {
  conversationId?: string;
  currentModel?: string;
  onModelChange?: (model: string) => void;
}

export function ModelSwitcher({ conversationId, currentModel, onModelChange }: ModelSwitcherProps) {
  const { modelProviders, settings, currentConversationId, conversations, updateConversation } = useFullChat();

  const activeProvider = modelProviders.find(p => p.enabled);
  const conversation = conversations.find(c => c.id === (conversationId || currentConversationId));
  
  const selectedModel = currentModel || conversation?.model || settings.defaultModel;

  const handleModelChange = (model: string) => {
    if (onModelChange) {
      onModelChange(model);
    } else if (conversationId || currentConversationId) {
      updateConversation(conversationId || currentConversationId!, { model });
    }
  };

  // Get all available models from enabled providers
  const availableModels = modelProviders
    .filter(p => p.enabled)
    .flatMap(p => p.models.map(model => ({ model, provider: p })));

  if (availableModels.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
        <Sparkles size={14} className="text-amber-600" />
        <span className="text-xs text-amber-700 dark:text-amber-400">No models configured</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Sparkles size={14} className="text-zinc-500" />
      <Select value={selectedModel} onValueChange={handleModelChange}>
        <SelectTrigger className="h-8 w-[200px] text-sm">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {modelProviders
            .filter(p => p.enabled)
            .map(provider => (
              <div key={provider.id}>
                <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {provider.name}
                </div>
                {provider.models.map(model => (
                  <SelectItem key={`${provider.id}-${model}`} value={model}>
                    <div className="flex items-center gap-2">
                      <span>{model}</span>
                      {provider.type === 'ollama' && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          Local
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
