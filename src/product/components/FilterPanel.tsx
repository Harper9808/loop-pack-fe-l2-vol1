import type { UseProductFiltersResult } from '../hooks/useProductFilters'
import type { Product } from '../types'

const CATEGORIES: { value: 'all' | Product['category']; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'electronics', label: '전자제품' },
  { value: 'fashion', label: '패션' },
  { value: 'home', label: '홈' },
  { value: 'beauty', label: '뷰티' },
]

export interface FilterPanelProps {
  filters: UseProductFiltersResult
  onFilterChange: () => void
  onReset: () => void
}

export function FilterPanel({
  filters,
  onFilterChange,
  onReset,
}: FilterPanelProps): React.ReactElement {
  const handleCategoryChange = (cat: 'all' | Product['category']): void => {
    filters.setCategory(cat)
    onFilterChange()
  }

  const handleMinPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const v = e.target.value
    filters.setMinPrice(v === '' ? '' : Number(v))
    onFilterChange()
  }

  const handleMaxPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const v = e.target.value
    filters.setMaxPrice(v === '' ? '' : Number(v))
    onFilterChange()
  }

  const handleInStockToggle = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    filters.setInStockOnly(e.target.checked)
    onFilterChange()
  }

  return (
    <section className="filter-panel">
      <div className="filter-group">
        <label>카테고리</label>
        <div className="category-list">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={filters.category === cat.value ? 'active' : ''}
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
            value={filters.minPrice}
            onChange={handleMinPriceChange}
            min={0}
          />
          <span>~</span>
          <input
            type="number"
            placeholder="최대"
            value={filters.maxPrice}
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
            checked={filters.inStockOnly}
            onChange={handleInStockToggle}
          />
          재고 있는 것만
        </label>
      </div>

      <button className="reset-button" onClick={onReset}>
        필터 초기화
      </button>
    </section>
  )
}
