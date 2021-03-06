/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var async = require('async'),
  render = require('../util/htmlRenderer');


exports.task = function(result, config, cb) {

  // TODO change to reduce
  var filtered = result.aggregates.filter(function(box) {
    return (config.summaryBoxes.indexOf(box.id) > -1);
  }).sort(function(box, box2) {
    return config.summaryBoxes.indexOf(box.id) - config.summaryBoxes.indexOf(box2.id);
  });
  var summaryData = {
    'aggregates': filtered,
    'config': config,
    'numberOfPages': result.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'Summary of the sitespeed.io result',
      'description': 'A executive summary.',
      'isSummary': true
    }
  };

  var detailedData = {
    'aggregates': result.aggregates,
    'config': config,
    'numberOfPages': result.numberOfAnalyzedPages,
    'pageMeta': {
      'title': 'In details summary of the sitespeed.io result',
      'description': 'The summary in details.',
      'isDetailedSummary': true
    }
  };

  async.parallel({
      writeSummaryFile: function(callback) {
        render('site-summary', summaryData, config.run.absResultDir, callback, 'index.html');
      },
      writeDetailedSummaryFile: function(callback) {
        render('detailed-site-summary', detailedData, config.run.absResultDir, callback);
      }
    },
    function(err, results) {
      cb();
    });
};