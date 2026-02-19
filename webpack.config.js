const webpack = require('webpack');
const path = require('path');
const AssetsPlugin = require('assets-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackNotifierPlugin = require('webpack-notifier');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = (env, argv) => {
    const devMode = argv.mode !== 'production';
    const config = {
        devtool: devMode ? 'eval-source-map' : false,
        mode: argv.mode || 'production',
        context: __dirname,
        entry: {
            app: path.resolve(__dirname, 'resources/assets/app.js'),
        },
        output: {
            path: path.resolve(__dirname, 'public/assets/'),
            filename: devMode ? 'js/[name].js' : 'js/[name].[contenthash:8].js',
            publicPath: '/assets/',
            pathinfo: false,
            clean: {
                keep: /entrypoints\.json/
            },
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    use:
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env'],
                                plugins: [
                                    '@babel/plugin-syntax-dynamic-import',
                                    '@babel/plugin-proposal-throw-expressions'
                                ],
                                sourceMap: devMode
                            }
                        }
                },
                {
                    test: /\.(c|s[c|a])ss$/,
                    oneOf: [
                        {
                            use: [
                                MiniCssExtractPlugin.loader,
                                {
                                    loader: "css-loader",
                                    options: {sourceMap: devMode, importLoaders: 1}
                                },
                                {
                                    loader: 'postcss-loader',
                                    options: {sourceMap: devMode}
                                },
                                {
                                    loader: 'resolve-url-loader',
                                    options: {sourceMap: devMode}
                                },
                                {
                                    loader: 'sass-loader',
                                    options: {
                                        sourceMap: true,
                                        sassOptions: {
                                            silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
                                        },
                                    }
                                },
                            ],
                        },
                        {
                            resourceQuery: "?dark",
                            use: [
                                MiniCssExtractPlugin.loader,
                                {
                                    loader: "css-loader",
                                    options: {sourceMap: devMode, importLoaders: 1}
                                },
                                {
                                    loader: 'postcss-loader',
                                    options: {sourceMap: devMode}
                                },
                                {
                                    loader: 'resolve-url-loader',
                                    options: {sourceMap: devMode}
                                },
                                {
                                    loader: 'sass-loader',
                                    options: {
                                        sourceMap: true,
                                        sassOptions: {
                                            silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
                                        },
                                    }
                                },
                            ],
                        },
                    ],
                },
                {
                    test: /\.(ttf|eot|otf|woff2?|svg)(\?v=[0-9.]*)?$/,
                    include: /font(s)?/,
                    type: 'asset/resource',
                    generator: {
                        filename: devMode ? 'fonts/[name][ext][query]' : 'fonts/[name].[contenthash:8][ext][query]'
                    }
                },
                {
                    test: /\.(png|gif|jpe?g|ico|webp|svg)$/,
                    exclude: /font(s)?/,
                    type: 'asset/resource',
                    generator: {
                        filename: devMode ? 'images/[name][ext][query]' : 'images/[name].[contenthash:8][ext][query]'
                    },
                },
                {
                    test: /\.(mp4)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: devMode ? 'videos/[name][ext][query]' : 'videos/[name].[contenthash:8][ext][query]'
                    }
                }
            ]
        },
        optimization: {
            minimize: !devMode,
            minimizer: [
                `...`,
                new CssMinimizerPlugin(),
                new ImageMinimizerPlugin({
                    minimizer: {
                        implementation: ImageMinimizerPlugin.sharpMinify,
                        options: {
                            encodeOptions: {
                                jpeg: {
                                    // https://sharp.pixelplumbing.com/api-output#jpeg
                                    quality: 100,
                                },
                                webp: {
                                    // https://sharp.pixelplumbing.com/api-output#webp
                                    lossless: true,
                                },
                                avif: {
                                    // https://sharp.pixelplumbing.com/api-output#avif
                                    lossless: true,
                                },

                                // PNG by default sets the quality to 100%, which is same as lossless
                                // https://sharp.pixelplumbing.com/api-output#png
                                png: {},

                                // GIF does not support lossless compression at all
                                // https://sharp.pixelplumbing.com/api-output#gif
                                gif: {},
                            },
                        },
                    },
                }),
            ],
            splitChunks: {
                cacheGroups: {
                    styles: {
                        type: 'css/mini-extract',
                        chunks: 'all',
                        minChunks: 2,
                        filename: devMode ? 'css/[id].css' : 'css/bundle.[id].[contenthash:8].css',
                    },
                    vendor: {
                        test: /\.js($|\?)/i,
                        chunks: 'all',
                        minChunks: 2,
                        filename: devMode ? 'js/bundle.[id].js' : 'js/bundle.[id].[contenthash:8].js',
                    }
                }
            },
        },
        performance: {
            hints: false
        },
        plugins: [
            new webpack.ProgressPlugin(),
            new MiniCssExtractPlugin({
                filename: devMode ? 'css/[name].css' : 'css/[name].[contenthash:8].css',
                chunkFilename: devMode ? 'css/bundle.[id].css' : 'css/bundle.[id].[contenthash:8].css',
            }),
            new AssetsPlugin({
                entrypoints: true,
                filename: 'entrypoints.json',
                useCompilerPath: true,
            }),
            new WebpackManifestPlugin({}),
            new WebpackNotifierPlugin({alwaysNotify: true}),
        ]
    };

    if (devMode) {
        config.plugins.push(new webpack.SourceMapDevToolPlugin({}));
    }

    return config;
};