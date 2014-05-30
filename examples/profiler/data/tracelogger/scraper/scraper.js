var fs = require('fs');
var request = require('request');
var TLData = require("./data/TLData");

var urls = [];
for (var i = 0; i < TLData.engines.length; i++) {
  var engine = TLData.engines[i];
  for (var j = 0; j < TLData.suites.length; j++) {
    var suite = TLData.suites[j];
    for (var k = 0; k < suite.scripts.length; k++) {
      var script = suite.scripts[k];
      var url = "data-" + suite.name + "-" + engine.name + "-" + script.name + ".json";
      urls.push(url);
    }
  }
}

(function scrapeJSON() {
  var url = urls.pop();
  if (url) {
    var base = "https://tl-uploader.paas.allizom.org/";
    console.log(url);
    downloadAndSave(base + url, "../" + url, false, function(content) {
      var json = JSON.parse(content);
      for (var i = 0; i < json.length; i++) {
        downloadAndSave(base + json[i].dict, "../" + json[i].dict, false);
        downloadAndSave(base + json[i].tree, "../" + json[i].tree, true);
        if (json[i].corrections) {
          downloadAndSave(base + json[i].corrections, "../" + json[i].corrections, false);
        }
      }
      scrapeJSON();
    });
  } else {
    console.log("DONE");
  }
})();

function downloadAndSave(url, filename, binary, callback) {
  var options = binary ? { encoding: null } : {};
  request(url, options, function(error, response, body) {
    fs.writeFile(filename, body);
    console.log(filename);
    if (callback) {
      callback(body);
    }
  });
};
