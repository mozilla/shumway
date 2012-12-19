function loadMovie(path, reportFrames) {
  var movieReady = new Promise;
  movieReady.then(function() { sendResponse(); });

  var onFrameCallback = null;
  if (reportFrames) {
    var i = 0, frame = 0;
    onFrameCallback = function () {
      while (i < reportFrames.length && frame >= reportFrames[i]) {
        movieReady.then(sendResponse.bind(null, {
          index: i,
          frame: frame,
          snapshot: getCanvasData()
        }));
        i++;
      }
      frame++;
    };
  }

  createAVM2(builtinPath, playerGlobalPath, EXECUTION_MODE.INTERPRET, EXECUTION_MODE.COMPILE, function (avm2) {
    function loaded() { movieReady.resolve(); }

    FileLoadingService.baseUrl = path;
    new BinaryFileReader(path).readAll(null, function(buffer) {
      if (!buffer) {
        throw "Unable to open the file " + SWF_PATH + ": " + error;
      }
      SWF.embed(buffer, document.getElementById("stage"), { onComplete: loaded, onFrame: onFrameCallback });
    });
  });
}

var FileLoadingService = {
  createSession: function () {
    return {
      open: function (request) {
        var self = this;
        var base = FileLoadingService.baseUrl || '';
        base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
        var path = base ? base + request.url : request.url;
        console.log('FileLoadingService: loading ' + path);
        new BinaryFileReader(path).readAsync(
          function (data, progress) {
            self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
          },
          function (e) { self.onerror(e); },
          self.onopen,
          self.onclose);
      }
    };
  }
};

var traceMessages = '';
natives.print = function() {
   return function(s) {
     traceMessages += s + '\n';
   };
};

function sendResponse(data) {
  window.parent.postMessage({
    type: 'test-response',
    result: data
  }, '*');
}

function getCanvasData() {
  var canvas = document.getElementsByTagName('canvas')[0];
  return canvas.toDataURL('image/png');
}

var mouseOutside = true;

function sendMouseEvent(type, x, y) {
  var isMouseMove = type == 'mousemove';
  var canvas = document.getElementsByTagName('canvas')[0];
  var e = document.createEvent('MouseEvents');
  e.initMouseEvent(type, true, !isMouseMove,
                   document.defaultView, isMouseMove ? 0 : 1,
                   x, y, x, y,
                   false, false, false, false, 0, canvas);
  canvas.dispatchEvent(e);
}

window.addEventListener('message', function (e) {
  var data = e.data;
  if (typeof data !== 'object' || data.type !== 'test-message')
    return;
  switch (data.topic) {
  case 'load':
    loadMovie(data.path, data.reportFrames);
    break;
  case 'advance':
    var delay = data.args[0];
    setTimeout(function () {
      sendResponse();
    }, delay);
    break;
  case 'mouse-move':
    if (mouseOutside) {
      sendMouseEvent('mouseover', data.args[0], data.args[1]);
      mouseOutside = false;
    }
    sendMouseEvent('mousemove', data.args[0], data.args[1]);
    break;
  case 'mouse-press':
    sendMouseEvent('mousedown', data.args[0], data.args[1]);
    sendMouseEvent('click', data.args[0], data.args[1]);
    break;
  case 'mouse-release':
    sendMouseEvent('mouseup', data.args[0], data.args[1]);
    break;
  case 'get-trace':
    sendResponse(traceMessages);
    break;
  case 'get-image':
    sendResponse(getCanvasData());
    break;
  }
});