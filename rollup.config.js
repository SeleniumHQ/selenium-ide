import babel from "rollup-plugin-babel";

export default {
  format: "umd",
  moduleName: "selenium-ide",
  entry: "src/setup.js",
  dest: "build",
  plugins: [
    babel({
      exclude: ["node_modules/**"]
    })
  ]
};
