module.exports = {
  "presets": [
    ["@babel/preset-env",
      {
        "targets": {
          "node": "8"
        }
      }]
  ],
  "plugins": [
    "@babel/plugin-proposal-object-rest-spread",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
}
