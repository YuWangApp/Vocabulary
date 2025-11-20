'use client'

import { trpc } from '@/lib/trpc'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useState } from 'react'

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [messageInput, setMessageInput] = useState('')

  // tRPC queries
  const { data: users, isLoading, refetch } = trpc.user.getAll.useQuery()
  const createUser = trpc.user.create.useMutation({
    onSuccess: () => {
      refetch()
      setName('')
      setEmail('')
    },
  })

  // WebSocket connection
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'
  const { isConnected, messages, sendMessage } = useWebSocket(wsUrl)

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    createUser.mutate({ name, email })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim()) {
      sendMessage(messageInput)
      setMessageInput('')
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Volcabulary
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Full-stack TypeScript monorepo with Next.js, tRPC, and WebSocket
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* tRPC Demo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              tRPC Demo
            </h2>

            <form onSubmit={handleCreateUser} className="mb-6 space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={createUser.isPending}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {createUser.isPending ? 'Creating...' : 'Create User'}
              </button>
            </form>

            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                Users {isLoading && '(Loading...)'}
              </h3>
              <div className="space-y-2">
                {users?.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WebSocket Demo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              WebSocket Demo
            </h2>

            <div className="mb-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isConnected
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {isConnected ? '● Connected' : '○ Disconnected'}
              </span>
            </div>

            <form onSubmit={handleSendMessage} className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!isConnected}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                Send
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <p className="text-gray-900 dark:text-white">{msg.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
