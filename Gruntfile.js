/**
 * A base vue3 application using webpack and grunt.
 */
const path = require('path');
const { VueLoaderPlugin } =require('vue-loader');
const { webpack, DefinePlugin } = require('webpack');
const BASE_DIR = __dirname;
const OUTPUT_DIR = BASE_DIR + '/build/';
const buildFiles = ['main.js', 'sampleData.js', '/composables/treeView.js'];

/**
 * @returns a webpack config object.  Useful if there are several build targets
 */
function getConfig(target, buildFiles) {
  // The module entry is a full path to a typescript file stored in vexflow/entry/.
  const entry = path.join(BASE_DIR, 'src/', target + '.js');
  const outputFilename = target + '_output.js';
  const devtool = 'source-map';
  const absTest = buildFiles.map((ff) => path.join(BASE_DIR, 'src/' + ff));
  return {
    mode: 'development',
    entry: entry,
    output: {
      path: OUTPUT_DIR,
      filename: outputFilename,
      library: target,
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    devtool,
    module: {
      rules: [
        {
          test: /(\.ts$|\.js$)/,
          include: absTest,
          use: [
            {
              loader: 'ts-loader',
            },
          ],
        }, {
          test: /\.vue$/,
          use: 'vue-loader'
        },
        { test: /\.css$/, use: ['vue-style-loader', 'css-loader']},
      ],
    },
    plugins: [new VueLoaderPlugin(),
    new DefinePlugin({
      __VUE_OPTIONS_API__ : true,
      __VUE_PROD_DEVTOOLS__ : true
    })]
  };
}

module.exports = (grunt) => {
  const buildConfig = getConfig('main', buildFiles);
  const PACKAGE_JSON = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: PACKAGE_JSON,
    webpack: {
      buildConfig
    }
  });
  grunt.loadNpmTasks('grunt-webpack');
  // Default tasks that run when you type `grunt`.
  grunt.registerTask(
    'default',
    'Build the Build', //
    ['webpack:buildConfig']
  );  
};
