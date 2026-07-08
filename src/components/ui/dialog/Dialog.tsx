'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { DialogContext } from './DialogContext'
import { lockScroll, unlockScroll } from './scrollLock'

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

  // Esc로 닫기. 포커스 트랩/복원/ARIA는 이번 주 범위 밖.
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, setOpen])

  // 배경 스크롤 잠금 — Esc 처리와 관심사가 달라 별도 effect로 분리.
  // 여러 Dialog가 동시에 열려도 안전하도록 참조 카운트 기반 싱글톤(scrollLock.ts)을 쓴다.
  useEffect(() => {
    if (!open) return
    lockScroll()
    return () => unlockScroll()
  }, [open])

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}
