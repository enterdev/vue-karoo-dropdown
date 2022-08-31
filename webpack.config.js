const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader"
      },
      {
        test: /\.js$/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    },
  },
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "../public"),
    port: 2030,
    publicPath: "/dist/"
  },
  plugins: [
    new VueLoaderPlugin()
  ]
};
