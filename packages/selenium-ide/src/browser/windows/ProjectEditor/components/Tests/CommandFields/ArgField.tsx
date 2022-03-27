import { ArgNames } from '@seleniumhq/side-model/src/ArgTypes'
import React, { FC } from 'react'
import CommandLocatorField from './LocatorField'
import CommandTextField from './TextField'
import { CommandArgFieldProps } from '../types'

const ArgField: FC<CommandArgFieldProps> = (props) => {
  const {
    commands,
    command: { command },
    fieldName,
  } = props
  const arg = commands[command][fieldName]?.name as ArgNames
  switch (arg) {
    case 'alert text':
    case 'answer':
    case 'array variable name':
    case 'conditional expression':
    case 'coord string':
    case 'expected value':
    case 'expression':
    case 'iterator variable name':
    case 'json':
    case 'key sequence':
    case 'loop limit':
    case 'message':
    case 'region':
    case 'resolution':
    case 'script':
    case 'test case':
    case 'text':
    case 'times':
    case 'url':
    case 'value':
    case 'variable name':
    case 'wait time':
    case 'window handle':
    case 'xpath':
      return <CommandTextField {...props} />
    case 'attribute locator':
    case 'form locator':
    case 'locator':
    case 'locator of drag destination object':
    case 'locator of object to be dragged':
    case 'option':
    case 'select locator':
      return <CommandLocatorField {...props} />
    default:
      return null
  }
}

export default ArgField
