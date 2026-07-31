'use client'

import type { JSX } from 'react'
import { useIsInCart, useToggleCart } from '@/entities/cart'

interface AddToCartButtonProps {
  productId: string
  productName: string
}

export function AddToCartButton({
  productId,
  productName,
}: AddToCartButtonProps): JSX.Element {
  const inCart = useIsInCart(productId)
  const toggleCart = useToggleCart()

  return (
    <button
      type="button"
      aria-label={`${productName} 장바구니`}
      aria-pressed={inCart}
      onClick={() => toggleCart(productId)}
    >
      {inCart ? '담김' : '담기'}
    </button>
  )
}
