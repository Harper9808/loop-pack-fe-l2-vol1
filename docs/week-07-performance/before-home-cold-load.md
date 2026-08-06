# Before — 홈 cold load (7주차 성능)

> 측정일: 2026-08-06 · 도구: Lighthouse 12 (CLI, mobile 시뮬레이션 스로틀)
> 재현조건 커밋: `b739ac6c`

## 측정 조건 (Before/After 공통으로 고정)

| 항목 | 값 |
| --- | --- |
| 빌드 | production (`pnpm build && pnpm start`), **dev 아님** |
| URL | `http://localhost:3000/` |
| 도구 | Lighthouse 12 CLI, `--form-factor=mobile --screenEmulation.mobile=true` (기본 시뮬레이션 스로틀 = 느린 4G·4x CPU) |
| 실행 | 5회 (headless Chrome) |
| SHA | `b739ac6c` (재현조건 커밋 — 홈→`?scenario=slow`, 7.5MB `<img>` hero) |

## 재현조건 (제출물 아님, Before의 전제)

- `fetchHome()` → `/api/home?scenario=slow` (1.5s 지연)
- `HeroSection`이 `public/images/week-07/hero-original.jpg`(3840×2160, **7.5MB**)를 최적화 없이 `<img>`로 렌더

## 결과 — 5회 raw + 중앙값 + 범위

| 지표 | run1 | run2 | run3 | run4 | run5 | **중앙값** | 범위(min~max) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FCP (ms) | 949 | 921 | 912 | 919 | 915 | **919** | 912~949 |
| LCP (s) | 40.9 | 41.0 | 41.0 | 40.9 | 40.9 | **40.9** | 40.9~41.0 |
| CLS | 0.016 | 0.016 | 0.016 | 0.016 | 0.016 | **0.016** | 0.016 |
| TBT (ms) | 167 | 29 | 28 | 32 | 27 | **29** | 27~167 (run1 워밍업 outlier) |

- **LCP element**: `<img class="HeroSection-module__...__image" ... src="/images/week-07/hero-original.jpg">` = 7.5MB hero
- **Perf score**: 71

## 관찰 → 가설

1. **FCP 0.9s(셸 정상) ↔ LCP 40.9s(파국).** 간극 40초 = **7.5MB hero 이미지 전송**. (모바일 느린4G × 7.5MB ≈ 37s) + slow API 1.5s + client 게이트 뒤 발견.
2. **CLS 0.016 안정** — img에 `width/height`가 박혀 있어 손댈 게 적음.
3. **초기 HTML(curl 8.5KB)** = Header + `'불러오는 중…'`만. `<h1>`·배너·hero 참조 0 → 홈이 100% client라 의미 콘텐츠가 전부 fetch 뒤.

**가장 작은 변경 가설 (stage 1에서 검증):**
> LCP 40.9s의 대부분은 7.5MB 원본 전송이다. 실제 표시 크기에 맞는 이미지(적정 해상도·포맷·압축, `next/image`)로 바꾸면 전송량이 급감해 LCP가 크게 준다.

## 측정 신뢰 범위 (Lab vs Field)

- 5회 편차 0.1s가 낮은 건 **시뮬레이션 스로틀이 결정적**이기 때문 — "실사용자 신뢰"가 아니라 **랩 재현성**의 증거.
- 신뢰 가능: **같은 조건 Before/After 델타**. 신뢰 불가: 실사용자가 정확히 40.9s를 겪는다(그건 Field/CrUX 영역).

## 증거 파일

- HTML 리포트: `docs/week-07-performance/lh-before-home.html` (Lighthouse 시각 리포트)
- JSON 원본 5회: 측정 시 `/tmp/lh_before1~5.json` (숫자 추출 완료)
