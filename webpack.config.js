var webpack = require("webpack");

module.exports = {

	entry: './src/js/main.js',
	module: {

		rules: [{
			test: /\.js$/,
			parser: {
				amd: false,
			}
		},
		{
			test: /\.css$/,
			use: ['style-loader', 'css-loader']
		}]
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			'window.jQuery': 'jquery',
			Popper: ['popper.js', 'default']
		})
	]
}