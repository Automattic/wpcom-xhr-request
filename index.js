
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
	expectStreamMode: false,
	onStreamRecord: () => {},
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
		processResponseInEnvelopeMode,
		expectStreamMode,
		onStreamRecord,
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
			// Endpoints in stream mode always send enveloped responses (see below).
			if ( ( isEnvelopeMode && processResponseInEnvelopeMode ) || expectStreamMode ) {
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

	// Endpoints in stream mode behave like ordinary endpoints, in that the response contains a JSON
	// representation of some value or WP_Error, but they will also stream other JSON records before
	// that (e.g. progress messages), in application/x-ndjson format.
	//
	// The intent is for the last line of a $stream mode response to be exactly the same as the non-
	// $stream response, but always enveloped as if we were in ?_envelope=1. The other JSON records
	// are also enveloped in the same way, but with .status == 100.
	//
	// I hate enveloping as a matter of principle, but it’s unavoidable in both of these cases. For
	// the last line, which represents the whole response in non-$stream mode, we need to convey the
	// HTTP status code after the body has started. For the other lines, we need an unambiguous way
	// to know that they’re not the last line, so we can exclude it without a “delay line”.
	if ( expectStreamMode ) {
		// Streaming responses is trickier than you might expect, with many footguns:
		// • req.buffer(false): no version of superagent implements this when running in the browser
		// • req.parse() or superagent.parse[]: only gets called when the response ends (see above)
		// • req.on("progress"): doesn’t seem to work... at all
		// • req.responseType(anything): makes superagent skip parse functions (see above)
		// • req.xhr.responseType="blob": XHR only exposes partial responses in "" or "text" modes
		// • req.xhr: only available after you call req.end()

		// Expose partial responses.
		// <https://xhr.spec.whatwg.org/#the-response-attribute>
		req.xhr.responseType = 'text';

		// Force the response to be treated as UTF-8. This is easier than the x-user-defined trick
		// that would otherwise be needed to access the raw binary response body.
		// <https://xhr.spec.whatwg.org/#final-charset>
		// <https://github.com/ndjson/ndjson-spec/blob/1.0/README.md#31-serialization>
		// <https://stackoverflow.com/a/33042003>
		req.xhr.overrideMimeType( 'application/x-ndjson; charset=utf-8' );

		// Find response chunks that end in a newline (possibly preceded by a carriage return), then
		// for each chunk except the last, parse it as JSON and pass that to onStreamRecord.
		// <https://github.com/ndjson/ndjson-spec/blob/1.0/README.md#31-serialization>
		// <https://github.com/ndjson/ndjson-spec/blob/1.0/README.md#32-parsing>
		// <https://stackoverflow.com/a/38440028>
		let lastLine = null;
		let start = 0;

		req.xhr.addEventListener( 'progress', ( { target } ) => {
			// Don’t use ProgressEvent#loaded in this algorithm. It measures progress in octets,
			// while we’re working with text that has already been decoded from UTF-8 into a string
			// that can only be indexed in UTF-16 code units. Reconciling this difference is not
			// worth the effort, and might even be impossible if there were encoding errors.
			let stop;
			while ( true ) {
				stop = target.response.indexOf( '\n', start );

				if ( stop < 0 ) {
					// Leave start untouched for the next progress event, waiting for the newline
					// that indicates we’ve finished receiving a full line.
					break;
				}

				lastLine = target.response.slice( start, stop );

				// Note: not ignoring empty lines.
				// <https://github.com/ndjson/ndjson-spec/blob/1.0/README.md#32-parsing>
				const record = JSON.parse( lastLine.trim() );

				// Non-last lines should have .status == 100.
				if ( record.status < 200 ) {
					debug( 'stream mode: record=%o', record );
					onStreamRecord( record.body );
				}

				// Make subsequent searches start *after* the newline.
				start = stop + 1;
			}
		} );

		// Parse the last response chunk as above, but pass it to the higher layers as The Response.
		// Note: not ignoring empty lines.
		// <https://github.com/ndjson/ndjson-spec/blob/1.0/README.md#32-parsing>
		req.parse( () => JSON.parse( lastLine.trim() ) );
	}

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
