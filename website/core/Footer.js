/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl
    const docsUrl = this.props.config.docsUrl
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`
    const langPart = `${language ? `${language}/` : 'en/'}`
    return `${baseUrl}${docsPart}${langPart}${doc}`
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl
    return baseUrl + (language ? `${language}/` : '') + doc
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="64"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a
              href={this.docUrl(
                'introduction/getting-started',
                this.props.language
              )}
            >
              Getting Started
            </a>
            <a href={this.docUrl('api/commands', this.props.language)}>
              API Reference
            </a>
            <a
              href={this.docUrl(
                'plugins/plugins-getting-started',
                this.props.language
              )}
            >
              Build a Plugin
            </a>
          </div>
          <div>
            <h5>Community</h5>
            <a
              href="https://seleniumhq.herokuapp.com/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Slack
            </a>
            <a
              href="https://webchat.freenode.net/"
              target="_blank"
              rel="noreferrer noopener"
            >
              irc (#selenium)
            </a>
            <a
              href="https://groups.google.com/forum/#!forum/selenium-users"
              target="_blank"
              rel="noreferrer noopener"
            >
              Google group
            </a>
          </div>
          <div>
            <h5>More</h5>
            <a href={`${this.props.config.baseUrl}blog`}>Blog</a>
            <a
              href={this.props.config.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub
            </a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/seleniumhq/selenium-ide/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a>
            <a href={`${this.props.config.baseUrl}legacy`}>Legacy IDE</a>
          </div>
        </section>
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    )
  }
}

module.exports = Footer
