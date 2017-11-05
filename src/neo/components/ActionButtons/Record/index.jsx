import React from "react";
import PropTypes from "prop-types";
import ActionButton from "../ActionButton";

const RecordButton = ActionButton.extend`
  height: 14px;
  width: 14px;
  margin: 10px;
  background-color: #EE4841;
  border-style: none;
  border-radius: ${props => props.isActive ? "25%" : "50%"};
  position: relative;
  overflow: hidden;
  transition: border-radius 250ms ease-out;

  &:hover {
    background-color: #F56660;
  }
  
  &:active {
    background-color: #EE4841;
  }

  &:focus {
    outline: 0;
  }

  &:after {
    content: '';
    position: absolute;
    top: calc(50% - 1px);
    left: calc(50% - 1px);
    width: 2px;
    height: 2px;
    background: rgba(255, 255, 255, .5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(14, 14);
    transform-origin: 50% 50%;
    animation: ${props => props.isActive ? "ripple 1s ease-out infinite" : "none"};
  }


  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 1;
    }
    20% {
      transform: scale(5, 5);
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: scale(14, 14);
    }
  }
`;


export default class Record extends React.Component {
  static propTypes = {
    isRecording: PropTypes.bool,
    onClick: PropTypes.func
  };
  render() {
    return (
      <RecordButton isActive={this.props.isRecording} onClick={this.props.onClick}></RecordButton>
    );
  }
}
