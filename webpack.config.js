const path = require('path');

module.exports = {
  entry: {
    App: './en/assets/scripts/app.js'
  },
  output: {
    path: path.resolve(__dirname + './en/src/scripts'),
    filename: '[name].js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js.|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: [
            ["env"]
            //['es2015', {modules: false}],
          ],
        },
      },
    ],
  },
};