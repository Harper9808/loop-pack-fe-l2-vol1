'use client'

import Link from 'next/link'
import type { JSX } from 'react'
import { useCommerceStore } from '@/store/commerce'

// 전 페이지 공용 헤더. 개수는 저장하지 않고 id 목록 length에서 파생(인라인 selector).
// 헤더는 개수만 구독하므로 담기/찜 토글 시 개수가 바뀔 때만 리렌더된다.
export function Header(): JSX.Element {
  const cartCount = useCommerceStore((state) => state.cartIds.length)
  const wishCount = useCommerceStore((state) => state.wishIds.length)

  return (
    <div className="commerce-header">
      <header className="week05-header">
        <Link href="/">Commerce</Link>
        <nav aria-label="주요 메뉴">
          <Link href="/products">상품</Link>
          <span>위시리스트 {wishCount}</span>
          <span>장바구니 {cartCount}</span>
        </nav>
      </header>
    </div>
  )
}
