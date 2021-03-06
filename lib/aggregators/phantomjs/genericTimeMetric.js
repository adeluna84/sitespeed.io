/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Stats = require('fast-stats').Stats;
var util = require('../../util/util');
var timeMetrics = {};

exports.processPage = function(pageData) {

  if (pageData.phantomjs) {

    pageData.phantomjs.runs.forEach(function(run) {

      // The Navigation timing API
      Object.keys(run.timings).forEach(function(metric) {
        if (timeMetrics.hasOwnProperty(metric + 'PhantomJS')) {
          timeMetrics[metric + 'PhantomJS'].push(Number(run.timings[metric]));
        } else {
          timeMetrics[metric + 'PhantomJS'] = new Stats().push(Number(run.timings[metric]));
        }
      });

      // handle User Timing API
      if (run.userTimings.marks) {
        run.userTimings.marks.forEach(function(mark) {
          if (timeMetrics.hasOwnProperty(mark.name + 'PhantomJS')) {
            timeMetrics[mark.name + 'PhantomJS'].push(Number(mark.startTime));
          } else {
            timeMetrics[mark.name + 'PhantomJS'] = new Stats().push(Number(mark.startTime));
          }
        });
      }


    });

    /*

    */
  }
};

exports.generateResults = function() {
  var keys = Object.keys(timeMetrics),
    result = [];

  for (var i = 0; i < keys.length; i++) {
    result.push({
      id: keys[i],
      title: keys[i],
      desc: util.timingMetricsDefinition[keys[i]] ||
        'User Timing API metric',
      type: 'timing',
      stats: util.getStatisticsObject(timeMetrics[keys[i]], 0),
      unit: 'milliseconds'
    });
  }

  return result;
};

exports.clear = function() {
  timeMetrics = {};
};