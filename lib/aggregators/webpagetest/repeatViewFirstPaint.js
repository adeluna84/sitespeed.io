/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Aggregator = require('../aggregator');

module.exports = new Aggregator('repeatViewFirstPaintWPT',
  'First Paint Repeat View',
  'The first paint time (fetched using WebPageTest)', 'timing', 'milliseconds', 0,
  function(pageData) {
    if (pageData.webpagetest) {
      var stats = this.stats;
      pageData.webpagetest.response.data.run.forEach(function(run) {
        if (typeof run.repeatView != 'undefined') {
          stats.push(run.repeatView.results.firstPaint);
        }
      });
    }
  });
