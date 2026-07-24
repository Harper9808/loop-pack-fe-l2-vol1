# 5주차 상태관리 — 관심사 분리 리팩토링 노트

> 대상: `src/app/products/page.tsx`(175줄, 컴포넌트 3개) 중심의 5주차 클라이언트 코드
> 기준 문서: [설계 문서](superpowers/specs/2026-07-24-week05-state-management-design.md) · [CONVENTIONS.md](../CONVENTIONS.md) · [AGENTS.md](../AGENTS.md)
> 이 문서는 계획이 아니라 **실제로 일어난 일**을 최종 상태 기준으로 기록한다.

## 1. 출발점

기능(Basic T1~T6)은 이미 동작하는 상태였고, 문제는 배치였다.

- `products/page.tsx` 한 파일이 175줄 · 컴포넌트 3개 — 파일당 1개 규칙(CONVENTIONS §2) 위반
- `ProductsContent` 하나가 **URL 상태 · 서버 상태 · 로컬 초안 상태**를 모두 연결하면서 폼 마크업까지 보유
- 5주차에 새로 쓴 컴포넌트 7개 전부 명시적 반환 타입 없음(§1), props는 인라인 객체 타입(§2)
  - 대조적으로 3주차 `src/product/**`(현재 미사용)과 4주차 `components/ui/dialog`는 이 규칙을 지키고 있었다 — 5주차 코드만 어긋난 드리프트였다.

## 2. 관심사 표 (최종 상태)

### `src/app/products/page.tsx`

| 원래 위치 | 관심사 | 결과 | 근거 |
| --- | --- | --- | --- |
| L15–29 | 카테고리·정렬 선택지 상수 | `ProductFilters.tsx`로 **동반 이동** | 소비자가 필터 폼 하나뿐. 상수 파일로 따로 빼면 파일만 늘고 폼과의 응집도가 떨어짐 |
| L32–38 | Suspense 셸 | **잔류** | App Router가 `page.tsx`에 default export를 요구하는 라우트 진입점 자체. 옮길 곳이 없음 |
| L41–42 | URL 상태 연결 | **기존 훅 유지** | `useProductListQuery.ts`가 nuqs 세부사항을 이미 감싸고 있어 손댈 이유가 없음 |
| L43–45 | 서버 상태 연결 `useQuery` | **잔류** | 필터와 결과 양쪽이 의존하는 유일한 교차점. 부모가 들고 있어야 prop으로 내려감. 훅으로 더 감싸면 위임만 하는 빈 레이어가 생김 |
| L49–59 | 제출 전 검색어 초안 state | `ProductFilters.tsx`로 **이동** | **설계 문서 §2 Ⓔ가 위치를 "검색 폼"으로 지정**했는데 부모가 들고 있었음. AGENTS.md "독립적 UI 상태는 해당 컴포넌트가 직접 소유"와도 충돌 |
| L65–103 | 필터 폼 마크업 | `ProductFilters.tsx`로 **분리** | 위 초안 state와 한 몸 |
| L107–113 | 로딩·에러 3분기 | **잔류** | Query status에서 나오는 파생이라 `useQuery` 바로 옆이라야 읽힘. 빼면 성공 데이터 타입 좁히기가 두 곳으로 갈라짐 |
| L119–143 | 총 개수·그리드·빈 처리 | `ProductResults.tsx`로 **분리** | 카드 필드가 바뀔 때 손대는 코드. 페이징 규칙과 교체 주기가 다름 |
| L126–130 | `getPageNumbers` 파생 | `Pagination.tsx`로 **동반 이동** | 유일한 소비자가 페이지네이션. 계산과 사용처를 붙여 `totalPages<=1`이면 스스로 렌더 생략 |
| L144–172 | 페이지네이션 마크업 | `Pagination.tsx`로 **분리** | 홈에는 없고 목록에만 있는 관심사 |

### `src/app/page.tsx` (홈)

| 원래 위치 | 관심사 | 결과 | 근거 |
| --- | --- | --- | --- |
| L10–31 | `ProductSection` | `ProductSection.tsx`로 **분리** | 파일당 컴포넌트 1개(§2). 같은 파일에서 2회 쓰이지만 홈 셸과 바뀌는 이유가 다름 |
| — | `ProductSection` ↔ `ProductResults` 통합 | **통합 안 함** | 겉모습만 닮음. 홈은 섹션 제목·"상품이 없습니다", 목록은 총 개수·페이지네이션·"검색 결과가 없습니다". 합치면 분기 플래그 2~3개짜리 컴포넌트가 됨 |
| L33–71 | 배너·카테고리 링크 | **잔류** | 각 1회 사용, 상태 없음, 홈 전용. 빼면 파일만 늘고 읽는 흐름이 끊김 |

### `src/components/commerce/ProductCard.tsx`

| 위치 | 관심사 | 결과 | 근거 |
| --- | --- | --- | --- |
| 할인 파생 계산 | 할인율·취소선 판정 | **잔류** | 설계 문서 §2 Ⓓ가 "카드에서 렌더 시 계산"으로 위치를 지정. 소비자도 카드 하나뿐 |
| store 구독 4줄 | 담기·찜 상태/액션 | **잔류** | 이미 `useIsInCart`/`useIsWished`로 캡슐화됨. 액션까지 훅으로 감싸면 설계 문서 §4의 selector 경계(일회성은 인라인)와 어긋남 |

## 3. 결과 구조

`/products` 전용 컴포넌트는 라우트 폴더에 콜로케이션하고, `components/commerce/`에는 홈·목록이 **함께 쓰는 것만** 남겼다 (설계 문서 §3 구조 유지).

