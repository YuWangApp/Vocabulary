# Claude AI Assistant Guide

This document provides context and guidance for AI assistants (like Claude) working on this project.

## Project Overview

**Volcabulary** is a full-stack TypeScript monorepo using pnpm workspaces and Turborepo. It features:
- Next.js 14 full-stack application with App Router
- NextAuth.js for authentication (Google OAuth + Credentials)
- Prisma + PostgreSQL for database
- tRPC for type-safe API routes
- Shared TypeScript types across the monorepo
- Chrome/Edge browser extension
- Support for future microservices in Python, Go, etc.

## Project Structure

```
volcabulary/
├── apps/
│   ├── web/                    # Next.js full-stack app (Port 3000)
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router pages & API routes
│   │   │   │   ├── api/       # API endpoints (auth, trpc)
│   │   │   │   ├── auth/      # Auth pages (signup, signin)
│   │   │   │   └── page.tsx   # Homepage
│   │   │   ├── server/        # Server-side code
│   │   │   │   └── trpc/      # tRPC routers and context
│   │   │   │       ├── routers/   # API route handlers
│   │   │   │       ├── context.ts # Request context
│   │   │   │       └── trpc.ts    # tRPC initialization
│   │   │   ├── lib/           # Client utilities
│   │   │   │   ├── trpc.ts    # tRPC client setup
│   │   │   │   ├── auth.ts    # NextAuth configuration
│   │   │   │   └── prisma.ts  # Prisma client
│   │   │   └── types/         # Type definitions
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   └── next.config.js
│   └── extension/              # Browser extension
│       ├── src/
│       │   ├── lib/           # Extension utilities
│       │   └── components/    # UI components
│       ├── package.json
│       └── manifest.json
├── packages/
│   ├── config/                 # Shared tsconfig files
│   │   ├── tsconfig.base.json
│   │   └── tsconfig.nextjs.json
│   └── types/                  # Shared TypeScript types
│       ├── src/index.ts       # Exported types
│       ├── package.json
│       └── tsconfig.json
├── prisma/                     # Database schema & migrations
│   └── schema.prisma
├── services/                   # Future microservices directory
├── package.json               # Root package.json with scripts
├── pnpm-workspace.yaml        # Workspace configuration
├── turbo.json                 # Turborepo configuration
├── docker-compose.yaml        # PostgreSQL setup
└── [documentation files]
```

## Key Technologies & Versions

- **Node.js**: >= 18.0.0
- **Package Manager**: pnpm@8.12.1
- **Frontend**: Next.js 14, React 18, Tailwind CSS 3
- **Backend**: Next.js API Routes, tRPC 11
- **Database**: Prisma 5, PostgreSQL
- **Authentication**: NextAuth.js 4
- **Type Safety**: TypeScript 5, Zod 3
- **Data Fetching**: TanStack React Query 5
- **Build Tool**: Turborepo 1.11

## Important Conventions

### Package Naming
- All internal packages use `@volcabulary/` scope
- Apps: `@volcabulary/web`, `@volcabulary/extension`
- Packages: `@volcabulary/types`, `@volcabulary/config`

### TypeScript Configuration
- Base config: `packages/config/tsconfig.base.json`
- Next.js config: `packages/config/tsconfig.nextjs.json`
- Apps extend these base configs
- Project references are used for cross-package type checking

### tRPC Patterns
- Routers are in `apps/web/src/server/trpc/routers/`
- Each domain gets its own router file (e.g., `user.ts`, `posts.ts`)
- All routers are combined in `routers/_app.ts`
- The `AppRouter` type is exported for client use and extension

### File Structure
- Use kebab-case for file names: `use-user.ts`
- React components can use PascalCase: `TRPCProvider.tsx`
- Group related files in directories

## Common Tasks

### Adding a New tRPC Endpoint

1. **Create or modify a router** in `apps/web/src/server/trpc/routers/`:
```typescript
// apps/web/src/server/trpc/routers/posts.ts
import { z } from 'zod'
import { publicProcedure, protectedProcedure, router } from '../trpc'
import { prisma } from '@/lib/prisma'

export const postsRouter = router({
  create: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await prisma.post.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
      })
    }),

  list: publicProcedure
    .query(async () => {
      return await prisma.post.findMany()
    }),
})
```

