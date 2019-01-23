import React from 'react'
import classNames from 'classnames'
import './style.css'

export default class InfoBadge extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className={classNames('icon', 'si-info-badge-1', 'info-badge')} />
        <div className={classNames('icon', 'si-info-badge-2', 'info-badge')} />
        <div className={classNames('icon', 'si-info-badge-3', 'info-badge')} />
      </React.Fragment>
    )
  }
}
