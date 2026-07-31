// React 트리 밖의 모듈 싱글톤 카운터 — 여러 Dialog 인스턴스가 동시에 열려도
// 마지막 하나가 닫힐 때만 스크롤을 복원한다(각자 독립적으로 저장/복원하면,
// 먼저 연 Dialog를 나중에 닫을 때 아직 열려있는 다른 Dialog의 스크롤 잠금까지 풀려버린다).
let lockCount = 0
let previousBodyOverflow = ''
let previousHtmlOverflow = ''

export function lockScroll(): void {
  if (lockCount === 0) {
    previousBodyOverflow = document.body.style.overflow
    previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  }
  lockCount += 1
}

export function unlockScroll(): void {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = previousBodyOverflow
    document.documentElement.style.overflow = previousHtmlOverflow
  }
}
