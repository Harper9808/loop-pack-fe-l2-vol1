# Loopers Pack — Frontend L2 Vol.1

Loopers 프론트엔드 과정(TypeScript · React · Next.js)의 과제 제출 & 피드백 레포입니다.

## 시작하기

```bash
pnpm install
pnpm dev
```

> React 19 + Vite + TypeScript 기반입니다. (1~3주차 React, 4주차부터 Next.js로 전환 예정)

## 주차별 과제

- [1주차 — 코드 리뷰 & AI 협업 환경 구축](docs/assignments/week-01.md)

## 새 주차 과제 받기

각 주차 과제는 이 메인 레포에 업데이트됩니다. 새 과제가 올라오면 **본인 포크의 `main`을 이 레포(upstream)와 동기화**해 받으세요.

- 간단히: 포크한 GitHub 레포 페이지의 **Sync fork** 버튼.
- CLI: `git remote add upstream https://github.com/loopers-labs/loop-pack-fe-l2-vol1.git` 등록 후 `git fetch upstream && git switch main && git merge upstream/main`.

## 제출

1. 이 레포를 **포크**한다.
2. 포크에서 작업 브랜치를 만든다 (예: `feat/week-01`).
3. 과제를 진행하고 커밋·푸시한다 (본인 포크에).
4. **메인 레포로 PR**을 연다 (base: 메인 레포의 `main` ← compare: 본인 포크의 작업 브랜치). PR 템플릿(이번 주 학습 / 피드백 받고 싶은 부분)을 채운다.
5. 모든 PR이 메인 레포 한곳에 모이므로 **서로의 PR을 리뷰**하고, 코치 피드백 + 다음 세션 구두 방어로 이어진다.

> PR은 **메인 레포(upstream)로** 올립니다 — 모두의 PR이 한곳에 모여 서로 리뷰할 수 있습니다. (협력자 추가는 필요 없습니다.)

## 3주차 제출 요약

`ProductListPage`를`components/hooks/services/utils` 레이어로 분리하고, 숨은 버그 3종(URL 상태 복원·재시도·과도한 요청)을 포함해 총 6건을 확인·기록했습니다.

- 관심사 분류표, Hook별 한 줄 근거, 분리하지 않은 것의 근거, 버그별 재현·원인·수정 내역 → [https://github.com/Harper9808/loop-pack-fe-l2-vol1/tree/Harper9808/docs/week-03-refactor-notes.md](docs/week-03-refactor-notes.md)
