/* eslint-disable require-jsdoc */
const {src, dest, series, parallel, watch} = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
const sass = require('gulp-sass')(require('node-sass'));
const pug = require('gulp-pug');
const pugLinter = require('gulp-pug-linter');
const gulpStylelint = require('gulp-stylelint');
const eslint = require('gulp-eslint');

const origin = 'src';
const destination = 'build';

async function clean(cb) {
  await del(destination);
  cb();
}

function buildMarkup(cb) {
  src(`${origin}/**/*.pug`)
      .pipe(pug({
        pretty: true,
      }))
      .pipe(dest(destination));
  cb();
}

function buildStyles(cb) {
  src(`${origin}/css/**/*.scss`)
      .pipe(sass({
        outputStyle: 'compressed',
      }))
      .pipe(dest(`${destination}/css`));
  cb();
}

function buildScripts(cb) {
  src(`${origin}/js/**/*.js`)
      .pipe(babel({
        presets: ['@babel/env'],
      }))
      .pipe(dest(`${destination}/js`));
  cb();
}

function watcher(cb) {
  watch(`${origin}/**/*.pug`)
      .on('change', series(buildMarkup, browserSync.reload));
  watch(`${origin}/**/*.scss`)
      .on('change', series(buildStyles, browserSync.reload));
  watch(`${origin}/**/*.js`)
      .on('change', series(buildScripts, browserSync.reload));
  cb();
}

function server(cb) {
  browserSync.init({
    notify: false,
    server: {
      baseDir: destination,
    },
  });
  cb();
}

function lintMarkup(cb) {
  src(`${origin}/**/*.pug`)
      .pipe(pugLinter({reporter: 'default'}));
  cb();
}

function lintStyles(cb) {
  src(`${origin}/**/*.scss`)
      .pipe(gulpStylelint({
        reporters: [
          {formatter: 'string', console: true},
        ],
      }));
  cb();
}

function lintScripts(cb) {
  src(`${origin}/**/*.js`)
      .pipe(eslint({
        configFile: '.eslintrc.json',
      }))
      .pipe(eslint.format());
  cb();
}

exports.default = series(
    clean,
    parallel(buildMarkup, buildStyles, buildScripts),
    server,
    watcher,
);

exports.lintMarkup = lintMarkup;
exports.lintStyles = lintStyles;
exports.lintScripts = lintScripts;

exports.lint = series(lintMarkup, lintStyles, lintScripts);
