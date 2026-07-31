'use client'

import { createContext, useContext } from 'react'

// Dialog (Compound) — 4주차 2단계
// Trigger/Content/Close가 서로 props 없이 같은 상태를 공유하려고 Context를 쓴다.
// 이게 Compound 패턴의 핵심 — 조각들이 코드상 떨어져 있어도 암시적으로 연결된다.
export interface DialogContextValue {
  open: boolean
  setOpen: (next: boolean) => void
}

export const DialogContext = createContext<DialogContextValue | null>(null)

export function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext)
  if (!ctx)
    throw new Error('Dialog.* 컴포넌트는 <Dialog> 안에서만 쓸 수 있어요')
  return ctx
}
