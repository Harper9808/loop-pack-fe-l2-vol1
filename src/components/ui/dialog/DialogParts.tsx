'use client'

import { createPortal } from 'react-dom'
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes } from 'react'
import { useDialogContext } from './DialogContext'

// Overlay/Content는 독립적으로 document.body에 portal되는 형제 노드라 쌓임 순서가
// JSX 작성 순서에 의존하면 안 된다 — 소비자 CSS에 기대지 않고 프리미티브 기본값으로 고정한다.
const OVERLAY_Z_INDEX = 100
const CONTENT_Z_INDEX = 101

export function DialogTrigger({
  children,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialogContext()
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event)
        setOpen(true)
      }}
    >
      {children}
    </button>
  )
}

export function DialogOverlay({
  style,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useDialogContext()
  if (!open) return null

  const mergedStyle: CSSProperties = { zIndex: OVERLAY_Z_INDEX, ...style }

  // 오버레이 클릭으로 닫기.
  return createPortal(
    <div {...props} style={mergedStyle} onClick={() => setOpen(false)} />,
    document.body,
  )
}

export function DialogContent({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { open } = useDialogContext()
  if (!open) return null

  const mergedStyle: CSSProperties = { zIndex: CONTENT_Z_INDEX, ...style }

  return createPortal(
    <div {...props} style={mergedStyle}>
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
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialogContext()
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event)
        setOpen(false)
      }}
    >
      {children}
    </button>
  )
}
