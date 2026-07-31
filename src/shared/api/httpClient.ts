import { ApiError } from './apiError'

// 공통 fetch: 실패 시 서버가 준 message를 살려 throw한다.
// 여기서 throw된 에러가 TanStack Query의 isError로 잡히고,
// status는 QueryClient의 retry 분기(providers)가 읽는다.
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string
    } | null
    throw new ApiError(res.status, body?.message ?? '요청에 실패했습니다.')
  }
  return res.json() as Promise<T>
}
