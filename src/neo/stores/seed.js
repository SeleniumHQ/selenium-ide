import generate from "project-name-generator";

export default function seed(store) {
  function generateSuite() {
    return store.createSuite(generate({ words: 2}).spaced);
  }
  function generateTestCase() {
    return store.createTestCase(generate({ words: 2}).spaced);
  }
  function randomBetween(min, max) {
    return (Math.floor(Math.random() * (max - min)) + min);
  }
  const numberOfSuites = 5;
  for (let i = 0; i < numberOfSuites; i++) {
    let suite = generateSuite();
    for (let j = 0; j < randomBetween(1, 5); j++) {
      suite.addTestCase(generateTestCase());
    }
  }

  return store;
}
