import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Creates context for tRPC procedures
 * This runs for every tRPC request and provides the session data
 */
export async function createTRPCContext() {
  const session = await getServerSession(authOptions)

  return {
    session,
    user: session?.user,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>
