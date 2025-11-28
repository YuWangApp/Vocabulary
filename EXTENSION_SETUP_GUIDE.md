# Browser Extension Workspace Setup Guide

This guide will walk you through creating a Chrome extension workspace for Vocabulary from scratch.

## Prerequisites

- Node.js >= 18.0.0 installed
- pnpm@8.12.1 installed
- Your existing Vocabulary monorepo

## Overview

We'll create a new workspace called `@volcabulary/extension` that:
- Uses Vite + React (not Next.js)
- Shares types with the backend
- Uses the same tRPC API
- Can be loaded as a Chrome extension

---

## Part 1: Create Directory Structure

**Location:** Run these commands from your project root: `/Users/qingwang/Development/volcabulary`

### Step 1.1: Create the main extension directory

```bash
mkdir -p apps/extension
cd apps/extension
```

### Step 1.2: Create source directories

```bash
mkdir -p src/sidepanel/components
mkdir -p src/background
mkdir -p src/lib
mkdir -p src/utils
mkdir -p public/icons
```

**What you should have now:**
```
apps/extension/
├── src/
│   ├── sidepanel/
│   │   └── components/
│   ├── background/
│   ├── lib/
│   └── utils/
└── public/
    └── icons/
```

---

## Part 2: Create Package Configuration

### Step 2.1: Create `package.json`

**File:** `apps/extension/package.json`

```json
{
  "name": "@volcabulary/extension",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "description": "Vocabulary browser extension for Chrome and Edge",
  "scripts": {
    "dev": "vite build --watch --mode development",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.90.5",
    "@trpc/client": "^11.7.1",
    "@volcabulary/types": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.23",
    "@types/chrome": "^0.0.268",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.0"
  }
}
```

### Step 2.2: Install dependencies

```bash
# Make sure you're in apps/extension directory
pnpm install
```

---

## Part 3: TypeScript Configuration

### Step 3.1: Create `tsconfig.json`

**File:** `apps/extension/tsconfig.json`

```json
{
  "extends": "@volcabulary/config/tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["chrome", "node", "vite/client"]
  },
  "include": ["src"],
  "references": [
    {
      "path": "../../packages/types"
    }
  ]
}
```

**Why these settings:**
- `"module": "ESNext"` - Modern ES modules for Vite
- `"moduleResolution": "bundler"` - Optimized for Vite bundler
- `"types": ["chrome", ...]` - Enables Chrome extension APIs typing
- `"jsx": "react-jsx"` - Modern React JSX transform

---

## Part 4: Vite Build Configuration

### Step 4.1: Create `vite.config.ts`

**File:** `apps/extension/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        sidepanel: 'src/sidepanel/index.html'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    }
  }
})
```

**What this does:**
- `@vitejs/plugin-react` - Enables React support with Fast Refresh
- `@crxjs/vite-plugin` - Handles Chrome extension specific bundling
- `manifest.json` - Automatically processes the extension manifest
- Port 5173 - Development server for hot reload

---

## Part 5: Chrome Extension Manifest

### Step 5.1: Create `manifest.json`

**File:** `apps/extension/manifest.json`

```json
{
  "manifest_version": 3,
  "name": "Vocabulary - Language Learning Companion",
  "version": "0.0.1",
  "description": "Save and manage vocabulary from any webpage with translation support",
  "permissions": [
    "sidePanel",
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "http://localhost:3000/*"
  ],
  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },
  "side_panel": {
    "default_path": "src/sidepanel/index.html"
  },
  "action": {
    "default_title": "Open Vocabulary Sidebar",
    "default_icon": {
      "16": "public/icons/icon-16.png",
      "32": "public/icons/icon-32.png",
      "48": "public/icons/icon-48.png",
      "128": "public/icons/icon-128.png"
    }
  },
  "icons": {
    "16": "public/icons/icon-16.png",
    "32": "public/icons/icon-32.png",
    "48": "public/icons/icon-48.png",
    "128": "public/icons/icon-128.png"
  }
}
```

**Key permissions explained:**
- `sidePanel` - Allows extension to appear in browser sidebar (Chrome 114+)
- `storage` - Local storage for caching and settings
- `activeTab` - Access to currently active tab (for future text selection feature)
- `host_permissions` - Access to your local API server

