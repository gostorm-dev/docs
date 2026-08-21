import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'go-storm',
  description: 'The Load Tester That Tells Truth',
  base: '/docs/',
  lang: 'en',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/docs/logo.png' }]
  ],

  themeConfig: {
    siteTitle: false,

    logo: '/logo.png',
    nav: [
      { text: 'Guide', link: '/guide/installation' },
      { text: 'Reference', link: '/reference/default-behaviors' },
      { text: 'Help', link: '/help/troubleshooting' },
      { text: 'GitHub', link: 'https://github.com/gostorm-dev/go-storm' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Quick Start', link: '/guide/quickstart' }
        ]
      },
      {
        text: 'Guides',
        items: [
          { text: 'CLI Reference', link: '/guide/cli-reference' },
          { text: 'Load Testing Basics', link: '/guide/load-testing-basics' },
          { text: 'HTTP Methods', link: '/guide/http-methods' },
          { text: 'Output Formats', link: '/guide/output-formats' },
          { text: 'Generator Health', link: '/guide/generator-health' },
          { text: 'Distributed Mode', link: '/guide/distributed-mode' },
          { text: 'Monitoring', link: '/guide/monitoring' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Default Behaviors', link: '/reference/default-behaviors' },
          { text: 'JSON Schema', link: '/reference/json-schema' },
          { text: 'Exit Codes', link: '/reference/exit-codes' }
        ]
      },
      {
        text: 'Help',
        items: [
          { text: 'Troubleshooting', link: '/help/troubleshooting' },
          { text: 'FAQ', link: '/help/faq' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/gostorm-dev/go-storm' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 go-storm'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3]
    }
  }
})
