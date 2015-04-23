var fs = require('fs');
var request = require('request');
var urls = [];

(function scrapeCatalog() {
  var url = "https://tl-beta.paas.allizom.org/data/front.js";
  console.log("Loading " + url);
  downloadAndSave(url, "../data.js", false, function(content) {
    var jsonMatch = content.match(/( *var [\w]+ *= *)?({.*});?/i);
    try {
      var json = JSON.parse(jsonMatch[2]);
      for (var i = 0; i < json.engines.length; i++) {
        var engine = json.engines[i];
        for (var j = 0; j < json.suites.length; j++) {
          var suite = json.suites[j];
          for (var k = 0; k < suite.scripts.length; k++) {
            var script = suite.scripts[k];
            var url = "data-" + suite.name + "-" + engine.name + "-" + script.name + ".json";
            urls.push(url);
          }
        }
      }
      scrapeJSON();
    }
    catch(e) {
      console.log("ERROR");
      console.log(e);
    }
  });
})();

function scrapeJSON() {
  var url = urls.pop();
  if (url) {
    var base = "https://tl-uploader.paas.allizom.org/";
    console.log("Loading " + url);
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
}

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
