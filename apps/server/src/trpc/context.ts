import type { Request, Response } from 'express'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

/**
 * Defines the shape of the tRPC context
 */
export interface Context {
  req: Request
  res: Response
}

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export async function createContext({ req, res }: CreateExpressContextOptions): Promise<Context> {
  // Add user session or authentication here
  return {
    req,
    res,
  }
}
