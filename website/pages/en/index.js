/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// eslint-disable-next-line
const React = require('react')

// eslint-disable-next-line node/no-missing-require
const CompLibrary = require('../../core/CompLibrary.js')

const MarkdownBlock = CompLibrary.MarkdownBlock /* Used to read markdown */
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

const Button = props => (
  <div className="pluginWrapper buttonWrapper">
    <a
      className="button"
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  </div>
)

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
)

const PromoHeader = props => (
  <div className="promo">
    {props.text} Details available{' '}
    <a href={props.link} target="_blank" rel="noopener noreferrer">
      HERE
    </a>
  </div>
)

class HomeSplash extends React.Component {
  render() {
    const { siteConfig } = this.props
    const { downloadUrls } = siteConfig

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    )

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    )

    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={downloadUrls.chrome}>
              <i className="fab fa-padding fa-chrome" />
              Chrome Download
            </Button>
            <Button href={downloadUrls.firefox}>
              <i className="fab fa-padding fa-firefox" />
              Firefox Download
            </Button>
            <Button href={downloadUrls.github}>
              <i className="fas fa-padding fa-file-archive" />
              Latest zip
            </Button>
          </PromoSection>
          <a
            className="github-button"
            href={this.props.siteConfig.repoUrl}
            data-icon="octicon-star"
            data-count-href="/seleniumhq/selenium-ide/stargazers"
            data-show-count="true"
            data-count-aria-label="# stargazers on GitHub"
            aria-label="Star this project on GitHub"
          >
            Star
          </a>
        </div>
      </SplashContainer>
    )
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = '' } = this.props
    const { baseUrl, docsUrl, downloadUrls } = siteConfig
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`
    const langPart = `${language ? `${language}/` : 'en/'}`
    const _docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`

    const Block = props => (
      <Container
        className={props.className}
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}
      >
        <GridBlock contents={props.children} layout={props.layout} />
      </Container>
    )

    const Features = () => (
      <Container padding={['bottom', 'top']} background="light">
        <GridBlock
          layout="threeColumn"
          background="light"
          align="center"
          contents={[
            {
              title: 'Web Ready',
              image: `${baseUrl}img/home/computer.png`,
              imageAlt: 'computer',
              imageAlign: 'top',
              content: `Simple, turn-key solution to quickly author reliable end-to-end tests. Works out of the box for any web app.`,
            },
            {
              title: 'Easy Debugging',
              image: `${baseUrl}img/home/bullseye.png`,
              imageAlt: 'bullseye',
              imageAlign: 'top',
              content: `Enjoy easier test debugging with rich IDE features like setting breakpoints and pausing on exceptions.`,
            },
            {
              title: 'Cross-browser Execution',
              image: `${baseUrl}img/home/lightning-bolt.png`,
              imageAlt: 'lightning bolt',
              imageAlign: 'top',
              content: `Run your tests on any browser/OS combination in parallel using the [Command-line Runner for Selenium IDE](${_docUrl(
                'introduction/command-line-runner'
              )}).`,
            },
          ]}
        />
      </Container>
    )

    const FeatureCallout = () => (
      <div className="productShowcaseSection paddingBottom paddingTop">
        <h2>Ready to use IDE</h2>
        <MarkdownBlock>
          Getting started with Selenium IDE requires no additional setup other
          than installing the extension on your browser. One of our driving
          philosophies is to provide an easy to use tool that will give instant
          feedback. We believe that the easier we can make it, the more likely
          people are to author tests, which in turn results in better tested
          apps.
        </MarkdownBlock>
      </div>
    )

    const ResilientTests = () => (
      <Block background="light">
        {[
          {
            title: 'Resilient Tests',
            content:
              'Selenium IDE records multiple locators for each element it interacts with. If one locator fails during playback, the others will be tried until one is successful.',
            image: `${baseUrl}img/home/locators.png`,
            imageAlt: 'locators',
            imageAlign: 'left',
          },
        ]}
      </Block>
    )

    const TestCaseReuse = () => (
      <Block>
        {[
          {
            title: 'Test Case Reuse',
            content: `Through the use of the [run command](${_docUrl(
              'api/commands#run'
            )}), you can re-use one test case inside of another (e.g., allowing you to re-use your login logic in multiple places throughout a suite).`,
            image: `${baseUrl}img/home/run.png`,
            imageAlt: 'run',
            imageAlign: 'right',
          },
        ]}
      </Block>
    )

    const ControlFlow = () => (
      <Block background="light">
        {[
          {
            title: 'Control Flow',
            content: `Selenium IDE ships with an extensive control flow structure, with available commands like \`if\`, \`while\` and \`times\`. To learn more, check out [the Control Flow documentation](${_docUrl(
              'introduction/control-flow'
            )}).`,
            image: `${baseUrl}img/home/control-flow.png`,
            imageAlt: 'control flow',
            imageAlign: 'left',
          },
        ]}
      </Block>
    )

    const Plugins = () => (
      <Block className="center-image">
        {[
          {
            title: 'Plugins',
            content: `Selenium IDE can be extended through the use of [plugins](${_docUrl(
              'plugins/plugins-getting-started'
            )}). They can introduce new commands to the IDE or integrate with a third-party service. Write your own or install one that someone else has already written.`,
            image: `${baseUrl}img/home/plug.png`,
            imageAlt: 'plug',
            imageAlign: 'right',
          },
        ]}
      </Block>
    )

    const TryOut = () => (
      <Container padding={['bottom', 'top']} background="light">
        <div className="homeContainer">
          <div className="projectTitle">Try it out</div>
          <div>
            Download Selenium IDE for either Chrome or Firefox and get started.
          </div>
          <br />
          <PromoSection>
            <Button href={downloadUrls.chrome}>
              <i className="fab fa-padding fa-chrome" />
              Chrome Download
            </Button>
            <Button href={downloadUrls.firefox}>
              <i className="fab fa-padding fa-firefox" />
              Firefox Download
            </Button>
          </PromoSection>
        </div>
      </Container>
    )

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ))

      const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who is Using This?</h2>
          <p>This project is used by all these people</p>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl('users.html')}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      )
    }

    return (
      <React.Fragment>
        {siteConfig.promoText &&
          siteConfig.promoLink && (
            <PromoHeader
              text={siteConfig.promoText}
              link={siteConfig.promoLink}
            />
          )}
        <div>
          <HomeSplash siteConfig={siteConfig} language={language} />
          <div className="home mainContainer">
            <Features />
            <FeatureCallout />
            <ResilientTests />
            <TestCaseReuse />
            <ControlFlow />
            <Plugins />
            <TryOut />
            <Showcase />
          </div>
        </div>
      </React.Fragment>
    )
  }
}

module.exports = Index
