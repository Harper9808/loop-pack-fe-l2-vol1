'use client'

import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ProductListResponse } from '@/types/commerce'
import { productListQueryOptions } from '@/lib/commerce/queries'
import { getPageNumbers } from '@/common/utils/getPageNumbers'
import { ProductCard } from '@/components/commerce/ProductCard'
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
  const { totalPages, pageNumbers } = getPageNumbers(
    data.page,
    data.totalCount,
    data.pageSize,
  )

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
      {data.products.length > 0 && totalPages > 1 && (
        <nav className="week05-pagination" aria-label="페이지 이동">
          <button
            type="button"
            onClick={() => onPageChange(data.page - 1)}
            disabled={data.page <= 1}
          >
            이전
          </button>
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === data.page ? 'page' : undefined}
              disabled={pageNumber === data.page}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(data.page + 1)}
            disabled={data.page >= totalPages}
          >
            다음
          </button>
        </nav>
      )}
    </>
  )
}
