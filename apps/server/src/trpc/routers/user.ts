import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import type { User } from '@volcabulary/types'

// Mock data for demonstration
const users: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const userRouter = router({
  getAll: publicProcedure.query(() => {
    return users
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const user = users.find((u) => u.id === input.id)
      if (!user) {
        throw new Error('User not found')
      }
      return user
    }),

  create: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      const newUser: User = {
        id: String(users.length + 1),
        email: input.email,
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      users.push(newUser)
      return newUser
    }),
})
