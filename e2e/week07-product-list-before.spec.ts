import { writeFile } from 'node:fs/promises'
import { expect, test, type Page, type TestInfo } from '@playwright/test'

// 7주차 0단계 — 목록(slow) Before 관측.
//
// 목적은 통과/실패가 아니라 "무엇이 보였는가"를 재현 가능하게 남기는 것이다.
// 그래서 단정(expect)은 관측을 깨뜨리지 않는 최소한만 쓰고, 나머지는 기록으로 남긴다.
// 산출물: 테스트별 video(webm) + trace(zip) + 아래 JSON 관측 로그.

const SLOW_DELAY_MS = 1500
// 1.5초 응답이 끝나기 전에 다음 조건을 밀어넣어야 "이전 요청이 늦게 끝나는" 상황이 재현된다.
const RAPID_CHANGE_INTERVAL_MS = 300
const SETTLE_MS = 5000

interface ApiCall {
  search: string
  startedAtMs: number
  endedAtMs: number | null
  status: number | null
  failure: string | null
}

interface Snapshot {
  label: string
  atMs: number
  url: string
  visibleStatus: string | null
  totalCountText: string | null
  gridVisible: boolean
  ariaBusy: string | null
  cardCount: number
  emptyVisible: boolean
}

// /api/products 호출만 골라 시작·종료·실패를 기록한다.
// 취소는 requestfailed의 net::ERR_ABORTED로 드러난다 — 0건이면 취소가 안 걸린 것이다.
function recordProductApiCalls(page: Page, t0: () => number): ApiCall[] {
  const calls: ApiCall[] = []
  const find = (url: string): ApiCall | undefined =>
    calls.find((call) => call.search === new URL(url).search && !call.endedAtMs)

  page.on('request', (request) => {
    if (!request.url().includes('/api/products')) return
    calls.push({
      search: new URL(request.url()).search,
      startedAtMs: t0(),
      endedAtMs: null,
      status: null,
      failure: null,
    })
  })
  page.on('response', (response) => {
    if (!response.url().includes('/api/products')) return
    const call = find(response.url())
    if (call) {
      call.endedAtMs = t0()
      call.status = response.status()
    }
  })
  page.on('requestfailed', (request) => {
    if (!request.url().includes('/api/products')) return
    const call = find(request.url())
    if (call) {
      call.endedAtMs = t0()
      call.failure = request.failure()?.errorText ?? 'unknown'
    }
  })

  return calls
}

// 스냅샷은 "그 순간" 화면을 찍는 것이라 기다리면 안 된다.
// locator의 textContent()는 요소가 없으면 테스트 타임아웃까지 블록되므로,
// 대기가 전혀 없는 단일 evaluate로 DOM을 한 번에 읽는다.
async function snapshot(
  page: Page,
  label: string,
  atMs: number,
): Promise<Snapshot> {
  const seen = await page.evaluate(() => {
    const grid = document.querySelector('.week05-grid')
    const status = document.querySelector('.commerce-status')
    const empty = document.querySelector('.commerce-empty')
    const total = Array.from(document.querySelectorAll('p')).find((node) =>
      /^총 \d+개$/.test(node.textContent?.trim() ?? ''),
    )
    return {
      url: window.location.href,
      visibleStatus: status?.textContent?.trim() ?? null,
      totalCountText: total?.textContent?.trim() ?? null,
      gridVisible: grid !== null,
      ariaBusy: grid?.getAttribute('aria-busy') ?? null,
      cardCount: grid?.childElementCount ?? 0,
      emptyVisible: empty !== null,
    }
  })
  return { label, atMs, ...seen }
}

async function saveObservation(
  testInfo: TestInfo,
  payload: Record<string, unknown>,
): Promise<void> {
  const path = testInfo.outputPath('observation.json')
  await writeFile(path, JSON.stringify(payload, null, 2), 'utf8')
  await testInfo.attach('observation', {
    path,
    contentType: 'application/json',
  })
}

test.describe('목록 Before 관측 (scenario=slow)', () => {
  test('1. 최초 진입 — 보여줄 데이터가 없는 상태', async ({ page }, info) => {
    const start = Date.now()
    const t0 = (): number => Date.now() - start
    const calls = recordProductApiCalls(page, t0)
    const snapshots: Snapshot[] = []

    await page.goto('/products')
    // 응답 전에 무엇이 보이는가 — 이게 "최초 진입" 화면이다.
    snapshots.push(await snapshot(page, 'API 응답 전', t0()))

    await expect(page.locator('.week05-grid')).toBeVisible({
      timeout: SETTLE_MS,
    })
    snapshots.push(await snapshot(page, 'API 응답 후', t0()))

    await saveObservation(info, { calls, snapshots })
  })

  test('2. 기존 목록 갱신 — 필터(카테고리) 변경', async ({ page }, info) => {
    const start = Date.now()
    const t0 = (): number => Date.now() - start
    const calls = recordProductApiCalls(page, t0)
    const snapshots: Snapshot[] = []

    await page.goto('/products')
    await expect(page.locator('.week05-grid')).toBeVisible({
      timeout: SETTLE_MS,
    })
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
    await expect(page.locator('.week05-grid')).toBeVisible({
      timeout: SETTLE_MS,
    })
    snapshots.push(await snapshot(page, '이동 전 (1페이지)', t0()))

    // getByRole의 name은 기본이 부분 일치라 '2'가 카드 쪽 버튼에도 걸린다.
    // 페이지네이션으로 스코프를 좁히고 exact로 잠근다.
    await page
      .locator('.week05-pagination')
      .getByRole('button', { name: '2', exact: true })
      .click()
    // 관측이 비어 있는 채로 조용히 통과하지 않도록, 이동이 실제로 일어났는지 먼저 잠근다.
    await expect(page).toHaveURL(/[?&]page=2\b/)

    // 필터 변경과 달리 placeholderData가 직전 목록을 유지하도록 되어 있다 — 실제로 그런가?
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
    await expect(page.locator('.week05-grid')).toBeVisible({
      timeout: SETTLE_MS,
    })

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
