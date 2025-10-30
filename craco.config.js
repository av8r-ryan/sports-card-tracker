// CRACO configuration for Create React App overrides
// This enables better tree shaking and bundle optimization

const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Enable tree shaking optimizations
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        usedExports: true,
        sideEffects: false,
        providedExports: true,
        concatenateModules: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Optimize module resolution for better tree shaking
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        mainFields: ['browser', 'module', 'main'],
        alias: {
          ...webpackConfig.resolve.alias,
          // Add aliases for better tree shaking
          '@': path.resolve(__dirname, 'src'),
          '@components': path.resolve(__dirname, 'src/components'),
          '@utils': path.resolve(__dirname, 'src/utils'),
          '@hooks': path.resolve(__dirname, 'src/hooks'),
          '@services': path.resolve(__dirname, 'src/services'),
          '@types': path.resolve(__dirname, 'src/types'),
        },
      };

      return webpackConfig;
    },
  },
  babel: {
    plugins: [
      // Remove unused imports
      ['babel-plugin-transform-imports', {
        'lodash': {
          transform: 'lodash/${member}',
          preventFullImport: true,
        },
      }],
    ],
  },
};
