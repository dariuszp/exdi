'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('default', function () {
    gulp.src('src/exdi.js')
        .pipe(rename('exdi.min.js'))
        .pipe(uglify({
            outSourceMap: true
        }))
        .pipe(gulp.dest('src'));
});