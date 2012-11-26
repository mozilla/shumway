function postData(path, data) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", path, true);
  xhr.send(data);
}

function execManifest(path) {
  function exec(manifest) {
    var i = 0;
    function next() {
      if (i >= manifest.length) {
        postData('/tellMeToQuit?path=' + escape(path));
        return;
      }
      var test = manifest[i++];
      switch (test.type) {
      case 'stas':
        // using specified number (or 1) as frame rate by default
        // some tests may fail
        TestContext.defaultRate = test.defaultRate || 1;

        execStas(test.stas, test.filenames,
          function (itemNumber, itemsCount, item, result) {
            postData('/result', JSON.stringify({
              browser: browser,
              id: test.id,
              failure: result.failure,
              item: item,
              numItems: itemsCount,
              snapshot: null
            }));
            if (itemNumber + 1 == itemsCount) { // last item
              next();
            }
          });
        break;
      case 'eq':
        execEq(test.swf, test.frames,
          function (itemNumber, itemsCount, item, result) {
            postData('/result', JSON.stringify({
              browser: browser,
              id: test.id,
              failure: result.failure,
              item: item,
              numItems: itemsCount,
              snapshot: result.snapshot
            }));
            if (itemNumber + 1 == itemsCount) { // last item
              next();
            }
        });
        break;
      default:
        throw 'unknown test type';
      }
    }
    next();
  }
  function load() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", path, true);
    xhr.onreadystatechange = function(event) {
      if (xhr.readyState === 4) {
        exec(JSON.parse(xhr.responseText));
      }
    }
    xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
    xhr.send(null);
  }
  load();
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return unescape(pair[1]);
    }
  }
  return undefined;
}

var manifestFile = getQueryVariable("manifestFile");
var browser = getQueryVariable("browser");
var path = getQueryVariable("path");

execManifest(manifestFile);

