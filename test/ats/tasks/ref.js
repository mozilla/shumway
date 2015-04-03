var firefox = require('selenium-webdriver/firefox');
var webdriver = require('selenium-webdriver');

var profile = new firefox.Profile();
profile.addExtension('../../build/firefox/shumway.xpi');
profile.setPreference('dom.always_stop_slow_scripts', true);
profile.setPreference('shumway.disabled', true);
profile.setPreference('shumway.environment', 'test');
profile.setPreference('shumway.whitelist', '*');
//var binary = new firefox.Binary('/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin');
var binary = new firefox.Binary('/Applications/Firefox.app/Contents/MacOS/firefox-bin');

var options = new firefox.Options().setProfile(profile);
options.setBinary(binary);

var driver;

function escapeRegExp(string){
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function main(info, cb) {
  var i = 0;
  var n = Math.min(info.parse_result.max_ticks, 100);
  var errors = [];
  function tick() {
    if (i++ < n) {
      setTimeout(tick);
    } else {
      if (errors.length) {
        cb({ err: errors, val: null });
      } else {
        cb({err: null, val: true});
      }
      return;
    }
    try {
      document.plugin.__tick__();
    } catch (e) {
      errors.push(e.toString());
    }
  }
  tick();
}

exports.run = function (info, cb) {
  var uri = 'http://areweflashyet.com/swfs/' + info.file;
    // 'data:text/html,<!DOCTYPE html>' +
    // info.outerHTML.replace(new RegExp(escapeRegExp(info.src), 'g'), 'http://areweflashyet.com/swfs/' + info.file);
  if (!driver) {
    driver = new firefox.Driver(options);
    driver.manage().timeouts().setScriptTimeout(10000);
  }
  // driver.manage().window().setSize(info.parse_result.width, info.parse_result.height);
  driver.get(uri).then(function () {
    driver.wait(function() {
      return driver.executeScript('return !!document.plugin.__tick__')
      .then(function(val) {
        return val;
      });
    }, 10000).then(function () {
      driver.executeAsyncScript(main, info)
      .then(function (result) {
        if (cb) {
          cb(result.err, result.val);
        }
      }, function (err) {
        if (cb) {
          cb(err, null);
        }
      });
    }, function (err) {
      if (cb) {
        cb(err, null);
      }
    });
  });
};
