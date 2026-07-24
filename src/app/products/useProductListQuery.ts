import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs'
import type { CategoryId, ProductSort } from '@/types/commerce'

const categoryValues = [
  'all',
  'casual',
  'fashion',
  'goods',
  'home',
  'digital',
] as const
const sortValues = ['latest', 'popular', 'price-asc', 'price-desc'] as const

// URL에서 파서 기본값까지 적용해 확정된 조건. 타입의 ProductListQuery는 전 필드가
// optional이라(요청 조립용) 여기서는 쓰지 않는다 — 읽는 쪽은 항상 값이 있다고 믿어도 된다.
export interface ProductListParams {
  q: string
  category: CategoryId | 'all'
  sort: ProductSort
  page: number
}

export interface UseProductListQueryResult {
  query: ProductListParams
  setSearch: (q: string) => void
  setCategory: (category: CategoryId | 'all') => void
  setSort: (sort: ProductSort) => void
  setPage: (page: number) => void
}

// 목록 조건의 원본 = URL. nuqs로 타입 있는 URL 상태로 다룬다.
// 필터(q·category·sort)가 바뀌면 page를 1로 되돌리고, 페이지 이동만 page를 바꾼다.
// 한 번의 setQuery로 묶어 URL 변경·재요청·히스토리 항목이 각각 1번만 발생하게 한다.
export function useProductListQuery(): UseProductListQueryResult {
  const [query, setQuery] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      category: parseAsStringEnum<CategoryId | 'all'>([
        ...categoryValues,
      ]).withDefault('all'),
      sort: parseAsStringEnum<ProductSort>([...sortValues]).withDefault(
        'latest',
      ),
      page: parseAsInteger.withDefault(1),
    },
    { history: 'push' },
  )

  return {
    query,
    setSearch: (q: string) => setQuery({ q, page: 1 }),
    setCategory: (category: CategoryId | 'all') =>
      setQuery({ category, page: 1 }),
    setSort: (sort: ProductSort) => setQuery({ sort, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
  }
}
