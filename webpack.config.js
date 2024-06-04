const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './js/Main.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
        },
        mode: isProduction ? 'production' : 'development',
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                                     terserOptions: {
                                         format: {
                                             comments: false,
                                         },
                                         compress: {
                                             drop_console: true,
                                         },
                                     },
                                     extractComments: false,
                                 }),
                new CssMinimizerPlugin(),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                },
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif|mp3)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                                         filename: 'styles.css',
                                     }),
            new HtmlWebpackPlugin({
                                      template: './index.html',
                                      inject: 'body',
                                  }),
            new JavaScriptObfuscator({
                                         rotateStringArray: true,
                                     }, ['excluded_bundle_name.js']),
            new CopyWebpackPlugin({
                                      patterns: [
                                          { from: 'images', to: 'images' },
                                          { from: 'sounds', to: 'sounds' }, // Ensure this line is present
                                      ],
                                  }),
        ],
        resolve: {
            fallback: {
                "os": require.resolve("os-browserify/browser"),
                "path": require.resolve("path-browserify"),
                "crypto": require.resolve("crypto-browserify"),
                "stream": require.resolve("stream-browserify"),
                "https": require.resolve("https-browserify"),
                "assert": require.resolve("assert/"),
                "url": require.resolve("url/"),
                "buffer": require.resolve("buffer/"),
                "vm": require.resolve("vm-browserify"),
                "constants": require.resolve("constants-browserify"),
                "http": require.resolve("stream-http"),
                "tty": require.resolve("tty-browserify"),
                "zlib": require.resolve("browserify-zlib"),
                "child_process": false,
                "fs": false,
                "module": false,
                "worker_threads": false,
                "querystring": require.resolve("querystring-es3")
            }
        },
        stats: {
            errorDetails: true,
            children: true,
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            compress: true,
            port: 8080,
            open: true,
            hot: true,
        }
    };
};