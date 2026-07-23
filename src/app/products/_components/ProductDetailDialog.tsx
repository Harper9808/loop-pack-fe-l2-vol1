'use client'

import { Dialog } from '@/components/ui/dialog'
import type { Product, ProductOption } from '@/app/products/data'
import { formatPrice } from '@/common/utils/formatPrice'
import styles from './ProductDetailDialog.module.css'

interface ProductDetailDialogProps {
  product: Product
  selected: ProductOption | null
}

// uncontrolled 사용 예 — open을 안 주니 Dialog가 스스로 open 상태를 든다.
export function ProductDetailDialog({
  product,
  selected,
}: ProductDetailDialogProps) {
  return (
    <Dialog>
      <Dialog.Trigger>상세보기</Dialog.Trigger>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content className={styles.content}>
        <Dialog.Title>{product.name}</Dialog.Title>
        <Dialog.Description className={styles.description}>
          가격: {formatPrice(selected?.price ?? product.price)}
          {selected?.note && <> · {selected.note}</>}
        </Dialog.Description>
        <Dialog.Close className={styles.close}>닫기</Dialog.Close>
      </Dialog.Content>
    </Dialog>
  )
}
