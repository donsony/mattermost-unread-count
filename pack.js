const tar = require('tar');
const fs = require('fs');
const path = require('path');

// Ensure that the output directory 'dist/' exists at the root of the workspace.
const distDir = path.resolve(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Define the target path of the packaged plugin archive.
// Mattermost expects plugins to be packaged as gzipped tarballs (.tar.gz).
const outputPath = path.join(distDir, 'unread-count-plugin.tar.gz');

console.log('Packaging plugin files into tarball...');

// Create a flat tarball archive using the 'tar' package.
// We compress:
// 1. `plugin.json` (must be at the root of the archive)
// 2. `webapp/dist/main.js` (under the exact sub-folder structure defined in the manifest)
tar.c(
    {
        gzip: true,
        file: outputPath,
        portable: true, // Guarantees uniform archive format across different OS platforms
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
