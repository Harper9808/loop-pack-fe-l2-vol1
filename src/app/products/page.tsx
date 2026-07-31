'use client'

import { Suspense, useEffect, type JSX } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productListQueryOptions } from '@/lib/commerce/queries'
import { getPageNumbers } from '@/common/utils/getPageNumbers'
import { ProductFilters } from './ProductFilters'
import { ProductResults } from './ProductResults'
import { useProductListQuery } from './useProductListQuery'

const MIN_PAGE = 1

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
  // page < 1(0·음수)은 응답을 볼 것도 없이 잘못된 값이고, 서버도 400으로 거절한다.
  // 그래서 요청에는 보정한 값을 바로 실어 헛된 400을 만들지 않는다. URL은 아래 effect가 고친다.
  const isPageBelowMin = query.page < MIN_PAGE
  const listQuery = isPageBelowMin ? { ...query, page: MIN_PAGE } : query
  const requestedPage = listQuery.page

  const {
    data,
    isPending,
    isError,
    error,
    isPlaceholderData,
    isFetching,
    refetch,
  } = useQuery(productListQueryOptions(listQuery))

  // 반대쪽 끝: 서버는 범위를 벗어난 page에도 200과 빈 목록을 준다(totalCount는 그대로).
  // 그대로 두면 결과가 30개인데도 "검색 결과가 없습니다"로 보이고 페이지네이션까지
  // 사라져 화면 안에 돌아갈 길이 없다. 존재하는 마지막 페이지로 URL을 고쳐 쓴다.
  const totalPages = data
    ? getPageNumbers(requestedPage, data.totalCount, data.pageSize).totalPages
    : null
  const outOfRangePage =
    totalPages !== null && requestedPage > totalPages ? totalPages : null
  const isPageOutOfRange = outOfRangePage !== null

  // placeholderData(이전 목록 유지)가 range 보정 중(위 replacePage) 옛 page의 응답을 잠깐 그대로 보여준다.
  // 그 응답은 products가 비었지만 totalCount > 0 — 진짜 빈 검색 결과(둘 다 0)와 다르다.
  // 이 조합을 "검색 결과 없음"으로 그리면 보정이 끝나기 전 잠깐 빈 화면이 깜빡인다.
  const isCorrectingPage = data
    ? data.products.length === 0 && data.totalCount > 0
    : false

  // 보정은 양쪽 끝 모두 필요하다 — 1보다 작으면 첫 페이지로, 마지막을 넘으면 마지막 페이지로.
  const correctedPage = isPageBelowMin ? MIN_PAGE : outOfRangePage

  useEffect(() => {
    if (correctedPage !== null) {
      replacePage(correctedPage)
    }
  }, [correctedPage, replacePage])

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
        {isPending || isPageOutOfRange || isCorrectingPage ? (
          <p className="commerce-status">불러오는 중…</p>
        ) : isError ? (
          <p className="commerce-status">
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
          </p>
        ) : (
          <ProductResults
            data={data}
            onPageChange={setPage}
            isPlaceholderData={isPlaceholderData}
          />
        )}
      </section>
    </main>
  )
}
