# Selenium IDE v4

This is an electron app instrumenting the electron-chromedriver package to run
a chromedriver instance on the Electron browser.

There are three regions to the code:

1. Main: The electron process, where the NodeJS backend handles the system ops:

    * Spawning electron BrowserWindows
    * Filesystem operations
    * Persists file edit operations

2. Browser: The renderering code for the electron browser windows.

    * Project editor window
    * Project selector window
    * Playback window

3. API: The imported side-api package. This contains common code used by the
main and browser segments. This is separated out to make importing types for
plugins not require the entire dependency tree of selenium-ide, which involves electron and react and is quite extensive.
