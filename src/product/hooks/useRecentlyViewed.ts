import { useLocalStorageState } from '../../common/hooks/useLocalStorageState'

export interface UseRecentlyViewedResult {
  recentlyViewed: number[]
  recordView: (productId: number) => void
}

const MAX_RECENTLY_VIEWED = 10

export function useRecentlyViewed(): UseRecentlyViewedResult {
  const [recentlyViewed, setRecentlyViewed] = useLocalStorageState<number[]>(
    'recentlyViewed',
    [],
  )

  // 최신이 맨 앞, 중복 제거, 최근 10개만 유지
  const recordView = (productId: number): void => {
    setRecentlyViewed((prev) => {
      const without = prev.filter((id) => id !== productId)
      return [productId, ...without].slice(0, MAX_RECENTLY_VIEWED)
    })
  }

  return { recentlyViewed, recordView }
}
