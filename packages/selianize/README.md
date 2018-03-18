# Selianize
Exports Selenium IDE projects (.side) to executable javascript code

## Usage
```javascript
import selianize from "./path/to/selianize";

const file = JSON.parse(fs.readFileSync("project.side").toString());
selianize(file).then(test => { // code
  fs.writeFileSync(file.name + ".test.js", test);
});
```
