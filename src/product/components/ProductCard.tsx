import { Badge } from '../../common/components/Badge'
import { escapeRegExp } from '../../common/utils/escapeRegExp'
import { formatPrice } from '../../common/utils/formatPrice'
import type { ProductWithRules } from '../types'

export interface ProductCardProps {
  product: ProductWithRules
  isWished: boolean
  searchQuery: string
  onWishlistToggle: () => void
  onCardClick: () => void
}

function highlightMatch(text: string, query: string): React.ReactElement {
  if (!query) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} style={{ background: '#fff176', padding: 0 }}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function ProductCard({
  product,
  isWished,
  searchQuery,
  onWishlistToggle,
  onCardClick,
}: ProductCardProps): React.ReactElement {
  const formattedOriginal = product.originalPrice
    ? formatPrice(product.originalPrice)
    : null

  return (
    <article className="product-card" onClick={onCardClick}>
      <div className="image-wrap">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.discountRate > 0 && (
          <Badge variant="discount">{product.discountRate}% 할인</Badge>
        )}
        {product.isNew && <Badge variant="new">NEW</Badge>}
        {product.isHot && <Badge variant="hot">특가</Badge>}
        {product.isBest && <Badge variant="best">BEST</Badge>}
        {product.isSoldOut && <Badge variant="soldout">품절</Badge>}
        {!product.isSoldOut && product.isAlmostSoldOut && (
          <Badge variant="warning">품절 임박</Badge>
        )}
      </div>

      <div className="card-body">
        <h3 className="product-name">
          {highlightMatch(product.name, searchQuery)}
        </h3>
        <div className="price-area">
          {formattedOriginal && (
            <span className="original-price">{formattedOriginal}</span>
          )}
          <span className="price">{formatPrice(product.price)}</span>
          {product.isFreeShipping && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                color: '#2e7d32',
                fontWeight: 600,
              }}
            >
              무료배송
            </span>
          )}
        </div>
        <div className="rating-area">
          <span className="rating">★ {product.rating.toFixed(1)}</span>
          <span className="review-count">
            ({product.reviewCount.toLocaleString()})
          </span>
          <button
            style={{
              marginLeft: 'auto',
              border: 'none',
              color: 'red',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 16,
            }}
            onClick={(e) => {
              e.stopPropagation()
              onWishlistToggle()
            }}
            aria-label="위시리스트 토글"
          >
            {isWished ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </article>
  )
}
