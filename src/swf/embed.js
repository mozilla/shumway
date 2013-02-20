SWF.embed = function(file, container, options) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('kanvas-2d');
  var loader = new flash.display.Loader;
  var loaderInfo = loader.contentLoaderInfo;
  var stage = new flash.display.Stage;

  stage._loader = loader;
  loaderInfo._parameters = options.movieParams;

  // HACK support of HiDPI displays
  var pixelRatio = 'devicePixelRatio' in window ? window.devicePixelRatio : 1;
  var canvasHolder = null;
  if (pixelRatio > 1) {
    var cssScale = 'scale(' + (1/pixelRatio) + ', ' + (1/pixelRatio) + ')';
    canvas.setAttribute('style', '-moz-transform: ' + cssScale + ';' +
                                 '-webkit-transform: ' + cssScale + ';' +
                                 'transform: ' + cssScale + ';' +
                                 '-moz-transform-origin: 0% 0%;' +
                                 '-webkit-transform-origin: 0% 0%;' +
                                 'transform-origin: 0% 0%;');
    canvasHolder = document.createElement('div');
    canvasHolder.setAttribute('style', 'display: inline-block; overflow: hidden;');
    canvasHolder.appendChild(canvas);
  }

  loader._stage = stage;
  stage._loader = loader;

  function fitCanvas(container, canvas) {
    if (canvasHolder) {
      canvasHolder.style.width = container.clientWidth + 'px';
      canvasHolder.style.height = container.clientHeight + 'px';
    }
    canvas.width = container.clientWidth * pixelRatio;
    canvas.height = container.clientHeight * pixelRatio;
  }

  loaderInfo.addEventListener('init', function () {
    if (container.clientHeight) {
      fitCanvas(container, canvas);
      window.addEventListener('resize', function () {
        fitCanvas.bind(container, canvas);
      });
    } else {
      if (canvasHolder) {
        canvasHolder.style.width = stage._stageWidth + 'px';
        canvasHolder.style.height = stage._stageHeight + 'px';
      }
      canvas.width = stage._stageWidth * pixelRatio;
      canvas.height = stage._stageHeight * pixelRatio;
    }

    container.setAttribute("style", "position: relative");

    canvas.addEventListener('click', function () {
      ShumwayKeyboardListener.focus = stage;

      if (stage._clickTarget)
        stage._clickTarget.dispatchEvent(new flash.events.MouseEvent('click'));
    });
    canvas.addEventListener('dblclick', function () {
      if (stage._clickTarget && stage._clickTarget._doubleClickEnabled)
        stage._clickTarget.dispatchEvent(new flash.events.MouseEvent('doubleClick'));
    });
    canvas.addEventListener('mousedown', function () {
      if (stage._clickTarget)
        stage._clickTarget.dispatchEvent(new flash.events.MouseEvent('mouseDown'));
    });
    canvas.addEventListener('mousemove', function (domEvt) {
      var node = this;
      var left = 0;
      var top = 0;
      if (node.offsetParent) {
        do {
          left += node.offsetLeft;
          top += node.offsetTop;
        } while (node = node.offsetParent);
      }

      stage._mouseX = domEvt.pageX - left;
      stage._mouseY = domEvt.pageY - top;
    });
    canvas.addEventListener('mouseup', function () {
      if (stage._clickTarget)
        stage._clickTarget.dispatchEvent(new flash.events.MouseEvent('mouseUp'));
    });
    canvas.addEventListener('mouseover', function () {
      stage._mouseOver = true;
    });
    canvas.addEventListener('mouseout', function () {
      stage._mouseOver = false;
      stage._mouseJustLeft = true;
    });

    var bgcolor = loaderInfo._backgroundColor;
    stage._color = bgcolor;
    canvas.style.background = toStringRgba(bgcolor);

    var root = loader._content;
    stage._children[0] = root;
    stage._control.appendChild(root._control);

    var cursorVisible = true;
    function syncCursor() {
      var newCursor;
      if (cursorVisible) {
        if (stage._clickTarget && stage._clickTarget.shouldHaveHandCursor)
          newCursor = 'pointer';
        else
          newCursor = 'auto';
      } else {
        newCursor = 'none';
      }

      container.style.cursor = newCursor;
    }

    stage._setCursorVisible = function(val) {
      cursorVisible = val;
      syncCursor();
    };
    stage._syncCursor = syncCursor;
    syncCursor();

    container.appendChild(canvasHolder || canvas);
    renderStage(stage, ctx, options.onBeforeFrame, options.onFrame);
  });

  if (options.onComplete) {
    loaderInfo.addEventListener("complete", function () {
      options.onComplete();
    });
  }

  loader._loadFrom(file);
};
