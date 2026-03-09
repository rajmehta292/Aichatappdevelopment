# Deployment Guide

How to deploy your AI Chat Application to production.

## 🎯 Deployment Options

### Option 1: Static Hosting (Recommended for SPA)
- Vercel
- Netlify  
- GitHub Pages
- Cloudflare Pages

### Option 2: Self-Hosted
- Docker container
- Traditional web server (Nginx, Apache)
- Cloud VM (AWS EC2, DigitalOcean, etc.)

### Option 3: Desktop App
- Electron wrapper
- Tauri wrapper

## 🚀 Quick Deploy to Vercel (Easiest)

### Prerequisites
- GitHub account
- Vercel account (free tier available)

### Steps

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ai-chat-app.git
git push -u origin main
```

2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to GitHub repo
# - Configure project (auto-detected as Vite)
# - Deploy
```

3. **Configure environment variables** (if needed)
```
VITE_OLLAMA_URL=http://localhost:11434
VITE_DEFAULT_MODEL=llama2
```

4. **Access your app**
```
https://your-app-name.vercel.app
```

## 📦 Static Build

### Build for Production

```bash
npm run build
```

Output: `/dist` directory with optimized static files

### Build Configuration

**Vite config** (already configured):
```typescript
// vite.config.ts
export default {
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
        },
      },
    },
  },
};
```

### Preview Build Locally

```bash
npm run preview
```

## 🌐 Deploy to Netlify

### Method 1: Drag & Drop

1. Build the app: `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag the `/dist` folder
4. Done! Your app is live

### Method 2: Git Integration

1. Push code to GitHub
2. Go to Netlify → "New site from Git"
3. Connect GitHub repo
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy

### Netlify Configuration

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 📄 Deploy to GitHub Pages

### Steps

1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Add to package.json**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/ai-chat-app"
}
```

3. **Update vite.config.ts**
```typescript
export default {
  base: '/ai-chat-app/', // Your repo name
  // ... rest of config
};
```

4. **Deploy**
```bash
npm run deploy
```

5. **Configure GitHub Pages**
- Go to repo Settings → Pages
- Source: `gh-pages` branch
- Save

## 🐳 Docker Deployment

### Dockerfile

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build and Run

```bash
# Build image
docker build -t ai-chat-app .

# Run container
docker run -p 80:80 ai-chat-app

# Access at http://localhost
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Run:
```bash
docker-compose up -d
```

## ☁️ Deploy to Cloud Platforms

### AWS S3 + CloudFront

1. **Build the app**
```bash
npm run build
```

2. **Create S3 bucket**
```bash
aws s3 mb s3://your-ai-chat-app
```

3. **Upload files**
```bash
aws s3 sync dist/ s3://your-ai-chat-app
```

4. **Configure bucket for static hosting**
```bash
aws s3 website s3://your-ai-chat-app --index-document index.html --error-document index.html
```

5. **Create CloudFront distribution**
- Point to S3 bucket
- Configure HTTPS
- Set custom domain (optional)

### DigitalOcean App Platform

1. Push code to GitHub
2. Go to DigitalOcean → Apps → Create App
3. Connect GitHub repo
4. Auto-detects build settings
5. Deploy

## 🖥️ Electron Desktop App

### Setup

1. **Install Electron**
```bash
npm install --save-dev electron electron-builder
```

2. **Create electron.js**
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(createWindow);
```

3. **Update package.json**
```json
{
  "main": "electron.js",
  "scripts": {
    "electron": "electron .",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.yourname.aichat",
    "files": ["dist/**/*", "electron.js"],
    "directories": {
      "buildResources": "assets"
    }
  }
}
```

4. **Build**
```bash
npm run electron:build
```

## 🔐 Production Considerations

### Environment Variables

**Don't commit API keys!**

Create `.env.production`:
```env
VITE_OLLAMA_URL=http://localhost:11434
VITE_DEFAULT_MODEL=llama2
```

Add to `.gitignore`:
```
.env.production
.env.local
```

### API Key Security

**Problem:** Storing API keys in localStorage is insecure for production

**Solutions:**

#### Option 1: Backend Proxy
```typescript
// Instead of direct API calls
const response = await fetch('https://api.openai.com/v1/chat', {
  headers: { Authorization: `Bearer ${apiKey}` }
});

// Use your backend
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages }),
});
```

#### Option 2: Environment Variables (Server-Side)
```typescript
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || userProvidedKey;
```

#### Option 3: Encryption
```typescript
// Encrypt before storing
const encrypted = await encryptApiKey(apiKey);
localStorage.setItem('api-key', encrypted);

// Decrypt when using
const decrypted = await decryptApiKey(encrypted);
```

### CORS Configuration

For Ollama (if accessing from different domain):

**Add to Ollama config:**
```bash
# ~/.ollama/config.json
{
  "origins": ["https://your-app.com"]
}
```

**Or use proxy:**
```typescript
// Create /api/ollama endpoint in your backend
app.post('/api/ollama', async (req, res) => {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    body: JSON.stringify(req.body),
  });
  response.body.pipe(res);
});
```

### Performance Optimization

#### 1. Code Splitting
```typescript
// Lazy load settings page
const AdvancedSettingsPage = lazy(() => import('./pages/AdvancedSettingsPage'));
```

#### 2. Image Optimization
```bash
# Use optimized images
npm install --save-dev vite-plugin-imagemin
```

#### 3. Compression
```nginx
# In nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

#### 4. Caching
```nginx
# Cache static assets for 1 year
location ~* \.(js|css|png|jpg|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Analytics (Optional)

**Privacy-friendly options:**
- Plausible Analytics
- Simple Analytics
- Self-hosted Matomo

**Add to index.html:**
```html
<script defer data-domain="your-app.com" src="https://plausible.io/js/script.js"></script>
```

## 📊 Monitoring & Logging

### Error Tracking

**Sentry integration:**
```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### Performance Monitoring

**Web Vitals:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 🧪 Pre-Deployment Checklist

- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] All environment variables configured
- [ ] API keys secured (not in code)
- [ ] CORS configured for API calls
- [ ] Error handling in place
- [ ] Loading states for all async operations
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] localStorage limits considered
- [ ] Privacy policy added (if collecting any data)
- [ ] Terms of service added (if applicable)

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🌍 Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records (provided by Vercel)

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS

### Cloudflare (for any host)
1. Add site to Cloudflare
2. Point DNS to your host
3. Enable HTTPS, caching, security features

## 📱 Progressive Web App (PWA)

### Add PWA Support

1. **Install plugin**
```bash
npm install vite-plugin-pwa -D
```

2. **Configure vite.config.ts**
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AI Chat Application',
        short_name: 'AI Chat',
        description: 'Full-featured AI chat with multi-provider support',
        theme_color: '#000000',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
};
```

3. **Users can now install as desktop app!**

## 🎉 Post-Deployment

### Test Production Build
```bash
npm run build
npm run preview
```

Visit http://localhost:4173 and verify:
- [ ] All pages load
- [ ] Navigation works
- [ ] Chat functionality works
- [ ] Settings save
- [ ] File uploads work
- [ ] No console errors

### Share Your App
- Tweet about it
- Post on Reddit
- Share on Hacker News
- Add to Product Hunt

---

**Congrats on deploying!** 🎊 Your AI chat app is now live and ready for users.
