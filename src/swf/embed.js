SWF.embed = function(file, container, options) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('kanvas-2d');

  function fitCanvas(container, canvas) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  var loaderHelper = new LoaderHelper();
  var loaderPromise = loaderHelper.loadFrom(file);
  loaderPromise.then(function (loader) {
    var stage = loader._stage;
    var loaderInfo = loader.contentLoaderInfo;
    stage._frameRate = loaderInfo.frameRate;
    stage._loaderInfo = loaderInfo;
    stage._stageHeight = loaderInfo.height;
    stage._stageWidth = loaderInfo.width;

    if (container.clientHeight) {
      fitCanvas(container, canvas);
      window.addEventListener('resize', function () {
        fitCanvas.bind(container, canvas);
      });
    } else {
      canvas.width = stage.stageWidth;
      canvas.height = stage.stageHeight;
    }

    canvas.addEventListener('click', function () {
      Keyboard.focus = stage;
    });
    canvas.addEventListener('mousemove', function (domEvt) {
      stage._mouseX = domEvt.pageX - this.offsetLeft;
      stage._mouseY = domEvt.pageY - this.offsetTop;
    });

    var bgcolor = loaderInfo.backgroundColor;
    stage._color = bgcolor;
    canvas.style.background = toStringRgba(bgcolor);

    // Dirty hack for now.
    //stage.addChild(loader.content);
    stage._children[0] = loader.content;
    renderStage(stage, ctx);

    container.appendChild(canvas);

    if (options.onComplete) {
      loaderInfo.addEventListener(Event.COMPLETE, function () {
        options.onComplete();
      });
    }
  });
};
