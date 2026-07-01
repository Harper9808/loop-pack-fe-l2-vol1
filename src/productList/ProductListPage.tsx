import { useState, useEffect } from 'react'
import './ProductListPage.css'

// ─────────────────────────────────────────────────────────
// 타입도 한 파일에 (실무에서 흔히 보는 모습)
// ─────────────────────────────────────────────────────────

// 분리: 데이터 타입은 컴포넌트가 가지고 있지 않도록한다. (도메인종속)
//product>types.ts/도메인모델/분리대상/필드 구성이 백엔드 스펙에 종속되어 화면과 무관하게 바뀔 수 있고, 여러 파일에서 재사용돼야 함

type Product = {
  id: number
  name: string
  category: 'electronics' | 'fashion' | 'home' | 'beauty'
  price: number
  originalPrice?: number
  stock: number
  imageUrl: string
  createdAt: string
  rating: number
  reviewCount: number
}

//분리: 이건 서버 response 타입이니까 분리?
//product>services>productService.ts /서버응답 /분리대상/ 서버 응답값이 백엔드 스펙에 종속, 컴포넌트에 같이 있을이유 없음
type ProductListResponse = {
  products: Product[]
  totalCount: number
}

//분리: 얘는 정렬 목록이긴 한데 product 도메인에 종속되어있으니까 product에 잔류. 근데 훅안에 넣으면 api호출 타입으로 또 재정의 해야하는거니까 types로 놔둠
//product>types.ts /서버요청,정렬 둘다사용/ 분리대상/ 도메인종속
type SortBy = 'latest' | 'popular' | 'price-asc' | 'price-desc'

// ─────────────────────────────────────────────────────────
// 카테고리 / 정렬 옵션 — 컴포넌트 안에 들고 다닌다
// ─────────────────────────────────────────────────────────

//분리하지 않음: 분리한다면 별도 상수const 쪽으로 빼는게 적절해보이나, 추후 조정/변경 될수 있는 셋팅 성격은 아닌것으로 보이고 지금위치에서도 찾기 쉬워 분리하지 않음
//product>productListPage.tsx 상단에 잔류
const CATEGORIES: { value: 'all' | Product['category']; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'electronics', label: '전자제품' },
  { value: 'fashion', label: '패션' },
  { value: 'home', label: '홈' },
  { value: 'beauty', label: '뷰티' },
]

//분리하지 않음: 분리한다면 별도 상수const 쪽으로 빼는게 적절해보이나, 추후 조정/변경 될수 있는 셋팅 성격은 아닌것으로 보이고 지금위치에서도 찾기 쉬워 분리하지 않음
//product>productListPage.tsx 상단에 잔류

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'price-asc', label: '가격 낮은순' },
  { value: 'price-desc', label: '가격 높은순' },
]

//분리하지 않음: 페이징크기는 유동적으로 바뀔수 있어서 productPage_size와 같이 상수로 관리하고싶지만 현재요구사항에서는 불필요해보여 분리하지 않고잔류
//product>productListPage.tsx 상단에 잔류
const PAGE_SIZE = 12

