"use strict";

const nodeExternals = require("webpack-node-externals");
const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const resolve = require("resolve");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");
const ESLintPlugin = require("eslint-webpack-plugin");
const paths = require("./paths");
const modules = require("./modules");
const getClientEnvironment = require("./env");
const ModuleNotFoundPlugin = require("react-dev-utils/ModuleNotFoundPlugin");
const ForkTsCheckerWebpackPlugin =
  process.env.TSC_COMPILE_ON_ERROR === "true"
    ? require("react-dev-utils/ForkTsCheckerWarningWebpackPlugin")
    : require("react-dev-utils/ForkTsCheckerWebpackPlugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const getCacheIdentifier = require("react-dev-utils/getCacheIdentifier");
const createEnvironmentHash = require("./webpack/persistentCache/createEnvironmentHash");

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";

const reactRefreshRuntimeEntry = require.resolve("react-refresh/runtime");
const reactRefreshWebpackPluginRuntimeEntry = require.resolve(
  "@pmmmwh/react-refresh-webpack-plugin"
);
const babelRuntimeEntry = require.resolve("babel-preset-react-app");
const babelRuntimeEntryHelpers = require.resolve(
  "@babel/runtime/helpers/esm/assertThisInitialized",
  { paths: [babelRuntimeEntry] }
);
const babelRuntimeRegenerator = require.resolve("@babel/runtime/regenerator", {
  paths: [babelRuntimeEntry],
});

const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== "false";

const emitErrorsAsWarnings = process.env.ESLINT_NO_DEV_ERRORS === "true";
const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === "true";

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || "10000"
);

const useTypeScript = fs.existsSync(paths.appTsConfig);
const useTailwind = fs.existsSync(
  path.join(paths.appPath, "tailwind.config.js")
);
const swSrc = paths.swSrc;

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === "true") {
    return false;
  }

  try {
    require.resolve("react/jsx-runtime");
    return true;
  } catch (e) {
    return false;
  }
})();

