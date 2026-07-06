# 3주차 — 학습 정리 (관심사 분리 & Custom Hook)

리팩토링 착수 전, 강의 자료 + 참고 링크 + Q&A로 다진 개념 정리.

## 1. 진행 상황 요약

- 대상: `src/productList/ProductListPage.tsx` (약 500줄, UI·비즈니스 로직·API 혼재)
- API 레이어 결정: axios 미도입 (새 의존성 + `_mockApi.ts`가 `window.fetch`만 가로채서 axios 쓰면 mock이 깨짐) → **네이티브 `fetch` 기반 `services/httpClient.ts` + `services/productService.ts`**
- Custom Hook 추출 후보: `useProducts`(서버 상태), `useProductFilters`, `useProductSearch`(디바운스 필요), `usePagination`, `useWishlist`, `useRecentlyViewed`
  - `viewMode`는 `useState` 하나뿐이라 Hook으로 안 빼도 됨 (오버 추상화)
- 발견한 잠재 버그: fetch effect에 `ignore` 플래그가 없어 **race condition** 위험 (mock API가 300~600ms 랜덤 지연을 줘서 재현하기 쉬움). 과제 명시 버그 3종(①URL 상태 복원 미구현 ②재시도 ③과도한 요청)과 별개로 추가 발견.

## 2. 상태 3분할

| 분류 | 판별 기준 | 예시 |
|---|---|---|
| 서버 상태 | 원본이 브라우저 밖(서버)에 있음. 비동기로만 얻고, loading/error가 따라붙고, 낡을 수 있음 | `products`, `totalCount` |
| 클라이언트 상태 | 원본이 애초에 브라우저 안에만 있음. `localStorage`에 저장돼도(`wishlist`) 원본이 서버가 아니면 클라이언트 상태 | `category`, `page`, `wishlist` |
| 파생값 | state로 만들지 말고 렌더 중 계산 | `totalPages`, `discountRate` |

## 3. Custom Hook

- Hook은 **stateful logic을 재사용**하는 것이지 **state 자체를 공유**하는 게 아님
  - 단, 이건 Hook 내부가 `useState`/`useReducer`일 때 얘기. `useContext`나 외부 store를 감싼 Hook은 실제로 공유됨
  - 공유 여부는 "Hook이냐 아니냐"가 아니라 **상태가 물리적으로 어디 사는가**로 결정됨
- 추출 기준: 재사용 여부, 테스트 필요 여부, **"useEffect를 쓸 때마다 Hook으로 감싸는 걸 고려하라"**(react.dev), 이름이 한 문장으로 설명되는가
- 이름 규칙(`use` + 대문자)은 ESLint(`eslint-plugin-react-hooks`)가 강제하는 규칙이지 스타일 문제가 아님

## 4. useEffect

- "상태 바뀌면 실행"이 아니라 **React 바깥 외부 시스템과 동기화**하는 도구
- 렌더 함수는 몇 번이든 불려도 안전해야(순수) 하므로, 네트워크 요청 같은 부작용은 useEffect로 격리
- fetch를 직접 다룰 때 **`ignore` 플래그 없으면 race condition** — 우리 스타터 코드가 정확히 이 문제를 갖고 있음
- 의존성 배열엔 객체 통째로 넣지 말고 원시값으로 풀어써야 함
- Strict Mode의 setup→cleanup→setup 이중 실행은 정상 동작(버그 아님)

## 5. 서버 상태 관리 도구 (TanStack Query 등)

- **도구 선택(TanStack Query 쓰나 마나)과 레이어 분리(service/hook/component 나누나 마나)는 완전히 독립적인 축**
- MobX는 "여러 컴포넌트 간 상태 공유" 문제를 풀지, "서버 데이터 캐싱/재요청/중복제거" 문제를 풀지는 않음 — 서로 다른 축의 도구

## 6. SRP (단일 책임 원칙)

