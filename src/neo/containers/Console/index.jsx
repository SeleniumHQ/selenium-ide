import React from "react";
import TabBar from "../../components/TabBar";
import LogList from "../../components/LogList";
import ClearButton from "../../components/ActionButtons/Clear";
import "./style.css";

export default class Console extends React.Component {
  render() {
    return (
      <footer className="console">
        <TabBar tabs={["Log"]} tabWidth={70}>
          <ClearButton />
        </TabBar>
        <LogList />
      </footer>
    );
  }
}
