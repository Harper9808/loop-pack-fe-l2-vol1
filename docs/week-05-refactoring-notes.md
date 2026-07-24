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

## 5. 리팩토링 중 발견한 동작 버그 — 페이지 오버플로

구조 리팩토링 커밋에는 **일부러 넣지 않고**, 끝난 뒤 별도 `fix:` 커밋으로 다뤘다.
`refactor:`가 "겉보기 동작은 그대로"라는 약속을 지켜야 나중에 화면이 이상할 때 그 커밋들을 용의선상에서 뺄 수 있기 때문이다.

### 5.1 증상과 원인

`GET /api/products?page=99` 의 실제 응답(프로브 테스트 실측):

```
status 200 · products.length 0 · totalCount 30 · page 99 · pageSize 12
getPageNumbers(99, 30, 12) → { totalPages: 3, pageNumbers: [] }
```

상품이 30개(3페이지)뿐인데 서버는 에러 대신 200과 빈 목록을 준다(`api/products/route.ts:98-101`). 이걸 받은 화면은

- `products.length === 0` 이라 **"검색 결과가 없습니다."** 를 띄운다. 결과가 30개 있는데 검색 실패처럼 보인다.
- 페이지네이션이 `products.length > 0` 게이트에 막혀 사라진다 → **화면 안에 돌아갈 길이 없다.**
  (헤더의 "상품" 링크로는 빠져나올 수 있으므로 완전히 갇히는 것은 아니다.)

### 5.2 게이트만 지우는 것은 수정이 아니다

`Pagination`이 `totalPages <= 1`이면 스스로 `null`을 반환하므로 바깥 게이트를 지우고 싶어지지만, 위 실측처럼 `pageNumbers`가 **빈 배열**이라(`startPage=97`, `endPage=3`) 숫자 버튼 없이 `이전`/`다음`만 남는다. `다음`은 비활성이고 `이전`은 98페이지로 가므로 3페이지까지 96번 눌러야 한다 — 더 나빠진다.

### 5.3 채택한 수정: URL 정규화

`page`가 마지막 페이지를 넘으면 마지막 페이지로 URL을 고쳐 쓴다.

- **`replace`를 쓴 이유**: 사용자가 고른 값이 아니라 잘못된 값을 바로잡는 이동이다. `push`면 뒤로가기가 다시 없는 페이지로 돌아가 되돌아올 수 없다.
- **setter를 `useCallback`으로 감싼 이유**: 정규화는 effect(외부 시스템인 URL/히스토리와의 동기화)라 setter가 의존성에 들어간다. 참조가 매 렌더 바뀌면 effect가 계속 재실행되므로 안정화가 필요하다. nuqs의 `setQuery`가 이미 메모이즈돼 있어(`nuqs/dist/index.js` `useQueryStates`의 `useCallback`) 실제로 안정적이며, `eslint-disable` 없이 해결된다.
- **범위 밖일 때 로딩을 유지하는 이유**: 곧 고쳐 쓰일 상태라 잘못된 "검색 결과가 없습니다."가 깜빡이지 않게 한다.

> ⚠️ **브라우저 실동작은 아직 미확인이다.** 타입 검사·ESLint·빌드와 API 실측까지는 확인했으나, 리다이렉트가 실제로 일어나는지와 뒤로가기 동작은 `/products?page=99`에서 수동 확인이 필요하다.

## 6. 그 밖에 고치지 않은 것

### 6.1 `productListQueryOptions`만 반환 타입 없음

`queryOptions()`는 반환 타입 추론을 통해 `useQuery`의 `data` 타입을 좁히도록 설계된 헬퍼라, 반환 타입을 손으로 적으면 그 브랜딩이 깨진다. §1의 예외로 두되 라이브러리 제약임을 여기 남긴다.

### 6.2 `products/page.tsx`에 컴포넌트가 2개 (`ProductsPage` + `ProductsContent`)

`ProductsPage`는 nuqs의 `useSearchParams` 정적 프리렌더 요구를 맞추기 위한 Suspense 경계일 뿐 독립적인 의미가 없다. 분리하면 내용이 Suspense 래퍼뿐인 파일이 생겨 §2를 지키려다 가독성을 잃는다. 프레임워크 제약에 따른 예외로 남긴다.

> §2의 "default export 금지"도 App Router가 `page.tsx`·`layout.tsx`에 강제하므로 같은 성격의 예외다.

## 7. 남은 정리 후보 (이번 범위 밖)

- `pnpm format:check` 가 13개 파일에서 실패한다(제공된 `api/**`·`types/commerce.ts`·설정 파일들). husky가 staged 파일만 검사해 지금까지 드러나지 않았다. `pnpm check`에는 `format:check`가 빠져 있어 CI에서도 안 걸린다.
- `src/examples/week-05-layout/**` 는 이식이 끝나 아무도 참조하지 않는데 tsconfig에서 제외되지 않아 계속 타입 검사·린트 대상이다. `week-05-layout.css`는 `commerce.css`와 `.week05-*` 셀렉터가 겹친다.
- `commerce.css` 안에 `week05-*`(예제에서 복사)와 `commerce-*` 네이밍이 섞여 있다.

## 8. 검증

`pnpm check` 전체 통과.

- 테스트 36개 통과 (3개 파일)
- ESLint · `tsc --noEmit` 클린 (`eslint-disable` 없음)
- `next build` 성공, `/` 와 `/products` 모두 정적 프리렌더 유지 — Suspense 경계가 그대로 동작함을 확인

**아직 확인하지 못한 것**

- §5의 오버플로 수정이 브라우저에서 실제로 리다이렉트되는지, 뒤로가기가 없는 페이지로 돌아가지 않는지 (`/products?page=99` 수동 확인 필요)
- 에러 화면 런타임 동작

저장소에 store·selector·컴포넌트 렌더 테스트가 없어(vitest 환경이 `node`, jsdom·testing-library 미설치) 이번 변경의 안전망은 타입 검사와 빌드뿐이었다. 테스트 환경 추가는 새 의존성이 필요해 임의로 넣지 않았다. 상태 테스트는 설계 문서 §7의 Advanced-D 후보다.
