import React from "react";
import TabBar from "../../components/TabBar";
import "./style.css";

export default class Console extends React.Component {
  render() {
    return (
      <footer className="console">
        <TabBar tabs={["Log", "Reference", "UI-Element", "Rollup"]} />
      </footer>
    );
  }
}
