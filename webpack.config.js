const path = require('path');

module.exports = {
	entry: {'_scss': './js/_.scss.js'},
	target: "web",
	output: {
		filename: '[name].js',
		chunkFilename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		library: "_SCSS",
	},
	module: {
		rules: [
			{
				test: /\.scss$/i,
				use: [
					// Creates `style` nodes from JS strings
					'style-loader',
					// Translates CSS into CommonJS
					{
						loader: 'css-loader',
						options: {
							modules: false
						}
					},
					// Compiles Sass to CSS
					'sass-loader',
				],
			},
		],
	},
};