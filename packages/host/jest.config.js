module.exports = {
  roots: ["src"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "src/__tests__/tsconfig.json" }],
  },
  projects: ["./jest.tsd.config.js"],
};
