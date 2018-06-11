require("./shims/process");
require("./shims/fs");
const webdriver = require("selenium-webdriver");

let d = new webdriver.Builder().forBrowser("chrome").usingServer("http://localhost:4444/wd/hub").build();
d.then(driver => {
  console.log("loaded!");
  driver.get("https://google.com").catch(console.error);
  driver.getTitle().then(console.log);
  driver.quit().then(() => {
    console.log("finished");
  });
}).catch(console.error);
