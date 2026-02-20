import fs from 'fs';
import path from 'path';

// Simple function to read image dimensions from JPEG files
function getJPEGDimensions(filepath) {
  const buffer = fs.readFileSync(filepath);
  
  // Find SOF (Start of Frame) marker in JPEG
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === 0xFF) {
      // Check for SOF markers (0xC0-0xCF, excluding 0xC4, 0xC8, 0xCC)
      const marker = buffer[i + 1];
      if ((marker >= 0xC0 && marker <= 0xC3) || 
          (marker >= 0xC5 && marker <= 0xC7) || 
          (marker >= 0xC9 && marker <= 0xCB) || 
          (marker >= 0xCD && marker <= 0xCF)) {
        // Height is at offset 5-6, width at 7-8 from marker
        const height = buffer.readUInt16BE(i + 5);
        const width = buffer.readUInt16BE(i + 7);
        return { width, height };
      }
    }
  }
  return null;
}

// Check both images
const images = [
  'my-portfolio/assets/images/me.jpg',
  'my-portfolio/assets/images/Graduation.jpg'
];

console.log('Image Dimensions:');
console.log('=================');
images.forEach(img => {
  if (fs.existsSync(img)) {
    const dimensions = getJPEGDimensions(img);
    if (dimensions) {
      console.log(`${path.basename(img)}: ${dimensions.width}x${dimensions.height}`);
    } else {
      console.log(`${path.basename(img)}: Could not read dimensions`);
    }
  } else {
    console.log(`${path.basename(img)}: File not found`);
  }
});
