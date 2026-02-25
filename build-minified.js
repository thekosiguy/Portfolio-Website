import fs from 'fs';
import { minify } from 'terser';

const code = fs.readFileSync('my-portfolio/js/script.js', 'utf8');
const result = await minify(code, { compress: true, mangle: true });
fs.writeFileSync('my-portfolio/js/script.min.js', result.code);
console.log('Minified script.js successfully');
