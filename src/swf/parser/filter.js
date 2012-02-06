/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function frameFilter(graph, state) {
  state.frameNum = graph.frameNum = 'frameNum' in state ? state.frameNum + 1 : 0;
  var displayList = state.displayList || null;
  defineProperty(graph, 'displayList', {
    value: displayList,
    enumerable: false
  });
  state.displayList = create(displayList);
}
function placeFilter(graph, state) {
  var displayList = state.displayList
  if (!displayList)
    state.displayList = displayList = { maxDepth: 0 };
  var depth = graph.depth;
  if (graph.place) {
   var character = displayList[depth] = { };
   character.factory = state.dictionary[graph.objectId];
   character.render = function(ctx) {
     var m = graph.matrix;
     var matrix = m ? {
       scaleX: m.scaleX / 20,
       scaleY: m.scaleY / 20,
       skew0: m.skew0 / 20,
       skew1: m.skew1 / 20,
       translateX: m.translateX / 20,
       translateY: m.translateY / 20,
     } : {
       scaleX: 0.05,
       scaleY: 0.05,
       skew0: 0,
       skew1: 0,
       translateX: 0,
       translateY: 0
     };
     if (this.factory)
       this.factory.render(ctx, matrix, this.ratio || 0);
   }
  } else {
    var character = create(displayList[depth]);
  }
  if (graph.hasMatrix)
    character.matrix = graph.matrix;
  if (graph.hasRatio)
    character.ratio = graph.ratio / 0xffff;
  if (depth > displayList.maxDepth)
    displayList.maxDepth = depth;
}
function removeFilter(graph, state) {
  var displayList = state.displayList;
  if (displayList && [graph.depth])
    displayList[graph.depth] = undefined;
}
function shapeFilter(graph, state) {
  var dictionary = state.dictionary;
  dictionary[graph.id] = new ShapeFactory(graph);
}
