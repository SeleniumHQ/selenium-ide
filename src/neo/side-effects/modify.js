import { spy } from "mobx";

export default function(project) {
  spy((event) => {
    if (event.type === "action" && event.name !== "setModified") {
      project.setModified();
    }
  });
}
