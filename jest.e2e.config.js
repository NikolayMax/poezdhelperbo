module.exports = {
    displayName: 'e2e',
    // preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/e2e/**/?(*.)+(spec|test).+(ts|tsx|js)'],
    // setupFilesAfterEnv: ['./tests/setup/e2e.setup.ts'],
    coverageDirectory: 'coverage/e2e',
    testTimeout: 60000,
};