import React from "react";
import PropTypes from "prop-types";
import MenuContainer from "../Menu";
import "./style.css";

export default class ContextMenu extends React.Component {
  static propTypes = {
    isContextMenu: PropTypes.bool,
    isOpenContextMenu: PropTypes.bool,
    onContextMenu: PropTypes.func,
    width: PropTypes.number,
    close: PropTypes.func,
    padding: PropTypes.number,
    eventTartget: PropTypes.object,
    position: PropTypes.object,
    direction: PropTypes.string,
    closeTimeoutMS: PropTypes.number,
    children: PropTypes.node
  };
  render() {
    return (
      <MenuContainer
        isContextMenu={this.props.isContextMenu}
        isOpenContextMenu={this.props.isOpenContextMenu}
        onContextMenu={this.props.onContextMenu}
        width={this.props.width}
        close={this.props.close}
        padding={this.props.padding}
        eventTartget={this.props.eventTartget}
        position={this.props.position}
        direction={this.props.direction}
        closeTimeoutMS={this.props.closeTimeoutMS}>
        <ul className="buttons">
          {this.props.children}
        </ul>
      </MenuContainer>
    );
  }
}

export function withOnContextMenu(WrappredComponent){
  return class WithOnContextMenu extends React.Component {
    eventPosition;
    eventTartget;
    constructor(props){
      super(props);
      this.onContextMenu = this.onContextMenu.bind(this);
      this.close = this.close.bind(this);
      this.state = { isOpen: false };
    }
    static propTypes = {
      menu: PropTypes.node,
      width: PropTypes.number,
      padding: PropTypes.number
    }
    onContextMenu(e){
      e.preventDefault();
      //send currentTarget to child component.
      this.eventTartget=e.currentTarget;
      //click position
      if (!this.state.isOpen) {
        this.eventPosition = { x:e.clientX, y:e.clientY };
      }
      this.setState({
        isOpen: !this.state.isOpen
      });
    }
    close(e) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({
        isOpen: false
      });
    }
    render() {
      const listMenu = this.props.menu;
      return ([
        <WrappredComponent key="wrap" onContextMenu={this.onContextMenu} {...this.props} />,
        ( listMenu ?
        <ContextMenu
          key="contextmenu"
          direction={"cursor"}
          isContextMenu={true}
          isOpenContextMenu={this.state.isOpen}
          onContextMenu={this.onContextMenu}
          eventTartget={this.eventTartget}
          close={this.close}
          width={listMenu.props.width}
          padding={listMenu.props.padding}
          position={this.eventPosition}
          closeTimeoutMS={50}
        >
          {listMenu.props.children}
        </ContextMenu>
        : null )
      ]);
    }
  };
}
