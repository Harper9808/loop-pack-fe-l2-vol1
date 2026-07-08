// mock 상품 데이터 — route.ts(mock 백엔드)와 page.tsx(서버 컴포넌트 렌더)가 같이 쓴다.
// optionType별로 Select의 3가지 UI(사이즈/번들/썸네일)를 하나씩 커버하도록 구성했다.
export interface ProductOption {
  id: string
  label: string
  price: number
  unitPrice?: number
  originalPrice?: number
  image?: string
  note?: string
  soldOut?: boolean
}

export interface Product {
  id: string
  name: string
  price: number
  originalPrice: number | null
  image: string
  freeShipping: boolean
  optionType: 'size' | 'thumbnail' | 'bundle'
  optionLabel: string
  options: ProductOption[]
}

export const products: Product[] = [
  {
    id: 'p1',
    name: '베이글 플레인',
    price: 3200,
    originalPrice: 4000,
    image: '/next.svg',
    freeShipping: true,
    optionType: 'size',
    optionLabel: '사이즈',
    options: [
      { id: 'p1-24', label: '24', price: 3200, note: '내일(토) 도착보장' },
      { id: 'p1-25', label: '25', price: 3200, soldOut: true },
      { id: 'p1-26', label: '26', price: 3300, note: '내일(토) 도착보장' },
      { id: 'p1-27', label: '27', price: 3300, note: '내일(토) 도착보장' },
      { id: 'p1-28', label: '28', price: 3400, soldOut: true },
    ],
  },
  {
    id: 'p2',
    name: '에브리씽 베이글',
    price: 21000,
    originalPrice: null,
    image: '/next.svg',
    freeShipping: true,
    optionType: 'bundle',
    optionLabel: '옵션 선택',
    options: [
      {
        id: 'p2-bundle',
        label: '[최대할인] 베이글 5+5개',
        price: 21000,
        unitPrice: 2100,
        note: '무료배송',
      },
      {
        id: 'p2-single',
        label: '베이글 1개',
        price: 4200,
        unitPrice: 4200,
      },
    ],
  },
  {
    id: 'p3',
    name: '베이글 스프레드 기획',
    price: 33800,
    originalPrice: null,
    image: '/next.svg',
    freeShipping: false,
    optionType: 'thumbnail',
    optionLabel: '옵션을 선택해 주세요',
    options: [
      {
        id: 'p3-cream',
        label: '크림치즈 스프레드 100g 기획(+100g)',
        price: 38800,
        originalPrice: 39600,
        image: '/next.svg',
        note: '오늘드림',
      },
      {
        id: 'p3-honey',
        label: '허니버터 스프레드 130g 기획(+30g)',
        price: 33800,
        originalPrice: 34600,
        image: '/next.svg',
        note: '오늘드림',
        soldOut: true,
      },
    ],
  },
]
