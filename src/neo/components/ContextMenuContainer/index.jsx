import React from "react";
import PropTypes from "prop-types";
import ReactModal from "react-modal";
import classNames from "classnames";
import { Transition } from "react-transition-group";
import "./style.css";

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
    width: PropTypes.number,
    padding: PropTypes.number,
    onClick: PropTypes.func,
    requestClose: PropTypes.func.isRequired,
    position: PropTypes.any,
    rect: PropTypes.any
  };
  static defaultProps = {
    isOpen: false,
    width: 200,
    padding: 5
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
            key={"menuModal"}
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
            <div onClick={this.props.onClick} id={"menuModal"}>
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
  static propTypes = {
    width: PropTypes.number,
    padding: PropTypes.number,
    onContextMenu: PropTypes.func,
    isOpen: PropTypes.bool,
    position: PropTypes.any,
    rect: PropTypes.any,
    children: PropTypes.node,
    closeOnClick: PropTypes.bool    
  };
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
        onClick={this.props.closeOnClick ? this.close : null}
        requestClose={this.close}
        width={this.props.width}
        padding={this.props.padding}
        position={this.props.position}
        rect={this.props.rect}>          
        {this.props.children}      
      </Menu>      
    ]);
  }
}
