import babel from "rollup-plugin-babel";
import pkg from "./package.json";

const externalDependencies = ["js-beautify", "js-string-escape"];
export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // the `targets` option which can specify `dest` and `format`)
  {
    input: "src/index.js",
    external: externalDependencies,
    output: [
      { file: pkg.main, format: "cjs" }
    ],
    plugins: [
      babel({
        exclude: ["node_modules/**"]
      })
    ]
  },
  {
    input: "src/index.js",
    external: externalDependencies,
    output: [
      { file: pkg.module, format: "es" }
    ],
    plugins: [
      babel({
        exclude: ["node_modules/**"]
      })
    ]
  }
];
