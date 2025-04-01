// copy-css.js
const fs = require('fs-extra');

// Copy styles.css from src to dist
fs.copySync('src/styles.css', 'dist/styles.css');
console.log('styles.css copied to dist/');
