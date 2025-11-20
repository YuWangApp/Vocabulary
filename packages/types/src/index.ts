// Shared types for the entire monorepo

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  userId: string
  content: string
  timestamp: Date
}

export type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}
