# File Upload Guide - AI Model Capabilities

## Overview
Different AI models support different types of files and have varying size limits. This guide explains what each model can handle.

## Model Support Matrix

### GPT-4o (OpenAI)
**Best for:** Multimodal tasks with documents and images

**Supported Files:**
- **Images:** PNG, JPEG, GIF, WebP
- **Documents:** PDF, TXT, DOCX, PPTX
- **Data:** CSV, JSON, XML
- **Max Size:** 20MB per file
- **Max Files:** 10 files per message
- **Context Window:** 128K tokens

**Use Cases:**
- Analyzing images and extracting text
- Reading and summarizing PDFs
- Data analysis from spreadsheets
- Code review from images/screenshots

### GPT-4 Vision (OpenAI)
**Best for:** Image analysis and understanding

**Supported Files:**
- **Images:** PNG, JPEG, GIF, WebP
- **Max Size:** 20MB per image
- **Max Files:** 10 images per message
- **Image Resolution:** Supports high-resolution images (up to 2048x2048)

**Use Cases:**
- Visual question answering
- OCR and text extraction
- Object detection and identification
- Chart and diagram analysis

### Claude 3.5 Sonnet (Anthropic)
**Best for:** Document analysis with strong reasoning

**Supported Files:**
- **Images:** PNG, JPEG, GIF, WebP
- **Documents:** PDF (up to 100 pages)
- **Text:** TXT, MD, CSV
- **Max Size:** 5MB per image, 32MB for documents
- **Max Files:** 5 files per message (20 images)
- **Context Window:** 200K tokens

**Special Features:**
- Excellent at analyzing complex PDFs
- Strong at understanding charts and graphs
- Can process multiple images simultaneously
- Great for research paper analysis

**Use Cases:**
- Legal document review
- Academic paper summarization
- Financial report analysis
- Multi-image comparison

### Claude 3 Opus (Anthropic)
**Best for:** Complex reasoning with visual context

**Same capabilities as Claude 3.5 Sonnet**
- More powerful reasoning
- Better at nuanced understanding
- Slower but more accurate

### Gemini Pro Vision (Google)
**Best for:** Multimodal with video support

**Supported Files:**
- **Images:** PNG, JPEG
- **Video:** MP4, MPEG, MOV, AVI (up to 2 minutes)
- **Audio:** MP3, WAV, AIFF
- **Documents:** PDF, TXT
- **Max Size:** 20MB per file
- **Max Files:** Up to 16 files per message

**Unique Features:**
- Video understanding (frame-by-frame analysis)
- Audio transcription and analysis
- Temporal understanding (video sequences)
- Multi-frame image analysis

**Use Cases:**
- Video content analysis
- Podcast/audio transcription
- Movie scene understanding
- Security footage review

### LLaVA (Ollama - Local)
**Best for:** Local image understanding

**Supported Files:**
- **Images:** PNG, JPEG
- **Max Size:** 10MB per image
- **Max Files:** 1-3 images (depending on RAM)
- **Runs Locally:** No data leaves your computer

**Use Cases:**
- Privacy-sensitive image analysis
- Offline image captioning
- Local document OCR
- When internet is unavailable

### Llama 3.2 Vision (Ollama - Local)
**Best for:** Efficient local multimodal

**Supported Files:**
- **Images:** PNG, JPEG, WebP
- **Max Size:** 10MB per image
- **Max Files:** 1-5 images
- **Models:** 11B and 90B parameters

**Use Cases:**
- Local image analysis
- Efficient on-device AI
- Privacy-focused applications

## File Size Best Practices

### Image Files
- **Optimal:** 1-5MB
- **Maximum:** 20MB (varies by model)
- **Resolution:** 1024x1024 to 2048x2048 for best results
- **Format Recommendation:** PNG for screenshots, JPEG for photos

