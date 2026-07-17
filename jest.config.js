/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  setupFiles: ["fake-indexeddb/auto"],
  testPathIgnorePatterns: ["/dist/"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        moduleResolution: "node",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        jsx: "react-jsx",
        target: "ES2020",
        module: "commonjs",
      }
    }]
  },
};
