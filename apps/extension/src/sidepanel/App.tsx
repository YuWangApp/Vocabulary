import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { VocabularyApp } from './components/VocabularyApp'

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <VocabularyApp />
    </QueryClientProvider>
  )
}
