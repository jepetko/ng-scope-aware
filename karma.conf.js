//Karma configuration
module.exports = function(config) {
	
    config.set({
    	
        // base path, that will be used to resolve files and exclude
        basePath: '.',


        // frameworks to use
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'node_modules/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'node_modules/angular-route/angular-route.js',
            
            //source code:            
            'lib/**/*.js',
            
            //tests:
            'tests/*.js'
        ],


        // list of files to exclude
        exclude: [
            //'js/whatever.js',
        ],


        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress', 'html', 'coverage'],
        
        htmlReporter: {
            outputFile: __dirname  + '/output.html',
            templatePath: __dirname + '/jasmine_template.html'
        },

        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                { type: 'html', subdir: 'report-html' }
            ]
        },
        
        // generate js files from html templates
        preprocessors: {
          'templates/*.html': 'ng-html2js',
          'lib/*.js': 'coverage'
        },

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: ['PhantomJS'],
        //browsers: ['Chrome'],
        captureTimeout: 5000,
        singleRun: true
    });
};