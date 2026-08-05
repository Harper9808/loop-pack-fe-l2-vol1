'use client'

import { useEffect, type JSX } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// 상품 목록의 5xx(throwOnError 조건)와 예상치 못한 렌더링 오류를 잡는다.
// 4xx·빈 결과는 여기 오지 않고 ProductListPage 안에서 인라인으로 처리된다.
export default function Error({ error, reset }: ErrorProps): JSX.Element {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="commerce-status">
      상품 목록을 불러오는 중 문제가 발생했습니다.
      <br />
      <button type="button" className="commerce-retry-button" onClick={reset}>
        다시 시도
      </button>
    </main>
  )
}
