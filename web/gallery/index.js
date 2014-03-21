(function() {

  var swfs = [];
  var swfIndex = 0;

  getJSON("http://swf.codeazur.com.br/api/gallery.php", function(galleryJSON) {
    if (galleryJSON && galleryJSON.swfs) {
      swfs = galleryJSON.swfs;
      swfCount = swfs.length;
      setup();
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

  function setup() {
    var elPrev = document.getElementById("prev");
    var elNext = document.getElementById("next");
    elPrev.classList.add("active");
    elNext.classList.add("active");
    elPrev.addEventListener("click", function(e) { prev(); e.preventDefault(); });
    elNext.addEventListener("click", function(e) { next(); e.preventDefault(); });
  }

  function prev() {
    if (swfIndex > 0) {
      swfIndex--;
    } else {
      swfIndex = swfs.length - 1;
    }
    show();
  }

  function next() {
    if (swfIndex < swfs.length - 1) {
      swfIndex++;
    } else {
      swfIndex = 0;
    }
    show();
  }

  function show() {
    var swf = swfs[swfIndex];
    var container = document.getElementById("content");
    var iframe = document.createElement("iframe");
    iframe.setAttribute("src", "http://www.areweflashyet.com/shumway/iframe/viewer.html?swf=" + getSWFUrl(swf));
    iframe.setAttribute("width", swf.width);
    iframe.setAttribute("height", swf.height);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("style", "visibility: hidden");
    iframe.setAttribute("onload", "this.style.visibility = 'visible'");
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(iframe);
  }

  function getSWFUrl(swf) {
    return "http://swf.codeazur.com.br/archive/" +
           swf.hash.substr(0, 2) + "/" +
           swf.hash.substr(2, 2) + "/" +
           swf.hash.substr(4, 2) + "/" +
           swf.hash.substr(6, 2) + "/" +
           swf.hash + ".swf";
  }

})();
