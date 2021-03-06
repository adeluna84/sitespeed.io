/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var path = require('path'),
  childProcess = require('child_process'),
  binPath = require('phantomjs').path,
  util = require('../util/util'),
  fs = require('fs'),
  winston = require('winston'),
  async = require('async');

module.exports = {
  analyze: function(urls, config, callback) {
    return this.takeScreenshots(urls, config, callback);
  },

  takeScreenshots: function(urls, config, callback) {

    var screenshotsDir = path.join(config.run.absResultDir, config.dataDir, 'screenshots');
    var log = winston.loggers.get('sitespeed.io');

    fs.mkdir(screenshotsDir, function(err) {
      if (err) {
        log.log('error', 'Couldnt create the screenshot result dir:' + screenshotsDir + ' ' + err);

        callback(err, {
          'type': 'screenshots',
          'data': {},
          'errors': {}
        });

      } else {
        var queue = async.queue(screenshot, config.threads);

        var errors = {};
        urls.forEach(function(u) {
          queue.push({
            'url': u,
            'config': config
          }, function(err) {
            if (err) {
              errors[u] = err;
            }
          });
        });

        queue.drain = function() {
          callback(undefined, {
            'type': 'screenshots',
            'data': {},
            'errors': errors
          });
        };
      }

    });


  }
};

function screenshot(args, asyncDoneCallback) {
  var url = args.url;
  var config = args.config;
  var log = winston.loggers.get('sitespeed.io');
  
  // PhantomJS arguments
  var childArgs = ['--ssl-protocol=any', '--ignore-ssl-errors=yes'];

  //
  childArgs.push(path.join(__dirname, '..', 'phantomjs', 'screenshot.js'));

  childArgs.push(url);
  childArgs.push(path.join(config.run.absResultDir, config.dataDir, 'screenshots', util.getFileName(url) +
    '.png'));
  childArgs.push(config.viewPort.split('x')[0]);
  childArgs.push(config.viewPort.split('x')[1]);
  childArgs.push(config.userAgent);
  childArgs.push(true);

  if (config.basicAuth) {
    childArgs.push(config.basicAuth);
  }

  if (config.requestHeaders) {
    childArgs.push(JSON.stringify(config.requestHeaders));
  } else {
    childArgs.push('');
  }

  log.log('info', 'Taking screenshot for ' + url);

  childProcess.execFile(binPath, childArgs, {
    timeout: 60000
  }, function(err, stdout, stderr) {

    if (stderr) {
      log.log('error', 'stderr: Error getting screenshots ' + url + ' (' + stderr +
        ')');
    }

    if (err) {
      log.log('error', 'Error getting screenshots: ' + url + ' (' + stdout + stderr +
        err + ')');
      asyncDoneCallback(undefined, err + stdout);
    } else {
      asyncDoneCallback(undefined, err);
    }
  });
}
