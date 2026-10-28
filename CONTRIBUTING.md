# Contributing

Thanks for helping with Selenium IDE! By contributing, you agree to follow the
[code of conduct](https://github.com/SeleniumHQ/.github/blob/trunk/CODE_OF_CONDUCT.md).

## What lives where

- `trunk`: Selenium IDE v4. This is the desktop app (`packages/selenium-ide`),
  `selenium-side-runner` (`packages/side-runner`), code export
  (`packages/side-code-export` and `packages/code-export-*`) and the shared libraries.
- `v3`: the Selenium IDE browser extension.

## Reporting issues and asking questions

Search the [issue tracker](https://github.com/SeleniumHQ/selenium-ide/issues) first.
If nobody has reported it yet, open a new issue with one of the templates.
A `.side` project file that shows the problem helps a lot.

For questions, use the [Selenium chat rooms](https://www.selenium.dev/support/).
The issue tracker is for bugs and feature proposals.

## Development

You need [Node.js](https://nodejs.org/) 24 (the version CI uses) and pnpm.
The pnpm version is pinned in `package.json` (`packageManager`). If you have
[Corepack](https://nodejs.org/api/corepack.html) or a recent pnpm, it picks the right version for you.

Fork the repo, then clone it:

```
git clone https://github.com/your-username/selenium-ide.git
cd selenium-ide
```

### Building

```
pnpm -r i
npm run build
```

`npm run build` compiles the TypeScript packages and bundles the app with webpack.

Start the app:

```
npm start
```

`npm run dev` starts it with development tools turned on.

### Testing

```
npm test
```

`npm test` runs the unit tests, the `selenium-side-runner` tests against `tests/examples/*.side`,
an IDE smoke test that records a click, and a code export check. The tests use a
small local site on port 8080, which the scripts start for you.
Chrome and Firefox must be installed. Selenium Manager downloads the drivers.

CI runs the same tests on Linux, Windows and macOS for every pull request.

## Sending a pull request

For bigger changes, open an issue first so we can agree on the approach.
For small fixes, a pull request is fine.

1. Create a branch from `trunk`.
2. Keep the pull request to one topic.
3. Make sure the build and tests pass.
4. Fill in the pull request template and reference the issues it fixes.

Thank you for contributing!
