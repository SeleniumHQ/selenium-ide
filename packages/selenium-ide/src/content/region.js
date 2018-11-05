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

const coords = {
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
}

const mouseOffset = {
  x: 0,
  y: 0,
}

const STATES = {
  create: 1,
  update: 2,
  resize: 3,
}

let state = STATES.create
let canvasExists = false

export function editRegion(rect, cb) {
  if (canvasExists) {
    return cb(false)
  }
  const container = document.createElement('div')
  container.id = 'selenium-container'
  const canvas = document.createElement('div')
  canvas.id = 'selenium-canvas'
  const region = createRegion()
  setStyle(canvas, region)
  setEvents(container)
  const buttonContainer = createButtons(cb)
  buttonContainer.style.zIndex = '10002'
  if (rect) {
    region.style.left = `${rect.x}px`
    region.style.top = `${rect.y}px`
    region.style.width = `${rect.width}px`
    region.style.height = `${rect.height}px`
  }
  container.appendChild(buttonContainer)
  container.appendChild(canvas)
  container.appendChild(region)
  document.body.appendChild(container)
  canvasExists = true
}

export function removeRegion() {
  if (canvasExists) {
    document.body.removeChild(document.getElementById('selenium-container'))
  }
  canvasExists = false
}

function setStyle(canvas, region) {
  canvas.style.position = 'fixed'
  canvas.style.top = 0
  canvas.style.bottom = 0
  canvas.style.right = 0
  canvas.style.left = 0
  canvas.style.zIndex = '10000'
  canvas.style.cursor = 'crosshair'

  region.style.position = 'absolute'
  region.style.zIndex = '10001'
  region.style.backgroundColor = 'rgb(78, 171, 230)'
  region.style.opacity = '0.4'
  region.style.border = '1px solid #0e0e0e'
}

function setEvents(container) {
  container.addEventListener('mousedown', mousedown)
  container.addEventListener('mouseup', mouseup)
}

function mousedown(e) {
  const container = document.getElementById('selenium-container')
  const canvas = document.getElementById('selenium-canvas')
  const region = document.getElementById('selenium-region')
  e.stopPropagation()
  if (e.target.tagName === 'BUTTON') return
  if (e.target === canvas) {
    updateRegion(e.pageX, e.pageY, e.pageX, e.pageY)
    state = STATES.create
    region.style.cursor = 'crosshair'
  } else if (e.target === region) {
    state = STATES.update
    mouseOffset.x = e.pageX
    mouseOffset.y = e.pageY
    region.style.cursor = 'move'
  } else if (e.target.parentElement === region) {
    state = STATES.resize
  }
  container.addEventListener('mousemove', mousemove)
}

function mousemove(e) {
  e.stopPropagation()
  if (e.target.tagName === 'BUTTON') return
  if (state === STATES.create || state === STATES.resize) {
    updateRegion(undefined, undefined, e.pageX, e.pageY)
  } else if (state === STATES.update) {
    moveRegion(e.pageX, e.pageY)
  }
}

function mouseup(e) {
  const container = document.getElementById('selenium-container')
  const canvas = document.getElementById('selenium-canvas')
  const region = document.getElementById('selenium-region')
  e.stopPropagation()
  region.style.cursor = 'move'
  canvas.style.cursor = 'crosshair'
  container.removeEventListener('mousemove', mousemove)
  showButtons()
}

function calculateRectFromCoords(coords) {
  return calculateRect(
    { x: coords.startX, y: coords.startY },
    { x: coords.endX, y: coords.endY }
  )
}

function calculateRect(p1, p2) {
  return {
    left: Math.min(p1.x, p2.x),
    top: Math.min(p1.y, p2.y),
    width: Math.abs(p1.x - p2.x),
    height: Math.abs(p1.y - p2.y),
  }
}

function updateRegion(startX, startY, endX, endY) {
  hideButtons()
  const region = document.getElementById('selenium-region')
  if (startX) {
    coords.startX = startX
  }
  if (startY) {
    coords.startY = startY
  }
  if (endX) {
    coords.endX = endX
  }
  if (endY) {
    coords.endY = endY
  }
  const rect = calculateRectFromCoords(coords)
  region.style.left = `${rect.left}px`
  region.style.top = `${rect.top}px`
  region.style.width = `${rect.width}px`
  region.style.height = `${rect.height}px`
}

function moveRegion(mouseX, mouseY) {
  let dx = mouseOffset.x - mouseX
  let dy = mouseOffset.y - mouseY
  mouseOffset.x = mouseX
  mouseOffset.y = mouseY
  if (coords.startX - dx < 5 || coords.endX - dx < 5) dx = 0
  if (coords.startY - dy < 5 || coords.endY - dy < 5) dy = 0
  updateRegion(
    coords.startX - dx,
    coords.startY - dy,
    coords.endX - dx,
    coords.endY - dy
  )
}

