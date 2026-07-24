'use client'

import { Suspense, useEffect, type JSX } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productListQueryOptions } from '@/lib/commerce/queries'
import { getPageNumbers } from '@/common/utils/getPageNumbers'
import { ProductFilters } from './ProductFilters'
import { ProductResults } from './ProductResults'
import { useProductListQuery } from './useProductListQuery'

// nuqs(useSearchParams 기반)를 쓰는 부분은 Suspense 경계로 감싼다 (정적 프리렌더 요구사항).
export default function ProductsPage(): JSX.Element {
  return (
    <Suspense fallback={<p className="commerce-status">불러오는 중…</p>}>
      <ProductsContent />
    </Suspense>
  )
}

function ProductsContent(): JSX.Element {
  const { query, setSearch, setCategory, setSort, setPage, replacePage } =
    useProductListQuery()
  const { data, isPending, isError, error } = useQuery(
    productListQueryOptions(query),
  )

  // 서버는 범위를 벗어난 page에도 200과 빈 목록을 준다(totalCount는 그대로).
  // 그대로 두면 결과가 30개인데도 "검색 결과가 없습니다"로 보이고 페이지네이션까지
  // 사라져 화면 안에 돌아갈 길이 없다. 존재하는 마지막 페이지로 URL을 고쳐 쓴다.
  const totalPages = data
    ? getPageNumbers(query.page, data.totalCount, data.pageSize).totalPages
    : null
  const isPageOutOfRange = totalPages !== null && query.page > totalPages

  useEffect(() => {
    if (totalPages !== null && isPageOutOfRange) {
      replacePage(totalPages)
    }
  }, [isPageOutOfRange, totalPages, replacePage])

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
        {/* 범위 밖 page는 곧 마지막 페이지로 고쳐 쓰이므로,
            잘못된 "검색 결과가 없습니다" 대신 로딩을 유지한다. */}
        {isPending || isPageOutOfRange ? (
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
