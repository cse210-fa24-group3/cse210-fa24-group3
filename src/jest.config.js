module.exports = {
    testEnvironment: "jest-environment-jsdom", // Required for DOM-based tests
    // roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    collectCoverage: true,
    collectCoverageFrom: [
      "/**/*.{js,jsx}",
      "/**/*.d.ts",
      "/__tests__/**",
    ],
    coverageDirectory: "<rootDir>/coverage",
    reporters: [
      "default",
      [
        "jest-junit",
        {
          outputDirectory: "reports", // Directory for JUnit XML report
          outputName: "junit.xml", // File name for the report
          classNameTemplate: "__tests__/home.test.js", // Use file path as classname
          titleTemplate: "renders home component", // Use test name as the title
        },
      ],
    ],
  };
  
