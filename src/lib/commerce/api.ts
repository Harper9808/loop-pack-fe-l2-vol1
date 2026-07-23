import type {
  HomeResponse,
  ProductListQuery,
  ProductListResponse,
} from '@/types/commerce'

// 공통 fetch: 실패 시 서버가 준 message를 살려 throw한다.
// 여기서 throw된 에러가 TanStack Query의 isError로 잡힌다.
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string
    } | null
    throw new Error(body?.message ?? '요청에 실패했습니다.')
  }
  return res.json() as Promise<T>
}

export function fetchHome(): Promise<HomeResponse> {
  return fetchJson<HomeResponse>('/api/home')
}

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
