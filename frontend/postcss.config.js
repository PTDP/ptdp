const tailwindcss = require('tailwindcss');
module.exports = {
  plugins: [
    require('postcss-import'), // postcss-import needs to be first
    require('tailwindcss')('./tailwind.config.js'),
    require('postcss-nesting'),
    require('autoprefixer'),
  ],
};
