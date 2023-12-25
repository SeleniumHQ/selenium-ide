#!/usr/bin/env node
const { join } = require('path');
const { spawn } = require('child_process');
const electronPath = require('electron');

const appPath = join(__dirname, 'build', 'main-bundle.js');

const electronProcess = spawn(electronPath, [appPath]);
electronProcess.stdout.on('data', (data) => process.stdout.write(data));
electronProcess.stderr.on('data', (data) => process.stderr.write(data));
electronProcess.on('close', (code) => process.exit(code));
