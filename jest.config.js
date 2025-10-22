module.exports = {
	// preset: 'ts-jest',
	// testEnvironment: 'node',
	// testMatch: [
	//     '**/__tests__/**/*.+(ts|tsx|js)',
	//     '**/?(*.)+(spec|test).+(ts|tsx|js)'
	// ],
	projects: ['./jest.unit.config.js', './jest.integration.config.js', './jest.e2e.config.js'],
};
