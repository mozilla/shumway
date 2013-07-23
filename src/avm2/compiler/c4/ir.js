/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (exports) {

  var debug = false;

  /**
   * SSA-based Sea-of-Nodes IR based on Cliff Click's Work: A simple graph-based intermediate
   * representation (http://doi.acm.org/10.1145/202530.202534)
   *
   * Node Hierarchy:
   *
   * Node
   *  - Control
   *    - Region
   *      - Start
   *    - End
   *      - Stop
   *      - If
   *      - Jump
   *  - Value
   *    - Constant, Parameter, Phi, Binary, GetProperty ...
   *
   * Control flow is modeled with control edges rather than with CFGs. Each basic block is represented
   * as a region node which has control dependencies on predecessor regions. Nodes that are dependent
   * on the execution of a region, have a |control| property assigned to the region they belong to.
   *
   * Memory (and the external world) is modeled as an SSA value called the Store. Nodes that mutate the
   * Store produce a new Store.
   *
   * Nodes that produce multiple values, such as Ifs which produce two values (a True and False control
   * value) can have their values projected (extracted) using Projection nodes.
   *
   * A node scheduler is responsible for serializing nodes back into a CFG such that all dependencies
   * are satisfied.
   *
   * Compiler Pipeline:
   *
   * Graph Builder -> IR (DFG) -> Optimizations -> CFG -> Restructuring -> Backend
   *
   */

  var Operator = (function () {
    var map = {};

    function operator(name, evaluate, binary) {
      this.name = name;
      this.binary = binary;
      this.evaluate = evaluate;
      map[name] = this;
    }

    operator.ADD = new operator("+", function (l, r) { return l + r; }, true);
    operator.SUB = new operator("-", function (l, r) { return l - r; }, true);
    operator.MUL = new operator("*", function (l, r) { return l * r; }, true);
    operator.DIV = new operator("/", function (l, r) { return l / r; }, true);
    operator.MOD = new operator("%", function (l, r) { return l % r; }, true);
    operator.AND = new operator("&", function (l, r) { return l & r; }, true);
    operator.OR = new operator("|", function (l, r) { return l | r; }, true);
    operator.XOR = new operator("^", function (l, r) { return l ^ r; }, true);
    operator.LSH = new operator("<<", function (l, r) { return l << r; }, true);
    operator.RSH = new operator(">>", function (l, r) { return l >> r; }, true);
    operator.URSH = new operator(">>>", function (l, r) { return l >>> r; }, true);
    operator.SEQ = new operator("===", function (l, r) { return l === r; }, true);
    operator.SNE = new operator("!==", function (l, r) { return l !== r; }, true);
    operator.EQ = new operator("==", function (l, r) { return l == r; }, true);
    operator.NE = new operator("!=", function (l, r) { return l != r; }, true);
    operator.LE = new operator("<=", function (l, r) { return l <= r; }, true);
    operator.GT = new operator(">", function (l, r) { return l > r; }, true);
    operator.LT = new operator("<", function (l, r) { return l < r; }, true);
    operator.GE = new operator(">=", function (l, r) { return l >= r; }, true);
    operator.BITWISE_NOT = new operator("~", function (a) { return ~a; }, false);
    operator.PLUS = new operator("+", function (a) { return +a; }, false);
    operator.NEG = new operator("-", function (a) { return -a; }, false);
    operator.TRUE = new operator("!!", function (a) { return !!a; }, false);
    operator.FALSE = new operator("!", function (a) { return !a; }, false);

    operator.AVM2ADD = new operator("+", function (l, r) {
      if (typeof l === "string" || typeof r === "string") {
        return String(l) + String(r);
      }
      return l + r;
    }, true);

    function linkOpposites(a, b) {
      a.not = b;
      b.not = a;
    }

    /**
     * Note that arithmetic comparisons aren't partial orders and cannot be
     * negated to each other.
     */

    linkOpposites(operator.SEQ, operator.SNE);
    linkOpposites(operator.EQ, operator.NE);
    linkOpposites(operator.TRUE, operator.FALSE);

    operator.fromName = function fromName(name) {
      return map[name];
    };

    operator.prototype.isBinary = function isBinary() {
      return this.binary;
    };

    operator.prototype.toString = function toString() {
      return this.name;
    };
    return operator;
  })();


  function extend(c, name) {
    assert (c);
    return Object.create(c.prototype, {nodeName: { value: name }});
  }

  function nameOf(o) {
    var useColors = false;
    var result;
    if (o instanceof Constant) {
      if (o.value instanceof Multiname) {
        return o.value.name;
      }
      return o.value;
    } else if (o instanceof Variable) {
      return o.name;
    } else if (o instanceof Phi) {
      return result = "|" + o.id + "|", useColors ? PURPLE + result + ENDC : result;
    } else if (o instanceof Control) {
      return result = "{" + o.id + "}", useColors ? RED + result + ENDC : result;
    } else if (o instanceof Projection) {
      if (o.type === Projection.Type.STORE) {
        return result = "[" + o.id + "->" + o.argument.id + "]", useColors ? YELLOW + result + ENDC : result;
      }
      return result = "(" + o.id + ")", useColors ? GREEN + result + ENDC : result;
    } else if (o instanceof Value) {
      return result = "(" + o.id + ")", useColors ? GREEN + result + ENDC : result;
    } else if (o instanceof Node) {
      return o.id;
    }
    unexpected(o + " " + typeof o);
  }

  function toID(node) {
    return node.id;
  }

  var Node = (function () {
    var nextID = [];
    function node() {
      this.id = nextID[nextID.length - 1] += 1;
    }
    node.startNumbering = function () {
      nextID.push(0);
    };
    node.stopNumbering = function () {
      nextID.pop();
    };
    node.prototype.nodeName = "Node";
    node.prototype.toString = function (brief) {
      if (brief) {
        return nameOf(this);
      }
      var inputs = [];
      this.visitInputs(function (input) {
        inputs.push(nameOf(input));
      }, true);
      var str = nameOf(this) + " = " + this.nodeName.toUpperCase();
      if (this.toStringDetails) {
        str += " " + this.toStringDetails();
      }
      if (inputs.length) {
        str += " " + inputs.join(", ");
      }
      return str;
    };

    node.prototype.visitInputs = function (fn, visitConstants) {
      if (isConstant(this)) {
        // Don't visit properties of constants.
        return;
      }
      for (var k in this) {
        var v = this[k];
        if (v instanceof Constant && !visitConstants) {
          continue;
        }
        if (v instanceof Node) {
          fn(v);
        }
        if (v instanceof Array) {
          v.forEach(function (x) {
            if (x instanceof Constant && !visitConstants) {
              return;
            }
            fn(x);
          });
        }
      }
    };

    node.prototype.replaceInput = function(oldInput, newInput) {
      var count = 0;
      for (var k in this) {
        var v = this[k];
        if (v instanceof Node) {
          if (v === oldInput) {
            this[k] = newInput;
            count ++;
          }
        }
        if (v instanceof Array) {
          count += v.replace(oldInput, newInput);
        }
      }
      return count;
    };

    node.prototype.push = function (value) {
      if (this.length === undefined) {
        this.length = 0;
      }
      this[this.length ++] = value;
    };
    return node;
  })();

  var Control = (function () {
    function control() {
      Node.apply(this);
    }
    control.prototype = extend(Node);
    return control;
  })();

  var Value = (function () {
    function value() {
      Node.apply(this);
    }
    value.prototype = extend(Node);
    value.prototype.mustFloat = false;
    return value;
  })();

  var Region = (function () {
    function region(predecessor) {
      Control.call(this);
      this.predecessors = predecessor ? [predecessor] : [];
      this.phis = [];
    }
    region.prototype = extend(Control, "Region");

    region.prototype.verify = function () {
      var predecessors = this.predecessors;
      predecessors.forEach(function (x) {
        assert (x);
        // assert (x instanceof Control, x);
      });
      if (predecessors.length > 1) {
        this.phis.forEach(function (x) {
          assert (x instanceof Phi);
          assert (x.arguments.length === predecessors.length);
        });
      }
    };
    return region;
  })();

  var Start = (function () {
    function start() {
      Region.call(this);
      this.control = this;
    }
    start.prototype = extend(Region, "Start");
    return start;
  })();

  var Phi = (function () {
    function phi(control, value) {
      Node.call(this);
      assert (control instanceof Region);
      this.control = control;
      this.arguments = value ? [value] : [];
      this.sealed = false;
    }
    phi.prototype = extend(Value, "Phi");
    phi.prototype.seal = function seal() {
      this.sealed = true;
    };
    phi.prototype.pushValue = function pushValue(x) {
      assert (isValue(x));
      assert (!this.sealed);
      this.arguments.push(x);
    };
    return phi;
  })();

  var Variable = (function () {
    function variable(name) {
      assert (isString(name));
      this.name = name;
    }
    variable.prototype = extend(Value, "Variable");
    return variable;
  })();

  var Copy = (function () {
    function copy(argument) {
      Node.call(this);
      assert (argument);
      this.argument = argument;
    }
    copy.prototype = extend(Value, "Copy");
    return copy;
  })();

  var Move = (function () {
    function move(to, from) {
      assert (to instanceof Variable);
      assert (from instanceof Variable || from instanceof Constant, from);
      assert (to !== from);
      this.to = to;
      this.from = from;
    }
    move.prototype = extend(Value, "Move");
    move.prototype.toString = function () {
      return this.to.name + " <= " + this.from;
    };
    return move;
  })();

  var End = (function () {
    function end(control) {
      Control.call(this, control);
    }
    end.prototype = extend(Control, "End");
    return end;
  })();

  var If = (function () {
    function ifNode(control, predicate) {
      Control.call(this);
      assert (predicate);
      this.control = control;
      this.predicate = predicate;
    }
    ifNode.prototype = extend(End, "If");
    return ifNode;
  })();

  var Switch = (function () {
    function switchNode(control, determinant) {
      Control.call(this);
      this.control = control;
      this.determinant = determinant;
    }
    switchNode.prototype = extend(End, "Switch");
    return switchNode;
  })();

  var Jump = (function () {
    function jump(control) {
      Control.call(this);
      this.control = control;
    }
    jump.prototype = extend(End, "Jump");
    return jump;
  })();

  var Stop = (function () {
    function stop(control, store, argument) {
      Control.call(this);
      assert (isControlOrNull(control));
      assert (isStore(store));
      assert (argument);
      this.control = control;
      this.store = store;
      this.argument = argument;
    }
    stop.prototype = extend(End, "Stop");
    return stop;
  })();

  var Projection = (function () {
    function projection(argument, type, selector) {
      Value.call(this);
      assert (type);
      assert (!(argument instanceof Projection));
      this.argument = argument;
      this.type = type;
      if (selector) {
        this.selector = selector;
      }
    }
    projection.Type = {
      CASE: "case",
      TRUE: "true",
      FALSE: "false",
      STORE: "store",
      SCOPE: "scope"
    };
    projection.prototype = extend(Value, "Projection");
    projection.prototype.project = function () {
      return this.argument;
    };
    projection.prototype.toStringDetails = function () {
      return String(this.type).toUpperCase();
    };
    return projection;
  })();

  function isProjection(node, type) {
    return node instanceof Projection && (!type || node.type === type);
  }

  var Latch = (function () {
    function latch(control, condition, left, right) {
      Node.call(this);
      assert (isControlOrNull(control));
      this.control = control;
      this.condition = condition;
      this.left = left;
      this.right = right;
    }
    latch.prototype = extend(Value, "Latch");
    return latch;
  })();

  var Binary = (function () {
    function binary(operator, left, right) {
      Node.call(this);
      this.operator = operator;
      this.left = left;
      this.right = right;
    }
    binary.prototype = extend(Value, "Binary");
    binary.prototype.toStringDetails = function () {
      return String(this.operator.name).toUpperCase();
    };
    return binary;
  })();

  var Unary = (function () {
    function unary(operator, argument) {
      Node.call(this);
      assert (operator instanceof Operator);
      assert (argument);
      this.operator = operator;
      this.argument = argument;
    }
    unary.prototype = extend(Value, "Unary");
    unary.prototype.toStringDetails = function () {
      return String(this.operator.name).toUpperCase();
    };
    return unary;
  })();

  var Constant = (function () {
    function constant(value) {
      Node.call(this);
      this.value = value;
    }
    constant.prototype = extend(Value, "Constant");
    return constant;
  })();


  function isNotPhi(phi) {
    return !isPhi(phi);
  }

  function isPhi(phi) {
    return phi instanceof Phi;
  }

  function isScope(scope) {
    return isPhi(scope) || scope instanceof AVM2Scope || isProjection(scope, Projection.Type.SCOPE);
  }

  function isMultinameConstant(node) {
    return node instanceof Constant && node.value instanceof Multiname;
  }

  function isMultiname(name) {
    return isMultinameConstant(name) || name instanceof AVM2Multiname;
  }

  function isStore(store) {
    return isPhi(store) || store instanceof Store || isProjection(store, Projection.Type.STORE);
  }

  function isConstant(constant) {
    return constant instanceof Constant;
  }

  function isBoolean(boolean) {
    return boolean === true || boolean === false;
  }

  function isInteger(integer) {
    return integer | 0 === integer;
  }

  function isArray(array) {
    return array instanceof Array;
  }

  var AVM2Scope = (function () {
    function constructor(parent, object, isWith) {
      Node.call(this);
      assert (isScope(parent));
      assert (object);
      assert (isBoolean(isWith));
      this.parent = parent;
      this.object = object;
      this.isWith = isWith;
    }
    constructor.prototype = extend(Value, "AVM2_Scope");
    return constructor;
  })();

  var This = (function () {
    function thisNode(control) {
      Node.call(this);
      assert (control);
      this.control = control;
    }
    thisNode.prototype = extend(Value, "This");
    return thisNode;
  })();

  var Throw = (function () {
    function throwNode(control, argument) {
      Node.call(this);
      assert (control);
      this.control = control;
      this.argument = argument;
    }
    throwNode.prototype = extend(Value, "Throw");
    return throwNode;
  })();

  var Arguments = (function () {
    function argumentsNode(control) {
      Node.call(this);
      assert (control);
      this.control = control;
    }
    argumentsNode.prototype = extend(Value, "Arguments");
    return argumentsNode;
  })();

  var AVM2Global = (function () {
    function constructor(control, scope) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isScope(scope));
      this.control = control;
      this.scope = scope;
    }
    constructor.prototype = extend(Value, "AVM2_Global");
    return constructor;
  })();

  function isControlOrNull(control) {
    return isControl(control) || control === null;
  }

  function isControl(control) {
    return control instanceof Control;
  }

  function isValueOrNull(value) {
    return isValue(value) || value === null;
  }

  function isValue(value) {
    return value instanceof Value;
  }

  var GlobalProperty = (function () {
    function globalProperty(name) {
      Node.call(this);
      assert (isString(name));
      this.name = name;
    }
    globalProperty.prototype = extend(Value, "GlobalProperty");
    return globalProperty;
  })();

  var GetProperty = (function () {
    function getProperty(control, store, object, name) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (store === null || isStore(store));
      assert (object);
      assert (name);
      this.control = control;
      this.store = store;
      this.object = object;
      this.name = name;
    }
    getProperty.prototype = extend(Value, "GetProperty");
    return getProperty;
  })();

  var AVM2GetProperty = (function () {
    function avm2GetProperty(control, store, object, name, isIndexed, isMethod, ic) {
      GetProperty.call(this, control, store, object, name);
      assert (isBoolean(isIndexed));
      assert (isBoolean(isMethod));
      assert (isNullOrUndefined(ic) || isConstant(ic));
      assert (isMultiname(name));
      this.isIndexed = isIndexed;
      this.isMethod = isMethod;
      this.ic = ic;
    }
    avm2GetProperty.prototype = extend(GetProperty, "AVM2_GetProperty");
    return avm2GetProperty;
  })();

  var AVM2DeleteProperty = (function () {
    function avm2DeleteProperty(control, store, object, name) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isStore(store));
      assert (object);
      assert (name);
      this.control = control;
      this.store = store;
      this.object = object;
      this.name = name;
    }
    avm2DeleteProperty.prototype = extend(Value, "AVM2_DeleteProperty");
    return avm2DeleteProperty;
  })();

  var AVM2HasProperty = (function () {
    function avm2HasProperty(control, store, object, name) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isStore(store));
      assert (object);
      assert (name);
      this.control = control;
      this.store = store;
      this.object = object;
      this.name = name;
    }
    avm2HasProperty.prototype = extend(Value, "AVM2_HasProperty");
    return avm2HasProperty;
  })();

  // Override GetProperty to take advantage of its common structure
  var AVM2GetDescendants = (function () {
    function avm2GetDescendants(control, store, object, name) {
      GetProperty.call(this, control, store, object, name, false);
    }
    avm2GetDescendants.prototype = extend(GetProperty, "AVM2_GetDescendants");
    return avm2GetDescendants;
  })();

  var SetProperty = (function () {
    function setProperty(control, store, object, name, value) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isStore(store));
      assert (object);
      assert (name);
      assert (value);
      this.control = control;
      this.store = store;
      this.object = object;
      this.name = name;
      this.value = value;
    }
    setProperty.prototype = extend(Value, "SetProperty");
    return setProperty;
  })();

  var AVM2SetProperty = (function () {
    function avm2SetProperty(control, store, object, name, value, isIndexed, ic) {
      SetProperty.call(this, control, store, object, name, value);
      assert (isBoolean(isIndexed));
      assert (isNullOrUndefined(ic) || isConstant(ic));
      assert (isMultiname(name));
      this.isIndexed = isIndexed;
      this.ic = ic;
    }
    avm2SetProperty.prototype = extend(SetProperty, "AVM2_SetProperty");
    return avm2SetProperty;
  })();

  var AVM2GetSlot = (function () {
    function avm2GetSlot(control, store, object, index) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isStore(store));
      assert (object);
      assert (isValue(index));
      this.control = control;
      this.store = store;
      this.object = object;
      this.index = index;
    }
    avm2GetSlot.prototype = extend(Value, "AVM2_GetSlot");
    return avm2GetSlot;
   })();

  var AVM2SetSlot = (function () {
    function avm2SetSlot(control, store, object, index, value) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isStore(store));
      assert (object);
      assert (isValue(index));
      assert (value);
      this.control = control;
      this.store = store;
      this.object = object;
      this.index = index;
      this.value = value;
     }
     avm2SetSlot.prototype = extend(Value, "AVM2_SetSlot");
     return avm2SetSlot;
  })();

  var AVM2FindProperty = (function () {
    function avm2FindProperty(control, store, scope, name, domain, strict) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isStore(store));
      assert (isScope(scope));
      assert (isMultiname(name), name);
      assert (isConstant(domain));
      assert (isBoolean(strict));
      this.control = control;
      this.store = store;
      this.scope = scope;
      this.name = name;
      this.domain = domain;
      this.strict = strict;
    }
    avm2FindProperty.prototype = extend(Value, "AVM2_FindProperty");
    return avm2FindProperty;
  })();

  var NewArray = (function () {
    function newArray(control, elements) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isArray(elements));
      this.control = control;
      this.elements = elements;
    }
    newArray.prototype = extend(Value, "NewArray");
    return newArray;
  })();

  var KeyValuePair = (function () {
    function keyValuePair(key, value) {
      Node.call(this);
      assert (key);
      assert (value);
      this.key = key;
      this.value = value;
    }
    keyValuePair.prototype = extend(Value, "KeyValuePair");
    keyValuePair.prototype.mustFloat = true;
    return keyValuePair;
  })();

  var NewObject = (function () {
    function newObject(control, properties) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isArray(properties));
      this.control = control;
      this.properties = properties;
    }
    newObject.prototype = extend(Value, "NewObject");
    return newObject;
  })();

  var AVM2NewActivation = (function () {
    function avm2NewActivation(methodInfo) {
      Node.call(this);
      assert (isConstant(methodInfo));
      this.methodInfo = methodInfo;
    }
    avm2NewActivation.prototype = extend(Value, "AVM2_NewActivation");
    return avm2NewActivation;
  })();

  var AVM2Multiname = (function () {
    function avm2Multiname(namespaces, name, flags) {
      Node.call(this);
      assert (namespaces);
      assert (name);
      this.namespaces = namespaces;
      this.name = name;
      this.flags = flags;
    }
    avm2Multiname.prototype = extend(Value, "AVM2_Multiname");
    avm2Multiname.prototype.mustFloat = true;
    return avm2Multiname;
  })();

  var Call = (function () {
    function call(control, store, callee, object, args, pristine) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (callee);
      assert (isValueOrNull(object));
      assert (store === null || isStore(store));
      assert (isArray(args));
      this.control = control;
      this.callee = callee;
      this.object = object;
      this.store = store;
      this.arguments = args;
      this.pristine = pristine;
    }
    call.prototype = extend(Value, "Call");
    return call;
  })();

  var CallProperty = (function () {
    function callProperty(control, store, object, name, args, pristine) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isValueOrNull(object));
      assert (name);
      assert (store === null || isStore(store));
      assert (isArray(args));
      this.control = control;
      this.store = store;
      this.object = object;
      this.name = name;
      this.arguments = args;
      this.pristine = pristine;
    }
    callProperty.prototype = extend(Value, "CallProperty");
    return callProperty;
  })();

  var AVM2CallProperty = (function () {
    function avm2CallProperty(control, store, object, name, isLex, args, pristine, ic) {
      CallProperty.call(this, control, store, object, name, args, pristine);
      assert (isBoolean(isLex));
      assert (isNullOrUndefined(ic) || isConstant(ic));
      assert (isMultiname(name));
      this.isLex = isLex;
      this.ic = ic;
    }
    avm2CallProperty.prototype = extend(GetProperty, "AVM2_CallProperty");
    return avm2CallProperty;
  })();

  var New = (function () {
    function newNode(control, store, callee, args) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (callee);
      assert (isStore(store));
      assert (isArray(args));
      this.control = control;
      this.callee = callee;
      this.store = store;
      this.arguments = args;
    }
    newNode.prototype = extend(Value, "New");
    return newNode;
  })();

  var AVM2New = (function () {
    function avm2New(control, store, object, name) {
      New.call(this, control, store, object, name);
    }
    avm2New.prototype = extend(New, "AVM2_New");
    return avm2New;
  })();

  var Store = (function () {
    function store() {
      Node.call(this);
    }
    store.prototype = extend(Value, "Store");
    return store;
  })();

  var Null = new Constant(null);
  var Undefined = new Constant(undefined);

  Undefined.toString = function () {
    return "_";
  };

  var Parameter = (function () {
    function parameter(control, index, name) {
      Node.call(this);
      assert (control);
      assert (isInteger(index));
      assert (isString(name));
      this.control = control;
      this.index = index;
      this.name = name;
    }
    parameter.prototype = extend(Value, "Parameter");
    return parameter;
  })();

  var Block = (function () {
    function block(id, start, end) {
      if (start) {
        assert (start instanceof Region);
      }
      this.region = start;
      this.id = id;
      this.successors = [];
      this.predecessors = [];
      this.nodes = [start, end];
    }
    block.prototype.pushSuccessorAt = function pushSuccessor(successor, index, pushPredecessor) {
      assert (successor);
      assert (!this.successors[index]);
      this.successors[index] = successor;
      if (pushPredecessor) {
        successor.pushPredecessor(this);
      }
    };
    block.prototype.pushSuccessor = function pushSuccessor(successor, pushPredecessor) {
      assert (successor);
      this.successors.push(successor);
      if (pushPredecessor) {
        successor.pushPredecessor(this);
      }
    };
    block.prototype.pushPredecessor = function pushPredecessor(predecessor) {
      assert (predecessor);
      this.predecessors.push(predecessor);
    };
    block.prototype.visitNodes = function (fn) {
      this.nodes.forEach(fn);
    };
    block.prototype.visitSuccessors = function (fn) {
      this.successors.forEach(fn);
    };
    block.prototype.visitPredecessors = function (fn) {
      this.predecessors.forEach(fn);
    };
    block.prototype.append = function (node) {
      assert (this.nodes.length >= 2);
      assert (isValue(node), node);
      assert (isNotPhi(node));
      assert (this.nodes.indexOf(node) < 0);
      if (node.mustFloat) {
        return;
      }
      this.nodes.splice(this.nodes.length - 1, 0, node);
    };
    block.prototype.toString = function () {
      return "B" + this.id + (this.name ? " (" + this.name + ")" : "");
    };
    block.prototype.trace = function (writer) {
      writer.writeLn(this);
    };
    return block;
  })();

  var DFG = (function () {
    function constructor(exit) {
      this.exit = exit;
    }

    constructor.prototype.buildCFG = function () {
      return CFG.fromDFG(this);
    };

    function preOrderDepthFirstSearch(root, visitChildren, pre) {
      var visited = [];
      var worklist = [root];
      var push = worklist.push.bind(worklist);
      while ((node = worklist.pop())) {
        if (visited[node.id]) {
          continue;
        }
        visited[node.id] = true;
        pre(node);
        worklist.push(node);
        visitChildren(node, push);
      }
    }

    function postOrderDepthFirstSearch(root, visitChildren, post) {
      var ONE_TIME = 1, MANY_TIMES = 2;
      var visited = [];
      var worklist = [root];
      function visitChild(child) {
        if (!visited[child.id]) {
          worklist.push(child);
        }
      }
      var node;
      while ((node = worklist.top())) {
        if (visited[node.id]) {
          if (visited[node.id] === ONE_TIME) {
            visited[node.id] = MANY_TIMES;
            post(node);
          }
          worklist.pop();
          continue;
        }
        visited[node.id] = ONE_TIME;
        visitChildren(node, visitChild);
      }
    }

    constructor.prototype.forEach = function visitAll(visitor, postOrder) {
      var search = postOrder ? postOrderDepthFirstSearch : preOrderDepthFirstSearch;
      search(this.exit, function (node, v) {
        node.visitInputs(v);
      }, visitor);
    };

    constructor.prototype.traceMetrics = function (writer) {
      var counter = new metrics.Counter(true);
      preOrderDepthFirstSearch(this.exit, function (node, visitor) {
        node.visitInputs(visitor);
      }, function (node) {
        counter.count(node.nodeName);
      });
      counter.trace(writer);
    };

    constructor.prototype.trace = function (writer) {
      var nodes = [];
      var visited = {};

      function colorOf(node) {
        if (node instanceof Control) {
          return "yellow";
        } else if (node instanceof Phi) {
          return "purple";
        } else if (node instanceof Value) {
          return "green";
        }
        return "white";
      }

      var blocks = [];

      function followProjection(node) {
        return node instanceof Projection ? node.project() : node;
      }

      function next(node) {
        node = followProjection(node);
        if (!visited[node.id]) {
          visited[node.id] = true;
          if (node.block) {
            blocks.push(node.block);
          }
          nodes.push(node);
          node.visitInputs(next);
        }
      }

      next(this.exit);

      writer.writeLn("");
      writer.enter("digraph DFG {");
      writer.writeLn("graph [bgcolor = gray10];");
      writer.writeLn("edge [color = white];");
      writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
      writer.writeLn("rankdir = BT;");

      function writeNode(node) {
        writer.writeLn("N" + node.id + " [label = \"" + node.toString() +
          "\", color = \"" + colorOf(node) + "\"];");
      }

      function defineNode(node) {
        writer.writeLn("N" + node.id + ";");
      }

      blocks.forEach(function (block) {
        writer.enter("subgraph cluster" + block.nodes[0].id + " { bgcolor = gray20;");
        block.visitNodes(function (node) {
          defineNode(followProjection(node));
        });
        writer.leave("}");
      });

      nodes.forEach(writeNode);

      nodes.forEach(function (node) {
        node.visitInputs(function (input) {
          input = followProjection(input);
          writer.writeLn("N" + node.id + " -> " + "N" + input.id + " [color=" + colorOf(input) + "];");
        });
      });

      writer.leave("}");
      writer.writeLn("");
    };

    return constructor;
  })();

  var CFG = (function () {
    function constructor() {
      this.nextBlockID = 0;
      this.blocks = [];
      this.exit;
      this.root;
    }

    constructor.fromDFG = function fromDFG(dfg) {
      var cfg = new CFG();

      assert (dfg && dfg instanceof DFG);
      cfg.dfg = dfg;

      var visited = [];

      function buildEnd(end) {
        if (end instanceof Projection) {
          end = end.project();
        }
        assert (end instanceof End || end instanceof Start, end);
        if (visited[end.id]) {
          return;
        }
        visited[end.id] = true;
        var start = end.control;
        if (!(start instanceof Region)) {
          start = end.control = new Region(start);
        }
        var block = start.block = cfg.buildBlock(start, end);
        if (start instanceof Start) {
          cfg.root = block;
        }
        for (var i = 0; i < start.predecessors.length; i++) {
          var c = start.predecessors[i];
          var d;
          var trueProjection = false;
          if (c instanceof Projection) {
            d = c.project();
            trueProjection = c.type === Projection.Type.TRUE;
          } else {
            d = c;
          }
          if (d instanceof Region) {
            d = new Jump(c);
            d = new Projection(d, Projection.Type.TRUE);
            start.predecessors[i] = d;
            d = d.project();
            trueProjection = true;
          }
          buildEnd(d);
          var controlBlock = d.control.block;
          if (d instanceof Switch) {
            assert (isProjection(c, Projection.Type.CASE));
            controlBlock.pushSuccessorAt(block, c.selector.value, true);
          } else if (trueProjection && controlBlock.successors.length > 0) {
            controlBlock.pushSuccessor(block, true);
            controlBlock.hasFlippedSuccessors = true;
          } else {
            controlBlock.pushSuccessor(block, true);
          }
        }
      }

      buildEnd(dfg.exit);
      cfg.splitCriticalEdges();
      cfg.exit = dfg.exit.control.block;
      cfg.computeDominators(true);
      return cfg;
    };

    /**
     * Makes sure root node has no predecessors and that there is only one
     * exit node.
     */
    constructor.prototype.buildRootAndExit = function buildRootAndExit() {
      assert (!this.root && !this.exit);

      // Create new root node if the root node has predecessors.
      if (this.blocks[0].predecessors.length > 0) {
        this.root = new Block(this.nextBlockID++);
        this.blocks.push(this.root);
        this.root.pushSuccessor(this.blocks[0], true);
      } else {
        this.root = this.blocks[0];
      }
      var exitBlocks = [];

      // Collect exit blocks (blocks with no successors).
      for (var i = 0; i < this.blocks.length; i++) {
        var block = this.blocks[i];
        if (block.successors.length === 0) {
          exitBlocks.push(block);
        }
      }

      if (exitBlocks.length === 0) {
        unexpected("Must have an exit block.");
      } else if (exitBlocks.length === 1 && exitBlocks[0] !== this.root) {
        this.exit = exitBlocks[0];
      } else {
        // Create new exit block to merge flow.
        this.exit = new Block(this.nextBlockID++);
        this.blocks.push(this.exit);
        for (var i = 0; i < exitBlocks.length; i++) {
          exitBlocks[i].pushSuccessor(this.exit, true);
        }
      }

      assert (this.root && this.exit);
      assert (this.root !== this.exit);
    };

    constructor.prototype.fromString = function (list, rootName) {
      var cfg = this;
      var names = cfg.blockNames || (cfg.blockNames = {});
      var blocks = cfg.blocks;

      var sets = list.replace(/\ /g,"").split(",");
      sets.forEach(function (set) {
        var edgeList = set.split("->");
        var last = null;
        for (var i = 0; i < edgeList.length; i++) {
          var next = edgeList[i];
          if (last) {
            buildEdge(last, next);
          } else {
            buildBlock(next);
          }
          last = next;
        }
      });

      function buildBlock(name) {
        var block = names[name];
        if (block) {
          return block;
        }
        names[name] = block = new Block(cfg.nextBlockID++);
        block.name = name;
        blocks.push(block);
        return block;
      }

      function buildEdge(from, to) {
        buildBlock(from).pushSuccessor(buildBlock(to), true);
      }

      assert (rootName && names[rootName]);
      this.root = names[rootName];
    };

    constructor.prototype.buildBlock = function (start, end) {
      var block = new Block(this.nextBlockID++, start, end);
      this.blocks.push(block);
      return block;
    };

    constructor.prototype.createBlockSet = function () {
      if (!this.setConstructor) {
        this.setConstructor = BitSetFunctor(this.blocks.length);
      }
      return new this.setConstructor();
    };

    constructor.prototype.computeReversePostOrder = function computeReversePostOrder() {
      if (this.order) {
        return this.order;
      }
      var order = this.order = [];
      this.depthFirstSearch(null, order.push.bind(order));
      order.reverse();
      for (var i = 0; i < order.length; i++) {
        order[i].rpo = i;
      }
      return order;
    };

    constructor.prototype.depthFirstSearch = function depthFirstSearch(preFn, postFn) {
      var visited = this.createBlockSet();
      function visit(node) {
        visited.set(node.id);
        if (preFn) preFn(node);
        var successors = node.successors;
        for (var i = 0, j = successors.length; i < j; i++) {
          var s = successors[i];
          if (!visited.get(s.id)) {
            visit(s);
          }
        }
        if (postFn) postFn(node);
      }
      visit(this.root);
    };

    constructor.prototype.computeDominators = function (apply) {
      assert (this.root.predecessors.length === 0, "Root node ", this.root, " must not have predecessors.");

      var dom = new Int32Array(this.blocks.length);
      for (var i = 0; i < dom.length; i++) {
        dom[i] = -1;
      }
      var map = this.createBlockSet();
      function computeCommonDominator(a, b) {
        map.clearAll();
        while (a >= 0) {
          map.set(a);
          a = dom[a];
        }
        while (b >= 0 && !map.get(b)) {
          b = dom[b];
        }
        return b;
      }
      function computeDominator(blockID, parentID) {
        if (dom[blockID] < 0) {
          dom[blockID] = parentID;
        } else {
          dom[blockID] = computeCommonDominator(dom[blockID], parentID);
        }
      }
      this.depthFirstSearch (
        function visit(block) {
          var s = block.successors;
          for (var i = 0, j = s.length; i < j; i++) {
            computeDominator(s[i].id, block.id);
          }
        }
      );
      if (apply) {
        for (var i = 0, j = this.blocks.length; i < j; i++) {
          this.blocks[i].dominator = this.blocks[dom[i]];
        }
        function computeDominatorDepth(block) {
          var dominatorDepth;
          if (block.dominatorDepth !== undefined) {
            return block.dominatorDepth;
          } else if (!block.dominator) {
            dominatorDepth = 0;
          } else {
            dominatorDepth = computeDominatorDepth(block.dominator) + 1;
          }
          return block.dominatorDepth = dominatorDepth;
        }
        for (var i = 0, j = this.blocks.length; i < j; i++) {
          computeDominatorDepth(this.blocks[i]);
        }
      }
      return dom;
    };

    constructor.prototype.computeLoops = function computeLoops() {
      var active = this.createBlockSet();
      var visited = this.createBlockSet();
      var nextLoop = 0;

      function makeLoopHeader(block) {
        if (!block.isLoopHeader) {
          assert(nextLoop < 32, "Can't handle too many loops, fall back on BitMaps if it's a problem.");
          block.isLoopHeader = true;
          block.loops = 1 << nextLoop;
          nextLoop += 1;
        }
        assert(bitCount(block.loops) === 1);
      }

      function visit(block) {
        if (visited.get(block.id)) {
          if (active.get(block.id)) {
            makeLoopHeader(block);
          }
          return block.loops;
        }
        visited.set(block.id);
        active.set(block.id);
        var loops = 0;
        for (var i = 0, j = block.successors.length; i < j; i++) {
          loops |= visit(block.successors[i]);
        }
        if (block.isLoopHeader) {
          assert(bitCount(block.loops) === 1);
          loops &= ~block.loops;
        }
        block.loops = loops;
        active.clear(block.id);
        return loops;
      }

      var loop = visit(this.root);
      assert(loop === 0);
    };

    function followProjection(node) {
      return node instanceof Projection ? node.project() : node;
    }

    var Uses = (function () {
      function constructor() {
        this.entries = [];
      }
      constructor.prototype.addUse = function addUse(def, use) {
        var entry = this.entries[def.id];
        if (!entry) {
          entry = this.entries[def.id] = {def: def, uses:[]};
        }
        entry.uses.pushUnique(use);
      };
      constructor.prototype.trace = function (writer) {
        writer.enter("> Uses");
        this.entries.forEach(function (entry) {
          writer.writeLn(entry.def.id + " -> [" + entry.uses.map(toID).join(", ") + "] " + entry.def);
        });
        writer.leave("<");
      };
      constructor.prototype.replace = function (def, value) {
        var entry = this.entries[def.id];
        if (entry.uses.length === 0) {
          return false;
        }
        var count = 0;
        entry.uses.forEach(function (use) {
          count += use.replaceInput(def, value);
        });
        assert (count >= entry.uses.length);
        entry.uses = [];
        return true;
      };
      function updateUses(def, value) {
        debug && writer.writeLn("Update " + def + " with " + value);
        var entry = useEntries[def.id];
        if (entry.uses.length === 0) {
          return false;
        }
        debug && writer.writeLn("Replacing: " + def.id + " in [" + entry.uses.map(toID).join(", ") + "] with " + value.id);
        var count = 0;
        entry.uses.forEach(function (use) {
          count += use.replaceInput(def, value);
        });
        assert (count >= entry.uses.length);
        entry.uses = [];
        return true;
      }
      return constructor;
    })();

    /**
     * Computes def-use chains.
     *
     * () -> Map[id -> {def:Node, uses:Array[Node]}]
     */
    constructor.prototype.computeUses = function computeUses() {
      var writer = debug && new IndentingWriter();

      debug && writer.enter("> Compute Uses");
      var dfg = this.dfg;

      var uses = new Uses();

      dfg.forEach(function (use) {
        use.visitInputs(function (def) {
          uses.addUse(def, use);
        });
      });

      if (debug) {
        writer.enter("> Uses");
        uses.entries.forEach(function (entry) {
          writer.writeLn(entry.def.id + " -> [" + entry.uses.map(toID).join(", ") + "] " + entry.def);
        });
        writer.leave("<");
        writer.leave("<");
      }
      return uses;
    };

    constructor.prototype.verify = function verify() {
      var writer = debug && new IndentingWriter();
      debug && writer.enter("> Verify");

      var order = this.computeReversePostOrder();

      order.forEach(function (block) {
        if (block.phis) {
          block.phis.forEach(function (phi) {
            assert (phi.control === block.region);
            assert (phi.arguments.length === block.predecessors.length);
          });
        }
      });

      debug && writer.leave("<");
    };

    /**
     * Simplifies phis of the form:
     *
     * replace |x = phi(y)| -> y
     * replace |x = phi(x, y)| -> y
     * replace |x = phi(y, y, x, y, x)| -> |phi(y, x)| -> y
     */
    constructor.prototype.optimizePhis = function optimizePhis() {
      var writer = debug && new IndentingWriter();
      debug && writer.enter("> Optimize Phis");

      var phis = [];
      var useEntries = this.computeUses().entries;
      useEntries.forEach(function (entry) {
        if (isPhi(entry.def)) {
          phis.push(entry.def);
        }
      });

      debug && writer.writeLn("Trying to optimize " + phis.length + " phis.");

      /**
       * Updates all uses to a new definition. Returns true if anything was updated.
       */
      function updateUses(def, value) {
        debug && writer.writeLn("Update " + def + " with " + value);
        var entry = useEntries[def.id];
        if (entry.uses.length === 0) {
          return false;
        }
        debug && writer.writeLn("Replacing: " + def.id + " in [" + entry.uses.map(toID).join(", ") + "] with " + value.id);
        var count = 0;
        entry.uses.forEach(function (use) {
          count += use.replaceInput(def, value);
        });
        assert (count >= entry.uses.length);
        entry.uses = [];
        return true;
      }

      function simplify(phi, args) {
        args = args.unique();
        if (args.length === 1) {
          // x = phi(y) -> y
          return args[0];
        } else {
          if (args.length === 2) {
            // x = phi(y, x) -> y
            if (args[0] === phi) {
              return args[1];
            } else if (args[1] === phi) {
              return args[0];
            }
            return phi;
          }
        }
        return phi;
      }

      var count = 0;
      var iterations = 0;
      var changed = true;
      while (changed) {
        iterations ++;
        changed = false;
        phis.forEach(function (phi) {
          var value = simplify(phi, phi.arguments);
          if (value !== phi) {
            if (updateUses(phi, value)) {
              changed = true;
              count ++;
            }
          }
        });
      }

      if (debug) {
        writer.writeLn("Simplified " + count + " phis, in " + iterations + " iterations.");
        writer.leave("<");
      }
    };

    /**
     * "A critical edge is an edge which is neither the only edge leaving its source block, nor the only edge entering
     * its destination block. These edges must be split: a new block must be created in the middle of the edge, in order
     * to insert computations on the edge without affecting any other edges." - Wikipedia
     */
    constructor.prototype.splitCriticalEdges = function splitCriticalEdges() {
      var writer = debug && new IndentingWriter();
      var blocks = this.blocks;
      var criticalEdges = [];
      debug && writer.enter("> Splitting Critical Edges");
      for (var i = 0; i < blocks.length; i++) {
        var successors = blocks[i].successors;
        if (successors.length > 1) {
          for (var j = 0; j < successors.length; j++) {
            if (successors[j].predecessors.length > 1) {
              criticalEdges.push({from: blocks[i], to: successors[j]});
            }
          }
        }
      }

      var criticalEdgeCount = criticalEdges.length;
      if (criticalEdgeCount && debug) {
        writer.writeLn("Splitting: " + criticalEdgeCount);
        this.trace(writer);
      }

      var edge;
      while ((edge = criticalEdges.pop())) {
        var fromIndex = edge.from.successors.indexOf(edge.to);
        var toIndex = edge.to.predecessors.indexOf(edge.from);
        assert (fromIndex >= 0 && toIndex >= 0);
        debug && writer.writeLn("Splitting critical edge: " + edge.from + " -> " + edge.to);
        var toBlock = edge.to;
        var toRegion = toBlock.region;
        var control = toRegion.predecessors[toIndex];
        var region = new Region(control);
        var jump = new Jump(region);
        var block = this.buildBlock(region, jump);
        toRegion.predecessors[toIndex] = new Projection(jump, Projection.Type.TRUE);

        var fromBlock = edge.from;
        fromBlock.successors[fromIndex] = block;
        block.pushPredecessor(fromBlock);
        block.pushSuccessor(toBlock);
        toBlock.predecessors[toIndex] = block;
      }

      if (criticalEdgeCount && debug) {
        this.trace(writer);
      }

      if (criticalEdgeCount && !release) {
        assert (this.splitCriticalEdges() === 0);
      }

      debug && writer.leave("<");

      return criticalEdgeCount;
    };

    /**
     * Allocate virtual registers and break out of SSA.
     */
    constructor.prototype.allocateVariables = function allocateVariables() {
      var writer = debug && new IndentingWriter();

      debug && writer.enter("> Allocating Virtual Registers");
      var order = this.computeReversePostOrder();

      function allocate(node) {
        if (isProjection(node, Projection.Type.STORE)) {
          return;
        }
        if (node instanceof SetProperty) {
          return;
        }
        if (node instanceof Value) {
          node.variable = new Variable("l" + node.id);
          debug && writer.writeLn("Allocated: " + node.variable + " to " + node);
        }
      }

      order.forEach(function (block) {
        block.nodes.forEach(allocate);
        if (block.phis) {
          block.phis.forEach(allocate);
        }
      });

      /**
       * To break out of SSA form we need to emit moves in the phi's predecessor blocks. Here we
       * collect the set of all moves in |blockMoves| : Map[id -> Array[Move]]
       *
       * The moves actually need to be emitted along the phi's predecessor edges. Emitting them in the
       * predecessor blocks is only correct in the absence of CFG critical edges.
       */

      var blockMoves = [];
      for (var i = 0; i < order.length; i++) {
        var block = order[i];
        var phis = block.phis;
        var predecessors = block.predecessors;
        if (phis) {
          for (var j = 0; j < phis.length; j++) {
            var phi = phis[j];
            debug && writer.writeLn("Emitting moves for: " + phi);
            var arguments = phi.arguments;
            assert (predecessors.length === arguments.length);
            for (var k = 0; k < predecessors.length; k++) {
              var predecessor = predecessors[k];
              var argument = arguments[k];
              if (argument.abstract || isProjection(argument, Projection.Type.STORE)) {
                continue;
              }
              var moves = blockMoves[predecessor.id] || (blockMoves[predecessor.id] = []);
              argument = argument.variable || argument;
              if (phi.variable !== argument) {
                moves.push(new Move(phi.variable, argument));
              }
            }
          }
        }
      }

      /**
       * All move instructions must execute simultaneously. Since there may be dependencies between
       * source and destination operands we need to sort moves topologically. This is not always
       * possible because of cyclic dependencies. In such cases break the cycles using temporaries.
       *
       * Simplest example where this happens:
       *   var a, b, t;
       *   while (true) {
       *     t = a; a = b; b = t;
       *   }
       */
      var blocks = this.blocks;
      blockMoves.forEach(function (moves, blockID) {
        var block = blocks[blockID];
        var temporary = 0;
        debug && writer.writeLn(block + " Moves: " + moves);
        while (moves.length) {
          // Find a move that is safe to emit, i.e. no other move depends on its destination.
          for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            // Find a move that depends on the move's destination?
            for (var j = 0; j < moves.length; j++) {
              if (i === j) {
                continue;
              }
              if (moves[j].from === move.to) {
                move = null;
                break;
              }
            }
            if (move) {
              moves.splice(i--, 1);
              block.append(move);
            }
          }

          if (moves.length) {
            // We have a cycle, break it with a temporary.
            debug && writer.writeLn("Breaking Cycle");
            // 1. Pick any move.
            var move = moves[0];
            // 2. Emit a move to save its destination in a temporary.
            var temp = new Variable("t" + temporary++);
            blocks[blockID].append(new Move(temp, move.to));
            // 3. Update all moves's source to refer to the temporary.
            for (var i = 1; i < moves.length; i++) {
              if (moves[i].from === move.to) {
                moves[i].from = temp;
              }
            }
            // 4. Loop, baby, loop.
          }
        }
      });

      debug && writer.leave("<");
    };

    constructor.prototype.scheduleEarly = function scheduleEarly() {
      var debugScheduler = false;
      var writer = debugScheduler && new IndentingWriter();

      debugScheduler && writer.enter("> Schedule Early");

      var cfg = this;
      var dfg = this.dfg;

      var scheduled = [];

      var roots = [];

      dfg.forEach(function (node) {
        if (node instanceof Region || node instanceof Jump) {
          return;
        }
        if (node.control) {
          roots.push(node);
        }
        if (isPhi(node)) {
          /**
           * When breaking out of SSA, move instructions need to have non-floating source nodes. Otherwise
           * the topological sorting of moves gets more complicated, especially when cyclic dependencies
           * are involved. Here we just mark all floating inputs of phi nodes as non-floating which forces
           * them to get scheduled.
           *
           * TODO: Find out if this requirement is too expensive. We can make the move insertion algorithm
           * more intelligent so that it walks the inputs of floating nodes when looking for dependencies.
           */
          node.arguments.forEach(function (input) {
            if (shouldFloat(input)) {
              input.mustNotFloat = true;
            }
          });
        }
      }, true);

      if (debugScheduler) {
        roots.forEach(function (node) {
          print("Root: " + node);
        });
      }

      roots.forEach(function (node) {
        if (node instanceof Phi) {
          var block = node.control.block;
          (block.phis || (block.phis = [])).push(node);
        }
        if (node.control) {
          schedule(node);
        }
      });

      function isScheduled(node) {
        return scheduled[node.id];
      }

      function shouldFloat(node) {
        if (node.mustNotFloat || node.shouldNotFloat) {
          return false;
        }
        if (node.mustFloat || node.shouldFloat) {
          return true;
        }
        if (node instanceof Parameter || node instanceof This || node instanceof Arguments) {
          return true;
        }
        return node instanceof Binary || node instanceof Unary || node instanceof Parameter;
        // return false;
      }

      function append(node) {
        assert (!isScheduled(node), "Already scheduled " + node);
        scheduled[node.id] = true;
        assert (node.control, node);
        if (shouldFloat(node)) {

        } else {
          node.control.block.append(node);
        }
      }

      function scheduleIn(node, region) {
        assert (!node.control, node);
        assert (!isScheduled(node));
        assert (region);
        debugScheduler && writer.writeLn("Scheduled: " + node + " in " + region);
        node.control = region;
        append(node);
      }

      function schedule(node) {
        debugScheduler && writer.enter("> Schedule: " + node);

        var inputs = [];
        node.visitInputs(function (input) {
          if (isValue(input)) {
            inputs.push(followProjection(input));
          }
        });

        debugScheduler && writer.writeLn("Inputs: [" + inputs.map(toID) + "], length: " + inputs.length);

        for (var i = 0; i < inputs.length; i++) {
          var input = inputs[i];
          if (isNotPhi(input) && !isScheduled(input)) {
            schedule(input);
          }
        }

        if (node.control) {
          if (node instanceof End || node instanceof Phi || node instanceof Start || isScheduled(node)) {

          } else {
            append(node);
          }
        } else {
          if (inputs.length) {
            var x = inputs[0].control;
            for (var i = 1; i < inputs.length; i++) {
              var y = inputs[i].control;
              if (x.block.dominatorDepth < y.block.dominatorDepth) {
                x = y;
              }
            }
            scheduleIn(node, x);
          } else {
            scheduleIn(node, cfg.root.region);
          }
        }

        debugScheduler && writer.leave("<");
      }

      debugScheduler && writer.leave("<");

      roots.forEach(function (node) {
        node = followProjection(node);
        if (node === dfg.start || node instanceof Region) {
          return;
        }
        assert (node.control, "Node is not scheduled: " + node);
      });
    };

    constructor.prototype.trace = function (writer) {
      var visited = [];
      var blocks = [];

      function next(block) {
        if (!visited[block.id]) {
          visited[block.id] = true;
          blocks.push(block);
          block.visitSuccessors(next);
        }
      }

      var root = this.root;
      var exit = this.exit;

      next(root);

      function colorOf(block) {
        return "black";
      }

      function styleOf(block) {
        return "filled";
      }

      function shapeOf(block) {
        assert (block);
        if (block === root) {
          return "house";
        } else if (block === exit) {
          return "invhouse";
        }
        return "box";
      }

      writer.writeLn("");
      writer.enter("digraph CFG {");

      writer.writeLn("graph [bgcolor = gray10];");
      writer.writeLn("edge [fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
      writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11, color = white, fontcolor = white, style = filled];");
      writer.writeLn("rankdir = TB;");

      blocks.forEach(function (block) {
        var loopInfo = "";
        var blockInfo = "";
        var intervalInfo = "";
        // if (block.dominatorDepth !== undefined) {
        //  blockInfo = " D" + block.dominatorDepth;
        // }
        if (block.loops !== undefined) {
          // loopInfo = "loop: " + block.loops + ", nest: " + bitCount(block.loops);
          // loopInfo = " L" + bitCount(block.loops);
        }
        if (block.name !== undefined) {
          blockInfo += " " + block.name;
        }
        if (block.rpo !== undefined) {
          blockInfo += " O: " + block.rpo;
        }
        writer.writeLn("B" + block.id + " [label = \"B" + block.id + blockInfo + loopInfo + "\", fillcolor = \"" + colorOf(block) + "\", shape=" + shapeOf(block) + ", style=" + styleOf(block) + "];");
      });

      blocks.forEach(function (block) {
        block.visitSuccessors(function (successor) {
          writer.writeLn("B" + block.id + " -> " + "B" + successor.id);
        });
        if (block.dominator) {
          writer.writeLn("B" + block.id + " -> " + "B" + block.dominator.id + " [color = orange];");
        }
        if (block.follow) {
          writer.writeLn("B" + block.id + " -> " + "B" + block.follow.id + " [color = purple];");
        }
      });

      writer.leave("}");
      writer.writeLn("");
    };

    return constructor;
  })();

  /**
   * Peephole optimizations:
   */
  var PeepholeOptimizer = (function () {
    function constructor() {

    }
    function foldUnary(node, truthy) {
      assert (node instanceof Unary);
      if (isConstant(node.argument)) {
        return new Constant(node.operator.evaluate(node.argument.value));
      }
      if (truthy) {
        var argument = fold(node.argument, true);
        if (node.operator === Operator.TRUE) {
          return argument;
        }
        if (argument instanceof Unary) {
          if (node.operator === Operator.FALSE && argument.operator === Operator.FALSE) {
            return argument.argument;
          }
        } else {
          return new Unary(node.operator, argument);
        }
      }
      return node;
    }
    function foldBinary(node, truthy) {
      assert (node instanceof Binary);
      if (isConstant(node.left) && isConstant(node.right)) {
        return new Constant(node.operator.evaluate(node.left.value, node.right.value));
      }
      return node;
    }
    function fold(node, truthy) {
      if (node instanceof Unary) {
        return foldUnary(node, truthy);
      } else if (node instanceof Binary) {
        return foldBinary(node, truthy);
      }
      return node;
    }
    constructor.prototype.tryFold = fold;
    return constructor;
  })();

  exports.isConstant = isConstant;

  exports.Block = Block;
  exports.Node = Node;
  exports.Start = Start;
  exports.Null = Null;
  exports.Undefined = Undefined;
  exports.This = This;
  exports.Throw = Throw;
  exports.Arguments = Arguments;
  exports.AVM2Global = AVM2Global;
  exports.Projection = Projection;
  exports.Region = Region;
  exports.Latch = Latch;
  exports.Binary = Binary;
  exports.Unary = Unary;
  exports.Constant = Constant;
  exports.AVM2FindProperty = AVM2FindProperty;
  exports.GlobalProperty = GlobalProperty;
  exports.GetProperty = GetProperty;
  exports.SetProperty = SetProperty;
  exports.CallProperty = CallProperty;
  exports.AVM2CallProperty = AVM2CallProperty;
  exports.AVM2GetProperty = AVM2GetProperty;
  exports.AVM2HasProperty = AVM2HasProperty;
  exports.AVM2DeleteProperty = AVM2DeleteProperty;
  exports.AVM2GetDescendants = AVM2GetDescendants;
  exports.AVM2SetProperty = AVM2SetProperty;
  exports.AVM2GetSlot = AVM2GetSlot;
  exports.AVM2SetSlot = AVM2SetSlot;
  exports.Call = Call;
  exports.AVM2New = AVM2New;
  exports.Phi = Phi;
  exports.Stop = Stop;
  exports.If = If;
  exports.Switch = Switch;
  exports.End = End;
  exports.Jump = Jump;
  exports.AVM2Scope = AVM2Scope;
  exports.Operator = Operator;
  exports.Variable = Variable;
  exports.Move = Move;
  exports.Copy = Copy;
  exports.Parameter = Parameter;
  exports.NewArray = NewArray;
  exports.NewObject = NewObject;
  exports.AVM2NewActivation = AVM2NewActivation;
  exports.KeyValuePair = KeyValuePair;
  exports.AVM2Multiname = AVM2Multiname;

  exports.DFG = DFG;
  exports.CFG = CFG;

  exports.PeepholeOptimizer = PeepholeOptimizer;

})(typeof exports === "undefined" ? (IR = {}) : exports);
