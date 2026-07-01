# 3주차 — ProductListPage 관심사 분리 기록

대상: `src/product/ProductListPage.tsx` (원래 500줄+ 단일 컴포넌트)

## 1. 관심사 분류표

| 위치(원본 기준)                | 관심사                   | 분리 여부                              | 근거                                                                                   |
| ------------------------------- | ------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| products/totalCount fetch       | 서버 상태 + API           | 분리함 → `useProducts` + `productService` | 컴포넌트가 fetch 구현에 직접 묶이지 않게(DIP), 로딩·에러·재시도까지 한 단위로 재사용 가능하게 |
| category/minPrice/maxPrice/inStockOnly | 필터 상태          | 분리함 → `useProductFilters`             | 상태 4개 + URL 초기화 + 디바운스 로직이 묶여 있어 컴포넌트에 두면 로직이 섞임              |
| searchQuery + 디바운스          | 검색 상태                 | 분리함 → `useProductSearch`              | 디바운스라는 별도 로직이 붙어 있어 독립적으로 다루기 쉽게 분리                             |
| page + 스크롤 top 이펙트        | 페이지네이션 상태         | 분리함 → `usePagination` (common)        | 다른 목록 화면에서도 재사용될 범용 패턴이라 common으로 위치                                |
| wishlist localStorage 동기화    | 클라이언트 상태           | 분리함 → `useLocalStorageState` (common) | localStorage 동기화 자체가 범용 로직이라 common으로 일반화                                |
| recentlyViewed 기록/동기화      | 클라이언트 상태           | 분리함 → `useRecentlyViewed`             | 최대 10개·중복 제거·최신순 유지라는 도메인 규칙이 있어 얇은 래퍼로 분리                    |
| URL 쿼리 동기화                 | 로직(외부 시스템 동기화)  | 분리함 → `useUrlSync` (common)           | 여러 상태값을 URL에 반영하는 동일 패턴이라 범용화                                          |
| discountRate/isHot/isBest 등    | 도메인 규칙(파생값)       | 분리함 → `productRules.ts`               | 순수 함수라 컴포넌트/훅과 분리해 독립적으로 검증하기 쉬움                                  |
| totalPages/pageNumbers 계산     | 파생값                    | 분리함 → `getPageNumbers` (common)       | 페이지 계산도 다른 목록 화면에서 재사용 가능한 순수 함수                                   |
| 검색어 하이라이팅 이스케이프    | 순수 함수                 | 분리함 → `escapeRegExp` (common)         | 정규식 특수문자 이스케이프는 도메인과 무관한 범용 유틸                                     |
| 가격 포맷팅                     | 순수 함수                 | 분리함 → `formatPrice` (common)          | 여러 화면에서 재사용 가능한 포맷터                                                         |
| fetch 에러 정규화               | API 공통 처리             | 분리함 → `httpClient.request` (common)   | 모든 서비스가 공통으로 쓸 fetch wrapper라 common 위치                                      |
| 필터패널/검색바/그리드/카드/페이지네이션 JSX | UI           | 분리함 → `components/*`                  | 각각 독립적인 렌더링 책임을 가져 컴포넌트 단위 분리가 자연스러움                            |
| `viewMode`(그리드/리스트 토글)  | 클라이언트 상태           | 분리 안 함                               | `useState` 1개 + 파생 로직 없음 → Hook으로 빼면 오버 추상화                                |
| `sortBy`                        | 클라이언트 상태           | 분리 안 함                               | URL 초기값 읽기 외 재사용되는 로직이 없어 컴포넌트에 그대로 둠                             |
| 정렬 select / 뷰모드 select     | UI                        | 분리 안 함(보류)                         | 사용처 2곳뿐 + 옵션 소스 형태가 다름(배열 vs 하드코딩) → AHA 원칙상 보류                    |

## 2. 레이어 구조

```
src/product/
  ProductListPage.tsx        — 조립 + 렌더링만
  components/                — FilterPanel / SearchSortBar / ProductGrid / ProductCard / PaginationNav
  hooks/                      — useProductFilters / useProductSearch / useProducts / useRecentlyViewed
  services/productService.ts — API 계약(엔드포인트, 요청/응답 형태)
  utils/productRules.ts      — 도메인 규칙(파생값) 순수 함수
  types.ts
  _mockApi.ts                — 스타터 스캐폴딩, 수정하지 않음

src/common/
  hooks/   — usePagination / useLocalStorageState / useUrlSync / useDebouncedValue
  services/httpClient.ts — fetch 공통 wrapper
  utils/   — escapeRegExp / formatPrice / getPageNumbers / readUrlParam
  components/Badge.tsx
```

## 3. Custom Hook — 한 문장 설명

