const path = require('path');

module.exports = {
  devServer: {
    allowedHosts: 'all',
    host: 'localhost',
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
  },
}; 