- "변경"의 의미 = 런타임 리렌더링이 아니라, **시간이 지나 요구사항이 바뀌어 개발자가 소스 코드를 다시 여는 사건**
- 판별 공식: **"[기능]은 → [책임]을 위해 존재한다"** 문장이 성립하는지 (Samsung 블로그, 심장 예시)
- 로버트 마틴의 재정의: **"모듈은 하나의 액터(이해관계자)에만 책임진다"**
  - 진짜 사이드이펙트는 "변수끼리 참조해서 깨지냐"가 아니라 "한 액터의 변경 요청이 다른 액터의 영역까지 건드리게 되냐"
- 최종 분리 기준: **"이 로직이, 화면이 1도 안 바뀌어도(렌더링과 무관하게) 독자적인 이유로 바뀔 수 있는가?"**
  - `canCancel`(정책, 별도 액터) → 뺀다
  - `isSelected = selectedId === order.id`(렌더링 자체와 뗄 수 없음) → 안에 둬도 됨
- 함수로 빼도 **런타임 동작은 100% 동일** — 달라지는 건 나중에 이 코드를 열 때 얼마나 좁은 범위만 보면 되는가(테스트 가능성/재사용성/git diff 범위)
- Trade-off도 인정됨(맥가이버 칼/MVP 비유) — 병합이 항상 위반은 아니고, 의식하고 있는지와 나중에 뺄 경계가 있는지가 중요

## 7. DIP (의존성 역전 원칙)

- SRP가 "나누는" 원칙이라면 DIP는 "나눠놓은 것끼리 어떻게 연결되는가"의 원칙
- SRP를 지켜도(파일이 분리돼 있어도) DIP는 위반 가능
  - 예: `useOrderList`가 이미 별도 Hook 파일인데도 `axios.get('/api/v1/orders')`에 직접 의존하면 DIP 위반
  - `orderService.getOrders()`라는 안정적 창구에 의존해야 API 스펙/구현체가 바뀌어도 수정 지점이 좁아짐

## 8. DRY / WET / AHA

- DRY(중복 금지) vs WET(3번째부터 금지) 모두 극단적
- **AHA(성급한 추상화 피하기)**: "잘못된 추상화보다 차라리 중복이 낫다"(Sandi Metz). 진짜 공통점이 "저절로 드러날 때" 그때 추상화
- SRP 위반(뭉쳐야 할 게 안 나뉨)과 성급한 추상화(나뉘어야 할 게 억지로 합쳐짐)는 **같은 질문("같은 이유로 바뀌나?")의 반대 방향**

## 9. 참고자료 핵심 요지

| 자료 | 핵심 요지 |
|---|---|
| Kent C. Dodds - AHA Programming | 중복 허용하고, 진짜 공통점 드러날 때 추상화 |
| react.dev - Custom Hooks | Hook은 로직만 공유, state는 공유 안 됨(내부가 useState일 때) |
| usehooks-ts v3 마이그레이션 | 실제 라이브러리가 `useEffectOnce` 등을 "불필요한 추상화"로 제거. `useDebounce`도 `useDebounceValue`/`useDebounceCallback`으로 이름을 더 명확히 쪼갬 |
| Bulletproof React 프로젝트 구조 | 지금 할 레이어 구조는 FSD로 가는 중간 단계. `market/`·`productList/`처럼 이미 기능별로 나뉜 최상위 폴더끼리는 서로 import 안 하는 게 원칙 |
| react.dev - useEffect 레퍼런스 | fetch에 `ignore` 플래그 필수(race condition 방지) — 지금 스타터 코드에 없는 실제 버그 |
| react.dev - React Compiler | 메모이제이션만 자동화, 관심사 분리는 대신 안 해줌. 이 프로젝트엔 미설치 |
| Samsung 블로그 - SRP 이야기 | 액터 테스트, "기능은 책임을 위해 존재한다" 공식, 트레이드오프 인정, 책임의 프랙탈(함수→객체→모듈) |
