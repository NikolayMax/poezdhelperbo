module.exports = {
	displayName: 'unit',
	// preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['./tests/unit/**/*.test.ts'],
	// setupFilesAfterEnv: ['./tests/setup/unit.setup.ts'],
	coverageDirectory: 'coverage/unit',
	testTimeout: 5000,
};
