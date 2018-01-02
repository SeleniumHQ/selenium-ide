import React from "react";
import PropTypes from "prop-types";
import { ContextMenuContainer } from "../Menu";
import { observer } from "mobx-react";
import "./style.css";

@observer
export default class ContextMenu extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    padding: PropTypes.number,
    onContextMenu: PropTypes.func,
    isOpen: PropTypes.bool,
    opener: PropTypes.any,
    position: PropTypes.any,
    children: PropTypes.node,
    direction: PropTypes.string,
    closeTimeoutMS: PropTypes.number
  };
  render() {
    return (
      <ContextMenuContainer width={this.props.width} padding={this.props.padding} onContextMenu={this.props.onContextMenu} isOpen={this.props.isOpen}
        position={this.props.position} opener={this.props.opener} direction={this.props.direction} closeTimeoutMS={this.props.closeTimeoutMS}>
        <ul className="buttons">
          {this.props.children}
        </ul>
      </ContextMenuContainer>
    );
  }
}

