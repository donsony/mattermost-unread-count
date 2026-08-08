const tar = require('tar');
const fs = require('fs');
const path = require('path');

// Ensure output directory exists
const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Target tarball path
const outputPath = path.join(distDir, 'unread-count-plugin.tar.gz');

console.log('Packaging plugin files into tarball...');

// Pack plugin.json and webapp/dist/main.js
tar.c(
    {
        gzip: true,
        file: outputPath,
        portable: true,
    },
    [
        'plugin.json',
        'webapp/dist/main.js'
    ]
).then(() => {
    console.log(`Plugin packaged successfully to ${outputPath}`);
}).catch((err) => {
    console.error('Failed to package plugin:', err);
    process.exit(1);
});
