/**
 * External dependencies
 */
const fs = require( 'fs' );

/**
 * Internal dependencies
 */
let config;

try {
	config = require( './config' );
} catch ( ex ) {
	config = {};
}

const { token, mediaFiles } = config;

// gran token event from config file or TOKEN env var
export const authToken = token || process.env.TOKEN;

// media file
export const formData = [];
const file = fs.createReadStream( mediaFiles[ 1 ] );
formData.push( [ 'media[]', file ] );
