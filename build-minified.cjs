const fs = require('fs');
const { minify } = require('terser');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

// Minify JavaScript
async function minifyJS() {
  const jsContent = fs.readFileSync('my-portfolio/js/script.js', 'utf8');
  const result = await minify(jsContent, {
    compress: true,
    mangle: true
  });
  fs.writeFileSync('my-portfolio/js/script.min.js', result.code);
  console.log('✓ JavaScript minified');
}

// Minify CSS
async function minifyCSS() {
  const cssContent = fs.readFileSync('my-portfolio/css/styles.css', 'utf8');
  const result = await postcss([autoprefixer, cssnano])
    .process(cssContent, { from: 'my-portfolio/css/styles.css', to: 'my-portfolio/css/styles.min.css' });
  fs.writeFileSync('my-portfolio/css/styles.min.css', result.css);
  console.log('✓ CSS minified');
}

// Run both
Promise.all([minifyJS(), minifyCSS()])
  .then(() => console.log('Build complete!'))
  .catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
  });
