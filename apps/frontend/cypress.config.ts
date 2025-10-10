import { defineConfig } from 'cypress';
import { execa } from 'execa'; // Use named import

function findBrowser() {
  const browserPath
    = '/Applications/Helium.app/Contents/MacOS/Helium';

  return execa(browserPath, ['--version']).then((result) => {
    // Regex remains correct for your output: "Helium 141.0.7390.65"
    const match = /Helium (\d+\.\d+\.\d+\.\d+)/.exec(result.stdout);

    if (!match) {
      throw new Error(`Could not parse version from Helium output: ${result.stdout}`);
    }

    const version = match[1];
    const majorVersion = Number.parseInt(version.split('.')[0]);

    // Return the new browser object
    return {
      name: 'Helium',
      channel: 'stable',
      family: 'chromium',
      displayName: 'Helium',
      version,
      path: browserPath,
      majorVersion,
    };
  });
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173/',
    setupNodeEvents(on, config) {
      // Return the Promise that resolves to the MERGED config object
      return findBrowser().then((browser) => {
        return {
          ...config,
          browsers: config.browsers.concat(browser),
        };
      });
    },
  },
});
