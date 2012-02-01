function writeGraphViz(writer, root, idFn, succFn, predFn, nameFn) {
  var active = {};
  var visited = {};
  var order = [];
  
  function next(node) {
    if (visited[idFn(node)]) {
      return;
    } else {
      visited[idFn(node)] = true;
      order.push(node);
      succFn(node).forEach(function (succ) {
        next(succ);
      });
    }
  }
  
  next(root);
  writer.enter("digraph G {");
  writer.writeLn("node [shape=box, fontname=Consolas, fontsize=11];");
  
  order.forEach(function (node) {
    var color = node.loop || node.inLoop ? ", color=red" : "";
    writer.writeLn("block_" + idFn(node) + " [label=\"" + nameFn(node) + "\"" + color + "];");
  });
  
  order.forEach(function (node) {
    succFn(node).forEach(function (succ) {
      writer.writeLn("block_" + idFn(node) + " -> " + "block_" + idFn(succ) + ";");
    });
  });
  
  writer.leave("}");
}