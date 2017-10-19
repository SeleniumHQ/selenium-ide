import { spy } from "mobx";

export default function(project) {
  let disposer = spy((event) => {
    if (!project.modified && event.object && event.object.constructor.name !== "UiState" && event.type === "action" && event.name !== "setModified") {
      project.setModified();
    } else if (project.modified) {
      setTimeout(disposer, 0);
    }
  });
}
