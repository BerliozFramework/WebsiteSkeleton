const path = require('path');
const AssetsPlugin = require('assets-webpack-plugin');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

const purgeManifestFile = (name) => {
    return name.replace(/^/, '/')
        .replace(/\\/g, '/')
        .replace(/\/{2,}/g, '/')
        .replace(/(\?v=[0-9.]*)$/, '')
};

module.exports = (env, argv) => {
    const devMode = argv.mode !== 'production';

    return {
        devtool: devMode ? 'source-map' : false,
        mode: argv.mode || 'production',
        context: __dirname,
        entry: {
            app: path.resolve(__dirname, 'assets/app.js'),
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
                                    quality: '65-90',
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
                new TerserPlugin({
                    test: /\.js($|\?)/i,
                    sourceMap: devMode
                }),
                new OptimizeCSSAssetsPlugin({})
            ],
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /\.js($|\?)/i,
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
            new MiniCssExtractPlugin({
                filename: "css/[name].[hash:8].css",
                chunkFilename: "css/[id].[hash:8].css"
            }),
            new AssetsPlugin({
                entrypoints: true,
                publicPath: true,
                integrity: true,
                filename: 'entrypoints.json',
                path: 'public/assets'
            }),
            new CleanWebpackPlugin({
                cleanStaleWebpackAssets: false
            }),
            new FriendlyErrorsWebpackPlugin(),
            new ManifestPlugin({
                map: (file) => {
                    file.name = purgeManifestFile(file.name);
                    file.path = purgeManifestFile(file.path);
                    return file
                }
            }),
            new SimpleProgressWebpackPlugin({format: 'compact'}),
            new WebpackNotifierPlugin({alwaysNotify: true})
        ]
    }
};