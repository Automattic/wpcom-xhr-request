/* eslint-disable no-console */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import xhr from '../';
import { siteDomain, wporgProxyOrigin, siteId, postId } from './config';
import { authToken, formData } from './util';

/**
 * Expose xhr for development purpose
 */
describe( 'wpcom-xhr-request', () => {
	// *** REST-API
	describe( '.com', () => {
		describe( 'REST-API', () => {
			describe( 'v1.1', () => {
				describe( 'successful requests', () => {
					describe( 'http_envelope:0', () => {
						it( `[1.1] [GET] should get WordPress blog - post \`${postId}\``, done => {
							xhr( {
								path: `/sites/${ siteDomain }/posts/${ postId }`,
								apiVersion: '1.1'
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body ).to.be.ok;
								expect( body.ID ).to.be.a( 'number' );
								expect( body.ID ).to.be.equal( postId );
								expect( body.site_ID ).to.be.a( 'number' );
								expect( body.site_ID ).to.be.equal( siteId );

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 200 );

								done();
							} );
						} );

						it( '[1.1] [GET] should get `Me` user data', done => {
							xhr( {
								path: '/me',
								apiVersion: '1.1',
								authToken
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body ).to.be.ok;
								expect( body.ID ).to.be.a( 'number' );

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 200 );

								done();
							} );
						} );

						it( '[1.1] [GET] should get `Me` passing headers', done => {
							xhr( {
								path: '/me',
								apiVersion: '1.1',
								headers: {
									Authorization: `Bearer ${ authToken }`,
									Accept: '*/json,*/*'
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body ).to.be.ok;
								expect( body.ID ).to.be.a( 'number' );

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 200 );

								done();
							} );
						} );

						it( '[1.1] [POST] should add a new post', done => {
							xhr( {
								path: `/sites/${ siteDomain }/posts/new`,
								method: 'POST',
								apiVersion: '1.1',
								authToken,
								body: {
									title: 'wpcom-xhr-request testing post',
									description: 'Add a testing post from cli-test / wpcom-xhr-request'
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body ).to.be.ok;
								expect( body.ID ).to.be.a( 'number' );

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 200 );

								done();
							} );
						} );

						it( '[1.1] [POST] should upload a media file', done => {
							xhr( {
								path: `/sites/${ siteDomain }/media/new`,
								method: 'POST',
								apiVersion: '1.1',
								authToken,
								formData
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body ).to.be.ok;
								expect( body ).to.be.an( 'object' );
								expect( body.media ).to.be.an( 'array' );
								expect( body.media[ 0 ].ID ).to.be.a( 'number' );

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 200 );

								done();
							} );
						} );
					} );

					describe( 'http_envelope:1', () => {
						it( `[1.1] [GET] should get WordPress blog - post \`${postId}\``, done => {
							xhr( {
								path: `/sites/${ siteDomain }/posts/${ postId }`,
								apiVersion: '1.1',
								query: {
									http_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body ).to.be.ok;
								expect( body.ID ).to.be.a( 'number' );
								expect( body.ID ).to.be.equal( postId );
								expect( body.site_ID ).to.be.a( 'number' );
								expect( body.site_ID ).to.be.equal( siteId );

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 200 );
								done();
							} );
						} );

						it( '[1.1] [GET] should get `Me` user data', done => {
							xhr( {
								path: '/me',
								apiVersion: '1.1',
								authToken,
								query: {
									http_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body ).to.be.ok;
								expect( body.ID ).to.be.a( 'number' );

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 200 );

								done();
							} );
						} );
					} );
				} );

				describe( 'wrong requests', () => {
					describe( 'http_envelope:0', () => {
						it( '[1.1] [GET] should get `404` for a non-exiting route', done => {
							xhr( {
								path: '/this-route-does-not-exists',
								apiVersion: '1.1'
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'NotFoundError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );

						it( '[1.1] [GET] should get `404` for a non-existing site', done => {
							xhr( {
								path: '/sites/this-site-does-not-exit-i-hope',
								apiVersion: '1.1'
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'UnknownBlogError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );

						it( '[1.1] [GET] should get `404` for a non-existing post', done => {
							xhr( {
								path: `/sites/${ siteDomain }/posts/0`,
								apiVersion: '1.1'
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'UnknownPostError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );

						it( '[1.1] [GET] should get `403` for a authorization-required error', done => {
							xhr( {
								path: '/me',
								apiVersion: '1.1'
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'AuthorizationRequiredError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 403 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 403 );

								done();
							} );
						} );

						it( '[1.1] [GET] should get `400` for an invalid token', done => {
							xhr( {
								path: '/me',
								apiVersion: '1.1',
								authToken: String( Math.random() ).substr( 2 )
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'InvalidTokenError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 400 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 400 );

								done();
							} );
						} );
					} );

					describe( 'http_envelope:1', () => {
						it( '[1.1] [GET] should get `404` for a non-exiting route', done => {
							xhr( {
								path: '/this-route-does-not-exists',
								apiVersion: '1.1 ',
								query: {
									http_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'NotFoundError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );

						it( '[1.1] [GET] should get `404` for a non-existing site', done => {
							xhr( {
								path: '/sites/this-site-does-not-exit-i-hope',
								apiVersion: '1.1',
								query: {
									http_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'UnknownBlogError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );

						it( '[1.1] [GET] should get `404` for a non-existing post', done => {
							xhr( {
								path: `/sites/${ siteDomain }/posts/0`,
								apiVersion: '1.1',
								query: {
									http_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'UnknownPostError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );

						it( '[1.1] [GET] should get `403` for a authorization-required error', done => {
							xhr( {
								path: '/me',
								apiVersion: '1.1',
								query: {
									http_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'AuthorizationRequiredError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 403 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 403 );

								done();
							} );
						} );

						it( '[1.1] [GET] should get `400` for an invalid token', done => {
							xhr( {
								path: '/me',
								apiVersion: '1.1',
								authToken: String( Math.random() ).substr( 2 ),
								query: {
									http_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'InvalidTokenError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 400 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 400 );

								done();
							} );
						} );
					} );
				} );
			} );
		} );

		describe( 'WP-API', () => {
			describe( 'wp/v2', () => {
				describe( 'successful requests', () => {
					describe( '_envelope:0', () => {
						it( `[wp/v2] [GET] should get WordPress blog - post \`${postId}\``, done => {
							xhr( {
								path: `/sites/${ siteDomain }/posts/${ postId }`,
								apiNamespace: 'wp/v2'
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body ).to.be.ok;
								expect( body.id ).to.be.a( 'number' );
								expect( body.id ).to.be.equal( postId );
								expect( body.type ).to.be.equal( 'post' );

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 200 );

								done();
							} );
						} );
					} );

					describe( '_envelope:1', () => {
						it( `[wp/v2] [GET] should get WordPress blog - post \`${postId}\``, done => {
							xhr( {
								path: `/sites/${ siteDomain }/posts/${ postId }`,
								apiNamespace: 'wp/v2',
								query: {
									_envelope: 1,
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body ).to.be.ok;
								expect( body.id ).to.be.a( 'number' );
								expect( body.id ).to.be.equal( postId );
								expect( body.type ).to.be.equal( 'post' );

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 200 );

								done();
							} );
						} );
					} );
				} );

				describe( 'wrong requests', () => {
					describe( '_envelope:0', () => {
						it( '[wp/v2] [GET] should get `404` for a non-exiting route', done => {
							xhr( {
								path: '/this-route-does-not-exists',
								apiNamespace: 'wp/v2'
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'NotFoundError' );
								expect( error.message ).to.be.equal(
									'No route was found matching the URL and request method'
								);
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );

						it( '[wp/v2] [GET] should get `404` for a non-exiting post', done => {
							xhr( {
								path: `/sites/${ siteDomain }/posts/0`,
								apiNamespace: 'wp/v2'
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'NotFoundError' );
								expect( error.message ).to.be.equal( 'Invalid post id.' );
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );

						it( '[wp/v2] [GET] should get `403` for a authorization-required error', done => {
							xhr( {
								path: `/sites/${ siteDomain }/users/me`,
								apiNamespace: 'wp/v2'
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'UnauthorizedError' );
								expect( error.message ).to.be.equal( 'You are not currently logged in.' );
								expect( error.statusCode ).to.be.equal( 401 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 401 );

								done();
							} );
						} );
					} );

					describe( '_envelope:1', () => {
						it( '[wp/v2] [GET] should get `404` a non-existing post', done => {
							xhr( {
								path: `/sites/${ siteDomain }/posts/${ postId }/0`,
								apiNamespace: 'wp/v2',
								query: {
									_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'NotFoundError' );
								expect( error.message ).to.be.equal(
									'No route was found matching the URL and request method'
								);
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );

						it( '[wp/v2] [GET] should get `404` for a non-exiting post', done => {
							xhr( {
								path: `/sites/${ siteDomain }/posts/0`,
								apiNamespace: 'wp/v2',
								query: {
									_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'NotFoundError' );
								expect( error.message ).to.be.equal( 'Invalid post id.' );
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );

						it( '[wp/v2] [GET] should get `403` for a authorization-required error', done => {
							xhr( {
								path: `/sites/${ siteDomain }/users/me`,
								apiNamespace: 'wp/v2',
								query: {
									_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'UnauthorizedError' );
								expect( error.message ).to.be.equal( 'You are not currently logged in.' );
								expect( error.statusCode ).to.be.equal( 401 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 401 );

								done();
							} );
						} );
					} );
				} );
			} );

			describe( 'wpcom/v2', () => {
				describe( 'successful requests', () => {
					describe( '_envelope:0', () => {
						it( '[wpcom/v2] [GET] should get timezones list', function( done ) {
							xhr( {
								path: '/timezones',
								apiNamespace: 'wpcom/v2'
							}, ( error, body ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body.found ).to.be.ok;
								expect( body.found ).to.be.a( 'number' );
								expect( body.timezones ).to.be.an( 'array' );

								done();
							} );
						} );
					} );

					describe( '_envelope:1', () => {
						it( '[wpcom/v2] [GET] should get timezones list', function( done ) {
							xhr( {
								path: '/timezones',
								apiNamespace: 'wpcom/v2',
								query: {
									_envelope: 1
								}
							}, ( error, body ) => {
								// error
								expect( error ).to.be.not.ok;

								// body
								expect( body ).to.be.ok;
								expect( body.found ).to.be.a( 'number' );
								expect( body.timezones ).to.be.an( 'array' );

								done();
							} );
						} );
					} );
				} );

				describe( 'wrong requests', () => {
					describe( '_envelope:0', () => {
						it( '[wpcom/v2] [GET] should get `404` for a non-exiting route', done => {
							xhr( {
								path: '/this-route-does-not-exists',
								apiNamespace: 'wpcom/v2'
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'NotFoundError' );
								expect( error.message ).to.be.equal(
									'No route was found matching the URL and request method'
								);
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );
					} );

					describe( '_envelope:1', () => {
						it( '[wpcom/v2] [GET] should get `404` for a non-exiting route', done => {
							xhr( {
								path: '/this-route-does-not-exists',
								apiNamespace: 'wpcom/v2',
								query: {
									_envelope: 1
								}
							}, ( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'NotFoundError' );
								expect( error.message ).to.be.equal(
									'No route was found matching the URL and request method'
								);
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							} );
						} );
					} );
				} );
			} );
		} );

		describe( 'WP-API unknown/apiNamespace', () => {
			it( 'should get `404` for non-existing path', ( done ) => {
				xhr( {
					path: '/',
					apiNamespace: 'unknown/apiNamespace'
				}, ( error, body, headers ) => {
					expect( error ).to.be.ok;
					expect( error.name ).to.be.equal( 'NotFoundError' );
					expect( error.message ).to.be.equal(
						'The specified path was not found. ' +
						'Please visit https://developer.wordpress.com/docs/ for valid paths.'
					);
					expect( error.statusCode ).to.be.equal( 404 );

					// body
					expect( body ).to.be.not.ok;

					// headers
					expect( headers ).to.be.ok;
					expect( headers.status ).to.be.equal( 404 );

					done();
				} );
			} );
		} );
	} );

	describe( '.org (retrofocs.wpsandbox.me)', () => {
		describe( 'wp/v2', () => {
			describe( 'successful requests', () => {
				describe( '_envelope:0', () => {
					it( '[wp/v2] [GET] should get api structure', done => {
						xhr( {
							path: '',
							proxyOrigin: wporgProxyOrigin,
							apiNamespace: 'wp/v2'
						}, ( error, body, headers ) => {
							// error
							expect( error ).to.be.not.ok;

							// body
							expect( body ).to.be.ok;
							expect( body.namespace ).to.be.a( 'string' );
							expect( body.namespace ).to.be.equal( 'wp/v2' );
							expect( body.routes ).to.be.a( 'object' );
							expect( body.routes[ '/wp/v2' ] ).to.be.ok;

							// headers
							expect( headers ).to.be.ok;
							expect( headers.status ).to.be.equal( 200 );

							done();
						} );
					} );

					it( '[wp/v2] [GET] should get site posts list', done => {
						xhr( {
							path: '/posts',
							proxyOrigin: wporgProxyOrigin,
							apiNamespace: 'wp/v2'
						}, ( error, body, headers ) => {
							// error
							expect( error ).to.be.not.ok;

							// body
							expect( body ).to.be.ok;
							expect( body ).to.be.an( 'array' );

							// headers
							expect( headers ).to.be.ok;
							expect( headers.status ).to.be.equal( 200 );

							done();
						} );
					} );
				} );

				describe( '_envelope:1', () => {
					it( '[wp/v2] [GET] should get api structure', done => {
						xhr( {
							path: '',
							proxyOrigin: wporgProxyOrigin,
							apiNamespace: 'wp/v2',
							query: {
								_envelope: 1,
							}
						}, ( error, body, headers ) => {
							// error
							expect( error ).to.be.not.ok;

							// body
							expect( body ).to.be.ok;
							expect( body.namespace ).to.be.a( 'string' );
							expect( body.namespace ).to.be.equal( 'wp/v2' );
							expect( body.routes ).to.be.a( 'object' );

							// headers
							expect( headers ).to.be.ok;
							expect( headers.status ).to.be.equal( 200 );

							done();
						} );
					} );

					it( '[wp/v2] [GET] should get site posts list', done => {
						xhr( {
							path: '/posts',
							proxyOrigin: wporgProxyOrigin,
							apiNamespace: 'wp/v2',
							query: {
								_envelope: 1
							}
						}, ( error, body, headers ) => {
							// error
							expect( error ).to.be.not.ok;

							// body
							expect( body ).to.be.ok;
							expect( body ).to.be.an( 'array' );

							// headers
							expect( headers ).to.be.ok;
							expect( headers.status ).to.be.equal( 200 );

							done();
						} );
					} );
				} );
			} );

			describe( 'wrong requests', () => {
				describe( '_envelope:0', () => {
					it( '[wp/v2] [GET] should get `404` for a non-exiting route', done => {
						xhr( {
							path: '/this-route-does-not-exists',
							proxyOrigin: wporgProxyOrigin,
							apiNamespace: 'wp/v2'
						}, ( error, body, headers ) => {
							// error
							expect( error ).to.be.ok;
							expect( error.name ).to.be.equal( 'NotFoundError' );
							expect( error.message ).to.be.equal(
								'No route was found matching the URL and request method'
							);
							expect( error.statusCode ).to.be.equal( 404 );

							// body
							expect( body ).to.be.not.ok;

							// headers
							expect( headers ).to.be.ok;
							expect( headers.status ).to.be.equal( 404 );

							done();
						} );
					} );

					it( '[wp/v2] [GET] should get 404 for a non-existing post', done => {
						xhr( {
							path: '/posts/0',
							proxyOrigin: wporgProxyOrigin,
							apiNamespace: 'wp/v2'
						}, ( error, body, headers ) => {
							// error
							expect( error ).to.be.ok;
							expect( error.name ).to.be.equal( 'NotFoundError' );
							expect( error.message ).to.be.equal( 'Invalid post id.' );
							expect( error.statusCode ).to.be.equal( 404 );

							// body
							expect( body ).to.be.not.ok;

							// headers
							expect( headers ).to.be.ok;
							expect( headers.status ).to.be.equal( 404 );

							done();
						} );
					} );

					it( '[wp/v2] [GET] should get `403` for a authorization-required error', done => {
						xhr( {
							path: '/users/me',
							proxyOrigin: wporgProxyOrigin,
							apiNamespace: 'wp/v2'
						}, ( error, body, headers ) => {
							// error
							expect( error ).to.be.ok;
							expect( error.name ).to.be.equal( 'UnauthorizedError' );
							expect( error.message ).to.be.equal( 'You are not currently logged in.' );
							expect( error.statusCode ).to.be.equal( 401 );

							// body
							expect( body ).to.be.not.ok;

							// headers
							expect( headers ).to.be.ok;
							expect( headers.status ).to.be.equal( 401 );

							done();
						} );
					} );
				} );

				describe( '_envelope:1', () => {
					it( '[wp/v2] [GET] should get `404` a non-existing route', done => {
						xhr( {
							path: '/this-route-does-not-exists',
							proxyOrigin: wporgProxyOrigin,
							apiNamespace: 'wp/v2',
							query: {
								_envelope: 1
							}
						}, ( error, body, headers ) => {
							expect( error ).to.be.ok;
							expect( error.name ).to.be.equal( 'NotFoundError' );
							expect( error.message ).to.be.equal(
								'No route was found matching the URL and request method'
							);

							// body
							expect( body ).to.be.not.ok;

							// headers
							expect( headers ).to.be.ok;
							expect( headers.status ).to.be.equal( 404 );

							done();
						} );
					} );

					it( '[wp/v2] [GET] should get 404 for a non-existing post', done => {
						xhr( {
							path: '/posts/0',
							proxyOrigin: wporgProxyOrigin,
							apiNamespace: 'wp/v2',
							query: {
								_envelope: 1
							}
						}, ( error, body, headers ) => {
							// error
							expect( error ).to.be.ok;
							expect( error.name ).to.be.equal( 'NotFoundError' );
							expect( error.message ).to.be.equal( 'Invalid post id.' );
							expect( error.statusCode ).to.be.equal( 404 );

							// body
							expect( body ).to.be.not.ok;

							// headers
							expect( headers ).to.be.ok;
							expect( headers.status ).to.be.equal( 404 );

							done();
						} );
					} );

					it( '[wp/v2] [GET] should get `403` for a authorization-required error', done => {
						xhr( {
							path: '/users/me',
							apiNamespace: 'wp/v2',
							proxyOrigin: wporgProxyOrigin,
							query: {
								_envelope: 1
							}
						}, ( error, body, headers ) => {
							// error
							expect( error ).to.be.ok;
							expect( error.name ).to.be.equal( 'UnauthorizedError' );
							expect( error.message ).to.be.equal( 'You are not currently logged in.' );
							expect( error.statusCode ).to.be.equal( 401 );

							// body
							expect( body ).to.be.not.ok;

							// headers
							expect( headers ).to.be.ok;
							expect( headers.status ).to.be.equal( 401 );

							done();
						} );
					} );
				} );
			} );
		} );
	} );
} );
