/**
 * @file gulpfile.js
 *
 * Build tasks and generator tools for www.tsmith512.com
 * By Taylor Smith @tsmith512
 *
 * Run `gulp help` to for a list of suggested tasks.
 */

/* eslint strict: ["error", "global"] */
/* global require */
'use strict';

/*
     _
  __| | ___ _ __  ___
 / _` |/ _ \ '_ \/ __|
| (_| |  __/ |_) \__ \
 \__,_|\___| .__/|___/
           |_|
*/

const gulp = require('gulp-help')(require('gulp'), {
  description: false,
  hideDepsMessage: true,
  hideEmpty: true
});
const gutil = require('gulp-util');

const autoprefixer = require('gulp-autoprefixer');
const awspublish = require('gulp-awspublish');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const fs = require('fs');
const glob = require('glob');
const gulpicon = require('gulpicon/tasks/gulpicon');
const gulpiconConfig = require('./gfx/icons/config.js');
const gulpiconFiles = glob.sync('./gfx/icons/*.svg');
const imagemin = require('gulp-imagemin');
const resize = require('gulp-image-resize');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');

/*
                    _
  __ _ ___ ___  ___| |_ ___
 / _` / __/ __|/ _ \ __/ __|
| (_| \__ \__ \  __/ |_\__ \
 \__,_|___/___/\___|\__|___/

*/

// CSS
gulp.task('sass', 'Compile Sass to CSS', () => {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    // Run CleanCSS, but mostly just for minification. Starting light here.
    .pipe(cleanCSS({
      advanced: false,
      mediaMerging: false,
      rebase: false,
      restructuring: false,
      shorthandCompacting: false
    }))
    .pipe(concat('all.css'))
    .pipe(gulp.dest('./dist/css'));
});


// IMAGES
gulp.task('icons', false, gulpicon(gulpiconFiles, gulpiconConfig));

gulp.task('graphics', 'Compress site graphics and aggregate icons', ['icons'], () => {
  return gulp.src(['./gfx/**/*.*'])
  .pipe(imagemin())
  .pipe(gulp.dest('./dist/gfx/'));
});

// JAVASCRIPT
gulp.task('js', 'Aggregate JavaScript', () => {
  return gulp.src(['js/googleanalytics.js','node_modules/fg-loadcss/src/loadCSS.js','node_modules/fg-loadcss/src/cssrelpreload.js'])
  .pipe(concat('lib.js'))
  .pipe(gulp.dest('./dist/js/'));
});

/*
     _ _         _           _ _     _
 ___(_) |_ ___  | |__  _   _(_) | __| |
/ __| | __/ _ \ | '_ \| | | | | |/ _` |
\__ \ | ||  __/ | |_) | |_| | | | (_| |
|___/_|\__\___| |_.__/ \__,_|_|_|\__,_|

*/

gulp.task('build', 'Run all site-generating tasks: sass, js, graphics, icons, htaccess then jekyll', (cb) => {
  runSequence(['sass', 'graphics', 'icons', 'js'], 'jekyll', cb);
});

gulp.task('publish-s3', 'Sync the site to S3', (cb) => {
  // create a new publisher using S3 options
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
  var publisher = awspublish.create({
    region: 'us-west-1',
    params: {
      Bucket: 'tsmithresume'
    },
  });

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src('./dist/**/*.*')
    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    .pipe(publisher.sync())

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

     // print upload updates to console
    .pipe(awspublish.reporter());
});

gulp.task('publish', 'Build the site and publish to S3', (cb) => {
  runSequence(['build'], 'publish-s3', cb);
});

/*
             _             _          __  __
  __ _ _   _| |_ __    ___| |_ _   _ / _|/ _|
 / _` | | | | | '_ \  / __| __| | | | |_| |_
| (_| | |_| | | |_) | \__ \ |_| |_| |  _|  _|
 \__, |\__,_|_| .__/  |___/\__|\__,_|_| |_|
 |___/        |_|
*/

gulp.task('default', false, ['help']);
