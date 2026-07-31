// URL 쿼리에서 하나의 값을 읽어온다. 없으면 fallback을 반환한다.
export function readUrlParam<T>(
  key: string,
  fallback: T,
  parse: (raw: string) => T,
): T {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get(key)
  return raw !== null ? parse(raw) : fallback
}
