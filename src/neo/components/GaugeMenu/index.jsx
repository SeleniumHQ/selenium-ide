import React from "react";
import PropTypes from "prop-types";
import Slider from "rc-slider";
import Menu, { MenuDirections } from "../Menu";
import "rc-slider/assets/index.css";
import "./style.css";

export default class GaugeMenu extends React.Component {
  static propTypes = {
    opener: PropTypes.element,
    value: PropTypes.number.isRequired,
    maxDelay: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  };
  handleChange(value) {
    this.props.onChange(this.props.maxDelay - value);
  }
  render() {
    return (
      <Menu opener={this.props.opener} direction={MenuDirections.Bottom} closeOnClick={false} width={40} padding={0}>
        <div className="speed-gauge">
          <span>Fast</span>
          <Slider vertical included={false} min={0} max={this.props.maxDelay} value={this.props.maxDelay - this.props.value} onChange={this.handleChange.bind(this)} />
          <span>Slow</span>
        </div>
      </Menu>
    );
  }
}

