import React from "react";
import "./style.css";

export default class VerticalTabbar extends React.Component {
  static defaultProps = {
    buttonsMargin: 5
  };
  render() {
    return (
      <div className="tabbar vertical">
        <div>
          <ul>
            {this.props.tabs.map((tab, index) => (
              <li key={tab}>
                <a href="#">{tab}</a>
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
