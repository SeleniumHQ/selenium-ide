var handleMessage = (function() {
  var content = document.getElementById('content')
  var circle = document.getElementById('circle')
  var img = document.getElementById('ide-img')
  img.src = (window.chrome ? chrome : browser).runtime.getURL(
    '/icons/icon_light128.png'
  )
  var lastTimeoutHandle = 0

  function resetContent() {
    content.innerText = 'Selenium IDE is recording...'
    content.setAttribute('aria-label', 'Selenium IDE is recording...')
    content.setAttribute('role', 'alert')
    content.style.color = '#E80600'
    circle.style.animation = 'fadeIn 1s infinite alternate'
    circle.style.visibility = 'visible'
  }
  return function(event) {
    if (event.data && event.data.direction === 'from-recording-module') {
      clearTimeout(lastTimeoutHandle)
      content.innerText = 'Recorded ' + event.data.command
      content.style.color = '#114990'
      circle.style.animation = 'none'
      circle.style.visibility = 'hidden'
      lastTimeoutHandle = setTimeout(resetContent, 1000)
    }
  }
})()
window.addEventListener('message', handleMessage)
