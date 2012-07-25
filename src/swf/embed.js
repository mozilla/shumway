SWF.embed = function(data, container, options) {
  if (!options)
    options = { };

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('kanvas-2d');
  var loader = new Loader;

  // TODO choose between AVM1/2 based on FileAttribute settings
  loader.avm1 = options.avm1;
  loader.avm2 = options.avm2;

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

    loaderInfo._as2Context.stage = stage; // TODO make it better

    if (container.clientHeight) {
      fitCanvas(container, canvas);
      window.addEventListener('resize', fitCanvas.bind(null, container, canvas), false);
    } else {
      canvas.width = stage.stageWidth;
      canvas.height = stage.stageHeight;
    }
    container.appendChild(canvas);

    AS2Key.$bind(canvas);
    AS2Mouse.$bind(canvas);

    stage.addChild(loader.content);
    renderStage(stage, ctx);
  });

  loader.loadData(data);
};
