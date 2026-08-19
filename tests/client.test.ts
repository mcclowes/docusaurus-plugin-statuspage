// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const SUMMARY_URL = 'https://acme.statuspage.io/api/v2/summary.json'

function injectMeta(attrs: Record<string, string> = {}) {
  const meta = document.createElement('meta')
  meta.setAttribute('name', 'docusaurus-statuspage')
  meta.setAttribute('data-statuspage-url', 'https://acme.statuspage.io')
  meta.setAttribute('data-position', attrs.position ?? 'bottom-left')
  meta.setAttribute('data-link-label', attrs.linkLabel ?? 'View status')
  document.head.appendChild(meta)
}

function mockSummary(body: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function loadClientModule() {
  vi.resetModules()
  return import('../src/client/index')
}

async function flush() {
  // checkAndRender is scheduled via setTimeout(0) (jsdom has no requestIdleCallback)
  await new Promise((r) => setTimeout(r, 0))
  await Promise.resolve()
  await new Promise((r) => setTimeout(r, 0))
}

const banner = () => document.querySelector('[data-statuspage-banner]')

describe('client module', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('exposes onRouteDidUpdate as a named export (the lifecycle Docusaurus dispatches)', async () => {
    const mod = await loadClientModule()
    expect(typeof mod.onRouteDidUpdate).toBe('function')
    // Docusaurus resolves `module.default?.[name] ?? module[name]`; a default export
    // that is a *function* would shadow nothing but also provide nothing.
    expect((mod as { default?: unknown }).default).toBeUndefined()
  })

  it('renders a banner when the status indicator is not none', async () => {
    injectMeta()
    const fetchMock = mockSummary({
      status: { indicator: 'minor', description: 'Partial System Outage' },
      incidents: [],
    })
    const mod = await loadClientModule()
    mod.onRouteDidUpdate()
    await flush()

    expect(fetchMock).toHaveBeenCalledWith(SUMMARY_URL, { credentials: 'omit' })
    const el = banner()
    expect(el).not.toBeNull()
    expect(el?.textContent).toContain('Partial System Outage')
    expect(el?.querySelector('a')?.getAttribute('href')).toBe('https://acme.statuspage.io')
  })

  it('links to the first incident shortlink when incidents are present', async () => {
    injectMeta()
    mockSummary({
      status: { indicator: 'major', description: 'Major outage' },
      incidents: [{ id: 'abc123', shortlink: 'https://stspg.io/abc123' }],
    })
    const mod = await loadClientModule()
    mod.onRouteDidUpdate()
    await flush()

    expect(banner()?.querySelector('a')?.getAttribute('href')).toBe('https://stspg.io/abc123')
  })

  it('does not render a banner when everything is operational', async () => {
    injectMeta()
    mockSummary({
      status: { indicator: 'none', description: 'All Systems Operational' },
      incidents: [],
    })
    const mod = await loadClientModule()
    mod.onRouteDidUpdate()
    await flush()

    expect(banner()).toBeNull()
  })

  it('does not render when the meta tag is missing', async () => {
    const fetchMock = mockSummary({ status: { indicator: 'minor' } })
    const mod = await loadClientModule()
    mod.onRouteDidUpdate()
    await flush()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(banner()).toBeNull()
  })

  it('only checks once even if the route updates repeatedly', async () => {
    injectMeta()
    const fetchMock = mockSummary({ status: { indicator: 'minor', description: 'Degraded' } })
    const mod = await loadClientModule()
    mod.onRouteDidUpdate()
    mod.onRouteDidUpdate()
    mod.onRouteDidUpdate()
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(document.querySelectorAll('[data-statuspage-banner]')).toHaveLength(1)
  })

  it('dismissing persists per incident and suppresses the banner on reload', async () => {
    injectMeta()
    const summary = {
      status: { indicator: 'minor', description: 'Degraded' },
      incidents: [{ id: 'inc-1', shortlink: 'https://stspg.io/inc-1' }],
    }
    mockSummary(summary)
    let mod = await loadClientModule()
    mod.onRouteDidUpdate()
    await flush()
    ;(banner()?.querySelector('button') as HTMLButtonElement).click()
    expect(banner()).toBeNull()
    expect(JSON.parse(localStorage.getItem('statuspage-dismissed-banners') ?? '[]')).toEqual([
      'incident-inc-1',
    ])

    // "Reload": fresh module state, same incident -> stays dismissed
    mockSummary(summary)
    mod = await loadClientModule()
    mod.onRouteDidUpdate()
    await flush()
    expect(banner()).toBeNull()

    // New incident -> banner shows again
    mockSummary({ ...summary, incidents: [{ id: 'inc-2', shortlink: 'https://stspg.io/inc-2' }] })
    mod = await loadClientModule()
    mod.onRouteDidUpdate()
    await flush()
    expect(banner()).not.toBeNull()
  })

  it('swallows fetch failures silently', async () => {
    injectMeta()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const mod = await loadClientModule()
    mod.onRouteDidUpdate()
    await flush()

    expect(banner()).toBeNull()
  })
})
