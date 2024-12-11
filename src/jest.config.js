
module.exports = {

  testEnvironment: "jest-environment-node",
  // testEnvironment: "jest-environment-jsdom",
  roots: ["<rootDir>/"],
  testMatch: ["**/__tests__/*.test.js", "**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  collectCoverage: true,
  collectCoverageFrom: [
    "**/src/**/*.[jt]s?(x)", // Collect coverage from source files in src
    "!**/__tests__/**", // Exclude test files
    "!**/node_modules/**", // Exclude node_modules
    "!**/dist/**", // Exclude dist folder
    "**/home.js", // Include home.js globally
    "!**/script.js" // Exclude script.js
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["lcov", "text", "clover"],

  reporters: [
      "default",
      [
          "jest-junit",
          {
              outputDirectory: "reports",
              outputName: "junit.xml",
              classNameTemplate: "{filepath}",
              titleTemplate: "{title}",
          },
      ],
  ],

  transform: {
      "^.+\\.jsx?$": "babel-jest",
  },

  moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/__mocks__/fileMock.js",
  },
};
