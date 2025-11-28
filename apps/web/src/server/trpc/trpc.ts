import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context'

/**
 * Initialization of tRPC for Next.js
 * This should only be done once
 */
const t = initTRPC.context<Context>().create()

/**
 * Public procedure - anyone can call
 */
export const publicProcedure = t.procedure

/**
 * Protected procedure - requires authentication
 * Checks if user is logged in via NextAuth session
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

/**
 * Export reusable router and procedure helpers
 * @see https://trpc.io/docs/v11/router
 * @see https://trpc.io/docs/v11/procedures
 */
export const createTRPCRouter = t.router
export const router = createTRPCRouter
