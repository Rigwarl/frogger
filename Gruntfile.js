module.exports = grunt => {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      dev: {
        options: {
          browserifyOptions: {
            debug: true,
          },
          transform: [['babelify', { presets: ['es2015'] }]],
        },
        files: {
          'app/js/build/app.js': 'app/js/src/app.js',
        },
      },
    },
    copy: {
      app: {
        expand: true,
        flatten: true,
        src: ['app/js/lib/*.js', 'node_modules/babel-polyfill/dist/polyfill.min.js'],
        dest: 'app/js/build/',
      },
      docs: {
        expand: true,
        flatten: true,
        src: 'app/js/build/*.js',
        dest: 'docs/js/',
      },
    },
    clean: {
      app: ['app/js/build'],
      docs: ['docs/js/'],
    },
    connect: {
      server: {
        options: {
          port: 9001,
          open: true,
          base: 'app',
        },
      },
    },
    watch: {
      options: {
        spawn: false,
        livereload: true,
      },
      js: {
        files: ['app/js/src/**/*.js'],
        tasks: ['browserify'],
      },
      all: {
        files: ['app/*', '!app/js/src'],
      },
    },
  });

  grunt.registerTask('build', ['clean:app', 'copy:app', 'browserify']);
  grunt.registerTask('build:docs', ['build', 'clean:docs', 'copy:docs']);
  grunt.registerTask('default', ['build', 'connect', 'watch']);
};
