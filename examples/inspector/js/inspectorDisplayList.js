document.getElementById("viewDisplayList").addEventListener("click", function () {
  var displayList = document.getElementById("displayList");
  if (displayList.children.length === 0) {
    var displayListTreeView = new Shumway.GFX.TreeRenderer(displayList, currentEasel.stage);
    currentEasel.addEventListener("render", function () {
      displayListTreeView.render();
    });
  }
});