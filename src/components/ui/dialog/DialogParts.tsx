'use client'

import { createPortal } from 'react-dom'
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'
import { useDialogContext } from './DialogContext'

export function DialogTrigger({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialogContext()
  return (
    <button type="button" onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  )
}

export function DialogOverlay({ ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useDialogContext()
  if (!open) return null

  // 오버레이 클릭으로 닫기 — Content 자체 클릭은 별도 stopPropagation으로 막는다.
  return createPortal(
    <div {...props} onClick={() => setOpen(false)} />,
    document.body,
  )
}

export function DialogContent({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { open } = useDialogContext()
  if (!open) return null

  return createPortal(
    <div {...props} onClick={(event) => event.stopPropagation()}>
      {children}
    </div>,
    document.body,
  )
}

export function DialogTitle({
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 {...props}>{children}</h2>
}

export function DialogDescription({
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props}>{children}</p>
}

export function DialogClose({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialogContext()
  return (
    <button type="button" onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  )
}
