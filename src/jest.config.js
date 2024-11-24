module.exports = {
    testEnvironment: "jest-environment-jsdom", // For DOM-based tests
    roots: ["<rootDir>/"], // Root directory of your project
    testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).[jt]s?(x)"], // Test file patterns
    testPathIgnorePatterns: ["/node_modules/", "/dist/"], // Ignore node_modules and dist folders
  
    // Collect coverage information
    collectCoverage: true,
    collectCoverageFrom: [
      "**/src/**/*.[jt]s?(x)", // Collect coverage from source files in src
      "!**/__tests__/**", // Exclude test files
      "!**/node_modules/**", // Exclude node_modules
      "!**/dist/**", // Exclude dist folder
      "**/home.js", // Exclude home.js globally
      "**/script.js"
    ],
    coverageDirectory: "<rootDir>/coverage", // Output directory for coverage reports
    coverageReporters: ["lcov", "text", "clover"], // Report formats
  
    reporters: [
      "default", // Default Jest reporter
      [
        "jest-junit",
        {
          outputDirectory: "reports", // Directory for JUnit XML report
          outputName: "junit.xml", // File name for the report
          classNameTemplate: "{filepath}", // Use file path as classname
          titleTemplate: "{title}", // Use test name as the title
        },
      ],
    ],
  };
  