### Document Files
- **Optimal:** Under 10MB
- **PDF Pages:** Keep under 50 pages for faster processing
- **Text Files:** Plain text processes faster than formatted docs
- **Tip:** Break large documents into sections

### Video Files (Gemini only)
- **Optimal:** 30 seconds to 2 minutes
- **Maximum:** Depends on file size limit
- **FPS:** 1-30 fps (lower FPS for longer videos)
- **Tip:** Extract key frames for better analysis

### Audio Files (Gemini only)
- **Optimal:** 1-10 minutes
- **Maximum:** Limited by file size
- **Format:** MP3 or WAV
- **Quality:** 128kbps is sufficient

## Implementation in Chat

### How to Upload Files

1. **Click the Paperclip Icon**
   - Located at the bottom left of the input field
   - Opens the file upload interface

2. **Drag and Drop**
   - Drag files directly into the upload area
   - Multiple files supported
   - Visual feedback when dragging

3. **Browse Files**
   - Click the upload area to open file browser
   - Select one or multiple files
   - See preview immediately

4. **Preview and Remove**
   - Uploaded files show as badges
   - Click X to remove before sending
   - Images show thumbnail preview

5. **Send with Message**
   - Files are attached to your message
   - AI processes them with your text prompt
   - Results appear in the response

## Tips for Best Results

### Image Analysis
```
Good prompt: "Analyze this diagram and explain the process flow step by step"
Bad prompt: "What is this?"
```

### Document Processing
```
Good prompt: "Summarize the key findings from this research paper, focusing on methodology and conclusions"
Bad prompt: "Read this PDF"
```

### Multi-Image Comparison
```
Good prompt: "Compare these three product screenshots. What are the main UI differences?"
Bad prompt: "Look at these images"
```

### Code Screenshots
```
Good prompt: "Review this code for bugs and suggest improvements. Focus on error handling."
Bad prompt: "Fix this code"
```

## Error Messages

### File Too Large
- **Solution:** Compress the file or split into smaller parts
- **Tools:** TinyPNG for images, PDF compressor for documents

### Unsupported Format
- **Solution:** Convert to a supported format
- **Tools:** CloudConvert, online converters

### Too Many Files
- **Solution:** Send in multiple messages
- **Tip:** Prioritize most important files first

### Processing Failed
- **Causes:** Corrupted file, unreadable format, timeout
- **Solution:** Re-upload or try a different file

## Privacy Considerations

### Cloud Models (GPT, Claude, Gemini)
- Files are sent to the provider's servers
- Processed and deleted after response
- Check provider's data policy
- Don't upload sensitive personal data

### Local Models (Ollama)
- Files never leave your computer
- Completely private
- Best for sensitive documents
- Slower but secure

### Best Practices
1. Use local models for confidential files
2. Remove metadata before uploading
3. Redact sensitive information
4. Use Private Mode for sensitive analysis
5. Export and clear conversations with sensitive content

## Advanced Features

### Batch Processing
Send multiple files to:
- Compare documents
- Analyze image series
- Process data files together

### Context Building
Upload files to RAG:
- Creates searchable knowledge base
- Persistent across conversations
- Faster than re-uploading

### File + MCP Tools
Combine file analysis with tools:
- Extract data → Save to database
- Analyze image → Generate report
- Process PDF → Create summary

## Model Selection Guide

**Choose GPT-4o if:**
- You need general-purpose file support
- Working with diverse file types
- Need reliable performance

**Choose Claude 3.5 if:**
- Analyzing complex documents
- Need strong reasoning
- Working with PDFs and research papers

**Choose Gemini if:**
- Processing video content
- Need audio transcription
- Multi-format projects

**Choose Ollama if:**
- Privacy is paramount
- Working offline
- Don't want to pay API costs

## Future Enhancements

Coming soon:
- Real-time file preview
- OCR for scanned documents
- Automatic file compression
- Batch upload improvements
- File history and re-upload
- Cloud storage integration
