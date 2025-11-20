import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { appRouter } from './trpc/routers/_app'
import { createContext } from './trpc/context'
import { setupWebSocket } from './websocket/handler'
import restRoutes from './rest/routes'
import { env } from './config/env'

const app = express()

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json())

// REST endpoints
app.use(restRoutes)

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
)

// Create HTTP server
const server = createServer(app)

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' })
setupWebSocket(wss)

// Start server
server.listen(env.PORT, () => {
  console.log(`
🚀 Server ready at:
  - HTTP: http://localhost:${env.PORT}
  - tRPC: http://localhost:${env.PORT}/trpc
  - WebSocket: ws://localhost:${env.PORT}/ws
  - REST API: http://localhost:${env.PORT}/api
  `)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})

export type { AppRouter } from './trpc/routers/_app'
