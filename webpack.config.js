const path = require('path');
const nodeExternals = require('webpack-node-externals');

const getWebpackConfig = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const mode = isProduction === true ? 'production' : 'development';

  return {
    entry: path.resolve('./src/app.ts'),
    watch: isProduction === false,
    mode,
    target: 'node',
    output: {
      path: path.resolve('./build'),
      filename: 'index.js',
    },
    resolve: {
      extensions: ['.webpack.js', '.ts'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: ['ts-loader'],
          exclude: /node_modules/,
        },
      ],
    },
    externals: [nodeExternals()],
  };
};

module.exports = getWebpackConfig;
