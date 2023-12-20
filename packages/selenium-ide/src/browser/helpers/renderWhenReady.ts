import React from 'react'
import {createRoot} from 'react-dom/client'

export default (Component: React.FC | React.ComponentClass) => {
  document.addEventListener('DOMContentLoaded', () => {
    const domContainer = document.querySelector('#root')
    const root = createRoot(domContainer!)
    root.render(React.createElement(Component))
  });
}