'use client'

import type { JSX } from 'react'
import type { ProductListResponse } from '@/types/commerce'
import { ProductCard } from '@/components/commerce/ProductCard'
import { Pagination } from './Pagination'

interface ProductResultsProps {
  data: ProductListResponse
  onPageChange: (page: number) => void
}

// 조회에 성공한 응답만 받는다. 로딩·에러는 호출부(useQuery 옆)에서 이미 걸러진다.
// "빈"은 에러와 다른 화면이므로 여기서 products 길이로 판정한다.
export function ProductResults({
  data,
  onPageChange,
}: ProductResultsProps): JSX.Element {
  return (
    <>
      <p>총 {data.totalCount}개</p>
      {data.products.length === 0 ? (
        <p className="commerce-empty">검색 결과가 없습니다.</p>
      ) : (
        <div className="week05-grid">
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {data.products.length > 0 && (
        <Pagination
          page={data.page}
          totalCount={data.totalCount}
          pageSize={data.pageSize}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}
