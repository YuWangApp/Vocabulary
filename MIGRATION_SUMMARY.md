# Architecture Migration Summary

## What Changed

We **merged the Express server into Next.js**, simplifying the architecture from two separate servers to a single Next.js application.

## Before (Two Servers)

```
apps/
├── web/          # Next.js (Port 3000) - UI + Auth
└── server/       # Express (Port 3001) - tRPC + WebSocket
```

## After (Single Server)

```
apps/
└── web/          # Next.js (Port 3000) - UI + Auth + tRPC
```

## What Was Moved

### 1. tRPC Server → Next.js API Routes

**From:**
```
apps/server/src/trpc/
├── context.ts
├── trpc.ts
└── routers/
    ├── _app.ts
    └── user.ts
```

**To:**
```
apps/web/src/server/trpc/
├── context.ts      # Updated to use NextAuth session
├── trpc.ts         # Updated middleware
└── routers/
    ├── _app.ts
    └── user.ts     # Updated to use Prisma
```

### 2. tRPC Client Configuration

**From:**
```typescript
// Connected to Express server
url: 'http://localhost:3001/trpc'
```

**To:**
```typescript
// Connected to Next.js API routes
url: '/api/trpc'
```

### 3. Context Integration

**Before (Express):**
```typescript
export interface Context {
  req: Request
  res: Response
  user?: { id: string; email: string; name: string }
}
```

**After (Next.js + NextAuth):**
```typescript
export async function createTRPCContext() {
  const session = await getServerSession(authOptions)
  return { session, user: session?.user }
}
```

## Files Created

### New tRPC Setup in Next.js

1. `apps/web/src/server/trpc/context.ts` - NextAuth-integrated context
2. `apps/web/src/server/trpc/trpc.ts` - tRPC initialization
3. `apps/web/src/server/trpc/routers/_app.ts` - Root router
4. `apps/web/src/server/trpc/routers/user.ts` - User router with Prisma
5. `apps/web/src/app/api/trpc/[trpc]/route.ts` - tRPC API route handler

## Files Modified

1. `apps/web/src/lib/trpc.ts` - Updated AppRouter import path
2. `apps/web/src/lib/trpc-provider.tsx` - Updated tRPC client URL
3. `apps/web/package.json` - Removed `@volcabulary/server` dependency
4. `apps/web/.env.local.example` - Removed server-related env vars
5. `ARCHITECTURE.md` - Updated architecture documentation

## Files/Directories No Longer Needed

You can now remove (after backing up if needed):
- `apps/server/` - Entire Express server directory
- WebSocket related code (if not needed)

## Environment Variables Changes

### Removed:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # No longer needed
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws  # No longer needed
```

### Kept:
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Development Changes

### Before:
```bash
pnpm dev  # Started 2 servers: Next.js (3000) + Express (3001)
```

### After:
```bash
pnpm dev  # Starts 1 server: Next.js (3000) only
```

## API Endpoint Changes

### Before:
- Auth: `http://localhost:3000/api/auth/*`
- tRPC: `http://localhost:3001/trpc/*`
- WebSocket: `ws://localhost:3001/ws`

### After:
- Auth: `http://localhost:3000/api/auth/*`
- tRPC: `http://localhost:3000/api/trpc/*`
- WebSocket: ❌ Removed (can add back if needed)

## Benefits of New Architecture

1. ✅ **Simpler**: One server, one codebase to manage
2. ✅ **No CORS**: Everything on same origin
3. ✅ **Easier Deployment**: Single deployment target
4. ✅ **Better DX**: Simpler development workflow
5. ✅ **Cost Effective**: One server to host
6. ✅ **Type Safety**: Still maintains end-to-end type safety

## What Stayed the Same

- ✅ Authentication (NextAuth.js)
- ✅ Database (Prisma + PostgreSQL)
- ✅ Type safety (tRPC)
- ✅ React Query integration
- ✅ All existing authentication features

## Migration Checklist

If you're continuing from the old structure:

- [x] Move tRPC to Next.js API routes
- [x] Update tRPC client configuration
- [x] Update environment variables
- [x] Update documentation
- [ ] Remove `apps/server` directory (optional - backup first)
- [ ] Remove WebSocket code if not needed
- [ ] Test all tRPC endpoints
- [ ] Test authentication flow
- [ ] Update any deployment scripts/configs

## Testing the New Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL
docker-compose up -d postgres

# 3. Setup database
npx prisma generate
npx prisma db push

# 4. Start Next.js
pnpm dev

# 5. Test endpoints
# - Visit: http://localhost:3000
# - Sign up: http://localhost:3000/auth/signup
# - tRPC: Should work automatically via React components
```

## Rollback Plan

If you need to rollback:

1. The old `apps/server` code is still in git history
2. Checkout previous commit: `git checkout <commit-before-migration>`
3. Or keep the new setup and add Express back if needed

## Next Steps

1. **Remove old server**: Delete `apps/server/` directory
2. **Update CLAUDE.md**: Reflect the new single-server architecture
3. **Test thoroughly**: Ensure all features work
4. **Deploy**: Push to production with simplified setup

## Questions?

See:
- [ARCHITECTURE.md](ARCHITECTURE.md) - New architecture details
- [AUTH_SETUP.md](AUTH_SETUP.md) - Authentication guide
- [CLAUDE.md](CLAUDE.md) - AI assistant guide (needs updating)
