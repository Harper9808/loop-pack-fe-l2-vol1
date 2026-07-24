'use client'

import { useState, type JSX, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

interface ProvidersProps {
  children: ReactNode
}

// QueryClient는 컴포넌트 수명 동안 하나만 유지한다.
// 렌더마다 새로 만들면 캐시가 초기화되므로 useState 초기화 함수로 1회만 생성한다.
export function Providers({ children }: ProvidersProps): JSX.Element {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryClientProvider>
  )
}
