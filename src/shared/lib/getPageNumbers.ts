export interface PageNumbersResult {
  totalPages: number
  pageNumbers: number[]
}

export function getPageNumbers(
  page: number,
  totalCount: number,
  pageSize: number,
): PageNumbersResult {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(totalPages, page + 2)
  const pageNumbers: number[] = []
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i)
  return { totalPages, pageNumbers }
}
