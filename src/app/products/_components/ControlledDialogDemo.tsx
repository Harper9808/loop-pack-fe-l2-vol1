'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import styles from './ProductDetailDialog.module.css'

// controlled 사용 예 — open을 부모(이 컴포넌트)가 직접 들고 있다.
// Dialog.Trigger 없이도, 바깥 버튼 하나로 열고 닫을 수 있다는 게 uncontrolled와의 차이.
export function ControlledDialogDemo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        (controlled) 외부에서 열기
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title>공지</Dialog.Title>
          <Dialog.Description className={styles.description}>
            이 Dialog는 부모가 open 상태를 직접 들고 있는 controlled 모드예요.
            지금은 open이 {String(open)}입니다.
          </Dialog.Description>
          <Dialog.Close className={styles.close}>닫기</Dialog.Close>
        </Dialog.Content>
      </Dialog>
    </>
  )
}
