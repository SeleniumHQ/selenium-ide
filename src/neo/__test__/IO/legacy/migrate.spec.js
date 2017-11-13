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
    expect(project.suites).toBeInstanceOf(Array);
    expect(project.tests.length).toBe(1);
    const test = project.tests[0];
    expect(test.commands.length).toBe(4);
    const command = test.commands[0];
    expect(command.command).toBe("open");
    expect(command.target).toBe("/?gfe_rd=cr&dcr=0&ei=9vz6Way_KdPPXqjmsbgI&gws_rd=ssl");
    expect(command.value).toBe("");
  });
  it("should migrate the second example", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_2.html"));
    const project = migrateProject(file);
    expect(project.tests[0].commands.length).toBe(26);
  });
  it("should join line breaks to <br /> in the target field", () => {
    const file = fs.readFileSync(path.join(__dirname, "IDE_test_2.html"));
    const project = migrateProject(file);
    expect(project.tests[0].commands[8].target).toBe("//a[contains(text(),'Most<br />                                followers')]");
  });
});
