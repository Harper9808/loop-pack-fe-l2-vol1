import type { ReactNode } from 'react'

interface OrderLineRowProps {
  children: ReactNode
  amount: number
  isDiscount?: boolean
}

export function OrderLineRow({
  children,
  amount,
  isDiscount,
}: OrderLineRowProps) {
  return (
    <div className="line">
      <div className="grow">{children}</div>
      <strong
        style={{ color: isDiscount === true ? '#ef4444' : 'var(--text-h)' }}
      >
        {isDiscount === true ? '- ' : ''}
        {amount.toLocaleString()}원
      </strong>
    </div>
  )
}
