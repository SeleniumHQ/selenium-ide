import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class TabBar extends React.Component {
  static propTypes = {
    tabs: PropTypes.array.isRequired
  };
  render() {
    return (
      <ul className="tabbar">
        {this.props.tabs.map((tab) => (
          <li key={tab}>
            <a href="#">{tab}</a>
          </li>
        ))}
      </ul>
    );
  }
}
