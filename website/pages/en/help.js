/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')

const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

function Help(props) {
  const { config: siteConfig, language = '' } = props
  const { baseUrl, docsUrl } = siteConfig
  const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`
  const langPart = `${language ? `${language}/` : 'en/'}`
  const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`

  const supportLinks = [
    {
      content: `Find what you're looking for in our detailed documentation and guides.\n\n- Learn how to [get started](${docUrl(
        'introduction/getting-started'
      )}) with Selenium IDE.\n\n- Learn how to [use selenium-side-runner](${docUrl(
        'introduction/command-line-runner'
      )}).\n\n- View the [glossary of commands](${docUrl('api/commands')})`,
      title: 'Browse Docs',
    },
    {
      content:
        'Ask questions and find answers from other Selenium IDE users like you.\n\n- Join the #selenium channel on [IRC](https://webchat.freenode.net/).\n\n- Or the [Slack](https://seleniumhq.herokuapp.com/) alternative for our community.',
      title: 'Join the community',
    },
    {
      content: `Find out what's new with Selenium IDE.\n\n- Follow [Dave](https://twitter.com/tourdedave) and [Tomer](https://twitter.com/corevous) on Twitter.\n\n- Read the [Selenium IDE blog](${baseUrl}blog/).\n\n- Read the [release notes](https://github.com/SeleniumHQ/selenium-ide/releases) on GitHub.`,
      title: 'Stay up to date',
    },
  ]

  return (
    <div className="docMainWrapper wrapper">
      <Container className="mainContainer documentContainer postContainer">
        <div className="post">
          <header className="postHeader">
            <h1>Need help?</h1>
          </header>
          <p>
            This project is maintained by the{' '}
            <a href="https://www.seleniumhq.org/">Selenium organization</a>. We
            often lurk around on GitHub, IRC and Twitter.
          </p>
          <GridBlock contents={supportLinks} layout="threeColumn" />
        </div>
      </Container>
    </div>
  )
}

module.exports = Help
