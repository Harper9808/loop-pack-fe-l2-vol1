import { queryOptions } from '@tanstack/react-query'
import { fetchHome } from './api'

const HOME_STALE_TIME = 5 * 60 * 1000
const GC_TIME = 5 * 60 * 1000

// 홈: 조건이 없어 key 고정. 안정적 머천다이징이라 staleTime 길게(5분).
// throwOnError는 커밋 2(에러 경계 도입)에서 추가한다.
export const homeQueryOptions = queryOptions({
  queryKey: ['home'],
  queryFn: fetchHome,
  staleTime: HOME_STALE_TIME,
  gcTime: GC_TIME,
})
