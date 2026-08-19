export type StatuspagePluginOptions = {
  /**
   * Base Statuspage URL, e.g. "https://acme.statuspage.io" (no trailing slash required).
   */
  statuspageUrl: string
  /**
   * Whether the banner should be enabled. Defaults to true.
   * Tip: `enabled: process.env.NODE_ENV === 'production'` keeps it out of local dev.
   */
  enabled?: boolean
  /**
   * Where to position the banner. Defaults to "bottom-left".
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  /**
   * Optional link text shown in the banner. Defaults to "View status".
   * Ignored when `linkMode` is "banner".
   */
  linkLabel?: string
  /**
   * Text prepended to the status description, e.g. "API status: ". Defaults to "".
   */
  messagePrefix?: string
  /**
   * "label" (default): the status text plus a separate "View status" link.
   * "banner": the whole banner is the link (no separate label).
   */
  linkMode?: 'label' | 'banner'
  /**
   * Which Statuspage endpoint to poll. Defaults to "summary".
   * "summary" (/api/v2/summary.json) includes incidents, so the banner can deep-link to the
   * active incident. "status" (/api/v2/status.json) is a much smaller payload with the overall
   * indicator only; the banner then links to the status page itself.
   */
  endpoint?: 'summary' | 'status'
}

export type StatuspageGlobalData = {
  statuspageUrl: string
  position: NonNullable<StatuspagePluginOptions['position']>
  linkLabel: NonNullable<StatuspagePluginOptions['linkLabel']>
  messagePrefix: NonNullable<StatuspagePluginOptions['messagePrefix']>
  linkMode: NonNullable<StatuspagePluginOptions['linkMode']>
  endpoint: NonNullable<StatuspagePluginOptions['endpoint']>
}
