// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import React from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import ReactModal from 'react-modal'
import classNames from 'classnames'
import { Transition } from 'react-transition-group'
import UiState from '../../stores/view/UiState'
import './style.css'

export const MenuDirections = {
  Left: 'left',
  Bottom: 'bottom',
  BottomLeft: 'bottomLeft',
  Cursor: 'cursor',
}

const duration = 100

const transitionStyles = {
  entering: {
    opacity: 0,
    transform: 'scale(0, 0)',
  },
  entered: {
    opacity: 1,
    transform: 'scale(1, 1)',
  },
  exiting: {
    opacity: 0,
    transform: 'scale(0, 0)',
  },
  exited: {
    opacity: 0,
    transform: 'scale(0, 0)',
  },
}

class Menu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.handleClosing = this.handleClosing.bind(this)
  }
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    children: PropTypes.node,
    node: PropTypes.any,
    width: PropTypes.number,
    direction: PropTypes.string,
    padding: PropTypes.number,
    onClick: PropTypes.func,
    requestClose: PropTypes.func.isRequired,
    position: PropTypes.any,
    closeTimeoutMS: PropTypes.number,
  }
  static defaultProps = {
    width: 200,
    padding: 5,
    direction: MenuDirections.BottomLeft,
    closeTimeoutMS: 300,
  }
  static getDerivedStateFromProps(props) {
    if (props.node) {
      const boundingRect = props.node
        ? findDOMNode(props.node).getBoundingClientRect() // eslint-disable-line react/no-find-dom-node
        : undefined
      return { boundingRect }
    }
    return null
  }
  handleClosing(e) {
    this.props.requestClose(e)
  }
  overlayRef = ref => {
    if (ref) {
      ref.addEventListener('contextmenu', this.handleClosing, false)
    }
    this.overlay = ref
  }
  render() {
    let directionStyles = {}
    if (this.props.direction === MenuDirections.Left) {
      directionStyles = {
        top: this.state.boundingRect ? this.state.boundingRect.top : 40,
        left: this.state.boundingRect
          ? this.state.boundingRect.left - this.props.width - this.props.padding
          : 40,
        transformOrigin: `${this.props.width}px 0px 0px`,
      }
    } else if (this.props.direction === MenuDirections.Bottom) {
      directionStyles = {
        top: this.state.boundingRect
          ? this.state.boundingRect.bottom + this.props.padding
          : 40,
        left: this.state.boundingRect
          ? Math.max(
              this.state.boundingRect.left +
                (this.state.boundingRect.width - this.props.width) / 2,
              this.props.padding || 2
            )
          : 40,
        transformOrigin: `${this.props.width / 2}px 0px 0px`,
      }
    } else if (this.props.direction === MenuDirections.BottomLeft) {
      directionStyles = {
        top: this.state.boundingRect
          ? this.state.boundingRect.top +
            this.state.boundingRect.height -
            this.props.padding
          : 40,
        left: this.state.boundingRect
          ? this.state.boundingRect.left -
            this.props.width +
            this.state.boundingRect.width
          : 40,
        transformOrigin: `${this.props.width}px 0px 0px`,
      }
    } else if (this.props.direction === MenuDirections.Cursor) {
      let topPosition = 40,
        leftPosition = 40
      if (this.props.position) {
        topPosition = this.props.position.y
        leftPosition = this.props.position.x
      }

      directionStyles = {
        top: topPosition,
        left: leftPosition,
        transformOrigin: `${this.props.width / 2}px 0px 0px`,
      }
    }

    if (window.innerWidth < directionStyles.left + this.props.width + 2) {
      directionStyles.left = window.innerWidth - this.props.width - 5
    }

    Object.assign(directionStyles, {
      left: directionStyles.left + 'px',
      top: directionStyles.top + 'px',
    })
    return (
      <Transition in={this.props.isOpen} timeout={duration}>
        {status => (
          <ReactModal
            className={classNames(
              'menu',
              'content',
              UiState.isBigSpacingEnabled ? 'enable-big-spacing' : ''
            )}
            isOpen={this.props.isOpen}
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            closeTimeoutMS={this.props.closeTimeoutMS}
            onRequestClose={this.handleClosing}
            overlayRef={this.overlayRef}
            style={{
              overlay: {
                backgroundColor: 'transparent',
                zIndex: '1000',
              },
              content: Object.assign(
                {
                  width: `${this.props.width}px`,
                },
                directionStyles,
                transitionStyles[status]
              ),
            }}
          >
            <div onClick={this.props.onClick}>{this.props.children}</div>
          </ReactModal>
        )}
      </Transition>
    )
  }
}

export default class MenuContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
    }
    this.handleClick = this.handleClick.bind(this)
    this.close = this.close.bind(this)
  }
  static propTypes = {
    opener: PropTypes.element,
    children: PropTypes.node,
    width: PropTypes.number,
    direction: PropTypes.string,
    padding: PropTypes.number,
    closeOnClick: PropTypes.bool,
    isOpenContextMenu: PropTypes.bool,
    eventTarget: PropTypes.object,
    position: PropTypes.object,
    close: PropTypes.func,
    closeTimeoutMS: PropTypes.number,
  }
  static defaultProps = {
    closeOnClick: true,
  }
  handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
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
  render() {
    return [
      this.props.opener
        ? React.cloneElement(this.props.opener, {
            key: 'opener',
            isMenuOpen: this.state.isOpen,
            ref: node => {
              return (this.node = node || this.node)
            },
            onClick: this.handleClick,
          })
        : null,
      <Menu
        key="menu"
        isOpen={this.props.isOpenContextMenu || this.state.isOpen}
        node={this.props.eventTarget || this.node}
        onClick={
          this.props.closeOnClick ? this.props.close || this.close : null
        }
        requestClose={this.props.close || this.close}
        width={this.props.width}
        direction={this.props.direction}
        padding={this.props.padding}
        position={this.props.position}
        closeTimeoutMS={this.props.closeTimeoutMS}
      >
        {this.props.children}
      </Menu>,
    ]
  }
}
