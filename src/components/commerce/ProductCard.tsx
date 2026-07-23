import Image from 'next/image'
import type { Product } from '@/types/commerce'
import { formatPrice } from '@/common/utils/formatPrice'

// 홈·목록이 함께 쓰는 공용 카드. 담기/찜 버튼은 T5(Zustand)에서 추가한다.
// 할인 표시는 원본(price·originalPrice)에서 렌더 시 계산하는 파생값 — 저장하지 않는다.
export function ProductCard({ product }: { product: Product }) {
  const { price, originalPrice } = product
  // 조건 안에서 originalPrice를 number로 좁혀 non-null 단언 없이 사용한다.
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
    </article>
  )
}