---

## Part 6: Tailwind CSS Setup

### Step 6.1: Create `tailwind.config.ts`

**File:** `apps/extension/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/sidepanel/index.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

### Step 6.2: Create `postcss.config.js`

**File:** `apps/extension/postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Part 7: Sidebar UI Files

### Step 7.1: Create HTML entry point

**File:** `apps/extension/src/sidepanel/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vocabulary</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/sidepanel/main.tsx"></script>
  </body>
</html>
```

### Step 7.2: Create CSS file with Tailwind

**File:** `apps/extension/src/sidepanel/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  width: 100%;
  min-height: 100vh;
}
```

### Step 7.3: Create React entry point

**File:** `apps/extension/src/sidepanel/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### Step 7.4: Create main App component

**File:** `apps/extension/src/sidepanel/App.tsx`

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { VocabularyApp } from './components/VocabularyApp'

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <VocabularyApp />
    </QueryClientProvider>
  )
}
```

### Step 7.5: Create main vocabulary component

**File:** `apps/extension/src/sidepanel/components/VocabularyApp.tsx`

```typescript
import { useState } from 'react'

export function VocabularyApp() {
  const [sentence, setSentence] = useState('')

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Vocabulary</h1>
        <p className="text-sm opacity-90">Learn words in context</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        {/* Sentence Input */}
        <section className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <label htmlFor="sentence" className="block text-sm font-medium text-gray-700 mb-2">
            Enter a sentence to translate
          </label>
          <textarea
            id="sentence"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Type or paste a sentence here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">{sentence.length}/500</span>
            <button
              onClick={() => {
                console.log('Translate:', sentence)
                // TODO: Implement translation
              }}
              disabled={!sentence.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Translate
            </button>
          </div>
        </section>

        {/* Translation Result - Placeholder */}
        <section className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Translation</h2>
          <p className="text-gray-500 italic">Translation will appear here...</p>
        </section>

        {/* Vocabulary List - Placeholder */}
        <section className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-2">My Vocabulary</h2>
          <p className="text-gray-500 italic">Saved words will appear here...</p>
        </section>
      </main>
    </div>
  )
}
```

---

## Part 8: Extension Background Service Worker

### Step 8.1: Create service worker

**File:** `apps/extension/src/background/service-worker.ts`

```typescript
// Background service worker for the extension
// This runs in the background and can handle events

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Vocabulary extension installed!')

    // Initialize default settings
    chrome.storage.local.set({
      defaultList: 'My Vocabulary',
      sourceLanguage: 'auto',
      targetLanguage: 'en',
    })
  }
})

// Listen for toolbar icon click
chrome.action.onClicked.addListener((tab) => {
  // Open the side panel
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id })
  }
})

// Handle messages from the sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message)

  if (message.type === 'GET_SETTINGS') {
    chrome.storage.local.get(null, (settings) => {
      sendResponse(settings)
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === 'SAVE_SETTINGS') {
    chrome.storage.local.set(message.settings, () => {
      sendResponse({ success: true })
    })
    return true
  }
})

export {} // Make this a module
```

---

## Part 9: tRPC Client for Extension

### Step 9.1: Create tRPC client

**File:** `apps/extension/src/lib/trpc-client.ts`

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@volcabulary/web/server'

// API URL - will use environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/api/trpc`,
      headers: async () => {
        // Get auth token from Chrome storage if available
        try {
          const result = await chrome.storage.local.get('authToken')
          const token = result.authToken

          return {
            authorization: token ? `Bearer ${token}` : '',
          }
        } catch (error) {
          console.error('Failed to get auth token:', error)
          return {}
        }
      },
    }),
  ],
})
```

### Step 9.2: Create storage utility

**File:** `apps/extension/src/lib/storage.ts`

```typescript
/**
 * Utility functions for Chrome extension storage
 */

