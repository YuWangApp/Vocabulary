/**
 * NextAuth.js API Route Handler
 *
 * Note: The folder name [...nextauth] is intentional and follows Next.js App Router conventions.
 *
 * The [...nextauth] syntax is a "catch-all route" that handles ALL authentication endpoints:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/google
 * - /api/auth/callback/credentials
 * - /api/auth/session
 * - /api/auth/csrf
 * - and more...
 *
 * This is the recommended approach from NextAuth.js documentation.
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
