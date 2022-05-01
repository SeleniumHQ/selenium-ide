# Selenium IDE &middot; [![Build Status](https://api.travis-ci.com/SeleniumHQ/selenium-ide.svg?branch=trunk)](https://travis-ci.com/SeleniumHQ/selenium-ide)

![logo](https://www.seleniumhq.org/selenium-ide/img/selenium-ide128.png)

_An integrated development environment for Selenium scripts_
Selenium IDE as an electron application written to enable recording and playback of selenium scripts.

## Installation

Installation can be performed in a variety of ways:

1. Prepackaged binaries will be able to be installed directly (ok not yet, but very soon)
2. The application can be built manually using the below instructions.

### Prepackaged

No binaries are available currently, as we are in the process of obtaining signing certificates.
Sorry, my bad.

### Building Manually

To build manually, you must have the below prerequisites installed and follow the steps afterward.

#### Prerequisites

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [NodeJS v16 or later](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/en/docs/install)

#### Building

1. `git clone https://github.com/SeleniumHQ/selenium-ide` - Clone the IDE repo
2. `cd selenium-ide` - Navigate into the IDE folder
3. `yarn` - Install dependencies
4. `yarn build` - Build the app
5. `yarn start` - Run the app

## What now?

Here's a draft of the general tasks ahead. Feel free to pitch in and announce which you wish to take upon yourself:

- Selectors accuracy - an option is ranking selectors - we can optimize selectors correctness and test stability by collecting as many attributes as we can per user event. The most likely properties will be used for the selectors, with fallback to the others.
- Intelligent editing
- Export to selenium code in different languages

## Contributing

If you'd like to contribute to the codebase, start by building manually using the above commands. The below tips are meant to assist you as well.

- If you'd like to iterate more quickly, `yarn watch` will facilitate near-realtime rebuilding for rapid iteration (make change -> `yarn start` -> test change)
- To activate the devtools on an page, `CommandOrControl+F12` or `CommandOrControl+Option+I` will open the devtools. For your convenience, the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en) are pre-installed in the electron environment.
- VSCode has a defined workspace structure and run command, as well as file mappings to allow for breakpoints to work across sourcemaps for the main process.
- The chrome dev tools are available at `localhost:8315` to use if the inline devtools are not enough, although I'd highly advocate for the in window dev tools, since they have the React Developer Tools installed as well.

## Questions or want to chat?

If you have questions, check out [our FAQ](https://github.com/SeleniumHQ/selenium-ide/wiki/Frequently-Asked-Questions).

You can also find us on the [#selenium](irc://freenode.net/selenium) IRC
channel, which is also available on
[Slack](https://www.selenium.dev/support/#ChatRoom).
