import React from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import './style.css'

export default function Markdown(props) {
  return (
    <ReactMarkdown
      className="markdown"
      source={props.children}
      renderers={{
        link: Link,
      }}
    />
  )
}

Markdown.propTypes = {
  children: PropTypes.node,
}

function Link(props) {
  return (
    <a href={props.href} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  )
}

Link.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string,
}
