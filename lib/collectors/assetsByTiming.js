/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

var util = require('../util/util'),
  assets = {},
  RequestTiming = require('../requestTiming'),
  winston = require('winston');

exports.processPage = function(pageData) {
  var log = winston.loggers.get('sitespeed.io');
  if (pageData.har) {
    var pageURL = util.getURLFromPageData(pageData);
    pageData.har.forEach(function(har) {
      har.log.entries.forEach(function(entry) {

        var asset = assets[entry.request.url];
        var total;
        if (asset) {
          if (entry.timings) {
            total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl +
              entry.timings
              .send + entry.timings.wait + entry.timings.receive;
            asset.timing.add(total, entry.request.url, pageURL);
          } else {
            log.log('info', 'Missing timings in the HAR');
          }
        } else {
          if (entry.timings) {
            total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl +
              entry.timings
              .send + entry.timings.wait + entry.timings.receive;
            assets[entry.request.url] = {
              url: entry.request.url,
              timing: new RequestTiming(total, entry.request.url, pageURL),
              parent: util.getURLFromPageData(pageData)
            };
          }
        }
      });
    });
  }
};

exports.generateResults = function() {
  var values = Object.keys(assets).map(function(key) {
    return assets[key];
  });

  return {
    id: 'assetsByTiming',
    list: values
  };
};

exports.clear = function() {
  assets = {};
};
