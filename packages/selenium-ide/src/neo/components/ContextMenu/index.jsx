import React from "react";
import PropTypes from "prop-types";
import MenuContainer from "../Menu";
import { observer } from "mobx-react";
import "./style.css";

@observer
export default class ContextMenu extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    padding: PropTypes.number,
    children: PropTypes.node,
    direction: PropTypes.string,
    closeTimeoutMS: PropTypes.number,
  };
  handleContextMenu(e) {
    this.refs.contextMenu.handleClick(e);
  }
  render() {
    return (
      <MenuContainer ref="contextMenu" width={this.props.width} padding={this.props.padding} direction={this.props.direction} closeTimeoutMS={this.props.closeTimeoutMS}>
        <ul className="buttons">
          {this.props.children}
        </ul>
      </MenuContainer>
    );
  }
}
