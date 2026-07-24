'use client'

import type { JSX } from 'react'
import type { Product } from '@/types/commerce'
import { ProductCard } from '@/components/commerce/ProductCard'

interface ProductSectionProps {
  title: string
  products: Product[]
}

// 홈의 인기/신상품 섹션 — "빈"은 섹션 단위로 처리한다(배너·카테고리는 항상 유지).
// 목록의 ProductResults와 겉모습이 닮았지만 총 개수·페이지네이션·빈 문구가 달라
// 합치면 분기 플래그만 늘어나므로 따로 둔다.
export function ProductSection({
  title,
  products,
}: ProductSectionProps): JSX.Element {
  return (
    <section className="week05-section">
      <h2>{title}</h2>
      {products.length === 0 ? (
        <p className="commerce-empty">상품이 없습니다.</p>
      ) : (
        <div className="week05-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
