/* eslint-disable no-console */
import type { Plugin } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateOGImages } from '@guess-logo/image-generator/generate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function ogImageGeneratorPlugin(): Plugin {
  let isGenerating = false;

  return {
    name: 'og-image-generator',
    enforce: 'pre',

    async buildStart() {
      if (isGenerating)
        return;
      isGenerating = true;

      console.log('🖼️  Starting OG image generation...');

      try {
        const outputDir = path.resolve(__dirname, '../../public/og');
        await generateOGImages(outputDir);
        console.log('✨ OG image generation complete!');
      }
      catch (error) {
        console.error('❌ OG image generation failed:', error);
        throw error;
      }
    },
  };
}
