import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import {
  Shield,
  Lock,
  Database,
  Cloud,
  Eye,
  CheckCircle2,
  AlertCircle,
  Brain,
  Server,
} from 'lucide-react';

export function PrivacyExplainer() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Privacy & Data Control</h3>
        <p className="text-sm text-zinc-500">
          Understanding how your data is handled
        </p>
      </div>

      <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={16} className="text-green-600" />
            Your Data, Your Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>100% Local Storage:</strong> All conversations, settings, and context
              are stored only in your browser's localStorage. Nothing is sent to external servers
              except your chosen AI provider.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>No Tracking:</strong> We don't track your usage, collect analytics,
              or monitor your conversations. This is a completely private, offline-first application.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>You Own Your Data:</strong> Export, import, or delete all your data
              anytime. No account needed, no cloud storage required.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database size={16} />
              Storage Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Badge variant="outline">localStorage</Badge>
              <div>
                <div className="font-medium">Conversations & Settings</div>
                <div className="text-zinc-500">Stored in browser only</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">localStorage</Badge>
              <div>
                <div className="font-medium">API Keys</div>
                <div className="text-zinc-500">Never sent to us</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">localStorage</Badge>
              <div>
                <div className="font-medium">Global Context</div>
                <div className="text-zinc-500">Your learning data</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Server size={16} />
              External Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Badge>Only Your Choice</Badge>
              <div>
                <div className="font-medium">AI Provider</div>
                <div className="text-zinc-500">Ollama/OpenAI/Claude</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge>Optional</Badge>
              <div>
                <div className="font-medium">MCP Servers</div>
                <div className="text-zinc-500">You configure them</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock size={16} />
            Private Mode vs. Normal Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <div className="font-medium flex items-center gap-2">
              <Eye size={14} />
              Normal Mode (Default)
            </div>
            <ul className="text-xs space-y-1 ml-6 text-zinc-600 dark:text-zinc-400">
              <li>• Conversation is saved to localStorage on your device</li>
              <li>• Auto-learning can extract patterns → global context (if enabled)</li>
              <li>• Perfect for general work and learning from conversations</li>
              <li>• Example: "I prefer Python" → saved to help future chats</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-medium flex items-center gap-2">
              <Lock size={14} />
              Private Mode
            </div>
            <ul className="text-xs space-y-1 ml-6 text-zinc-600 dark:text-zinc-400">
              <li>• Conversation is still saved locally (you can export it)</li>
              <li>• Auto-learning is disabled for this chat</li>
              <li>• Nothing is added to global context</li>
              <li>• Perfect for sensitive topics, medical info, personal data</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain size={16} />
            Auto-Learning Explained
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>What it does:</strong> Analyzes your conversations to identify patterns,
            preferences, and important information. This is stored in "Global Context."
          </p>
          <p>
            <strong>Examples of what it learns:</strong>
          </p>
          <ul className="text-xs space-y-1 ml-6 text-zinc-600 dark:text-zinc-400">
            <li>• "You prefer TypeScript over JavaScript"</li>
            <li>• "You work in healthcare tech"</li>
            <li>• "You like detailed code comments"</li>
            <li>• "You follow clean code principles"</li>
          </ul>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            <strong>Important:</strong> This learning happens entirely on your device.
            It's training the AI <em>for you</em>, not training an AI model for others.
            Think of it as creating a personalized instruction manual that only you have access to.
          </p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-900">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-start gap-2">
            <span className="font-bold text-amber-600">1.</span>
            <div>
              <strong>AI Provider Privacy:</strong> When you send messages, they go to your
              chosen AI provider (Ollama, OpenAI, Claude). Check their privacy policies.
              Local Ollama = most private.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-amber-600">2.</span>
            <div>
              <strong>Browser Storage:</strong> If you clear browser data, all conversations
              are deleted. Export regularly if you want backups!
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-amber-600">3.</span>
            <div>
              <strong>Shared Computers:</strong> Anyone with access to your browser can see
              your saved chats. Use private browsing or clear data after use.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-amber-600">4.</span>
            <div>
              <strong>API Keys:</strong> Stored in localStorage unencrypted. Don't use this
              on shared or public computers with your real API keys.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-sm">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <strong>For Maximum Privacy:</strong>
            <ul className="ml-4 mt-1 space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>• Use Ollama running locally (no cloud API)</li>
              <li>• Enable Private Mode for sensitive conversations</li>
              <li>• Disable Auto-Learning if you prefer manual control</li>
              <li>• Regularly export and clear old conversations</li>
            </ul>
          </div>
          <div className="mt-3">
            <strong>For Best Experience:</strong>
            <ul className="ml-4 mt-1 space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>• Keep Auto-Learning on to build helpful context</li>
              <li>• Use folders to organize by sensitivity level</li>
              <li>• Review Global Context periodically and remove outdated info</li>
              <li>• Use Personas for different roles/projects</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
