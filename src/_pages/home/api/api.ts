import { fetchJson } from '@/shared/api/httpClient'
import type { HomeResponse } from '@/entities/product'

// 홈 응답은 배너+카테고리+상품을 묶은 페이지 전용 합성 조회다.
export function fetchHome(): Promise<HomeResponse> {
  return fetchJson<HomeResponse>('/api/home')
}
