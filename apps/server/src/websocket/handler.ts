import { WebSocket, WebSocketServer } from 'ws'
import type { Message } from '@volcabulary/types'

interface WebSocketMessage {
  type: 'message' | 'ping' | 'subscribe' | 'unsubscribe'
  payload?: any
}

export const setupWebSocket = (wss: WebSocketServer) => {
  const clients = new Set<WebSocket>()

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket client connected')
    clients.add(ws)

    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString())

        switch (message.type) {
          case 'message':
            // Broadcast message to all clients
            const msg: Message = {
              id: String(Date.now()),
              userId: 'anonymous',
              content: message.payload?.content || '',
              timestamp: new Date(),
            }
            broadcast(clients, {
              type: 'message',
              payload: msg,
            })
            break

          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }))
            break

          default:
            console.log('Unknown message type:', message.type)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })

    ws.on('close', () => {
      console.log('Client disconnected')
      clients.delete(ws)
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
      clients.delete(ws)
    })

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: 'connected',
        payload: { message: 'Welcome to Volcabulary WebSocket server' },
      })
    )
  })

  return wss
}

function broadcast(clients: Set<WebSocket>, message: any) {
  const data = JSON.stringify(message)
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}
