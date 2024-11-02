module.exports = {
  setupFilesAfterEnv: [
    "@testing-library/jest-dom",
    "<rootDir>/jest.setup.js"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!@firebase)",
    "node_modules/(?!@firebase|node-fetch)"
  ],
  moduleNameMapper: {
    "^firebase$": "<rootDir>/__mocks__/firebase.js"
  },
  testEnvironment: "node",
  globals: {
      "process.env.FIRESTORE_EMULATOR_HOST": "127.0.0.1:8080"
  },
};
