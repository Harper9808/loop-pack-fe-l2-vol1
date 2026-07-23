'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import type { Product } from '@/types/commerce'
import { homeQueryOptions } from '@/lib/commerce/queries'
import { ProductCard } from '@/components/commerce/ProductCard'

// 인기/신상품 섹션 — "빈"은 섹션 단위로 처리(배너·카테고리는 항상 유지).
function ProductSection({
  title,
  products,
}: {
  title: string
  products: Product[]
}) {
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

export default function HomePage() {
  const { data, isPending, isError, error } = useQuery(homeQueryOptions)

  // 최상위 분기: 로딩 / 에러
  if (isPending) {
    return <main className="commerce-status">불러오는 중…</main>
  }
  if (isError) {
    return <main className="commerce-status">{error.message}</main>
  }

  // 성공: 배너·카테고리는 항상, 상품 섹션만 빈 처리
  const { banner, categories, popularProducts, newProducts } = data
  return (
    <main className="week05-page">
      <section
        className="week05-hero"
        style={{ backgroundImage: `url(${banner.image})` }}
      >
        <p>{banner.description}</p>
        <h1>{banner.title}</h1>
      </section>

      <section className="week05-section">
        <h2>카테고리</h2>
        <div className="week05-categories">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <ProductSection title="인기 상품" products={popularProducts} />
      <ProductSection title="신상품" products={newProducts} />
    </main>
  )
}
