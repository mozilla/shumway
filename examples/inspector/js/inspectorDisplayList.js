var displayListCanvas = document.getElementById("displayList");

document.getElementById("viewDisplayList").addEventListener("click", function () {
  resizeDisplayList();
  var displayListTreeView = new Shumway.GFX.TreeStageRenderer(displayListCanvas, _easel.stage);
  _easel.addEventListener("render", function () {
    displayListTreeView.render();
  });
});

function resizeDisplayList() {
  var parent = displayListCanvas.parentElement;
  var cw = parent.clientWidth;
  var ch = parent.clientHeight - 1;

  var devicePixelRatio = window.devicePixelRatio || 1;
  var backingStoreRatio = 1;
  if (devicePixelRatio !== backingStoreRatio) {
    var ratio = devicePixelRatio / backingStoreRatio;
    displayListCanvas.width = cw * ratio;
    displayListCanvas.height = ch * ratio;
    displayListCanvas.style.width = cw + 'px';
    displayListCanvas.style.height = ch + 'px';
  } else {
    displayListCanvas.width = cw;
    displayListCanvas.height = ch;
  }
}

window.addEventListener('resize', resizeDisplayList, false);