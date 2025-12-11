import path from 'path'
import { fileURLToPath } from 'url'
import type { LoadContext, Plugin } from '@docusaurus/types'
import type { StatuspageGlobalData, StatuspagePluginOptions } from './types'

const pluginDirname = path.dirname(fileURLToPath(import.meta.url))

export default function pluginStatuspage(
  _context: LoadContext,
  options: StatuspagePluginOptions
): Plugin<StatuspageGlobalData | undefined> {
  const enabled = options.enabled ?? true
  const position = options.position ?? 'bottom-left'
  const linkLabel = options.linkLabel ?? 'View status'

  return {
    name: 'docusaurus-plugin-statuspage',

    async loadContent() {
      if (!enabled) return undefined
      if (!options.statuspageUrl) return undefined

      const globalData: StatuspageGlobalData = {
        statuspageUrl: options.statuspageUrl.replace(/\/$/, ''),
        position,
        linkLabel,
      }
      return globalData
    },

    async contentLoaded({ content, actions }) {
      if (!content) return
      const { setGlobalData } = actions
      setGlobalData(content)
    },

    getClientModules() {
      if (!enabled) return []
      if (!options.statuspageUrl) return []
      return [path.resolve(pluginDirname, './client')]
    },

    injectHtmlTags() {
      if (!enabled || !options.statuspageUrl) return {}
      return {
        headTags: [
          {
            tagName: 'meta',
            attributes: {
              name: 'docusaurus-statuspage',
              'data-statuspage-url': options.statuspageUrl.replace(/\/$/, ''),
              'data-position': position,
              'data-link-label': linkLabel,
            },
          },
        ],
      }
    },
  }
}
