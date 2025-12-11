import { jest } from '@jest/globals'
import pluginStatuspage from '../src/plugin'
import type { StatuspagePluginOptions, StatuspageGlobalData } from '../src/types'

// Create a minimal context that satisfies the plugin's needs
const createContext = (overrides = {}) => ({
  siteDir: '/tmp/test-site',
  generatedFilesDir: '/tmp/test-site/.docusaurus',
  siteConfig: {} as any,
  siteConfigPath: '/tmp/test-site/docusaurus.config.js',
  outDir: '/tmp/test-site/build',
  baseUrl: '/',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    currentLocale: 'en',
    path: 'i18n',
    localeConfigs: {},
  },
  codeTranslations: {},
  siteVersion: '0.1.0',
  localizationDir: '/tmp/test-site/i18n',
  siteStorage: {} as any,
  currentBundler: 'webpack' as const,
  ...overrides,
})

describe('pluginStatuspage', () => {
  const defaultOptions: StatuspagePluginOptions = {
    statuspageUrl: 'https://example.statuspage.io',
  }

  describe('plugin initialization', () => {
    it('should return a plugin object with correct name', () => {
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      expect(plugin.name).toBe('docusaurus-plugin-statuspage')
    })

    it('should have required plugin methods', () => {
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      expect(typeof plugin.loadContent).toBe('function')
      expect(typeof plugin.contentLoaded).toBe('function')
      expect(typeof plugin.getClientModules).toBe('function')
      expect(typeof plugin.injectHtmlTags).toBe('function')
    })
  })

  describe('loadContent', () => {
    it('should return global data with default options', async () => {
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      const content = await plugin.loadContent!()

      expect(content).toEqual({
        statuspageUrl: 'https://example.statuspage.io',
        position: 'bottom-left',
        linkLabel: 'View status',
      })
    })

    it('should strip trailing slash from URL', async () => {
      const plugin = pluginStatuspage(createContext() as any, {
        statuspageUrl: 'https://example.statuspage.io/',
      })
      const content = await plugin.loadContent!()

      expect(content?.statuspageUrl).toBe('https://example.statuspage.io')
    })

    it('should respect custom position option', async () => {
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        position: 'top-right',
      })
      const content = await plugin.loadContent!()

      expect(content?.position).toBe('top-right')
    })

    it('should respect custom linkLabel option', async () => {
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        linkLabel: 'Check status',
      })
      const content = await plugin.loadContent!()

      expect(content?.linkLabel).toBe('Check status')
    })

    it('should return undefined when disabled', async () => {
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        enabled: false,
      })
      const content = await plugin.loadContent!()

      expect(content).toBeUndefined()
    })

    it('should return undefined when statuspageUrl is missing', async () => {
      const plugin = pluginStatuspage(createContext() as any, {} as StatuspagePluginOptions)
      const content = await plugin.loadContent!()

      expect(content).toBeUndefined()
    })
  })

  describe('contentLoaded', () => {
    it('should call setGlobalData with content', async () => {
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      const content = await plugin.loadContent!()
      const setGlobalData = jest.fn()

      await plugin.contentLoaded!({
        content,
        actions: { setGlobalData } as any,
      })

      expect(setGlobalData).toHaveBeenCalledWith(content)
    })

    it('should not call setGlobalData when content is undefined', async () => {
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        enabled: false,
      })
      const content = await plugin.loadContent!()
      const setGlobalData = jest.fn()

      await plugin.contentLoaded!({
        content,
        actions: { setGlobalData } as any,
      })

      expect(setGlobalData).not.toHaveBeenCalled()
    })
  })

  describe('getClientModules', () => {
    it('should return client module path when enabled', () => {
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      const modules = plugin.getClientModules!()

      expect(modules).toHaveLength(1)
      expect(modules[0]).toContain('client')
    })

    it('should return empty array when disabled', () => {
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        enabled: false,
      })
      const modules = plugin.getClientModules!()

      expect(modules).toEqual([])
    })

    it('should return empty array when statuspageUrl is missing', () => {
      const plugin = pluginStatuspage(createContext() as any, {} as StatuspagePluginOptions)
      const modules = plugin.getClientModules!()

      expect(modules).toEqual([])
    })
  })

  describe('injectHtmlTags', () => {
    it('should inject meta tag with configuration', () => {
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      const content: StatuspageGlobalData = {
        statuspageUrl: 'https://example.statuspage.io',
        position: 'bottom-left',
        linkLabel: 'View status',
      }
      const tags = plugin.injectHtmlTags!({ content })

      expect(tags).toEqual({
        headTags: [
          {
            tagName: 'meta',
            attributes: {
              name: 'docusaurus-statuspage',
              'data-statuspage-url': 'https://example.statuspage.io',
              'data-position': 'bottom-left',
              'data-link-label': 'View status',
            },
          },
        ],
      })
    })

    it('should strip trailing slash in meta tag', () => {
      const plugin = pluginStatuspage(createContext() as any, {
        statuspageUrl: 'https://example.statuspage.io/',
      })
      const content: StatuspageGlobalData = {
        statuspageUrl: 'https://example.statuspage.io',
        position: 'bottom-left',
        linkLabel: 'View status',
      }
      const tags = plugin.injectHtmlTags!({ content })
      const headTags = tags.headTags as Array<{
        tagName: string
        attributes: Record<string, string>
      }>

      expect(headTags?.[0]?.attributes?.['data-statuspage-url']).toBe(
        'https://example.statuspage.io'
      )
    })

    it('should return empty object when disabled', () => {
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        enabled: false,
      })
      const tags = plugin.injectHtmlTags!({ content: undefined as any })

      expect(tags).toEqual({})
    })

    it('should return empty object when statuspageUrl is missing', () => {
      const plugin = pluginStatuspage(createContext() as any, {} as StatuspagePluginOptions)
      const tags = plugin.injectHtmlTags!({ content: undefined as any })

      expect(tags).toEqual({})
    })
  })
})
