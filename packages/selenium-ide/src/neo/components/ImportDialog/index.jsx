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
import Dropzone from "react-dropzone";
import classNames from "classnames";
import Modal from "../Modal";
import ModalHeader from "../ModalHeader";
import FlatButton from "../FlatButton";
import { parseSuiteRequirements } from "../../IO/legacy/migrate";
import { loadAsText } from "../../IO/filesystem";
import "./style.css";

export default class ImportDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  static propTypes = {
    isImporting: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
    suite: PropTypes.string,
    onComplete: PropTypes.func
  };
  componentWillReceiveProps(nextProps) {
    if (this.props.suite !== nextProps.suite) {
      this.setState({
        files: parseSuiteRequirements(nextProps.suite).map(name => ({name}))
      });
    }
  }
  onDrop(blobs) {
    Promise.all(blobs.filter(blob => (
      // Dont load files we dont need
      !!this.state.files.find(({name}) => (
        name.includes(blob.name)
      ))
    )).map(loadAsText)).then(fileContents => {
      const files = [...this.state.files];
      fileContents.forEach((fileContents, index) => {
        // Find the required file in the list
        const fileIndex = files.findIndex(({name}) => (
          name.includes(blobs[index].name)
        ));
        // set it's contents
        files[fileIndex].contents = fileContents;
      });
      this.setState({ files }, () => {
        // check if all files have been uploaded
        if (!this.state.files.find((file) => !file.contents)) {
          this.props.onComplete(this.state.files);
        }
      });
    });
  }
  render() {
    return (
      <Modal className="import-dialog" isOpen={this.props.isImporting}>
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <ModalHeader title="Import suite" close={this.props.cancel} />
          <p>In order to fully import your legacy Selenium IDE suite, you need to individually import the following tests, by dragging and dropping below or{" "}
            <a className="link" href="#" onClick={() => { this.dropzone.open(); }}>selecting them</a>
          </p>
          <Dropzone className="dropzone" accept="text/html" onDrop={this.onDrop.bind(this)} ref={(node) => { this.dropzone = node; }}>
            <ul>
              {this.state.files && this.state.files.map(({name, contents}) => (
                <li key={name} className={classNames({accepted: !!contents})}>{name}</li>
              ))}
            </ul>
          </Dropzone>
          <hr />
          <span className="right">
            <FlatButton onClick={this.props.cancel}>Cancel</FlatButton>
          </span>
          <div className="clear"></div>
        </form>
      </Modal>
    );
  }
}
