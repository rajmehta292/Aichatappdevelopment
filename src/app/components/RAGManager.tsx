import { useState } from 'react';
import { RAGDocument } from '../types/chat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  FileText,
  Upload,
  Trash2,
  FileCode,
  FileSpreadsheet,
  FileImage,
  File,
  Database,
  Search,
} from 'lucide-react';

interface RAGManagerProps {
  documents: RAGDocument[];
  onUploadDocument: (file: File) => Promise<void>;
  onRemoveDocument: (id: string) => void;
  onToggleDocument: (id: string, enabled: boolean) => void;
}

export function RAGManager({
  documents,
  onUploadDocument,
  onRemoveDocument,
  onToggleDocument,
}: RAGManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    try {
      await onUploadDocument(file);
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      e.target.value = '';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText size={20} />;
    if (type.includes('code') || type.includes('javascript') || type.includes('python'))
      return <FileCode size={20} />;
    if (type.includes('spreadsheet') || type.includes('csv'))
      return <FileSpreadsheet size={20} />;
    if (type.includes('image')) return <FileImage size={20} />;
    return <File size={20} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const totalDocuments = documents.length;
  const enabledDocuments = documents.filter((d) => d.enabled).length;
  const totalChunks = documents.reduce((sum, d) => sum + d.chunks, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Knowledge Base (RAG)</h3>
          <p className="text-sm text-zinc-500">
            Upload documents to enhance AI responses with your own data
          </p>
        </div>
        <Label htmlFor="file-upload" className="cursor-pointer">
          <Button asChild>
            <span>
              <Upload size={16} className="mr-2" />
              Upload Document
            </span>
          </Button>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.txt,.md,.doc,.docx,.csv,.json"
          />
        </Label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Database size={20} className="text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{totalDocuments}</div>
                <div className="text-xs text-zinc-500">Total Documents</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search size={20} className="text-green-500" />
              <div>
                <div className="text-2xl font-bold">{enabledDocuments}</div>
                <div className="text-xs text-zinc-500">Active Sources</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{totalChunks}</div>
                <div className="text-xs text-zinc-500">Total Chunks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isUploading && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading and indexing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Upload size={48} className="mx-auto mb-4 text-zinc-400" />
            <h4 className="font-semibold mb-2">No Documents Yet</h4>
            <p className="text-sm text-zinc-500 mb-4">
              Upload documents to create a knowledge base for your AI assistant
            </p>
            <Label htmlFor="file-upload-empty" className="cursor-pointer">
              <Button asChild>
                <span>
                  <Upload size={16} className="mr-2" />
                  Upload Your First Document
                </span>
              </Button>
              <Input
                id="file-upload-empty"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.txt,.md,.doc,.docx,.csv,.json"
              />
            </Label>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="text-zinc-500">{getFileIcon(doc.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{doc.name}</div>
                    <div className="text-xs text-zinc-500 flex items-center gap-3">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{doc.chunks} chunks</span>
                      <span>•</span>
                      <span>
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.enabled && (
                      <Badge variant="outline" className="text-green-600">
                        Active
                      </Badge>
                    )}
                    <Switch
                      checked={doc.enabled}
                      onCheckedChange={(checked) =>
                        onToggleDocument(doc.id, checked)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveDocument(doc.id)}
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

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-sm">How RAG Works</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300">
          <p>
            <strong>1. Upload:</strong> Your documents are split into smaller chunks
          </p>
          <p>
            <strong>2. Index:</strong> Each chunk is converted to embeddings and stored
          </p>
          <p>
            <strong>3. Retrieve:</strong> When you ask a question, relevant chunks are found
          </p>
          <p>
            <strong>4. Generate:</strong> The AI uses these chunks to provide accurate answers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
