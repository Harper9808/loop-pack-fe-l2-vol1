# eslint-config-next 룰, 그대로 켤지 골라서 켤지

## 결론

`@next/next/*` 21개 중 9개만 켜고 12개는 끈다. `react`/`react-hooks`/`jsx-a11y` recommended는 `core-web-vitals` 프리셋에 같이 번들돼 있어서 그대로 유지한다(따로 뗄 수 없고, 뗄 이유도 없음).

## 계기

레거시 `ProductCard.tsx`(3주차 Vite 코드, 아직 미마이그레이션)에 `<img>` 태그가 남아있었는데, `pnpm lint`를 돌리자마자 이런 경고가 떴다.

```
src/product/components/ProductCard.tsx
  46:9  warning  Using `<img>` could result in slower LCP ...
  @next/next/no-img-element
```

일반 `eslint:recommended`나 `typescript-eslint`는 `<img>`를 문제 삼지 않는다 — 유효한 React 코드니까. 이걸 잡은 건 `eslint-config-next`가 끼워넣은 Next 전용 플러그인이다. 그럼 이 플러그인 안에 정확히 뭐가 더 있는지, 켜둘 가치가 있는지 없는지 직접 확인해봤다.

## 조사

`eslint-config-next`가 `core-web-vitals.js`에서 어떻게 조립되는지 소스를 직접 열어봤다 (`node_modules/.pnpm/eslint-config-next@16.2.10.../dist/core-web-vitals.js`). 이 프리셋은 두 조각을 이어붙인 것이었다:

1. `./index` — `react`, `react-hooks`, `jsx-a11y`, `import` 플러그인의 recommended 룰
2. `@next/eslint-plugin-next`의 `configs['core-web-vitals']` — 진짜 Next 전용 룰 21개

1번은 계속 필요하다(`rules-of-hooks` 등). 2번만 따로 뽑아서 룰 이름과 심각도를 실제로 출력해봤다:

```js
const plugin = require('@next/eslint-plugin-next');
console.log(plugin.configs['core-web-vitals'].rules);
```

이 21개를 하나씩 "지금 이 프로젝트에서 실제로 걸릴 수 있는가"로 나눴다.

## 켬 / 끔

**켬 (9개) — App Router 코드에서 실제로 발동 가능**

- `no-img-element` — 방금 실증됨
- `no-async-client-component` — `'use client'` 파일을 `async function`으로 짜는 실수. 이번 주에 Select/Dialog 클라이언트 컴포넌트를 여러 개 만들 거라 바로 관련 있음
- `no-html-link-for-pages`, `no-sync-scripts`, `inline-script-id`, `no-css-tags`, `no-head-element`, `no-typos`, `no-assign-module-variable` — App Router 어디서든 걸릴 수 있는 일반 실수

**끔 (12개) — 검사 대상 자체가 없음**

- `no-document-import-in-page`, `no-duplicate-head`, `no-head-import-in-document`, `no-script-component-in-head`, `no-styled-jsx-in-document`, `no-title-in-document-head`, `no-page-custom-font`, `no-before-interactive-script-outside-document` — 전부 `pages/_document.tsx`를 검사 대상으로 삼는 룰인데, 이 프로젝트는 App Router만 쓰고 그 파일이 아예 없다. 대상이 없는 룰을 켜두는 건 "혹시 몰라서"가 아니라 그냥 죽은 설정이라 끈다.
- `google-font-display`, `google-font-preconnect`, `next-script-for-ga`, `no-unwanted-polyfillio` — 구글 폰트/GA/polyfill.io를 실제로 붙였을 때만 의미 있는 룰. 지금 안 쓰니 끄고, 나중에 붙이면 그때 켠다.

## AI 활용 메모

룰 21개 목록 추출과 소스 조사, 켬/끔 분류 초안은 AI(Claude)가 수행했다. "안 쓰는 건 미리 켜두지 말고 필요할 때 켠다"는 판단 기준 자체는 사용자가 지시했고, 최종 켬/끔 목록은 사용자가 검토했다.
