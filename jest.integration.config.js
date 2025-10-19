module.exports = {
    displayName: 'integration',
    // preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/integration/**/?(*.)+(spec|test).+(ts|tsx|js)'],
    // setupFilesAfterEnv: ['./tests/setup/integration.setup.ts'],
    coverageDirectory: 'coverage/integration',
    testTimeout: 30000,
};