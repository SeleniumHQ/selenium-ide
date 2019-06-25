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

//
// New Relic Synthetics
//



import Logger from './logging'

export default {
  commands: seleneseCommands,
}


function seleneseCommands() {

  var _step=0

  return {

    incrementStep: ()=>{
      return _step++
    },

    getStep:()=>{
      return _step
    },

    open: function Open() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.get("__LOCATOR__").then(val => {
        return val
      })
    },


    setWindow: function SetWindow() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.manage().window().setSize(__WIDTH__, __HEIGHT__)
        .then(val => {
          return val
        })
    },


    click: function Click() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          el.click()
          return Promise.resolve(true)
        })
    },


    select: function Select() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(function (el1) {

          el1.click()
          logger.log(__STEP__, "__LOG_MSG2__", "__TC_NAME__")
          return $browser.waitForAndFindElement(__LOCATOR2__, DefaultTimeout)
            .then(function (el2) {
              el2.click()
              return Promise.resolve(true)
            })
        })
    },


    switchToDefaultContent: function SwitchToDefaultContent() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return Promise.resolve( $browser.switchTo().defaultContent())
    },


    switchToFrameByIndex: function SwitchToFrameByIndex() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return Promise.resolve( $browser.switchTo().frame(__LOCATOR__))
    },


    switchToFrame: function SwitchToFrame() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          return Promise.resolve( $browser.switchTo().frame(el))
        })
    },


    switchToWindowUseHandle: function SwitchToWindow() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return Promise.resolve($browser.switchTo().window(__LOCATOR__))
    },


    switchToWindowUseIndex: function SwitchToWindowUseIndex() {

      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.getWindowHandle().then(el => {

        logger.log(__STEP__, "__LOG_MSG2__")
        return Promise.resolve( $browser.switchTo().window(el.get(__LOCATOR__)))
      })
    },


    sendKeys: function SendKeys() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")

      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          el.sendKeys(__KEY__)
          return Promise.resolve(true)
        })
    },

    storeAttribute: function StoreAttribute() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          
          return el.getAttribute("__ATTRIB_A__")
        })
        .then(el => {
          __CUSTOM_SETTER__
        })
    },

    uncheck: function Uncheck() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          return el.isSelected()
            .then(isSelected => {

              if (isSelected) {
                el.click()
              }
              return Promise.resolve(true)

            })
        })
    },

    verifyChecked: function VerifyChecked() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          return el.isSelected()
            .then(isSelected => {
              assert(isSelected)
              return Promise.resolve(true)
            })
        })
    },

    verifyNotChecked: function VerifyNotChecked() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          return el.isSelected()
            .then(isSelected => {
              assert(!isSelected)
              return Promise.resolve(true)
            })
        })
    },

    verifyEditable: function VerifyEditable() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          return el.isEnabled()
            .then(isEnabled => {

              assert(isEnabled)
              return el.getAttribute("readonly")
                .then(isReadOnly => {
                  assert((isEnabled && (isReadOnly == null)))
                  return Promise.resolve(true)
                })
            })
        })
    },

    verifyNotEditable: function VerifyNotEditable() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          return el.isEnabled()
            .then(isEnabled => {

              assert(isEnabled)
              return el.getAttribute("readonly")
                .then(isReadOnly => {
                  assert((isEnabled && (isReadOnly == null) == false))
                  return Promise.resolve(true)
                })
            })
        })
    },


    verifyElementPresent: function VerifyElementPresent() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          assert(elements.size() > 0)
          return Promise.resolve(true)
        })
    },

    verifyElementNotPresent: function VerifyElementNotPresent() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          assert(elements.size() == 0)
          return Promise.resolve(true)
        })
    },


    verifyNotSelectedValue: function VerifyNotSelectedValue() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          return el.getAttribute("value")
            .then(value => {
              assert.notEqual(value, "__EXPECTED_VALUE__")
              return Promise.resolve(true)
            })

        })
    },

    verifySelectedLabel: function VerifySelectedLabel() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el => {
          return el.getAttribute("value")
            .then(value => {
              let xpath=`//option[@value="${value}"]`
              return $browser.waitForAndFindElement(By.xpath(xpath), DefaultTimeout)
                .then(el=>{
                  return el.getText()
                })
                .then(function (text) {
                  assert.strictEqual(text, "__LABLE_VALUE__")
                  return Promise.resolve(true)
                })
            })

        })
    },



    verifyText: function VerifyText() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)

        .then(el => {
          return el.getText()
            .then(value => {
              assert.strictEqual("__TEXT__", value)
              return Promise.resolve(true)
            })

        })
    },


    verifyValue: function VerifyValue() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)

        .then(el => {
          return el.getAttribute("value")
            .then(value => {
              assert.strictEqual("__TEXT__", value)
              return Promise.resolve(true)
            })

        })
    },


    verifyTitle: function VerifyTitle() {

      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.getTitle()
        .then(result => {
          assert.strictEqual("__TEXT__", result.trim())
          return Promise.resolve(true)
        })
    },


    waitForElementEditable: function WaitForElementEditable() {
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, __TIMEOUT__)
        .then(el=>{
          return el
        })
    },

    waitForElementVisible: function WaitForElementVisible(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, __TIMEOUT__)
        .then(el=>{
          return $browser.wait($driver.until.elementIsVisible(el))
            .then(isVisible=>{
              assert(isVisible)
              return Promise.resolve(true)
            })
        })
    },

    waitForElementNotEditable: function WaitForElementNotEditable(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, __TIMEOUT__)
        .then(el=>{
          return $browser.wait($driver.until.elementIsDisabled(el))
            .then(isDisabled =>{
              assert(isDisabled)
              return Promise.resolve(true)
            })
        })
    },


    waitForElementNotPresent: function WaitForElementNotPresent(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, __TIMEOUT__)
        .then(el=>{
          return $browser.wait($driver.until.elementIsNotVisible(el))
            .then( isNotVisible => {
              assert(isNotVisible)
              return Promise.resolve(true)
            })
        })
    },

    answerOnNextPrompt: function AnswerOnNextPrompt(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.switchTo().alert().sendKeys("__TEXT__")
        .then(el=>{
          alert.accept()
          return Promise.resolve(true)
        })
    },

    assert: function Assert(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      assert.equal(vars.get("__VAR_NAME__"), __VALUE__ )
      return Promise.resolve(true)

    },

    assertAlert: function AssertAlert(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.switchTo().alert().getText()
        .then(text=>{
          assert.equal(text, "__TEXT__")
          return Promise.resolve(true)
        })
    },


    check: function Check(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then(el =>{

          return el.isSelected()
            .then(function (isSelected){
              if (!isSelected){
                el.click()
              }
              return Promise.resolve(true)
            })
        })
    },


    chooseCancelOnNextConfirmation: function ChooseCancelOnNextConfirmation(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return Promise.resolve($browser.switchTo().alert().dismiss())

    },


    chooseOkOnNextConfirmation: function ChooseOkOnNextConfirmation(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return Promise.resolve($browser.switchTo().alert().accept())
    },

    close: function Close(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return Promise.resolve($browser.close())
    },

    doubleClickElement: function DoubleClickElement(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then( el =>{
          return Promise.resolve($browser.actions().doubleClick(el).perform())
      })
    },


    dragAndDrop: function DragAndDrop(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then( draggedEle  =>{

          return $browser.waitForAndFindElement(__LOCATOR2__, DefaultTimeout)
            .then( droppedEle  =>{
              logger.log(__STEP__, "__LOG_MSG2__", "__TC_NAME__")
              return Promise.resolve($browser.actions().dragAndDrop(draggedEle, droppedEle ).perform())
            })
        })
    },

    editContent: function EditContent(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then( e =>{
          return $browser.executeScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '__CONTENT__'}", e);
        })
    },

    mouseDown: function MouseDown(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then( el =>{
          return Promise.resolve($browser.actions().mouseDown(el).perform())
        })
    },

    mouseMove: function MouseMove(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then( el =>{
          return Promise.resolve($browser.actions().mouseMove(el).perform())
        })
    },


    mouseOut: function MouseOut(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then( el =>{
          return Promise.resolve($browser.actions().mouseMove(el,0,0).perform())
        })
    },

    mouseUp: function MouseUp(){
      logger.log(__STEP__, "__LOG_MSG__", "__TC_NAME__")
      return $browser.waitForAndFindElement(__LOCATOR__, DefaultTimeout)
        .then( el =>{
          return Promise.resolve($browser.actions().mouseUp(el).perform())
        })
    },


    endOfTests: function EndOfTest() {
      const tmp =
        '\t.then(function() {\n' +
        "\t\tlogger.endTestCase(\"__TC_NAME__\");\n" +
        '\t}, function(err) {\n' +
        "\t\tlogger.error (err, \"__TC_NAME__\");\n" +
        '\t\tthrow(err);\n' +
        '\t});\n\n'
      return tmp
    },

    setStep: (c)=>{
      _step=c
    }

  }// end Selenese Commands
}

