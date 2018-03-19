/* eslint-disable */
var fs = require("fs");
var path = require("path");
var selianize = require("../packages/selianize").default;
var list = process.argv.slice(2);
list.forEach(filePath => {
  var file = JSON.parse(fs.readFileSync(path.join("examples", filePath)).toString());
  selianize(file).then(test => {
    fs.writeFileSync(path.join("webdriver", file.name + ".test.js"), test);
  });
});
