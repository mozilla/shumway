/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
