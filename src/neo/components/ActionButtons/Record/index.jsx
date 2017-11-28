import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import "./style.css";

const RecordButton = styled.button`
  height: 16px;
  width: 16px;
  margin: 5px;
  background-color: #EE4841;
  border-style: none;
  border-radius: ${props => props.isActive ? "10%" : "50%"};
  position: relative;
  overflow: hidden;
  outline: 0;
  transition: border-radius 250ms ease-out;
  padding: 0 7px;

  &:hover {
    background-color: #F56660;
  }
  
  &:active {
    background-color: #EE4841;
  }

  &:focus {
    outline: 0;
  }

  &:before {
    content: '';
    position: absolute;
    top: calc(50% - 1px);
    left: calc(50% - 1px);
    width: 2px;
    height: 2px;
    background: rgba(255, 255, 255, .5);
    opacity: 0;
    border-radius: 20%;
    transform: scale(16, 16);
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
      transform: scale(16, 16);
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
      <span className="record" data-tooltip={this.props.isRecording ? "Stop recording" : "Start recording"}>
        <RecordButton isActive={this.props.isRecording} onClick={this.props.onClick}></RecordButton>
      </span>
    );
  }
}
