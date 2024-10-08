const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: ['quasar'],
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false,
    },
    electronBuilder: {
      build: {
        appId: 'balance',
      },
      builderOptions: {
        mac: {
          icon: './scale.icns',
        },
        linux: {
          category: 'Utility'
        }
      },
      nodeIntegration: true,
      externals: ['serialport'],
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
