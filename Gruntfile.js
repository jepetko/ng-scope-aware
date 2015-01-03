module.exports = function(grunt) {
    grunt.file.defaultEncoding = 'utf-8';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            '*/\n',
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                src: ['lib/*.js', 'tests/*.js']
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>',
                mangle: {
                    except: ['jQuery']
                }
            },
            js: {
                files: {
                    'dist/ng-scope-aware.js': [ 'lib/*js']
                }
            }
        },
        githooks: {
            all: {
                'pre-commit': 'jshint karma',
                'pre-push': 'uglify'
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-githooks');

    grunt.registerTask('default', ['karma']);
};