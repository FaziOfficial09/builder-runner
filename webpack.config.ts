const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
import * as webpack from 'webpack';
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');

export default (config: webpack.Configuration) => {
 



  // config.optimization = {
  //   splitChunks: {
  //     chunks: 'all',
  //     cacheGroups: {
  //       default: {
  //         minChunks: 2,
  //         priority: -20,
  //         reuseExistingChunk: true,
  //       },
  //       defaultVendors: {
  //         test: /[\\/]node_modules[\\/]/,
  //         priority: -10,
  //       },
  //     },
  //   },
  // };
  
  config?.plugins?.push(
    new MonacoWebpackPlugin({
      // a ton of languages are lazily loaded by default, but we dont use any of them
      languages: ['json', 'yaml'],
      // we can disable features that we end up not needing/using
      features: [
        'accessibilityHelp',
        'anchorSelect',
        'bracketMatching',
        // 'browser',
        'caretOperations',
        'clipboard',
        // 'codeAction',
        // 'codelens',
        // 'colorPicker',
        'comment',
        'contextmenu',
        'copyPaste',
        'cursorUndo',
        // 'dnd',
        // 'documentSymbols',
        // 'dropIntoEditor',
        'find',
        'folding',
        // 'fontZoom',
        'format',
        'gotoError',
        'gotoLine',
        // 'gotoSymbol',
        'hover',
        // 'iPadShowKeyboard',
        // 'inPlaceReplace',
        'indentation',
        // 'inlayHints',
        'inlineCompletions',
        // 'inspectTokens',
        'lineSelection',
        'linesOperations',
        // 'linkedEditing',
        // 'links',
        // 'multicursor',
        // 'parameterHints',
        // 'quickCommand',
        // 'quickHelp',
        // 'quickOutline',
        // 'readOnlyMessage',
        // 'referenceSearch',
        // 'rename',
        'smartSelect',
        // 'snippet',
        'stickyScroll',
        'suggest',
        // 'toggleHighContrast',
        'toggleTabFocusMode',
        'tokenization',
        'unicodeHighlighter',
        // 'unusualLineTerminators',
        // 'viewportSemanticTokens',
        'wordHighlighter',
        'wordOperations',
        'wordPartOperations'
      ],
      customLanguages: [
        {
          label: 'yaml',
          entry: 'monaco-yaml',
          worker: {
            id: 'monaco-yaml/yamlWorker',
            entry: 'monaco-yaml/yaml.worker'
          }
        }
      ]
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    //   openAnalyzer: false,
    //   reportFilename: 'bundle-report.html'
    // }),
    new CompressionPlugin({
      // Use [path][base].gz to preserve the original file names and extensions,
      // and add .gz at the end of them.
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,
      // By default, the report will display file sizes in gzip. 
      // If you want to see parsed sizes (uncompressed), set this to 'parsed'.
      defaultSizes: 'gzip',
    })
  );
  // Remove the existing css loader rule
  const cssRuleIdx = config?.module?.rules?.findIndex((rule: any) => rule.test?.toString().includes(':css'));
  if (cssRuleIdx !== -1) {
    config?.module?.rules?.splice(cssRuleIdx!, 1);
  }
  config?.module?.rules?.push(
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    },
    {
      test: /\.ttf$/,
      use: ['file-loader']
    }
  );
  return config;
};
