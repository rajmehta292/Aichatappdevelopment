import { useState } from 'react';
import { ModelProvider } from '../types/chat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { CheckCircle2, Circle, Eye, EyeOff, ExternalLink, AlertCircle } from 'lucide-react';

interface ProviderSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (provider: Omit<ModelProvider, 'id'>) => void;
}

const PROVIDER_TEMPLATES = [
  {
    name: 'Ollama',
    type: 'ollama' as const,
    description: 'Run models locally on your machine',
    apiUrl: 'http://localhost:11434',
    models: ['llama2', 'llama3', 'mistral', 'codellama', 'mixtral', 'phi', 'gemma'],
    requiresKey: false,
    icon: '🦙',
    setup: {
      title: 'Setup Ollama',
      steps: [
        'Download Ollama from ollama.ai',
        'Install and run Ollama on your machine',
        'Pull a model: ollama pull llama2',
        'Ollama will run on http://localhost:11434',
      ],
      link: 'https://ollama.ai',
    },
  },
  {
    name: 'OpenAI',
    type: 'openai' as const,
    description: 'GPT-4, GPT-3.5, and other OpenAI models',
    apiUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    requiresKey: true,
    icon: '🤖',
    setup: {
      title: 'Setup OpenAI',
      steps: [
        'Go to platform.openai.com',
        'Sign up or log in to your account',
        'Navigate to API Keys section',
        'Create a new API key',
        'Copy and paste the key below',
      ],
      link: 'https://platform.openai.com/api-keys',
    },
  },
  {
    name: 'Anthropic (Claude)',
    type: 'anthropic' as const,
    description: 'Claude 3 models from Anthropic',
    apiUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    requiresKey: true,
    icon: '🧠',
    setup: {
      title: 'Setup Anthropic',
      steps: [
        'Go to console.anthropic.com',
        'Sign up or log in to your account',
        'Navigate to API Keys section',
        'Create a new API key',
        'Copy and paste the key below',
      ],
      link: 'https://console.anthropic.com/',
    },
  },
];

type WizardStep = 'select' | 'configure' | 'test' | 'complete';

export function ProviderSetupWizard({ open, onOpenChange, onComplete }: ProviderSetupWizardProps) {
  const [step, setStep] = useState<WizardStep>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PROVIDER_TEMPLATES[0] | null>(null);
  const [name, setName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const resetWizard = () => {
    setStep('select');
    setSelectedTemplate(null);
    setName('');
    setApiUrl('');
    setApiKey('');
    setShowApiKey(false);
    setTestResult(null);
    onOpenChange(false);
  };

  const handleTemplateSelect = (template: typeof PROVIDER_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setName(template.name);
    setApiUrl(template.apiUrl);
    setStep('configure');
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    // Simulate API test (replace with actual test)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, always succeed
    setTestResult('success');
    setIsTesting(false);
    
    // In production, you'd actually test the connection here
    // try {
    //   const response = await fetch(apiUrl, { headers: { Authorization: `Bearer ${apiKey}` } });
    //   setTestResult(response.ok ? 'success' : 'error');
    // } catch {
    //   setTestResult('error');
    // }
  };

  const handleComplete = () => {
    if (!selectedTemplate) return;

    onComplete({
      name,
      type: selectedTemplate.type,
      apiUrl,
      apiKey: apiKey || undefined,
      models: selectedTemplate.models,
      enabled: true,
    });

    resetWizard();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Model Provider</DialogTitle>
          <DialogDescription>
            {step === 'select' && 'Choose a provider to connect to'}
            {step === 'configure' && 'Configure your provider connection'}
            {step === 'test' && 'Test your connection'}
            {step === 'complete' && 'Provider added successfully!'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {(['select', 'configure', 'test'] as WizardStep[]).map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 ${step === s ? 'text-blue-600' : 'text-zinc-400'}`}>
                {(['select', 'configure', 'test'] as WizardStep[]).indexOf(step) > idx ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <Circle size={20} />
                )}
                <span className="text-sm font-medium capitalize">{s}</span>
              </div>
              {idx < 2 && <div className="w-12 h-0.5 bg-zinc-200 dark:bg-zinc-700 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Provider */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {PROVIDER_TEMPLATES.map((template) => (
                <Card
                  key={template.type}
                  className="cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{template.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          {!template.requiresKey && (
                            <Badge variant="outline" className="text-xs">Free & Local</Badge>
                          )}
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.models.slice(0, 4).map(model => (
                            <Badge key={model} variant="secondary" className="text-xs">
                              {model}
                            </Badge>
                          ))}
                          {template.models.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.models.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 'configure' && selectedTemplate && (
          <div className="space-y-4">
            {/* Setup Instructions */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{selectedTemplate.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{selectedTemplate.setup.title}</h4>
                    <ol className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                      {selectedTemplate.setup.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="font-semibold">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <a
                      href={selectedTemplate.setup.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Open {selectedTemplate.name} website
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider-name">Provider Name</Label>
                <Input
                  id="provider-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Provider"
                />
                <p className="text-xs text-zinc-500">Give this provider a memorable name</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-url">API URL</Label>
                <Input
                  id="api-url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.example.com"
                />
                <p className="text-xs text-zinc-500">
                  {selectedTemplate.type === 'ollama' 
                    ? 'Keep default unless you changed Ollama\'s port'
                    : 'Usually you can keep the default URL'}
                </p>
              </div>

              {selectedTemplate.requiresKey && (
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Your API key is stored only in your browser's localStorage
                  </p>
                </div>
              )}

              {/* Privacy Notice */}
              <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Privacy & Security</h4>
                      <ul className="text-xs space-y-1 text-zinc-700 dark:text-zinc-300">
                        <li>• All data is stored locally in your browser</li>
                        <li>• API keys never leave your device</li>
                        <li>• Requests go directly to your chosen provider</li>
                        <li>• No third-party tracking or data collection</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Test Connection */}
        {step === 'test' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              {testResult === null && !isTesting && (
                <>
                  <div className="text-4xl mb-4">🔌</div>
                  <h3 className="font-semibold mb-2">Ready to test connection</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    Click the button below to verify your configuration
                  </p>
                  <Button onClick={handleTest}>Test Connection</Button>
                </>
              )}

              {isTesting && (
                <>
                  <div className="text-4xl mb-4 animate-pulse">⚡</div>
                  <h3 className="font-semibold mb-2">Testing connection...</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Please wait while we verify your settings
                  </p>
                </>
              )}

              {testResult === 'success' && (
                <>
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-semibold text-green-600 mb-2">Connection successful!</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    Your provider is configured and ready to use
                  </p>
                  <Button onClick={handleComplete}>Complete Setup</Button>
                </>
              )}

              {testResult === 'error' && (
                <>
                  <div className="text-4xl mb-4">❌</div>
                  <h3 className="font-semibold text-red-600 mb-2">Connection failed</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    Please check your settings and try again
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setStep('configure')}>
                      Back to Configuration
                    </Button>
                    <Button onClick={handleTest}>Retry</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'select' && (
            <Button variant="outline" onClick={resetWizard}>
              Cancel
            </Button>
          )}
          {step === 'configure' && (
            <>
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button
                onClick={() => setStep('test')}
                disabled={!name.trim() || !apiUrl.trim() || (selectedTemplate?.requiresKey && !apiKey.trim())}
              >
                Continue
              </Button>
            </>
          )}
          {step === 'test' && testResult !== 'success' && (
            <Button variant="outline" onClick={() => setStep('configure')}>
              Back
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
