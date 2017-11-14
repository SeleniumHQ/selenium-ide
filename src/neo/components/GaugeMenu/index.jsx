import React from "react";
import PropTypes from "prop-types";
import Menu from "../Menu";
import "./style.css";

export default class GaugeMenu extends React.Component {
  static propTypes = {
    opener: PropTypes.element
  };
  render() {
    return (
      <Menu opener={this.props.opener} closeOnClick={false} width={50} padding={0}>
        <div className="speed-gauge">
          <span>Fast</span>
          <input name="speed-gauge" type="range" />
          <span>Slow</span>
        </div>
      </Menu>
    );
  }
}

