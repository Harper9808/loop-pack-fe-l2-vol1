import '@/test/setup/msw'
import { describe, expect, it } from 'vitest'
import { fetchProducts } from '@/entities/product/api/api'

describe('jsdom HTTP 경계', () => {
  it('브라우저 상대 URL 요청을 MSW까지 전달한다', async () => {
    const response = await fetchProducts({
      q: '',
      category: 'all',
      sort: 'latest',
      page: 1,
      pageSize: 12,
    })

    expect(response.totalCount).toBe(3)
    expect(response.products).toHaveLength(3)
  })
})
