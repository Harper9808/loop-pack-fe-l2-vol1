export interface Product {
  id: number
  name: string
  category: 'electronics' | 'fashion' | 'home' | 'beauty'
  price: number
  originalPrice?: number
  stock: number
  imageUrl: string
  createdAt: string
  rating: number
  reviewCount: number
}

export type SortBy = 'latest' | 'popular' | 'price-asc' | 'price-desc'

// enrichProduct가 반환하는, 도메인 규칙이 미리 계산되어 붙은 상품
export type ProductWithRules = Product & {
  discountRate: number
  isHot: boolean
  isBest: boolean
  isFreeShipping: boolean
  isAlmostSoldOut: boolean
  isSoldOut: boolean
  isNew: boolean
}
