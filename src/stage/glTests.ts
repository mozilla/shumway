/// <reference path='all.ts'/>
/// <reference path="WebGL.d.ts" />

module Shumway.GL.Tests {
  export function runTests(writer: IndentingWriter) {
    writer.writeLn("Running Tests");
    runLRUListTests(writer);
  }

  import LRUList = Shumway.GL.LRUList;
  import ILinkedListNode = Shumway.GL.ILinkedListNode;

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
    for (var i = 0; i < 100; i++) {
      nodes.push(new Node(i));
    }
    var list = new LRUList<Node>();
    for (var i = 0; i < 100; i++) {
      list.put(nodes[i]);
    }
    for (var c = 0; c < 20; c++) {
      // while (list.pop());
      for (var i = 0; i < 100; i++) {
        list.use(nodes[getRandomInt(nodes.length - 1)]);
      }
      var node = list.head;
      do {
        writer.writeLn("V: " + node.value);
        node = node.next;
      } while (node);
    }

    return true;
  }
}