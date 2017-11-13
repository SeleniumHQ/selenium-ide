import migrateProject from "./legacy/migrate";
const browser = window.browser;

export function saveProject(project) {
  project.version = "1.0";
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

export function loadProject(project, file) {
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (file.type === "application/json") {
      loadJSONProject(project, e.target.result);
    } else if (file.type === "text/html") {
      project.fromJS(migrateProject(e.target.result));
    }
  };

  fileReader.readAsText(file);
}

function loadJSONProject(project, data) {
  project.fromJS(JSON.parse(data));
}
