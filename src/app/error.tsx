'use client'

import { useEffect, type JSX } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// 홈(_pages/home)의 throwOnError로 전파된 서버 오류와 예상치 못한 렌더링 오류를 잡는다.
// reset()은 세그먼트를 다시 렌더해 쿼리를 재시도한다(retryOnMount 기본값).
export default function Error({ error, reset }: ErrorProps): JSX.Element {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="commerce-status">
      문제가 발생했습니다. 잠시 후 다시 시도해주세요.
      <br />
      <button type="button" className="commerce-retry-button" onClick={reset}>
        다시 시도
      </button>
    </main>
  )
}
