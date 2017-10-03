import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class TabBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: props.defaultTab ? {
        tab: props.defaultTab,
        index: props.tabs.indexOf(props.defaultTab)
      } : {
        tab: props.tabs[0],
        index: 0
      }
    };
  }
  static propTypes = {
    tabs: PropTypes.array.isRequired,
    defaultTab: PropTypes.string
  };
  handleClick(tab, index) {
    this.setState({
      activeTab: { tab, index }
    });
  }
  render() {
    return (
      <div className="tabbar">
        <ul>
          {this.props.tabs.map((tab, index) => (
            <li key={tab}>
              <a href="#" onClick={this.handleClick.bind(this, tab, index)}>{tab}</a>
            </li>
          ))}
        </ul>
        <div className="underline" style={{
          transform: `translateX(${this.state.activeTab.index * 110}px)`
        }}></div>
      </div>
    );
  }
}
