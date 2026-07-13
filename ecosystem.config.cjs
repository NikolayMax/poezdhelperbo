module.exports = {
	apps: [{
		name: 'poezdhelperbot',
		script: 'dist/app.js',
		instances: 1,
		exec_mode: 'fork',
		log_date_format: 'YYYY-MM-DD HH:mm:ss',
		env: {
			NODE_ENV: 'production',
			NODE_TLS_REJECT_UNAUTHORIZED: '0',
		},
	}],
};
