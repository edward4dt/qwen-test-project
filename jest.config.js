/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  setupFiles: ["fake-indexeddb/auto"],
  testPathIgnorePatterns: ["/dist/"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}]
  },
};
