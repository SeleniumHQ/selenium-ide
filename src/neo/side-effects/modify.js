import { spy } from "mobx";

function isDomainModel(object) {
  return (object && (
    object.constructor.name === "ProjectStore" ||
    object.constructor.name === "Suite" ||
    object.constructor.name === "TestCase" ||
    object.constructor.name === "Command"
  ));
}

export default function(project) {
  let disposer = spy((event) => {
    if (!project.modified && isDomainModel(event.object) && event.type === "action" && event.name !== "setModified") {
      project.setModified();
    } else if (project.modified) {
      setTimeout(disposer, 0);
    }
  });
}
