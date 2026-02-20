export default {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        'Chrome >= 120',
        'Firefox >= 121',
        'Safari >= 17',
        'Edge >= 120'
      ]
    },
    cssnano: {
      preset: ['default', {
        discardComments: {
          removeAll: true
        },
        normalizeWhitespace: true,
        colormin: true,
        minifyFontValues: true,
        minifySelectors: true
      }]
    }
  }
};
