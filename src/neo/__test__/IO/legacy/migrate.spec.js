/* eslint-disable */
import fs from "fs";
import path from "path";
import { useStrict } from "mobx";
import migrateProject from "../../../IO/legacy/migrate";

useStrict(true);

describe("selenium html migrate", () => {
  it("should migrate the set example", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test.html"));
    const project = migrateProject(file);
    expect(project.name).toBe("My Test");
    expect(project.url).toBe("https://www.google.com/");
    expect(project.urls.length).toBe(1);
  });
});
