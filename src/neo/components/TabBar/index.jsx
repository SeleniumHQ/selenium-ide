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
    children: PropTypes.node,
    tabs: PropTypes.array.isRequired,
    defaultTab: PropTypes.string,
    tabWidth: PropTypes.number,
    buttonsMargin: PropTypes.number,
    tabChanged: PropTypes.func
  };
  static defaultProps = {
    tabWidth: 80,
    buttonsMargin: 5
  };
  handleClick(tab, index) {
    this.setState({
      activeTab: { tab, index }
    });
    if (this.props.tabChanged) this.props.tabChanged(tab);
  }
  render() {
    return (
      <div className="tabbar">
        <ul>
          {this.props.tabs.map((tab, index) => (
            <li key={tab} style={{
              width: `${this.props.tabWidth}px`
            }}>
              <a href="#" onClick={this.handleClick.bind(this, tab, index)}>{tab}</a>
            </li>
          ))}
          {this.props.children ? <li className="buttons" style={{
            marginRight: `${this.props.buttonsMargin}px`
          }}>{this.props.children}</li> : null}
        </ul>
        <div className="underline" style={{
          transform: `translateX(${this.state.activeTab.index * this.props.tabWidth}px)`,
          width: `${this.props.tabWidth}px`
        }}></div>
      </div>
    );
  }
}
