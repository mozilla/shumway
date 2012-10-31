SWF.embed = function(file, container, options) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('kanvas-2d');
  var loader = new flash.display.Loader;
  var loaderInfo = loader.contentLoaderInfo;
  var stage = new flash.display.Stage;

  loader._stage = stage;
  stage._loader = loader;

  function fitCanvas(container, canvas) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  loaderInfo.addEventListener('init', function () {
    stage._frameRate = loaderInfo._frameRate;
    stage._loaderInfo = loaderInfo;
    stage._stageHeight = loaderInfo._height;
    stage._stageWidth = loaderInfo._width;

    if (container.clientHeight) {
      fitCanvas(container, canvas);
      window.addEventListener('resize', function () {
        fitCanvas.bind(container, canvas);
      });
    } else {
      canvas.width = stage._stageWidth;
      canvas.height = stage._stageHeight;
    }

    container.setAttribute("style", "position: relative");

    canvas.addEventListener('click', function () {
      ShumwayKeyboardListener.focus = stage;
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

    var bgcolor = loaderInfo._backgroundColor;
    stage._color = bgcolor;
    canvas.style.background = toStringRgba(bgcolor);

    var root = loader._content;
    stage._children[0] = root;
    stage._control.appendChild(root._control);

    container.appendChild(canvas);
    renderStage(stage, ctx);
  });

  if (options.onComplete) {
    loaderInfo.addEventListener("complete", function () {
      options.onComplete();
    });
  }

  loader._loadFrom(file);
};
