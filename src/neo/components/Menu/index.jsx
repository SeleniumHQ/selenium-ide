import React from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import ReactModal from "react-modal";
import classNames from "classnames";
import "./style.css";

export default class Menu extends React.Component {
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
    node: PropTypes.any,
    requestClose: PropTypes.func.isRequired
  };
  componentWillReceiveProps(nextProps) {
    if (this.state.isClosing && nextProps.isOpen) {
      setTimeout(() => {this.setState({ isClosing: false });}, 0);
    }
    if (this.props.node !== nextProps.node) {
      const boundingRect = nextProps.node ? findDOMNode(nextProps.node).getBoundingClientRect() : undefined; // eslint-disable-line react/no-find-dom-node
      this.setState({ boundingRect });
    }
  }
  componentDidMount() {
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
        <ul className="buttons">
          <li>
            <a>Add new command</a>
          </li>
          <li>
            <a>Remove command</a>
          </li>
        </ul>
      </ReactModal>
    );
  }
}
