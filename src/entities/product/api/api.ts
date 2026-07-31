import { fetchJson } from '@/shared/api/httpClient'
import type { ProductListQuery, ProductListResponse } from './types'

export function fetchProducts(
  query: ProductListQuery,
): Promise<ProductListResponse> {
  // 기본값도 명시적으로 요청에 싣는다 (특히 sort=latest — 4주차 생략 동작에 기대지 않음).
  const params = new URLSearchParams({
    q: query.q ?? '',
    category: query.category ?? 'all',
    sort: query.sort ?? 'latest',
    page: String(query.page ?? 1),
  })
  return fetchJson<ProductListResponse>(`/api/products?${params.toString()}`)
}
