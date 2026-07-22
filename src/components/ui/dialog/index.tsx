// Dialog (Compound) — 4주차 2단계
// Dialog / Dialog.Trigger / Dialog.Overlay / Dialog.Content / Dialog.Title /
// Dialog.Description / Dialog.Close. 점(dot) 표기로 하나의 컴포넌트처럼 묶는다.
import { Dialog as DialogRoot } from './Dialog'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from './DialogParts'

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
})
