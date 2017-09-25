import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import arrow from "../../images/ic_arrow_down.svg";
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
    vertical-align: sub;
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
    name: PropTypes.string.isRequired
  };
  handleClick() {
    this.setState({
      isActive: !this.state.isActive
    });
  }
  render() {
    return (
      <a href="#" className="project" onClick={this.handleClick}>
        <ArrowProject isActive={this.state.isActive}>
          <span>{this.props.name}</span>
        </ArrowProject>
      </a>
    );
  }
}
