import convert from "xml-js";

export default function migrateProject(data) {
  const result = JSON.parse(convert.xml2json(data, { compact: true }));
  const project = {
    name: result.html.head.title._text,
    url: result.html.head.link._attributes.href,
    urls: [result.html.head.link._attributes.href],
    tests: [
      {
        name: result.html.body.table.thead.tr.td._text,
        commands: result.html.body.table.tbody.tr.map(row => (
          {
            command: row.td[0]._text || "",
            target: parseTarget(row.td[1]),
            value: row.td[2]._text || ""
          }
        ))
      }
    ],
    suites: []
  };

  return project;
}

function parseTarget(targetCell) {
  if (targetCell._text) {
    if (targetCell._text instanceof Array) {
      return targetCell._text.join("<br />");
    } else {
      return targetCell._text;
    }
  } else {
    return "";
  }
}
