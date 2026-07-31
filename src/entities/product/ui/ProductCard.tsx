'use client'

import Image from 'next/image'
import type { JSX, ReactNode } from 'react'
import { formatPrice } from '@/shared/lib/formatPrice'
import type { Product } from '../model/types'

interface ProductCardProps {
  product: Product
  actions?: ReactNode
}

// 홈·목록이 함께 쓰는 공용 카드. 담기/찜처럼 상위 레이어(feature)에 속한 행위는
// 이 엔티티가 직접 모르게 하고 actions 슬롯으로만 받는다(entities → features 역방향 금지).
// 할인 표시는 원본(price·originalPrice)에서 렌더 시 계산하는 파생값 — 저장하지 않는다.
export function ProductCard({
  product,
  actions,
}: ProductCardProps): JSX.Element {
  const { price, originalPrice } = product

  const discount =
    originalPrice !== null && originalPrice > price
      ? {
          originalPrice,
          rate: Math.round(((originalPrice - price) / originalPrice) * 100),
        }
      : null

  return (
    <article className="week05-product">
      <Image
        className="week05-image"
        src={product.image}
        alt={product.name}
        width={400}
        height={400}
      />
      <p>{product.brand}</p>
      <h3>{product.name}</h3>
      {discount ? (
        <div className="commerce-price">
          <span className="commerce-discount-rate">{discount.rate}%</span>
          <strong>{formatPrice(price)}</strong>
          <s className="commerce-original-price">
            {formatPrice(discount.originalPrice)}
          </s>
        </div>
      ) : (
        <strong>{formatPrice(price)}</strong>
      )}
      {actions ? (
        <div className="week05-product__actions">{actions}</div>
      ) : null}
    </article>
  )
}
