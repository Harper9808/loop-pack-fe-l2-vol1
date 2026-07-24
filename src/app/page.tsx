'use client'

import Link from 'next/link'
import type { JSX } from 'react'
import { useQuery } from '@tanstack/react-query'
import { homeQueryOptions } from '@/lib/commerce/queries'
import { ProductSection } from './ProductSection'

export default function HomePage(): JSX.Element {
  const { data, isPending, isError, error, isFetching, refetch } =
    useQuery(homeQueryOptions)

  // 최상위 분기: 로딩 / 에러
  if (isPending) {
    return <main className="commerce-status">불러오는 중…</main>
  }
  if (isError) {
    return (
      <main className="commerce-status">
        {error.message}
        <br />
        <button
          type="button"
          className="commerce-retry-button"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? '재시도 중…' : '다시 시도'}
        </button>
      </main>
    )
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
