var Fuzzer = (function () {
  function fuzzer (writer) {
    this.writer = writer;
    this.fnCounter = 0;
    
    writer.enter("package {");
    this.emitFunction();
    writer.leave("}");
  }
  function randomInt(n) {
    return Math.floor(Math.random() * n);
  }
  fuzzer.prototype.emitFunction = function emitFunction() {
    var writer = this.writer;
    writer.enter("function fn" + (this.fnCounter ++) + " () {");
    
    var stack = [];
    var vars = "a,b,c,d,e".split(",");
    var expr = [].concat(vars);
    
    function random(arr) {
      return arr[randomInt(arr.length)];
    }
    
    for (var i = 0; i < 3; i++) {
      expr.push(random(expr) + random("+,-,*,/,<<,>>,>>>,||,&&".split(",")) + random(expr));
    }
    
    var cond = [];
    for (var i = 0; i < 3; i++) {
      cond.push(random(expr) + random("<,<=,>,>=,==,!=".split(",")) + random(expr));
    }
    
    for (var i = 0; i < 3; i++) {
      expr.push(random(cond) + "?" + random(expr) + ":" + random(expr));
    }
    
    function emitWhile(depth, size) {
      stack.push(emitWhile);
      writer.enter("while (" + random(expr) + ") {");
      emitRandom(depth - 1, size - 1);
      writer.leave("}");
      stack.pop();
    }
    
    function emitForLoop(depth, size) {
      stack.push(emitForLoop);
      writer.enter("for (" + random(vars) + "=" + random(expr) + ";" + random(cond) + ";" + random(expr) + ") {");
      emitRandom(depth - 1, size - 1);
      writer.leave("}");
      stack.pop();
    }
    
    function emitDoWhile(depth, size) {
      stack.push(emitDoWhile);
      writer.enter("do {");
      emitRandom(depth - 1, size - 1);
      writer.leave("} while (" + random(cond) + ")");
      stack.pop();
    }
    
    function emitIf(depth, size) {
      stack.push(emitIf);
      writer.enter("if (" + random(cond) + ") {");
      emitRandom(depth - 1, size - 1);
      writer.leave("}");
      var count = 1 + randomInt(3);
      for (var i = 0; i < count; i++) {
        writer.enter("else if (" + random(cond) + ") {");
        emitRandomBlock(depth - 1, size - 1);
        writer.leave("}");  
      }
      stack.pop();
    }
    
    function emitSwitch(depth, size) {
      stack.push(emitSwitch);
      writer.enter("switch (" + random(expr) + ") {");
      var count = 1 + randomInt(2);
      for (var i = 0; i < count; i++) {
        writer.enter("case " + randomInt(32) + ":");
        emitRandom(depth - 1, size - 1);
        writer.leave(" break;");
      }
      writer.leave("}");
      stack.pop();
    }
    
    var blockEmitters = [emitWhile, emitDoWhile, emitForLoop, emitIf, emitSwitch];
    
    function emitRandomBlock(depth, size) {
      var emitter = blockEmitters[randomInt(blockEmitters.length)];
      emitter(depth, size - 1);
    }

    function inLoop() {
      for (var s in stack) {
        if ([emitWhile, emitDoWhile, emitForLoop].indexOf(s) >= 0) {
          return true;
        }
      }
      return false;
    }
    
    
    function emitRandom(depth, size) {
      if (depth === 0) {
        return;
      }
      if (randomInt(10) == 0 && inLoop()) {
        writer.writeLn("break;");
      }
      if (randomInt(10) == 0 && inLoop()) {
        writer.writeLn("continue;");
      }
      var count = randomInt(size) + 1;
      for (var i = 0; i < count; i++) {
        emitRandomBlock(depth, size);
      }

    }
    emitRandomBlock(5, 8);
    writer.leave("}");
  };
  return fuzzer;
})();
