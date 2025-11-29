# Volcabulary Quick Start Guide

Get up and running with Volcabulary in 5 minutes!

## Prerequisites

- Node.js >= 18.0.0
- pnpm 8.12.1
- Docker (for PostgreSQL)

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL

```bash
docker-compose up -d postgres
```

Verify it's running:
```bash
docker ps  # Should show volcabulary-db container
```

### 3. Set Up Environment Variables

```bash
cd apps/web
cp .env.local.example .env.local
```

Generate a secret for NextAuth:
```bash
openssl rand -base64 32
```

Edit `apps/web/.env.local` and update:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/volcabulary?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<paste-generated-secret-here>

# Optional: Add Google OAuth credentials
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push
```

### 5. Start Development Server

```bash
pnpm dev
```

The app will start on:
- **Frontend + API**: http://localhost:3000

## Verify Everything Works

### Test the Homepage
Visit: http://localhost:3000

### Test Authentication
1. Visit: http://localhost:3000/auth/signup
2. Create an account with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. You should be redirected to the homepage

### Test tRPC (Optional)

Open your browser console on http://localhost:3000 and run:
```javascript
// This will be available once you add tRPC queries to your page
```

### View Database

Open Prisma Studio to see your data:
```bash
npx prisma studio
```

Visit: http://localhost:5555

## Common Issues

### Port 3000 Already in Use

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill
```

### PostgreSQL Connection Error

```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker logs volcabulary-db
```

### Prisma Client Not Generated

```bash
# Regenerate Prisma client
npx prisma generate
```

### TypeScript Errors

```bash
# Clean and rebuild
pnpm clean
pnpm install
npx prisma generate
```

## Next Steps

### Learn the Codebase

- Read [ARCHITECTURE.md](ARCHITECTURE.md) - Understand the structure
- Read [AUTH_SETUP.md](AUTH_SETUP.md) - Learn about authentication
- Read [CLAUDE.md](CLAUDE.md) - Development guidelines

### Add Features

1. **Create a new tRPC endpoint:**
   - Edit `apps/web/src/server/trpc/routers/user.ts`
   - Add your procedure
   - Use it in a React component

2. **Create a new page:**
   - Create `apps/web/src/app/my-page/page.tsx`
   - Access at http://localhost:3000/my-page

3. **Add a database model:**
   - Edit `prisma/schema.prisma`
   - Run `npx prisma migrate dev --name add_my_model`
   - Use in tRPC procedures

### Deployment

Ready to deploy? Check out:
- [Vercel](https://vercel.com) - Easiest option for Next.js
- [Railway](https://railway.app) - Great for full-stack apps with database
- [Fly.io](https://fly.io) - Docker-based deployment

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server (after build)
pnpm start

# Lint code
pnpm lint

# Format code
pnpm format

# View database
npx prisma studio

# Create database migration
npx prisma migrate dev --name my_migration

# Reset database (careful!)
npx prisma migrate reset
```

## Project Structure Quick Reference

```
apps/web/
├── src/
│   ├── app/              # Pages and API routes
│   │   ├── api/          # API endpoints
│   │   │   ├── auth/     # NextAuth
│   │   │   └── trpc/     # tRPC
│   │   ├── auth/         # Auth pages
│   │   └── page.tsx      # Homepage
│   ├── server/trpc/      # tRPC server code
│   ├── lib/              # Utilities
│   └── types/            # Type definitions
├── prisma/
│   └── schema.prisma     # Database schema
└── .env.local            # Environment variables
```

## Getting Help

- **Documentation**: Check the docs in the root directory
- **Issues**: Create an issue in the repository
- **Community**: Join our Discord/Slack (if applicable)

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

🎉 **You're all set!** Happy coding!
