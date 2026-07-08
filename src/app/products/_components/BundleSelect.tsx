'use client'

import { useSelect } from '@/components/ui/select/useSelect'
import type { ProductOption } from '@/app/products/data'
import { formatPrice } from '@/common/utils/formatPrice'
import styles from './BundleSelect.module.css'

interface BundleSelectProps {
  options: ProductOption[]
  value: ProductOption | null
  onChange: (option: ProductOption) => void
}

// select3.png 레퍼런스 — 번들 할인 텍스트 옵션(가격 + 개당가 + 무료배송 뱃지).
export function BundleSelect({ options, value, onChange }: BundleSelectProps) {
  const {
    rootRef,
    isOpen,
    triggerProps,
    listProps,
    getOptionState,
    highlight,
    selectOption,
  } = useSelect({ options, value, onChange })

  return (
    <div className={styles.root} ref={rootRef}>
      <button className={styles.trigger} {...triggerProps}>
        <span>{value ? value.label : '옵션 선택'}</span>
        <span aria-hidden>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <ul className={styles.list} {...listProps}>
          {options.map((option, index) => {
            const state = getOptionState(option, index)
            return (
              <li
                key={option.id}
                className={styles.option}
                role="option"
                aria-selected={state.selected}
                aria-disabled={state.disabled}
                data-highlighted={state.highlighted}
                data-disabled={state.disabled}
                onMouseEnter={() => highlight(index)}
                onClick={() => selectOption(option)}
              >
                <span className={styles.label}>{option.label}</span>
                <span className={styles.priceCol}>
                  <span className={styles.price}>
                    {formatPrice(option.price)}
                  </span>
                  {option.unitPrice && (
                    <span className={styles.unitPrice}>
                      (개당 {formatPrice(option.unitPrice)})
                    </span>
                  )}
                  {option.note && (
                    <span className={styles.freeShippingPill}>
                      {option.note}
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
