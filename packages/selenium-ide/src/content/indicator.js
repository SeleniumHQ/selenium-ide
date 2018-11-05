var handleMessage = (function() {
  var content = document.getElementById('content')
  var lastTimeoutHandle = 0
  function resetContent() {
    content.innerText = 'Selenium IDE is recording...'
    content.style.color = '#E80600'
    content.style.animation = 'fadeIn 1s infinite alternate'
  }
  return function(event) {
    if (event.data && event.data.direction === 'from-recording-module') {
      clearTimeout(lastTimeoutHandle)
      content.innerText = 'Recorded ' + event.data.command
      content.style.color = '#4592f9'
      content.style.animation = 'none'
      lastTimeoutHandle = setTimeout(resetContent, 1000)
    }
  }
})()
window.addEventListener('message', handleMessage)
