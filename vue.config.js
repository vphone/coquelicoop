const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: ['quasar'],

  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false,
    },
    electronBuilder: {
      nodeIntegration: true,
    },
  },

  configureWebpack: {
    devServer: {
      client: {
        overlay: {
          runtimeErrors: (error) => {
            if (error.message === 'ResizeObserver loop limit exceeded') {
              return false
            }
            return true
          },
        },
      },
    },
  },
})
/*
const webpack = require('webpack')

const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: ['quasar'],

  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false,
    },
    electronBuilder: {
      nodeIntegration: true,
    },
  },

  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    devServer: {
      client: {
        overlay: {
          runtimeErrors: (error) => {
            if (error.message === 'ResizeObserver loop limit exceeded') {
              return false
            }
            return true
          },
        },
      },
    },
    resolve: {
      fallback: {
        fs: require.resolve('browserify-fs'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
      },
    },
  },
})

*/
