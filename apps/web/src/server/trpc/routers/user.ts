import { z } from 'zod'
import { publicProcedure, protectedProcedure, router } from '../trpc'
import { prisma } from '@/lib/prisma'

export const userRouter = router({
  /**
   * Get all users (public for demo - you might want to protect this)
   */
  getAll: publicProcedure.query(async () => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return users
  }),

  /**
   * Get user by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      return user
    }),

  /**
   * Get current user profile (protected)
   */
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  }),

  /**
   * Update current user profile (protected)
   */
  updateMe: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          updatedAt: true,
        },
      })

      return user
    }),
})
