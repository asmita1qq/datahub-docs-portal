// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'DataHub API Portal',
  tagline: 'Internal Data Catalog & Metrics Reference Guide',
  url: 'https://github.io', 
  baseUrl: '/datahub-docs-portal/',    
  onBrokenLinks: 'throw',
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
        specPath: "datahub-api.yaml", 
        outputDir: "docs/api",        
      },
    ],
  ],

  themes: ["docusaurus-theme-openapi-docs"],
};

module.exports = config;
