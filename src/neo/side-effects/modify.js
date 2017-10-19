import { spy } from "mobx";

export default function(project) {
  spy((event) => {
    if (event.object && event.object.constructor.name === "ProjectStore" && event.type === "action" && event.name !== "setModified") {
      project.setModified();
    }
  });
}
