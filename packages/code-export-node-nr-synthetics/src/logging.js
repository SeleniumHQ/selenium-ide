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


/**
 *
 * @param timeout
 * @param stepLogging
 * @param insightsKey
 * @returns {{endTestCase: endTestCase, postInsights: postInsights, log: log, getStep: (function(): number), end: end, error: error, logStep: logStep}}
 * @constructor
 */
const Logger = function( {timeout = 3000,  stepLogging=false, insightsKey=''}) {
  const startTime = Date.now()


  var stepStartTime = 0,
    prevMsg = '',
    currStep = 0,
    prevStep = 0

  function postInsights({step=0, msg='', duration=0,  eventType='SyntheticsCustom', custom={}}){
    if (typeof insightsKey == 'undefined' || insightsKey == '')
      return;

    var insightsOptions = {
      method: 'POST',
      headers: {
        'X-Insert-Key': insightsKey,
        'Content-Type': 'application/json'
      },
      data: {
        eventType,
        step,
        message:msg,
        duration,
        JOB_ID: $env.JOB_ID,
        MONITOR_ID: $env.MONITOR_ID,
        ACCOUNT_ID: $env.ACCOUNT_ID,
        LOCATION: $env.LOCATION,
        PROXY_HOST: $env.PROXY_HOST,
        PROXY_PORT: $env.PROXY_PORT,
      },
      dataType: 'text',
    };

    const url=`https://insights-collector.newrelic.com/v1/accounts/${$env.ACCOUNT_ID}/events`

    insightsOptions.data = Object.assign({}, insightsOptions.data,  custom)
    // insightsOptions.data = {...insightsOptions.data , ...custom }

    urlRequest(url, insightsOptions)
  }

  function getStep() {
    return currStep
  }

  function logStep(msg) {
    log(currStep++, msg)
  }

  function log(thisStep, thisMsg, testCase='') {
    if (thisStep > prevStep && prevStep != 0) {
      end({testCase})
    }

    stepStartTime = Date.now() - startTime
    let msg = `Step ${thisStep}: ${thisMsg} STARTED at ${stepStartTime}ms. testCase=${testCase}`;
    console.log(msg)

    prevMsg = thisMsg
    prevStep = thisStep
  }

  function end({testCase=''}) {
    var totalTimeElapsed = Date.now() - startTime
    var prevStepTimeElapsed = totalTimeElapsed - stepStartTime

    console.log(`Step ${prevStep}: ${prevMsg} FINISHED. It took ${prevStepTimeElapsed}ms to complete. testCase=${testCase}`);

    // use Step log msgs as attributes in Insights
    if (stepLogging && insightsKey.length >0 ) {
      // $util.insights.set(`Step ${prevStep}: ${prevMsg}`, prevStepTimeElapsed)
      postInsights({step:prevStep, msg:prevMsg, duration: prevStepTimeElapsed, custom:{testCase}})
    }


    if (timeout > 0 && totalTimeElapsed > timeout) {
      throw new Error(
        'Script timed out. ' +
          totalTimeElapsed +
          'ms is longer than script timeout threshold of ' +
          timeout +
          'ms.'
      )
    }
  }

  function endTestCase(testCase="") {
    var totalTimeElapsed = Date.now() - startTime
    var prevStepTimeElapsed = totalTimeElapsed - stepStartTime

    console.log(`Step ${prevStep}: ${prevMsg} FINISHED. It took ${prevStepTimeElapsed}ms to complete.`)

    // use Step log msgs as attributes in Insights
    if (stepLogging && insightsKey.length >0 ) {
      // $util.insights.set(`Step ${prevStep}: ${prevMsg}`, prevStepTimeElapsed)
      postInsights({step:prevStep, msg:prevMsg, duration: prevStepTimeElapsed, custom:{testCase}})
    }

    $util.insights.set('testCase', testCase)
    $util.insights.set(`testCaseStatus`, 'Pass')

    if (stepLogging && insightsKey.length >0 ) {
      postInsights({eventType:'SyntheticsTests', custom:{testCase, testCaseStatus:'Pass'}})
    }


  }

  function error(err,testCase="") {

    console.log(`Error in Step ${prevStep}: ${prevMsg}`)

    $util.insights.set(`errorStep`, `${prevStep}`)
    $util.insights.set(`errorMsg`, err.message)
    $util.insights.set(`errorLineNumber`, err.lineNumber)
    $util.insights.set(`testCase`, testCase)
    $util.insights.set(`testCaseStatus`, 'fail')


    if (stepLogging && insightsKey.length >0 ) {
      postInsights({eventType:'SyntheticsTests', custom:{testCase, testCaseStatus:'Fail'}})
    }

  }

  return {
    logStep,
    log,
    getStep,
    end,
    endTestCase,
    error,
    postInsights,
  }
}

export default Logger
