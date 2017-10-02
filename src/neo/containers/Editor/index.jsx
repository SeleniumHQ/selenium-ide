import React from "react";
import ToolBar from "../../components/ToolBar";
import TabBar from "../../components/TabBar";

export default class Editor extends React.Component {
  render() {
    return (
      <main style={{
        display: "flow-root"
      }}>
        <ToolBar />
        <TabBar tabs={["Table", "Source"]} />
      </main>
    );
  }
}
