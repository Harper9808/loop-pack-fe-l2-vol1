'use client'

import type { JSX } from 'react'
import { useIsWished, useToggleWish } from '@/entities/wishlist'

interface ToggleWishlistButtonProps {
  productId: string
  productName: string
}

export function ToggleWishlistButton({
  productId,
  productName,
}: ToggleWishlistButtonProps): JSX.Element {
  const isWished = useIsWished(productId)
  const toggleWish = useToggleWish()

  return (
    <button
      type="button"
      aria-label={`${productName} 위시리스트`}
      aria-pressed={isWished}
      onClick={() => toggleWish(productId)}
    >
      {isWished ? '찜 해제' : '찜'}
    </button>
  )
}
