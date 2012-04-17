function writeGraphViz(writer, name, root, idFn, orderFn,
                       succFns, predFns, nameFn, postHook) {
  var active = {};
  var visited = {};
  var order = [];
  var loopIds = {};

  function escape(v) {
    return v;
  }

  function blockColor(block) {
    if (!(block.bid in loopIds)) {
      return "black";
    }

    var colors = ["red", "blue", "green", "purple", "orange", "pink"];
    return colors[loopIds[block.bid] % colors.length];
  }

  name = "\"" + escape(name) + "\" ";

  function next(node) {
    if (visited[idFn(node)]) {
      return;
    } else {
      visited[idFn(node)] = true;
      order.push(node);
      orderFn(node).forEach(function (succ) {
        next(succ);
      });
    }
  }

  next(root);
  writer.enter("digraph " + name + "{");
  writer.writeLn("node [shape=box, fontname=Consolas, fontsize=11];");

  order.forEach(function (node) {
    if (node.loop) {
      var loopNodes = node.loop.body.toArray();
      for (var i = 0, j = loopNodes.length; i < j; i++) {
        loopIds[loopNodes[i]] = node.loop.id;
      }
    }
  });

  order.forEach(function (node) {
    writer.writeLn("block_" + idFn(node) + " [label=\"" + nameFn(node) +
                   "\",color=\"" + blockColor(node) + "\"];");
  });

  var edges = [];
  order.forEach(function (node) {
    succFns.forEach(function (succFn) {
      succFn.fn(node).forEach(function (succ) {
        writer.writeLn("block_" + idFn(node) + " -> " + "block_" + idFn(succ) +
                       " [" + (succFn.style ? succFn.style + "," : "") +
                       "color=\"" + (blockColor(node) === blockColor(succ) ?
                                     blockColor(node) : "black") + "\"];");
      });
    });
  });

  if (postHook) {
    postHook(writer);
  }

  writer.leave("}");
}
