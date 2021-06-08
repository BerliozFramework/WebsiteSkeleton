const webpack = require('webpack');
const path = require('path');
const AssetsPlugin = require('assets-webpack-plugin');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackNotifierPlugin = require('webpack-notifier');

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
            filename: 'js/[name].[contenthash:8].js',
            publicPath: '/assets/',
            pathinfo: false
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
                                plugins: ['@babel/plugin-syntax-dynamic-import'],
                                sourceMap: devMode
                            }
                        }
                },
                {
                    test: /\.(c|s[c|a])ss$/,
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
                            options: {sourceMap: true}
                        },
                    ],
                },
                {
                    test: /\.(ttf|eot|otf|woff2?|svg)(\?v=[0-9.]*)?$/,
                    include: /font(s)?/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[hash:8].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                },
                {
                    test: /\.(png|gif|jpe?g|svg|ico|webp)$/,
                    exclude: /font(s)?/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[hash:8].[ext]',
                                outputPath: 'images/'
                            }
                        },
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                disable: devMode,
                                mozjpeg: {
                                    enabled: !devMode,
                                    progressive: true,
                                    quality: 65
                                },
                                optipng: {
                                    enabled: !devMode,
                                },
                                pngquant: {
                                    enabled: !devMode,
                                    quality: [0.65, 0.90],
                                    speed: 4
                                },
                                gifsicle: {
                                    enabled: !devMode,
                                    interlaced: false,
                                }
                            },
                        }
                    ]
                },
                {
                    test: /\.(mp4)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[hash:8].[ext]',
                            outputPath: 'videos/'
                        }
                    }
                }
            ]
        },
        optimization: {
            minimize: !devMode,
            minimizer: [
                `...`,
                new CssMinimizerPlugin()
            ],
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        // test: /\.js($|\?)/i,
                        chunks: 'all',
                        minChunks: 2,
                        name: 'vendor',
                        enforce: true
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
                filename: "css/[name].[fullhash:8].css",
                chunkFilename: "css/[id].[fullhash:8].css"
            }),
            new AssetsPlugin({
                entrypoints: true,
                filename: 'entrypoints.json',
                useCompilerPath: true,
            }),
            new WebpackManifestPlugin({}),
            new CleanWebpackPlugin({
                cleanStaleWebpackAssets: false
            }),
            new WebpackNotifierPlugin({alwaysNotify: true}),
        ]
    };

    if (devMode) {
        config.plugins.push(new webpack.SourceMapDevToolPlugin({}));
    }

    return config;
};