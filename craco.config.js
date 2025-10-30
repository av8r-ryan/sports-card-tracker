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

      // Add module rules for better tree shaking
      webpackConfig.module.rules.push({
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: 'esnext',
                target: 'es2015',
                moduleResolution: 'node',
                allowSyntheticDefaultImports: true,
                esModuleInterop: true,
                skipLibCheck: true,
                strict: false,
                forceConsistentCasingInFileNames: true,
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: 'react-jsx',
              },
            },
          },
        ],
      });

      return webpackConfig;
    },
  },
  babel: {
    plugins: [
      // Add Babel plugins for better tree shaking
      ['@babel/plugin-transform-runtime', {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: true,
      }],
      // Remove unused imports
      ['babel-plugin-transform-imports', {
        'lodash': {
          transform: 'lodash/${member}',
          preventFullImport: true,
        },
        'react-bootstrap': {
          transform: 'react-bootstrap/${member}',
          preventFullImport: true,
        },
        'framer-motion': {
          transform: 'framer-motion/dist/${member}',
          preventFullImport: true,
        },
      }],
    ],
  },
  // Add optimization for production builds
  optimization: {
    minimize: true,
    minimizer: [
      // Add Terser plugin with tree shaking optimizations
      new (require('terser-webpack-plugin'))({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
          },
          mangle: {
            safari10: true,
          },
          output: {
            comments: false,
            ascii_only: true,
          },
        },
        extractComments: false,
      }),
    ],
  },
};
