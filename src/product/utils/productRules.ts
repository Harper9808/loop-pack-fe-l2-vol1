import type { Product, ProductWithRules } from '../types'

export function getDiscountRate(product: Product): number {
  return product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0
}

export function isAlmostSoldOut(product: Product): boolean {
  return product.stock > 0 && product.stock <= 5
}

export function isSoldOut(product: Product): boolean {
  return product.stock === 0
}

// 할인율 30% 이상이면 특가
export function isHot(product: Product): boolean {
  return getDiscountRate(product) >= 30
}

// 평점 4.5 이상 + 리뷰 100개 이상이면 BEST
export function isBest(product: Product): boolean {
  return product.rating >= 4.5 && product.reviewCount >= 100
}

// 5만원 이상이면 무료배송
export function isFreeShipping(product: Product): boolean {
  return product.price >= 50000
}

// 등록 후 7일 이내면 신상품
export function isNew(product: Product): boolean {
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(product.createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  )
  return daysSinceCreated <= 7
}

// 개별 규칙 함수들을 한 번에 호출해 상품 데이터에 붙여주는 편의 함수.
// useProducts가 데이터를 받는 시점에 한 번만 호출한다 — 렌더마다 재계산하지 않기 위함.
export function enrichProduct(product: Product): ProductWithRules {
  return {
    ...product,
    discountRate: getDiscountRate(product),
    isHot: isHot(product),
    isBest: isBest(product),
    isFreeShipping: isFreeShipping(product),
    isAlmostSoldOut: isAlmostSoldOut(product),
    isSoldOut: isSoldOut(product),
    isNew: isNew(product),
  }
}