export const storage = {
  /**
   * Get a value from Chrome storage
   */
  async get<T>(key: string): Promise<T | undefined> {
    const result = await chrome.storage.local.get(key)
    return result[key] as T | undefined
  },

  /**
   * Set a value in Chrome storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value })
  },

  /**
   * Get multiple values from Chrome storage
   */
  async getMultiple<T extends Record<string, any>>(keys: string[]): Promise<Partial<T>> {
    const result = await chrome.storage.local.get(keys)
    return result as Partial<T>
  },

  /**
   * Remove a value from Chrome storage
   */
  async remove(key: string): Promise<void> {
    await chrome.storage.local.remove(key)
  },

  /**
   * Clear all Chrome storage
   */
  async clear(): Promise<void> {
    await chrome.storage.local.clear()
  },
}
```

---

## Part 10: Environment Configuration

### Step 10.1: Create `.env` file

**File:** `apps/extension/.env`

```env
VITE_API_URL=http://localhost:3000
```

### Step 10.2: Create `.env.production` file

**File:** `apps/extension/.env.production`

```env
VITE_API_URL=https://your-production-api.com
```

### Step 10.3: Create environment type declarations

**File:** `apps/extension/src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## Part 11: Placeholder Icons

Since we need icons, let's create a placeholder script:

### Step 11.1: Create icon generator script

**File:** `apps/extension/scripts/generate-icons.js`

```javascript
// Simple script to generate placeholder icons
// You can replace these with actual icons later

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sizes = [16, 32, 48, 128]
const iconsDir = path.join(__dirname, '../public/icons')

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// For now, create placeholder text files
// In production, you'd use an image library like 'sharp' or 'canvas'
sizes.forEach(size => {
  const placeholder = `Placeholder ${size}x${size} icon - Replace with actual image`
  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}.png`),
    placeholder
  )
})

