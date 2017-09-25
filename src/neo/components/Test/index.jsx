import React from "react";
import PropTypes from "prop-types";

export default class Test extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired
  };
  render() {
    return (
      <a>{this.props.name}</a>
    );
  }
}
