'use strict';

var childProcess = require('child_process');
var electron = require('electron');
var gulp = require('gulp');
var electronProcess = require('electron-connect').server.create();

gulp.task('start', ['build', 'watch'], function () {
    electronProcess.start();
    // Restart browser process
    gulp.watch('./app/app.js', electronProcess.restart);
    // Reload renderer process
    gulp.watch(['./app/app.html'], electronProcess.reload);
    gulp.watch('./app/stylesheets/main.css', electronProcess.reload);
});
