const browser = window.browser;

export function saveProject(project) {
  downloadProject(project);
}

function downloadProject(project) {
  browser.downloads.download({
    filename: project.name + ".json",
    url: createBlob("application/json", project.toJSON()),
    saveAs: true,
    conflictAction: "overwrite"
  });
}

let previousFile = null;
function createBlob(mimeType, data) {
  const blob = new Blob([data], {
    type: "text/plain"
  });
  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (previousFile !== null) {
    window.URL.revokeObjectURL(previousFile);
  }
  previousFile = window.URL.createObjectURL(blob);
  return previousFile;
}
