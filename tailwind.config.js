/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{html,ts}'],
  content: [
    // 'node_modules/preline/dist/*.js',
    './pages/**/*.{html,js}',
    './components/**/*.{html,js}',
],
// plugins: [
//     require('preline/plugin'),
// ],
  theme: {
    extend: {
      colors: {
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a"}
      },
      backgroundImage: {
        'hero-pattern': "url('assets/images/expo/flower-white@2x.f642a17.webp')"
      }
    },
    fontFamily: {
      'body': [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'system-ui',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji'
  ],
      'sans': [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'system-ui',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji'
  ]
    }
  },
  variants: {},
}


// module.exports = {
//   mode: 'jit',
//   purge: ['./src/**/*.{html,ts}'],
//   theme: {
//     colors: {
//       // Define a custom color named 'custom-color' with a function that returns an object
//       // with the different shades of the color based on the selected value
//       'custom-color': ({ opacityVariable, opacityValue, color }) => {
//         const newColor = color.alpha(opacityValue / 100).toString();

//         return {
//           '50': color.alpha(0.05).mix(newColor, 0.5).string(),
//           '100': color.alpha(0.1).mix(newColor, 0.5).string(),
//           '200': color.alpha(0.2).mix(newColor, 0.5).string(),
//           '300': color.alpha(0.3).mix(newColor, 0.5).string(),
//           '400': color.alpha(0.4).mix(newColor, 0.5).string(),
//           '500': color.alpha(0.5).mix(newColor, 0.5).string(),
//           '600': color.alpha(0.6).mix(newColor, 0.5).string(),
//           '700': color.alpha(0.7).mix(newColor, 0.5).string(),
//           '800': color.alpha(0.8).mix(newColor, 0.5).string(),
//           '900': color.alpha(0.9).mix(newColor, 0.5).string(),
//         };
//       },
//     },
//     fontFamily: {
//       'body': [
//     'Inter',
//     'ui-sans-serif',
//     'system-ui',
//     '-apple-system',
//     'system-ui',
//     'Segoe UI',
//     'Roboto',
//     'Helvetica Neue',
//     'Arial',
//     'Noto Sans',
//     'sans-serif',
//     'Apple Color Emoji',
//     'Segoe UI Emoji',
//     'Segoe UI Symbol',
//     'Noto Color Emoji'
//   ],
//       'sans': [
//     'Inter',
//     'ui-sans-serif',
//     'system-ui',
//     '-apple-system',
//     'system-ui',
//     'Segoe UI',
//     'Roboto',
//     'Helvetica Neue',
//     'Arial',
//     'Noto Sans',
//     'sans-serif',
//     'Apple Color Emoji',
//     'Segoe UI Emoji',
//     'Segoe UI Symbol',
//     'Noto Color Emoji'
//   ]
//     }
//   },
//   variants: {},
//   plugins: [],
// }
