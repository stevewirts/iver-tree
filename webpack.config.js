const path = require('path'),
      webpack = require('webpack'),
      CleanWebpackPlugin = require('clean-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractPlugin = new ExtractTextPlugin({ filename: './assets/css/app.css' });

const config = {

  // absolute path for project root
  context: path.resolve(__dirname, 'src'),

  entry: {
    // relative path declaration
    "bundle": './app.js',
  },

  output: {
    // absolute path declaration
    path: path.resolve(__dirname, 'dist'),
    filename: './assets/js/[name].js'
  },

  module: {
    rules: [

      // babel-loader with 'env' preset
      { test: /\.js$/, include: /src/, exclude: /node_modules/, use: { loader: "babel-loader", options: { presets: ['env'] } } },
      // html-loader
      { test: /\.html$/, use: ['html-loader'] },
      // sass-loader with sourceMap activated
      {
          test: /\.scss$/,
          use: [{
              loader: "style-loader",
              options: {
                sourceMap: true
              }
          }, {
              loader: "css-loader",
              options: {
                sourceMap: true
              }
          }, {
              loader: "sass-loader",
              options: {
                  includePaths: [path.resolve(__dirname, 'src', 'assets', 'scss')],
                  sourceMap: true
              }
          }]
      },
      // file-loader(for images)
      { test: /\.(jpg|png|gif|svg)$/, use: [ { loader: 'file-loader', options: { name: '[name].[ext]', outputPath: './assets/media/' } } ] },
      // file-loader(for fonts)
      { test: /\.(woff|woff2|eot|ttf|otf)$/, use: ['file-loader'] }

    ]
  },

  plugins: [
    // cleaning up only 'dist' folder
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      filename: 'hypertree.html',
      template: 'hypertree.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'simpletable.html',
      template: 'simpletable.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html'
    }),
    extractPlugin
  ],

  devServer: {
    // static files served from here
    contentBase: path.resolve(__dirname, "./dist/assets/media"),
    compress: true,
    // open app in localhost:2000
    port: 2000,
    stats: 'errors-only',
    open: true
  },

  devtool: 'inline-source-map'

};

module.exports = config;