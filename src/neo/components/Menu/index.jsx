import React from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import ReactModal from "react-modal";
import classNames from "classnames";
import "./style.css";

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isClosing: true
    };
    this.handleClosing = this.handleClosing.bind(this);
  }
  static width = 200;
  static padding = 5;
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    children: PropTypes.node,
    node: PropTypes.any,
    onClick: PropTypes.func,
    requestClose: PropTypes.func.isRequired
  };
  componentWillReceiveProps(nextProps) {
    if (this.props.isOpen && !nextProps.isOpen) {
      this.setState({ isClosing: !this.state.isClosing });
    }
    if (this.state.isClosing && nextProps.isOpen) {
      setTimeout(() => {this.setState({ isClosing: false });}, 0);
    }
    if (this.props.node !== nextProps.node) {
      const boundingRect = nextProps.node ? findDOMNode(nextProps.node).getBoundingClientRect() : undefined; // eslint-disable-line react/no-find-dom-node
      this.setState({ boundingRect });
    }
  }
  handleClosing() {
    this.setState({ isClosing: true });
    this.props.requestClose();
  }
  render() {
    return (
      <ReactModal
        className={classNames("menu", "content", { "closed": this.state.isClosing })}
        isOpen={this.props.isOpen}
        ariaHideApp={false}
        shouldCloseOnOverlayClick={true}
        closeTimeoutMS={300}
        onRequestClose={this.handleClosing}
        style={{
          overlay: {
            backgroundColor: "transparent"
          },
          content: {
            transformOrigin: `${Menu.width}px 0px 0px`,
            width: `${Menu.width}px`,
            top: `${this.state.boundingRect ? this.state.boundingRect.top - Menu.padding : "40"}px`,
            left: `${this.state.boundingRect ? this.state.boundingRect.left - Menu.width - Menu.padding : "40"}px`
          }
        }}
      >
        <div onClick={this.props.onClick}>
          {this.props.children}
        </div>
      </ReactModal>
    );
  }
}

export default class MenuContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.close = this.close.bind(this);
  }
  static propTypes = {
    opener: PropTypes.element,
    children: PropTypes.node
  }
  handleClick() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  close() {
    this.setState({
      isOpen: false
    });
  }
  render() {
    return ([
      React.cloneElement(this.props.opener, { key: "opener", ref: (node) => {return(this.node = node || this.node);}, onClick: this.handleClick }),
      <Menu key="menu" isOpen={this.state.isOpen} node={this.node} onClick={this.close} requestClose={this.close}>{this.props.children}</Menu>
    ]);
  }
}
