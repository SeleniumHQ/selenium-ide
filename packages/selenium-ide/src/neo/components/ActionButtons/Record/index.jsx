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

import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import "./style.css";

const RecordButton = styled.button`
  height: 14px;
  width: 14px;
  margin: 4px 5px;
  background-color: #EE4841;
  border-style: none;
  border-radius: ${props => props.isActive ? "10%" : "50%"};
  position: relative;
  overflow: hidden;
  outline: 0;
  transition: border-radius 250ms ease-out;
  padding: 0 6px;

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
      <div className="record" data-tip={this.props.isRecording ? "<p>Stop recording</p>" : "<p>Start recording</p>"}>
        <RecordButton isActive={this.props.isRecording} onClick={this.props.onClick}></RecordButton>
      </div>
    );
  }
}
