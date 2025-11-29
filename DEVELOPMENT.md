# Development Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker (for PostgreSQL)

## Installation

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install dependencies
pnpm install
```

## Development Workflow

### Starting Development

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Run Next.js app (includes all API routes)
pnpm dev
```

This starts:
- Next.js full-stack app on http://localhost:3000
  - Frontend UI
  - tRPC API at `/api/trpc`
  - NextAuth at `/api/auth`

### Running Individual Apps

```bash
# Run only the web app
pnpm --filter @volcabulary/web dev

# Run only the extension
pnpm --filter @volcabulary/extension dev
```

### Building

```bash
# Build all packages and apps
pnpm build

# Build specific app
pnpm --filter @volcabulary/web build
pnpm --filter @volcabulary/extension build
```

### Environment Variables

#### Web App (apps/web)

Copy `.env.local.example` to `.env.local`:

```bash
cd apps/web
cp .env.local.example .env.local
```

Variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your app URL (default: http://localhost:3000)
- `NEXTAUTH_SECRET`: Secret for NextAuth (generate with: `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (optional)

#### Extension (apps/extension)

The extension connects to the web app's API:

```bash
cd apps/extension
cp .env.example .env
```

Variables:
- `VITE_API_URL`: Web app URL (default: http://localhost:3000)

## Project Structure

```
volcabulary/
├── apps/
│   ├── web/              # Next.js full-stack app
│   │   ├── src/
│   │   │   ├── app/      # App router pages & API routes
│   │   │   ├── server/   # Server-side code (tRPC)
│   │   │   └── lib/      # Client utilities
│   │   └── package.json
│   └── extension/        # Chrome extension
│       ├── src/
│       │   ├── sidepanel/ # Extension UI
│       │   ├── background/ # Service worker
│       │   └── lib/       # Extension utilities
│       └── package.json
├── packages/
│   ├── config/           # Shared configurations (tsconfig, etc.)
│   └── types/            # Shared TypeScript types
├── prisma/               # Database schema
│   └── schema.prisma
└── package.json          # Root package.json
```

## Adding New Features

### Adding a New tRPC Router

1. Create a new router in `apps/web/src/server/trpc/routers/`:

```typescript
// apps/web/src/server/trpc/routers/posts.ts
import { z } from 'zod'
import { publicProcedure, protectedProcedure, router } from '../trpc'
import { prisma } from '@/lib/prisma'

export const postsRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.post.findMany()
  }),

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
})
```

2. Add it to the app router:

```typescript
// apps/web/src/server/trpc/routers/_app.ts
import { postsRouter } from './posts'

export const appRouter = router({
  user: userRouter,
  posts: postsRouter, // Add here
})
```

3. Use it in the frontend:

```typescript
const { data } = trpc.posts.getAll.useQuery()
const createPost = trpc.posts.create.useMutation()
```

### Adding a New REST Endpoint

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

2. Create and apply migration:

```bash
npx prisma migrate dev --name add_posts
```

3. Use in your tRPC procedures:

```typescript
const posts = await prisma.post.findMany()
```

## Database Commands

```bash
# Open Prisma Studio to view data
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (careful! deletes all data)
npx prisma migrate reset

# Push schema changes without migration
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

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

## Troubleshooting

### Port Already in Use

If port 3000 is in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill
```

### Type Errors

Rebuild the types package or regenerate Prisma client:

```bash
pnpm --filter @volcabulary/types build
npx prisma generate
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart postgres

# View logs
docker logs volcabulary-db
```

### Extension Not Loading

1. Make sure you've built the extension: `pnpm --filter @volcabulary/extension build`
2. Load the `apps/extension/dist` folder in Chrome (not the `src` folder)
3. Check Chrome DevTools for errors

## Development Tips

1. **Use Prisma Studio** to view and edit database data visually: `npx prisma studio`
2. **Hot reload works** for both Next.js and the extension (extension requires reload in chrome://extensions)
3. **Check logs** in browser console and terminal for debugging
4. **Type safety** is enforced end-to-end with tRPC
5. **Database schema changes** require running `npx prisma migrate dev`
