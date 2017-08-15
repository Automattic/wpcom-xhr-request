
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
 * Defauts
 */
const defaults = {
	apiVersion: '1',
	apiNamespace: 'wp/v2',
	authToken: null,
	body: null,
	formData: null,
	headers: null,
	method: 'get',
	query: null,
	processResponseInEnvelopeMode: true,
	proxyOrigin: 'https://public-api.wordpress.com',
	url: ''
};

/**
 * Send the request
 *
 * @param  {Superagent} req - request instance
 * @param  {Object} settings - request settings
 * @param  {Function} fn - callback function
 * @return {Superagent} request instance
 */
const sendResponse = ( req, settings, fn ) => {
	const {
		isEnvelopeMode,
		isRestAPI,
		processResponseInEnvelopeMode
	} = settings;

	req.end( ( error, response ) => {
		if ( error && ! response ) {
			return fn( error );
		}

		let { body, headers, statusCode } = response;

		const { ok } = response;
		const { path, method } = response.req;
		headers.status = statusCode;

		if ( ok ) {
			if ( isEnvelopeMode && processResponseInEnvelopeMode ) {
				// override `error`, body` and `headers`
				if ( isRestAPI ) {
					headers = body.headers;
					statusCode = body.code;
					body = body.body;
				} else {
					headers = body.headers;
					statusCode = body.status;
					body = body.body;
				}

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

	return req;
};

/**
 * Returns `true` if `v` is a File Form Data, `false` otherwise.
 *
 * @param {Mixed} v - instance to analize
 * @return {Boolean} `true` if `v` is a DOM File instance
 * @private
 */
function isFile( v ) {
	return v instanceof Object &&
		'undefined' !== typeof( Blob ) &&
		v.fileContents instanceof Blob;
}

/**
 * Performs an XMLHttpRequest against the WordPress.com REST API.
 *
 * @param {Object|String} options - `request path` or `request parameters`
 * @param {Function} fn - callback function
 * @return { XHR } xhr instance
 * @api public
 */
export default function request( options, fn ) {
	if ( 'string' === typeof options ) {
		options = { path: options };
	}

	const settings = Object.assign( {}, defaults, options );

	// is REST-API api?
	settings.isRestAPI = options.apiNamespace === undefined;

	// normalize request-method name
	settings.method = settings.method.toLowerCase();

	const {
		apiNamespace,
		apiVersion,
		authToken,
		body,
		formData,
		headers,
		isRestAPI,
		method,
		query,
		proxyOrigin
	} = settings;

	// request base path
	let basePath;

	if ( isRestAPI ) {
		basePath = `/rest/v${ apiVersion }`;
	} else if ( apiNamespace && /\//.test( apiNamespace ) ) {
		basePath = '/' + apiNamespace;	// wpcom/v2
	} else {
		basePath = '/wp-json'; // /wp-json/sites/%s/wpcom/v2 (deprecated)
	}

	// Envelope mode FALSE as default
	settings.isEnvelopeMode = false;

	settings.url = proxyOrigin + basePath + settings.path;
	debug( 'API URL: %o', settings.url );

	// create HTTP Request instance
	const req = superagent[ method ]( settings.url );

	// querystring
	if ( query ) {
		req.query( query );
		debug( 'API send URL querystring: %o', query );

		settings.isEnvelopeMode = isRestAPI ? query.http_envelope : query._envelope;
		debug( 'envelope mode: %o', settings.isEnvelopeMode );
	}

	// body
	if ( body && formData ) {
		debug( 'API ignoring body because formData is set. They cannot both be used together.' );
	}
	if ( body && ! formData ) {
		req.send( body );
		debug( 'API send POST body: %o', body );
	}

	// POST FormData (for `multipart/form-data`, usually a file upload)
	if ( formData ) {
		for ( let i = 0; i < formData.length; i++ ) {
			const data = formData[ i ];
			const key = data[ 0 ];
			const value = data[ 1 ];
			debug( 'adding FormData field %o: %o', key, value );

			if ( isFile( value ) ) {
				req.attach( key, new File( [ value.fileContents ], value.fileName ) );
			} else {
				req.field( key, value );
			}
		}
	}

	// headers
	if ( headers ) {
		req.set( headers );
		debug( 'adding HTTP headers: %o', headers );
	}

	if ( authToken ) {
		req.set( 'Authorization', `Bearer ${ authToken }` );
	}

	if ( ! req.get( 'Accept' ) ) {
		// set a default "Accept" header preferring a JSON response
		req.set( 'Accept', '*/json,*/*' );
	}

	sendResponse( req, settings, fn );

	return req.xhr;
}
