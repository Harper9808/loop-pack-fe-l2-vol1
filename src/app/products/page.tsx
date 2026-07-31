import type { JSX } from 'react'
import { ProductListPage } from '@/_pages/product-list'

// 라우팅 진입점 — 조합은 _pages/product-list가 한다.
export default function Page(): JSX.Element {
  return <ProductListPage />
}
