import { expect, test } from '@playwright/test'
import {
  recordProductApiCalls,
  saveObservation,
  snapshot,
  type Snapshot,
} from './observe'

// 2단계가 요구하는 여섯 화면 중, 전환 스펙(week07-product-list-before)이 다루지 않는
// 나머지를 관측한다 — 성공+0건 · 최초 실패 · 갱신 실패.
//
// 실패는 앱 코드를 고치지 않고 page.route로 응답만 가로채 재현한다.
// 4xx를 쓰는 이유: 5xx는 queryOptions의 throwOnError가 route error 경계로 보내
// 페이지 안 화면이 아니라 error.tsx가 뜬다(그것도 의도된 분리다).

const SLOW_DELAY_MS = 1500
const SETTLE_MS = 5000
const REAL_GRID = '.week05-grid:not([aria-hidden="true"])'

test.describe('목록 나머지 화면 관측 (scenario=slow)', () => {
  test('5. 성공 + 0건 — 조건과 0개임을 확정해 보여주는가', async ({
    page,
  }, info) => {
    const start = Date.now()
    const t0 = (): number => Date.now() - start
    const calls = recordProductApiCalls(page, t0)
    const snapshots: Snapshot[] = []

    await page.goto('/products')
    await expect(page.locator(REAL_GRID)).toBeVisible({ timeout: SETTLE_MS })

    // 어떤 상품 이름·브랜드에도 없는 검색어
    await page.getByLabel('검색').fill('존재하지않는상품명zzz')
    await page.getByLabel('검색').press('Enter')
    await page.waitForTimeout(SLOW_DELAY_MS + 800)

    const empty = await snapshot(page, '빈 결과 확정', t0())
    snapshots.push(empty)

    await saveObservation(info, {
      calls,
      snapshots,
      emptyText: empty.emptyText,
    })

    // 오류가 아니라 "빈 결과"로 보여야 한다.
    expect(empty.emptyText).not.toBeNull()
    expect(empty.statusText).toBeNull()
  })

  test('6. 최초 실패 — 목록 대신 이유와 재시도를 보여주는가', async ({
    page,
  }, info) => {
    const start = Date.now()
    const t0 = (): number => Date.now() - start
    const calls = recordProductApiCalls(page, t0)
    const snapshots: Snapshot[] = []

    await page.route('**/api/products**', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: '요청 조건을 확인해주세요.' }),
      }),
    )

    await page.goto('/products')
    await page.waitForTimeout(SETTLE_MS)
    const failed = await snapshot(page, '최초 실패', t0())
    snapshots.push(failed)

    await saveObservation(info, { calls, snapshots })

    // 보여줄 목록이 없으므로 목록 자리를 오류가 대신한다.
    expect(failed.statusText).not.toBeNull()
    expect(failed.listVisible).toBe(false)
  })

  test('7. 갱신 실패 — 기존 목록을 유지한 채 알리는가', async ({
    page,
  }, info) => {
    const start = Date.now()
    const t0 = (): number => Date.now() - start
    const calls = recordProductApiCalls(page, t0)
    const snapshots: Snapshot[] = []

    // 첫 조회는 정상으로 통과시키고, 그다음 갱신부터 실패시킨다.
    let servedOnce = false
    await page.route('**/api/products**', async (route) => {
      if (!servedOnce) {
        servedOnce = true
        await route.continue()
        return
      }
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: '요청 조건을 확인해주세요.' }),
      })
    })

    await page.goto('/products')
    await expect(page.locator(REAL_GRID)).toBeVisible({ timeout: SETTLE_MS })
    snapshots.push(await snapshot(page, '갱신 전 (목록 있음)', t0()))

    await page.getByLabel('카테고리').selectOption('fashion')
    await page.waitForTimeout(SETTLE_MS)
    const failed = await snapshot(page, '갱신 실패 후', t0())
    snapshots.push(failed)

    await saveObservation(info, { calls, snapshots })

    // 목록은 남아 있고, 실패는 인라인으로 알린다.
    expect(failed.listVisible).toBe(true)
    expect(failed.inlineErrorVisible).toBe(true)
  })
})
