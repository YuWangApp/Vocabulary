# Authentication Setup Guide

This guide will help you set up authentication for Volcabulary using NextAuth.js with both email/password and Google OAuth.

## Prerequisites

- PostgreSQL database running (or use Docker)
- Node.js >= 18.0.0
- pnpm 8.12.1

## Database Setup

### Option 1: Docker PostgreSQL (Recommended for Development)

1. Create a `docker-compose.yaml` file in the project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: volcabulary-db
    environment:
      POSTGRES_USER: volcabulary
      POSTGRES_PASSWORD: volcabulary_dev_password
      POSTGRES_DB: volcabulary
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. Start the database:

```bash
docker-compose up -d
```

### Option 2: Local PostgreSQL

Install PostgreSQL locally and create a database:

```sql
CREATE DATABASE volcabulary;
CREATE USER volcabulary WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE volcabulary TO volcabulary;
```

## Environment Variables

1. Copy the example environment file:

```bash
cd apps/web
cp .env.local.example .env.local
```

2. Update `apps/web/.env.local` with your values:

```env
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws

# Database
DATABASE_URL="postgresql://volcabulary:volcabulary_dev_password@localhost:5432/volcabulary?schema=public"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth (optional - leave blank if not using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Generate NEXTAUTH_SECRET

Generate a secure random string for `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Google OAuth Setup (Optional)

If you want to enable Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env.local` file

## Database Migration

Run Prisma migrations to create the database tables:

```bash
# From project root
npx prisma generate
npx prisma db push
```

Or to create a proper migration:

```bash
npx prisma migrate dev --name init
```

## Running the Application

1. Start the development servers:

```bash
pnpm dev
```

This will start:
- Next.js frontend on [http://localhost:3000](http://localhost:3000)
- Express backend on [http://localhost:3001](http://localhost:3001)

2. Navigate to:
- Sign Up: [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)
- Sign In: [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin)

## Authentication Flow

### Email/Password Sign-Up

1. User fills out the sign-up form with name, email, and password
2. POST request to `/api/auth/signup` creates the user with hashed password
3. User is automatically signed in using NextAuth credentials provider
4. Session is created and user is redirected to home page

### Email/Password Sign-In

1. User enters email and password
2. NextAuth validates credentials against database
3. Password is compared using bcrypt
4. JWT session token is created
5. User is redirected to home page

### Google OAuth Sign-In

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. After authorization, Google redirects back with auth code
4. NextAuth exchanges code for user profile
5. User is created or updated in database
6. Session is created and user is redirected to home page

## Using Authentication in Your App

### Client-Side (React Components)

```typescript
'use client'

import { useSession, signOut } from 'next-auth/react'

export function ProfileComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <p>Email: {session.user.email}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### Server-Side (Route Handlers)

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  return Response.json({ userId: session.user.id })
}
```

### Server Components

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return <div>Welcome, {session.user.name}!</div>
}
```

### tRPC Protected Procedures

```typescript
import { protectedProcedure, router } from '../trpc'
import { z } from 'zod'

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // ctx.user is guaranteed to exist here
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
    }
  }),

  updateProfile: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Update user profile
      return { success: true }
    }),
})
```

## Database Schema

The Prisma schema includes the following models:

- **User**: Stores user information (email, password hash, OAuth data)
- **Account**: OAuth provider accounts linked to users
- **Session**: User sessions for authentication
- **VerificationToken**: Email verification tokens (for future use)

## Security Features

1. **Password Hashing**: Passwords are hashed with bcrypt (12 rounds)
2. **JWT Sessions**: Stateless sessions using JSON Web Tokens
3. **CSRF Protection**: Built-in CSRF protection via NextAuth
4. **Secure Cookies**: HTTP-only, secure cookies in production
5. **Input Validation**: Zod schema validation on all inputs

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio
```

### Google OAuth Errors

- Ensure redirect URIs match exactly (including protocol and port)
- Check that Google+ API is enabled
- Verify OAuth consent screen is configured

### Session Not Persisting

- Check that `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your application URL
- Clear browser cookies and try again

## Next Steps

1. Add email verification for new sign-ups
2. Implement password reset functionality
3. Add more OAuth providers (GitHub, Discord, etc.)
4. Set up role-based access control (RBAC)
5. Add two-factor authentication (2FA)

## Production Deployment

Before deploying to production:

1. Set environment variables on your hosting platform
2. Update `NEXTAUTH_URL` to your production domain
3. Generate a new `NEXTAUTH_SECRET`
4. Use a production PostgreSQL database
5. Enable HTTPS/SSL for all connections
6. Review and update CORS settings
7. Set up database backups

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [tRPC Authentication](https://trpc.io/docs/server/authorization)
