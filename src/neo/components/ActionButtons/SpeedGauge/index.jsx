/*eslint-disable react/prop-types*/
import React from "react";
import PropTypes from "prop-types";
import ActionButton from "../ActionButton";
import classNames from "classnames";
import "./style.css";

export default class SpeedGaugeButton extends React.Component {
  static propTypes = {
    speed: PropTypes.number
  };
  static defaultProps = {
    speed: 6
  };
  render() {
    return (
      <ActionButton data-tip="<p>Speed gauge</p>" {...this.props} className={classNames(`si-gauge-${this.props.speed}`, this.props.className)}>
        <i className="si-caret" />
      </ActionButton>
    );
  }
}
