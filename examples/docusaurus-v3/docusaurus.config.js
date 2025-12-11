import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

// Import the plugin from parent directory
const pluginStatuspage = require('../../dist/index.cjs').default

/** @type {import('@docusaurus/types').Config} */
export default {
  title: 'Statuspage Plugin Example',
  url: 'https://example.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'example',
  projectName: 'statuspage-example-site',
  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: path.resolve(__dirname, './sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: path.resolve(__dirname, './src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      pluginStatuspage,
      /** @type {import('docusaurus-plugin-statuspage').StatuspagePluginOptions} */
      ({
        // Using GitHub's statuspage as an example (it often has incidents)
        statuspageUrl: 'https://www.githubstatus.com',
        position: 'bottom-left',
        linkLabel: 'View status',
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Statuspage Example',
        items: [{ to: '/docs/intro', label: 'Docs', position: 'left' }],
      },
      footer: {
        style: 'dark',
        copyright: `Example site for docusaurus-plugin-statuspage`,
      },
    }),
}
