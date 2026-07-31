'use client'

import Image from 'next/image'
import { useSelect } from '@/components/ui/select/useSelect'
import type { ProductOption } from '@/app/products/data'
import { formatPrice } from '@/common/utils/formatPrice'
import styles from './ThumbnailSelect.module.css'

interface ThumbnailSelectProps {
  options: ProductOption[]
  value: ProductOption | null
  onChange: (option: ProductOption) => void
}

// select2.png 레퍼런스 — 옵션마다 썸네일 이미지 + 할인가를 보여준다.
// 이미지는 next/image로 렌더 — 방금 트림한 @next/next/no-img-element가 바로 우리 코드에 적용됨.
export function ThumbnailSelect({
  options,
  value,
  onChange,
}: ThumbnailSelectProps) {
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
        <span>{value ? value.label : '옵션을 선택해 주세요'}</span>
        <span aria-hidden>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <ul className={styles.list} {...listProps}>
          {options.map((option, index) => {
            const state = getOptionState(option, index)
            const discountRate = option.originalPrice
              ? Math.round((1 - option.price / option.originalPrice) * 100)
              : null
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
                {option.image && (
                  <Image
                    className={styles.image}
                    src={option.image}
                    alt={option.label}
                    width={40}
                    height={40}
                  />
                )}
                <div className={styles.body}>
                  <span className={styles.label}>{option.label}</span>
                  <span className={styles.priceRow}>
                    {discountRate !== null && (
                      <span className={styles.discount}>{discountRate}%</span>
                    )}
                    <span className={styles.price}>
                      {formatPrice(option.price)}
                    </span>
                    {state.disabled ? (
                      <span>품절</span>
                    ) : (
                      option.note && (
                        <span className={styles.todayPill}>{option.note}</span>
                      )
                    )}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
