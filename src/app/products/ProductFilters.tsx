'use client'

import { useState, type FormEvent, type JSX } from 'react'
import type { CategoryId, ProductSort } from '@/types/commerce'

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

interface ProductFiltersProps {
  q: string
  category: CategoryId | 'all'
  sort: ProductSort
  onSearch: (q: string) => void
  onCategoryChange: (category: CategoryId | 'all') => void
  onSortChange: (sort: ProductSort) => void
}

// 확정된 조건(q·category·sort)은 URL이 원본이라 prop으로 받고,
// 제출 전 검색어 초안만 이 컴포넌트가 직접 소유한다(설계 문서 §2 Ⓔ).
export function ProductFilters({
  q,
  category,
  sort,
  onSearch,
  onCategoryChange,
  onSortChange,
}: ProductFiltersProps): JSX.Element {
  // URL의 q가 바뀌면(제출·뒤로·앞으로) 렌더 중에 입력창을 동기화한다
  // (useEffect 없이 이전 값과 비교하는 React 공식 패턴).
  const [searchInput, setSearchInput] = useState(q)
  const [syncedQ, setSyncedQ] = useState(q)
  if (syncedQ !== q) {
    setSyncedQ(q)
    setSearchInput(q)
  }

  const handleSearchSubmit = (event: FormEvent): void => {
    event.preventDefault()
    onSearch(searchInput.trim())
  }

  return (
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
          value={category}
          onChange={(event) =>
            onCategoryChange(event.target.value as CategoryId | 'all')
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
          value={sort}
          onChange={(event) => onSortChange(event.target.value as ProductSort)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  )
}
