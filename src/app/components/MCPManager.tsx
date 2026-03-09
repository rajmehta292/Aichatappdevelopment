import { useState } from 'react';
import { MCPServer, MCPTool } from '../types/chat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { 
  Plus, 
  Plug, 
  Circle, 
  Trash2, 
  RefreshCw,
  Settings,
  Wrench,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface MCPManagerProps {
  servers: MCPServer[];
  onAddServer: (name: string, url: string) => void;
  onRemoveServer: (id: string) => void;
  onToggleServer: (id: string, enabled: boolean) => void;
  onToggleTool: (serverId: string, toolId: string, enabled: boolean) => void;
  onRefreshServer: (id: string) => void;
}

export function MCPManager({
  servers,
  onAddServer,
  onRemoveServer,
  onToggleServer,
  onToggleTool,
  onRefreshServer,
}: MCPManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [serverName, setServerName] = useState('');
  const [serverUrl, setServerUrl] = useState('');

  const handleSubmit = () => {
    if (!serverName.trim() || !serverUrl.trim()) return;
    onAddServer(serverName, serverUrl);
    setServerName('');
    setServerUrl('');
    setIsOpen(false);
  };

  const getStatusColor = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'disconnected':
        return 'text-gray-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">MCP Servers</h3>
          <p className="text-sm text-zinc-500">
            Connect external tools and APIs via Model Context Protocol
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Server
        </Button>
      </div>

      {servers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Plug size={48} className="mx-auto mb-4 text-zinc-400" />
            <h4 className="font-semibold mb-2">No MCP Servers Connected</h4>
            <p className="text-sm text-zinc-500 mb-4">
              Add MCP servers to extend your AI with external tools and capabilities
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Server
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {servers.map((server) => (
            <Card key={server.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{server.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={getStatusColor(server.status)}
                      >
                        <Circle size={8} className="mr-1 fill-current" />
                        {getStatusText(server.status)}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {server.url}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRefreshServer(server.id)}
                    >
                      <RefreshCw size={14} />
                    </Button>
                    <Switch
                      checked={server.enabled}
                      onCheckedChange={(checked) =>
                        onToggleServer(server.id, checked)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveServer(server.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {server.tools.length > 0 && (
                <CardContent className="pt-0">
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium mb-2 hover:underline">
                      <Wrench size={14} />
                      Tools ({server.tools.length})
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-2 ml-6">
                        {server.tools.map((tool) => (
                          <div
                            key={tool.id}
                            className="flex items-start justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {tool.name}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {tool.description}
                              </div>
                            </div>
                            <Switch
                              checked={tool.enabled}
                              onCheckedChange={(checked) =>
                                onToggleTool(server.id, tool.id, checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add MCP Server</DialogTitle>
            <DialogDescription>
              Connect to an MCP-compatible server to add tools and capabilities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="server-name">Server Name</Label>
              <Input
                id="server-name"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="My MCP Server"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-url">Server URL</Label>
              <Input
                id="server-url"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://localhost:3000/mcp"
              />
              <p className="text-xs text-zinc-500">
                The URL of your MCP server endpoint
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Popular MCP Servers:</h4>
              <ul className="text-xs space-y-1 text-zinc-700 dark:text-zinc-300">
                <li>• GitHub - Access repositories and issues</li>
                <li>• Google Drive - Search and manage files</li>
                <li>• Slack - Send messages and read channels</li>
                <li>• PostgreSQL - Query databases</li>
                <li>• Custom - Build your own MCP server</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Server</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
