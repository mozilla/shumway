/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

SWF.embed = function(file, container, options) {
  if (!options)
    options = { };

  var canvas = document.createElement('canvas');

  function resizeCanvas(container, canvas) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  var stage = new Stage();
  stage._attachToCanvas({
    file: file,
    canvas: canvas,
    onstart: function(root, stage) {
      if (container.clientHeight) {
        resizeCanvas(container, canvas);
        window.addEventListener('resize',
          resizeCanvas.bind(null, container, canvas), false);
      } else {
        canvas.width = stage.stageWidth;
        canvas.height = stage.stageHeight;
      }
      container.appendChild(canvas);

      AS2Mouse.$bind(canvas);
      AS2Key.$bind(canvas);

      if (options.onstart)
        options.onstart(root);
    },
    oncomplete: function(root, result) {
      if (options.oncomplete)
        options.oncomplete(root, result);
    }
  });
};
