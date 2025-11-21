# Vocabulary Browser Extension

Chrome/Edge sidebar extension for vocabulary learning.

## Development

### Install dependencies

```bash
pnpm install
```

### Run development server

```bash
pnpm dev
```

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

```bash
pnpm build
```

## Project Structure

```
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
```

## Key Features

- Manifest V3 compliant
- React with TypeScript
- Tailwind CSS for styling
- Hot Module Replacement (HMR) during development
- tRPC integration with backend
- Chrome storage API
- Sidebar panel UI

## Troubleshooting

### Extension doesn't load

- Check that you selected the `dist` folder, not the `src` folder
- Make sure `pnpm dev` or `pnpm build` has run successfully
- Check Chrome DevTools console for errors

### Hot reload not working

- Reload the extension in `chrome://extensions/`
- Close and reopen the sidebar

### API calls failing

- Make sure the backend server is running on http://localhost:3001
- Check `VITE_API_URL` in `.env` file
- Check CORS settings in the backend

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
