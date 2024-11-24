module.exports = {
    testEnvironment: "jest-environment-jsdom", // Explicitly reference the package
    // roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    collectCoverage: true,
    collectCoverageFrom: [
      "src/**/*.{js,jsx}",
      "!src/**/*.d.ts",
      "!src/__tests__/**",
    ],
    coverageDirectory: "<rootDir>/coverage",
    transform: {
      "^.+\\.[tj]sx?$": "babel-jest",
    },
  };
  