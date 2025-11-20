import { initTRPC } from '@trpc/server'
import type { Context } from './context'

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create()

/**
 * Export reusable router and procedure helpers
 * @see https://trpc.io/docs/v11/router
 * @see https://trpc.io/docs/v11/procedures
 */
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

// Re-export for backward compatibility
export const router = createTRPCRouter
