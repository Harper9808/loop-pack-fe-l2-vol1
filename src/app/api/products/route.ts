import { NextResponse } from 'next/server'
import { products } from '@/app/products/data'

// mock 백엔드 (Next route handler). 실제 DB 대신 여기서 데이터를 내려준다.
export async function GET() {
  return NextResponse.json({ products, totalCount: products.length })
}
