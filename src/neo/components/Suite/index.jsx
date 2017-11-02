import React from "react";
import PropTypes from "prop-types";
import { DropTarget } from "react-dnd";
import classNames from "classnames";
import styled from "styled-components";
import { observer } from "mobx-react";
import TestList from "../TestList";
import { Type } from "../Test";
import ListMenu, { ListMenuItem } from "../ListMenu";
import MoreButton from "../ActionButtons/More";
import UiState from "../../stores/view/UiState";
import tick from "../../images/ic_tick.svg";
import "./style.css";

function containsTest(tests, test) {
  return tests.find((currTest) => (currTest.id === test.id));
}

const testTarget = {
  canDrop(props, monitor) {
    const test = monitor.getItem();
    return !containsTest(props.suite.tests, test);
  },
  drop(props, monitor) {
    if (monitor.didDrop()) {
      return;
    }

    props.moveTest(monitor.getItem(), props.suite);
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

const ArrowProject = styled.span`
  display: flex;
  &:before {
    mask-image: url(${tick});
    content: " ";
    width: 9px;
    height: 9px;
    background-color: ${props => props.isActive ? "#40A6FF" : "#505050"};
    display: inline-block;
    transform: ${props => props.isActive ? "rotate(90deg)" : "rotate(0deg)"};
    transition: all 100ms linear;
    align-self: center;
  }
`;

@observer
class Suite extends React.Component {
  constructor(props) {
    super(props);
    if (!UiState.suiteStates[props.suite.id]) {
      UiState.addStateForSuite(props.suite);
    }
    this.store = UiState.suiteStates[this.props.suite.id];
    this.handleClick = this.handleClick.bind(this);
  }
  static propTypes = {
    suite: PropTypes.object.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    selectTests: PropTypes.func.isRequired,
    rename: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    moveTest: PropTypes.func.isRequired,
    isOver: PropTypes.bool,
    canDrop: PropTypes.bool
  };
  handleClick() {
    this.store.setOpen(!this.store.isOpen);
  }
  render() {
    return this.props.connectDropTarget(
      <div>
        <div className="project">
          <a href="#" className={classNames({"hover": (this.props.isOver && this.props.canDrop)})} onClick={this.handleClick}>
            <ArrowProject isActive={this.store.isOpen}>
              <span className="title">{this.props.suite.name}</span>
            </ArrowProject>
          </a>
          <ListMenu width={130} opener={
            <MoreButton />
          }>
            <ListMenuItem onClick={this.props.selectTests}>Add tests</ListMenuItem>
            <ListMenuItem onClick={() => this.props.rename(this.props.suite.name, this.props.suite.setName)}>Rename</ListMenuItem>
            <ListMenuItem onClick={this.props.remove}>Delete</ListMenuItem>
          </ListMenu>
        </div>
        <TestList collapsed={!this.store.isOpen} suite={this.props.suite.id} tests={this.store.filteredTests.get()} removeTest={this.props.suite.removeTestCase} />
      </div>
    );
  }
}

export default DropTarget(Type, testTarget, collect)(Suite);
