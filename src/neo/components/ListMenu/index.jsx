import React from "react";
import PropTypes from "prop-types";
import Menu from "../Menu";
import "./style.css";

export default class ListMenu extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    opener: PropTypes.element,
    width: PropTypes.number,
    padding: PropTypes.number
  };
  render() {
    return (
      <Menu opener={this.props.opener} width={this.props.width} padding={this.props.padding}>
        <ul className="buttons">
          {this.props.children}
        </ul>
      </Menu>
    );
  }
}

export class ListMenuItem extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.string,
    onClick: PropTypes.func
  };
  render() {
    return (
      <li>
        <a onClick={this.props.onClick}>
          {this.props.children}
          {this.props.label ? <span className="label">{this.props.label}</span> : null}
        </a>
      </li>
    );
  }
}

export const ListMenuSeparator = () => (<li><hr /></li>);
