import { Router } from 'express'
import type { Router as RouterType } from 'express'
import type { ApiResponse } from '@volcabulary/types'

const router: RouterType = Router()

// Health check endpoint
router.get('/health', (req, res) => {
  const response: ApiResponse<{ status: string; timestamp: string }> = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  }
  res.json(response)
})

// Example REST endpoint
router.get('/api/status', (req, res) => {
  const response: ApiResponse<{ server: string; version: string }> = {
    success: true,
    data: {
      server: 'volcabulary-api',
      version: '1.0.0',
    },
  }
  res.json(response)
})

export default router
