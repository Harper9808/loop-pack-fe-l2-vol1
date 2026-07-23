# Loopers Pack — Frontend L2 Vol.1

Loopers 프론트엔드 과정(TypeScript · React · Next.js)의 과제 제출 & 피드백 레포입니다.
4주차부터 이 레포가 **커머스 프로젝트(Next.js)** 본체가 됩니다.

## 시작하기

필수 도구는 Node.js 24.17.0과 pnpm 10.15.1입니다. `.nvmrc`는 현재 권장 LTS를 고정하고, `package.json`의 Node.js 범위(`>=22.12.0`)는 지원 가능한 Node.js 22 이상을 허용합니다.

```bash
nvm use
pnpm install
pnpm dev
```

`pnpm test`는 전체 Vitest 테스트가 통과해야 완료됩니다. `pnpm check`는 테스트, lint, 타입 검사, 프로덕션 빌드를 순서대로 실행하며 네 단계가 모두 통과해야 완료됩니다. GitHub Actions도 pull request와 `main` push에서 같은 `pnpm check`를 실행합니다.

> Next.js(App Router) + React 19 + TypeScript. (1~3주차 React+Vite 산출물은 각자 개인 브랜치 히스토리에 있습니다.)

## 구조 (최소 골격)

```
src/
  app/                     # Next App Router
    api/products/route.ts  # mock 백엔드 (route handler)
    layout.tsx  page.tsx
  components/
    ui/
      select/              # Select (Headless) — 4주차 1단계
      dialog/              # Dialog (Compound) — 4주차 2단계
docs/assignments/          # 주차별 과제 명세
```

> 폴더 구성은 최소한만 잡아뒀습니다. 구조 개선은 **각자 근거를 대고** 진행하세요.

## 주차별 과제

- 과제 명세는 `docs/assignments/week-0N.md` 에 있습니다.
- 새 과제가 올라오면 **본인 포크의 `main`을 이 레포(upstream)와 동기화**해 받으세요.
  - GitHub: 포크 레포의 **Sync fork** 버튼
  - CLI: `git fetch upstream && git switch main && git merge upstream/main`

## 제출

1. 이 레포를 **포크**한다.
2. 포크에서 주차 작업 브랜치를 만든다 (예: `feat/week-04`).
3. 과제를 진행하고 커밋·푸시한다 (본인 포크에).
4. **메인 레포로 PR**을 연다. PR 템플릿(이번 주 학습 / 피드백 받고 싶은 부분)을 채운다.
5. 모든 PR이 한곳에 모이므로 서로 리뷰하고, 코치 피드백 + 다음 세션 구두 방어로 이어진다.

## 3주차 제출 요약

`ProductListPage`를`components/hooks/services/utils` 레이어로 분리하고, 숨은 버그 3종(URL 상태 복원·재시도·과도한 요청)을 포함해 총 6건을 확인·기록했습니다.

- 관심사 분류표, Hook별 한 줄 근거, 분리하지 않은 것의 근거, 버그별 재현·원인·수정 내역 → [https://github.com/Harper9808/loop-pack-fe-l2-vol1/tree/Harper9808/docs/week-03-refactor-notes.md](docs/week-03-refactor-notes.md)

## 상태 소유권 표 (5주차 0단계)

> 도구를 먼저 고르지 않고 **원본(Source of Truth)** 을 먼저 정한다. "이 상태의 원본은 어디에 있나 / 언제까지 살아야 하나 / 누가 공유하나"를 판단한 뒤 도구가 따라온다.

| 상태                                           | 소유자(원본)                                         | 수명                        | 공유 범위                             | 선택 이유                                                                                                                                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------- | --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 홈 데이터 (배너·카테고리·인기·신상품)          | **서버** — TanStack Query (`/api/home`)              | staleTime 5분 · gcTime 5분  | 홈 화면                               | 서버가 원본, 화면은 스냅샷. 머천다이징이라 저빈도 변경·실시간 불필요 → staleTime 길게.                                                                                                                                          |
| 목록 데이터 (products·totalCount·page)         | **서버** — TanStack Query (`/api/products`)          | staleTime 0 · gcTime 5분    | 목록 화면                             | 서버 원본. 완전 품절 상품은 서버가 목록에서 제외하므로 **멤버십 자체가 서버 재고에 따라 변동** → 항상 재검증(기본값 0). 재요청 낭비가 뚜렷하지 않으면 staleTime을 올리지 않는다. gcTime 캐시로 즉시 페인트(SWR)라 UX 손해 없음. |
| 검색어 `q`·카테고리·정렬·페이지                | **URL** — nuqs (`useQueryStates`)                    | 브라우저 히스토리           | 링크 공유·새로고침·앞뒤 이동으로 복원 | 공유·복원돼야 하는 값이라 원본은 URL. useState/Zustand는 새로고침·공유·히스토리 복원이 불가.                                                                                                                                    |
| 장바구니·위시리스트 상품                       | **클라이언트** — Zustand (`cartIds`·`wishIds`, id만) | 세션 (새로고침 초기화 허용) | 홈·목록·헤더                          | 서버 API 없음(비회원) + 공유값 아님 + 여러 페이지가 함께 씀 → 컴포넌트 바깥 전역. 서버 `Product`를 복사하지 않고 id만 저장.                                                                                                     |
| 헤더의 장바구니·위시 개수                      | _(파생)_ — `cartIds.length` / `wishIds.length`       | 저장 안 함 (매번 계산)      | —                                     | id 목록에서 계산되는 파생값. 별도 저장하면 이중 관리로 언젠가 어긋남.                                                                                                                                                           |
| 제출 전 검색어 초안 · 일시적 UI (모달 열림 등) | **컴포넌트** — React `useState`                      | 컴포넌트 수명               | 해당 컴포넌트                         | 공유·복원이 불필요한 임시값. 제출 시 URL로 커밋(입력마다 URL 갱신하는 debounce는 Advanced).                                                                                                                                     |
| 로딩·에러·빈 결과                              | _(파생)_ — Query status                              | 저장 안 함 (매번 계산)      | —                                     | Query가 조회 생명주기를 소유. `isPending` / `isError` / `data.products.length === 0`에서 파생하며 빈 결과와 에러는 다른 화면. 직접 `useState`로 관리하면 desync.                                                                |

**설계 근거 보충**

- **staleTime 대비 (홈 5분 ↔ 목록 0)**: 홈은 안정적 머천다이징 + 홈 재방문마다 같은 `['home']`을 재관찰하므로 불필요 재요청을 막으려 올린다. 목록은 완전 품절 시 서버가 제외해 멤버십이 변동하고 뚜렷한 재요청 낭비 패턴도 없으므로 기본값 0으로 항상 재검증한다. "staleTime은 재요청이 실제로 아까울 때만 올린다"는 원칙에 따라 두 화면을 다르게 둔 것.
- **품절 제외 / 할인 포함**: `stock`은 **사이즈별 재고**(30개 중 p1만 의미 있고 전체 품절 상품 0개)라 목록이 아니라 상세·사이즈 선택의 개념이며, 완전 품절 처리는 서버(원본)의 책임. 반면 `originalPrice`는 fixture가 할인 표시 분기 연습용으로 의도한 상품 단위 값이라 목록 카드에서 렌더 시점에 할인율을 **파생**해 표시.
- **파생값 원칙**: 개수·담김/찜 여부·할인율·로딩/에러/빈은 저장하지 않고 원본에서 계산. 반복되는 `isInCart`/`isWished`는 selector 훅으로 캡슐화, 일회성 `length`는 인라인 selector.
