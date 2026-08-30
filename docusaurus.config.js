// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'DataHub API Portal',
  tagline: 'Internal Data Catalog & Metrics Reference Guide',
  url: 'https://github.io', 
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
        // 📦 Wrap everything inside this required config container!
        config: {
          datahub: {
            specPath: "datahub-api.yaml", // Points to your typed Swagger file
            outputDir: "docs/api",        // Where web components generate
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
