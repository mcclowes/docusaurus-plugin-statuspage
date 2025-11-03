export type StatuspagePluginOptions = {
  /**
   * Base Statuspage URL, e.g. "https://acme.statuspage.io" (no trailing slash required).
   */
  statuspageUrl: string
  /**
   * Whether the banner should be enabled. Defaults to true.
   */
  enabled?: boolean
  /**
   * Where to position the banner. Defaults to "bottom-left".
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  /**
   * Optional link text shown in the banner. Defaults to "View status".
   */
  linkLabel?: string
}

export type StatuspageGlobalData = {
  statuspageUrl: string
  position: NonNullable<StatuspagePluginOptions['position']>
  linkLabel: NonNullable<StatuspagePluginOptions['linkLabel']>
}

