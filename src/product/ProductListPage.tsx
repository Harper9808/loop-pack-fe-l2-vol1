import { useState } from 'react'
import './ProductListPage.css'
import type { SortBy } from './types'
import { useProducts } from './hooks/useProducts'
import { useProductFilters } from './hooks/useProductFilters'
import { useProductSearch } from './hooks/useProductSearch'
import { useRecentlyViewed } from './hooks/useRecentlyViewed'
import { usePagination } from '../common/hooks/usePagination'
import { useLocalStorageState } from '../common/hooks/useLocalStorageState'
import { useUrlSync } from '../common/hooks/useUrlSync'
import { readUrlParam } from '../common/utils/readUrlParam'
import { getPageNumbers } from '../common/utils/getPageNumbers'
import { FilterPanel } from './components/FilterPanel'
import { SearchSortBar } from './components/SearchSortBar'
import { ProductGrid } from './components/ProductGrid'
import { PaginationNav } from './components/PaginationNav'

const PAGE_SIZE = 12

export function ProductListPage(): React.ReactElement {
  const filters = useProductFilters()
  const search = useProductSearch()
  const pagination = usePagination()
  const { recordView } = useRecentlyViewed()
  const [wishlist, setWishlist] = useLocalStorageState<number[]>('wishlist', [])
  const [sortBy, setSortBy] = useState<SortBy>(() =>
    readUrlParam<SortBy>('sort', 'latest', (raw) => raw as SortBy),
  )
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { products, totalCount, isLoading, error, refetch } = useProducts({
    category: filters.category,
    minPrice: filters.debouncedMinPrice,
    maxPrice: filters.debouncedMaxPrice,
    sortBy,
    q: search.debouncedQuery,
    page: pagination.page,
    size: PAGE_SIZE,
    inStockOnly: filters.inStockOnly,
  })

  useUrlSync(
    {
      category: filters.category,
      q: search.searchQuery,
      page: pagination.page,
      sort: sortBy,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStockOnly,
    },
    {
      category: 'all',
      q: '',
      page: 1,
      sort: 'latest',
      minPrice: '',
      maxPrice: '',
      inStock: false,
    },
  )

  const { totalPages, pageNumbers } = getPageNumbers(
    pagination.page,
    totalCount,
    PAGE_SIZE,
  )

  const handleReset = (): void => {
    filters.resetFilters()
    setSortBy('latest')
    search.setSearchQuery('')
    pagination.resetPage()
  }

  const handleWishlistToggle = (productId: number): void => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    )
  }

  if (isLoading && products.length === 0) {
    return <div className="loading">로딩 중...</div>
  }

  if (error) {
    return (
      <div className="error">
        <p>오류가 발생했습니다: {error.message}</p>
        <button onClick={() => refetch()}>다시 시도</button>
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
      <FilterPanel
        filters={filters}
        onFilterChange={pagination.resetPage}
        onReset={handleReset}
      />
      <SearchSortBar
        search={search}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterChange={pagination.resetPage}
      />
      <ProductGrid
        products={products}
        viewMode={viewMode}
        wishlist={wishlist}
        searchQuery={search.searchQuery}
        onWishlistToggle={handleWishlistToggle}
        onProductClick={recordView}
      />
      <PaginationNav
        page={pagination.page}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onPageChange={pagination.setPage}
      />
      {isLoading && products.length > 0 && (
        <div className="background-loading">데이터 갱신 중...</div>
      )}
    </div>
  )
}
