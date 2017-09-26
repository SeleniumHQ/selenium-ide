import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import TestList from "../TestList";
import arrow from "../../images/ic_arrow_down.svg";
import folder from "../../images/ic_folder.svg";
import "./style.css";

const ArrowProject = styled.span`
  &:before {
    mask-image: url(${arrow});
    content: " ";
    width: 24px;
    height: 24px;
    background-color: ${props => props.isActive ? "#40A6FF" : "#505050"};
    display: inline-block;
    transform: ${props => props.isActive ? "rotate(0deg)" : "rotate(-90deg)"};
    transition: all 100ms linear;
    vertical-align: middle;
  }
`;

export default class Project extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false
    };
    this.handleClick = this.handleClick.bind(this);
  }
  static propTypes = {
    name: PropTypes.string.isRequired,
    tests: PropTypes.array.isRequired,
    selectedTest: PropTypes.string,
    selectTest: PropTypes.func.isRequired
  };
  handleClick() {
    this.setState({
      isActive: !this.state.isActive
    });
  }
  render() {
    return (
      <div>
        <a href="#" className="project" onClick={this.handleClick}>
          <ArrowProject isActive={this.state.isActive}>
            <img src={folder} alt="project" />
            <span className="title">{this.props.name}</span>
          </ArrowProject>
        </a>
        <TestList collapsed={!this.state.isActive} tests={this.props.tests} selectedTest={this.props.selectedTest} selectTest={this.props.selectTest} />
      </div>
    );
  }
}