module.exports = function (webpackEnv) {
  const isEnvDevelopment = webpackEnv === "development";
  const isEnvProduction = webpackEnv === "production";

  const serverConfig = {
    target: "node",
    externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()],
  };

  const isEnvProductionProfile =
    isEnvProduction && process.argv.includes("--profile");

  const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

  const shouldUseReactRefresh = env.raw.FAST_REFRESH;

  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve("style-loader"),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: paths.publicUrlOrPath.startsWith(".")
          ? { publicPath: "../../" }
          : {},
      },
      {
        loader: require.resolve("css-loader"),
        options: cssOptions,
      },
      {
        loader: require.resolve("postcss-loader"),
        options: {
          postcssOptions: {
            ident: "postcss",
            config: false,
            plugins: !useTailwind
              ? [
                  "postcss-flexbugs-fixes",
                  [
                    "postcss-preset-env",
                    {
                      autoprefixer: {
                        flexbox: "no-2009",
                      },
                      stage: 3,
                    },
                  ],
                  "postcss-normalize",
                ]
              : [
                  "tailwindcss",
                  "postcss-flexbugs-fixes",
                  [
                    "postcss-preset-env",
                    {
                      autoprefixer: {
                        flexbox: "no-2009",
                      },
                      stage: 3,
                    },
                  ],
                ],
          },
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
        },
      },
    ].filter(Boolean);

    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve("resolve-url-loader"),
          options: {
            sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
            root: paths.appSrc,
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
          },
        }
      );
    }

    return loaders;
  };

  return {
    ...serverConfig,
    resolve: {
      fallback: {
        path: require.resolve("path-browserify"),
      },
    },
    target: ["browserslist"],
    stats: {
      all: false,
      assets: true,
      builtAt: true,
      errors: true,
      moduleTrace: true,
      performance: true,
      timings: true,
      warnings: true,
      moduleAssets: true,
      errorDetails: true,
    },
    entry: [
      isEnvDevelopment &&
        shouldUseReactRefresh &&
        reactRefreshWebpackPluginRuntimeEntry,
      paths.appIndexJs,
    ].filter(Boolean),
    mode: isEnvProduction ? 'production' : 'development',
    output: {
      path: isEnvProduction ? paths.appBuild : undefined,
      pathinfo: isEnvDevelopment,
      filename: isEnvProduction
        ? "static/js/[name].[contenthash:8].js"
        : isEnvDevelopment
        ? "static/js/bundle.js"
        : undefined,
      chunkFilename: isEnvProduction
        ? "static/js/[name].[contenthash:8].chunk.js"
        : isEnvDevelopment
        ? "static/js/[name].chunk.js"
        : undefined,

      assetModuleFilename: "static/media/[name].[hash:8][ext]",
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
            sourceMap: shouldUseSourceMap,
          },
        }),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
              },
            ],
            sourceMap: shouldUseSourceMap,
          },
        }),
      ],
      splitChunks: {
        chunks: "all",
        name: false,
      },
      runtimeChunk: {
        name: (entrypoint) => `runtime-${entrypoint.name}`,
      },
    },
    resolve: {
      modules: ["node_modules", paths.appNodeModules].concat(
        modules.additionalModulePaths || []
      ),
      extensions: paths.moduleFileExtensions
        .map((ext) => `.${ext}`)
        .filter((ext) => useTypeScript || !ext.includes("ts")),
      alias: {
        "react-native": "react-native-web",
        "@src": path.resolve(__dirname, "../src"),
        "@components": path.resolve(__dirname, "../src/components"),
        "@constants": path.resolve(__dirname, "../src/constants"),
        "@contexts": path.resolve(__dirname, "../src/contexts"),
        "@hooks": path.resolve(__dirname, "../src/hooks"),
        "@images": path.resolve(__dirname, "../src/images"),
        "@pages": path.resolve(__dirname, "../src/pages"),
        "@services": path.resolve(__dirname, "../src/services"),
        "@styles": path.resolve(__dirname, "../src/styles"),
        "@utils": path.resolve(__dirname, "../src/utils"),
        lib: path.resolve(__dirname, "lib"), // Add this line for 'lib' folder alias
      },
      plugins: [
        new ModuleScopePlugin(paths.appSrc, [
          paths.appPackageJson,
          reactRefreshRuntimeEntry,
          babelRuntimeEntry,
          babelRuntimeEntryHelpers,
          babelRuntimeRegenerator,
        ]),
      ],
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          enforce: "pre",
          use: [
            {
              options: {
                cache: true,
                eslintPath: require.resolve("eslint"),
                resolvePluginsRelativeTo: __dirname,
                baseConfig: {
                  extends: [require.resolve("eslint-config-react-app/base")],
                },
                ignore: false,
                useEslintrc: false,
              },
              loader: require.resolve("eslint-loader"),
            },
          ],
          include: paths.appSrc,
          exclude: paths.appNodeModules,
          resolve: {
            cache: false,
          },
        },
        {
          oneOf: [
            {
              test: [
                /\.bmp$/,
                /\.gif$/,
                /\.jpe?g$/,
                /\.png$/,
                /\.svg$/,
                /\.webp$/,
              ],
              type: "asset",
              parser: {
                dataUrlCondition: {
                  maxSize: imageInlineSizeLimit,
                },
              },
              generator: {
                filename: "static/media/[name].[hash:8][ext]",
              },
            },
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: require.resolve("babel-loader"),
              options: {
                customize: require.resolve(
                  "babel-preset-react-app/webpack-overrides"
                ),
                presets: [
                  [
                    require.resolve("babel-preset-react-app"),
                    {
                      runtime: hasJsxRuntime ? "automatic" : "classic",
                    },
                  ],
                ],
                plugins: [
                  !hasJsxRuntime &&
                    require.resolve("@babel/plugin-transform-react-jsx-self"),
                  !hasJsxRuntime &&
                    require.resolve("@babel/plugin-transform-react-jsx-source"),
                  isEnvProduction && [
                    require.resolve("babel-plugin-remove-graphql-queries"),
                    {
                      staticQueryDir: paths.appStaticQueries,
                    },
                  ],
                  shouldUseReactRefresh &&
                    require.resolve("react-refresh/babel"),
                ].filter(Boolean),
                cacheDirectory: true,
                cacheIdentifier: getCacheIdentifier(
                  isEnvProduction
                    ? "production"
                    : isEnvDevelopment && "development",
                  [
                    "babel-plugin-named-asset-import",
                    "babel-preset-react-app",
                    "react-dev-utils",
                    "react-scripts",
                    "react-refresh-webpack-plugin",
                    "reshadow/transform",
                    "@reshadow/babel-plugin",
                    "@reshadow/css-transpiler",
                  ]
                ),
                // Don't waste time on Gzipping the cache
                cacheCompression: false,
                compact: isEnvProduction,
              },
            },
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction
                  ? shouldUseSourceMap
                  : isEnvDevelopment,
              }),
              sideEffects: true,
            },
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction
                  ? shouldUseSourceMap
                  : isEnvDevelopment,
                modules: {
                  getLocalIdent: getCSSModuleLocalIdent,
                },
              }),
            },
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction
                    ? shouldUseSourceMap
                    : isEnvDevelopment,
                },
                "sass-loader"
              ),
              sideEffects: true,
            },
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction
                    ? shouldUseSourceMap
                    : isEnvDevelopment,
                  modules: {
                    getLocalIdent: getCSSModuleLocalIdent,
                  },
                },
                "sass-loader"
              ),
            },
            {
              loader: require.resolve("file-loader"),
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: "static/media/[name].[hash:8].[ext]",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      isEnvDevelopment &&
        new HtmlWebpackPlugin({
          inject: true,
          template: paths.appHtml,
        }),
      isEnvProduction &&
        shouldInlineRuntimeChunk &&
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      new ModuleNotFoundPlugin(paths.appPath),
      new webpack.DefinePlugin(env.stringified),
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      isEnvDevelopment && new CaseSensitivePathsPlugin(),
      !disableESLintPlugin &&
        new ESLintPlugin({
          eslintPath: require.resolve("eslint"),
          resolvePluginsRelativeTo: __dirname,
          formatter: require.resolve("react-dev-utils/eslintFormatter"),
          eslintOptions: {
            ignore: false,
            baseConfig: {
              extends: [require.resolve("eslint-config-react-app/base")],
            },
          },
          context: paths.appSrc,
          cache: true,
          cacheIdentifier: getCacheIdentifier(
            isEnvProduction ? "production" : isEnvDevelopment && "development",
            ["eslint-plugin-react"]
          ),
          emitWarning: emitErrorsAsWarnings,
        }),
      useTypeScript &&
        new ForkTsCheckerWebpackPlugin({
          typescript: resolve.sync("typescript", {
            basedir: paths.appNodeModules,
          }),
          async: isEnvDevelopment,
          useTypescriptIncrementalApi: true,
          checkSyntacticErrors: true,
          resolveModuleNameModule: process.versions.pnp
            ? `${__dirname}/pnpTs.js`
            : undefined,
          resolveTypeReferenceDirectiveModule: process.versions.pnp
            ? `${__dirname}/pnpTs.js`
            : undefined,
          tsconfig: paths.appTsConfig,
          reportFiles: [
            "**",
            "!**/*.json",
            "!**/__tests__/**",
            "!**/?(*.)(spec|test).*",
            "!**/@types/**",
            "!**/src/setupProxy.*",
            "!**/src/setupTests.*",
          ],
          silent: true,
          formatter: isEnvProduction ? typescriptFormatter : undefined,
        }),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash:8].css",
          chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        }),
      isEnvProduction && new WebpackManifestPlugin(),
      isEnvDevelopment &&
        shouldUseReactRefresh &&
        new ReactRefreshWebpackPlugin(),
      isEnvDevelopment &&
        swSrc &&
        new WorkboxWebpackPlugin.InjectManifest({
          swSrc: swSrc,
          exclude: [/\.(?:png|jpg|jpeg|svg)$/],
        }),
    ].filter(Boolean),
    performance: false,
    node: {
      global: false,
      __filename: false,
      __dirname: false,
    },
    experiments: {},
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? "source-map"
        : false
      : isEnvDevelopment && "cheap-module-source-map",
  };
};
