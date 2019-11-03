const webpack = require("webpack");
const merge = require('webpack-merge');
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");
const base = require('./webpack.base.config');
const cp = require('child_process');

const isDev = process.env.NODE_ENV === "development";

const config = merge(base, {
  devtool: '#source-map',
  entry: './src/entry-client.js',
  plugins: isDev ? [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || 'development'),
      "process.env.VUE_ENV": '"client"'
    }),
    new VueSSRClientPlugin(),
  ]
  :
  [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || 'development'),
      "process.env.VUE_ENV": '"client"',
    }),
    new VueSSRClientPlugin(),
  ],
});

module.exports = config;
