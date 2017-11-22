import React from "react";
import PropTypes from "prop-types";
import { DropTarget } from "react-dnd";
import classNames from "classnames";
import { observer } from "mobx-react";
import { modifier } from "modifier-keys";
import TestList from "../TestList";
import { Type } from "../Test";
import ListMenu, { ListMenuItem } from "../ListMenu";
import MoreButton from "../ActionButtons/More";
import UiState from "../../stores/view/UiState";
import PlaybackState from "../../stores/view/PlaybackState";
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

@observer
class Suite extends React.Component {
  constructor(props) {
    super(props);
    this.store = UiState.getSuiteState(props.suite);
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
  handleKeyDown(event) {
    const e = event.nativeEvent;
    modifier(e);
    const noModifiers = (!e.primaryKey && !e.secondaryKey);

    if (noModifiers && e.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation();
      this.store.setOpen(false);
      UiState.selectTestByIndex(-1, this.props.suite);
    }
  }
  render() {
    return this.props.connectDropTarget(
      <div onKeyDown={this.handleKeyDown.bind(this)}>
        <div className="project">
          <a href="#" tabIndex="-1" className={classNames(PlaybackState.suiteState.get(this.props.suite.id), {"hover": (this.props.isOver && this.props.canDrop)}, {"active": this.store.isOpen})} onClick={this.handleClick}>
            <span className="si-caret"></span>
            <span className="title">{this.props.suite.name}</span>
          </a>
          <ListMenu width={130} padding={-5} opener={
            <MoreButton />
          }>
            <ListMenuItem onClick={this.props.selectTests}>Add tests</ListMenuItem>
            <ListMenuItem onClick={() => this.props.rename(this.props.suite.name, this.props.suite.setName)}>Rename</ListMenuItem>
            <ListMenuItem onClick={this.props.remove}>Delete</ListMenuItem>
          </ListMenu>
        </div>
        <TestList collapsed={!this.store.isOpen} suite={this.props.suite} tests={this.store.filteredTests.get()} removeTest={this.props.suite.removeTestCase} />
      </div>
    );
  }
}

export default DropTarget(Type, testTarget, collect)(Suite);
