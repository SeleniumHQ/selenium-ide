/*eslint-disable react/prop-types*/
import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";
import "./style.css";

export default class SpeedGaugeButton extends React.Component {
  render() {
    return (
      <ActionButton {...this.props} className={classNames("si-gauge", this.props.className)}>
        <i className="si-caret" />
      </ActionButton>
    );
  }
}
