document.getElementById("viewDisplayList").addEventListener("click", function () {
  if (!gfxWindow) {
    return;
  }
  var currentEasel = gfxWindow.easel;
  var displayList = document.getElementById("displayList");
  if (displayList.children.length === 0) {
    var displayListTreeView = new gfxWindow.Shumway.GFX.TreeRenderer(displayList, currentEasel.stage);
    currentEasel.addEventListener("render", function () {
      displayListTreeView.render();
    });
  }
});
