import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@volcabulary/server'

export const trpc = createTRPCReact<AppRouter>()
