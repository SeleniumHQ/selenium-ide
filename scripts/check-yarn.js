#!/usr/bin/env node
'use strict'

if (!/yarn\.js$/.test(process.env.npm_execpath)) {
  console.error('⚠️    Use yarn not npm!   ⚠️')
  console.error('https://yarnpkg.com/en/docs/install')
  process.exit(1)
}
