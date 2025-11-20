# Development Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- (Optional) Docker for containerization

## Installation

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install dependencies
pnpm install
```

## Development Workflow

### Running All Apps

```bash
# Run all apps in development mode (web + server)
pnpm dev
```

This starts:
- Next.js frontend on http://localhost:3000
- Backend server on http://localhost:3001

### Running Individual Apps

```bash
# Run only the web app
pnpm --filter @volcabulary/web dev

# Run only the server
pnpm --filter @volcabulary/server dev
```

### Building

```bash
# Build all packages and apps
pnpm build

# Build specific app
pnpm --filter @volcabulary/web build
pnpm --filter @volcabulary/server build
```

### Environment Variables

#### Frontend (apps/web)

Copy `.env.local.example` to `.env.local`:

```bash
cd apps/web
cp .env.local.example .env.local
```

Variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL (default: ws://localhost:3001/ws)

#### Backend (apps/server)

Copy `.env.example` to `.env`:

```bash
cd apps/server
cp .env.example .env
```

Variables:
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Allowed CORS origin (default: http://localhost:3000)

## Project Structure

```
volcabulary/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/      # App router pages
│   │   │   ├── hooks/    # React hooks
│   │   │   └── lib/      # Utilities and tRPC client
│   │   └── package.json
│   └── server/           # Backend server
│       ├── src/
│       │   ├── config/   # Configuration
│       │   ├── trpc/     # tRPC routers and context
│       │   ├── rest/     # REST endpoints
│       │   └── websocket/# WebSocket handlers
│       └── package.json
├── packages/
│   ├── config/           # Shared configurations (tsconfig, etc.)
│   └── types/            # Shared TypeScript types
├── services/             # Future microservices (Python, Go, etc.)
└── package.json          # Root package.json
```

## Adding New Features

### Adding a New tRPC Router

1. Create a new router in `apps/server/src/trpc/routers/`:

```typescript
// apps/server/src/trpc/routers/posts.ts
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const postsRouter = router({
  getAll: publicProcedure.query(() => {
    return []
  }),
})
```

2. Add it to the app router:

```typescript
// apps/server/src/trpc/routers/_app.ts
import { postsRouter } from './posts'

export const appRouter = router({
  user: userRouter,
  posts: postsRouter, // Add here
})
```

3. Use it in the frontend:

```typescript
const { data } = trpc.posts.getAll.useQuery()
```

### Adding a New REST Endpoint

Edit `apps/server/src/rest/routes.ts`:

```typescript
router.get('/api/custom', (req, res) => {
  res.json({ message: 'Custom endpoint' })
})
```

### Adding WebSocket Events

Edit `apps/server/src/websocket/handler.ts` to handle new message types.

## Testing

```bash
# Run tests (when configured)
pnpm test
```

## Linting

```bash
# Lint all packages
pnpm lint

# Format all files
pnpm format
```

## Adding a New Service (Python/Go)

See [services/README.md](./services/README.md) for examples.

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
```

### Type Errors

Rebuild the types package:

```bash
pnpm --filter @volcabulary/types build
```

### WebSocket Connection Failed

Ensure the backend server is running and the WebSocket URL in `.env.local` is correct.
