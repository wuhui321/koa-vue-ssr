const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

const isDev = process.env.NODE_ENV === "development";

module.exports = {
  output: {
    path: path.resolve(__dirname, '../../public/site_v2/mobile/'),
    publicPath: '/static/',
    filename: 'js/[name].js'
  },

  resolve: {
    extensions: [".js", ".vue", ".json"],
    alias: {
      vue$: "vue/dist/vue.esm.js",
      '@': path.join(__dirname, `../../site_v2/mobile`),
    }
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, '../../site_v2/mobile')],
        use: [{
            loader: "babel-loader",
            options: {
                presets: [
                    [
                        "@babel/preset-env",
                        {
                            targets: {
                                chrome: 52
                            }
                        }
                    ]
                ],
                plugins: ["@babel/plugin-syntax-dynamic-import"]
            }
        }]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "url-loader",
        options: {
          limit: 100000,
          name: "[name].[ext]?[hash]"
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "[name].[ext]?[hash]"
        }
      },
      {
        test: /\.css$/,
        use: isDev ? [
          'vue-style-loader',
          "css-loader"
        ] : [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
      {
        test: /\.less$/,
        use: [
            'vue-style-loader',
            'css-loader',
            'less-loader',
        ],
      },
    ]
  },
  performance: {
    hints: false
  },
  plugins: isDev ? [
    new VueLoaderPlugin(),
    new FriendlyErrorsPlugin(),
  ]
  :
  [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[name].css"
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  mode: isDev ? 'development' : 'production',
};
