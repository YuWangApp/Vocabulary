# Claude AI Assistant Guide

This document provides context and guidance for AI assistants (like Claude) working on this project.

## Project Overview

**Volcabulary** is a full-stack TypeScript monorepo using pnpm workspaces and Turborepo. It features:
- Next.js 14 frontend with App Router
- Express backend with tRPC, REST, and WebSocket support
- Shared TypeScript types across the monorepo
- Support for future microservices in Python, Go, etc.

## Project Structure

```
volcabulary/
├── apps/
│   ├── web/                    # Next.js frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router pages
│   │   │   ├── lib/           # tRPC client setup
│   │   │   └── hooks/         # React hooks (including useWebSocket)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   └── next.config.js
│   └── server/                 # Express backend (Port 3001)
│       ├── src/
│       │   ├── config/        # Environment config
│       │   ├── trpc/          # tRPC routers and context
│       │   │   ├── routers/   # API route handlers
│       │   │   ├── context.ts # Request context
│       │   │   └── trpc.ts    # tRPC initialization
│       │   ├── rest/          # REST endpoints
│       │   ├── websocket/     # WebSocket handlers
│       │   └── index.ts       # Server entry point
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── config/                 # Shared tsconfig files
│   │   ├── tsconfig.base.json
│   │   └── tsconfig.nextjs.json
│   └── types/                  # Shared TypeScript types
│       ├── src/index.ts       # Exported types
│       ├── package.json
│       └── tsconfig.json
├── services/                   # Future microservices directory
├── package.json               # Root package.json with scripts
├── pnpm-workspace.yaml        # Workspace configuration
├── turbo.json                 # Turborepo configuration
└── [documentation files]
```

## Key Technologies & Versions

- **Node.js**: >= 18.0.0
- **Package Manager**: pnpm@8.12.1
- **Frontend**: Next.js 14, React 18, Tailwind CSS 3
- **Backend**: Express 4, tRPC 10, ws (WebSocket) 8
- **Type Safety**: TypeScript 5, Zod 3
- **Data Fetching**: TanStack React Query 5
- **Build Tool**: Turborepo 1.11

## Important Conventions

### Package Naming
- All internal packages use `@volcabulary/` scope
- Apps: `@volcabulary/web`, `@volcabulary/server`
- Packages: `@volcabulary/types`, `@volcabulary/config`

### TypeScript Configuration
- Base config: `packages/config/tsconfig.base.json`
- Next.js config: `packages/config/tsconfig.nextjs.json`
- Apps extend these base configs
- Project references are used for cross-package type checking

### tRPC Patterns
- Routers are in `apps/server/src/trpc/routers/`
- Each domain gets its own router file (e.g., `user.ts`, `posts.ts`)
- All routers are combined in `routers/_app.ts`
- The `AppRouter` type is exported for client use

### File Structure
- Use kebab-case for file names: `use-websocket.ts`
- React components can use PascalCase: `TRPCProvider.tsx`
- Group related files in directories

## Common Tasks

### Adding a New tRPC Endpoint

1. **Create or modify a router** in `apps/server/src/trpc/routers/`:
```typescript
// apps/server/src/trpc/routers/posts.ts
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const postsRouter = router({
  create: publicProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(({ input }) => {
      // Implementation
      return { id: '1', ...input }
    }),
})
```

2. **Register in app router** (`apps/server/src/trpc/routers/_app.ts`):
```typescript
import { postsRouter } from './posts'

export const appRouter = router({
  user: userRouter,
  posts: postsRouter, // Add here
})
```

3. **Use in frontend** (`apps/web/src/app/page.tsx` or any component):
```typescript
const createPost = trpc.posts.create.useMutation()
```

### Adding a New REST Endpoint

Edit `apps/server/src/rest/routes.ts`:
```typescript
router.post('/api/custom', (req, res) => {
  // Implementation
  res.json({ success: true, data: {} })
})
```

### Adding a New Page (Next.js)

Create a new directory in `apps/web/src/app/`:
```typescript
// apps/web/src/app/about/page.tsx
export default function AboutPage() {
  return <div>About Page</div>
}
```

### Adding Shared Types

Edit `packages/types/src/index.ts`:
```typescript
export interface Post {
  id: string
  title: string
  content: string
  createdAt: Date
}
```

Then rebuild types:
```bash
pnpm --filter @volcabulary/types build
```

### Adding a WebSocket Event Type

Edit `apps/server/src/websocket/handler.ts` to add new message type handling in the switch statement.

## Development Workflow

### Starting Development
```bash
pnpm install          # Install dependencies
pnpm dev              # Run all apps
```

### Running Specific Apps
```bash
pnpm --filter @volcabulary/web dev      # Frontend only
pnpm --filter @volcabulary/server dev   # Backend only
```

### Building
```bash
pnpm build            # Build all
pnpm --filter @volcabulary/web build    # Build specific app
```

### Type Checking
TypeScript project references ensure types are shared. If types are out of sync:
```bash
pnpm --filter @volcabulary/types build
```

## Environment Variables

### Backend (`apps/server/.env`)
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`apps/web/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

## Type Safety Flow

```
┌─────────────────────────────────────┐
│  packages/types/src/index.ts        │
│  (Domain types: User, Message, etc) │
└────────────┬────────────────────────┘
             │
             ├─────────────┬──────────────┐
             │             │              │
    ┌────────▼──────┐ ┌───▼────────┐ ┌──▼─────────┐
    │ Server uses   │ │ tRPC infers│ │ Client uses│
    │ types for     │ │ types from │ │ types from │
    │ validation    │ │ routers    │ │ tRPC client│
    └───────────────┘ └────────────┘ └────────────┘
