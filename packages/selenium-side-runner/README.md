# Selenium SIDE Runner
Runs exported Selenium IDE tests in command line

## Installation
Node.js is required to use `selenium-side-runner`.  
The project guarantees support for the [active LTS major version](https://github.com/nodejs/Release) (e.g. [8](https://nodejs.org/en/download/) & [10](https://nodejs.org/en/download/current/)).  

```yarn global add selenium-side-runner```  
or  
```npm install -g selenium-side-runner```  

## Usage
```selenium-side-runner project.side project2.side *.side```

### Passing capabilities
```selenium-side-runner -c "browserName=chrome platform=MAC"```

#### Passing nested capabilities
```selenium-side-runner -c "chromeOptions.binary='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'"```

#### Chrome specific list capabilities (headless)
```selenium-side-runner -c "chromeOptions.args=[disable-infobars, headless]"```

### Running on remote WebDriver server
```selenium-side-runner --server http://localhost:4444/wd/hub```

### Filter tests
Will only run tests matching the filter
```selenium-side-runner --filter mytest```

### Changing the base URL
Change the base URL that the tests were recorded with, note that it will not affect tests that used absolute URLs.
```selenium-side-runner --base-url https://www.seleniumhq.org```

### .side.yml
All of the configuration can be written in the `.side.yml` file, the runner will load it from the current working directory automatically.
You can disable that behavior with `--no-sideyml`.  

#### Example usage
```yaml
capabilities:
  browserName: "firefox"
baseUrl: "https://www.seleniumhq.org"
server: "http://localhost:4444/wd/hub"
```

### Advanced features

#### Running on multiple workers
Running tests faster through the use of multiple workers  
```selenium-side-runner -w 4```  
The runner will automatically set the number of workers to the amount of cores available, for most cases this is the best result.  
**Note:** unless you specified that a suite is parallel, it will still run the contained tests sequentially, though the runner will run suites in parallel by default.  
To mark a suite's tests as parallel, set that in the suite's settings in the IDE.

### FAQ

#### I'm getting an error similar to `Unknown locator ${vars.something}`
When running your projects make sure that the command is aware of the locator strategy **before** variables are evaluated.  
For example `click | id=${myButton}` vs `click | ${idOfMyButton}`.  
Always use the first one, since the strategy is hardcoded in the command, the second would yield an error.  

>But it works in the IDE.  

That is because the IDE calculates locator strategies differently than the runner, it is a known current issue.