function createRegion() {
  const region = document.createElement('div')
  region.id = 'selenium-region'

  const cornerSize = 20

  const tlc = createHotCorner(cornerSize)
  tlc.style.top = '-5px'
  tlc.style.left = '-5px'
  tlc.style.cursor = 'nw-resize'

  tlc.addEventListener('mousedown', () => {
    const canvas = document.getElementById('selenium-canvas')
    const region = document.getElementById('selenium-region')
    canvas.style.cursor = 'nw-resize'
    region.style.cursor = 'nw-resize'
    updateRegion(
      Math.max(coords.startX, coords.endX),
      Math.max(coords.startY, coords.endY),
      Math.min(coords.startX, coords.endX),
      Math.min(coords.startY, coords.endY)
    )
  })

  region.appendChild(tlc)

  const trc = createHotCorner(cornerSize)
  trc.style.top = '-5px'
  trc.style.right = '-5px'
  trc.style.cursor = 'ne-resize'

  trc.addEventListener('mousedown', () => {
    const canvas = document.getElementById('selenium-canvas')
    const region = document.getElementById('selenium-region')
    canvas.style.cursor = 'ne-resize'
    region.style.cursor = 'ne-resize'
    updateRegion(
      Math.min(coords.startX, coords.endX),
      Math.max(coords.startY, coords.endY),
      Math.max(coords.startX, coords.endX),
      Math.min(coords.startY, coords.endY)
    )
  })

  region.appendChild(trc)

  const blc = createHotCorner(cornerSize)
  blc.style.bottom = '-5px'
  blc.style.left = '-5px'
  blc.style.cursor = 'sw-resize'

  blc.addEventListener('mousedown', () => {
    const canvas = document.getElementById('selenium-canvas')
    const region = document.getElementById('selenium-region')
    canvas.style.cursor = 'sw-resize'
    region.style.cursor = 'sw-resize'
    updateRegion(
      Math.max(coords.startX, coords.endX),
      Math.min(coords.startY, coords.endY),
      Math.min(coords.startX, coords.endX),
      Math.max(coords.startY, coords.endY)
    )
  })

  region.appendChild(blc)

  const brc = createHotCorner(cornerSize)
  brc.style.bottom = '-5px'
  brc.style.right = '-5px'
  brc.style.cursor = 'se-resize'

  brc.addEventListener('mousedown', () => {
    const canvas = document.getElementById('selenium-canvas')
    const region = document.getElementById('selenium-region')
    canvas.style.cursor = 'se-resize'
    region.style.cursor = 'se-resize'
    updateRegion(
      Math.min(coords.startX, coords.endX),
      Math.min(coords.startY, coords.endY),
      Math.max(coords.startX, coords.endX),
      Math.max(coords.startY, coords.endY)
    )
  })

  region.appendChild(brc)

  return region
}

function createHotCorner(size) {
  const c = document.createElement('div')
  c.style.position = 'absolute'
  c.style.height = `${size}px`
  c.style.width = `${size}px`

  return c
}

function showButtons() {
  const canvasRect = document
    .getElementById('selenium-canvas')
    .getBoundingClientRect()
  const buttonContainer = document.getElementById('region-control-panel')
  let top = coords.startY
  let bottom = coords.endY
  let left = coords.startX
  let right = coords.endX
  let width = right - left
  if (canvasRect.bottom - bottom <= 100) bottom = top
  if (width < 0) left = coords.endX
  right = coords.startX
  width = Math.abs(width)
  if (width < 225) width = 225
  buttonContainer.style.position = 'absolute'
  buttonContainer.style.top = bottom + 'px'
  buttonContainer.style.left = left + 'px'
  buttonContainer.style.right = right + 'px'
  buttonContainer.style.width = width + 'px'
  buttonContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.55)'
  buttonContainer.style.visibility = 'visible'
}

function hideButtons() {
  const buttonContainer = document.getElementById('region-control-panel')
  buttonContainer.style.visibility = 'hidden'
}

function createButtons(cb) {
  const container = document.createElement('div')
  container.id = 'region-control-panel'
  const buttons = document.createElement('div')
  const confirm = document.createElement('button')
  confirm.innerText = 'Confirm'
  confirm.addEventListener('click', () => {
    hideButtons()
    removeRegion()
    const rect = calculateRectFromCoords(coords)
    cb(
      `x: ${rect.left}, y: ${rect.top}, width: ${rect.width}, height: ${
        rect.height
      }`
    )
  })
  const cancel = document.createElement('button')
  cancel.innerText = 'Cancel'
  cancel.addEventListener('click', () => {
    hideButtons()
    removeRegion()
    cb(false)
  })

  container.style.visibility = 'hidden'
  buttons.style.display = 'flex'
  buttons.style.alignItems = 'center'
  buttons.style.justifyContent = 'center'

  styleButton(confirm)
  styleButton(cancel)

  buttons.appendChild(cancel)
  buttons.appendChild(confirm)
  container.appendChild(buttons)
  return container
}

function styleButton(button) {
  button.style.color = '#656565'
  button.style.backgroundColor = '#F5F5F5'
  button.style.padding = '10px 20px'
  button.style.margin = '5px 8px'
  button.style.borderRadius = '4px'
  button.style.outline = '0'
  button.style.textTransform = 'capitalize'
}