2. **Register in app router** (`apps/web/src/server/trpc/routers/_app.ts`):
```typescript
import { postsRouter } from './posts'

export const appRouter = router({
  user: userRouter,
  posts: postsRouter, // Add here
})
```

3. **Use in frontend** (`apps/web/src/app/page.tsx` or any component):
```typescript
'use client'
import { trpc } from '@/lib/trpc'

export default function MyComponent() {
  const createPost = trpc.posts.create.useMutation()
  const { data: posts } = trpc.posts.list.useQuery()

  return (
    <button onClick={() => createPost.mutate({ title: 'Hello', content: 'World' })}>
      Create Post
    </button>
  )
}
```

### Adding a New REST API Endpoint

Create a route handler in `apps/web/src/app/api/`:
```typescript
// apps/web/src/app/api/custom/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  return NextResponse.json({ success: true, data: body })
}
```

### Adding a New Page (Next.js)

Create a new directory in `apps/web/src/app/`:
```typescript
// apps/web/src/app/about/page.tsx
export default function AboutPage() {
  return <div>About Page</div>
}
```

For protected pages, use session:
```typescript
// apps/web/src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return <div>Welcome, {session.user?.name}!</div>
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

### Adding a Database Model

1. Edit `prisma/schema.prisma`:
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. Create a migration:
```bash
npx prisma migrate dev --name add_posts
```

3. Use in tRPC:
```typescript
import { prisma } from '@/lib/prisma'

// In your procedure
const posts = await prisma.post.findMany()
```

## Development Workflow

### Starting Development
```bash
pnpm install          # Install dependencies
docker-compose up -d  # Start PostgreSQL
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema to database
pnpm dev              # Run Next.js app
```

### Running Specific Apps
```bash
pnpm --filter @volcabulary/web dev         # Web app only
pnpm --filter @volcabulary/extension dev   # Extension only
```

### Building
```bash
pnpm build            # Build all
pnpm --filter @volcabulary/web build       # Build web app
pnpm --filter @volcabulary/extension build # Build extension
```

### Type Checking
TypeScript project references ensure types are shared. If types are out of sync:
```bash
pnpm --filter @volcabulary/types build
```

## Environment Variables

### Web App (`apps/web/.env.local`)
```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/volcabulary?schema=public"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
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
    │ Prisma schema │ │ tRPC infers│ │ Client uses│
    │ generates DB  │ │ types from │ │ types from │
    │ types         │ │ routers    │ │ tRPC client│
    └───────────────┘ └────────────┘ └────────────┘
```

## Testing Strategy (When Implemented)

### Recommended Tools
- **Unit Tests**: Vitest (faster than Jest)
- **E2E Tests**: Playwright
- **API Tests**: tRPC testing utilities

### Test File Locations
```
apps/web/src/**/__tests__/
apps/extension/src/**/__tests__/
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
- Check Next.js app is running on port 3000
- Verify tRPC endpoint exists: `http://localhost:3000/api/trpc`
- Check browser console for errors
- Ensure Prisma client is generated: `npx prisma generate`

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Check `NEXTAUTH_URL` matches your app URL
- For Google OAuth, verify credentials are correct
- Check session in browser DevTools: Application → Cookies

### Database Connection Errors
- Verify PostgreSQL is running: `docker ps`
- Check `DATABASE_URL` in `.env.local`
- Restart database: `docker-compose restart postgres`
- View logs: `docker logs volcabulary-db`

### Type Errors
- Regenerate Prisma client: `npx prisma generate`
- Rebuild shared types: `pnpm --filter @volcabulary/types build`
- Restart TypeScript server in your editor
- Check for circular dependencies

### Port Conflicts
```bash
lsof -ti:3000 | xargs kill  # Kill process on port 3000
```

## Important Files Reference

| File | Purpose |
|------|---------|
| `package.json` (root) | Workspace scripts, shared dev dependencies |
| `pnpm-workspace.yaml` | Defines workspace packages |
| `turbo.json` | Build pipeline configuration |
| `prisma/schema.prisma` | Database schema definition |
| `apps/web/src/server/trpc/routers/_app.ts` | tRPC router registration |
| `apps/web/src/lib/trpc.ts` | tRPC client setup |
| `apps/web/src/lib/auth.ts` | NextAuth configuration |
| `apps/web/src/lib/prisma.ts` | Prisma client singleton |
| `apps/web/src/lib/trpc-provider.tsx` | React Query provider |
| `apps/web/src/app/layout.tsx` | Root layout with providers |
| `apps/web/src/app/api/trpc/[trpc]/route.ts` | tRPC API route handler |
| `apps/web/src/app/api/auth/[...nextauth]/route.ts` | NextAuth API route |
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
- Server components reduce client-side JavaScript

