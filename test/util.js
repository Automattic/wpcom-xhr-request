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

// grab token even from config file or TOKEN env var
const { token } = config;
export const authToken = process.env.TOKEN || token;

export const siteDomain = 'wpcomjstest.wordpress.com';
export const wporgProxyOrigin = 'http://retrofocs.wpsandbox.me/wp-json';
export const siteId = 91295513;
export const postId = 18828;

// media file

export const mediaFiles = [
	{
		title: 'WordPress logo',
		description: 'Nice WordPress logo',
		file: './test/wordpress-logo.png'
	},
	'./test/wordpress-logo-2.png',
	'./test/wordpress-logo-3.png'
];
export const formData = [];
const file = fs.createReadStream( mediaFiles[ 1 ] );
formData.push( [ 'media[]', file ] );
export const formData2 = [];
const file2 = fs.createReadStream( mediaFiles[ 2 ] );
formData2.push( [ 'media[]', file2 ] );
