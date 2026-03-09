import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  X,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
}

interface FileWithPreview extends File {
  preview?: string;
}

const FILE_ICONS: Record<string, any> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  text: FileText,
  code: FileCode,
  default: File,
};

// Model capabilities for file uploads
export const MODEL_FILE_SUPPORT = {
  'gpt-4o': {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'text/plain', 'application/msword'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  'gpt-4-vision': {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 20 * 1024 * 1024,
  },
  'claude-3-5-sonnet': {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'text/plain'],
    maxSize: 5 * 1024 * 1024, // 5MB per image
  },
  'gemini-pro-vision': {
    images: ['image/jpeg', 'image/png'],
    video: ['video/mp4', 'video/mpeg'],
    audio: ['audio/mp3', 'audio/wav'],
    maxSize: 20 * 1024 * 1024,
  },
  'llava': {
    images: ['image/jpeg', 'image/png'],
    maxSize: 10 * 1024 * 1024,
  },
};

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return FILE_ICONS.image;
  if (type.startsWith('video/')) return FILE_ICONS.video;
  if (type.startsWith('audio/')) return FILE_ICONS.audio;
  if (type.startsWith('text/') || type.includes('document')) return FILE_ICONS.text;
  if (type.includes('code') || type.includes('javascript') || type.includes('python'))
    return FILE_ICONS.code;
  return FILE_ICONS.default;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function FileUpload({
  onFilesAdded,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md'],
  },
  maxSize = 20 * 1024 * 1024,
  maxFiles = 10,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => {
        const fileWithPreview = file as FileWithPreview;
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        return fileWithPreview;
      });

      setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
      onFilesAdded(newFiles);
    },
    [maxFiles, onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  };

  return (
    <div className="space-y-3">
      <motion.div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
          }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative p-8 text-center">
          <motion.div
            className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
            animate={{
              rotate: isDragActive ? 360 : 0,
              scale: isDragActive ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Upload className="w-8 h-8 text-white" />
          </motion.div>
          
          <h3 className="font-semibold text-lg mb-2">
            {isDragActive ? 'Drop files here' : 'Upload files'}
          </h3>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            Drag and drop or click to browse
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="text-xs">
              Images (PNG, JPG, GIF)
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Documents (PDF, TXT)
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Max {formatFileSize(maxSize)}
            </Badge>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => {
              const Icon = getFileIcon(file.type);
              
              return (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 hover:shadow-md transition-all duration-200"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300" />
                  
                  <div className="relative flex items-center gap-3">
                    {file.preview ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for showing model capabilities
export function ModelFileCapabilities({ model }: { model: string }) {
  const capabilities = MODEL_FILE_SUPPORT[model as keyof typeof MODEL_FILE_SUPPORT];
  
  if (!capabilities) return null;
  
  return (
    <div className="text-xs text-zinc-500 space-y-1">
      <p className="font-medium">Supported files for {model}:</p>
      <div className="flex flex-wrap gap-1">
        {capabilities.images && (
          <Badge variant="outline" className="text-xs">
            <ImageIcon className="w-3 h-3 mr-1" />
            Images
          </Badge>
        )}
        {capabilities.documents && (
          <Badge variant="outline" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            Documents
          </Badge>
        )}
        {capabilities.video && (
          <Badge variant="outline" className="text-xs">
            <FileVideo className="w-3 h-3 mr-1" />
            Video
          </Badge>
        )}
        {capabilities.audio && (
          <Badge variant="outline" className="text-xs">
            <FileAudio className="w-3 h-3 mr-1" />
            Audio
          </Badge>
        )}
      </div>
    </div>
  );
}
