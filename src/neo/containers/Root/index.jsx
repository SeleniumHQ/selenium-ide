import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";

import Panel from "../Panel";

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById("root")
  );
};

render(Panel);

if (module.hot) {
  module.hot.accept("../Panel/index.jsx", () => {
    const NextRootContainer = require("../Panel").default;
    render(NextRootContainer);
  });
}