//common/util
// 검색어를 정규식에 안전하게 넣기 위한 escape (특수문자로 인한 RegExp 크래시 방지)
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// ─────────────────────────────────────────────────────────
// 500줄+ 컴포넌트 — UI, 비즈니스 로직, API, 포맷, 도메인 규칙이 한 파일에
// ─────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────
// hook 분리
// 1) useProducts.ts: 2곳이상에서 반복x, jsx와무관한 로직이 state를 가지고 컴포넌트 차지. 테스트필요할수 있음 =>hook분리
// 데이터를 패치하는 화면이 또 생길거라는건 거의 확실하지만
// 데이터를 패칭하는 공통 hook으로 추상화하기에는 정확한 모양을 추측할수 없음.
// 따라서 추상화후 리팩토링이 다시 필요할 확률이 높기 때문에 현재는 product내부 hook으로 분리정도로 진행한다.
// fetch effect에 ignore 플래그추가
// 2) useProductSearch : 2곳이상에서 반복x,jsx와무관한 로직이 state를 가지고 컴포넌트 차지. 테스트 필요할수 있음 =>hook분리
// 디바운스 공통 hook으로 추상화하기에는 정확한 모양을 추측할수 없음.
// 3) useProductFilters : category/minPrice/maxPrice/inStockOnly를 하나의 훅으로 묶음.
// 개별로는 근거가 약하지만(비동기x, 재사용x) "같은 개념(필터)끼리 묶기"와 "조합 지점(페이지)에서 의존성 배열을 명확하게 하기" 목적으로 분리.
// 단, setPage(1) 리셋 로직은 여기 안 넣음 — page는 다른 훅 소유라 여기서 못 건드림. 페이지 레벨에서 처리.
// 4) usePagination (common) : page state + resetPage + "페이지 바뀌면 스크롤 위로" effect만 소유.
// totalPages/pageNumbers 계산은 훅 안에 안 넣음 — totalCount가 useProducts에서 나오는 값이라
// usePagination(totalCount) 형태로 만들면 page->useProducts->totalCount->usePagination 순환 참조가 생김.
// 그래서 계산은 common/utils/getPageNumbers.ts로 분리해 페이지에서 (page, totalCount, PAGE_SIZE)로 호출.
// 5) useRecentlyViewed : "최근 10개만, 중복 제거, 최신이 맨 앞" 이라는 이름 붙은 규칙이 있어서 분리.
// 내부적으로 common의 useLocalStorageState 사용.
// - wishlist는 별도 훅 안 만듦: toggle 로직 자체가 상품과 무관한 범용 배열 조작이라
//   common의 useLocalStorageState("wishlist", []) + 페이지에 남긴 3줄짜리 toggle 핸들러로 충분.
// - sortBy는 viewMode와 동급으로 페이지에 지역 상태로 남김: useState 하나+핸들러 하나뿐이라 훅으로 뺄 만큼 안 무겁고,
//   원래 UI도 필터(category/price/stock)와 정렬을 다른 section으로 이미 구분해놔서 useProductFilters에 억지로 안 넣음.
// - URL 동기화는 쓰기/읽기를 나눠서 처리:
//   쓰기(현재 상태 → URL): common/hooks/useUrlSync(values, defaults) — 도메인 무관 범용 패턴이라 바로 common
//   읽기(URL → 초기값, 버그#1 대응): 각 훅이 자기 state의 useState 초기화 함수 안에서 개별적으로 자기 몫만 읽음
//     (예: useProductFilters가 category를, usePagination이 page를 각자 읽음 — 중앙 훅 하나가 다 떠맡지 않음)

// ─────────────────────────────────────────────────────────
// product/utils/productRules.ts : discountRate, isHot, isBest, isFreeShipping, isAlmostSoldOut, isSoldOut, isNew
// 각 규칙은 독립된 순수 함수로 존재(개별 테스트/재사용 가능). formattedPrice/formattedOriginal은
// toLocaleString() + "원" 한 줄뿐이라 분리 실익이 없어 인라인 유지(market/Price.tsx와 겹치지만 이 정도 중복은 감수).
//
// enrichProduct(product) — 개별 규칙 함수들을 묶어서 한 번에 호출해주는 편의 함수.
// "여러 함수를 묶어서 호출"하는 것과 "로직 자체를 한 함수 안에 섞는 것"은 다름 — 전자는 SRP 위반 아님.
// (개별 함수가 그대로 살아있어 각자 테스트/재사용 가능한 한, 조립 함수를 추가하는 건 문제 없음)
// useProducts가 데이터를 받는 시점에 products.map(enrichProduct)로 한 번만 계산해서
// ProductWithRules(Product & 규칙 필드들) 타입으로 저장 → JSX는 매 렌더 재계산 없이 product.isHot 등을 바로 읽음.
// isNew는 fetch 시점에 값이 고정되지만, "7일" 기준이 그 사이 바뀔 리 없어 문제 안 됨.
//
// isWished(= wishlist.includes(product.id))는 렌더링과 뗄 수 없어(isSelected와 동급) ProductListPage.tsx에 그대로 둠.

