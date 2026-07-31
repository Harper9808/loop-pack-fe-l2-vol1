'use client'

import { useSelect } from '@/components/ui/select/useSelect'
import type { ProductOption } from '@/app/products/data'
import styles from './SizeSelect.module.css'

interface SizeSelectProps {
  options: ProductOption[]
  value: ProductOption | null
  onChange: (option: ProductOption) => void
}

// select1.png 레퍼런스 — 사이즈 숫자 + 배송 안내를 인라인 리스트로 보여준다.
export function SizeSelect({ options, value, onChange }: SizeSelectProps) {
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
        <span>사이즈{value ? ` ${value.label}` : ''}</span>
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
                <span>{option.label}</span>
                {state.disabled ? (
                  <span>품절</span>
                ) : (
                  option.note && (
                    <span className={styles.shippingNote}>
                      🚚 {option.note}
                    </span>
                  )
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
