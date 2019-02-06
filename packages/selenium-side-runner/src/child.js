if (process.env.NODE_ENV == null) {
  process.env.NODE_ENV = 'test'
}

require('jest-cli/build/cli').run()
