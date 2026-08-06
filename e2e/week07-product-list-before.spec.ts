import { expect, test } from '@playwright/test'
import {
  recordProductApiCalls,
  saveObservation,
  snapshot,
  type Snapshot,
} from './observe'

// 목록(slow)의 화면 전환 관측 — 0단계 Before와 2단계 After를 같은 계기로 잰다.
//
// 목적은 통과/실패가 아니라 "무엇이 보였는가"를 재현 가능하게 남기는 것이다.
// 그래서 단정(expect)은 관측을 깨뜨리지 않는 최소한만 쓰고, 나머지는 기록으로 남긴다.
// 산출물: 테스트별 video(webm) + trace(zip) + observation.json.

const SLOW_DELAY_MS = 1500
// 1.5초 응답이 끝나기 전에 다음 조건을 밀어넣어야 "이전 요청이 늦게 끝나는" 상황이 재현된다.
const RAPID_CHANGE_INTERVAL_MS = 300
const SETTLE_MS = 5000

// 스켈레톤도 .week05-grid를 쓰므로 실제 결과만 고른다.
const REAL_GRID = '.week05-grid:not([aria-hidden="true"])'

test.describe('목록 화면 전환 관측 (scenario=slow)', () => {
  test('1. 최초 진입 — 보여줄 데이터가 없는 상태', async ({ page }, info) => {
    const start = Date.now()
    const t0 = (): number => Date.now() - start
    const calls = recordProductApiCalls(page, t0)
    const snapshots: Snapshot[] = []

    await page.goto('/products')
    // 응답 전에 무엇이 보이는가 — 이게 "최초 진입" 화면이다.
    snapshots.push(await snapshot(page, 'API 응답 전', t0()))

    await expect(page.locator(REAL_GRID)).toBeVisible({ timeout: SETTLE_MS })
    snapshots.push(await snapshot(page, 'API 응답 후', t0()))

    await saveObservation(info, { calls, snapshots })
  })

  test('2. 기존 목록 갱신 — 필터(카테고리) 변경', async ({ page }, info) => {
    const start = Date.now()
    const t0 = (): number => Date.now() - start
    const calls = recordProductApiCalls(page, t0)
    const snapshots: Snapshot[] = []

    await page.goto('/products')
    await expect(page.locator(REAL_GRID)).toBeVisible({ timeout: SETTLE_MS })
    snapshots.push(await snapshot(page, '갱신 전 (목록 있음)', t0()))

    await page.getByLabel('카테고리').selectOption('fashion')
    // 갱신 요청 직후 — 기존 목록이 남는가, 지워지는가?
    await page.waitForTimeout(200)
    snapshots.push(await snapshot(page, '갱신 요청 직후', t0()))

    await page.waitForTimeout(SLOW_DELAY_MS)
    snapshots.push(await snapshot(page, '갱신 완료 후', t0()))

    await saveObservation(info, { calls, snapshots })
  })

  test('3. 기존 목록 갱신 — 페이지 이동', async ({ page }, info) => {
    const start = Date.now()
    const t0 = (): number => Date.now() - start
    const calls = recordProductApiCalls(page, t0)
    const snapshots: Snapshot[] = []

    await page.goto('/products')
    await expect(page.locator(REAL_GRID)).toBeVisible({ timeout: SETTLE_MS })
    snapshots.push(await snapshot(page, '이동 전 (1페이지)', t0()))

    // getByRole의 name은 기본이 부분 일치라 '2'가 카드 쪽 버튼에도 걸린다.
    // 페이지네이션으로 스코프를 좁히고 exact로 잠근다.
    await page
      .locator('.week05-pagination')
      .getByRole('button', { name: '2', exact: true })
      .click()
    // 관측이 비어 있는 채로 조용히 통과하지 않도록, 이동이 실제로 일어났는지 먼저 잠근다.
    await expect(page).toHaveURL(/[?&]page=2\b/)

    await page.waitForTimeout(200)
    snapshots.push(await snapshot(page, '이동 요청 직후', t0()))

    await page.waitForTimeout(SLOW_DELAY_MS)
    snapshots.push(await snapshot(page, '이동 완료 후', t0()))

    await saveObservation(info, { calls, snapshots })
  })

  test('4. 빠른 연속 변경 — URL 정합성과 취소 관측', async ({ page }, info) => {
    const start = Date.now()
    const t0 = (): number => Date.now() - start
    const calls = recordProductApiCalls(page, t0)
    const snapshots: Snapshot[] = []

    await page.goto('/products')
    await expect(page.locator(REAL_GRID)).toBeVisible({ timeout: SETTLE_MS })

    // 각 응답(1.5초)이 끝나기 전에 다음 조건을 넣어 이전 요청을 "늦게 끝나게" 만든다.
    for (const category of ['casual', 'fashion', 'goods', 'digital']) {
      await page.getByLabel('카테고리').selectOption(category)
      snapshots.push(await snapshot(page, `선택: ${category}`, t0()))
      await page.waitForTimeout(RAPID_CHANGE_INTERVAL_MS)
    }

    // 모든 요청이 끝나고도 화면이 마지막 조건과 일치하는가?
    await page.waitForTimeout(SETTLE_MS)
    const settled = await snapshot(page, '정착 후', t0())
    snapshots.push(settled)

    const finalCategory = new URL(settled.url).searchParams.get('category')
    const aborted = calls.filter((call) => call.failure !== null)

    await saveObservation(info, {
      calls,
      snapshots,
      finalCategory,
      abortedCount: aborted.length,
      abortedDetail: aborted,
    })

    // 최종 URL은 마지막 선택과 같아야 한다. 화면과의 일치는 기록으로 판단한다.
    expect(finalCategory).toBe('digital')
  })
})
