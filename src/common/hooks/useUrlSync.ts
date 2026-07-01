import { useEffect } from 'react'

export type UrlSyncValues = Record<string, string | number | boolean>

// 주어진 값들을 URL 쿼리에 반영한다. 기본값과 같은 항목은 생략한다.
export function useUrlSync(
  values: UrlSyncValues,
  defaults: UrlSyncValues,
): void {
  useEffect(() => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(values)) {
      if (value !== defaults[key]) params.set(key, String(value))
    }
    window.history.replaceState(null, '', `?${params.toString()}`)
  }, [values, defaults])
}
