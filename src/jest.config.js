module.exports = {
    testEnvironment: "jest-environment-jsdom", // Required for DOM-based tests
    roots: ["<rootDir>/"],
    testMatch: ["**/__tests__/**/*.[jt]s?(x)"], // Matches all test files in __tests__
  testPathIgnorePatterns: ["/node_modules/", "/dist/"], // Ignore node_modules and dist folders
  collectCoverage: true,
  collectCoverageFrom: [
    "**/__tests__/**/*.[jt]s?(x)", // Collect coverage only from test files in __tests__
  ],
  coveragePathIgnorePatterns: [
    "/home.js$", // Ignore home.js from coverage
  ],
    coverageDirectory: "<rootDir>/coverage",
    reporters: [
      "default",
      [
        "jest-junit",
        {
          collectCoverage: true,
          coverageReporters: ['lcov', 'text', 'clover'],
          outputDirectory: "reports", // Directory for JUnit XML report
          outputName: "junit.xml", // File name for the report
          classNameTemplate: "{filepath}", // Use file path as classname
          titleTemplate: "{title}", // Use test name as the title
        },
      ],
    ],
  };
  
