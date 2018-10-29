var webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {

	entry: './src/js/main.js',
	mode: 'development',
	devtool: 'source-map',

	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: true // set to true if you want JS source maps
			}),
			new OptimizeCSSAssetsPlugin({})
		],
		splitChunks: {
			cacheGroups: {
				styles: {
					name: 'styles',
					test: /\.css$/,
					chunks: 'all',
					enforce: true
				}
			}
		}
	},

	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			'window.jQuery': 'jquery',
			Popper: ['popper.js', 'default']
		}),

		new MiniCssExtractPlugin({})
	],

	module: {
		rules: [{
			test: /\.js$/,
			parser: {
				amd: false,
			}
		},
		{
			test: /\.css$/,
			use: [MiniCssExtractPlugin.loader, 'css-loader']
		}]
	}
}