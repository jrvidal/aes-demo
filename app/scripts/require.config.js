/* jshint unused: false, -W079 */
require.config({
  baseUrl: 'scripts',
  paths: {
    backbone: 'lib/backbone',
    underscore: '../bower_components/underscore/underscore',
    jquery: 'lib/jquery',
    hbs: '../bower_components/require-handlebars-plugin/hbs',
    text: '../bower_components/requirejs-text/text',
    almond: '../bower_components/almond/almond'
  },

  hbs: { // optional
    helpers: false,            // default: true
    i18n: false,              // default: false
    templateExtension: 'hbs', // default: 'hbs'
    partialsUrl: ''           // default: ''
  },

  pragmasOnSave: {
    //removes Handlebars.Parser code (used to compile template strings) set
    //it to `false` if you need to parse template strings even after build
    excludeHbsParser : true,
    // kills the entire plugin set once it's built.
    excludeHbs: true,
    // removes i18n precompiler, handlebars and json2
    excludeAfterBuild: true
  }
});
