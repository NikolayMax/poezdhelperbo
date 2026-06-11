module.exports = {
	apps: [{
		name: 'poezdhelperbot',
		script: 'dist/app.js',
		instances: 1,
		exec_mode: 'fork',
		env: {
			NODE_ENV: 'production',
		},
	}],
};
