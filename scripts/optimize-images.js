/**
 * Image Optimization Script
 * Converts images to WebP format and generates responsive variants
 * Requirement 4.4: Serve images in modern formats with 30%+ file size reduction
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

const IMAGES_DIR = 'my-portfolio/assets/images';
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png'];
const RESPONSIVE_WIDTHS = [320, 720, 1440];

/**
 * Get all image files recursively from a directory
 */
async function getImageFiles(dir) {
  const files = [];
  
  try {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        const subFiles = await getImageFiles(fullPath);
        files.push(...subFiles);
      } else if (SUPPORTED_FORMATS.includes(extname(entry).toLowerCase())) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Convert image to WebP format
 */
async function convertToWebP(inputPath) {
  const ext = extname(inputPath);
  const outputPath = inputPath.replace(ext, '.webp');
  
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✓ Created WebP: ${basename(outputPath)}`);
    return outputPath;
  } catch (error) {
    console.error(`✗ Failed to convert ${inputPath}:`, error.message);
    return null;
  }
}

/**
 * Generate responsive image variants
 */
async function generateResponsiveVariants(inputPath) {
  const ext = extname(inputPath);
  const baseName = basename(inputPath, ext);
  const dir = inputPath.substring(0, inputPath.lastIndexOf('/'));
  
  const variants = [];
  
  for (const width of RESPONSIVE_WIDTHS) {
    const outputPath = join(dir, `${baseName}-${width}${ext}`);
    
    try {
      await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .toFile(outputPath);
      
      console.log(`✓ Created ${width}w variant: ${basename(outputPath)}`);
      variants.push(outputPath);
      
      // Also create WebP variant
      const webpPath = outputPath.replace(ext, '.webp');
      await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(webpPath);
      
      console.log(`✓ Created ${width}w WebP variant: ${basename(webpPath)}`);
      variants.push(webpPath);
    } catch (error) {
      console.error(`✗ Failed to create ${width}w variant for ${inputPath}:`, error.message);
    }
  }
  
  return variants;
}

/**
 * Main optimization function
 */
async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');
  
  // Check if images directory exists
  if (!existsSync(IMAGES_DIR)) {
    console.log(`⚠️  Images directory not found: ${IMAGES_DIR}`);
    console.log('Creating directory...');
    await mkdir(IMAGES_DIR, { recursive: true });
    console.log('✓ Directory created. Add images to optimize.\n');
    return;
  }
  
  // Get all image files
  const imageFiles = await getImageFiles(IMAGES_DIR);
  
  if (imageFiles.length === 0) {
    console.log('⚠️  No images found to optimize.\n');
    return;
  }
  
  console.log(`Found ${imageFiles.length} image(s) to optimize\n`);
  
  let processed = 0;
  let failed = 0;
  
  for (const imagePath of imageFiles) {
    console.log(`Processing: ${basename(imagePath)}`);
    
    try {
      // Convert to WebP
      await convertToWebP(imagePath);
      
      // Generate responsive variants (skip if already a variant)
      if (!/-\d+\.(jpg|jpeg|png|webp)$/.test(imagePath)) {
        await generateResponsiveVariants(imagePath);
      }
      
      processed++;
      console.log('');
    } catch (error) {
      console.error(`✗ Error processing ${imagePath}:`, error.message);
      failed++;
      console.log('');
    }
  }
  
  console.log('─'.repeat(50));
  console.log(`✓ Optimization complete!`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Failed: ${failed}`);
  console.log('─'.repeat(50));
}

// Run optimization
optimizeImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