export function ProductListPage() {
  // ─── 서버 상태 (직접 관리) ──────────────────────────────
  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // ─── 필터 상태 ──────────────────────────────────────────
  const [category, setCategory] = useState<'all' | Product['category']>('all')
  const [minPrice, setMinPrice] = useState<number | ''>('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [sortBy, setSortBy] = useState<SortBy>('latest')

  // ─── 검색 상태 ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')

  // ─── 페이지네이션 상태 ──────────────────────────────────
  const [page, setPage] = useState(1)

  // ─── 옵션 토글 ──────────────────────────────────────────
  const [inStockOnly, setInStockOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // ─── 위시리스트 (localStorage 동기화) ───────────────────
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('wishlist')
      return stored ? (JSON.parse(stored) as number[]) : []
    } catch {
      return []
    }
  })

  // ─── 최근 본 상품 (localStorage 동기화) ─────────────────
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed')
      return stored ? (JSON.parse(stored) as number[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      const params = new URLSearchParams({
        category,
        sort: sortBy,
        q: searchQuery,
        page: String(page),
        size: String(PAGE_SIZE),
      })
      if (minPrice !== '') params.set('minPrice', String(minPrice))
      if (maxPrice !== '') params.set('maxPrice', String(maxPrice))
      if (inStockOnly) params.set('inStock', 'true')
      try {
        const res = await fetch(`/api/products?${params.toString()}`)
        if (!res.ok) throw new Error(`API 호출 실패 (status: ${res.status})`)
        const data = (await res.json()) as ProductListResponse
        setProducts(data.products)
        setTotalCount(data.totalCount)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    void fetchProducts()
  }, [category, minPrice, maxPrice, sortBy, searchQuery, page, inStockOnly])

  // ─── 위시리스트가 바뀔 때마다 localStorage 동기화 ───────
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist))
    } catch {
      // localStorage 사용 불가 시 무시
    }
  }, [wishlist])

  // ─── 최근 본 상품도 localStorage 동기화 ─────────────────
  useEffect(() => {
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed))
    } catch {
      // localStorage 사용 불가 시 무시
    }
  }, [recentlyViewed])

  // ─── 페이지가 바뀔 때 스크롤 맨 위로 ────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  // ─── 필터·검색·페이지 상태가 바뀔 때마다 URL 쿼리 동기화 ──
  useEffect(() => {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (searchQuery) params.set('q', searchQuery)
    if (page > 1) params.set('page', String(page))
    if (sortBy !== 'latest') params.set('sort', sortBy)
    if (minPrice !== '') params.set('minPrice', String(minPrice))
    if (maxPrice !== '') params.set('maxPrice', String(maxPrice))
    if (inStockOnly) params.set('inStock', 'true')
    window.history.replaceState(null, '', `?${params.toString()}`)
  }, [category, searchQuery, page, sortBy, minPrice, maxPrice, inStockOnly])

  const handleCategoryChange = (cat: 'all' | Product['category']) => {
    setCategory(cat)
    setPage(1)
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setMinPrice(v === '' ? '' : Number(v))
    setPage(1)
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setMaxPrice(v === '' ? '' : Number(v))
    setPage(1)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy)
    setPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1)
  }

  const handleInStockToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInStockOnly(e.target.checked)
    setPage(1)
  }

  const handlePageChange = (next: number) => {
    setPage(next)
  }

  const handleResetFilters = () => {
    setCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('latest')
    setSearchQuery('')
    setInStockOnly(false)
    setPage(1)
  }

  const handleWishlistToggle = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    )
  }

  const handleProductClick = (productId: number) => {
    setRecentlyViewed((prev) => {
      const without = prev.filter((id) => id !== productId)
      return [productId, ...without].slice(0, 10)
    })
  }

  // ─── 페이지네이션 계산 (인라인) ─────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const pageNumbers: number[] = []
  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(totalPages, page + 2)
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i)

  // ─── 로딩/에러는 early return ───────────────────────────
  if (isLoading && products.length === 0) {
    return <div className="loading">로딩 중...</div>
  }

  if (error) {
    return (
      <div className="error">
        <p>오류가 발생했습니다: {error.message}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    )
  }

  return (
    <div className="product-list-page">
      <header className="page-header">
        <h1>상품 목록</h1>
        <p className="total-count">
          총 {totalCount.toLocaleString()}개의 상품
          {wishlist.length > 0 && (
            <span> · 위시리스트 {wishlist.length}개</span>
          )}
        </p>
      </header>

      {/* ─── 필터 패널 ──────────────────────────────────── */}
      <section className="filter-panel">
        <div className="filter-group">
          <label>카테고리</label>
          <div className="category-list">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={category === cat.value ? 'active' : ''}
                onClick={() => handleCategoryChange(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>가격 범위</label>
          <div className="price-range">
            <input
              type="number"
              placeholder="최소"
              value={minPrice}
              onChange={handleMinPriceChange}
              min={0}
            />
            <span>~</span>
            <input
              type="number"
              placeholder="최대"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              min={0}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>옵션</label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 400,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={handleInStockToggle}
            />
            재고 있는 것만
          </label>
        </div>

        <button className="reset-button" onClick={handleResetFilters}>
          필터 초기화
        </button>
      </section>

      {/* ─── 검색 + 정렬 + 보기 모드 ───────────────────── */}
      <section className="search-sort">
        <input
          type="search"
          placeholder="상품 검색..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select value={sortBy} onChange={handleSortChange}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'grid' | 'list')}
        >
          <option value="grid">그리드</option>
          <option value="list">리스트</option>
        </select>
      </section>

      {/* ─── 상품 그리드 ────────────────────────────────── */}
      <section
        className="product-grid"
        style={viewMode === 'list' ? { gridTemplateColumns: '1fr' } : undefined}
      >
        {products.length === 0 ? (
          <div className="empty">조건에 맞는 상품이 없습니다.</div>
        ) : (
          products.map((product) => {
            // ─── 검색어 하이라이팅 로직 인라인 ──────────
            const highlightMatch = (text: string) => {
              if (!searchQuery) return <>{text}</>
              const parts = text.split(
                new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi'),
              )
              return (
                <>
                  {parts.map((part, i) =>
                    part.toLowerCase() === searchQuery.toLowerCase() ? (
                      <mark
                        key={i}
                        style={{ background: '#fff176', padding: 0 }}
                      >
                        {part}
                      </mark>
                    ) : (
                      part
                    ),
                  )}
                </>
              )
            }

            // ─── 도메인 규칙 인라인 계산 ─────────────────
            const discountRate = product.originalPrice
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : 0
            const formattedPrice = product.price.toLocaleString() + '원'
            const formattedOriginal = product.originalPrice
              ? product.originalPrice.toLocaleString() + '원'
              : null
            const isAlmostSoldOut = product.stock > 0 && product.stock <= 5
            const isSoldOut = product.stock === 0
            const isHot = discountRate >= 30
            const isBest = product.rating >= 4.5 && product.reviewCount >= 100
            const isFreeShipping = product.price >= 50000

            // ─── 날짜 포맷팅 인라인 ─────────────────────
            const createdDate = new Date(product.createdAt)
            const now = new Date()
            const daysSinceCreated = Math.floor(
              (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
            )
            const isNew = daysSinceCreated <= 7

            // ─── 위시리스트 여부 ────────────────────────
            const isWished = wishlist.includes(product.id)

            return (
              <article
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="image-wrap">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                  />
                  {discountRate > 0 && (
                    <span className="badge badge-discount">
                      {discountRate}% 할인
                    </span>
                  )}
                  {isNew && <span className="badge badge-new">NEW</span>}
                  {isHot && <span className="badge badge-hot">특가</span>}
                  {isBest && <span className="badge badge-best">BEST</span>}
                  {isSoldOut && (
                    <span className="badge badge-soldout">품절</span>
                  )}
                  {!isSoldOut && isAlmostSoldOut && (
                    <span className="badge badge-warning">품절 임박</span>
                  )}
                </div>

                <div className="card-body">
                  <h3 className="product-name">
                    {highlightMatch(product.name)}
                  </h3>
                  <div className="price-area">
                    {formattedOriginal && (
                      <span className="original-price">
                        {formattedOriginal}
                      </span>
                    )}
                    <span className="price">{formattedPrice}</span>
                    {isFreeShipping && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          color: '#2e7d32',
                          fontWeight: 600,
                        }}
                      >
                        무료배송
                      </span>
                    )}
                  </div>
                  <div className="rating-area">
                    <span className="rating">
                      ★ {product.rating.toFixed(1)}
                    </span>
                    <span className="review-count">
                      ({product.reviewCount.toLocaleString()})
                    </span>
                    <button
                      style={{
                        marginLeft: 'auto',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: 16,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWishlistToggle(product.id)
                      }}
                      aria-label="위시리스트 토글"
                    >
                      {isWished ? '♥' : '♡'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </section>

      {/* ─── 페이지네이션 ───────────────────────────────── */}
      {totalPages > 1 && (
        <nav className="pagination">
          <button
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            aria-label="첫 페이지"
          >
            «
          </button>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            aria-label="이전 페이지"
          >
            ‹
          </button>
          {pageNumbers.map((p) => (
            <button
              key={p}
              className={p === page ? 'active' : ''}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="다음 페이지"
          >
            ›
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            aria-label="마지막 페이지"
          >
            »
          </button>
        </nav>
      )}

      {/* ─── 백그라운드 로딩 인디케이터 ─────────────────── */}
      {isLoading && products.length > 0 && (
        <div className="background-loading">데이터 갱신 중...</div>
      )}
    </div>
  )
}
