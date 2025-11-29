import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../types/app-router'

// API URL - will use environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/api/trpc`,
      headers: async () => {
        // Get auth token from Chrome storage if available
        try {
          const result = await chrome.storage.local.get('authToken')
          const token = result.authToken

          return {
            authorization: token ? `Bearer ${token}` : '',
          }
        } catch (error) {
          console.error('Failed to get auth token:', error)
          return {}
        }
      },
    }),
  ],
})
