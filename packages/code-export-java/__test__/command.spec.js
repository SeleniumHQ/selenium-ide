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

import CommandEmitter from '../src/command'

describe('Command Emitting', () => {
  it('should emit `click` command', () => {
    const command = {
      command: 'click',
      target: 'link=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).toBe(
      'driver.findElement(By.linkText("button")).click();'
    )
  })
  it('should emit `open` with absolute url', () => {
    const command = {
      command: 'open',
      target: 'https://www.seleniumhq.org/',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).toBe(
      `driver.get("${command.target}");`
    )
  })
  it('should emit `setWindowSize`', () => {
    const command = {
      command: 'setWindowSize',
      target: '1440x1177',
      value: '',
    }
    expect(CommandEmitter.emit(command)).toBe(
      `driver.manage().window().setSize(new Dimension(1440, 1177));`
    )
  })
  it('should emit `type` command', () => {
    const command = {
      command: 'type',
      target: 'id=input',
      value: 'example input',
    }
    expect(CommandEmitter.emit(command)).toBe(
      `driver.findElement(By.id("input")).sendKeys("${command.value}");`
    )
  })
  it('should emit `assert text` command', () => {
    const command = {
      command: 'assertText',
      target: 'id=test',
      value: 'some text that should be here',
    }
    expect(CommandEmitter.emit(command)).toBe(
      `assertThat(driver.findElement(By.id("test")).getText(), is("${
        command.value
      }"));`
    )
  })
})
