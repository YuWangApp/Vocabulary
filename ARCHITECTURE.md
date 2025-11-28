# Volcabulary Architecture

## Overview

Volcabulary is a **full-stack Next.js application** built with modern TypeScript tooling. The architecture uses Next.js as a single server handling both UI and API logic, providing simplicity while maintaining type safety and scalability.

## Architecture Decision

**Why Single Next.js Server?**

We consolidated everything into Next.js for the following reasons:

1. **Simplicity**: Single codebase, single deployment, easier to understand
2. **Learning Focus**: Better for learning modern Next.js patterns
3. **No WebSocket Requirement**: The app doesn't need real-time WebSocket features
4. **Easy Deployment**: Can deploy to Vercel or any Node.js host with minimal configuration
5. **No CORS Issues**: Everything runs on the same origin
6. **Cost Effective**: Single server to host and manage

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS 3** - Styling
- **TanStack Query 5** - Data fetching and caching

### Backend (Next.js API Routes)
- **tRPC 11** - End-to-end typesafe APIs
- **NextAuth.js 4** - Authentication (email/password + Google OAuth)
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **bcryptjs** - Password hashing

### Type Safety
- **TypeScript 5** - Type safety across the stack
- **Zod 3** - Runtime validation

### Development
- **pnpm** - Package manager
- **Turborepo** - Build system
- **Docker** - PostgreSQL container

## Project Structure

```
volcabulary/
├── apps/
│   ├── web/                          # Main Next.js application
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router
│   │   │   │   ├── api/              # API Routes
│   │   │   │   │   ├── auth/         # NextAuth endpoints
│   │   │   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   │   │   └── signup/route.ts
│   │   │   │   │   └── trpc/         # tRPC endpoints
│   │   │   │   │       └── [trpc]/route.ts
│   │   │   │   ├── auth/             # Auth UI pages
│   │   │   │   │   ├── signin/page.tsx
│   │   │   │   │   ├── signup/page.tsx
│   │   │   │   │   └── error/page.tsx
│   │   │   │   ├── layout.tsx        # Root layout
│   │   │   │   └── page.tsx          # Home page
│   │   │   ├── server/               # Server-side code
│   │   │   │   └── trpc/             # tRPC server setup
│   │   │   │       ├── context.ts    # Request context (NextAuth session)
│   │   │   │       ├── trpc.ts       # tRPC initialization & middleware
│   │   │   │       └── routers/      # API routers
│   │   │   │           ├── _app.ts   # Root router
│   │   │   │           └── user.ts   # User operations
│   │   │   ├── lib/                  # Shared utilities
│   │   │   │   ├── auth.ts           # NextAuth configuration
│   │   │   │   ├── prisma.ts         # Prisma client
│   │   │   │   ├── trpc.ts           # tRPC client
│   │   │   │   ├── trpc-provider.tsx # tRPC React provider
│   │   │   │   └── session-provider.tsx # NextAuth provider
│   │   │   └── types/                # Type definitions
│   │   │       └── next-auth.d.ts    # NextAuth types
│   │   └── .env.local                # Environment variables
│   └── extension/                    # VS Code extension (separate)
├── packages/
│   ├── types/                        # Shared TypeScript types
│   └── config/                       # Shared configs (tsconfig, etc.)
├── prisma/
│   └── schema.prisma                 # Database schema
├── scripts/
│   └── setup-auth.sh                 # Setup automation
├── docker-compose.yaml               # PostgreSQL container
└── turbo.json                        # Turborepo config
```

## Request Flow

### Authentication Request

```
Browser
  ↓
http://localhost:3000/auth/signin
  ↓
Next.js Page (React)
  ↓
POST /api/auth/callback/credentials
  ↓
NextAuth.js Handler
  ↓
Prisma → PostgreSQL
  ↓
Session Created
  ↓
Redirect to Home
```

### tRPC API Request

```
Browser (React Component)
  ↓
trpc.user.getMe.useQuery()
  ↓
tRPC Client
  ↓
POST /api/trpc/user.getMe
  ↓
tRPC Route Handler
  ↓
Check NextAuth Session (context)
  ↓
Execute Procedure
  ↓
Prisma → PostgreSQL
  ↓
Type-safe Response
  ↓
React Component Updates
```

## Key Architectural Patterns

### 1. Type Safety End-to-End

```typescript
// Server: Define procedure
export const userRouter = router({
  getMe: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.user.findUnique({
      where: { id: ctx.user.id }
    })
  })
})

// Client: Fully typed, no manual typing needed
const { data } = trpc.user.getMe.useQuery()
//     ^? User | undefined (fully typed!)
```

### 2. Authentication Integration

NextAuth session is automatically available in all tRPC procedures:

