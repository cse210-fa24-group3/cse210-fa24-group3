module.exports = {
    // Correctly set the root directory for Jest to look for files
    // roots: ["src"],
  
    // Patterns to find test files
    testMatch: [
      "**/__tests__/**/*.[jt]s?(x)", // Tests inside __tests__ folder
      "**/?(*.)+(spec|test).[tj]s?(x)", // Matches *.spec.js or *.test.js
    ],
  
    // Ignore irrelevant directories
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  
    // Collect coverage and specify which files to include
    collectCoverage: true,
    testEnvironment: "jsdom", // Set the test environment to jsdom
    collectCoverageFrom: [
      "src/**/*.{js,jsx}", // Include all source files
      "!src/**/*.d.ts",    // Exclude TypeScript declaration files
      "!src/**/index.js",  // Exclude barrel files
      "!src/__tests__/**", // Exclude test files from coverage
    ],
  
    // Output directory for coverage reports
    coverageDirectory: "<rootDir>/coverage",
  
    // Formats for coverage reports
    coverageReporters: ["lcov", "text"],
  
    // Use node or jsdom for the environment (choose based on needs)
    testEnvironment: "node",
  
    // Transform files using Babel or other tools
    transform: {
      "^.+\\.[tj]sx?$": "babel-jest", // Use babel-jest for JS/TS
    },
  
    // Extensions Jest will resolve
    moduleFileExtensions: ["js", "jsx", "json", "node"],
  };
  