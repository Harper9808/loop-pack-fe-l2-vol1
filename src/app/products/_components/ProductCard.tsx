'use client'

import { useState } from 'react'
import type { Product, ProductOption } from '@/app/products/data'
import { formatPrice } from '@/common/utils/formatPrice'
import { SizeSelect } from './SizeSelect'
import { BundleSelect } from './BundleSelect'
import { ThumbnailSelect } from './ThumbnailSelect'
import { ProductDetailDialog } from './ProductDetailDialog'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [selected, setSelected] = useState<ProductOption | null>(null)
  const displayPrice = selected?.price ?? product.price

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{product.name}</h3>
        <span className={styles.price}>{formatPrice(displayPrice)}</span>
      </div>

      {product.optionType === 'size' && (
        <SizeSelect
          options={product.options}
          value={selected}
          onChange={setSelected}
        />
      )}
      {product.optionType === 'bundle' && (
        <BundleSelect
          options={product.options}
          value={selected}
          onChange={setSelected}
        />
      )}
      {product.optionType === 'thumbnail' && (
        <ThumbnailSelect
          options={product.options}
          value={selected}
          onChange={setSelected}
        />
      )}
      <ProductDetailDialog product={product} selected={selected} />
    </article>
  )
}