```
src/
  app/
    layout.tsx                 41   Providers + 공용 Header
    providers.tsx              21   QueryClient 1회 생성 + NuqsAdapter
    page.tsx                   47   홈 — 서버 상태 연결 + 배너·카테고리
    ProductSection.tsx         33   홈 인기/신상품 섹션
    products/
      page.tsx                 51   Suspense 셸 + 상태 연결 + 3분기   (175 → 51)
      ProductFilters.tsx       96   검색·카테고리·정렬 입력
      ProductResults.tsx       41   총 개수 · 그리드 · 빈 처리
      Pagination.tsx           56   페이지 이동
      useProductListQuery.ts   62   URL 상태(nuqs)
  components/commerce/
    ProductCard.tsx            75   홈·목록 공용 카드
    Header.tsx                 25   장바구니·위시 개수(파생)
  lib/commerce/{api,queries}.ts     서버 상태 레이어 (변경 없음)
  store/commerce.ts            27   Zustand cartIds·wishIds (변경 없음)
```

각 컴포넌트의 책임 한 줄:

- **`ProductFilters`** — 확정된 조건은 prop으로 받고, 제출 전 검색어 초안만 자신이 소유해 제출 시점에 URL로 커밋한다.
- **`ProductResults`** — 성공한 응답만 받아 총 개수·그리드·"빈" 화면을 렌더한다(로딩·에러는 호출부에서 이미 걸러짐).
- **`Pagination`** — 응답에서 페이지 번호를 파생하고, 페이지가 하나뿐이면 스스로 렌더를 생략한다.
- **`ProductSection`** — 홈의 상품 섹션을 렌더하며 "빈"을 섹션 단위로 처리한다(배너·카테고리는 유지).

## 4. 타입 표기 정렬

- 5주차 컴포넌트 전체에 명시적 반환 타입 추가(§1). React 19에서 전역 `JSX` 네임스페이스가 제거되어 `import type { JSX } from 'react'`로 가져온다.
- 인라인 props 객체 타입을 `interface ComponentNameProps`로 전환(§2).
- `useProductListQuery`의 반환 타입을 쓰려면 확정된 조건에 이름이 필요해 **`ProductListParams`** 를 추가했다. `types/commerce.ts`의 `ProductListQuery`는 요청 조립용이라 전 필드가 optional이고, 그대로 쓰면 읽는 쪽에서 `string | undefined`가 되어 못 쓴다.

## 5. 발견했지만 고치지 않은 것

### 5.1 페이지 오버플로 시 되돌아올 수 없음 (동작 버그)

- **증상**: `/products?page=99` 로 진입하면 "검색 결과가 없습니다."만 뜨고 페이지네이션도 사라져, URL을 직접 고치지 않으면 1페이지로 돌아올 수 없다.
- **원인**: API는 범위를 벗어난 페이지에 `products: []` + `totalCount > 0`을 반환하는데(`src/app/api/products/route.ts:98-101`), UI가 페이지네이션을 `products.length > 0` 조건으로 감춘다(현재 `ProductResults.tsx`).
- **미수정 사유**: 이번 작업은 **동작을 바꾸지 않는 구조 리팩토링**이다. 구조 이동 커밋에 동작 변경을 섞으면 회귀가 생겼을 때 원인을 가릴 수 없다. 별도 `fix:` 커밋으로 다뤄야 한다.

### 5.2 `productListQueryOptions`만 반환 타입 없음

`queryOptions()`는 반환 타입 추론을 통해 `useQuery`의 `data` 타입을 좁히도록 설계된 헬퍼라, 반환 타입을 손으로 적으면 그 브랜딩이 깨진다. §1의 예외로 두되 라이브러리 제약임을 여기 남긴다.

### 5.3 `products/page.tsx`에 컴포넌트가 2개 (`ProductsPage` + `ProductsContent`)

`ProductsPage`는 nuqs의 `useSearchParams` 정적 프리렌더 요구를 맞추기 위한 Suspense 경계일 뿐 독립적인 의미가 없다. 분리하면 내용이 Suspense 래퍼뿐인 파일이 생겨 §2를 지키려다 가독성을 잃는다. 프레임워크 제약에 따른 예외로 남긴다.

> §2의 "default export 금지"도 App Router가 `page.tsx`·`layout.tsx`에 강제하므로 같은 성격의 예외다.

## 6. 남은 정리 후보 (이번 범위 밖)

- `pnpm format:check` 가 13개 파일에서 실패한다(제공된 `api/**`·`types/commerce.ts`·설정 파일들). husky가 staged 파일만 검사해 지금까지 드러나지 않았다. `pnpm check`에는 `format:check`가 빠져 있어 CI에서도 안 걸린다.
- `src/examples/week-05-layout/**` 는 이식이 끝나 아무도 참조하지 않는데 tsconfig에서 제외되지 않아 계속 타입 검사·린트 대상이다. `week-05-layout.css`는 `commerce.css`와 `.week05-*` 셀렉터가 겹친다.
- `commerce.css` 안에 `week05-*`(예제에서 복사)와 `commerce-*` 네이밍이 섞여 있다.

## 7. 검증

리팩토링 완료 시점 `pnpm check` 전체 통과.

- 테스트 36개 통과 (3개 파일)
- ESLint · `tsc --noEmit` 클린
- `next build` 성공, `/` 와 `/products` 모두 정적 프리렌더 유지 — Suspense 경계가 그대로 동작함을 확인

> 다만 현재 저장소에는 store·selector·컴포넌트 렌더에 대한 테스트가 없고(vitest 환경이 `node`, jsdom·testing-library 미설치), 이번 구조 변경의 안전망은 타입 검사와 빌드였다. 상태 테스트는 설계 문서 §7의 Advanced-D 후보로 남아 있다.
