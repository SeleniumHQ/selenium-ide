import React from "react";
import PropTypes from "prop-types";
import ListMenu, { ListMenuItem } from "../ListMenu";
import { MenuDirections } from "../Menu";
import "./style.css";

export default class VerticalTabBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
          <ListMenu direction={MenuDirections.Bottom} width={130} padding={5} opener={
            <VerticalTabBarItem focusable={true}>
              <span>{this.state.activeTab.tab}</span>
            </VerticalTabBarItem>
          }>
            {this.props.tabs.map(tab => (
              <ListMenuItem key={tab} onClick={this.handleClick.bind(this, tab)}>{tab}</ListMenuItem>
            ))}
          </ListMenu>
          {this.props.children ? <span className="buttons" style={{
            marginRight: `${this.props.buttonsMargin}px`
          }}>{this.props.children}</span> : null}
        </div>
      </div>
    );
  }
}

export class VerticalTabBarItem extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    focusable: PropTypes.bool,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func
  };
  render() {
    return (
      <a href="#" tabIndex={this.props.focusable ? "0" : "-1"} onClick={this.props.onClick}>{this.props.children}</a>
    );
  }
}
