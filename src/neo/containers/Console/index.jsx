import React from "react";
import PropTypes from "prop-types";
import TabBar from "../../components/TabBar";
import LogList from "../../components/LogList";
import ClearButton from "../../components/ActionButtons/Clear";
import LogStore from "../../stores/view/Logs";
import "./style.css";

export default class Console extends React.Component {
  constructor(props) {
    super(props);
    this.store = new LogStore();
  }
  componentWillUnmount() {
    this.store.dispose();
  }
  render() {
    return (
      <footer className="console" style={{
        height: this.props.height ? `${this.props.height}px` : "initial"
      }}>
        <TabBar tabs={["Log"]} tabWidth={70}>
          <ClearButton onClick={this.store.clearLogs} />
        </TabBar>
        <LogList store={this.store} />
      </footer>
    );
  }
  static propTypes = {
    height: PropTypes.number
  };
}
