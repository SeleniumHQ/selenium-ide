module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest": true,
    "webextensions": true
  },
  "extends": ["eslint:recommended"],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "class-property"
  ],
  "rules": {
    "no-trailing-spaces": [
      "error"
    ],
    "no-multiple-empty-lines": [
      "error",
      { "max": 2, "maxEOF": 1 }
    ],
    "eol-last": [
      "error",
      "always"
    ],
    "comma-dangle": [
      "error",
      "never"
    ],
    "indent": [
      "error",
      2,
      { "SwitchCase": 1 }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-console": [
      0
    ],
    "no-var": [
      "error"
    ]
  }
};