```typescript
// context.ts - Runs for every tRPC request
export async function createTRPCContext() {
  const session = await getServerSession(authOptions)
  return { session, user: session?.user }
}

// Protected procedure automatically checks auth
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
```

### 3. API Route Organization

- `/api/auth/*` → Authentication (NextAuth.js)
- `/api/trpc/*` → Business logic (tRPC)
- Future: `/api/webhooks/*`, `/api/cron/*`, etc.

## Development Workflow

### Starting Development

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Set up environment
cp apps/web/.env.local.example apps/web/.env.local
# Edit apps/web/.env.local with your values

# 3. Run migrations
npx prisma generate
npx prisma db push

# 4. Start Next.js dev server
pnpm dev
```

This starts:
- ✅ Next.js on port 3000 (UI + API)
- ✅ PostgreSQL on port 5432
- ❌ No separate backend server needed!

### Adding New Features

#### Adding a New tRPC Router

1. Create router file: `apps/web/src/server/trpc/routers/posts.ts`
2. Define procedures:
```typescript
export const postsRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.post.findMany()
  }),
  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await prisma.post.create({
        data: { ...input, authorId: ctx.user.id }
      })
    })
})
```
3. Register in `_app.ts`:
```typescript
export const appRouter = router({
  user: userRouter,
  posts: postsRouter, // Add here
})
```

4. Use in components:
```typescript
const { data } = trpc.posts.getAll.useQuery()
const createPost = trpc.posts.create.useMutation()
```

#### Adding a New Page

1. Create `apps/web/src/app/my-page/page.tsx`
2. Component is automatically routed to `/my-page`
3. Use tRPC hooks or server components as needed

## Database Access

### All database access goes through Prisma:

```typescript
import { prisma } from '@/lib/prisma'

// In tRPC procedures
const user = await prisma.user.findUnique({ where: { id } })

// In API routes
const users = await prisma.user.findMany()
```

### Schema Changes:

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_posts_table
# 3. Generate client
npx prisma generate
```

## Authentication

### Protected Pages (Server Component)

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')

  return <div>Hello {session.user.name}</div>
}
```

### Protected API (tRPC)

```typescript
export const myRouter = router({
  protectedAction: protectedProcedure
    .mutation(async ({ ctx }) => {
      // ctx.user is guaranteed to exist
      // ctx.session is available
    })
})
```

### Client Components

```typescript
'use client'
import { useSession } from 'next-auth/react'

export function UserProfile() {
  const { data: session } = useSession()
  if (!session) return <SignInButton />
  return <div>{session.user.email}</div>
}
```

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID` (optional)
   - `GOOGLE_CLIENT_SECRET` (optional)
3. Deploy automatically on push

### Docker/VPS

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Environment Variables

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL (e.g., `https://yourdomain.com`)
- `NEXTAUTH_SECRET` - Random secret for signing tokens

### Optional

- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth

## Performance Considerations

### Benefits of Current Architecture

1. **Server Components**: Reduce client bundle size
2. **tRPC Batching**: Multiple requests combined automatically
3. **React Query Caching**: Smart data caching
4. **Prisma Connection Pooling**: Efficient DB connections
5. **Next.js Optimizations**: Image optimization, code splitting, etc.

### Best Practices

- Use Server Components by default
- Use Client Components only when needed (hooks, interactivity)
- Leverage React Query caching
- Index database columns used in queries
- Use `select` in Prisma to fetch only needed fields

## Future Enhancements

### If You Need Separate Services Later

You can always add microservices:

```
volcabulary/
├── apps/
│   ├── web/           # Next.js (UI + main API)
│   └── jobs/          # Background job processor
├── services/
│   ├── python-ml/     # Python ML service
│   ├── go-analytics/  # Go analytics service
│   └── websocket/     # Dedicated WebSocket server
```

Communication options:
- REST API between services
- gRPC for performance
- Message queue (Redis, RabbitMQ)
- Shared database (current PostgreSQL)

### Adding WebSocket Later

If you need real-time features:

1. **Option 1**: Use external service (Pusher, Ably)
2. **Option 2**: Add standalone WebSocket server
3. **Option 3**: Use Server-Sent Events (simpler than WebSocket)

## Monitoring & Debugging

### Development

```bash
# View database
npx prisma studio

# Check types
pnpm run type-check

# Lint code
pnpm run lint
```

### Production

- NextAuth has built-in session debugging
- tRPC provides error handling
- Use Prisma query logging: `log: ['query', 'error', 'warn']`
- Add services like Sentry, LogRocket, or Vercel Analytics

## Conclusion

This simplified architecture provides:
- ✅ Full type safety
- ✅ Modern development experience
- ✅ Easy deployment
- ✅ Scalability when needed
- ✅ Great for learning

The monorepo structure still allows adding services later while keeping the main app simple and maintainable.
