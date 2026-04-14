import { describe, it, expect, vi } from 'vitest'
import pluginStatuspage from '../src/plugin'
import type { StatuspagePluginOptions, StatuspageGlobalData } from '../src/types'

const createContext = (overrides = {}) => ({
  siteDir: '/tmp/test-site',
  generatedFilesDir: '/tmp/test-site/.docusaurus',
  siteConfig: {} as unknown,
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
  siteStorage: {} as unknown,
  currentBundler: 'webpack' as const,
  ...overrides,
})

describe('pluginStatuspage', () => {
  const defaultOptions: StatuspagePluginOptions = {
    statuspageUrl: 'https://example.statuspage.io',
  }

  describe('plugin initialization', () => {
    it('should return a plugin object with correct name', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      expect(plugin.name).toBe('docusaurus-plugin-statuspage')
    })

    it('should have required plugin methods', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      expect(typeof plugin.loadContent).toBe('function')
      expect(typeof plugin.contentLoaded).toBe('function')
      expect(typeof plugin.getClientModules).toBe('function')
      expect(typeof plugin.injectHtmlTags).toBe('function')
    })
  })

  describe('loadContent', () => {
    it('should return global data with default options', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      const content = await plugin.loadContent!()
      expect(content).toEqual({
        statuspageUrl: 'https://example.statuspage.io',
        position: 'bottom-left',
        linkLabel: 'View status',
      })
    })

    it('should strip trailing slash from URL', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, {
        statuspageUrl: 'https://example.statuspage.io/',
      })
      const content = await plugin.loadContent!()
      expect(content?.statuspageUrl).toBe('https://example.statuspage.io')
    })

    it('should respect custom position option', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        position: 'top-right',
      })
      const content = await plugin.loadContent!()
      expect(content?.position).toBe('top-right')
    })

    it('should respect custom linkLabel option', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        linkLabel: 'Check status',
      })
      const content = await plugin.loadContent!()
      expect(content?.linkLabel).toBe('Check status')
    })

    it('should return undefined when disabled', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        enabled: false,
      })
      const content = await plugin.loadContent!()
      expect(content).toBeUndefined()
    })

    it('should return undefined when statuspageUrl is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, {} as StatuspagePluginOptions)
      const content = await plugin.loadContent!()
      expect(content).toBeUndefined()
    })
  })

  describe('contentLoaded', () => {
    it('should call setGlobalData with content', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      const content = await plugin.loadContent!()
      const setGlobalData = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await plugin.contentLoaded!({ content, actions: { setGlobalData } as any })
      expect(setGlobalData).toHaveBeenCalledWith(content)
    })

    it('should not call setGlobalData when content is undefined', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        enabled: false,
      })
      const content = await plugin.loadContent!()
      const setGlobalData = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await plugin.contentLoaded!({ content, actions: { setGlobalData } as any })
      expect(setGlobalData).not.toHaveBeenCalled()
    })
  })

  describe('getClientModules', () => {
    it('should return client module path when enabled', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, defaultOptions)
      const modules = plugin.getClientModules!()
      expect(modules).toHaveLength(1)
      expect(modules[0]).toContain('client')
    })

    it('should return empty array when disabled', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        enabled: false,
      })
      const modules = plugin.getClientModules!()
      expect(modules).toEqual([])
    })

    it('should return empty array when statuspageUrl is missing', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, {} as StatuspagePluginOptions)
      const modules = plugin.getClientModules!()
      expect(modules).toEqual([])
    })
  })

  describe('injectHtmlTags', () => {
    it('should inject meta tag with configuration', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    it('should return empty object when disabled', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, {
        ...defaultOptions,
        enabled: false,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tags = plugin.injectHtmlTags!({ content: undefined as any })
      expect(tags).toEqual({})
    })

    it('should return empty object when statuspageUrl is missing', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugin = pluginStatuspage(createContext() as any, {} as StatuspagePluginOptions)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tags = plugin.injectHtmlTags!({ content: undefined as any })
      expect(tags).toEqual({})
    })
  })
})
