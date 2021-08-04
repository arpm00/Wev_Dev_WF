const {src, dest, watch, series, parallel} = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')(require('sass'))
const uglify = require('gulp-uglify')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const concat = require('gulp-concat')
const cssnano = require('gulp-cssnano')
const rev = require('gulp-rev')
const imagemin = require('gulp-imagemin')
const usemin = require('gulp-usemin')
const del = require('del')
const browserSync = require('browser-sync').create()
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackConfig = require('./webpack.config')
const changed = require('gulp-changed')
const prettify = require('gulp-html-prettify')
const pug = require('gulp-pug')

//Source Paths
const srcFiles = {
    css: './en/assets/css/**/*.css',
    scss: './en/assets/scss/**/*.scss',
    js: './en/assets/scripts/lib/*.js',
    html: './en/*.html',
    pug: './en/pug/*.pug',
    pugWatch: './en/pug/**/*.pug',
    mainjs: './en/assets/scripts/app.js'
}

//Destination Paths
const destFiles = {
    cssFiles: './en/src/styles/',
    jsFiles: './en/src/scripts/'
}

//PUG
function pugTask(){
    return src([srcFiles.pug])
        .pipe(pug({
            pretty: true
        }))
        .pipe(dest('./en'))
}

//SCSS Task
function scssTask(){
    return src(srcFiles.scss)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ autoprefixer() ]).on('error', function(errorInfo){
            console.log(errorInfo.toString());
            this.emit('end');
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(destFiles.cssFiles))
        .pipe(browserSync.stream());
}

//CSS Merge and Minify
function css(){
    return src(srcFiles.css)
        .pipe(cssnano())
        .pipe(concat('libraries.min.css'))
        .pipe(changed(destFiles.cssFiles))
        .pipe(dest(destFiles.cssFiles))
}

//JS 
function js(){
    return src(srcFiles.js)
        .pipe(concat('library.js'))
        .pipe(changed(destFiles.jsFiles))
        .pipe(dest(destFiles.jsFiles))
}

//JS Task
function jsTask(){
    return src(srcFiles.mainjs)
        .pipe(webpackStream(webpackConfig), webpack).on('error', function(err, stats){
            if (err) {
                console.log(err.toString());
            }
            console.log(stats.toString());
        })
        .pipe(dest(destFiles.jsFiles))
        .pipe(browserSync.stream());
}

//Watch Task
function watchTask() {
    browserSync.init({
        notify: false,
        server: {
            baseDir: './en'
        }
    });
    watch(srcFiles.scss, scssTask)
    watch(srcFiles.mainjs, jsTask)
    watch(srcFiles.pugWatch, pugTask)
    watch(srcFiles.html).on('change', browserSync.reload)
}

//GBuild
//Delete dist before compile
function delDistFolder(){
    return del('./dist')
}

function copyGeneralFiles(){
    const pathToCopy = [
        '.en/**/*',
        '!./en/*.html',
        '!./en/assets/images/**',
        '!./en/assets/styles/**',
        '!./en/assets/scripts/**',
        '!./en/assets/scss/**',
        '!./en/assets/scss',
        '!./en/src',
        '!./en/src/**',
        '!./en/pug',
        '!./en/pug/**'
    ]
    return src(pathToCopy)
    .pipe(dest('./dist'))
}

//Minify Images
function imgMin(){
    return src(['./en/assets/images/**/*', '!./en/assets/images/icon','!./en/assets/images/icon/**/*'])
    .pipe(imagemin({
      progressive: true,
      interlays: true,
      multipass: true
    }))
    .pipe(dest("./dist/assets/images"));
}

//CSS and JS Minify
function minified(){
    return src('./en/*.html')
    .pipe(usemin({
        css: [ rev()],
        jsAttributes: {
          async: true
        },
        js: [ uglify(), rev()],
      }))
        .pipe(dest('./dist'))
}

//Preview dist after build
function previewDist() {
  
    browserSync.init({
      notify: false,
      server: {
        baseDir: './dist'
      }
    })
}

exports.default = series(pugTask, parallel(scssTask, jsTask), css, js, watchTask);
exports.build = series(delDistFolder, minified, imgMin, copyGeneralFiles, previewDist);