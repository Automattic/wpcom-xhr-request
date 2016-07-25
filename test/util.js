/**
 * Internal dependencies
 */
let config;

try {
	config = require( './config' );
} catch ( ex ) {
	config = {};
}

const { token } = config;

// gran token event from config file or TOKEN env var
export const authToken = token || process.env.TOKEN;