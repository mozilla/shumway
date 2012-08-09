SWF.embed = function(file, container) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('kanvas-2d');
  var loader = new Loader;

  var loaderInfo = loader.contentLoaderInfo;
  var stage = new Stage;

  function fitCanvas(container, canvas) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  loaderInfo.addEventListener(Event.INIT, function () {
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

    AS2Key.$bind(canvas);
    AS2Mouse.$bind(canvas);

    var bgcolor = loaderInfo.backgroundColor;
    stage._color = bgcolor;
    canvas.style.background = toStringRgba(bgcolor);

    stage.addChild(loader.content);
    renderStage(stage, ctx);

    container.appendChild(canvas);
  });

  var sysMode = EXECUTION_MODE.INTERPRET;
  var appMode = EXECUTION_MODE.COMPILE;
  createAVM2(Loader.BUILTIN_PATH, Loader.PLAYER_GLOBAL_PATH, sysMode, appMode, function (vm) {
    loader._avm2 = vm;
    loader.loadFrom(file);
  });
};
