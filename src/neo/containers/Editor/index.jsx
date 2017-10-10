import React from "react";
import ToolBar from "../../components/ToolBar";
import TabBar from "../../components/TabBar";
import TestTable from "../../components/TestTable";
import CommandForm from "../../components/CommandForm";

export default class Editor extends React.Component {
  render() {
    return (
      <main style={{
        display: "flow-root"
      }}>
        <ToolBar />
        <TestTable />
        <CommandForm />
      </main>
    );
  }
}
