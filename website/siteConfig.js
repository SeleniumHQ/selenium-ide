/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const _users = [
  {
    caption: '',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/docusaurus.svg'.
    image: '',
    infoLink: '',
    pinned: true,
  },
]

const siteConfig = {
  title: 'Selenium IDE', // Title for your website.
  tagline: 'Open source record and playback test automation for the web',
  url: 'https://seleniumhq.github.io', // Your website URL
  baseUrl: '/selenium-ide/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'selenium-ide',
  organizationName: 'seleniumhq',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'getting-started', label: 'Docs' },
    { doc: 'commands', label: 'API' },
    { page: 'help', label: 'Help' },
    { blog: true, label: 'Blog' },
  ],

  // If you have users set above, you add it here:
  //users,

  /* path to images for header/footer */
  headerIcon: 'img/selenium-ide128.png',
  footerIcon: 'img/selenium-ide64.png',
  favicon: 'img/selenium-ide32.png',

  /* Colors for website */
  colors: {
    primaryColor: '#143569',
    secondaryColor: '#205cbb',
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Software Freedom Conservancy (SFC)`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/selenium-ide128.png',
  twitterImage: 'img/selenium-ide128.png',

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/seleniumhq/selenium-ide',

  gaTrackingId: 'UA-80983440-3',
  useEnglishUrl: true,
}

module.exports = siteConfig
