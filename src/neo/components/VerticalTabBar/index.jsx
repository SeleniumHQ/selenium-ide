import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class VerticalTabbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      activeTab: props.defaultTab ? {
        tab: props.defaultTab
      } : {
        tab: props.tabs[0]
      }
    };
  }
  static propTypes = {
    children: PropTypes.node,
    tabs: PropTypes.array.isRequired,
    defaultTab: PropTypes.string,
    buttonsMargin: PropTypes.number,
    tabChanged: PropTypes.func
  };
  static defaultProps = {
    buttonsMargin: 5
  };
  setActive(state) {
    this.setState({
      active: state
    });
  }
  handleClick(tab) {
    this.setState({
      active: false,
      activeTab: { tab }
    });
    if (this.props.tabChanged) this.props.tabChanged(tab);
  }
  render() {
    return (
      <div className="tabbar vertical" onMouseLeave={this.setActive.bind(this, false)}>
        <div style={{
          maxHeight: this.state.active ? `${29 * this.props.tabs.length}px` : "29px"
        }}>
          <ul>
            <li>
              <a href="#" onClick={this.setActive.bind(this, true)}>{this.state.activeTab.tab}</a>
            </li>
            {this.props.tabs.filter(tab => (tab !== this.state.activeTab.tab)).map((tab) => (
              <li key={tab}>
                <a href="#" tabIndex={this.state.active ? "0" : "-1"} onClick={this.handleClick.bind(this, tab)}>{tab}</a>
              </li>
            ))}
          </ul>
          {this.props.children ? <span className="buttons" style={{
            marginRight: `${this.props.buttonsMargin}px`
          }}>{this.props.children}</span> : null}
        </div>
      </div>
    );
  }
}
