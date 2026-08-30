// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'DataHub API Portal',
  tagline: 'Internal Data Catalog & Metrics Reference Guide',
  url: 'https://asmita1qq.github.io', 
  baseUrl: '/datahub-docs-portal/',    
  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          docItemComponent: "@theme/ApiItem", 
          routeBasePath: '/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: "api",
        docsPluginId: "classic",
        // 📦 All schema locations must be nested inside this required wrapper!
        config: {
          datahub: {
            specPath: "datahub-api.yaml", // Points to your typed specification file
            outputDir: "docs/api",        // Where output file nodes generate
          }
        }
      },
    ],
  ],



  themes: ["docusaurus-theme-openapi-docs"],
  themeConfig: {
  navbar: {
    title: 'DataHub Portal',
    items: [
      {
        type: 'docSidebar',
        sidebarId: 'tutorialSidebar',
        position: 'left',
        label: 'Guides & Reference',
      },
    ],
  },
  },

};

module.exports = config;
