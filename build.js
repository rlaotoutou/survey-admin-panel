#!/usr/bin/env node

// Build script for optimizing the Restaurant Survey Admin Panel
// Minifies JavaScript, optimizes CSS, and creates production build

const fs = require('fs');
const path = require('path');

// Simple minification functions
function minifyJS(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*([{}();,=+*/])\s*/g, '$1') // Remove spaces around operators (excluding -)
        .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
        .trim();
}

function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*([{}:;,>+~])\s*/g, '$1') // Remove spaces around selectors (excluding -)
        .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
        .trim();
}

// Create build directory
const buildDir = path.join(__dirname, 'dist');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

console.log('🚀 Starting build process...');

// Read and minify JavaScript files
const jsFiles = ['js/app.js', 'js/diagnosis.js'];
const minifiedJS = {};

jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const minified = minifyJS(content);
    const filename = path.basename(file, '.js') + '.min.js';
    minifiedJS[filename] = minified;
    
    fs.writeFileSync(path.join(buildDir, filename), minified);
    console.log(`✅ Minified ${file} -> ${filename}`);
});

// Read and minify CSS
const cssContent = fs.readFileSync('css/styles.min.css', 'utf8');
const minifiedCSS = minifyCSS(cssContent);
fs.writeFileSync(path.join(buildDir, 'styles.min.css'), minifiedCSS);
console.log('✅ Minified CSS');

// Create optimized HTML
let htmlContent = fs.readFileSync('index.html', 'utf8');

// Replace script sources with minified versions
htmlContent = htmlContent.replace('js/app.js', 'app.min.js');
htmlContent = htmlContent.replace('js/diagnosis.js', 'diagnosis.min.js');
htmlContent = htmlContent.replace('css/styles.min.css', 'styles.min.css');

// Inline critical CSS
const criticalCSS = `
.loading{display:none}.loading.active{display:inline-flex;align-items:center}.spinner{border:2px solid #f3f3f3;border-top:2px solid #3b82f6;border-radius:50%;width:16px;height:16px;animation:spin 1s linear infinite;margin-right:8px}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.data-table{font-size:13px}.data-table th,.data-table td{padding:10px 12px;border:1px solid #e5e7eb;white-space:nowrap}.data-table th{background-color:#f9fafb;font-weight:600;position:sticky;top:0;z-index:10}.data-table tr:nth-child(even){background-color:#f9fafb}.data-table tr:hover{background-color:#f0f9ff}.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.5);z-index:1000;overflow-y:auto}.modal.active{display:flex;align-items:flex-start;justify-content:center;padding:20px}.modal-content{background:white;border-radius:12px;max-width:1000px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1);margin-top:20px}.tab-button{padding:12px 24px;border:none;background:transparent;cursor:pointer;border-bottom:3px solid transparent;transition:all 0.3s}.tab-button.active{border-bottom-color:#3b82f6;color:#3b82f6;font-weight:600}.tab-content{display:none}.tab-content.active{display:block}.health-table{width:100%;border-collapse:collapse;font-size:13px;margin:12px 0}.health-table th,.health-table td{padding:8px 12px;border:1px solid #e5e7eb;text-align:left}.health-table th{background-color:#f9fafb;font-weight:600}.status-healthy{color:#22c55e;font-weight:600}.status-warning{color:#f59e0b;font-weight:600}.status-danger{color:#ef4444;font-weight:600}.metric-card{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;border-top:4px solid #3b82f6}.metric-label{font-size:12px;color:#6b7280;margin-bottom:8px}.metric-value{font-size:28px;font-weight:700;color:#1f2937}.info-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:12px 0}.diagnosis-section{margin:24px 0;padding:20px;background:white;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1)}.score-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}.score-excellent{background:#dcfce7;color:#166534}.score-good{background:#dbeafe;color:#1e40af}.score-average{background:#fef3c7;color:#92400e}.score-poor{background:#fee2e2;color:#991b1b}
`;

// Replace the style block with minified critical CSS
htmlContent = htmlContent.replace(/<style>[\s\S]*?<\/style>/, `<style>${criticalCSS}</style>`);

// Remove the external CSS link since we're inlining critical CSS
htmlContent = htmlContent.replace(/<link rel="stylesheet" href="css\/styles\.min\.css"[^>]*>/g, '');

fs.writeFileSync(path.join(buildDir, 'index.html'), htmlContent);
console.log('✅ Created optimized HTML');

// Copy other files
const filesToCopy = ['manifest.json', 'sw.js'];
filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(buildDir, file));
        console.log(`✅ Copied ${file}`);
    }
});

// Create a simple server for testing
const serverContent = `#!/usr/bin/env node
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(\`🚀 Server running at http://localhost:\${port}\`);
    console.log('📊 Restaurant Survey Admin Panel - Optimized Build');
});
`;

fs.writeFileSync(path.join(buildDir, 'server.js'), serverContent);
console.log('✅ Created server.js');

// Create package.json for the build
const packageJson = {
    "name": "restaurant-survey-admin-optimized",
    "version": "1.0.0",
    "description": "Optimized Restaurant Survey Data Management & Diagnosis System",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "dev": "node server.js"
    },
    "dependencies": {
        "express": "^4.18.2"
    },
    "engines": {
        "node": ">=14.0.0"
    }
};

fs.writeFileSync(path.join(buildDir, 'package.json'), JSON.stringify(packageJson, null, 2));
console.log('✅ Created package.json');

// Calculate file sizes
const originalSize = fs.statSync('survey_admin_panel.html').size;
const newSize = fs.statSync(path.join(buildDir, 'index.html')).size;
const jsSize = Object.values(minifiedJS).reduce((total, js) => total + js.length, 0);
const cssSize = minifiedCSS.length;
const totalNewSize = newSize + jsSize + cssSize;

console.log('\n📊 Build Summary:');
console.log(`Original file size: ${(originalSize / 1024).toFixed(2)} KB`);
console.log(`New total size: ${(totalNewSize / 1024).toFixed(2)} KB`);
console.log(`Size reduction: ${(((originalSize - totalNewSize) / originalSize) * 100).toFixed(1)}%`);
console.log(`\n🎉 Build completed! Files saved to ./dist/`);
console.log(`\nTo run the optimized version:`);
console.log(`cd dist && npm install && npm start`);