/* eslint-disable */
module.exports = {
	collectCoverage: false,
	coverageDirectory: '<rootDir>/test/coverage',
	coverageReporters: ['json', 'lcov', 'clover'],
	maxConcurrency: 1,
	maxWorkers: 1,
	moduleFileExtensions: [
		'js',
		'json',
		'ts',
	],
	rootDir: '..',
	testEnvironment: 'node',
	testRegex: '\\.test\\.ts$',
	transform: {
		'^.+\\.(t|j)s$': '@swc/jest',
	},
	setupFilesAfterEnv: [
		'<rootDir>/test/jest-setup.cjs',
		'jest-extended/all',
	],
	verbose: true,
	testTimeout: 10_000,
};

if (process.env.GITHUB_ACTIONS === 'true') {
	module.exports.reporters = [
		[
			'github-actions',
			{
				silent: false,
			},
		],
		'summary',
	];
}
