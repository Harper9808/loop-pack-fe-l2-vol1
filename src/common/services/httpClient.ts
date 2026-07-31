// fetch 공통 wrapper — non-ok 응답을 에러로 정규화한다.
export async function request<T>(
  path: string,
  params?: URLSearchParams,
): Promise<T> {
  const url = params ? `${path}?${params.toString()}` : path
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API 호출 실패 (status: ${res.status})`)
  return (await res.json()) as T
}
