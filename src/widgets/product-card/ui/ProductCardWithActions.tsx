import type { JSX } from 'react'
import { ProductCard, type Product } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { ToggleWishlistButton } from '@/features/toggle-wishlist'

interface ProductCardWithActionsProps {
  product: Product
}

// entities/product는 features를 몰라야 하므로(역방향 금지), 상품 표현(entity)과
// 담기·찜 행위(feature)를 이 widget에서 조합한다. 버튼 순서(찜→담기)는 5주차 그대로.
export function ProductCardWithActions({
  product,
}: ProductCardWithActionsProps): JSX.Element {
  return (
    <ProductCard
      product={product}
      actions={
        <>
          <ToggleWishlistButton
            productId={product.id}
            productName={product.name}
          />
          <AddToCartButton productId={product.id} productName={product.name} />
        </>
      }
    />
  )
}
