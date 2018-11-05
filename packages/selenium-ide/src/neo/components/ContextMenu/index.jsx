import React from 'react'
import PropTypes from 'prop-types'
import MenuContainer from '../Menu'
import './style.css'

export default class ContextMenu extends React.Component {
  static propTypes = {
    isOpenContextMenu: PropTypes.bool,
    width: PropTypes.number,
    close: PropTypes.func,
    padding: PropTypes.number,
    eventTarget: PropTypes.object,
    position: PropTypes.object,
    direction: PropTypes.string,
    closeTimeoutMS: PropTypes.number,
    children: PropTypes.node,
  }
  render() {
    return (
      <MenuContainer
        isOpenContextMenu={this.props.isOpenContextMenu}
        width={this.props.width}
        close={this.props.close}
        padding={this.props.padding}
        eventTarget={this.props.eventTarget}
        position={this.props.position}
        direction={this.props.direction}
        closeTimeoutMS={this.props.closeTimeoutMS}
      >
        <ul className="buttons">{this.props.children}</ul>
      </MenuContainer>
    )
  }
}

export function withOnContextMenu(WrappredComponent) {
  return class WithOnContextMenu extends React.Component {
    constructor(props) {
      super(props)
      this.eventPosition = null
      this.eventTarget = null
      this.listMenu = null
      this.setContextMenu = this.setContextMenu.bind(this)
      this.onContextMenu = this.onContextMenu.bind(this)
      this.close = this.close.bind(this)
      this.state = { isOpen: false }
    }
    static propTypes = {
      menu: PropTypes.node,
      width: PropTypes.number,
      padding: PropTypes.number,
    }
    onContextMenu(e) {
      e.preventDefault()
      //click position
      if (!this.state.isOpen) {
        this.eventPosition = { x: e.clientX, y: e.clientY }
        //send currentTarget to child component.
        this.eventTarget = e.currentTarget
      }
      this.setState({
        isOpen: !this.state.isOpen,
      })
    }
    close(e) {
      e.preventDefault()
      e.stopPropagation()
      this.setState({
        isOpen: false,
      })
    }
    setContextMenu(menu) {
      if (menu) this.listMenu = menu
    }
    render() {
      return [
        <WrappredComponent
          key="wrap"
          onContextMenu={this.onContextMenu}
          setContextMenu={this.setContextMenu}
          {...this.props}
        />,
        <ContextMenu
          key="contextmenu"
          direction={'cursor'}
          isOpenContextMenu={this.state.isOpen}
          eventTarget={this.eventTarget}
          close={this.close}
          width={this.listMenu ? this.listMenu.props.width : 150}
          padding={this.listMenu ? this.listMenu.props.padding : -5}
          position={this.eventPosition}
          closeTimeoutMS={50}
        >
          {this.listMenu ? this.listMenu.props.children : null}
        </ContextMenu>,
      ]
    }
  }
}
