const path = require('path');

module.exports = {
    // The entry point of our plugin's frontend client bundle
    entry: './src/index.jsx',
    
    resolve: {
        // Automatically resolve these file extensions when importing modules
        extensions: ['.js', '.jsx', '.json'],
    },
    
    module: {
        rules: [
            {
                // Process React (.jsx) and ES6 (.js) files using Babel
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            // Transpile JSX syntax to standard React function calls
                            '@babel/preset-react',
                            // Transpile modern JS syntax to browser-compatible ES5/6
                            [
                                '@babel/preset-env',
                                {
                                    modules: 'commonjs',
                                    targets: {
                                        node: 'current',
                                    },
                                },
                            ],
                        ],
                    },
                },
            },
        ],
    },
    
    // Externals config prevents Webpack from bundling shared core libraries.
    // Mattermost provides these globals on the window context at runtime.
    // This reduces bundle size significantly and avoids library collisions.
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'react-redux': 'ReactRedux',
    },
    
    output: {
        // Output directory and file name matching the path specified in plugin.json
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
    },
};