console.log('✓ Placeholder icons generated')
console.log('⚠️  Remember to replace with actual PNG images before publishing')
```

### Step 11.2: Run the script (optional for now)

```bash
# We'll skip this for now and manually create a placeholder
touch public/icons/icon-16.png
touch public/icons/icon-32.png
touch public/icons/icon-48.png
touch public/icons/icon-128.png
```

**Note:** For a real extension, you'll need actual PNG images. You can create them using:
- Figma, Sketch, or any design tool
- Online icon generators
- AI image generators
- Or use SVG and convert to PNG

---

## Part 12: Update Workspace Configuration

### Step 12.1: Verify `pnpm-workspace.yaml`

**File:** `pnpm-workspace.yaml` (should already exist at root)

Make sure it includes:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

This already includes `apps/*`, so your new `apps/extension` will be automatically recognized.

### Step 12.2: Update `turbo.json`

**File:** `turbo.json` (at root)

Update to include extension:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    },
    "lint": {
      "outputs": []
    }
  }
}
```

---

## Part 13: Create Shared UI Package (Optional for MVP)

This step is optional for now but recommended for code sharing:

### Step 13.1: Create shared UI package structure

```bash
mkdir -p packages/ui/src/components
cd packages/ui
```

### Step 13.2: Create `package.json`

**File:** `packages/ui/package.json`

```json
{
  "name": "@volcabulary/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "@volcabulary/types": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.46",
    "@volcabulary/config": "workspace:*",
    "typescript": "^5.3.3"
  }
}
```

### Step 13.3: Create `tsconfig.json`

**File:** `packages/ui/tsconfig.json`

```json
{
  "extends": "@volcabulary/config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "noEmit": false,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 13.4: Create index file

**File:** `packages/ui/src/index.ts`

```typescript
// Export shared UI components here
// For now, just a placeholder

export { Button } from './components/Button'
```

### Step 13.5: Create a sample Button component

**File:** `packages/ui/src/components/Button.tsx`

```typescript
import React from 'react'

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  className?: string
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
```

---

## Part 14: Add README for Extension

**File:** `apps/extension/README.md`

```markdown
# Vocabulary Browser Extension

Chrome/Edge sidebar extension for vocabulary learning.

## Development

### Install dependencies
\`\`\`bash
pnpm install
\`\`\`

### Run development server
\`\`\`bash
pnpm dev
\`\`\`

This will watch for changes and rebuild automatically.

### Load extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Navigate to `apps/extension/dist` folder
5. Click "Select Folder"

The extension should now appear in your extensions list!

### Open the sidebar

Click the Vocabulary icon in your Chrome toolbar to open the sidebar.

## Build for Production

\`\`\`bash
pnpm build
\`\`\`

## Project Structure

\`\`\`
apps/extension/
├── src/
│   ├── sidepanel/          # Sidebar UI (React app)
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # React entry point
│   │   ├── index.html      # HTML entry point
│   │   └── index.css       # Tailwind CSS
│   ├── background/         # Service worker
│   │   └── service-worker.ts
│   ├── lib/                # Utilities
│   │   ├── trpc-client.ts  # tRPC API client
│   │   └── storage.ts      # Chrome storage wrapper
│   └── utils/              # Helper functions
├── public/
│   └── icons/              # Extension icons
├── manifest.json           # Chrome extension manifest
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
\`\`\`

## Key Features

- ✅ Manifest V3 compliant
- ✅ React with TypeScript
- ✅ Tailwind CSS for styling
- ✅ Hot Module Replacement (HMR) during development
- ✅ tRPC integration with backend
- ✅ Chrome storage API
- ✅ Sidebar panel UI

## Troubleshooting

### Extension doesn't load
- Check that you selected the `dist` folder, not the `src` folder
- Make sure `pnpm dev` or `pnpm build` has run successfully
- Check Chrome DevTools console for errors

### Hot reload not working
- Reload the extension in `chrome://extensions/`
- Close and reopen the sidebar

### API calls failing
- Make sure the web app is running on http://localhost:3000
- Check `VITE_API_URL` in `.env` file
- CORS is handled automatically by Next.js for same-origin requests
\`\`\`

---

## Part 15: Git Configuration

**File:** `apps/extension/.gitignore`

```gitignore
# Dependencies
node_modules

# Build output
dist
*.local

# Environment variables
.env.local
.env.production.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
```

---

## Summary Checklist

After following all steps, you should have:

- [ ] Created `apps/extension` directory structure
- [ ] Set up `package.json` with all dependencies
- [ ] Configured TypeScript with `tsconfig.json`
- [ ] Set up Vite with `vite.config.ts`
- [ ] Created `manifest.json` for Chrome Extension
- [ ] Set up Tailwind CSS configuration
- [ ] Created sidebar HTML entry point
- [ ] Created React app structure
- [ ] Set up tRPC client for API calls
- [ ] Created background service worker
- [ ] Added utility files (storage, etc.)
- [ ] Created placeholder icons
- [ ] Updated workspace configuration
- [ ] (Optional) Created shared UI package

## Final Directory Structure

\`\`\`
volcabulary/
├── apps/
│   ├── extension/          # ← NEW!
│   │   ├── src/
│   │   │   ├── sidepanel/
│   │   │   ├── background/
│   │   │   ├── lib/
│   │   │   └── utils/
│   │   ├── public/icons/
│   │   ├── manifest.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── package.json
│   │   └── README.md
│   └── web/               # Existing Next.js full-stack app
├── packages/
│   ├── ui/                # ← NEW! (Optional)
│   ├── types/             # Existing
│   └── config/            # Existing
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
\`\`\`

## Next Steps

1. **Test the setup:**
   ```bash
   cd apps/extension
   pnpm dev
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Load `apps/extension/dist` folder

3. **Start web app:**
   ```bash
   # In another terminal
   pnpm --filter @volcabulary/web dev
   ```

4. **Begin development:**
   - Add translation API integration
   - Implement word breakdown logic
   - Create vocabulary list components
   - Add tRPC mutations for saving words

## Helpful Commands

```bash
# Install all workspace dependencies
pnpm install

# Run extension in dev mode with hot reload
pnpm --filter @volcabulary/extension dev

# Build extension for production
pnpm --filter @volcabulary/extension build

# Run everything (web, server, extension)
pnpm dev

# Build everything
pnpm build

# Clean extension build
pnpm --filter @volcabulary/extension clean
```

---

**Good luck with your extension development!** 🚀

Feel free to ask questions as you go through these steps. Each part builds on the previous one, so it's important to complete them in order.
