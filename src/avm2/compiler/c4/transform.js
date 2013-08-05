(function (exports) {
  var TRACE_REGISTER_ALLOCATOR = false;

  var T = estransform;
  var Node = T.Node;
  var Identifier = T.Identifier;
  var VariableDeclaration = T.VariableDeclaration;
  var VariableDeclarator = T.VariableDeclarator;
  var AssignmentExpression = T.AssignmentExpression;
  var MemberExpression = T.MemberExpression;
  var IfStatement = T.IfStatement;
  var WhileStatement = T.WhileStatement;

  var FunctionDeclaration = T.FunctionDeclaration;

  var writer = new IndentingWriter();

  /**
   * Classic linear scan register allocator. Almost verbatim from:
   *
   *  Poletto and Sarkar: Linear Scan Register Allocation
   * http://www.seas.gwu.edu/~hchoi/teaching/cs160d/linearscan.pdf, Top of Page 5
   */
  var LinearScan = (function () {
    function Interval(id, start, end) {
      assert (id >= 0 && start >= 0 && end >= 0);
      this.id = id;
      this.start = start;
      this.end = end;
    }
    Interval.prototype.toString = function() {
      return "[" + this.start + "," + this.end + "]";
    };
    function linearScan(intervals, maxRegisters) {
      assert (intervals);
      this.intervals = intervals.slice(0);
      this.maxRegisters = maxRegisters;

    }
    linearScan.prototype.allocate = function() {
      var intervals = this.intervals;
      // Make sure intervals are in order of increasing start point.
      this.intervals.sort(function (a, b) {
        return a.start - b.start;
      });
      var active = new SortedList(function (a, b) {
        return a.end - b.end;
      });
      // Acquire some free registers.
      var maxRegisters = this.maxRegisters;
      var freeRegisters = [];
      for (var i = maxRegisters - 1; i >= 0; i--) {
        freeRegisters.push("R" + i);
      }

      /**
       * Scan each interval in order of starting point. The algorithm maintains a list of active
       * live intervals that overlap the current point. The active list is kept sorted in order of
       * increasing end point so that whenever a new interval is processed it can expire all active
       * intervals until it reaches one that ends past the current point.
       */
      intervals.forEach(function (i) {
        expireOldIntervals(i);
        if (active.length === maxRegisters) {
          notImplemented("Cannot Spill");
          // spillAtInterval(i);
        } else {
          i.register = freeRegisters.pop();
          TRACE_REGISTER_ALLOCATOR && writer.writeLn("Allocate: " + i + " " + i.id + " -> " + i.register);
          active.push(i);
        }
      });

      /**
       * Expire all live intervals that overlap with the start position of the specified interval.
       */
      function expireOldIntervals(i) {
        active.forEach(function (j) {
          if (j.end >= i.start) {
            return SortedList.RETURN;
          }
          freeRegisters.push(j.register);
          TRACE_REGISTER_ALLOCATOR && writer.writeLn("Release: " + j + " -> " + j.register);
          return SortedList.DELETE;
        });
      }
    };
    linearScan.Interval = Interval;
    return linearScan;
  })();

  /**
   * Linear-Scan register allocator on ASTs.
   *
   * Algorithm runs in two passes:
   *
   * 1. Foward Pass:
   *    Collects all variable declarations and labels each AST node with a program position.
   *
   * 2. Backward Pass:
   *    Propagates a set of live variables through each AST node in reverse program order.
   *    It marks variables as 'live' whenever a use position is encountered and as 'killed'
   *    whenever a definition is seen.
   */
  function allocateRegisters(program) {
    assert (program instanceof FunctionDeclaration);

    // Collect local variables.
    var scan = T.makePass("scan", "scanNode");
    var label = 0;
    Node.prototype.scan = function (o) {
      this.position = label ++;
      return scan.apply(this, o);
    };
    var variables = [];
    var variableIndexMap = {};
    var identifiers = [];
    FunctionDeclaration.prototype.scan = function () {
      this.params.forEach(function (identifier) {
        if (!(identifier.name in variableIndexMap)) {
          variableIndexMap[identifier.name] = variables.length;
          variables.push(identifier.name);
        }
      });
      this.body.scan();
      return this;
    };
    VariableDeclarator.prototype.scan = function () {
      this.position = label ++;
      if (!(this.id.name in variableIndexMap)) {
        variableIndexMap[this.id.name] = variables.length;
        variables.push(this.id.name);
      }
      return this;
    };
    AssignmentExpression.prototype.scan = function (o) {
      this.left.scan(o);
      this.right.scan(o);
      this.position = label ++;
      return this;
    };
    WhileStatement.prototype.scan = function (o) {
      this.position = label ++;
      this.test.scan(o);
      this.body.scan(o);
      this.afterPosition = label ++;
      return this;
    };
    program.scan();
    TRACE_REGISTER_ALLOCATOR && writer.writeLn("Local Variables: " + variables);
    var Set = BitSetFunctor(variables.length);
    var Range = BitSetFunctor(label);

    var ranges = [];
    for (var i = 0; i < variables.length; i++) {
      ranges.push(new Range());
    }

    function fill(range) {
      var start = -1;
      for (var i = 0; i < range.length; i++) {
        if (range.get(i)) {
          start = i;
          break;
        }
      }
      for (var i = range.length - 1; i >= 0; i--) {
        if (range.get(i)) {
          end = i;
          break;
        }
      }
      for (var i = start; i < end; i++) {
        range.set(i);
      }
    }

    function getRange(range) {
      var start = -1, end = -1;
      for (var i = 0; i < range.length; i++) {
        if (range.get(i)) {
          start = i;
          break;
        }
      }
      for (var i = range.length - 1; i >= 0; i--) {
        if (range.get(i)) {
          end = i;
          break;
        }
      }
      return [start, end];
    }

    function use(set, name, position) {
      // print("USE " + name + " @" + position);
      var index = variableIndexMap[name];
      ranges[index].set(position);
      set.set(index);
    }

    function def(set, name, position) {
      // print("DEF " + name + " @" + position);
      var index = variableIndexMap[name];
      ranges[index].set(position);
      set.clear(index);
    }

    Node.prototype.markLiveness = T.makePass("markLiveness", "markLivenessNode", true);
    Identifier.prototype.markLiveness = function (o) {
      var name = this.name;
      if (name === "undefined") {
        return this;
      }
      if (o && o.isProperty) {
        return this;
      }
      if (!(name in variableIndexMap)) {
        return this;
      }
      identifiers.push(this);
      var live = o.live;
      use(live, name, this.position);
      return this;
    };
    VariableDeclarator.prototype.markLiveness = function (o) {
      var live = o.live;
      // def(live, this.id.name, this.position);
      identifiers.push(this.id);
      return this;
    };
    IfStatement.prototype.markLiveness = function (o) {
      var a = o.live.clone();
      var b = o.live.clone();
      this.alternate && this.alternate.markLiveness({live: a});
      this.consequent && this.consequent.markLiveness({live: b});
      o.live.assign(a);
      o.live._union(b);
      this.test.markLiveness(o);
      return this;
    };
    WhileStatement.prototype.markLiveness = function (o) {
      var a = o.live.clone();
      TRACE_REGISTER_ALLOCATOR && writer.writeLn("END OF LOOP: " + a);
      var afterPosition = this.afterPosition;
      do {
        var b = a.clone();
        this.body.markLiveness({live: a});
        this.test.markLiveness({live: a});
        TRACE_REGISTER_ALLOCATOR && writer.writeLn("TOP OF LOOP: " + a);
        var iterate = !b.equals(a);
        if (iterate) {
          TRACE_REGISTER_ALLOCATOR && writer.writeLn("ITERATE");
          a.forEach(function (i) {
            ranges[i].set(afterPosition);
          });
        }
      } while (iterate);
      o.live.assign(a);
      return this;
    };

    AssignmentExpression.prototype.markLiveness = function (o) {
      this.right.markLiveness(o);
      if (this.left instanceof Identifier) {
        def(o.live, this.left.name, this.position);
        identifiers.push(this.left);
      } else {
        this.left.markLiveness(o);
      }
      return this;
    };
    MemberExpression.prototype.markLiveness = function (o) {
      if (this.computed || !(this.property instanceof Identifier)) {
        this.property.markLiveness(o);
      }
      this.object.markLiveness(o);
      return this;
    };
    program.markLiveness({live: new Set()});

    var intervals = [];
    for (var i = 0; i < ranges.length; i++) {
      var r = getRange(ranges[i]);
      intervals.push(new LinearScan.Interval(i, r[0], r[1]));
    }

    var allocator = new LinearScan(intervals, 1024);
    allocator.allocate();

    var map = createEmptyObject();
    for (var i = 0; i < variables.length; i++) {
      map[variables[i]] = intervals[i].register;
    }

    if (true) {
      for (var i = 0; i < identifiers.length; i++) {
        if (identifiers[i].patched) {
          continue;
        }
        assert (map[identifiers[i].name]);
        identifiers[i].name = map[identifiers[i].name];
        identifiers[i].patched = true;
      }
    }

    if (TRACE_REGISTER_ALLOCATOR) {
      for (var i = 0; i < ranges.length; i++) {
        fill(ranges[i]);
        writer.writeLn(String(i).padLeft(' ', 3) + " " + variables[i].padRight(' ', 5) + ": " + ranges[i].toBitString("=", " ") + " " + intervals[i].register);
      }
    }

    return program;
  }

  Transform.transform = function (program) {
    allocateRegisters(program)
  };
})(typeof exports === "undefined" ? (Transform = {}) : exports);