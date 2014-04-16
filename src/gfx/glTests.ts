/// <reference path='references.ts'/>
/// <reference path="WebGL.d.ts" />

module Shumway.GFX.GL.Tests {
  export function runTests(writer: IndentingWriter) {
    writer.writeLn("Running Tests");
    runLRUListTests(writer);
    runCompact(writer);
  }

  import LRUList = Shumway.GFX.GL.LRUList;
  import ILinkedListNode = Shumway.GFX.GL.ILinkedListNode;

  class Node implements ILinkedListNode<Node> {
    previous: Node;
    next: Node;
    value: number;
    constructor(value: number) {
      this.value = value;
    }
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function runLRUListTests(writer: IndentingWriter): boolean {
    var nodes = [];
    for (var i = 0; i < 1000; i++) {
      nodes.push(new Node(i));
    }
    var list = new LRUList<Node>();
    for (var i = 0; i < 1000; i++) {
      list.put(nodes[i]);
    }
    for (var c = 0; c < 20; c++) {
      for (var i = 0; i < 1000; i++) {
        list.put(nodes[getRandomInt(nodes.length - 1)]);
      }
      var c = list.count;
      for (var i = 0; i < c; i++) {
        list.pop();
      }
    }

    return true;
  }

  function runCompact(writer: IndentingWriter): boolean {
    var x = new Shumway.Geometry.RegionAllocator.Compact(1024, 1024, 0);
    var a = [];
    var c = 100;
    for (var k = 0; k < c; k++) {
      for (var i = 0; i < c; i++) {
        var r = x.allocate(getRandomInt(10), getRandomInt(10));
        assert (r);
        a.push(r);
      }
      for (var i = 0; i < c; i++) {
        x.free(a.pop());
      }
    }
    return true;
  }
}