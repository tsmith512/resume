'use strict';

module.exports = function (grunt) {
  var mozjpeg = require('imagemin-mozjpeg');

  grunt.initConfig({
    watch: {
      options: {
        livereload: 9001
      },
      sass: {
        files: ['scss/{,**/}*.scss'],
        tasks: ['compass:dev'],
        options: {
          livereload: false
        }
      },
      css: {
        files: ['css/{,**/}*.css']
      },
      images: {
        files: ['gfx/**']
      },
    },

    compass: {
      options: {
        config: 'config.rb',
        bundleExec: true
      },
      dev: {
        options: {
          environment: 'development'
        }
      },
      dist: {
        options: {
          environment: 'production',
          imagesDir: 'img',
          force: true,
        }
      }
    },

    grunticon: {
      development: {
        files: [{
          expand: true,
          cwd: 'gfx/icons',
          src: ['*.svg'],
          dest: "img/icons",
        }],
        options: {
          previewhtml: "icons.html",
          defaultWidth: "64px",
          defaultHeight: "64px",
          colors: {
            grey: '#00436F',
            main: '#006DAF',
          },
          customselectors: {
            "fpx-grey": [".fpx"],
            "fpx-main": [".fpx:hover"],
            "behance-grey": [".behance"],
            "behance-main": [".behance:hover"],
            "drupal-grey": [".drupal"],
            "drupal-main": [".drupal:hover"],
            "facebook-grey": [".facebook"],
            "facebook-main": [".facebook:hover"],
            "github-grey": [".github"],
            "github-main": [".github:hover"],
            "linkedin-grey": [".linkedin"],
            "linkedin-main": [".linkedin:hover"],
            "twitter-grey": [".twitter"],
            "twitter-main": [".twitter:hover"],
          }
        }
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'gfx',
          src: ['**/*.svg',  '!**/icons/**'],
          dest: 'img'
        }]
      }
    },

    concat: {
      css: {
        src: ['css/main.css', 'img/icons/icons.data.svg.css'],
        dest: 'dist/css.css',
      },
      js: {
        src: ['js/vendor/loadCSS/loadCSS.js'],
        dest: 'dist/head.js',
      },
    },

    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/min.css': ['dist/css.css']
        }
      }
    },

    imagemin: {
      dynamic: {
        options: {
          optimizationLevel: 3,
          svgoPlugins: [{ removeViewBox: false }],
          use: [mozjpeg()]
        },
        files: [{
          expand: true,
          cwd: 'gfx/',
          src: ['**/*.{png,jpg,gif}', '!**/icons/**'],
          dest: 'img/'
        }]
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      js: {
        files: {
          'dist/head.min.js': ['dist/head.js']
        }
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: false,
          collapseWhitespace: true
        },
        files: {
          'index.html': 'source.html',
        }
      },
    },

    clean: {
      dist: ["temp-icons", "img", "css", "dist", "index.html", ".sass-cache"]
    },
  });


  grunt.event.on('watch', function(action, filepath) {
    grunt.config([
      'compass:dev',
    ], filepath);
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-parallel');
  grunt.loadNpmTasks('grunt-svgmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-grunticon');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  // grunt icons: This will ensure all of our icons are created properly.
  grunt.registerTask('icons', [
    'grunticon:development',
  ]);

  // grunt sass: Compiles all of the Sass in our directory.
  grunt.registerTask('sass', [
    'compass:dev',
  ]);

  // grunt build: Does a full rebuild of our icons, minifies images, compiles
  //   the Sass, and lints our js
  grunt.registerTask('build', [
    'clean:dist',
    'svgmin',
    'imagemin',
    'icons',
    'compass:dist',
    'concat:css',
    'cssmin',
    'concat:js',
    'uglify',
    'htmlmin:dist',
  ]);

  // grunt / grunt default: Cleans our Sass cache files, builds our icons, and
  //   compiles the Sass from scratch. Run this after you switch branches.
  grunt.registerTask('default', [
    'clean:dist',
    'icons',
    'compass:dev',
  ]);
};
