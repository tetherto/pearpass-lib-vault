export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  testPathIgnorePatterns: ['/node_modules/', '/.yalc/'],
  transformIgnorePatterns: [
    'node_modules/(?!(pear-apps-utils-validator|pear-apps-utils-pattern-search)/)'
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
}
