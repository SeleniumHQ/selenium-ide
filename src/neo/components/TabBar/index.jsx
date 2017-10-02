import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./style.css";

export default class TabBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: props.defaultTab ? props.defaultTab : props.tabs[0]
    };
  }
  static propTypes = {
    tabs: PropTypes.array.isRequired,
    defaultTab: PropTypes.string
  };
  handleClick(tab) {
    this.setState({
      activeTab: tab
    });
  }
  render() {
    return (
      <ul className="tabbar">
        {this.props.tabs.map((tab) => (
          <li key={tab}>
            <a href="#" className={classNames({"active": this.state.activeTab === tab})} onClick={this.handleClick.bind(this, tab)}>{tab}</a>
          </li>
        ))}
      </ul>
    );
  }
}
