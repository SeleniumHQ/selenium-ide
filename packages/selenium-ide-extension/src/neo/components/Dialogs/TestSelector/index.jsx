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

import React from 'react'
import PropTypes from 'prop-types'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import Modal from '../../Modal'
import DialogContainer from '../Dialog'
import FlatButton from '../../FlatButton'
import SearchBar from '../../SearchBar'
import Checkbox from '../../Checkbox'
import './style.css'

export default class TestSelector extends React.Component {
  static propTypes = {
    isEditing: PropTypes.bool.isRequired,
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    selectedTests: MobxPropTypes.arrayOrObservableArray,
    cancelSelection: PropTypes.func.isRequired,
    completeSelection: PropTypes.func.isRequired,
  }
  render() {
    return (
      <Modal
        className="stripped test-selector"
        isOpen={this.props.isEditing}
        onRequestClose={this.props.cancelSelection}
      >
        <TestSelectorContent {...this.props} />
      </Modal>
    )
  }
}

class TestSelectorContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedTests: props.selectedTests
        ? props.selectedTests.reduce((selections, selection) => {
            selections[selection.id] = selection
            return selections
          }, {})
        : {},
      filterTerm: '',
    }
    this.selectTest = this.selectTest.bind(this)
    this.filter = this.filter.bind(this)
  }
  static propTypes = {
    isEditing: PropTypes.bool.isRequired,
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    selectedTests: MobxPropTypes.arrayOrObservableArray,
    cancelSelection: PropTypes.func.isRequired,
    completeSelection: PropTypes.func.isRequired,
  }
  componentDidMount() {
    this.input.focus()
  }
  selectTest(isSelected, test) {
    this.setState({
      selectedTests: {
        ...this.state.selectedTests,
        [test.id]: isSelected ? test : undefined,
      },
    })
  }
  filter(filterTerm) {
    this.setState({ filterTerm })
  }
  render() {
    return (
      <DialogContainer
        title="Select tests"
        onRequestClose={this.props.cancel}
        renderFooter={() => (
          <span className="right">
            <FlatButton onClick={this.props.cancelSelection}>cancel</FlatButton>
            <FlatButton
              type="submit"
              onClick={() => {
                this.props.completeSelection(
                  Object.values(this.state.selectedTests).filter(t => !!t)
                )
              }}
              style={{
                marginRight: '0',
              }}
            >
              select
            </FlatButton>
          </span>
        )}
      >
        <SearchBar
          inputRef={input => {
            this.input = input
          }}
          filter={this.filter}
          value={this.state.filterTerm}
        />
        <TestSelectorList
          tests={this.props.tests}
          filterTerm={this.state.filterTerm}
          selectedTests={this.state.selectedTests}
          selectTest={this.selectTest}
        />
      </DialogContainer>
    )
  }
}

class TestSelectorList extends React.Component {
  static propTypes = {
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    filterTerm: PropTypes.string.isRequired,
    selectedTests: PropTypes.object.isRequired,
    selectTest: PropTypes.func.isRequired,
  }
  handleChange(test, e) {
    this.props.selectTest(e.target.checked, test)
  }
  render() {
    return (
      <ul className="tests">
        {this.props.tests
          .filter(
            ({ name }) =>
              name
                .toLowerCase()
                .indexOf(this.props.filterTerm.toLowerCase()) !== -1
          )
          .map(test => (
            <li key={test.id}>
              <Checkbox
                label={test.name}
                checked={!!this.props.selectedTests[test.id]}
                form={true}
                onChange={this.handleChange.bind(this, test)}
              />
            </li>
          ))}
      </ul>
    )
  }
}
