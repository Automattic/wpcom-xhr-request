module.exports = {
	entry: __dirname + '/../build/index.js',

	node: {
		fs: 'empty'
	},

	output: {
		path: __dirname + '/browser/dist/',
		filename: 'wpcom-xhr-request.js',
		libraryTarget: 'var',
		library: 'WPCOMXhrHandler'
	},

	resolve: {
		extensions: [ '', '.js' ]
	},

	devtool: 'sourcemap'
};
