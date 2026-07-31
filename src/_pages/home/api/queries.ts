import { queryOptions } from '@tanstack/react-query'
import { fetchHome } from './api'

const HOME_STALE_TIME = 5 * 60 * 1000
const GC_TIME = 5 * 60 * 1000

// 홈: 조건이 없어 key 고정. 안정적 머천다이징이라 staleTime 길게(5분).
// 홈 fetch는 사용자가 조작하는 요청 파라미터가 없어 복구 가능한 4xx가 없다 —
// 발생 가능한 실패가 전부 예상 밖 성격이라 전부 route error.tsx 경계로 보낸다.
export const homeQueryOptions = queryOptions({
  queryKey: ['home'],
  queryFn: fetchHome,
  staleTime: HOME_STALE_TIME,
  gcTime: GC_TIME,
  throwOnError: true,
})
