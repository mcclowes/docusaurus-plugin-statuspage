// This file is bundled into the client. Keep it light.
let initialized = false

const DISMISSED_BANNERS_KEY = 'statuspage-dismissed-banners'

type StatuspageSummary = {
  status?: { indicator?: string; description?: string }
  incidents?: Array<{ id?: string; name?: string; shortlink?: string; status?: string }>
}

function generateBannerId(data: StatuspageSummary, hasIncidents: boolean): string {
  // Use incident ID if available, otherwise create ID from status
  if (hasIncidents && data.incidents?.[0]?.id) {
    return `incident-${data.incidents[0].id}`
  }
  // For general degradation, use indicator + description hash
  const indicator = data?.status?.indicator || 'none'
  const description = data?.status?.description || ''
  return `status-${indicator}-${simpleHash(description)}`
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

function isDismissed(bannerId: string): boolean {
  try {
    const dismissed = localStorage.getItem(DISMISSED_BANNERS_KEY)
    if (!dismissed) return false
    const dismissedList = JSON.parse(dismissed) as string[]
    return dismissedList.includes(bannerId)
  } catch {
    return false
  }
}

function addDismissed(bannerId: string): void {
  try {
    const dismissed = localStorage.getItem(DISMISSED_BANNERS_KEY)
    let dismissedList: string[] = []
    if (dismissed) {
      dismissedList = JSON.parse(dismissed) as string[]
    }
    if (!dismissedList.includes(bannerId)) {
      dismissedList.push(bannerId)
      localStorage.setItem(DISMISSED_BANNERS_KEY, JSON.stringify(dismissedList))
    }
  } catch {
    // localStorage may not be available (private browsing, etc.)
  }
}

function createBannerContainer(position: string) {
  const container = document.createElement('div')
  container.setAttribute('data-statuspage-banner', 'true')
  container.setAttribute('role', 'status')
  container.setAttribute('aria-live', 'polite')
  container.style.position = 'fixed'
  container.style.zIndex = '9999'
  container.style.maxWidth = '420px'
  container.style.boxSizing = 'border-box'

  const [v, h] = position.split('-')
  const inset = '16px'
  if (v === 'top') container.style.top = inset
  else container.style.bottom = inset
  if (h === 'right') container.style.right = inset
  else container.style.left = inset

  return container
}

function renderBanner(
  container: HTMLElement,
  message: string,
  linkHref: string,
  linkLabel: string,
  bannerId: string
) {
  const wrapper = document.createElement('div')
  wrapper.style.background = 'var(--ifm-color-emphasis-200, #f9f9fb)'
  wrapper.style.border = '1px solid var(--ifm-color-emphasis-300, #e5e7eb)'
  wrapper.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'
  wrapper.style.borderRadius = '8px'
  wrapper.style.padding = '12px 14px'
  wrapper.style.display = 'flex'
  wrapper.style.alignItems = 'center'
  wrapper.style.gap = '8px'
  wrapper.style.color = 'var(--ifm-font-color-base, #111827)'
  wrapper.style.fontSize = '14px'

  const dot = document.createElement('span')
  dot.style.display = 'inline-block'
  dot.style.width = '10px'
  dot.style.height = '10px'
  dot.style.borderRadius = '50%'
  dot.style.background = '#f59e0b' // amber for degraded
  dot.setAttribute('aria-hidden', 'true')

  const text = document.createElement('span')
  text.textContent = message
  text.style.flex = '1'

  const link = document.createElement('a')
  link.href = linkHref
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.textContent = linkLabel
  link.style.whiteSpace = 'nowrap'
  link.style.fontWeight = '600'
  link.style.color = 'var(--ifm-color-primary, #2563eb)'
  link.style.textDecoration = 'underline'

  const close = document.createElement('button')
  close.type = 'button'
  close.setAttribute('aria-label', 'Dismiss status notice')
  close.textContent = '×'
  close.style.border = 'none'
  close.style.background = 'transparent'
  close.style.cursor = 'pointer'
  close.style.fontSize = '18px'
  close.style.lineHeight = '1'
  close.style.padding = '0 0 0 6px'
  close.onclick = () => {
    addDismissed(bannerId)
    container.remove()
  }

  wrapper.appendChild(dot)
  wrapper.appendChild(text)
  wrapper.appendChild(link)
  wrapper.appendChild(close)
  container.appendChild(wrapper)
}

async function checkAndRender() {
  const meta = document.querySelector(
    'meta[name="docusaurus-statuspage"]'
  ) as HTMLMetaElement | null
  if (!meta) return
  const baseUrl = meta.getAttribute('data-statuspage-url') || ''
  if (!baseUrl) return
  const position = meta.getAttribute('data-position') || 'bottom-left'
  const linkLabel = meta.getAttribute('data-link-label') || 'View status'

  try {
    const response = await fetch(`${baseUrl}/api/v2/summary.json`, { credentials: 'omit' })
    if (!response.ok) return
    const data = (await response.json()) as StatuspageSummary
    const indicator = data?.status?.indicator || 'none'
    const hasIncidents = Array.isArray(data?.incidents) && data!.incidents!.length > 0
    if (indicator === 'none' && !hasIncidents) return

    // Generate unique ID for this banner
    const bannerId = generateBannerId(data, hasIncidents)

    // Check if this specific banner has been dismissed
    if (isDismissed(bannerId)) {
      return
    }

    const message = data?.status?.description || 'Some services are degraded'
    const linkHref =
      hasIncidents && data!.incidents![0]?.shortlink ? data!.incidents![0]!.shortlink! : baseUrl

    const container = createBannerContainer(position)
    renderBanner(container, message, linkHref, linkLabel, bannerId)
    document.body.appendChild(container)
  } catch {
    // Fail silently
  }
}

export function onClientEntry() {
  if (initialized) return
  initialized = true
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  // Run after initial paint
  window.requestIdleCallback?.(checkAndRender) || setTimeout(checkAndRender, 0)
}
