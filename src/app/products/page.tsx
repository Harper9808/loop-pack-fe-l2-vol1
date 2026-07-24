'use client'

import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ProductListResponse } from '@/types/commerce'
import { productListQueryOptions } from '@/lib/commerce/queries'
import { ProductCard } from '@/components/commerce/ProductCard'
import { Pagination } from './Pagination'
import { ProductFilters } from './ProductFilters'
import { useProductListQuery } from './useProductListQuery'

// nuqs(useSearchParams 기반)를 쓰는 부분은 Suspense 경계로 감싼다 (정적 프리렌더 요구사항).
export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="commerce-status">불러오는 중…</p>}>
      <ProductsContent />
    </Suspense>
  )
}

function ProductsContent() {
  const { query, setSearch, setCategory, setSort, setPage } =
    useProductListQuery()
  const { data, isPending, isError, error } = useQuery(
    productListQueryOptions(query),
  )

  return (
    <main className="week05-page">
      <section className="week05-section">
        <h1>상품 목록</h1>
        <ProductFilters
          q={query.q}
          category={query.category}
          sort={query.sort}
          onSearch={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />
      </section>

      <section className="week05-section" aria-label="상품 검색 결과">
        {isPending ? (
          <p className="commerce-status">불러오는 중…</p>
        ) : isError ? (
          <p className="commerce-status">{error.message}</p>
        ) : (
          <ProductResults data={data} onPageChange={setPage} />
        )}
      </section>
    </main>
  )
}

function ProductResults({
  data,
  onPageChange,
}: {
  data: ProductListResponse
  onPageChange: (page: number) => void
}) {
  return (
    <>
      <p>총 {data.totalCount}개</p>
      {data.products.length === 0 ? (
        <p className="commerce-empty">검색 결과가 없습니다.</p>
      ) : (
        <div className="week05-grid">
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {data.products.length > 0 && (
        <Pagination
          page={data.page}
          totalCount={data.totalCount}
          pageSize={data.pageSize}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}
