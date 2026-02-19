const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: isProduction ? "production" : "development",
    entry: "./src/renderer/src/index.tsx",
    target: "web",
    devtool: isProduction ? false : "source-map",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.json",
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/i,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext]",
          },
        },
      ],
    },
    devServer: {
      static: {
        directory: path.join(__dirname, "./dist/renderer"),
      },
      port: 4000,
      hot: true,
      compress: false,
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: isProduction ? "js/[name].[contenthash:8].js" : "js/[name].js",
      path: path.resolve(__dirname, "./dist/renderer"),
      globalObject: "self",
      clean: true,
    },
    optimization: isProduction
      ? {
          minimize: true,
          splitChunks: {
            chunks: "all",
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: "vendor",
                chunks: "all",
              },
            },
          },
          moduleIds: "deterministic",
          concatenateModules: true,
        }
      : undefined,
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/renderer/index.html",
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
            }
          : false,
      }),
    ],
  };
};