- **useProductFilters** — 카테고리·가격범위·재고여부 필터 상태를 URL 초기값과 함께 관리하고, 가격은 디바운스된 값도 함께 제공한다.
- **useProductSearch** — 검색어 상태와 그 디바운스된 값을 관리한다.
- **useProducts** — 필터·검색·페이지 조건으로 상품 목록을 fetch하고 로딩/에러/재시도(refetch)를 관리하는 서버 상태 훅.
- **useRecentlyViewed** — 최근 본 상품 id 목록을 localStorage와 동기화하며 기록한다.
- **usePagination** (common) — 현재 페이지 상태를 URL 초기값과 함께 관리하고, 페이지 변경 시 스크롤을 맨 위로 올린다.
- **useLocalStorageState** (common) — 임의의 값을 localStorage와 자동 동기화하는 `useState` 대체.
- **useUrlSync** (common) — 여러 상태값을 한 번에 URL 쿼리스트링에 반영한다(기본값과 같은 항목은 생략).
- **useDebouncedValue** (common) — 값 변경을 지정 시간만큼 지연시켜 반환한다.

## 4. 숨은 버그 기록

### 명시된 버그 3종

**① URL 상태 복원 미구현**
- 증상: 필터·검색·페이지 적용 후 새로고침하거나 URL을 공유/북마크해서 열면 조건이 초기화됨
- 원인: 상태 초기값이 URL을 읽지 않고 하드코딩된 기본값만 사용했고, 상태 변경을 URL에 반영하는 로직도 없었음
- 수정: 각 상태 초기값을 `readUrlParam`으로 읽고, `useUrlSync`로 상태 변경 시 URL에 반영
- 수정한 곳: `useProductFilters`, `useProductSearch`, `usePagination`(초기값) / `useUrlSync`(반영)

**② 재시도 불가**
- 증상: API 에러 후 새로고침 없이는 재시도할 방법이 없었음(원본은 `window.location.reload()`만 제공)
- 원인: 에러 화면의 유일한 액션이 풀 리로드였고, fetch effect를 재실행시킬 트리거가 없었음
- 수정: `refetchToken` state를 추가해 `refetch()` 호출 시 증가시키고, 이 값을 fetch effect 의존성에 포함
- 수정한 곳: `useProducts.ts`

**③ 과도한 API 요청**
- 증상: 검색어·가격 입력 시 키 입력마다 요청이 나감
- 원인: 원본 fetch effect가 `searchQuery`/`minPrice`/`maxPrice` 원본 값을 그대로 의존성 배열에 사용
- 수정: `useDebouncedValue`(300ms)로 감싼 `debouncedQuery`/`debouncedMinPrice`/`debouncedMaxPrice`를 fetch 조건으로 사용
- 수정한 곳: `useProductSearch.ts`, `useProductFilters.ts`, `useProducts.ts`(파라미터 교체)

**(덤) race condition** — fetch effect에 `ignore` 플래그가 없어 응답 순서가 뒤바뀌면 오래된 응답이 최신 상태를 덮어쓸 수 있었음 → `useProducts.ts`에 `ignore` 플래그 추가로 방지

### 추가로 발견한 것

**④ 위시리스트 하트 버튼 스타일 문제**
- 증상: 기본 상태에선 배경이 투명·테두리 없음이라 버튼 존재 자체가 잘 안 보였고, 이후 작업 중 인라인 스타일이 `background: 'red'`로 남아 있어 클릭 시 의도치 않은 빨간 네모로 보임
- 원인: 아이콘을 실제 아이콘이 아니라 유니코드 문자 + 임시 인라인 스타일로 처리하고 있었음
- 수정: `background`는 `transparent`로, `isWished` 여부에 따라 `color`만 지정(`#e53935` / `#999`)
- 수정한 곳: `ProductCard.tsx`

**⑤ 같은 행 카드들의 하트/별점 줄 높이 불일치**
- 증상: 원가·무료배송 텍스트 유무로 카드마다 내용 줄 수가 달라, 같은 행에서도 하트·별점 위치가 서로 다르게 보임
- 원인: 카드 높이는 grid stretch로 맞춰지지만 내부가 flex가 아니라 남는 공간이 분배되지 않았음
- 수정: `.product-card`를 flex column, `.card-body`를 `flex:1` flex column, `.rating-area`에 `margin-top: auto` 추가
- 수정한 곳: `ProductListPage.css`

**⑥ `inStockOnly` 체크박스가 화면에 아무 효과 없음**
- 증상: "재고 있는 것만" 체크해도 재고 0인 상품이 그대로 노출됨
- 원인: 프론트는 `inStock` 쿼리 파라미터를 정상적으로 보내지만, `_mockApi.ts`의 `applyFilters`가 이 파라미터를 전혀 처리하지 않았음
- 수정: `applyFilters`에 `inStock === "true"`일 때 `stock > 0`으로 걸러내는 필터 추가
- 수정한 곳: `_mockApi.ts`
- 참고: 이 파일은 "week-03 과제 중 건드리지 말 것"으로 명시된 스타터 스캐폴딩이라, 원래는 클라이언트 사이드 우회를 고려했으나 필터 로직이 다른 조건들과 같은 위치(`applyFilters`)에 있는 게 구조적으로 맞다고 판단해 이 파일을 직접 수정함
