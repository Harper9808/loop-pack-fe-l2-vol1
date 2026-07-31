import { queryOptions } from '@tanstack/react-query'
import type { ProductListQuery } from '@/types/commerce'
import { fetchHome, fetchProducts } from './api'

const HOME_STALE_TIME = 5 * 60 * 1000
const PRODUCT_LIST_STALE_TIME = 30 * 1000
const GC_TIME = 5 * 60 * 1000

// 홈: 조건이 없어 key 고정. 안정적 머천다이징이라 staleTime 길게(5분).
// gcTime 5분: tanstackquery gcTime을 안 넘기면, 클라이언트에서 5분으로 폴백 동일한 설정으로 진행.
// 줄이지 않은 이유는 staleTime 0이라도 이전 페이지 캐시를 잠시 보관해 재방문 시 즉시 표시(SWR), 메모리 누적은 방지하기 위함.
export const homeQueryOptions = queryOptions({
  queryKey: ['home'],
  queryFn: fetchHome,
  staleTime: HOME_STALE_TIME,
  gcTime: GC_TIME,
})

// 목록: 조건(q·category·sort·page)을 key와 요청에 모두 반영.
// key가 바뀌는 것 = "새 쿼리, 다시 불러와" 신호. 조건별로 캐시도 분리된다.
// staleTime 30초: 가격·재고가 최종적으로 검증되는 곳은 목록이 아니라 상세·결제다.
// 목록은 30초쯤 캐시된 값을 보여줘도 손해가 없고, 그 사이 페이지를 오가는 재요청이 사라진다.
// gcTime 5분: tanstackquery gcTime을 안 넘기면, 클라이언트에서 5분으로 폴백 동일한 설정으로 진행.
// stale이 된 뒤에도 이전 페이지 캐시를 잠시 보관해 재방문 시 즉시 표시(SWR), 메모리 누적은 방지하기 위함.
// placeholderData: page만 바뀌었으면 직전 목록을 유지해 깜빡임을 막는다.
// 반대로 필터(q·category·sort)가 바뀌면 undefined를 돌려 즉시 로딩을 보여준다 —
// 조건이 완전히 달라졌는데 옛 결과가 남아 있으면 "이게 지금 조건의 결과인가?" 혼동을 준다.
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
