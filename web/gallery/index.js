(function() {

  var swfs = [];
  var swfIndex = 0;

  var VIEWER_URL = "../iframe/viewer.html?forceHidpi=" + (isHidpi() ? 1 : 0) + "&swf=";
  var ARCHIVE_URL = "http://swf.codeazur.com.br/archive/";
  var GALLERY_API_URL = "http://swf.codeazur.com.br/api/gallery.php";

  function isHidpi() {
    if (window.matchMedia) {
      var mq = window.matchMedia("only screen and (-moz-min-device-pixel-ratio: 1.3), " +
        "only screen and (-o-min-device-pixel-ratio: 2.6/2), " +
        "only screen and (-webkit-min-device-pixel-ratio: 1.3), " +
        "only screen and (min-device-pixel-ratio: 1.3), " +
        "only screen and (min-resolution: 1.3dppx)");
      return mq && mq.matches;
    }
    return false;
  }

  getJSON(GALLERY_API_URL, function(galleryJSON) {
    if (galleryJSON && galleryJSON.swfs) {
      swfs = galleryJSON.swfs;
      document.getElementById("prev").classList.add("active");
      document.getElementById("next").classList.add("active");
      window.addEventListener("hashchange", show, false);
      show();
    }
  });

  function getJSON(url, callback) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (this.readyState === 4) {
        var response = req.response;
        try {
          if (typeof response === "string") {
            response = JSON.parse(response);
          }
        }
        catch(e) {}
        callback(response);
      }
    };
    req.open("get", url, true);
    req.responseType = "json";
    req.send(null);
  }

  function show() {
    var el;
    var container = document.getElementById("realContent");
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    var swfIndices = getIndicesFromHash(window.location.hash);
    swfIndex = swfIndices.length ? swfIndices[0] : -1;

    if (swfIndices) {
      for (var i = 0; i < swfIndices.length; i++) {
        var swf = swfs[swfIndices[i]];
        var url = VIEWER_URL + getSWFUrl(swf);
        el = document.createElement("iframe");
        el.setAttribute("src", url);
        el.setAttribute("width", swf.width);
        el.setAttribute("height", swf.height);
        el.setAttribute("frameborder", "0");
        el.setAttribute("style", "visibility: hidden;");
        el.setAttribute("onload", "this.style.visibility = 'visible'");
        container.appendChild(el);
        container.appendChild(document.createElement("br"));
      }
    } else {
      el = document.createElement("span");
      el.textContent = "404 Not Found";
      el.classList.add("not-found");
      container.appendChild(el);
    }
    setHrefs();
  }

  function getSWFUrl(swf) {
    return ARCHIVE_URL +
      swf.hash.substr(0, 2) + "/" +
      swf.hash.substr(2, 2) + "/" +
      swf.hash.substr(4, 2) + "/" +
      swf.hash.substr(6, 2) + "/" +
      swf.hash + ".swf";
  }

  function setHrefs() {
    document.querySelector("#prev > a").setAttribute("href", "#" + swfs[getPrevIndex()].id);
    document.querySelector("#next > a").setAttribute("href", "#" + swfs[getNextIndex()].id);
  }

  function getPrevIndex() {
    if (swfIndex >= 0) {
      return (swfIndex + swfs.length - 1) % swfs.length;
    } else {
      return swfs.length - 1;
    }
  }

  function getNextIndex() {
    if (swfIndex >= 0) {
      return (swfIndex + swfs.length + 1) % swfs.length;
    } else {
      return 0;
    }
  }

  function getIndex(id) {
    for (var i = 0; i < swfs.length; i++) {
      if (swfs[i].id == id) {
        return i;
      }
    }
    return -1;
  }

  function getIndicesFromHash(hash) {
    if (typeof hash === "string" && hash[0] === "#") {
      hash = hash.substring(1);
      return hash.split(",").map(function (x) {
        return getIndex(parseInt(x));
      });
    }
    return [];
  }

})();
