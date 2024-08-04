/* eslint-disable */
const commonJestConfig = require('./jest.config.cjs');

module.exports = {
	...commonJestConfig,
	testRegex: '(?<!\\.e2e)\\.test\\.ts$',
	"moduleNameMapper": {
		"^(\\.\\.?\\/.+)\\.js$": "$1",
	},
};