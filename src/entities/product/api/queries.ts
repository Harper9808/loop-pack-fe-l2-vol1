import { queryOptions } from '@tanstack/react-query'
import type { ProductListQuery } from './types'
import { fetchProducts } from './api'

const PRODUCT_LIST_STALE_TIME = 30 * 1000
const GC_TIME = 5 * 60 * 1000

// 목록: 조건(q·category·sort·page)을 key와 요청에 모두 반영. 조건별 캐시 분리.
// staleTime 30초 — 목록은 잠깐 캐시된 값을 보여줘도 손해가 없다(최종 검증은 상세·결제).
// placeholderData: page만 바뀌면 직전 목록을 유지해 깜빡임을 막고, 필터가 바뀌면
// undefined를 돌려 즉시 로딩을 보여준다(옛 결과가 새 조건 결과로 오인되지 않게).
// throwOnError는 커밋 2(에러 경계 도입)에서 추가한다.
export function productListQueryOptions(query: ProductListQuery) {
  return queryOptions({
    queryKey: ['products', query] as const,
    queryFn: () => fetchProducts(query),
    staleTime: PRODUCT_LIST_STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: (previousData, previousQuery) => {
      const previous = previousQuery?.queryKey[1]
      if (!previous) {
        return undefined
      }
      const filterChanged =
        previous.q !== query.q ||
        previous.category !== query.category ||
        previous.sort !== query.sort
      return filterChanged ? undefined : previousData
    },
  })
}
