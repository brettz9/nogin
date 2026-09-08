import {defineConfig} from 'cypress';

export default defineConfig({
  codeCoverage: {
    url: 'http://127.0.0.1:3000/__coverage__'
  },
  projectId: '35quw5',
  reporter: 'mocha-multi-reporters',
  reporterOptions: {
    configFile: 'mocha-multi-reporters.json'
  },
  env: {
    disableEmailChecking: true
  },
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    async setupNodeEvents (on, config) {
      return (await import('./cypress/plugins/index.js')).default(on, config);
    },
    baseUrl: 'http://127.0.0.1:3000',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}'
  }
});
