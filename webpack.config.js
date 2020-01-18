const path = require('path');

module.exports = {
    entry: {
        "litsy" : "./src/index.ts"
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader'],
                exclude: /node_modules/
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: ["source-map-loader"]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: "litsy",
        libraryTarget: 'umd'
    }
}