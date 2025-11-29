import { router } from '../trpc'
import { userRouter } from './user'

/**
 * Main tRPC router
 * Add new routers here as your API grows
 */
export const appRouter = router({
  user: userRouter,
})

export type AppRouter = typeof appRouter
