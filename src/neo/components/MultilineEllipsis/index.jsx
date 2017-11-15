import React from "react";
import PropTypes from "prop-types";

export default class MultilineEllipsis extends React.Component {
  render() {
    return (
      <span style={{
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        position: "relative",
        lineHeight: "1.2",
        overflow: "hidden",
        textOverflow: "ellipsis",
        padding: "0",
        margin: "0",
        WebkitLineClamp: this.props.lines,
        maxHeight: `calc(1em * 1.2 * ${this.props.lines})`
      }}>
        {this.props.children}
      </span>
    );
  }
  static propTypes = {
    children: PropTypes.node,
    lines: PropTypes.number.isRequired
  };
}
