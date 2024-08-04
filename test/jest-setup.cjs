/* eslint-disable */
const dotenv = require('dotenv');
const path = require('node:path');

function loadTestingConfig() {
	dotenv.config({
		path: path.resolve(process.cwd(), '../', '.env.testing'),
	});
	if (process.env.WATCH_TEMPLATE_FILES === 'true') {
		throw new Error('WATCH_TEMPLATE_FILES prevents Jest from terminating, please disable it in env.testing');
	}
}
loadTestingConfig();