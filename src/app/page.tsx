import type { JSX } from 'react'
import { HomePage } from '@/_pages/home'

// 라우팅 진입점 — 조합은 _pages/home이 한다.
export default function Page(): JSX.Element {
  return <HomePage />
}
