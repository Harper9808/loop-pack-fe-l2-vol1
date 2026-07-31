import { ProductCard } from './ProductCard'
import type { ProductWithRules } from '../types'

export interface ProductGridProps {
  products: ProductWithRules[]
  viewMode: 'grid' | 'list'
  wishlist: number[]
  searchQuery: string
  onWishlistToggle: (productId: number) => void
  onProductClick: (productId: number) => void
}

export function ProductGrid({
  products,
  viewMode,
  wishlist,
  searchQuery,
  onWishlistToggle,
  onProductClick,
}: ProductGridProps): React.ReactElement {
  return (
    <section
      className="product-grid"
      style={viewMode === 'list' ? { gridTemplateColumns: '1fr' } : undefined}
    >
      {products.length === 0 ? (
        <div className="empty">조건에 맞는 상품이 없습니다.</div>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWished={wishlist.includes(product.id)}
            searchQuery={searchQuery}
            onWishlistToggle={() => onWishlistToggle(product.id)}
            onCardClick={() => onProductClick(product.id)}
          />
        ))
      )}
    </section>
  )
}
