/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

SWF = {
  embed: function(url, stage) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      SWF.parse(xhr.response, function(result) {
        var header = result.header;
        var bounds = header.bounds;

        var canvas = document.createElement('canvas');
        canvas.width = (bounds.xMax - bounds.xMin) / 20;
        canvas.height = (bounds.yMax - bounds.yMin) / 20;

        stage.appendChild(canvas);
      });
    };
    xhr.send();
  }
};
