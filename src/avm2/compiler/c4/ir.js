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

  /**
   * We generate the IR node constructors from a specification. Any time you make a change to this you should uncomment
   * the print statement below, run Shumway (avm) from the command line and then paste back the generated IR below
   * between <<<< and >>>> markers.
   */

  var IRDefinition = {
    Control: {
      Region: {
        predecessors: {
          array: true,
          expand: "control"
        },
        Start: {
          _constructorText: "this.control = this;",
          scope: {
            dynamic: true
          },
          domain: {
            dynamic: true
          }
        }
      },
      End: {
        control: {
          assert: "isControlOrNull"
        },
        Stop: {
          store: {
            assert: "isStore"
          },
          argument: {
            assert: ""
          }
        },
        If: {
          predicate: {
            assert: ""
          }
        },
        Switch: {
          determinant: {
            assert: ""
          }
        },
        Jump: {}
      }
    },
    Value: {
      StoreDependent: {
        control: {
          assert: "isControlOrNull",
          nullable: true
        },
        store: {
          assert: "isStoreOrNull",
          nullable: true
        },
        loads: {
          dynamic: true,
          nullable: true,
          array: true
        },
        Call: {
          callee: {
            assert: ""
          },
          object: {
            assert: "isValueOrNull",
            nullable: true
          },
          args: {
            assert: "isArray",
            array: true
          },
          flags: {
            internal: true,
            assert: "isNumber"
          }
        },
        CallProperty: {
          object: {
            assert: ""
          },
          name: {
            assert: ""
          },
          args: {
            assert: "isArray",
            array: true
          },
          flags: {
            internal: true,
            assert: "isNumber"
          },
          ASCallProperty: {
            isLex: {
              assert: "",
              internal: true
            }
          },
          ASCallSuper: {
            scope: {
              assert: ""
            }
          }
        },
        New: {
          callee: {
            assert: ""
          },
          args: {
            assert: "",
            array: true
          },
          ASNew: {}
        },
        GetProperty: {
          object: {
            assert: ""
          },
          name: {
            assert: ""
          },
          ASGetProperty: {
            flags: {
              internal: true,
              assert: "isNumber"
            }
          },
          ASGetDescendants: {},
          ASHasProperty: {},
          ASGetSlot: {},
          ASGetSuper: {
            scope: {
              assert: ""
            }
          }
        },
        SetProperty: {
          object: {
            assert: ""
          },
          name: {
            assert: ""
          },
          value: {
            assert: ""
          },
          ASSetProperty: {
            flags: {
              internal: true
            }
          },
          ASSetSlot: {},
          ASSetSuper: {
            scope: {
              assert: ""
            }
          }
        },
        DeleteProperty: {
          object: {
            assert: ""
          },
          name: {
            assert: ""
          },
          ASDeleteProperty: {}
        },
        ASFindProperty: {
          scope: {
            assert: ""
          },
          name: {
            assert: ""
          },
          domain: {
            assert: ""
          },
          strict: {
            internal: true
          }
        }
      },
      Store: {},
      Phi: {
        control: {
          assert: "isControl",
          nullable: true
        },
        args: {
          array: true,
          expand: "value"
        }
      },
      Variable: {
        name: {
          internal: true
        }
      },
      Copy: {
        argument: {}
      },
      Move: {
        to: {},
        from: {}
      },
      Projection: {
        argument: {},
        type: {
          internal: true
        },
        selector: {
          internal: true,
          optional: true
        }
      },
      Latch: {
        control: {
          assert: "isControlOrNull",
          nullable: true
        },
        condition: {},
        left: {},
        right: {}
      },
      Binary: {
        operator: {
          internal: true
        },
        left: {},
        right: {}
      },
      Unary: {
        operator: {
          internal: true
        },
        argument: {}
      },
      Constant: {
        value: {
          internal: true
        }
      },
      GlobalProperty: {
        name: {
          internal: true
        }
      },
      This: {
        control: {
          assert: "isControl"
        }
      },
      Throw: {
        control: {
          assert: "isControl"
        },
        argument: {}
      },
      Arguments: {
        control: {
          assert: "isControl"
        }
      },
      Parameter: {
        control: {
          assert: "isControl"
        },
        index: {
          internal: true
        },
        name: {
          internal: true
        }
      },
      NewArray: {
        control: {
          assert: "isControl"
        },
        elements: {
          array: true
        }
      },
      NewObject: {
        control: {
          assert: "isControl"
        },
        properties: {
          array: true
        }
      },
      KeyValuePair: {
        key: {},
        value: {}
      },
      ASScope: {
        parent: {},
        object: {},
        isWith: {
          internal: true
        }
      },
      ASGlobal: {
        control: {
          assert: "isControlOrNull",
          nullable: true
        },
        scope: {
          assert: "isScope"
        }
      },
      ASNewActivation: {
        methodInfo: {
          internal: true
        }
      },
      ASMultiname: {
        namespaces: {},
        name: {},
        flags: {
          internal: true
        }
      }
    }
  };

  function IRGenerator(root) {
    var str = "";
    function out(s) {
      str += s + "\n";
    }
    var writer = new IndentingWriter(false, out);
    function makeProperties(node) {
      var result = [];
      for (var k in node) {
        if (isProperty(k)) {
          node[k].name = k;
          result.push(node[k]);
        }
      }
      return result;
    }
    function isProperty(v) {
      if (v[0] === "_") {
        return false;
      }
      return v[0].toLowerCase() === v[0];
    }
    function generate(node, path) {
      path = path.concat([node]);
      // print(path.map(function (node) { return node._name; }).join(" -> "));
      writer.enter("var " + node._name + " = (function () {")
      var constructorName = node._name[0].toLowerCase() + node._name.slice(1) + "Node";
      if (constructorName.substring(0, 2) === "aS") {
        constructorName = "as" + constructorName.substring(2);
      }
      // var constructorName = "constructor";
      var prototypeName = constructorName + ".prototype";
      var properties = path.reduce(function (a, v) {
        return a.concat(makeProperties(v));
      }, []);
      var parameters = properties.filter(function (property) {
        return !property.dynamic;
      });
      var optionalParameters = parameters.filter(function (property) {
        return property.optional;
      });
      var parameterString = parameters.map(function (property) {
        if (property.expand) {
          return property.expand;
        }
        return property.name;
      }).join(", ");
      writer.enter("function " + constructorName + "(" + parameterString + ") {");
      if (true) {
        properties.forEach(function (property) {
          if (property.assert === "") {
            writer.writeLn("release || assert (!(" + property.name + " == undefined), \"" + property.name + "\");");
          } else if (property.assert) {
            writer.writeLn("release || assert (" + property.assert + "(" + property.name + "), \"" + property.name + "\");");
          }
        });
        writer.writeLn("release || assert (arguments.length >= " + (parameters.length - optionalParameters.length) + ", \"" + node._name + " not enough args.\");");
      }
      if (node._constructorText) {
        writer.writeLn(node._constructorText);
      }
      properties.forEach(function (property) {
        if (property.expand) {
          writer.writeLn("this." + property.name + " = " + property.expand + " ? [" + property.expand + "] : [];");
        } else if (property.dynamic) {
          writer.writeLn("this." + property.name + " = undefined;");
        } else {
          writer.writeLn("this." + property.name + " = " + property.name + ";");
        }
      });
      writer.writeLn("this.id = nextID[nextID.length - 1] += 1;");
      writer.leave("}");
      if (path.length > 1) {
        writer.writeLn(prototypeName + " = " + "extend(" + path[path.length - 2]._name + ", \"" + node._name + "\");");
      }

      writer.writeLn(prototypeName + ".nodeName = \"" + node._name + "\";");
      // writer.writeLn(prototypeName + ".is" + node.name + " = true;");

      writer.enter(prototypeName + ".visitInputs = function (visitor) {");
      properties.forEach(function (property) {
        if (property.internal) {
          return;
        }
        var str = "";
        if (property.nullable) {
          str += "this." + property.name + " && ";
        }
        if (property.array) {
          str += "visitArrayInputs(this." + property.name + ", visitor);";
        } else {
          str += "visitor(this." + property.name + ");";
        }
        writer.writeLn(str);
      });
      writer.leave("};");

      writer.writeLn("return " + constructorName + ";");
      writer.leave("})();");
      writer.writeLn("");
      for (var name in node) {
        if (name[0] === "_" || isProperty(name)) {
          continue;
        }
        var child = node[name];
        child._name = name;
        generate(child, path);
      }
    }
    IRDefinition._name = "Node";
    generate(IRDefinition, []);
    return str;
  }

  var nextID = [];

  // print(IRGenerator(IR));
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  var Node = (function () {
    function nodeNode() {
      release || assert (arguments.length >= 0, "Node not enough args.");
      this.id = nextID[nextID.length - 1] += 1;
    }
    nodeNode.prototype.nodeName = "Node";
    nodeNode.prototype.visitInputs = function (visitor) {
    };
    return nodeNode;
  })();

  var Control = (function () {
    function controlNode() {
      release || assert (arguments.length >= 0, "Control not enough args.");
      this.id = nextID[nextID.length - 1] += 1;
    }
    controlNode.prototype = extend(Node, "Control");
    controlNode.prototype.nodeName = "Control";
    controlNode.prototype.visitInputs = function (visitor) {
    };
    return controlNode;
  })();

  var Region = (function () {
    function regionNode(control) {
      release || assert (arguments.length >= 1, "Region not enough args.");
      this.predecessors = control ? [control] : [];
      this.id = nextID[nextID.length - 1] += 1;
    }
    regionNode.prototype = extend(Control, "Region");
    regionNode.prototype.nodeName = "Region";
    regionNode.prototype.visitInputs = function (visitor) {
      visitArrayInputs(this.predecessors, visitor);
    };
    return regionNode;
  })();

  var Start = (function () {
    function startNode(control) {
      release || assert (arguments.length >= 1, "Start not enough args.");
      this.control = this;
      this.predecessors = control ? [control] : [];
      this.scope = undefined;
      this.domain = undefined;
      this.id = nextID[nextID.length - 1] += 1;
    }
    startNode.prototype = extend(Region, "Start");
    startNode.prototype.nodeName = "Start";
    startNode.prototype.visitInputs = function (visitor) {
      visitArrayInputs(this.predecessors, visitor);
      visitor(this.scope);
      visitor(this.domain);
    };
    return startNode;
  })();

  var End = (function () {
    function endNode(control) {
      release || assert (isControlOrNull(control), "control");
      release || assert (arguments.length >= 1, "End not enough args.");
      this.control = control;
      this.id = nextID[nextID.length - 1] += 1;
    }
    endNode.prototype = extend(Control, "End");
    endNode.prototype.nodeName = "End";
    endNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
    };
    return endNode;
  })();

  var Stop = (function () {
    function stopNode(control, store, argument) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStore(store), "store");
      release || assert (!(argument == undefined), "argument");
      release || assert (arguments.length >= 3, "Stop not enough args.");
      this.control = control;
      this.store = store;
      this.argument = argument;
      this.id = nextID[nextID.length - 1] += 1;
    }
    stopNode.prototype = extend(End, "Stop");
    stopNode.prototype.nodeName = "Stop";
    stopNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
      visitor(this.store);
      visitor(this.argument);
    };
    return stopNode;
  })();

  var If = (function () {
    function ifNode(control, predicate) {
      release || assert (isControlOrNull(control), "control");
      release || assert (!(predicate == undefined), "predicate");
      release || assert (arguments.length >= 2, "If not enough args.");
      this.control = control;
      this.predicate = predicate;
      this.id = nextID[nextID.length - 1] += 1;
    }
    ifNode.prototype = extend(End, "If");
    ifNode.prototype.nodeName = "If";
    ifNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
      visitor(this.predicate);
    };
    return ifNode;
  })();

  var Switch = (function () {
    function switchNode(control, determinant) {
      release || assert (isControlOrNull(control), "control");
      release || assert (!(determinant == undefined), "determinant");
      release || assert (arguments.length >= 2, "Switch not enough args.");
      this.control = control;
      this.determinant = determinant;
      this.id = nextID[nextID.length - 1] += 1;
    }
    switchNode.prototype = extend(End, "Switch");
    switchNode.prototype.nodeName = "Switch";
    switchNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
      visitor(this.determinant);
    };
    return switchNode;
  })();

  var Jump = (function () {
    function jumpNode(control) {
      release || assert (isControlOrNull(control), "control");
      release || assert (arguments.length >= 1, "Jump not enough args.");
      this.control = control;
      this.id = nextID[nextID.length - 1] += 1;
    }
    jumpNode.prototype = extend(End, "Jump");
    jumpNode.prototype.nodeName = "Jump";
    jumpNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
    };
    return jumpNode;
  })();

  var Value = (function () {
    function valueNode() {
      release || assert (arguments.length >= 0, "Value not enough args.");
      this.id = nextID[nextID.length - 1] += 1;
    }
    valueNode.prototype = extend(Node, "Value");
    valueNode.prototype.nodeName = "Value";
    valueNode.prototype.visitInputs = function (visitor) {
    };
    return valueNode;
  })();

  var StoreDependent = (function () {
    function storeDependentNode(control, store) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (arguments.length >= 2, "StoreDependent not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.id = nextID[nextID.length - 1] += 1;
    }
    storeDependentNode.prototype = extend(Value, "StoreDependent");
    storeDependentNode.prototype.nodeName = "StoreDependent";
    storeDependentNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
    };
    return storeDependentNode;
  })();

  var Call = (function () {
    function callNode(control, store, callee, object, args, flags) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(callee == undefined), "callee");
      release || assert (isValueOrNull(object), "object");
      release || assert (isArray(args), "args");
      release || assert (isNumber(flags), "flags");
      release || assert (arguments.length >= 6, "Call not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.callee = callee;
      this.object = object;
      this.args = args;
      this.flags = flags;
      this.id = nextID[nextID.length - 1] += 1;
    }
    callNode.prototype = extend(StoreDependent, "Call");
    callNode.prototype.nodeName = "Call";
    callNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.callee);
      this.object && visitor(this.object);
      visitArrayInputs(this.args, visitor);
    };
    return callNode;
  })();

  var CallProperty = (function () {
    function callPropertyNode(control, store, object, name, args, flags) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (isArray(args), "args");
      release || assert (isNumber(flags), "flags");
      release || assert (arguments.length >= 6, "CallProperty not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.args = args;
      this.flags = flags;
      this.id = nextID[nextID.length - 1] += 1;
    }
    callPropertyNode.prototype = extend(StoreDependent, "CallProperty");
    callPropertyNode.prototype.nodeName = "CallProperty";
    callPropertyNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
      visitArrayInputs(this.args, visitor);
    };
    return callPropertyNode;
  })();

  var ASCallProperty = (function () {
    function asCallPropertyNode(control, store, object, name, args, flags, isLex) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (isArray(args), "args");
      release || assert (isNumber(flags), "flags");
      release || assert (!(isLex == undefined), "isLex");
      release || assert (arguments.length >= 7, "ASCallProperty not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.args = args;
      this.flags = flags;
      this.isLex = isLex;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asCallPropertyNode.prototype = extend(CallProperty, "ASCallProperty");
    asCallPropertyNode.prototype.nodeName = "ASCallProperty";
    asCallPropertyNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
      visitArrayInputs(this.args, visitor);
    };
    return asCallPropertyNode;
  })();

  var ASCallSuper = (function () {
    function asCallSuperNode(control, store, object, name, args, flags, scope) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (isArray(args), "args");
      release || assert (isNumber(flags), "flags");
      release || assert (!(scope == undefined), "scope");
      release || assert (arguments.length >= 7, "ASCallSuper not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.args = args;
      this.flags = flags;
      this.scope = scope;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asCallSuperNode.prototype = extend(CallProperty, "ASCallSuper");
    asCallSuperNode.prototype.nodeName = "ASCallSuper";
    asCallSuperNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
      visitArrayInputs(this.args, visitor);
      visitor(this.scope);
    };
    return asCallSuperNode;
  })();

  var New = (function () {
    function newNode(control, store, callee, args) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(callee == undefined), "callee");
      release || assert (!(args == undefined), "args");
      release || assert (arguments.length >= 4, "New not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.callee = callee;
      this.args = args;
      this.id = nextID[nextID.length - 1] += 1;
    }
    newNode.prototype = extend(StoreDependent, "New");
    newNode.prototype.nodeName = "New";
    newNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.callee);
      visitArrayInputs(this.args, visitor);
    };
    return newNode;
  })();

  var ASNew = (function () {
    function asNewNode(control, store, callee, args) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(callee == undefined), "callee");
      release || assert (!(args == undefined), "args");
      release || assert (arguments.length >= 4, "ASNew not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.callee = callee;
      this.args = args;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asNewNode.prototype = extend(New, "ASNew");
    asNewNode.prototype.nodeName = "ASNew";
    asNewNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.callee);
      visitArrayInputs(this.args, visitor);
    };
    return asNewNode;
  })();

  var GetProperty = (function () {
    function getPropertyNode(control, store, object, name) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (arguments.length >= 4, "GetProperty not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.id = nextID[nextID.length - 1] += 1;
    }
    getPropertyNode.prototype = extend(StoreDependent, "GetProperty");
    getPropertyNode.prototype.nodeName = "GetProperty";
    getPropertyNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
    };
    return getPropertyNode;
  })();

  var ASGetProperty = (function () {
    function asGetPropertyNode(control, store, object, name, flags) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (isNumber(flags), "flags");
      release || assert (arguments.length >= 5, "ASGetProperty not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.flags = flags;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asGetPropertyNode.prototype = extend(GetProperty, "ASGetProperty");
    asGetPropertyNode.prototype.nodeName = "ASGetProperty";
    asGetPropertyNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
    };
    return asGetPropertyNode;
  })();

  var ASGetDescendants = (function () {
    function asGetDescendantsNode(control, store, object, name) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (arguments.length >= 4, "ASGetDescendants not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asGetDescendantsNode.prototype = extend(GetProperty, "ASGetDescendants");
    asGetDescendantsNode.prototype.nodeName = "ASGetDescendants";
    asGetDescendantsNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
    };
    return asGetDescendantsNode;
  })();

  var ASHasProperty = (function () {
    function asHasPropertyNode(control, store, object, name) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (arguments.length >= 4, "ASHasProperty not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asHasPropertyNode.prototype = extend(GetProperty, "ASHasProperty");
    asHasPropertyNode.prototype.nodeName = "ASHasProperty";
    asHasPropertyNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
    };
    return asHasPropertyNode;
  })();

  var ASGetSlot = (function () {
    function asGetSlotNode(control, store, object, name) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (arguments.length >= 4, "ASGetSlot not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asGetSlotNode.prototype = extend(GetProperty, "ASGetSlot");
    asGetSlotNode.prototype.nodeName = "ASGetSlot";
    asGetSlotNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
    };
    return asGetSlotNode;
  })();

  var ASGetSuper = (function () {
    function asGetSuperNode(control, store, object, name, scope) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (!(scope == undefined), "scope");
      release || assert (arguments.length >= 5, "ASGetSuper not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.scope = scope;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asGetSuperNode.prototype = extend(GetProperty, "ASGetSuper");
    asGetSuperNode.prototype.nodeName = "ASGetSuper";
    asGetSuperNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
      visitor(this.scope);
    };
    return asGetSuperNode;
  })();

  var SetProperty = (function () {
    function setPropertyNode(control, store, object, name, value) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (!(value == undefined), "value");
      release || assert (arguments.length >= 5, "SetProperty not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.value = value;
      this.id = nextID[nextID.length - 1] += 1;
    }
    setPropertyNode.prototype = extend(StoreDependent, "SetProperty");
    setPropertyNode.prototype.nodeName = "SetProperty";
    setPropertyNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
      visitor(this.value);
    };
    return setPropertyNode;
  })();

  var ASSetProperty = (function () {
    function asSetPropertyNode(control, store, object, name, value, flags) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (!(value == undefined), "value");
      release || assert (arguments.length >= 6, "ASSetProperty not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.value = value;
      this.flags = flags;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asSetPropertyNode.prototype = extend(SetProperty, "ASSetProperty");
    asSetPropertyNode.prototype.nodeName = "ASSetProperty";
    asSetPropertyNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
      visitor(this.value);
    };
    return asSetPropertyNode;
  })();

  var ASSetSlot = (function () {
    function asSetSlotNode(control, store, object, name, value) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (!(value == undefined), "value");
      release || assert (arguments.length >= 5, "ASSetSlot not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.value = value;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asSetSlotNode.prototype = extend(SetProperty, "ASSetSlot");
    asSetSlotNode.prototype.nodeName = "ASSetSlot";
    asSetSlotNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
      visitor(this.value);
    };
    return asSetSlotNode;
  })();

  var ASSetSuper = (function () {
    function asSetSuperNode(control, store, object, name, value, scope) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (!(value == undefined), "value");
      release || assert (!(scope == undefined), "scope");
      release || assert (arguments.length >= 6, "ASSetSuper not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.value = value;
      this.scope = scope;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asSetSuperNode.prototype = extend(SetProperty, "ASSetSuper");
    asSetSuperNode.prototype.nodeName = "ASSetSuper";
    asSetSuperNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
      visitor(this.value);
      visitor(this.scope);
    };
    return asSetSuperNode;
  })();

  var DeleteProperty = (function () {
    function deletePropertyNode(control, store, object, name) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (arguments.length >= 4, "DeleteProperty not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.id = nextID[nextID.length - 1] += 1;
    }
    deletePropertyNode.prototype = extend(StoreDependent, "DeleteProperty");
    deletePropertyNode.prototype.nodeName = "DeleteProperty";
    deletePropertyNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
    };
    return deletePropertyNode;
  })();

  var ASDeleteProperty = (function () {
    function asDeletePropertyNode(control, store, object, name) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(object == undefined), "object");
      release || assert (!(name == undefined), "name");
      release || assert (arguments.length >= 4, "ASDeleteProperty not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.object = object;
      this.name = name;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asDeletePropertyNode.prototype = extend(DeleteProperty, "ASDeleteProperty");
    asDeletePropertyNode.prototype.nodeName = "ASDeleteProperty";
    asDeletePropertyNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
    };
    return asDeletePropertyNode;
  })();

  var ASFindProperty = (function () {
    function asFindPropertyNode(control, store, scope, name, domain, strict) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isStoreOrNull(store), "store");
      release || assert (!(scope == undefined), "scope");
      release || assert (!(name == undefined), "name");
      release || assert (!(domain == undefined), "domain");
      release || assert (arguments.length >= 6, "ASFindProperty not enough args.");
      this.control = control;
      this.store = store;
      this.loads = undefined;
      this.scope = scope;
      this.name = name;
      this.domain = domain;
      this.strict = strict;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asFindPropertyNode.prototype = extend(StoreDependent, "ASFindProperty");
    asFindPropertyNode.prototype.nodeName = "ASFindProperty";
    asFindPropertyNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.scope);
      visitor(this.name);
      visitor(this.domain);
    };
    return asFindPropertyNode;
  })();

  var Store = (function () {
    function storeNode() {
      release || assert (arguments.length >= 0, "Store not enough args.");
      this.id = nextID[nextID.length - 1] += 1;
    }
    storeNode.prototype = extend(Value, "Store");
    storeNode.prototype.nodeName = "Store";
    storeNode.prototype.visitInputs = function (visitor) {
    };
    return storeNode;
  })();

  var Phi = (function () {
    function phiNode(control, value) {
      release || assert (isControl(control), "control");
      release || assert (arguments.length >= 2, "Phi not enough args.");
      this.control = control;
      this.args = value ? [value] : [];
      this.id = nextID[nextID.length - 1] += 1;
    }
    phiNode.prototype = extend(Value, "Phi");
    phiNode.prototype.nodeName = "Phi";
    phiNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      visitArrayInputs(this.args, visitor);
    };
    return phiNode;
  })();

  var Variable = (function () {
    function variableNode(name) {
      release || assert (arguments.length >= 1, "Variable not enough args.");
      this.name = name;
      this.id = nextID[nextID.length - 1] += 1;
    }
    variableNode.prototype = extend(Value, "Variable");
    variableNode.prototype.nodeName = "Variable";
    variableNode.prototype.visitInputs = function (visitor) {
    };
    return variableNode;
  })();

  var Copy = (function () {
    function copyNode(argument) {
      release || assert (arguments.length >= 1, "Copy not enough args.");
      this.argument = argument;
      this.id = nextID[nextID.length - 1] += 1;
    }
    copyNode.prototype = extend(Value, "Copy");
    copyNode.prototype.nodeName = "Copy";
    copyNode.prototype.visitInputs = function (visitor) {
      visitor(this.argument);
    };
    return copyNode;
  })();

  var Move = (function () {
    function moveNode(to, from) {
      release || assert (arguments.length >= 2, "Move not enough args.");
      this.to = to;
      this.from = from;
      this.id = nextID[nextID.length - 1] += 1;
    }
    moveNode.prototype = extend(Value, "Move");
    moveNode.prototype.nodeName = "Move";
    moveNode.prototype.visitInputs = function (visitor) {
      visitor(this.to);
      visitor(this.from);
    };
    return moveNode;
  })();

  var Projection = (function () {
    function projectionNode(argument, type, selector) {
      release || assert (arguments.length >= 2, "Projection not enough args.");
      this.argument = argument;
      this.type = type;
      this.selector = selector;
      this.id = nextID[nextID.length - 1] += 1;
    }
    projectionNode.prototype = extend(Value, "Projection");
    projectionNode.prototype.nodeName = "Projection";
    projectionNode.prototype.visitInputs = function (visitor) {
      visitor(this.argument);
    };
    return projectionNode;
  })();

  var Latch = (function () {
    function latchNode(control, condition, left, right) {
      release || assert (isControlOrNull(control), "control");
      release || assert (arguments.length >= 4, "Latch not enough args.");
      this.control = control;
      this.condition = condition;
      this.left = left;
      this.right = right;
      this.id = nextID[nextID.length - 1] += 1;
    }
    latchNode.prototype = extend(Value, "Latch");
    latchNode.prototype.nodeName = "Latch";
    latchNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      visitor(this.condition);
      visitor(this.left);
      visitor(this.right);
    };
    return latchNode;
  })();

  var Binary = (function () {
    function binaryNode(operator, left, right) {
      release || assert (arguments.length >= 3, "Binary not enough args.");
      this.operator = operator;
      this.left = left;
      this.right = right;
      this.id = nextID[nextID.length - 1] += 1;
    }
    binaryNode.prototype = extend(Value, "Binary");
    binaryNode.prototype.nodeName = "Binary";
    binaryNode.prototype.visitInputs = function (visitor) {
      visitor(this.left);
      visitor(this.right);
    };
    return binaryNode;
  })();

  var Unary = (function () {
    function unaryNode(operator, argument) {
      release || assert (arguments.length >= 2, "Unary not enough args.");
      this.operator = operator;
      this.argument = argument;
      this.id = nextID[nextID.length - 1] += 1;
    }
    unaryNode.prototype = extend(Value, "Unary");
    unaryNode.prototype.nodeName = "Unary";
    unaryNode.prototype.visitInputs = function (visitor) {
      visitor(this.argument);
    };
    return unaryNode;
  })();

  var Constant = (function () {
    function constantNode(value) {
      release || assert (arguments.length >= 1, "Constant not enough args.");
      this.value = value;
      this.id = nextID[nextID.length - 1] += 1;
    }
    constantNode.prototype = extend(Value, "Constant");
    constantNode.prototype.nodeName = "Constant";
    constantNode.prototype.visitInputs = function (visitor) {
    };
    return constantNode;
  })();

  var GlobalProperty = (function () {
    function globalPropertyNode(name) {
      release || assert (arguments.length >= 1, "GlobalProperty not enough args.");
      this.name = name;
      this.id = nextID[nextID.length - 1] += 1;
    }
    globalPropertyNode.prototype = extend(Value, "GlobalProperty");
    globalPropertyNode.prototype.nodeName = "GlobalProperty";
    globalPropertyNode.prototype.visitInputs = function (visitor) {
    };
    return globalPropertyNode;
  })();

  var This = (function () {
    function thisNode(control) {
      release || assert (isControl(control), "control");
      release || assert (arguments.length >= 1, "This not enough args.");
      this.control = control;
      this.id = nextID[nextID.length - 1] += 1;
    }
    thisNode.prototype = extend(Value, "This");
    thisNode.prototype.nodeName = "This";
    thisNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
    };
    return thisNode;
  })();

  var Throw = (function () {
    function throwNode(control, argument) {
      release || assert (isControl(control), "control");
      release || assert (arguments.length >= 2, "Throw not enough args.");
      this.control = control;
      this.argument = argument;
      this.id = nextID[nextID.length - 1] += 1;
    }
    throwNode.prototype = extend(Value, "Throw");
    throwNode.prototype.nodeName = "Throw";
    throwNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
      visitor(this.argument);
    };
    return throwNode;
  })();

  var Arguments = (function () {
    function argumentsNode(control) {
      release || assert (isControl(control), "control");
      release || assert (arguments.length >= 1, "Arguments not enough args.");
      this.control = control;
      this.id = nextID[nextID.length - 1] += 1;
    }
    argumentsNode.prototype = extend(Value, "Arguments");
    argumentsNode.prototype.nodeName = "Arguments";
    argumentsNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
    };
    return argumentsNode;
  })();

  var Parameter = (function () {
    function parameterNode(control, index, name) {
      release || assert (isControl(control), "control");
      release || assert (arguments.length >= 3, "Parameter not enough args.");
      this.control = control;
      this.index = index;
      this.name = name;
      this.id = nextID[nextID.length - 1] += 1;
    }
    parameterNode.prototype = extend(Value, "Parameter");
    parameterNode.prototype.nodeName = "Parameter";
    parameterNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
    };
    return parameterNode;
  })();

  var NewArray = (function () {
    function newArrayNode(control, elements) {
      release || assert (isControl(control), "control");
      release || assert (arguments.length >= 2, "NewArray not enough args.");
      this.control = control;
      this.elements = elements;
      this.id = nextID[nextID.length - 1] += 1;
    }
    newArrayNode.prototype = extend(Value, "NewArray");
    newArrayNode.prototype.nodeName = "NewArray";
    newArrayNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
      visitArrayInputs(this.elements, visitor);
    };
    return newArrayNode;
  })();

  var NewObject = (function () {
    function newObjectNode(control, properties) {
      release || assert (isControl(control), "control");
      release || assert (arguments.length >= 2, "NewObject not enough args.");
      this.control = control;
      this.properties = properties;
      this.id = nextID[nextID.length - 1] += 1;
    }
    newObjectNode.prototype = extend(Value, "NewObject");
    newObjectNode.prototype.nodeName = "NewObject";
    newObjectNode.prototype.visitInputs = function (visitor) {
      visitor(this.control);
      visitArrayInputs(this.properties, visitor);
    };
    return newObjectNode;
  })();

  var KeyValuePair = (function () {
    function keyValuePairNode(key, value) {
      release || assert (arguments.length >= 2, "KeyValuePair not enough args.");
      this.key = key;
      this.value = value;
      this.id = nextID[nextID.length - 1] += 1;
    }
    keyValuePairNode.prototype = extend(Value, "KeyValuePair");
    keyValuePairNode.prototype.nodeName = "KeyValuePair";
    keyValuePairNode.prototype.visitInputs = function (visitor) {
      visitor(this.key);
      visitor(this.value);
    };
    return keyValuePairNode;
  })();

  var ASScope = (function () {
    function asScopeNode(parent, object, isWith) {
      release || assert (arguments.length >= 3, "ASScope not enough args.");
      this.parent = parent;
      this.object = object;
      this.isWith = isWith;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asScopeNode.prototype = extend(Value, "ASScope");
    asScopeNode.prototype.nodeName = "ASScope";
    asScopeNode.prototype.visitInputs = function (visitor) {
      visitor(this.parent);
      visitor(this.object);
    };
    return asScopeNode;
  })();

  var ASGlobal = (function () {
    function asGlobalNode(control, scope) {
      release || assert (isControlOrNull(control), "control");
      release || assert (isScope(scope), "scope");
      release || assert (arguments.length >= 2, "ASGlobal not enough args.");
      this.control = control;
      this.scope = scope;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asGlobalNode.prototype = extend(Value, "ASGlobal");
    asGlobalNode.prototype.nodeName = "ASGlobal";
    asGlobalNode.prototype.visitInputs = function (visitor) {
      this.control && visitor(this.control);
      visitor(this.scope);
    };
    return asGlobalNode;
  })();

  var ASNewActivation = (function () {
    function asNewActivationNode(methodInfo) {
      release || assert (arguments.length >= 1, "ASNewActivation not enough args.");
      this.methodInfo = methodInfo;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asNewActivationNode.prototype = extend(Value, "ASNewActivation");
    asNewActivationNode.prototype.nodeName = "ASNewActivation";
    asNewActivationNode.prototype.visitInputs = function (visitor) {
    };
    return asNewActivationNode;
  })();

  var ASMultiname = (function () {
    function asMultinameNode(namespaces, name, flags) {
      release || assert (arguments.length >= 3, "ASMultiname not enough args.");
      this.namespaces = namespaces;
      this.name = name;
      this.flags = flags;
      this.id = nextID[nextID.length - 1] += 1;
    }
    asMultinameNode.prototype = extend(Value, "ASMultiname");
    asMultinameNode.prototype.nodeName = "ASMultiname";
    asMultinameNode.prototype.visitInputs = function (visitor) {
      visitor(this.namespaces);
      visitor(this.name);
    };
    return asMultinameNode;
  })();
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  function node() {
    this.id = nextID[nextID.length - 1] += 1;
  }

  Node.startNumbering = function () {
    nextID.push(0);
  };

  Node.stopNumbering = function () {
    nextID.pop();
  };

  Node.prototype.toString = function (brief) {
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

  Node.prototype.visitInputsNoConstants = function visitInputs(visitor) {
    this.visitInputs(function (node) {
      if (isConstant(node)) {
        return;
      }
      visitor(node);
    });
  };

  Node.prototype.replaceInput = function(oldInput, newInput) {
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

  Projection.Type = {
    CASE: "case",
    TRUE: "true",
    FALSE: "false",
    STORE: "store",
    SCOPE: "scope"
  };

  Projection.prototype.project = function () {
    return this.argument;
  };

  Phi.prototype.seal = function seal() {
    this.sealed = true;
  };

  Phi.prototype.pushValue = function pushValue(x) {
    release || assert (isValue(x));
    release || assert (!this.sealed);
    this.args.push(x);
  };

  KeyValuePair.prototype.mustFloat = true;
  ASMultiname.prototype.mustFloat = true;
  ASMultiname.prototype.isAttribute = function () {
    return this.flags & 0x01;
  };

  var Flags = {
    INDEXED: 0x01,
    RESOLVED: 0x02,
    PRISTINE: 0x04,
    IS_METHOD: 0x08
  };

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

    operator.AS_ADD = new operator("+", function (l, r) {
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
    release || assert (c);
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

  function visitArrayInputs(array, visitor) {
    for (var i = 0; i < array.length; i++) {
      visitor(array[i]);
    }
  }

  function visitNothing() {

  }

  function isNotPhi(phi) {
    return !isPhi(phi);
  }

  function isPhi(phi) {
    return phi instanceof Phi;
  }

  function isScope(scope) {
    return isPhi(scope) || scope instanceof ASScope || isProjection(scope, Projection.Type.SCOPE);
  }

  function isMultinameConstant(node) {
    return node instanceof Constant && node.value instanceof Multiname;
  }

  function isMultiname(name) {
    return isMultinameConstant(name) || name instanceof ASMultiname;
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

  function isControlOrNull(control) {
    return isControl(control) || control === null;
  }

  function isStoreOrNull(store) {
    return isStore(store) || store === null;
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

  function isProjection(node, type) {
    return node instanceof Projection && (!type || node.type === type);
  }

  var Null = new Constant(null);
  var Undefined = new Constant(undefined);

  Undefined.toString = function () {
    return "_";
  };

  var Block = (function () {
    function block(id, start, end) {
      if (start) {
        release || assert (start instanceof Region);
      }
      this.region = start;
      this.id = id;
      this.successors = [];
      this.predecessors = [];
      this.nodes = [start, end];
    }
    block.prototype.pushSuccessorAt = function pushSuccessor(successor, index, pushPredecessor) {
      release || assert (successor);
      release || assert (!this.successors[index]);
      this.successors[index] = successor;
      if (pushPredecessor) {
        successor.pushPredecessor(this);
      }
    };
    block.prototype.pushSuccessor = function pushSuccessor(successor, pushPredecessor) {
      release || assert (successor);
      this.successors.push(successor);
      if (pushPredecessor) {
        successor.pushPredecessor(this);
      }
    };
    block.prototype.pushPredecessor = function pushPredecessor(predecessor) {
      release || assert (predecessor);
      this.predecessors.push(predecessor);
    };
    block.prototype.visitNodes = function (fn) {
      var nodes = this.nodes;
      for (var i = 0, j = nodes.length; i < j; i++) {
        fn(nodes[i]);
      }
    };
    block.prototype.visitSuccessors = function (fn) {
      var successors = this.successors;
      for (var i = 0, j = successors.length; i < j; i++) {
        fn(successors[i]);
      }
    };
    block.prototype.visitPredecessors = function (fn) {
      var predecessors = this.predecessors;
      for (var i = 0, j = predecessors.length; i < j; i++) {
        fn(predecessors[i]);
      }
    };
    block.prototype.append = function (node) {
      release || assert (this.nodes.length >= 2);
      release || assert (isValue(node), node);
      release || assert (isNotPhi(node));
      release || assert (this.nodes.indexOf(node) < 0);
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
      var node;
      while ((node = worklist.pop())) {
        if (visited[node.id] === 1) {
          continue;
        }
        visited[node.id] = 1;
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

    constructor.prototype.forEachInPreOrderDepthFirstSearch = function forEachInPreOrderDepthFirstSearch(visitor) {
      var visited = new Array(1024);
      var worklist = [this.exit];
      function push(node) {
        if (isConstant(node)) {
          return;
        }
        release || assert (node instanceof Node);
        worklist.push(node);
      }
      var node;
      while ((node = worklist.pop())) {
        if (visited[node.id]) {
          continue;
        }
        visited[node.id] = 1;
        visitor && visitor(node);
        worklist.push(node);
        node.visitInputs(push);
      }
    };

    constructor.prototype.forEach = function forEach(visitor, postOrder) {
      var search = postOrder ? postOrderDepthFirstSearch : preOrderDepthFirstSearch;
      search(this.exit, function (node, v) {
        node.visitInputsNoConstants(v);
      }, visitor);
    };

    constructor.prototype.traceMetrics = function (writer) {
      var counter = new metrics.Counter(true);
      preOrderDepthFirstSearch(this.exit, function (node, visitor) {
        node.visitInputsNoConstants(visitor);
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
          node.visitInputsNoConstants(next);
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
        node.visitInputsNoConstants(function (input) {
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

      release || assert (dfg && dfg instanceof DFG);
      cfg.dfg = dfg;

      var visited = [];

      function buildEnd(end) {
        if (end instanceof Projection) {
          end = end.project();
        }
        release || assert (end instanceof End || end instanceof Start, end);
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
            release || assert (isProjection(c, Projection.Type.CASE));
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
      release || assert (!this.root && !this.exit);

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

      release || assert (this.root && this.exit);
      release || assert (this.root !== this.exit);
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

      release || assert (rootName && names[rootName]);
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
      release || assert (this.root.predecessors.length === 0, "Root node ", this.root, " must not have predecessors.");

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
        release || assert (count >= entry.uses.length);
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
        release || assert (count >= entry.uses.length);
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
      Timer.start("computeUses");
      var writer = debug && new IndentingWriter();

      debug && writer.enter("> Compute Uses");
      var dfg = this.dfg;

      var uses = new Uses();

      dfg.forEachInPreOrderDepthFirstSearch(function (use) {
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
      Timer.stop();
      return uses;
    };

    constructor.prototype.verify = function verify() {
      var writer = debug && new IndentingWriter();
      debug && writer.enter("> Verify");

      var order = this.computeReversePostOrder();

      order.forEach(function (block) {
        if (block.phis) {
          block.phis.forEach(function (phi) {
            release || assert (phi.control === block.region);
            release || assert (phi.args.length === block.predecessors.length);
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
        var entryUses = entry.uses;
        for (var i = 0, j = entryUses.length; i < j; i++) {
          count += entryUses[i].replaceInput(def, value);
        }
        release || assert (count >= entry.uses.length);
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
          var value = simplify(phi, phi.args);
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
        release || assert (fromIndex >= 0 && toIndex >= 0);
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
        release || assert (this.splitCriticalEdges() === 0);
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
            var arguments = phi.args;
            release || assert (predecessors.length === arguments.length);
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

      dfg.forEachInPreOrderDepthFirstSearch(function (node) {
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
          node.args.forEach(function (input) {
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

      for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        if (root instanceof Phi) {
          var block = root.control.block;
          (block.phis || (block.phis = [])).push(root);
        }
        if (root.control) {
          schedule(root);
        }
      }

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
      }

      function append(node) {
        release || assert (!isScheduled(node), "Already scheduled " + node);
        scheduled[node.id] = true;
        release || assert (node.control, node);
        if (shouldFloat(node)) {

        } else {
          node.control.block.append(node);
        }
      }

      function scheduleIn(node, region) {
        release || assert (!node.control, node);
        release || assert (!isScheduled(node));
        release || assert (region);
        debugScheduler && writer.writeLn("Scheduled: " + node + " in " + region);
        node.control = region;
        append(node);
      }

      function schedule(node) {
        debugScheduler && writer.enter("> Schedule: " + node);

        var inputs = [];
        // node.checkInputVisitors();
        node.visitInputs(function (input) {
          if (isConstant(input)) {{
            return;
          }}
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
        release || assert (node.control, "Node is not scheduled: " + node);
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
        release || assert (block);
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
      release || assert (node instanceof Unary);
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
      release || assert (node instanceof Binary);
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
  exports.ASGlobal = ASGlobal;
  exports.Projection = Projection;
  exports.Region = Region;
  exports.Latch = Latch;
  exports.Binary = Binary;
  exports.Unary = Unary;
  exports.Constant = Constant;
  exports.ASFindProperty = ASFindProperty;
  exports.GlobalProperty = GlobalProperty;
  exports.GetProperty = GetProperty;
  exports.SetProperty = SetProperty;
  exports.CallProperty = CallProperty;
  exports.ASCallProperty = ASCallProperty;
  exports.ASCallSuper = ASCallSuper;
  exports.ASGetProperty = ASGetProperty;
  exports.ASGetSuper = ASGetSuper;
  exports.ASHasProperty = ASHasProperty;
  exports.ASDeleteProperty = ASDeleteProperty;
  exports.ASGetDescendants = ASGetDescendants;
  exports.ASSetProperty = ASSetProperty;
  exports.ASSetSuper = ASSetSuper;
  exports.ASGetSlot = ASGetSlot;
  exports.ASSetSlot = ASSetSlot;
  exports.Call = Call;
  exports.ASNew = ASNew;
  exports.Phi = Phi;
  exports.Stop = Stop;
  exports.If = If;
  exports.Switch = Switch;
  exports.End = End;
  exports.Jump = Jump;
  exports.ASScope = ASScope;
  exports.Operator = Operator;
  exports.Variable = Variable;
  exports.Move = Move;
  exports.Copy = Copy;
  exports.Parameter = Parameter;
  exports.NewArray = NewArray;
  exports.NewObject = NewObject;
  exports.ASNewActivation = ASNewActivation;
  exports.KeyValuePair = KeyValuePair;
  exports.ASMultiname = ASMultiname;

  exports.DFG = DFG;
  exports.CFG = CFG;
  exports.Flags = Flags;

  exports.PeepholeOptimizer = PeepholeOptimizer;

})(typeof exports === "undefined" ? (IR = {}) : exports);
