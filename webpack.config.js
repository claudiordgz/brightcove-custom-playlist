module.exports = {
    entry: [
        './main.js'
    ],
    output: {
        path: __dirname,
        filename: "bundle/custom-playlist.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.png$/, loader: "url-loader?limit=100000" },
            { test: /\.jpg$/, loader: "file-loader" }
        ]
    }
};