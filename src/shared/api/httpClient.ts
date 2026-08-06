import { ApiError } from './apiError'

// 서버(RSC·generateMetadata)에는 "현재 origin"이 없어 상대 경로로 fetch할 수 없다.
// 브라우저는 지금까지처럼 상대 경로를 그대로 쓰고, 서버에서만 절대 URL로 올린다.
// APP_ORIGIN은 build와 runtime에 같은 값을 넣는다(3단계의 query failure 재현도 이 값을 바꿔서 한다).
const DEFAULT_APP_ORIGIN = 'http://localhost:3000'

function resolveUrl(url: string): string {
  if (typeof window !== 'undefined') {
    return url
  }
  return new URL(url, process.env.APP_ORIGIN ?? DEFAULT_APP_ORIGIN).toString()
}

// 공통 fetch: 실패 시 서버가 준 message를 살려 throw한다.
// 여기서 throw된 에러가 TanStack Query의 isError로 잡히고,
// status는 QueryClient의 retry 분기(providers)가 읽는다.
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(resolveUrl(url))
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string
    } | null
    throw new ApiError(res.status, body?.message ?? '요청에 실패했습니다.')
  }
  return res.json() as Promise<T>
}
