'use client'

import type { JSX } from 'react'
import { getPageNumbers } from '@/common/utils/getPageNumbers'

interface PaginationProps {
  page: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

// 총 페이지 수·노출할 페이지 번호는 응답에서 계산하는 파생값이라 저장하지 않는다.
// 계산과 사용처를 한곳에 두어 페이지가 하나뿐이면 스스로 렌더를 생략한다.
export function Pagination({
  page,
  totalCount,
  pageSize,
  onPageChange,
  disabled = false,
}: PaginationProps): JSX.Element | null {
  const { totalPages, pageNumbers } = getPageNumbers(page, totalCount, pageSize)

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="week05-pagination" aria-label="페이지 이동">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        이전
      </button>
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          aria-current={pageNumber === page ? 'page' : undefined}
          disabled={disabled || pageNumber === page}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        다음
      </button>
    </nav>
  )
}
