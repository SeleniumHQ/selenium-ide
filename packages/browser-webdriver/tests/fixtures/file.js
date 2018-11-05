/* eslint-disable */
function handleFiles(e) {
  const file = e.target.files[0]

  const reader = new FileReader()
  reader.onload = function(e) {
    const r = document.getElementById('r')
    r.innerText = e.target.result
  }
  reader.readAsText(file)
}

const up = document.getElementById('f')
up.addEventListener('change', handleFiles)
