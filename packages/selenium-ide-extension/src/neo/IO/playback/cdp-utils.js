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

export function buildFrameTree(docTree) {
  const doc = {
    children: parseFramesFromDoc(docTree),
  }
  return doc
}

function parseFramesFromDoc(docTree) {
  const elements = docTree.children ? [...docTree.children] : []
  const frames = []

  while (elements.length) {
    const elem = elements.pop()
    if (elem.nodeName === 'IFRAME') {
      frames.push(elem)
    } else if (elem.children) {
      elements.push(...elem.children)
    }
  }

  return frames
    .map(frame => ({
      nodeId: frame.nodeId,
      backendNodeId: frame.backendNodeId,
      parentId: frame.parentId,
      frameId: frame.frameId,
      documentURL: getUrlForFrame(frame),
      documentNodeId: getDocumentNodeIdForFrame(frame),
      children: frame.contentDocument
        ? parseFramesFromDoc(frame.contentDocument)
        : [],
    }))
    .sort((frm1, frm2) => frm1.nodeId - frm2.nodeId)
}

function getUrlForFrame(frame) {
  const srcAttrIndex = frame.attributes.indexOf('src')
  return srcAttrIndex !== -1 ? frame.attributes[srcAttrIndex + 1] : undefined
}

function getDocumentNodeIdForFrame(frame) {
  try {
    return frame.contentDocument.children.find(
      child =>
        child.children &&
        child.children.length &&
        child.children.length > 1 &&
        child.children[1].nodeName === 'BODY'
    ).children[1].nodeId
  } catch (e) {
    return undefined
  }
}
