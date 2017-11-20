import React from "react";
import PropTypes from "prop-types";
import ReactModal from "react-modal";
import { Transition } from "react-transition-group";
import classNames from "classnames";
import "./style.css";

const transitionStyles = {
  entering: {
    opacity: 0,
    transform: "scale(0, 0)"
  },
  entered: {
    opacity: 1,
    transform: "scale(1, 1)"
  },
  exiting: {
    opacity: 0,
    transform: "scale(0, 0)"
  },
  exited: {
    opacity: 0,
    transform: "scale(0, 0)"
  }
};

export default class Modal extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    isOpen: PropTypes.bool,
    duration: PropTypes.number,
    children: PropTypes.node,
    transitionStyles: PropTypes.object,
    onRequestClose: PropTypes.func
  };
  static defaultProps = {
    duration: 100,
    transitionStyles: transitionStyles
  };
  render() {
    return (
      <Transition in={this.props.isOpen} timeout={this.props.duration}>
        {(status) => (
          <ReactModal
            className="modal-content"
            isOpen={this.props.isOpen}
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            closeTimeoutMS={this.props.duration}
            onRequestClose={this.props.onRequestClose}
            overlayClassName="modal-overlay"
          >
            <div className={classNames("modal", this.props.className)} style={this.props.transitionStyles[status]}>
              {this.props.children}
            </div>
          </ReactModal>
        )}
      </Transition>
    );
  }
}
