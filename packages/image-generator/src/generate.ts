/* eslint-disable no-console */
import type { ReactElement } from 'react';
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { ImageResponse } from '@takumi-rs/image-response';
import { OG_CONFIG } from './config.js';
import { FiveSecondsOG, GuessLogoOG, HomepageOG, StatClashOG } from './templates/og-templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Template {
  name: string;
  component: () => ReactElement;
}

let loadedFonts: any[] | null = null;

async function loadFonts() {
  if (loadedFonts) return loadedFonts;

  const regularFontPath = path.join(__dirname, 'assets/fonts/PixelAE-Regular.woff2');
  const boldFontPath = path.join(__dirname, 'assets/fonts/PixelAE-Bold.woff2');

  const regularFontData = fs.readFileSync(regularFontPath);
  const boldFontData = fs.readFileSync(boldFontPath);

  loadedFonts = [
    {
      name: 'PixelAE',
      data: regularFontData.buffer.slice(regularFontData.byteOffset, regularFontData.byteOffset + regularFontData.byteLength),
      style: 'normal',
      weight: 400,
    },
    {
      name: 'PixelAE',
      data: boldFontData.buffer.slice(boldFontData.byteOffset, boldFontData.byteOffset + boldFontData.byteLength),
      style: 'normal',
      weight: 700,
    },
  ];

  return loadedFonts;
}

const templates: Template[] = [
  { name: 'home', component: HomepageOG },
  { name: 'five-seconds', component: FiveSecondsOG },
  { name: 'guess-logo', component: GuessLogoOG },
  { name: 'stat-clash', component: StatClashOG },
];

export async function generateOGImages(outputDir?: string) {
  console.log('🖼️  Generating OG images...');

  if (!outputDir) {
    throw new Error('outputDir is required');
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const template of templates) {
    const { name, component } = template;
    const outputPath = path.join(outputDir, `${name}.png`);

    try {
      console.log(`  Generating ${name}.png...`);

      const Component = component;
      const element = Component();
      const options: any = {
        width: OG_CONFIG.width,
        height: OG_CONFIG.height,
        format: 'png',
      };

      if (name === 'five-seconds') {
        options.fonts = await loadFonts();
      }

      const response = new ImageResponse(element, options);

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(outputPath, buffer);

      console.log(`  ✅ Generated ${name}.png`);
    }
    catch (error) {
      console.error(`  ❌ Failed to generate ${name}.png:`, error);
      throw error;
    }
  }

  console.log('✨ All OG images generated successfully!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outputDir = process.argv[2] || './output';
  generateOGImages(outputDir).catch(console.error);
}
