import React from "react";
import PropTypes from "prop-types";
import ContextMenuContainer from "../ContextMenuContainer";
import "./style.css";

export default class ContextMenu extends React.Component {  
  render() {        
    return (
      <ContextMenuContainer width={this.props.width} padding={this.props.padding} index={this.props.index} onContextMenu={this.props.onContextMenu} isOpen={this.props.isOpen} 
        position={this.props.position} rect={this.props.rect}>
        <ul className="buttons">
          {this.props.children}
        </ul>
      </ContextMenuContainer>      
    );
  }
}

