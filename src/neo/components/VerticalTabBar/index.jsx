import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class VerticalTabbar extends React.Component {
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
  handleClick(tab) {
    this.setState({
      activeTab: { tab }
    });
    if (this.props.tabChanged) this.props.tabChanged(tab);
  }
  render() {
    return (
      <div className="tabbar vertical">
        <div>
          <ul>
            {this.props.tabs.map((tab) => (
              <li key={tab}>
                <a href="#" onClick={this.handleClick.bind(this, tab)}>{tab}</a>
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
