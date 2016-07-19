
/**
 * Module dependencies.
 */
import WPError from 'wp-error';
import superagent from 'superagent';
import debugFactory from 'debug';

/**
 * Module variables
 */
const debug = debugFactory( 'wpcom-xhr-request' );

/**
 * WordPress.com REST API base endpoint.
 */
let proxyOrigin = 'https://public-api.wordpress.com';

/**
 * Default WordPress.com REST API Version.
 */
const defaultApiVersion = '1';

/**
 * Performs an XMLHttpRequest against the WordPress.com REST API.
 *
 * @param {Object|String} params - request parameters
 * @param {Function} fn - callback function
 * @return { XHR } xhr instance
 * @api public
 */
export default function request( params, fn ) {
	if ( 'string' === typeof params ) {
		params = { path: params };
	}

	// method
	const requestMethod = ( params.method || 'GET' ).toLowerCase();
	debug( 'API HTTP Method: %o', requestMethod );
	delete params.method;

	// apiNamespace (WP-API)
	const { apiNamespace } = params;
	delete params.apiNamespace;

	// apiVersion (REST-API)
	const apiVersion = params.apiVersion || defaultApiVersion;
	delete params.apiVersion;

	// proxyOrigin
	proxyOrigin = params.proxyOrigin || proxyOrigin;
	delete params.proxyOrigin;

	// request base path
	let basePath = '/rest/v' + apiVersion;

	// If this is a WP-API request, adjust basePath
	if ( apiNamespace && /\//.test( apiNamespace ) ) {
		// New-style WP-API URL: /wpcom/v2/sites/%s/post-counts
		basePath = '/' + apiNamespace;
	} else if ( apiNamespace ) {
		// Old-style WP-API URL (deprecated): /wp-json/sites/%s/wpcom/v2/post-counts
		basePath = '/wp-json';
	}

	// is REST-API api?
	const isRestAPI = apiNamespace === undefined;

	// Envelope mode FALSE as default
	let isEnvelopeMode = false;

	// process response in evelope mode TRUE as default
	const processResponseInEnvelopeMode = params.processResponseInEnvelopeMode !== false;

	const url = proxyOrigin + basePath + params.path;
	debug( 'API URL: %o', url );
	delete params.path;

	// create HTTP Request object
	const req = superagent[ requestMethod ]( url );

	// Token authentication
	if ( params.authToken ) {
		req.set( 'Authorization', 'Bearer ' + params.authToken );
		delete params.authToken;
	}

	// URL querystring values
	if ( params.query ) {
		req.query( params.query );
		debug( 'API send URL querystring: %o', params.query );

		isEnvelopeMode = isRestAPI
			? params.query.http_envelope
			: params.query._envelope;

		delete params.query;
	}

	// POST API request body
	if ( params.body ) {
		req.send( params.body );
		debug( 'API send POST body: %o', params.body );
		delete params.body;
	}

	// POST FormData (for `multipart/form-data`, usually a file upload)
	if ( params.formData ) {
		for ( let i = 0; i < params.formData.length; i++ ) {
			const data = params.formData[ i ];
			const key = data[ 0 ];
			const value = data[ 1 ];
			debug( 'adding FormData field %o', key );
			req.field( key, value );
		}
	}

	const requestHeaders = params.headers || {};
	for ( const key in requestHeaders ) {
		const value = requestHeaders[ key ];
		debug( 'adding HTTP header %o: %o', key, value );
		req.set( key, value );
	}

	if ( ! req.get( 'Accept' ) ) {
		// set a default "Accept" header preferring a JSON response
		req.set( 'Accept', '*/json,*/*' );
	}

	// start the request
	req.end( ( error, response ) => {
		if ( error && ! response ) {
			return fn( error );
		}

		let { body, headers, statusCode } = response;
		const { ok } = response;
		const { path, method } = response.req;
		headers.status = statusCode;

		debug( '%o -> %o headers', url, headers );
		debug( '%o -> %o status code', url, statusCode );

		if ( ok ) {
			if ( isEnvelopeMode && processResponseInEnvelopeMode ) {
				debug( 'processing response in envelope mode' );

				if ( isRestAPI ) {
					// in the REST-API the response comes wrapped in `code`, `headers` and `body` fields
					headers = body.headers;
					statusCode = body.code;
					body = body.body;
				} else {
					// in the WP-API the response comes wrapped in `body`, `status` and `headers`
					headers = body.headers;
					statusCode = body.status;
					body = body.body;
				}

				// let's add the status into the headers
				headers.status = statusCode;

				if ( null !== statusCode && 2 !== Math.floor( statusCode / 100 ) ) {
					debug( 'Error detected!' );
					const wpe = WPError( { path, method }, statusCode, body );
					return fn( wpe, null, headers );
				}
			}
			return fn( null, body, headers );
		}

		const wpe = WPError( { path, method }, statusCode, body );
		return fn( wpe, null, headers );
	} );

	return req.xhr;
}
