var verifierOptions = systemOptions.register(new OptionSet("Verifier Options"));

var Verifier = (function() {

  /**
   * Abstract program state.
   */
  var State = (function() {
    var id = 0;

    function state() {
      this.id = id++;

      // TODO this should be removed or at least the limit should be
      // increased to a bigger number
      if (this.id > 100000) {
        throw new VerifierError("Probably in an infinite loop.");
      }

      this.stack = [];
      this.scope = [];
      this.local = [];
    }
    state.prototype.clone = function clone() {
      var s = new State();
      s.originalId = this.id;
      s.stack = this.stack.slice(0);
      s.scope = this.scope.slice(0);
      s.local = this.local.slice(0);
      return s;
    };
    state.prototype.trace = function trace(writer) {
      writer.writeLn(this.toString());
    };
    state.prototype.toString = function () {
      return "<" + this.id + (this.originalId ? ":" + this.originalId : "") +
             ", L[" + this.local.join(", ") + "]" +
             ", S[" + this.stack.join(", ") + "]" +
             ", $[" + this.scope.join(", ") + "]>";
    };
    state.prototype.equals = function(other) {
      //TODO update this function for Reference types
      if (!arraysEquals(this.stack, other.stack) ||
          !arraysEquals(this.scope, other.scope) ||
          !arraysEquals(this.local, other.local)) {
          return false;
      }
      return true;
    };
    function arraysEquals(a, b) {
      if(a.length != b.length) {
        return false;
      }
      for (var i = a.length - 1; i >= 0; i--) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }
    function mergeArrays(a, b) {
      for (var i = a.length - 1; i >= 0; i--) {
        // TODO: Locals are 'undefined' before setlocal is called;
        // should we initialize them to Atom.Undefined
        if(a[i] && b[i]) {
          a[i] = a[i].merge(b[i]);
        }
      }
    }
    state.prototype.merge = function(other) {
      mergeArrays(this.local, other.local);
      mergeArrays(this.stack, other.stack);
      mergeArrays(this.scope, other.scope);
    };

    return state;
  })();

  function VerifierError(message) {
    this.name = "VerifierError";
    this.message = message || "";
  }

  var RuntimeMultiname = (function () {
    function runtimeMultiname(multiname, namespaces, name) {
      this.multiname = multiname;
      this.namespaces = namespaces;
      this.name = name;
    }
    return runtimeMultiname;
  })();

  function Activation (methodInfo) {
    assert (methodInfo.needsActivation());
    this.methodInfo = methodInfo;
  }

  Activation.prototype.toString = function () {
    return "[Activation]";
  };

  function findTraitBySlotId(traits, slotId) {
    for (var i = traits.length - 1; i >= 0; i--) {
      if (traits[i].slotId === slotId) {
        return traits[i];
      }
    }
    unexpected("Cannot find trait with slotId: " + slotId + " in " + traits);
  }

  /**
   * Finds a trait by multiname.
   * The kind acts only like an arbitrer between getters and setters since
   * thess two have the same multiname and differ only by kind.
   * This means that when |kind === TRAIT_Setter| the getters will be skipped
   * and when |kind === TRAIT_Getter| the setters will be skipped.
   */
  function findTrait(traits, multiname, kind) {
    var trait;
    for (var i = 0, j = multiname.namespaces.length; i < j; i++) {
      var qn = multiname.getQName(i);
      for (var k = 0, l = traits.length; k < l; k++) {
        if (Multiname.getQualifiedName(qn) === Multiname.getQualifiedName(traits[k].name)) {
          if (kind && ((kind === TRAIT_Getter && traits[k].isSetter())
              || (kind === TRAIT_Setter && traits[k].isGetter()))) {
            // skip getters or setters according to the kind
            continue;
          }
          if(!trait) {
            trait = traits[k];
          } else if ((trait.isGetter() && traits[k].isGetter()) || (trait.isSetter() && traits[k].isSetter())) {
            unexpected("Found name " + Multiname.getQualifiedName(qn) + " twice in traits: " + traits);
          }
        }
      }
    }

    return trait;
  }

  function verifier(abc) {
    this.writer = new IndentingWriter();
    this.abc = abc;

    var domain = this.abc.domain;

    var Type = (function () {
      function type(kind, value) {
        this.kind = kind;
        this.value = value;
      }

      type.prototype.toString = function () {
        if (this.value) {
          return this.kind + ": " + this.value;
        }
        return this.kind;
      };

      // Consists of Any, Undefined and Object
      type.Atom = new type("Atom");
      type.Atom.Any = new type("Atom", "Any");
      type.Atom.Undefined = new type("Atom", "Undefined");
      type.Atom.Object = new type("Atom", "Object");

      type.Int = new type("Int");
      type.Uint = new type("Uint");
      type.Boolean = new type("Boolean");
      type.Number = new type("Number");

      // Consists of Null and any sub class of Object
      // type.Reference = new type("Reference");

      function getType(simpleName) {
        var name = Multiname.fromSimpleName(simpleName);
        var type = domain.getProperty(name, false, false);
       // assert (type, "Cannot find type: " + name);
        return type;
      }

      type.fromName = function fromName(name) {
        if (name === undefined) {
          return type.Atom.Undefined;
        } else if (Multiname.getQualifiedName(name) === "public$int") {
          return type.Int;
        } else if (Multiname.getQualifiedName(name) === "public$uint") {
          return type.Uint;
        } else if (Multiname.getQualifiedName(name) === "public$Object") {
          return type.Atom.Object;
        } else if (Multiname.getQualifiedName(name) === "public$Number") {
          return type.Number;
        } else if (name.hasTypeParameter()) { // generic type
          if (Multiname.getQualifiedName(name) === "public$__AS3__$vec$Vector") {
            // return Type.fromReference(new Vector(type.fromName(name.typeParameter)));
            return new Vector(type.classFromName(name.typeParameter));
          }
          // For now only Vectors should have type parameters.
          unexpected();
        }
        var ty = domain.getProperty(name, false, true);
        assert (ty, name + " not found");
        // return type.fromReference(ty);
        return ty;
      };

      type.fromReference = function fromReference(value) {
        // assert(value);
        var ty = new type("Reference");
        ty.value = value;
        return ty;
      };

      type.fromClass = function fromClass(value) {
        // assert(value);
        var ty = new type("Class");
        ty.value = value;
        return ty;
      };

      type.referenceFromName = function referenceFromName(name) {
        var ty = type.fromName(name);
        if (ty instanceof Type) {
          return ty;
        }
        return type.fromReference(ty);
      };

      type.classFromName = function classFromName(name) {
        var ty = type.fromName(name);
        if (ty instanceof Type) {
          return ty;
        }
        return type.fromClass(ty);
      };

      type.Reference = new type("Reference");
      type.Reference.Dynamic = new type("Reference", "Dynamic");
      type.Reference.Null = new type("Reference", null);
      type.Reference.Int = new type("Reference", getType("int"));
      type.Reference.Uint = new type("Reference", getType("uint"));
      type.Reference.Object = new type("Reference", getType("Object"));
      type.Reference.Number = new type("Reference", getType("Number"));
      type.Reference.Vector = new type("Reference", domain.getClass("public __AS3__$vec.Vector"));
      type.Reference.String = new type("Reference", getType("String"));
      type.Reference.Array = new type("Reference", getType("Array"));
      type.Reference.Function = new type("Reference", getType("Function"));


      type.Class = new type("Class");
      type.Class.Int = new type("Class", getType("int"));
      type.Class.Uint = new type("Class", getType("uint"));
      type.Class.Object = new type("Class", getType("Object"));
      type.Class.Number = new type("Class", getType("Number"));
      type.Class.Vector = new type("Class", domain.getClass("public __AS3__$vec.Vector"));
      type.Class.String = new type("Class", getType("String"));
      type.Class.Array = new type("Class", getType("Array"));
      type.Class.Function = new type("Class", getType("Function"));


      type.check = function check(a, b) {
        assert (a.kind === b.kind);
      };

      type.prototype.isNumeric = function isNumeric() {
        return this === type.Number || this === type.Int || this === type.Uint;
      };

      type.prototype.isReference = function isReference() {
        return this.kind === "Reference";
      };

      type.prototype.isClass = function isClass() {
        return this.kind === "Class";
      };

      type.prototype.isVector = function() {
        return this.kind === "Reference" && this.value instanceof Vector;
      };

      type.prototype.getTraitBySlotId = function getTraitBySlotId(slotId) {
        if (this.isReference()) {
          if (this.value instanceof Global) {
            return findTraitBySlotId(this.value.scriptInfo.traits, slotId);
          } else if (this.value instanceof Activation) {
            return findTraitBySlotId(this.value.methodInfo.traits, slotId);
          } else if (this.value instanceof domain.system.Class) {
            // Look into base's calss traits
            var currentClass = this.value;
            var trait = findTraitBySlotId(currentClass.classInfo.instanceInfo.traits, slotId);
            while (!trait && currentClass.baseClass) {
              currentClass = currentClass.baseClass;
              trait = findTraitBySlotId(currentClass.classInfo.instanceInfo.traits, slotId);
            }
            return trait;
          }
        } else if (this.isClass()) {
          return findTraitBySlotId(this.value.classInfo.traits, multiname);
        }

        return null;
      };

      type.prototype.getTraitEnforceGetter = function getTraitEnforceGetter(multiname) {
        return this.getTrait(multiname, TRAIT_Getter);
      }

      type.prototype.getTraitEnforceSetter = function getTraitEnforceSetter(multiname) {
        return this.getTrait(multiname, TRAIT_Setter);
      }

      /**
       * Gets a trait by multiname.
       * The kind acts only like an arbitrer between getters and setters since
       * thess two have the same multiname and differ only by kind.
       * This means that when |kind === TRAIT_Setter| the getters will be skipped
       * and when |kind === TRAIT_Getter| the setters will be skipped.
       */
      type.prototype.getTrait = function getTrait(multiname, kind) {
        if (this.isReference()) {
          if (this.value instanceof Global) {
            return findTrait(this.value.scriptInfo.traits, multiname, kind);
          } else if (this.value instanceof Activation) {
            return findTrait(this.value.methodInfo.traits, multiname, kind);
          } else if (this.value instanceof domain.system.Class) {
            // Look into base's calss traits
            var currentClass = this.value;
            var trait = findTrait(currentClass.classInfo.instanceInfo.traits, multiname, kind);
            while (!trait && currentClass.baseClass) {
              currentClass = currentClass.baseClass;
              trait = findTrait(currentClass.classInfo.instanceInfo.traits, multiname, kind);
            }
            return trait;
          }
        } else if (this.isClass()) {
          return findTrait(this.value.classInfo.traits, multiname, kind);
        }
        return null;
      };

      type.prototype.merge = function(other) {
        // TODO: Merging Atom.Undefined and Atom.Any bellow is a hack to
        // circumvent the fact that the verifier's type hierrchy doesn't
        // form a semilatice and solve the incompatible types merge situations
        if (this === other) {
          return this;
        } else if (this.kind === "Atom" || other.kind === "Atom") {
          return type.Atom;
        } else if (this.kind === "Reference" && other.kind === "Reference") {
          if (this.isVector() && other.isVector()) {
            // Merge Vector
            if (this.value.equals(other.value)) {
              return this;
            }
          }
          // TODO: Actually merge reference types.
          return type.Reference.Null;
        } else if ((this === Type.Int && other.kind === "Reference") ||
                   (this.kind === "Reference" && other === Type.Int)) {
          return Type.Atom.Any;
        } else if ((this === Type.Boolean && other.kind === "Reference") ||
                   (this.kind === "Reference" && other === Type.Boolean)) {
          return Type.Atom.Any;
        } else if ((this === Type.Int && other === Type.Boolean) ||
                   (this === Type.Boolean && other === Type.Int)) {
          return Type.Atom.Any;
        } else if ((this === Type.Int && other === Type.Number) ||
                   (this === Type.Number && other === Type.Int)) {
          return type.Number;
        } else if (this === Type.Atom.Undefined || other === Type.Atom.Undefined) {
          return Type.Atom;
        } else if (this === Type.Atom.Any || other === Type.Atom.Any) {
          return Type.Atom.Any;
        }
        // TODO: Merge vectors
        unexpected("Cannot merge types : " + this + " and " + other);
      };

      return type;
    })();

    function Vector (elementType) {
      this.elementType = elementType;
    }
  
    Vector.prototype.isVectorInt = function() {
      // assert(this.elementType, "Vector's element type is undefined.");
      return this.elementType && this.elementType === Type.Int;
    };
  
    Vector.prototype.isVectorUint = function() {
      // assert(this.elementType, "Vector's element type is undefined.");
      return this.elementType && this.elementType === Type.Uint;
    };

    Vector.prototype.isVectorObject = function() {
      // assert(this.elementType, "Vector's element type is undefined.");
      return this.elementType && this.elementType.isReference();
    };

    // Determine if two vector types are equal
    // The basic rule is that they have the same dimension (1D, 2D, 3D, etc.)
    // and have the same elementType
    Vector.prototype.equals = function (other) {
      if (this.elementType.isVector() && other.elementType.isVector()) {
        return this.value.equals(other.value);
      }
      return this.elementType === other.elementType;
    };

    Vector.prototype.toString = function () {
      return "[Vector<" + this.elementType + ">]";
    };

    this.verification = (function() {
      function verification(verifier, methodInfo, scope) {
        this.scope = scope; // this.scope is the saved scope
        this.verifier = verifier;
        this.methodInfo = methodInfo;
        this.writer = new IndentingWriter();
      }

      verification.prototype.verify = function verify() {
        var mi = this.methodInfo;
        var writer = traceLevel.value <= 1 ? null : this.writer;

        var blocks = mi.analysis.blocks;

        if (writer) {
          this.methodInfo.trace(writer, this.verifier.abc);
        }

        // We can't deal with rest and arguments yet.
        if (mi.needsRest() || mi.needsArguments()) {
          return;
        }

        var entryState = new State();

        assert (mi.localCount >= mi.parameters.length + 1);
        
        // First local is the type of |this|.
        // If the current method is defined inside a class (instance or static) the current class type
        // is in the saved scope's object
        // The instance tratis are inside classInfo.instanceInfo
        // The static tratis are insite classInfo
        assert (this.scope);

        if (mi.holder instanceof ClassInfo) {
          // static method
          entryState.local.push(Type.fromClass(this.scope.object));
        } else if (mi.holder instanceof InstanceInfo) {
          // instance method
          entryState.local.push(Type.fromReference(this.scope.object));
        } else if (mi.holder instanceof ScriptInfo) {
          // function
          entryState.local.push(Type.fromReference(this.scope.global));
        } else {
          entryState.local.push(Type.Atom);
        }

        // Initialize entry state with parameter types.
        for (var i = 0; i < mi.parameters.length; i++) {
          entryState.local.push(Type.referenceFromName(mi.parameters[i].type));
        }

        if (writer) {
          entryState.trace(writer);
        }

        /*
        To avoid revisiting the same block more than necessary while iterating
        to a fixed point, the blocks need to be processed in dominator order.
        The same problem for tamarin is discussed here: https://bugzilla.mozilla.org/show_bug.cgi?id=661133

        The blocks in the mi.analysis.blocks are in the dominator order.
        Iterate over the blocks array and assign an id (bdo = blockDominatorOrder)
        that gives the dominator order for the que insert.
        */
        for (var bi = 0, len = blocks.length; bi < len; bi++) {
          blocks[bi].bdo = bi;
        }

        /*
        Keep the blocks sorted in dominator order.
        The SortedList structure is based on a linked list and uses a liniar search 
        to find the right insertion position and keep the list sorted. 
        The push operation takes O(n), the pull operations takes O(1).
        */
        var worklist = new SortedList(function compare(blockA, blockB) {
          return blockA.bdo - blockB.bdo;
        });

        blocks[0].entryState = entryState;
        worklist.push(blocks[0]);

        while (worklist.peek()) {

          var block = worklist.pop();
          var currEntryState = block.entryState;
          var currExitState = block.exitState = currEntryState.clone();

          // passed state gets mutated so it effectively becomes the exit state
          this.verifyBlock(block, currExitState);

          block.succs.forEach(function (successor) {

            if (worklist.contains(successor)) { // the block is already in the worklist
              if (writer) {
                writer.writeLn("Forward Merged Block: " + successor.bid + " " +
                               currExitState.toString() + " with " + successor.entryState.toString());
              }
              // merge existing item entry state with current block exit state
              successor.entryState.merge(currExitState);
              if (writer) {
                writer.writeLn("Merged State: " + successor.entryState);
              }
              return;
            }

            // backward branch scenario
            if (successor.entryState) { // test wheter the successor was already processed or not
              // if successor processed, but current exit state differs from it's entry state
              // then merge the states and add it in the work list
              if (!successor.entryState.equals(currExitState)) {
                if (writer) {
                  writer.writeLn("Backward Merged Block: " + successor.bid + " " +
                                  currExitState.toString() + " with " + successor.entryState.toString());
                }
                successor.entryState.merge(currExitState);
                worklist.push(successor);

                if (writer) {
                  writer.writeLn("Merged State: " + successor.entryState);
                }
              }
              // if successor processed and current exit state equals with it's entry state
              // then return; there is no need to add it in the work list
              return;
            }

            // add unvisited succesor block to the worklist
            //  it's entry state is current block exit state
            successor.entryState = currExitState.clone();
            worklist.push(successor);
            if (writer) {
              writer.writeLn("Added Block: " + successor.bid +
                             " to worklist: " + successor.entryState.toString());
            }

          });
        }
      };

      verification.prototype.verifyBlock = function verifyBlock(block, state) {
        var savedScope = this.scope;

        var local = state.local;
        var stack = state.stack;
        var scope = state.scope;

        var writer = traceLevel.value <= 1 ? null : this.writer;
        var bytecodes = this.methodInfo.analysis.bytecodes;

        var abc = this.verifier.abc;
        var multinames = abc.constantPool.multinames;
        var mmethods = abc.mmethods;
        var runtime = abc.runtime;

        var obj, objTy, func, mi, multiname, lVal, rVal, val, valTy, factory, type, typeName, name, trait;

        /**
         * Optionally pops a runtime multiname of the stack and stores a |RuntimeMultiname|
         * object in the specified bytecode's |multinameTy| property.
         */
        function popMultiname(bc) {
          var multiname = multinames[bc.index];
          if (multiname.isRuntime()) {
            var namespaces = multiname.namespaces;
            var name = multiname.name;
            if (multiname.isRuntimeName()) {
              // here we actually deal with abstract multinames,
              // i.e. name actually holds the type of the corresponding entity
              name = state.stack.pop();
            }
            if (multiname.isRuntimeNamespace()) {
              namespaces = [state.stack.pop()];
            }
            return bc.multinameTy = new RuntimeMultiname(multiname, namespaces, name);
          } else {
            return multiname;
          }
        }

        function popObject(bc) {
          return bc.objTy = state.stack.pop();
        }

        function popValue(bc) {
          return bc.valTy = state.stack.pop();
        }

        function findProperty(multiname, strict) {

          // |findProperty| should look first into the scope stack and then
          // into the savedScope (which is the scope at the time the method
          // was created). Since we deal with an abstract view of the saved
          // scope stack, we look into saved scope object's traits 

          for (var idx = scope.length - 1; idx >= 0; idx--) {
            var scopeObj = scope[idx];
            if (scopeObj.getTrait(multiname)) {
              return scopeObj;
            }              
          }
          
          // the property was not found in the scope stack, search the saved scope  
          if (savedScope) {
            obj = savedScope.findProperty(multiname, domain, false);

            if (obj instanceof domain.system.Class) {
              return Type.fromClass(obj);
            }
            return Type.fromReference(obj);
          }

          return Type.Atom.Any;
        }

        function getPropertyType(obj, multiname) {
          var type = Type.Atom.Any;

          // |getPropertyType| resolves the type of property with the name specified
          // by the multiname in object.
          
          if (multiname instanceof RuntimeMultiname) {
            type = multiname.name;
          } else if (obj.isReference() || obj.isClass()) { // what about classes?
            if (obj.isVector() && multiname.name instanceof Type && multiname.name.isNumeric()) { // recheck vectors
              type = obj.value.elementType;
            } else {
              // |getTraitEnforceGetter| makes sure that we get the getter, 
              // not the setter, which is required because we need the accessor
              // property type which can be retrieved from getter's return type
              trait = obj.getTraitEnforceGetter(multiname);
              // trait = obj.getTrait(multiname);

              if (trait && trait.isClass()) {
                // If the obj is a verifier Class type we have access
                // to the actual object holding the property, so we can call
                // runtime's |getPropery| function to retrieve the actual value
                // needed in case of a class trait                
                val = getProperty(obj.value, multiname);
                switch (val) {
                  case Type.Class.Int.value:
                    type = Type.Int;
                    break;
                  case Type.Class.Uint.value:
                    type = Type.Uint;
                    break;
                  case Type.Class.Vector.value:
                    type = Type.fromClass(new Vector());
                    break;
                }
              } else if (trait && trait.isSlot()) {
                type = Type.referenceFromName(trait.typeName);
              } else if (trait && trait.isGetter()) {
                type = Type.referenceFromName(trait.methodInfo.returnType);
              } else if (trait === undefined) {
                bc.isDynamicProperty = true;
              }
            }
          }

          return type;
        }

        function resolveTrait(type, multiname) { // TODO replace it with findTrait
          if (type && type.kind === "Reference" && type.value instanceof domain.system.Class) {
            // ...
          }
        }

        function push(v) {
          stack.push(v);
        }

        function pop(type) {
          var v = stack.pop();
          if (type) {
            Type.check(v, type);
          }
          return v;
        }

        function getSlot(type, index) {
          if (type.kind !== "Reference") {
            return Type.Atom;
          }
          var traits;
          if (type.value instanceof Global) {
            traits = type.value.scriptInfo.traits;
          } else if (type.value instanceof Activation) {
            traits = type.value.methodInfo.traits;
          }
          assert (traits);
          var trait = findTraitBySlotId(traits, index);

          if (trait.isClass()) {
            return Type.classFromName(trait.name);
          }

          return Type.referenceFromName(trait.typeName);
        }

        if (writer) {
          writer.enter("verifyBlock: " + block.bid +
                       ", range: [" + block.position + ", " + block.end.position +
                       "], entryState: " + state.toString() + " {");
        }

        for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
          var bc = bytecodes[bci];
          var op = bc.op;

          switch (op) {
          case OP_bkpt:
            // Nop.
            break;
          case OP_throw:
            pop();
            break;
          case OP_getsuper:
            notImplemented(bc);
            break;
          case OP_setsuper:
            notImplemented(bc);
            break;
          case OP_dxns:
            notImplemented(bc);
            break;
          case OP_dxnslate:
            notImplemented(bc);
            break;
          case OP_kill:
            state.local[bc.index] = Type.Atom.Undefined;
            break;
          case OP_lf32x4:
            notImplemented(bc);
            break;
          case OP_sf32x4:
            notImplemented(bc);
            break;
          case OP_ifnlt:
          case OP_ifge:
          case OP_ifnle:
          case OP_ifgt:
          case OP_ifngt:
          case OP_ifle:
          case OP_ifnge:
          case OP_iflt:
          case OP_ifeq:
          case OP_ifne:
          case OP_ifstricteq:
          case OP_ifstrictne:
            pop();
            pop();
            break;
          case OP_jump:
            // Nop.
            break;
          case OP_iftrue:
          case OP_iffalse:
            pop();
            break;
          case OP_lookupswitch:
            pop(Type.int);
            break;
          case OP_popscope:
            scope.pop();
            break;
          case OP_nextname:
          case OP_nextvalue:
            pop(Type.Int);
            pop();
            push(Type.Atom.Any);
            break;
          case OP_hasnext:
            notImplemented(bc);
            break;
          case OP_hasnext2:
            // FIXME: Line commented out to fix tests/tamarin/as3/Statements/e12_6_3_12.abc.
            // By inspecting the tamaring source it seems that local[bc.object] does not
            // always have to be a reference, however this should be reverted after the
            // type semi lattice gets a proper implementation; then a reference will be a
            // subtype of Atom.Any.
            // Type.check(local[bc.object], Type.Reference);
            Type.check(local[bc.index], Type.Int);
            push(Type.Boolean);
            break;
          case OP_pushnull:
            push(Type.Reference.Null);
            break;
          case OP_pushundefined:
            push(Type.Atom.Undefined);
            break;
          case OP_pushfloat:
            notImplemented(bc);
            break;
          case OP_pushbyte:
            push(Type.Int);
            break;
          case OP_pushshort:
            push(Type.Int);
            break;
          case OP_pushstring:
            push(Type.Reference.String);
            break;
          case OP_pushint:
            push(Type.Int);
            break;
          case OP_pushuint:
            push(Type.Uint);
            break;
          case OP_pushdouble:
            push(Type.Number);
            break;
          case OP_pushtrue:
            push(Type.Boolean);
            break;
          case OP_pushfalse:
            push(Type.Boolean);
            break;
          case OP_pushnan:
            push(Type.Number);
            break;
          case OP_pop:
            pop();
            break;
          case OP_dup:
            val = pop();
            push(val);
            push(val);
            break;
          case OP_swap:
            lVal = pop();
            rVal = pop();
            push(lVal);
            push(rVal);
            break;
          case OP_pushwith:
          case OP_pushscope:
            scope.push(pop());
            break;
          case OP_pushnamespace:
            push(Type.Atom.Object);
            break;
          case OP_li8:
          case OP_li16:
          case OP_li32:
            push(Type.Int);
            break;
          case OP_lf32:
          case OP_lf64:
            push(Type.Number);
            break;
          case OP_si8:
          case OP_si16:
          case OP_si32:
            pop(Type.Int);
            break;
          case OP_sf32:
          case OP_sf64:
            pop(Type.Number);
            break;
          case OP_newfunction:
            push(Type.Reference.Function);
            break;
          case OP_call: //resolve prop on the receiver
            stack.popMany(bc.argCount);
            obj = pop();
            func = pop();
            push(Type.Atom.Any);
            break;
          case OP_construct:
            stack.popMany(bc.argCount);
            // TODO don't pop and push the same value!
            obj = pop(); // pop the type of the object to be constructed
            push(obj);
            break;
          case OP_callmethod:
            // callmethod is always invalid
            // http://hg.mozilla.org/tamarin-redux/file/eb8f916bb232/core/Verifier.cpp#l1846
            throw new VerifierError("callmethod");
          case OP_callstatic:
            notImplemented(bc);
            break;
          case OP_callsuper:
            stack.popMany(bc.argCount);
            multiname = popMultiname(bc);
            obj = pop();
            resolveTrait(obj, multiname); // ??
            //TODO: Implement resolveTrait and figure out the return type of the call
            push(Type.Atom.Any);
            break;
          case OP_callproperty:
            stack.popMany(bc.argCount);
            multiname = popMultiname(bc);
            obj = pop();
            resolveTrait(obj, multiname);
            //TODO: Implement resolveTrait and figure out the return type of the call
            push(Type.Atom.Any);
            break;
          case OP_returnvoid:
            // Nop.
            break;
          case OP_returnvalue:
            pop();
            break;
          case OP_constructsuper:
            stack.popMany(bc.argCount);
            stack.pop();
            break;
          case OP_constructprop:
            stack.popMany(bc.argCount);
            multiname = popMultiname(bc);
            obj = stack.pop();
            type = Type.Atom.Any;

            if (!(multiname instanceof RuntimeMultiname)) {
               if (obj.isReference() || obj.isClass()) {
                  trait = obj.getTrait(multiname);
                  if (trait && trait.isClass()) {
                    val = getProperty(obj.value, multiname);
                    type = Type.fromReference(val);
                }
              }
            }
            stack.push(type);
            break;
          case OP_callsuperid:
            notImplemented(bc);
            break;
          case OP_callproplex:
            stack.popMany(bc.argCount);
            multiname = popMultiname(bc);
            obj = pop();
            resolveTrait(obj, multiname);
            //TODO: Implement resolveTrait and figure out the return type of the call
            push(Type.Atom.Any);
            break;
          case OP_callinterface:
            notImplemented(bc);
            break;
          case OP_callsupervoid:
            notImplemented(bc);
            break;
          case OP_callpropvoid:
            notImplemented(bc);
            break;
          case OP_sxi1:
          case OP_sxi8:
          case OP_sxi16:
            // Sign extend, nop.
            break;
          case OP_applytype:
            assert(bc.argCount === 1);
            type = pop();
            factory = pop();
            // no need to check for the factory type since is allways vector
            if (type === Type.Int || type === Type.Uint || type.kind === "Reference") {
              type = Type.fromReference(new Vector(type));
            } else {
              type = Type.Atom.Any;
            }
            push(type);
            break;
          case OP_pushfloat4:
            notImplemented(bc);
            break;
          case OP_newobject:
            // Pops keys and values, pushes result.
            stack.popMany(bc.argCount * 2);
            push(Type.Atom.Any);
            break;
          case OP_newarray:
            // Pops values, pushes result.
            stack.popMany(bc.argCount);
            // push(Type.Atom.Object);
            push(Type.Atom.Object);
            break;
          case OP_newactivation:
            push(Type.fromReference(new Activation(this.methodInfo)));
            break;
          case OP_newclass:
            throw new VerifierError("Not Supported");
          case OP_getdescendants:
            notImplemented(bc);
            break;
          case OP_newcatch:
            push(Type.Atom.Any);
            break;
          case OP_findpropstrict:
            multiname = popMultiname(bc);
            stack.push(findProperty(multiname, true));
            break;
          case OP_findproperty:
            multiname = popMultiname(bc);
            stack.push(findProperty(multiname, false));
            break;
          case OP_finddef:
            notImplemented(bc);
            break;
          case OP_getlex:
            notImplemented(bc);
            break;
          case OP_initproperty:
          case OP_setproperty:
            valTy = popValue(bc); // attaches the type of the value to bc.valTy
            multiname = popMultiname(bc); // ataches the type of the multiname to bc.multinameTy
            objTy = popObject(bc); // attaches the type of the object to bc.objTy

            // TODO: This logic would not work for runtime multinames since the
            // actual value of the name could be a trait, thus not a dynamic property,
            // unless something can be proven about the value of the runtime multinames
            if (!(multiname instanceof RuntimeMultiname)) {
              trait = objTy.getTrait(multiname);

              if (trait === undefined) {
                bc.isDynamicProperty = true;
              }
            }

            break;
          case OP_getlocal:
            push(local[bc.index]);
            break;
          case OP_setlocal:
            local[bc.index] = pop();
            break;
          case OP_getglobalscope:
            push(Type.fromReference(savedScope.global.object));
            break;
          case OP_getscopeobject:
            // Get scope object from index position of the scope stack
            // TODO: Verify this for correctness; should it look through saved
            // scope chain instead ?
            push(scope[bc.index]);
            break;
          case OP_getproperty:
            multiname = popMultiname(bc);
            obj = pop();
            push(getPropertyType(obj, multiname));
            break;
          case OP_getouterscope:
            notImplemented(bc);
            break;
          case OP_setpropertylate:
            notImplemented(bc);
            break;
          case OP_deleteproperty:
            popMultiname(bc);
            pop();
            push(Type.Boolean);
            break;
          case OP_deletepropertylate:
            notImplemented(bc);
            break;
          case OP_getslot:
            push(getSlot(bc.objTy = pop(), bc.index));
            break;
          case OP_setslot:
            value = pop();
            bc.objTy = pop();
            break;
          case OP_getglobalslot:
            notImplemented(bc);
            break;
          case OP_setglobalslot:
            notImplemented(bc);
            break;
          case OP_convert_s:
            pop();
            push(Type.Reference.String);
            break;
          case OP_esc_xelem:
            pop();
            push(Type.Reference.String);
            break;
          case OP_esc_xattr:
            pop();
            push(Type.Reference.String);
            break;
          case OP_coerce_i:
          case OP_convert_i:
            pop();
            push(Type.Int);
            break;
          case OP_coerce_u:
          case OP_convert_u:
            pop();
            push(Type.Uint);
            break;
          case OP_coerce_d:
          case OP_convert_d:
            pop();
            push(Type.Number);
            break;
          case OP_coerce_b:
          case OP_convert_b:
            pop();
            push(Type.Boolean);
            break;
          case OP_convert_o:
            notImplemented(bc);
            break;
          case OP_checkfilter:
            notImplemented(bc);
            break;
          case OP_convert_f:
            pop();
            push(Type.Number);
            break;
          case OP_unplus:
            notImplemented(bc);
            break;
          case OP_convert_f4:
            notImplemented(bc);
            break;
          case OP_coerce:
            // The multiname in case of coerce bytecode cannot be
            // a runtime multiname and should be in the constant pool
            valTy = pop(); // the type of the value to be coerced
            push(Type.referenceFromName(multinames[bc.index]));
            break;
          case OP_coerce_a:
            // Note: ignoring the effect of coerce_a is a little, temporary hack
            // to preserve types on stack since asc inserts a coerce_a
            // after every push (e.g. pushbyte)

            // pop();
            // push(Type.Atom.Any);
            break;
          case OP_coerce_s:
            pop();
            push(Type.Reference.String);
            break;
          case OP_astype:
            notImplemented(bc);
            break;
          case OP_astypelate:
            notImplemented(bc);
            break;
          case OP_coerce_o:
            notImplemented(bc);
            break;
          case OP_negate:
          case OP_increment:
          case OP_decrement:
            pop();
            push(Type.Number);
            break;
          case OP_inclocal:
          case OP_declocal:
            local[bc.index] = Type.Number;
            break;
          case OP_typeof:
            pop();
            // TODO: Push string type on the stack?
            push(Type.Atom.Any);
            break;
          case OP_not:
            pop();
            push(Type.Boolean);
            break;
          case OP_add:
            rVal = pop();
            lVal = pop();
            if (lVal.isNumeric() && rVal.isNumeric()) {
              push(Type.Number);
            } else {
              // TODO: Other Cases
              push(Type.Atom);
            }
            break;
          case OP_subtract:
          case OP_multiply:
          case OP_divide:
          case OP_modulo:
            pop();
            pop();
            push(Type.Number);
            break;
          case OP_bitand:
          case OP_bitor:
          case OP_bitxor:
          case OP_lshift:
          case OP_rshift:
          case OP_urshift:
            pop();
            pop();
            push(Type.Int);
            break;
          case OP_bitnot:
            pop();
            push(Type.Int);
            break;
          case OP_equals:
          case OP_strictequals:
          case OP_lessthan:
          case OP_lessequals:
          case OP_greaterthan:
          case OP_greaterequals:
          case OP_instanceof:
          case OP_in:
            pop();
            pop();
            push(Type.Boolean);
            break;
          case OP_istype:
            notImplemented(bc);
            break;
          case OP_istypelate:
              pop();
              pop();
              push(Type.Boolean);
            break;
          case OP_inclocal_i:
          case OP_declocal_i:
            local[bc.index] = Type.Int;
            break;
          case OP_decrement_i:
          case OP_increment_i:
          case OP_negate_i:
            pop();
            push(Type.Int);
            break;
          case OP_add_i:
            notImplemented(bc);
            break;
          case OP_subtract_i:
            notImplemented(bc);
            break;
          case OP_multiply_i:
            notImplemented(bc);
            break;
          case OP_getlocal0:
          case OP_getlocal1:
          case OP_getlocal2:
          case OP_getlocal3:
            push(local[op - OP_getlocal0]);
            break;
          case OP_setlocal0:
          case OP_setlocal1:
          case OP_setlocal2:
          case OP_setlocal3:
            local[op - OP_setlocal0] = pop();
            break;
          case OP_debug:
            // Nop.
            break;
          case OP_debugline:
            // Nop.
            break;
          case OP_debugfile:
            // Nop.
            break;
          case OP_bkptline:
            // Nop.
            break;
          case OP_timestamp:
            // Nop.
            break;
          default:
            console.info("Not Implemented: " + bc);
          }

          if (writer) {
            writer.writeLn(("state: " + state.toString()).padRight(' ', 100) + " -- after bci: " + bci + ", " + bc);
          }
        }
        if (writer) {
          writer.leave("}");
          writer.writeLn("verifiedBlock: " + block.bid +
                       ", range: [" + block.position + ", " + block.end.position +
                       "], exitState: " + state.toString());
        }
      };

      return verification;
    })();
  }

  verifier.prototype.verifyMethod = function(methodInfo, scope) {
    assert (scope.object, "Verifier needs a scope object.");
    try {
      new this.verification(this, methodInfo, scope).verify();
    } catch (e) {
      if (e instanceof VerifierError) {
        return;
      }
      throw e;
    }
  };

  return verifier;
})();
