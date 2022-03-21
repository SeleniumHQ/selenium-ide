import React from 'react'
import ReactDOM from 'react-dom'

export default (Component: React.FC | React.ComponentClass) => {
  document.addEventListener('DOMContentLoaded', () => {
    const domContainer = document.querySelector('#root')
    ReactDOM.render(React.createElement(Component), domContainer)
  });
}