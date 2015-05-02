'use strict';

module.exports = function (grunt) {
  var mozjpeg = require('imagemin-mozjpeg');
  var devURL = 'http://www.dev.resume.tsmith512.com';

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
      cssCritical: {
        src: ['css/main.css'],
        dest: 'dist/critical.css',
      },
      cssSecondary: {
        src: ['img/icons/icons.data.svg.css'],
        dest: 'dist/secondary.css',
      },
      jsHead: {
        src: ['js/vendor/loadCSS/loadCSS.js'],
        dest: 'dist/head.js',
      },
      jsFoot: {
        src: ['js/googleanalytics.js'],
        dest: 'dist/foot.js',
      },
    },

    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/critical.min.css': ['dist/critical.css'],
          'dist/secondary.min.css': ['dist/secondary.css'],
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
          'dist/head.min.js': ['dist/head.js'],
          'dist/foot.min.js': ['dist/foot.js'],
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

    inline: {
      dist: {
        options:{
            tag: 'inline'
        },
        src: 'index.html',
      }
    },

    clean: {
      preBuild: ["temp-icons", "img", "css", "dist", "index.html", ".sass-cache"],
      postBuild: ["dist/critical.css", "dist/secondary.css", "dist/head.js", "dist/foot.js", ".sass-cache"]
    },

    pagespeed: {
      devDesktop: {
        options: {
          url: devURL,
          nokey: true,
          locale: "en_US",
          strategy: "desktop",
          threshold: 90,
        }
      },
      devMobile: {
        options: {
          url: devURL,
          nokey: true,
          locale: "en_US",
          strategy: "mobile",
          threshold: 90,
        },
      },
    },

    yslow: {
      options: {
        thresholds: {
          weight: 200,
          speed: 1000,
          score: 90,
          requests: 20,
        }
      },
      pages: {
        files: [
          {
            src: devURL,
          }
        ]
      }
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
  grunt.loadNpmTasks('grunt-inline');
  grunt.loadNpmTasks('grunt-pagespeed');
  grunt.loadNpmTasks('grunt-yslow');

  // grunt build: Does a full rebuild of our icons, minifies images, compiles
  //   the Sass, and lints our js
  grunt.registerTask('build', [
    'clean:preBuild',
    'svgmin',
    'imagemin',
    'grunticon:development',
    'compass:dist',
    'concat:cssCritical',
    'concat:cssSecondary',
    'cssmin',
    'concat:jsHead',
    'concat:jsFoot',
    'uglify',
    'htmlmin:dist',
    'inline',
    'clean:postBuild',
  ]);

  grunt.task.registerTask('perfreport', 'Update performance testing records.', function() {
    require('logfile-grunt')(grunt, { filePath: 'performance-report.txt', clearLogFile: true });
  });

  grunt.registerTask('test', [
    'perfreport',
    'pagespeed',
    'yslow',
  ]);
};