```

## Testing Strategy (When Implemented)

### Recommended Tools
- **Unit Tests**: Vitest (faster than Jest)
- **E2E Tests**: Playwright
- **API Tests**: Supertest for REST, tRPC testing utilities

### Test File Locations
```
apps/web/src/**/__tests__/
apps/server/src/**/__tests__/
packages/types/src/**/__tests__/
```

## Code Style

### Formatting
- Prettier is configured (`.prettierrc`)
- No semicolons
- Single quotes
- 2 space indentation
- 100 character line width

### Linting
- ESLint should be configured per app
- Extend recommended configs

### Imports
- Use path aliases: `@/` maps to `src/` in apps/web
- Group imports: external, internal, relative
- Use named exports over default exports (except Next.js pages)

## Adding New Services (Python/Go/Rust)

1. Create directory in `services/`:
```
services/python-service/
├── requirements.txt
├── main.py
├── Dockerfile
└── README.md
```

2. Add to `pnpm-workspace.yaml` if using npm tooling, or manage independently

3. Update `turbo.json` if the service needs build orchestration

4. Document communication patterns in service README

## Debugging Tips

### tRPC Not Working
- Check server is running on port 3001
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check browser console for CORS errors
- Ensure types package is built: `pnpm --filter @volcabulary/types build`

### WebSocket Connection Failed
- Verify server is running
- Check `NEXT_PUBLIC_WS_URL` environment variable
- Ensure WebSocket path is `/ws`
- Check browser console for connection errors

### Type Errors
- Rebuild shared types: `pnpm --filter @volcabulary/types build`
- Restart TypeScript server in your editor
- Check for circular dependencies

### Port Conflicts
```bash
lsof -ti:3000 | xargs kill  # Kill process on port 3000
lsof -ti:3001 | xargs kill  # Kill process on port 3001
```

## Important Files Reference

| File | Purpose |
|------|---------|
| `package.json` (root) | Workspace scripts, shared dev dependencies |
| `pnpm-workspace.yaml` | Defines workspace packages |
| `turbo.json` | Build pipeline configuration |
| `apps/server/src/index.ts` | Server entry point |
| `apps/server/src/trpc/routers/_app.ts` | tRPC router registration |
| `apps/web/src/lib/trpc.ts` | tRPC client setup |
| `apps/web/src/lib/trpc-provider.tsx` | React Query provider |
| `apps/web/src/app/layout.tsx` | Root layout with providers |
| `packages/types/src/index.ts` | Shared type definitions |

## Performance Considerations

### Build Performance
- Turborepo caches builds
- Only changed packages rebuild
- Use `turbo run build --filter=...^` to build dependencies

### Runtime Performance
- Next.js automatically code-splits
- tRPC batches requests by default
- React Query caches data
- WebSocket maintains single connection

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Use Zod for input validation
- [ ] Validate WebSocket messages
- [ ] Set appropriate CORS origins
- [ ] Sanitize user inputs
- [ ] Use HTTPS in production
- [ ] Implement rate limiting (future)
- [ ] Add authentication (future)

## Future Enhancements Roadmap

### High Priority
- [ ] Database integration (Prisma + PostgreSQL)
- [ ] Authentication (NextAuth.js or Clerk)
- [ ] Error handling middleware
- [ ] Request logging

### Medium Priority
- [ ] API rate limiting
- [ ] API versioning
- [ ] Input sanitization
- [ ] Monitoring and observability
- [ ] Docker Compose setup

### Low Priority
- [ ] GraphQL support
- [ ] Message queue integration
- [ ] Service mesh for microservices
- [ ] Distributed tracing

## Questions to Ask When Making Changes

1. **Does this change affect types?** → Update `packages/types` and rebuild
2. **Is this a new API endpoint?** → Choose tRPC (preferred) or REST
3. **Does this need real-time updates?** → Use WebSocket
4. **Is this shared across apps?** → Consider adding to `packages/`
5. **Is this a new service?** → Add to `services/` directory
6. **Does this need environment config?** → Add to `.env` files and document

## Helpful Commands

```bash
# Install new dependency to specific package
pnpm --filter @volcabulary/web add react-hook-form

# Remove dependency
pnpm --filter @volcabulary/web remove react-hook-form

# Update all dependencies
pnpm update -r

# Clean everything
pnpm clean && rm -rf node_modules

# Check for outdated packages
pnpm outdated -r

# Run command in all workspaces
pnpm -r exec <command>
```

## Communication Patterns

### Synchronous (Request/Response)
- **tRPC**: Type-safe, recommended for all TypeScript-to-TypeScript communication
- **REST**: For non-TypeScript clients or external APIs

### Asynchronous (Real-time)
- **WebSocket**: For real-time bidirectional communication (chat, notifications, live updates)
- **Server-Sent Events**: For one-way server-to-client updates (consider for future)

### Inter-Service
- **HTTP/REST**: Simple service-to-service calls
- **gRPC**: High-performance service-to-service (future)
- **Message Queue**: Async task processing (future)

## Notes for AI Assistants

1. **Always check if packages need rebuilding** after modifying shared types
2. **Use workspace protocol** (`workspace:*`) for internal dependencies
3. **Respect the monorepo structure** - don't create files outside established patterns
4. **Consider type safety first** - leverage TypeScript's full power
5. **Document environment variables** when adding new ones
6. **Test both tRPC and WebSocket** when making server changes
7. **Use proper error handling** - tRPC errors, HTTP status codes, WS error messages
8. **Keep documentation updated** when making significant changes

## Resources

- [tRPC Documentation](https://trpc.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

---

**Last Updated**: 2025-10-28
**Project Version**: 0.0.0