## Security Checklist

- [x] Never commit `.env` files (✓ gitignored)
- [x] Use Zod for input validation (✓ tRPC)
- [x] Set appropriate CORS origins (✓ Next.js)
- [x] Sanitize user inputs (✓ Prisma/Zod)
- [x] Use HTTPS in production
- [x] Authentication implemented (✓ NextAuth.js)
- [ ] Implement rate limiting (future)
- [ ] Add API key authentication for extension (future)

## Implemented Features

### Completed
- [x] Database integration (Prisma + PostgreSQL)
- [x] Authentication (NextAuth.js)
- [x] Google OAuth
- [x] Credentials authentication
- [x] tRPC API setup
- [x] Docker Compose for PostgreSQL
- [x] Browser extension scaffold

### In Progress
- [ ] Extension authentication
- [ ] User vocabulary management
- [ ] Word lookup functionality

### Future Enhancements

#### High Priority
- [ ] Error handling middleware
- [ ] Request logging
- [ ] API rate limiting
- [ ] Extension <-> Web app communication

#### Medium Priority
- [ ] API versioning
- [ ] Monitoring and observability
- [ ] Automated testing suite
- [ ] CI/CD pipeline

#### Low Priority
- [ ] GraphQL support (alternative to tRPC)
- [ ] Message queue integration
- [ ] Service mesh for microservices
- [ ] Distributed tracing

## Questions to Ask When Making Changes

1. **Does this change affect types?** → Update `packages/types` and rebuild
2. **Is this a new API endpoint?** → Use tRPC (preferred) or REST API routes
3. **Does this need authentication?** → Use `protectedProcedure` for tRPC or check session in API routes
4. **Does this need database access?** → Update Prisma schema and create migration
5. **Is this shared across apps?** → Consider adding to `packages/`
6. **Is this a new service?** → Add to `services/` directory
7. **Does this need environment config?** → Add to `.env.local.example` and document

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

# Database commands
npx prisma studio              # Open Prisma Studio
npx prisma migrate dev         # Create and apply migration
npx prisma migrate reset       # Reset database (careful!)
npx prisma db push             # Push schema without migration
npx prisma generate            # Generate Prisma client
```

## Communication Patterns

### Synchronous (Request/Response)
- **tRPC**: Type-safe, recommended for all TypeScript-to-TypeScript communication
- **REST API Routes**: For webhooks, external APIs, or non-TypeScript clients

### Asynchronous (Real-time)
- **Server Actions**: For form submissions and mutations (Next.js 14)
- **WebSocket**: For real-time bidirectional communication (future)
- **Server-Sent Events**: For one-way server-to-client updates (future)

### Inter-Service
- **HTTP/REST**: Simple service-to-service calls
- **gRPC**: High-performance service-to-service (future)
- **Message Queue**: Async task processing (future)

## Extension Integration

The browser extension connects to the web app's tRPC API:

```typescript
// apps/extension/src/lib/trpc-client.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@volcabulary/web/server'

const API_URL = 'http://localhost:3000'

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/api/trpc`,
      headers: async () => {
        // Add authentication headers
        return {}
      },
    }),
  ],
})
```

## Notes for AI Assistants

1. **Always check if packages need rebuilding** after modifying shared types
2. **Use workspace protocol** (`workspace:*`) for internal dependencies
3. **Respect the monorepo structure** - don't create files outside established patterns
4. **Consider type safety first** - leverage TypeScript's full power
5. **Document environment variables** when adding new ones
6. **Test tRPC endpoints** when making server changes
7. **Use proper error handling** - tRPC errors, HTTP status codes
8. **Keep documentation updated** when making significant changes
9. **Remember: Everything runs in a single Next.js app** - no separate backend server
10. **Use Prisma for all database operations** - type-safe and migration-friendly

## Resources

- [tRPC Documentation](https://trpc.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

---

**Last Updated**: 2025-11-28
**Project Version**: 0.0.0
