import type { Metadata } from 'next'
import './globals.css'
import { TRPCProvider } from '@/lib/trpc-provider'

export const metadata: Metadata = {
  title: 'Volcabulary',
  description: 'Full-stack TypeScript monorepo with Next.js, tRPC, and WebSocket',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
