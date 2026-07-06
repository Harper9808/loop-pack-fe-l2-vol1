import type { UseProductSearchResult } from '../hooks/useProductSearch'
import type { SortBy } from '../types'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'price-asc', label: '가격 낮은순' },
  { value: 'price-desc', label: '가격 높은순' },
]

export interface SearchSortBarProps {
  search: UseProductSearchResult
  sortBy: SortBy
  onSortChange: (sortBy: SortBy) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onFilterChange: () => void
}

export function SearchSortBar({
  search,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onFilterChange,
}: SearchSortBarProps): React.ReactElement {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    search.setSearchQuery(e.target.value)
    onFilterChange()
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    onSortChange(e.target.value as SortBy)
    onFilterChange()
  }

  return (
    <section className="search-sort">
      <input
        type="search"
        placeholder="상품 검색..."
        value={search.searchQuery}
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
        onChange={(e) => onViewModeChange(e.target.value as 'grid' | 'list')}
      >
        <option value="grid">그리드</option>
        <option value="list">리스트</option>
      </select>
    </section>
  )
}
