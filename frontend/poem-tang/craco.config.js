const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              "@primary-color": "#9A9DEA",
              "@link-color": "#686A9E",
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
