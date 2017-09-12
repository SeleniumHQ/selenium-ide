import babel from "rollup-plugin-babel";

export default {
  format: "umd",
  moduleName: "selenium-ide",
  dest: "build",
  plugins: [
    babel({
      exclude: ["node_modules/**"]
    })
  ]
};
