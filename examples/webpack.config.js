module.exports = {
	entry: __dirname + '/../build/index.js',
	output: {
		path: __dirname + '/browser/dist/',
		filename: 'wpcom-xhr-request.js',
		libraryTarget: 'var',
		library: 'WPCOMXhrHandler'
	},
	devtool: 'sourcemap'
};
