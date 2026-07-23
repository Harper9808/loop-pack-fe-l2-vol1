'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import type {
  CategoryId,
  ProductListResponse,
  ProductSort,
} from '@/types/commerce'
import { productListQueryOptions } from '@/lib/commerce/queries'
import { getPageNumbers } from '@/common/utils/getPageNumbers'
import { ProductCard } from '@/components/commerce/ProductCard'
import { useProductListQuery } from './useProductListQuery'

const categoryOptions: { value: CategoryId | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'casual', label: '캐주얼' },
  { value: 'fashion', label: '패션' },
  { value: 'goods', label: '뷰티·잡화' },
  { value: 'home', label: '홈' },
  { value: 'digital', label: '디지털' },
]

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'price-asc', label: '낮은 가격순' },
  { value: 'price-desc', label: '높은 가격순' },
]

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

  // 타이핑 중인 검색어 초안(로컬 상태). URL의 q가 바뀌면(제출·뒤로·앞으로)
  // 렌더 중에 입력창을 동기화한다(useEffect 없이 이전 값과 비교하는 React 공식 패턴).
  const [searchInput, setSearchInput] = useState(query.q)
  const [syncedQ, setSyncedQ] = useState(query.q)
  if (syncedQ !== query.q) {
    setSyncedQ(query.q)
    setSearchInput(query.q)
  }

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSearch(searchInput.trim())
  }

  return (
    <main className="week05-page">
      <section className="week05-section">
        <h1>상품 목록</h1>
        <form className="week05-filters" onSubmit={handleSearchSubmit}>
          <label>
            검색
            <input
              name="q"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="상품명 또는 브랜드"
            />
          </label>
          <label>
            카테고리
            <select
              value={query.category}
              onChange={(event) =>
                setCategory(event.target.value as CategoryId | 'all')
              }
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            정렬
            <select
              value={query.sort}
              onChange={(event) => setSort(event.target.value as ProductSort)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </form>
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
