import { queryOptions } from '@tanstack/react-query'
import type { ProductListQuery } from '@/types/commerce'
import { fetchHome, fetchProducts } from './api'

// 홈: 조건이 없어 key 고정. 안정적 머천다이징이라 staleTime 길게(5분).
// gcTime 5분: 홈 재방문 시 이전 캐시를 즉시 보여주되 메모리 누적은 방지.
export const homeQueryOptions = queryOptions({
  queryKey: ['home'],
  queryFn: fetchHome,
  staleTime: 5 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
})

// 목록: 조건(q·category·sort·page)을 key와 요청에 모두 반영.
// key가 바뀌는 것 = "새 쿼리, 다시 불러와" 신호. 조건별로 캐시도 분리된다.
// staleTime 0 = 의도적. 완전 품절 시 서버가 목록에서 제외해 멤버십이 변동하므로 항상 재검증.
// gcTime 5분: staleTime 0이라도 이전 페이지 캐시를 잠시 보관해 재방문 시 즉시 표시(SWR).
export function productListQueryOptions(query: ProductListQuery) {
  return queryOptions({
    queryKey: ['products', query],
    queryFn: () => fetchProducts(query),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })
}
