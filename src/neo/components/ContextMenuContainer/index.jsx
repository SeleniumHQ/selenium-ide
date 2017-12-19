import React from "react";
import PropTypes from "prop-types";
import "./style.css";
import { findDOMNode } from "react-dom";
import ReactModal from "react-modal";
import classNames from "classnames";
import { Transition } from "react-transition-group";
import {observer} from "mobx-react";

export const MenuDirections = {
  Left: "left",
  Bottom: "bottom"
};

const duration = 100;

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

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleClosing = this.handleClosing.bind(this);
  }
  static propTypes = {
    isOpen: PropTypes.bool,
    children: PropTypes.node,
    node: PropTypes.any,
    width: PropTypes.number,
    direction: PropTypes.string,
    padding: PropTypes.number,
    onClick: PropTypes.func,
    requestClose: PropTypes.func.isRequired
  };
  static defaultProps = {
    isOpen: false,
    width: 200,
    padding: 5,
    direction: MenuDirections.Left
  };
  handleClosing(e) {
    this.props.requestClose(e);
  }
  render() {    
    let directionStyles = {};
    if(this.props.rect){      
      if(this.props.rect.x+this.props.rect.width < this.props.rect.x + this.props.position.x + this.props.width ){
        directionStyles = {
          top : this.props.rect.y + this.props.position.y + "px",
          left : this.props.rect.x + this.props.rect.width - this.props.width + "px",
          transformOrigin: `${this.props.width / 2}px 0px 0px`
        };
      }else{
        directionStyles = {
          top : this.props.rect.y + this.props.position.y + "px",
          left : this.props.rect.x + this.props.position.x + "px",
          transformOrigin: `${this.props.width / 2}px 0px 0px`
        };
      }
      
    }    

    return (
      <Transition in={this.props.isOpen} timeout={duration}>
        {(status) => (
          <ReactModal
            className={classNames("menu", "content")}
            isOpen={this.props.isOpen}
            ariaHideApp={false}
            shouldCloseOnOverlayClick={true}
            closeTimeoutMS={300}
            onRequestClose={this.handleClosing}
            style={{
              overlay: {
                backgroundColor: "transparent",
                zIndex: "1000"
              },
              content: Object.assign({
                width: `${this.props.width}px`
              }, directionStyles, transitionStyles[status])
            }}
          >
            <div onClick={this.props.onClick}>
              {this.props.children}
            </div>
          </ReactModal>
        )}
      </Transition>
    );
  }
}

export default class ContextMenuContainer extends React.Component {  
  constructor(props) {
    super(props);           
    this.close = this.close.bind(this);    
  }
  
  static defaultProps = {
    closeOnClick: true
  };
  
  close(e) {    
    e.preventDefault();
    e.stopPropagation();    
    this.props.onContextMenu();
  }
  render() {     
    return ([             
        <Menu
          key="menu"
          isOpen={this.props.isOpen}          
          node={this.node}
          onClick={this.props.closeOnClick ? this.close : null}
          requestClose={this.close}
          width={this.props.width}
          direction={this.props.direction}
          padding={this.props.padding}
          position={this.props.position}
          rect={this.props.rect}>          
          {this.props.children}      
        </Menu>      
    ]);
  }
}
