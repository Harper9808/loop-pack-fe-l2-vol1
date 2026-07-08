'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { DialogContext } from './DialogContext'

interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

// open prop 유무로 controlled/uncontrolled를 가른다 — 이게 이번 주의 알맹이인 이중 API.
// open이 없으면(undefined) 이 컴포넌트가 내부 state로 직접 들고, 있으면 부모가 든 값을 그대로 신뢰한다.
export function Dialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  // Esc로 닫기 + 열려있는 동안 배경 스크롤 잠금. 포커스 트랩/복원/ARIA는 이번 주 범위 밖.
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, setOpen])

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}
