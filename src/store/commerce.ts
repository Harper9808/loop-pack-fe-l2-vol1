import { create } from 'zustand'

// 비로그인 로컬 장바구니·위시리스트. 원본이 클라이언트에 있는 유일한 상태다.
// 상품 전체가 아니라 id만 저장한다(서버 Product 복사 금지). 개수·담김여부는 파생한다.
interface CommerceState {
  cartIds: string[]
  wishIds: string[]
  toggleCart: (id: string) => void
  toggleWish: (id: string) => void
}

const toggle = (ids: string[], id: string): string[] =>
  ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]

export const useCommerceStore = create<CommerceState>((set) => ({
  cartIds: [],
  wishIds: [],
  toggleCart: (id) => set((state) => ({ cartIds: toggle(state.cartIds, id) })),
  toggleWish: (id) => set((state) => ({ wishIds: toggle(state.wishIds, id) })),
}))

// selector 훅 — 필요한 조각만 구독한다(자기 상품 boolean만).
// 여러 카드에서 반복되는 파생이라 훅으로 캡슐화(store 구조가 바뀌어도 여기만 수정).
export const useIsInCart = (id: string) =>
  useCommerceStore((state) => state.cartIds.includes(id))
export const useIsWished = (id: string) =>
  useCommerceStore((state) => state.wishIds.includes(id))
