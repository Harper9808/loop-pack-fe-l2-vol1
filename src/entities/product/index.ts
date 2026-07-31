// Public API — 외부가 알아도 되는 것만 공개한다.
// 숨김: productListQueryOptions·fetchProducts(런타임 조회 코드는 세그먼트 직접 경로로),
//       Badge(현재 미사용·잠정 배치라 계약에 포함하지 않음).
export { ProductCard } from './ui/ProductCard'
export type { Product, Category, CategoryId, ProductSort } from './model/types'
export type {
  ProductListQuery,
  ProductListResponse,
  HomeResponse,
} from './api/types'
