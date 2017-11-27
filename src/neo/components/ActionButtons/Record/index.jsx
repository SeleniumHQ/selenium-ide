import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const RecordButton = styled.button`
  height: 18px;
  width: 18px;
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

  &:after {
    content: '';
    position: absolute;
    top: calc(50% - 1px);
    left: calc(50% - 1px);
    width: 2px;
    height: 2px;
    background: rgba(255, 255, 255, .5);
    opacity: 0;
    border-radius: 20%;
    transform: scale(18, 18);
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
      transform: scale(18, 18);
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
