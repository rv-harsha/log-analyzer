const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  /*devtool: 'inline-source-map',*/
  devServer: {
    contentBase: './dist',
    /*hot: true*/
  },
  resolve: {
        alias: {
            "markjs": "datatables.mark.js/dist/datatables.mark.min.js"
        }
    },
  optimization: {
  splitChunks: {
    cacheGroups: {
      styles: {
        name: 'styles',
        test: /\.css$/,
        chunks: 'all',
        enforce: true,
      },
    },
  },
  minimizer: [
     new UglifyJsPlugin({
       parallel: true,
       sourceMap: true,
     }),
   ],
},
  plugins: [

  ],
  output: {
    publicPath: ''
  }, module: {
      rules: [
        {
          test: /\.css$/,
          use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
            'css-loader'
          ]
        },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg|jp(e*)g|gif|ejs)$/,
          use: [
            'file-loader'
          ]
        },
       {
         test: /\.m?js$/,
         exclude: /(node_modules|bower_components)/,
         use: {
           loader: 'babel-loader',
           options: {
             presets: ['@babel/preset-env',"@babel/react"],
             plugins: ['@babel/plugin-proposal-object-rest-spread',"@babel/plugin-transform-runtime","@babel/plugin-proposal-class-properties"]
           }
         }
       }
      ]
    }
  }
);
