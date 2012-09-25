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
        // if (a[i] !== b[i]) {
        if (!a[i].equals(b[i])) {
          return false;
        }
      }
      return true;
    }
    function mergeArrays(a, b) {
      for (var i = a.length - 1; i >= 0; i--) {
        assert((a[i] !== undefined) && (b[i] !== undefined));
        a[i] = a[i].merge(b[i]);
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
          if (kind && ((kind === TRAIT_Getter && traits[k].isSetter()) ||
                       (kind === TRAIT_Setter && traits[k].isGetter()))) {
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

      function type(kind, name) {
        this.kind = kind;
        this.name = name;
        this.traits = null;
        this.baseClass = null;
        this.elementType = null;
      }

      type.prototype.toString = function () {
        var str = this.kind;
        if (this.name) {
          str += ": " +
                  (Multiname.getQualifiedName(this.name) ===
                    "public$__AS3__$vec$Vector" ? "Vector" : this.name);
        }
        if (this.elementType) {
          str += "[<" + this.elementType + ">]";
        }
        return str;
      };

      type.prototype.equals = function equals(other) {
        if (this.isVectorReference() && other.isVectorReference()) {
          // Determine if two vector reference types are equal
          // The basic rule is that they have the same dimension
          // (1D, 2D, 3D, etc.) and have the same elementType
        
          // recursive call to check for element type equality
          return this.elementType.equals(other.elementType);
        }

        // The type name is a QName so it must be unique (even if the class name
        // is the same, the namespace it belongs to should be different), thus 
        // the equality condition is sufficient
        return (this.kind === other.kind && this.name === other.name);
      };


      /**
       * Returns the type object retrieved from the domain, not a proxy.
       */
      type.fromName = function fromName(name) {
        if (name === undefined) {
          return type.Atom.Undefined;
        } else if (Multiname.getQualifiedName(name) === "public$void") {
          return type.Atom.Void;
        } else if (Multiname.getQualifiedName(name) === "public$int") {
          return type.Int;
        } else if (Multiname.getQualifiedName(name) === "public$uint") {
          return type.Uint;
        } else if (Multiname.getQualifiedName(name) === "public$Object") {
          return type.Atom.Object;
        } else if (Multiname.getQualifiedName(name) === "public$Number") {
          return type.Number;
        }
        var ty = domain.getProperty(name, false, true);        
        assert (ty, name + " not found");
        return ty;
      };

      type.fromReference = function fromReference(obj) {
        var ty = new type("Reference");
        ty.extractTraitsFromObject(obj);
        return ty;
      };

      type.fromClass = function fromClass(obj) {
        var ty = new type("Class");
        ty.extractTraitsFromObject(obj);
        return ty;
      };

      type.referenceFromClassTrait = function referenceFromClassTrait(trait) {
        // TODO this is not complete; needs mechanism to get the base class
        var ty = new type("Reference");
        ty.traits = trait.classInfo.instanceInfo.traits;
        ty.name = trait.name; // this is a qName, can be used for caching
        return ty;
      };

      type.classFromClassTrait = function classFromClassTrait(trait) {
        // TODO this is not complete; needs mechanism to get the base class
        var ty = new type("Class");
        ty.traits = trait.classInfo.traits;
        ty.name = trait.name;  // this is a qName, can be used for caching
        return ty;
      };

      type.referenceFromName = function referenceFromName(name) {
        var ty = type.fromName(name);
        if (ty instanceof Type) {
          return ty; // for Type.Int, Type.Number, etc.
        }
        var ref = type.fromReference(ty);
        if (name.hasTypeParameter()) {
          // For now only Vectors should have type parameters.
          assert(ref.isVectorReference());
          ref.elementType = referenceFromName(name.typeParameter);
        }
        return ref;
      };

      type.classFromName = function classFromName(name) {
        var ty = type.fromName(name);
        if (ty instanceof Type) {
          return ty; // for Type.Int, Type.Number, etc.
        }
        var cls = type.fromClass(ty);
        if (name.hasTypeParameter()) {
          // For now only Vectors should have type parameters.
          assert(cls.isVectorClass());
          cls.elementType = classFromName(name.typeParameter);
        }
        return cls;
      };

      type.prototype.extractTraitsFromObject = function extractTraitsFromObject(obj) {
        if (this.isReference()) {
          if (obj instanceof Global) {
            this.traits = obj.scriptInfo.traits;
            this.name = "Global";
          } else if (obj instanceof Activation) {
            this.traits = obj.methodInfo.traits;
            this.name = "Activation";
          } else if (obj instanceof domain.system.Class || obj instanceof Interface) {
            // Look into base's calss traits
            var currentClass = this;
            var currentObj = obj;
            this.traits = currentObj.classInfo.instanceInfo.traits;
            this.name = currentObj.classInfo.instanceInfo.name;
            while (currentObj.baseClass) {
              currentClass.baseClass = type.fromReference(currentObj.baseClass);
              currentClass = currentClass.baseClass;
              currentObj = currentObj.baseClass;
            }
          }
        } else if (this.isClass()) {
          // TODO get base class traits
          this.name = obj.classInfo.instanceInfo.name;
          this.traits = obj.classInfo.traits;
        }
        assert(this.name);
      };

      type.check = function check(a, b) {
        assert (a.kind === b.kind);
      };

      type.prototype.isNumeric = function isNumeric() {
        return this === type.Number || this === type.Int || this === type.Uint;
      };

      type.prototype.isString = function isString() {
        return this === Type.Reference.String;
      };

      type.prototype.isAtom = function isAtom() {
        return this.kind === "Atom";
      };

      type.prototype.isReference = function isReference() {
        return this.kind === "Reference";
      };

      type.prototype.isClass = function isClass() {
        return this.kind === "Class";
      };

      type.prototype.isVectorReference = function isVectorReference() {
        return this.isReference() &&
                Multiname.getQualifiedName(this.name) === "public$__AS3__$vec$Vector";
      };

      type.prototype.isVectorClass = function isVectorClass() {
        return this.isClass() &&
                Multiname.getQualifiedName(this.name) === "public$__AS3__$vec$Vector";
      };

      type.prototype.elementTypeIsInt = function elementTypeIsInt() {
        // assert(this.elementType, "Element type is undefined.");
        return this.elementType && this.elementType === Type.Int;
      };
    
      type.prototype.elementTypeIsUint = function elementTypeIsUint() {
        // assert(this.elementType, "Element type is undefined.");
        return this.elementType && this.elementType === Type.Uint;
      };

      type.prototype.elementTypeIsObject = function elementTypeIsObject() {
        // assert(this.elementType, "Element type is undefined.");
        return this.elementType && this.elementType.isReference();
      };


      type.prototype.getMethodReturnType = function getMethodReturnType(multiname) {
        assert(this.isReference());
        var trait = this.getTraitEnforceGetter(multiname);
        if (trait && (trait.isMethod() || trait.isGetter())) {
          return Type.referenceFromName(trait.methodInfo.returnType);
        }
        return Type.Atom.Any;
      };

      /**
       * Gets a trait by slotid.
       */
      type.prototype.getTraitBySlotId = function getTraitBySlotId(slotId) {
        assert(this.isReference() || this.isClass());
    
        var currentClass = this;
        var trait = findTraitBySlotId(currentClass.traits, slotId);
        while (!trait && currentClass.baseClass) {
          currentClass = currentClass.baseClass;
          trait = findTraitBySlotId(currentClass.traits, slotId);
        }
        return trait;
      };

      type.prototype.getTraitEnforceGetter = function getTraitEnforceGetter(multiname) {
        return this.getTrait(multiname, TRAIT_Getter);
      };

      type.prototype.getTraitEnforceSetter = function getTraitEnforceSetter(multiname) {
        return this.getTrait(multiname, TRAIT_Setter);
      };

      /**
       * Gets a trait by multiname.
       * The kind acts only like an arbitrer between getters and setters since
       * thess two have the same multiname and differ only by kind.
       * This means that when |kind === TRAIT_Setter| the getters will be skipped
       * and when |kind === TRAIT_Getter| the setters will be skipped.
       */
      type.prototype.getTrait = function getTrait(multiname, kind) {
        assert(this.isReference() || this.isClass());

        var currentClass = this;
        var trait = findTrait(currentClass.traits, multiname, kind);
        while (!trait && currentClass.baseClass) {
          currentClass = currentClass.baseClass;
          trait = findTrait(currentClass.traits, multiname, kind);
        }
        return trait;
      };

      /**
       * Returns the lowest common base class of two reference types.
       * The implementation assumes that the types are nodes in a tree
       * where the root is |Object|, so they always have a common ancestor.
       */
      type.getLowestCommonAncestor = function getLowestCommonAncestor(first, second) {
        assert(first.isReference() && second.isReference());

        if (first.equals(second)) {
          return first;
        }

        var firstPathToRoot = [];
        var firstBaseClass = first;
        while (firstBaseClass) {
          firstPathToRoot.push(firstBaseClass);
          firstBaseClass = firstBaseClass.baseClass;
        }

        var secondPathToRoot = [];
        var secondBaseClass = second;
        while (secondBaseClass) {
          secondPathToRoot.push(secondBaseClass);
          secondBaseClass = secondBaseClass.baseClass;
        }

        firstBaseClass = firstPathToRoot.pop();
        secondBaseClass = secondPathToRoot.pop();
        var commonBaseClass;
        while (firstBaseClass.equals(secondBaseClass)  &&
               firstPathToRoot.length > 0 && secondPathToRoot.length > 0) {
          commonBaseClass = firstBaseClass;
          firstBaseClass = firstPathToRoot.pop();
          secondBaseClass = secondPathToRoot.pop();
        }

        if (firstBaseClass.equals(secondBaseClass)) {
          // one class is descendent from the other
          return firstBaseClass;
        }
        // neither is descendant from the other
        return commonBaseClass;
      };

      type.prototype.merge = function(other) {
        // TODO: Merging Atom.Undefined and Atom.Any bellow is a hack to
        // circumvent the fact that the verifier's type hierrchy doesn't
        // form a semilatice and solve the incompatible types merge situations

        if (this === other) {
          return this;
        } else if (this.isAtom() || other.isAtom()) {
          return type.Atom;
        } else if (this.isReference() && other.isReference()) {
          return type.getLowestCommonAncestor(this, other);
        } else if (this.isClass() && other.isClass()) {
          return type.Class;
        } else if (this.isReference() ^ other.isReference()) {
          return type.Atom.Any;
        } else if (this.isClass() ^ other.isClass()) {
          return type.Atom.Any;
        } else if (this === type.Boolean ^ other === type.Boolean) {
          return type.Atom.Any;
        } else if ((this === type.Int && other === type.Number) ||
                   (this === type.Number && other === type.Int) ||
                   (this === type.Uint && other === type.Number) ||
                   (this === type.Number && other === type.Uint) ||
                   (this === type.Int && other === type.Uint) ||
                   (this === type.Uint && other === type.Int)) {
          return type.Number;
        } else if (this === type.Atom.Undefined || other === type.Atom.Undefined) {
          return type.Atom;
        } else if (this === type.Atom.Any || other === type.Atom.Any) {
          return Type.Atom.Any;
        }

        unexpected("Cannot merge types : " + this + " and " + other);
      };

      function getType(simpleName) {
        var name = Multiname.fromSimpleName(simpleName);
        var type = domain.getProperty(name, false, false);
       // assert (type, "Cannot find type: " + name);
        return type;
      }

      type.Reference = new type("Reference");
      type.Reference.Object = type.fromReference(getType("Object"));
      type.Reference.Vector = type.fromReference(getType("public __AS3__$vec.Vector"));
      type.Reference.String = type.fromReference(getType("String"));
      type.Reference.Array = type.fromReference(getType("Array"));
      type.Reference.Function = type.fromReference(getType("Function"));
      type.Reference.Null = new type("Reference", null);

      type.Class = new type("Class");
      type.Class.Object = type.fromClass(getType("Object"));
      type.Class.Vector = type.fromClass(getType("public __AS3__$vec.Vector"));
      type.Class.String = type.fromClass(getType("String"));
      type.Class.Array = type.fromClass(getType("Array"));
      type.Class.Function = type.fromClass(getType("Function"));

      type.Atom = new type("Atom");
      type.Atom.Any = new type("Atom", "Any");
      type.Atom.Undefined = new type("Atom", "Undefined");
      type.Atom.Void = new type("Atom", "Void");
      type.Atom.Object = new type("Atom", "Object"); // TODO according to the type lattice this should be repalced with type.Reference.Object
      type.Int = new type("Int");
      type.Uint = new type("Uint");
      type.Boolean = new type("Boolean");
      type.Number = new type("Number");

      return type;
    })();

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

        blocks.forEach(function (x) {
          x.entryState = x.exitState = null;
        });

        if (writer) {
          this.methodInfo.trace(writer, this.verifier.abc);
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
          entryState.local.push(Type.fromReference(this.scope.global.object));
        } else {          
          // If the function is on the top level, not in a package, 
          // the function is set in a slot on the gobal object and it's trait
          // type is a slot and not a method/getter/setter.
          // In thic case |this| should be |global|.
          entryState.local.push(Type.fromReference(this.scope.global.object));
        }

        // Initialize entry state with parameter types.
        for (var i = 0; i < mi.parameters.length; i++) {
          entryState.local.push(Type.referenceFromName(mi.parameters[i].type));
        }

        var remainingLocals = mi.localCount - mi.parameters.length - 1;

        // Push the |rest| or |arguments| array type in the locals.
        if (mi.needsRest() || mi.needsArguments()) {
          entryState.local.push(Type.Reference.Array);
          remainingLocals -= 1;
        }

        // Initialize locals with Type.Atom.Undefined 
        for (var i = 0; i < remainingLocals; i++) {
          entryState.local.push(Type.Atom.Undefined); 
        }

        assert(entryState.local.length === mi.localCount);

        if (writer) {
          entryState.trace(writer);
        }

        /**
         * To avoid revisiting the same block more than necessary while iterating
         * to a fixed point, the blocks need to be processed in dominator order.
         * The same problem for tamarin is discussed here: https://bugzilla.mozilla.org/show_bug.cgi?id=661133
         * 
         * The blocks in the mi.analysis.blocks are in the dominator order.
         * Iterate over the blocks array and assign an id (bdo = blockDominatorOrder)
         * that gives the dominator order for the que insert.
         */
        for (var bi = 0, len = blocks.length; bi < len; bi++) {
          blocks[bi].bdo = bi;
        }

        /**
         * Keep the blocks sorted in dominator order.
         * The SortedList structure is based on a linked list and uses a liniar search
         * to find the right insertion position and keep the list sorted.
         * The push operation takes O(n), the pull operations takes O(1).
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

              if (block === successor) {
                // If the block has a backward branch to itself just ignore it
                // since nothing more can be inferred by taking it, and could
                // actually run into an infinite loop if it's entry state differs
                // from it's exit state.
                return;
              }

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

        var obj, objTy, func, mi, multiname, lVal, rVal, val, valTy, factory, elementTy, type, typeName, name, trait;

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

          for (var i = scope.length - 1; i >= 0; i--) {
            var scopeObj = scope[i];
            if (!(scopeObj.isReference() || scopeObj.isClass())) {
              // The objects on the scope stack should be of type |Reference|
              // or |Class| to represent a real scope object.
              // In case the scope object not |Reference| (e.g. Type.Atom.Any,
              // Type.Atom.Undefined) return the |Any| type, avoiding to look into
              // the next objtects on the scope stack which would lead to a wrong result.
              return Type.Atom.Any;
            }
            if (scopeObj.getTrait(multiname)) {
              return scopeObj;
            }
          }
          
          // the property was not found in the scope stack, search the saved scope
          if (savedScope) {
            obj = savedScope.findProperty(multiname, domain, false);

            if (obj instanceof domain.system.Class || obj instanceof Interface) {
              return Type.fromClass(obj);
            } else if (obj instanceof Global || obj instanceof Activation) {
              return Type.fromReference(obj);
            }
            // TODO - we cannot deal with object instances found on the scope stack
            // like in case of function instances; see ../tests/tamarin/ecma3/Array/splice2.abc
            // the problem being that the instances found are only objects with bounded properties
            // nothing else. the queston is now, how was it different before, because even if you
            // find the property, say a function, you cannot get the return type
            // from the bound property. Moreover, previously might have been wrong.
            // Take a closer look at what findproeprty does.
          }

          return Type.Atom.Any;
        }

        function getPropertyType(obj, multiname) {
          var type = Type.Atom.Any;

          // |getPropertyType| resolves the type of property with the name specified
          // by the multiname in object.
          
          if (multiname instanceof RuntimeMultiname) {
            if (multiname.name.isNumeric()) {
              // TODO Dynamic property, maybe array access. Can we infer the type of the prop?
            }
          } else if (obj.isReference() || obj.isClass()) {
            if (obj.isVectorReference() && multiname.name instanceof Type &&
                multiname.name.isNumeric()) {
                type = obj.elementType;
            } else {
              // |getTraitEnforceGetter| makes sure that we get the getter,
              // not the setter, which is required because we need the accessor
              // property type which can be retrieved from getter's return type
              trait = obj.getTraitEnforceGetter(multiname);
              if (trait) {
                type = getTraitType(trait, obj);
                bc.propertyName = trait.name;
              } else if (trait === undefined) {
                bc.isDynamicProperty = true;
                type = Type.Atom.Undefined;
              }
            }
          }

          return type;
        }

        function getTraitType(trait, obj) {
          assert(trait);
          var type = Type.Atom.Any;
          if (trait.isClass()) {
            // type = Type.classFromClassTrait(trait); //TODO
            type = Type.classFromName(trait.classInfo.instanceInfo.name);
          } else if (trait && (trait.isSlot() || trait.isConst())) {
            type = Type.referenceFromName(trait.typeName);
          } else if (trait && trait.isGetter()) {
            type = Type.referenceFromName(trait.methodInfo.returnType);
          } else if (trait && trait.isMethod()) {
            type = Type.referenceFromName(trait.methodInfo.returnType);
          }
          return type;
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

        function getSlot(objTy, index) {
          if (!objTy.isReference()) {
            return Type.Atom;
          }
          trait = objTy.getTraitBySlotId(index);
          if (trait) {
            return getTraitType(trait, objTy);
          }
          return Type.Atom.Undefined;
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
            objTy = pop();
            type = Type.Atom.Any;
            if (objTy.isReference() && objTy.baseClass) {
              // var baseType = Type.fromReference(objTy.value.baseClass);
              type = objTy.baseClass.getMethodReturnType(multiname);
            }
            push(type);
            break;
          case OP_callproperty:
            stack.popMany(bc.argCount);
            multiname = popMultiname(bc);
            obj = pop();
            type = Type.Atom.Any;
            if (obj.isReference() || obj.isClass()) {
              trait = obj.getTraitEnforceGetter(multiname);
              if (trait && (trait.isMethod() || trait.isGetter())) {
                bc.propertyName = trait.name;
                type = Type.referenceFromName(trait.methodInfo.returnType);
              } else if (trait && trait.isSlot()) {
                bc.propertyName = trait.name;
                type = Type.referenceFromName(trait.typeName);
              }
            }
            push(type);
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

                    // TODO If the class is declared later, after the definition of the method
                    // that uses it, and there is no package the trampoline mechanism does not
                    // work so the class is not declared because the method is a slot trait,
                    // and  when the function is
                    // compiled then domain.getProperty cannot find the class object.
                    // This is one of the reasons we decided to deal with abstract types
                    // in the verifier, instead of 'real' types.
                    // Here, we have access to the class traits, but the problem is:
                    // how you get the inheritance chain from the class traits ?
                    // For now use domain.getProperty; one possible solution would be to
                    // determine the the inheritance chain by using the superName
                    // and looking into the .abc for the base class.

                    // type = Type.referenceFromClassTrait(trait); //TODO
                    val = domain.getProperty(multiname, false, true);
                    if (val) {
                      type = Type.fromReference(val);
                    } else { // the type object was not created yet
                      type = Type.Atom.Undefined;
                    }
                    bc.propertyName = trait.name;
                }
              }
            }
            stack.push(type);
            break;
          case OP_callsuperid:
            notImplemented(bc);
            break;
          case OP_callproplex:
            // Very similar with op_callproperty, only difference being that
            // callproplex uses |null| as the |this| parameter for [[Call]]
            stack.popMany(bc.argCount);
            multiname = popMultiname(bc);
            objTy = pop();
            type = Type.Atom.Any;
                        
            if (objTy.isReference()) {
              type = objTy.getMethodReturnType(multiname);
            }
            push(type);
            break;
          case OP_callinterface:
            notImplemented(bc);
            break;
          case OP_callsupervoid:
            stack.popMany(bc.argCount);
            popMultiname(bc);
            pop();
            break;
          case OP_callpropvoid:
            stack.popMany(bc.argCount);
            popMultiname(bc);
            pop();
            break;
          case OP_sxi1:
          case OP_sxi8:
          case OP_sxi16:
            // Sign extend, nop.
            break;
          case OP_applytype:
            assert(bc.argCount === 1);
            elementTy = pop();
            factory = pop();
            if (factory.isVectorClass() && (elementTy === Type.Int ||
                elementTy === Type.Uint || elementTy.isReference())) {
                type = Type.referenceFromName(factory.name);
                type.elementType = elementTy;
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
            push(Type.Reference.Object);
            break;
          case OP_newarray:
            // Pops values, pushes result.
            stack.popMany(bc.argCount);
            push(Type.Atom.Object);
            break;
          case OP_newactivation:
            push(Type.fromReference(new Activation(this.methodInfo)));
            break;
          case OP_newclass:
            // pop();
            // push(Type.Atom.Any);
            // break;
            throw new VerifierError("Not Supported"); // TODO why not supported?
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
            multiname = popMultiname(bc);
            push(getPropertyType(findProperty(multiname, true), multiname));
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
              if (objTy.isReference() || objTy.isClass()) {
                trait = objTy.getTrait(multiname);
                if (trait) {
                  bc.propertyName = trait.name;
                } else if (trait === undefined) {
                  bc.isDynamicProperty = true;
                }
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
            objTy = bc.objTy = pop();
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
            push(Type.Reference.String);
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
            } else if (lVal.isString() || rVal.isString()) {
              push(Type.Reference.String);
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
          case OP_subtract_i:
          case OP_multiply_i:
            pop();
            pop();
            push(Type.Int); // or Number?
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
      Counter.count("Verifier: Methods");
    } catch (e) {
      if (e instanceof VerifierError) {
        return;
      }
      throw e;
    }
  };

  return verifier;
})();
