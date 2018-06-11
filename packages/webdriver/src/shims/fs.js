const fs = require("fs");
fs.existsSync = (file) => {
  console.log("fs.existsSync: " + file);
  return false;
};

