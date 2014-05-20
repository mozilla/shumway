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

module Shumway.AVM2.Verifier {
  import OP = Shumway.AVM2.ABC.OP;
  import Info = Shumway.AVM2.ABC.Info;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import notImplemented = Shumway.Debug.notImplemented;

  export class TypeInformation {
    type: Type;
  }

  export class Type {
    static Any: AtomType;
    static Null: AtomType;
    static Void: AtomType;
    static Undefined: AtomType;

    static Int: TraitsType;
    static Uint: TraitsType;
    static Class: TraitsType;
    static Array: TraitsType;
    static Object: TraitsType;
    static String: TraitsType;
    static Number: TraitsType;
    static Boolean: TraitsType;
    static Function: TraitsType;
    static XML: TraitsType;
    static XMLList: TraitsType;
    static Dictionary: TraitsType;

    static _cache = {
      byQN: <Shumway.Map<Type>>Shumway.ObjectUtilities.createEmptyObject(),
      byHash: <Shumway.Map<Type>>Shumway.ObjectUtilities.createEmptyObject()
    };

    static from(info: Info, domain: ApplicationDomain): Type {
      var type = Type._cache[info.hash];
      if (!type) {
        type = Type._cache[info.hash] = new TraitsType(info, domain);
      }
      return type;
    }

    static fromSimpleName(name: string, domain: ApplicationDomain): TraitsType {
      return <TraitsType>Type.fromName(Multiname.fromSimpleName(name), domain);
    }

    static fromName(mn: Multiname, domain: ApplicationDomain): Type {
      if (mn === undefined) {
        return Type.Undefined;
      } else {
        var qn = Multiname.isQName(mn) ? Multiname.getFullQualifiedName(mn) : undefined;
        if (qn) {
          var type = Type._cache.byQN[qn];
          if (type) {
            return type;
          }
        }
        if (qn === Multiname.getPublicQualifiedName("void")) {
          return Type.Void;
        }
        release || assert(domain, "An ApplicationDomain is needed.");
        var info = domain.findClassInfo(mn);
        var type = info ? Type.from(info, domain) : Type.Any;
        if (mn.hasTypeParameter()) {
          type = new ParameterizedType(<TraitsType>type, Type.fromName(mn.typeParameter, domain));
        }
        return Type._cache.byQN[qn] = type;
      }
      return null;
    }

    private static _typesInitialized = false;
    public static initializeTypes(domain: ApplicationDomain) {
      if (Type._typesInitialized) {
        return;
      }
      Type.Any          = new AtomType("any", "?");
      Type.Null         = new AtomType("Null", "X");
      Type.Void         = new AtomType("Void", "V");
      Type.Undefined    = new AtomType("Undefined", "_");

      Type.Int          = Type.fromSimpleName("int", domain).instanceType();
      Type.Uint         = Type.fromSimpleName("uint", domain).instanceType();
      Type.Class        = Type.fromSimpleName("Class", domain).instanceType();
      Type.Array        = Type.fromSimpleName("Array", domain).instanceType();
      Type.Object       = Type.fromSimpleName("Object", domain).instanceType();
      Type.String       = Type.fromSimpleName("String", domain).instanceType();
      Type.Number       = Type.fromSimpleName("Number", domain).instanceType();
      Type.Boolean      = Type.fromSimpleName("Boolean", domain).instanceType();
      Type.Function     = Type.fromSimpleName("Function", domain).instanceType();
      Type.XML          = Type.fromSimpleName("XML", domain).instanceType();
      Type.XMLList      = Type.fromSimpleName("XMLList", domain).instanceType();
      Type.Dictionary   = Type.fromSimpleName("flash.utils.Dictionary", domain).instanceType();
      Type._typesInitialized = true;
    }

    equals(other: Type): boolean {
      return false;
    }

    merge(other: Type): Type {
      return null;
    }

    instanceType(): Type {
      return null;
    }

    super(): Type {
      return null;
    }

    isNumeric(): boolean {
      return this === Type.Int || this === Type.Uint || this === Type.Number;
    }

    isString(): boolean {
      return this === Type.String;
    }
  }

  class AtomType extends Type {
    constructor(public name: string, public symbol: string) {
      super();
    }
    toString() {
      return this.symbol;
    }
    instanceType(): Type {
      return Type.Any;
    }
  }

  export class TraitsType extends Type {
    _cachedType: TraitsType;
    constructor(public info: Info, public domain: ApplicationDomain) {
      super();
    }

    instanceType(): TraitsType {
      release || assert(this.info instanceof ClassInfo);
      var classInfo = <ClassInfo>this.info;
      return this._cachedType || (this._cachedType = <TraitsType>Type.from(classInfo.instanceInfo, this.domain));
    }

    classType(): TraitsType {
      release || assert(this.info instanceof InstanceInfo);
      var instanceInfo = <InstanceInfo>this.info;
      return this._cachedType || (this._cachedType = <TraitsType>Type.from(instanceInfo.classInfo, this.domain));
    }

    super(): TraitsType {
      if (this.info instanceof ClassInfo) {
        return Type.Class;
      }
      release || assert(this.info instanceof InstanceInfo);
      var instanceInfo = <InstanceInfo>this.info;
      if (instanceInfo.superName) {
        var result = <TraitsType>Type.fromName(instanceInfo.superName, this.domain).instanceType();
        release || assert(result instanceof TraitsType && result.info instanceof InstanceInfo);
        return result;
      }
      return null;
    }

    private _getInfoName() {
      if (this.info instanceof ScriptInfo) {
        return "SI";
      } else if (this.info instanceof ClassInfo) {
        var classInfo = <ClassInfo>this.info;
        return "CI:" + classInfo.instanceInfo.name.name;
      } else if (this.info instanceof InstanceInfo) {
        var instanceInfo = <InstanceInfo>this.info;
        return "II:" + instanceInfo.name.name;
      } else if (this.info instanceof MethodInfo) {
        return "MI";
      }
//      else if (this.info instanceof ActivationInfo) {
//        return "AC";
//      }
      release || assert(false);
    }

    toString () {
      switch (this) {
        case Type.Int: return "I";
        case Type.Uint: return "U";
        case Type.Array: return "A";
        case Type.Object: return "O";
        case Type.String: return "S";
        case Type.Number: return "N";
        case Type.Boolean: return "B";
        case Type.Function: return "F";
      }
      return this._getInfoName();
    }
  }

  export class ParameterizedType extends TraitsType {
    constructor(public type: TraitsType, public parameter: Type) {
      super(type.info, type.domain);
    }
  }

  /**
   * Abstract Program State
   */
  class State {
    static id = 0;
    id: number;
    originalId: number;
    stack: Type [];
    scope: Type [];
    local: Type [];
    constructor() {
      this.id = State.id += 1;
      this.stack = [];
      this.scope = [];
      this.local = [];
    }
    clone(): State {
      var s = new State();
      s.originalId = this.id;
      s.stack = this.stack.slice(0);
      s.scope = this.scope.slice(0);
      s.local = this.local.slice(0);
      return s;
    }
    trace(writer: IndentingWriter) {
      writer.writeLn(this.toString());
    }
    toString(): string {
      return "<" + this.id + (this.originalId ? ":" + this.originalId : "") +
        ", L[" + this.local.join(", ") + "]" +
        ", S[" + this.stack.join(", ") + "]" +
        ", $[" + this.scope.join(", ") + "]>";
    }
    equals(other: State): boolean {
      return State._arrayEquals(this.stack, other.stack) &&
        State._arrayEquals(this.scope, other.scope) &&
        State._arrayEquals(this.local, other.local);
    }
    private static _arrayEquals(a, b) {
      if(a.length != b.length) {
        return false;
      }
      for (var i = a.length - 1; i >= 0; i--) {
        if (!a[i].equals(b[i])) {
          return false;
        }
      }
      return true;
    }
    isSubset(other: State) {
      return State._arraySubset(this.stack, other.stack) &&
        State._arraySubset(this.scope, other.scope) &&
        State._arraySubset(this.local, other.local);
    }
    private static _arraySubset(a: Type [], b: Type []) {
      if(a.length != b.length) {
        return false;
      }
      for (var i = a.length - 1; i >= 0; i--) {
        if (a[i] === b[i] || a[i].equals(b[i])) {
          continue;
        }
        if (a[i].merge(b[i]) !== a[i]) {
          return false;
        }
      }
      return true;
    }
    merge(other: State) {
      State._mergeArrays(this.local, other.local);
      State._mergeArrays(this.stack, other.stack);
      State._mergeArrays(this.scope, other.scope);
    }
    private static _mergeArrays(a: Type [], b: Type []) {
      release || assert(a.length === b.length, "a: " + a + " b: " + b);
      for (var i = a.length - 1; i >= 0; i--) {
        release || assert((a[i] !== undefined) && (b[i] !== undefined));
        if (a[i] === b[i]) {
          continue;
        }
        a[i] = a[i].merge(b[i]);
      }
    }
  }

  interface Block {
    entryState: State;
    exitState: State;
    bdo: number;
    bid: number;
    succs: Block [];
    position: number;
    end: Bytecode;
  }

  interface Bytecode {
    position: number;
    index: number;
    ti: TypeInformation;
    op: number;
  }

  class Verification {
    writer = new IndentingWriter();
    thisType: Type;
    returnType: Type;

    private _multinames: Multiname [];

    constructor (
      public methodInfo: MethodInfo,
      public domain: ApplicationDomain,
      public savedScope: Info []
    ) {
      // ...
      this.writer = Shumway.AVM2.Verifier.traceLevel.value ? new IndentingWriter() : null;
      this._multinames = methodInfo.abc.constantPool.multinames;
    }

    verify() {
      var methodInfo = this.methodInfo;
      if (this.writer) {
        this.methodInfo.trace(this.writer);
      }
      assert(methodInfo.localCount >= methodInfo.parameters.length + 1);
      this._verifyBlocks(this._prepareEntryState());
    }

    private _prepareEntryState(): State {
      var writer = this.writer;
      var entryState = new State();
      var methodInfo = this.methodInfo;
      this.thisType = methodInfo.holder ? Type.from(methodInfo.holder, this.domain) : Type.Any;
      entryState.local.push(this.thisType);

      // Initialize entry state with parameter types.
      var parameters = methodInfo.parameters;
      for (var i = 0; i < parameters.length; i++) {
        entryState.local.push(Type.fromName(parameters[i].type, this.domain).instanceType());
      }

      // Push the |rest| or |arguments| array type in the locals.
      var remainingLocals = methodInfo.localCount - methodInfo.parameters.length - 1;

      if (methodInfo.needsRest() || methodInfo.needsArguments()) {
        entryState.local.push(Type.Array);
        remainingLocals -= 1;
      }

      // Initialize locals with Type.Atom.Undefined.
      for (var i = 0; i < remainingLocals; i++) {
        entryState.local.push(Type.Undefined);
      }

      assert(entryState.local.length === methodInfo.localCount);

      return entryState;
    }

    private _verifyBlocks(entryState: State) {
      var writer = this.writer;
      var blocks: Block [] = (<any>this.methodInfo).analysis.blocks;
      blocks.forEach(function (x: Block) {
        x.entryState = x.exitState = null;
      });

      /**
       * To avoid revisiting the same block more than necessary while iterating to a fixed point,
       * the blocks need to be processed in dominator order. The same problem for tamarin is
       * discussed here: https://bugzilla.mozilla.org/show_bug.cgi?id=661133
       *
       * The blocks in the |analysis.blocks| are already in the dominator order. Iterate over the
       * blocks array and assign an id (bdo = blockDominatorOrder) that gives the dominator order
       * for the que insert.
       */
      for (var i = 0; i < blocks.length; i++) {
        blocks[i].bdo = i;
      }

      /**
       * Keep the blocks sorted in dominator order. The SortedList structure is based on a linked
       * list and uses a liniar search to find the right insertion position and keep the list
       * sorted. The push operation takes O(n), the pull operations takes O(1).
       */
      var worklist = new Shumway.SortedList<Block>(function compare(a: Block, b: Block) {
        return a.bdo - b.bdo;
      });


      blocks[0].entryState = entryState;
      worklist.push(blocks[0]);

      while (!worklist.isEmpty()) {

        var block = worklist.pop();
        var exitState = block.exitState = block.entryState.clone();

        this._verifyBlock(block, exitState);

        block.succs.forEach(function (successor: Block) {
          if (worklist.contains(successor)) {
            if (writer) {
              writer.writeLn("Forward Merged Block: " + successor.bid + " " +
                exitState.toString() + " with " + successor.entryState.toString());
            }
            // merge existing item entry state with current block exit state
            successor.entryState.merge(exitState);
            if (writer) {
              writer.writeLn("Merged State: " + successor.entryState);
            }
            return;
          }

          if (successor.entryState) {
            if (!successor.entryState.isSubset(exitState)) {
              if (writer) {
                writer.writeLn("Backward Merged Block: " + block.bid + " with " + successor.bid + " " +
                  exitState.toString() + " with " + successor.entryState.toString());
              }
              successor.entryState.merge(exitState);
              worklist.push(successor);
              if (writer) {
                writer.writeLn("Merged State: " + successor.entryState);
              }
            }
            return;
          }

          successor.entryState = exitState.clone();
          worklist.push(successor);
          if (writer) {
            writer.writeLn("Added Block: " + successor.bid +
              " to worklist: " + successor.entryState.toString());
          }
        });
      }

      if (writer) {
        writer.writeLn("Inferred return type: " + this.returnType);
      }
      (<any>this.methodInfo).inferredReturnType = this.returnType;
    }

    private _verifyBlock(block: Block, state: State) {
      var self = this;
      var writer = this.writer;
      var methodInfo = this.methodInfo;
      var bytecodes = <Bytecode []>(methodInfo.analysis.bytecodes);

      var local = state.local;
      var stack = state.stack;
      var scope = state.scope;
      var bc: Bytecode;

      function ti() {
        return bc.ti || (bc.ti = new TypeInformation());
      }

      function push(x: Type) {
        release || assert(x);
        ti().type = x;
        stack.push(x);
      }

      function pop() {
        return stack.pop();
      }

      function notImplementedBC() {
        notImplemented(String(bc));
      }

      function popMultiname() {
        var mn = this._multinames[bc.index];
        if (mn.isRuntime()) {
          var namespaces = mn.namespaces;
          var name = mn.name;
          if (mn.isRuntimeName()) {
            name = pop();
          }
          if (mn.isRuntimeNamespace()) {
            namespaces = [pop()];
          }
          return new MultinameType(namespaces, name, mn.flags);
        }
        return mn;
      }

      function getProperty(object: Type, mn) {

      }

      function setProperty(object: Type, mn, value: Type) {

      }

      function findProperty(mn, strict: boolean) {

      }

      function accessSlot(object: Type) {

      }

      var value: Type, object: Type, a: Type, b: Type, object: Type, mn: Type, type: Type;
      
      for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
        bc = bytecodes[bci];
        var op = bc.op;

        if (writer && Shumway.AVM2.Verifier.traceLevel.value > 1) {
          writer.writeLn(("stateBefore: " + state.toString() + " $$[" + savedScope.join(", ") + "]").padRight(' ', 100) + " : " + bci + ", " + bc.toString(methodInfo.abc));
        }

        switch (op) {
          case OP.bkpt:
            // Nop.
            break;
          case OP.throw:
            pop();
            break;
          case OP.getsuper:
            mn = popMultiname();
            object = pop();
            release || assert(object.super());
            ti().baseClass = LazyInitializer.create(this.thisType.super().classType().object);
            push(getProperty(object.super(), mn));
            break;
          case OP.setsuper:
            value = pop();
            mn = popMultiname();
            object = pop();
            release || assert(object.super());
            ti().baseClass = LazyInitializer.create(this.thisType.super().classType().object);
            setProperty(object.super(), mn, value);
            break;
          case OP.dxns:
            notImplementedBC();
            break;
          case OP.dxnslate:
            notImplementedBC();
            break;
          case OP.kill:
            state.local[bc.index] = Type.Undefined;
            break;
          case OP.lf32x4:
            notImplementedBC();
            break;
          case OP.sf32x4:
            notImplementedBC();
            break;
          case OP.ifnlt:
          case OP.ifge:
          case OP.ifnle:
          case OP.ifgt:
          case OP.ifngt:
          case OP.ifle:
          case OP.ifnge:
          case OP.iflt:
          case OP.ifeq:
          case OP.ifne:
          case OP.ifstricteq:
          case OP.ifstrictne:
            pop();
            pop();
            break;
          case OP.jump:
            // Nop.
            break;
          case OP.iftrue:
          case OP.iffalse:
            pop();
            break;
          case OP.lookupswitch:
            pop(Type.Int);
            break;
          case OP.popscope:
            scope.pop();
            break;
          case OP.nextname:
          case OP.nextvalue:
            pop(Type.Int);
            pop();
            push(Type.Any);
            break;
          case OP.hasnext:
            push(Type.Boolean);
            break;
          case OP.hasnext2:
            push(Type.Boolean);
            break;
          case OP.pushnull:
            push(Type.Null);
            break;
          case OP.pushundefined:
            push(Type.Undefined);
            break;
          case OP.pushfloat:
            notImplementedBC();
            break;
          case OP.pushbyte:
            push(Type.Int);
            break;
          case OP.pushshort:
            push(Type.Int);
            break;
          case OP.pushstring:
            push(Type.String);
            break;
          case OP.pushint:
            push(Type.Int);
            break;
          case OP.pushuint:
            push(Type.Uint);
            break;
          case OP.pushdouble:
            push(Type.Number);
            break;
          case OP.pushtrue:
            push(Type.Boolean);
            break;
          case OP.pushfalse:
            push(Type.Boolean);
            break;
          case OP.pushnan:
            push(Type.Number);
            break;
          case OP.pop:
            pop();
            break;
          case OP.dup:
            value = pop();
            push(value);
            push(value);
            break;
          case OP.swap:
            a = pop();
            b = pop();
            push(a);
            push(b);
            break;
          case OP.pushwith:
            // TODO: We need to keep track that this is a with scope and thus it can have dynamic properties
            // attached to it. For now, push |Type.Any|.
            pop();
            scope.push(Type.Any);
            break;
          case OP.pushscope:
            scope.push(pop());
            break;
          case OP.pushnamespace:
            notImplementedBC();
            break;
          case OP.li8:
          case OP.li16:
          case OP.li32:
            push(Type.Int);
            break;
          case OP.lf32:
          case OP.lf64:
            push(Type.Number);
            break;
          case OP.si8:
          case OP.si16:
          case OP.si32:
            pop(Type.Int);
            break;
          case OP.sf32:
          case OP.sf64:
            pop(Type.Number);
            break;
          case OP.newfunction:
            push(Type.Function);
            break;
          case OP.call:
            stack.popMany(bc.argCount);
            object = pop();
            fn = pop();
            push(Type.Any);
            break;
          case OP.callmethod:
            // callmethod is always invalid
            // http://hg.mozilla.org/tamarin-redux/file/eb8f916bb232/core/Verifier.cpp#l1846
            throw new VerifierError("callmethod");
          case OP.callstatic:
            notImplementedBC();
            break;
          case OP.callsuper:
          case OP.callsupervoid:
          case OP.callpropvoid:
          case OP.callproperty:
          case OP.callproplex:
            stack.popMany(bc.argCount);
            mn = popMultiname();
            object = pop();
            if (op === OP.callsuper || op === OP.callsupervoid) {
              object = this.thisType.super();
              ti().baseClass = LazyInitializer.create(this.thisType.super().classType().object);
            }
            type = getProperty(object, mn);
            if (op === OP.callpropvoid || op === OP.callsupervoid) {
              break;
            }
            if (type instanceof MethodType) {
              returnType = Type.fromName(type.methodInfo.returnType, domain).instanceType();
            } else if (type instanceof TraitsType && type.isClassInfo()) {
              returnType = type.instanceType();
            } else {
              returnType = Type.Any;
            }
            push(returnType);
            break;
          case OP.returnvoid:
            this.returnType.merge(Type.Undefined);
            break;
          case OP.returnvalue:
            type = pop();
            if (methodInfo.returnType) {
              var coerceType = Type.fromName(methodInfo.returnType, this.domain).instanceType();
              if (coerceType.isSubtypeOf(type)) {
                ti().noCoercionNeeded = true;
              }
            }
            break;
          case OP.constructsuper:
            stack.popMany(bc.argCount);
            stack.pop();
            if (this.thisType.isInstanceInfo() && this.thisType.super() === Type.Object) {
              ti().noCallSuperNeeded = true;
            } else {
              ti().baseClass = LazyInitializer.create(this.thisType.super().classType().object);
            }
            break;
          case OP.construct:
            stack.popMany(bc.argCount);
            push(construct(pop()));
            break;
          case OP.constructprop:
            stack.popMany(bc.argCount);
            mn = popMultiname();
            push(construct(getProperty(stack.pop(), mn)));
            break;
          case OP.callsuperid:
            notImplementedBC();
            break;
          case OP.callinterface:
            notImplementedBC();
            break;
          case OP.sxi1:
          case OP.sxi8:
          case OP.sxi16:
            // Sign extend, nop.
            break;
          case OP.applytype:
            release || assert(bc.argCount === 1);
            value = pop();
            object = pop();
            if (object === Type.Any) {
              push(Type.Any);
            } else {
              push(object.applyType(value));
            }
            break;
          case OP.pushfloat4:
            notImplementedBC();
            break;
          case OP.newobject:
            stack.popMany(bc.argCount * 2);
            push(Type.Object);
            break;
          case OP.newarray:
            // Pops values, pushes result.
            stack.popMany(bc.argCount);
            push(Type.Array);
            break;
          case OP.newactivation:
            // push(Type.fromReference(new ActivationInfo(this.methodInfo)));
            push(Type.from(new ActivationInfo(this.methodInfo)));
            break;
          case OP.newclass:
            // The newclass bytecode is not supported because it needs
            // the base class which might not always be available.
            // The functions initializing classes should not be performance
            // critical anyway.
            // throw new VerifierError("Not Supported");
            push(Type.Any);
            break;
          case OP.getdescendants:
            popMultiname();
            pop();
            push(Type.XMLList);
            break;
          case OP.newcatch:
            push(Type.Any);
            break;
          case OP.findpropstrict:
            push(findProperty(popMultiname(), true));
            break;
          case OP.findproperty:
            push(findProperty(popMultiname(), false));
            break;
          case OP.finddef:
            notImplementedBC();
            break;
          case OP.getlex:
            mn = popMultiname();
            push(getProperty(findProperty(mn, true), mn));
            break;
          case OP.initproperty:
          case OP.setproperty:
            value = pop();
            mn = popMultiname();
            object = pop();
            setProperty(object, mn, value, bc);
            break;
          case OP.getlocal:
            push(local[bc.index]);
            break;
          case OP.setlocal:
            local[bc.index] = pop();
            break;
          case OP.getglobalscope:
            push(globalScope);
            ti().object = LazyInitializer.create(globalScope.object);
            break;
          case OP.getscopeobject:
            push(scope[bc.index]);
            break;
          case OP.getproperty:
            mn = popMultiname();
            object = pop();
            push(getProperty(object, mn));
            break;
          case OP.getouterscope:
            notImplementedBC();
            break;
          case OP.setpropertylate:
            notImplementedBC();
            break;
          case OP.deleteproperty:
            popMultiname();
            pop();
            push(Type.Boolean);
            break;
          case OP.deletepropertylate:
            notImplementedBC();
            break;
          case OP.getslot:
            push(accessSlot(pop()));
            break;
          case OP.setslot:
            value = pop();
            object = pop();
            accessSlot(object);
            break;
          case OP.getglobalslot:
            notImplementedBC();
            break;
          case OP.setglobalslot:
            notImplementedBC();
            break;
          case OP.convert_s:
            pop();
            push(Type.String);
            break;
          case OP.esc_xelem:
            pop();
            push(Type.String);
            break;
          case OP.esc_xattr:
            pop();
            push(Type.String);
            break;
          case OP.coerce_i:
          case OP.convert_i:
            pop();
            push(Type.Int);
            break;
          case OP.coerce_u:
          case OP.convert_u:
            pop();
            push(Type.Uint);
            break;
          case OP.coerce_d:
          case OP.convert_d:
            pop();
            push(Type.Number);
            break;
          case OP.coerce_b:
          case OP.convert_b:
            pop();
            push(Type.Boolean);
            break;
          case OP.convert_o:
            notImplementedBC();
            break;
          case OP.checkfilter:
            // nop.
            break;
          case OP.convert_f:
            pop();
            push(Type.Number);
            break;
          case OP.unplus:
            notImplementedBC();
            break;
          case OP.convert_f4:
            notImplementedBC();
            break;
          case OP.coerce:
            // print("<<< " + multinames[bc.index] + " >>>");
            type = pop();
            var coerceType = Type.fromName(multinames[bc.index], this.domain).instanceType();
            if (coerceType.isSubtypeOf(type)) {
              ti().noCoercionNeeded = true;
            }
            push(coerceType);
            break;
          case OP.coerce_a:
            // pop(); push(Type.Any);
            break;
          case OP.coerce_s:
            pop();
            push(Type.String);
            break;
          case OP.astype:
            notImplementedBC();
            break;
          case OP.astypelate:
            type = pop();
            pop();
            if (type instanceof TraitsType) {
              push(type.instanceType());
            } else {
              push(Type.Any);
            }
            break;
          case OP.coerce_o:
            notImplementedBC();
            break;
          case OP.negate:
          case OP.increment:
          case OP.decrement:
            pop();
            push(Type.Number);
            break;
          case OP.inclocal:
          case OP.declocal:
            local[bc.index] = Type.Number;
            break;
          case OP.typeof:
            pop();
            push(Type.String);
            break;
          case OP.not:
            pop();
            push(Type.Boolean);
            break;
          case OP.add:
            b = pop();
            a = pop();
            if (a.isNumeric() && b.isNumeric()) {
              push(Type.Number);
            } else if (a === Type.String || b === Type.String) {
              push(Type.String);
            } else {
              push(Type.Any);
            }
            break;
          case OP.subtract:
          case OP.multiply:
          case OP.divide:
          case OP.modulo:
            pop();
            pop();
            push(Type.Number);
            break;
          case OP.bitand:
          case OP.bitor:
          case OP.bitxor:
          case OP.lshift:
          case OP.rshift:
          case OP.urshift:
            pop();
            pop();
            push(Type.Int);
            break;
          case OP.bitnot:
            pop();
            push(Type.Int);
            break;
          case OP.equals:
          case OP.strictequals:
          case OP.lessthan:
          case OP.lessequals:
          case OP.greaterthan:
          case OP.greaterequals:
          case OP.instanceof:
          case OP.in:
            pop();
            pop();
            push(Type.Boolean);
            break;
          case OP.istype:
            pop();
            push(Type.Boolean);
            break;
          case OP.istypelate:
            pop();
            pop();
            push(Type.Boolean);
            break;
          case OP.inclocal_i:
          case OP.declocal_i:
            local[bc.index] = Type.Int;
            break;
          case OP.decrement_i:
          case OP.increment_i:
          case OP.negate_i:
            pop();
            push(Type.Int);
            break;
          case OP.add_i:
          case OP.subtract_i:
          case OP.multiply_i:
            pop();
            pop();
            push(Type.Int); // or Number?
            break;
          case OP.getlocal0:
          case OP.getlocal1:
          case OP.getlocal2:
          case OP.getlocal3:
            push(local[op - OP.getlocal0]);
            break;
          case OP.setlocal0:
          case OP.setlocal1:
          case OP.setlocal2:
          case OP.setlocal3:
            local[op - OP.setlocal0] = pop();
            break;
          case OP.debug:
            // Nop.
            break;
          case OP.debugline:
            // Nop.
            break;
          case OP.debugfile:
            // Nop.
            break;
          case OP.bkptline:
            // Nop.
            break;
          case OP.timestamp:
            // Nop.
            break;
          default:
            console.info("Not Implemented: " + bc);
        }
      }
    }
  }

  export class Verifier {
    verifyMethod(methodInfo: MethodInfo, scope: Info []) {
      new Verification(methodInfo, methodInfo.abc.applicationDomain, scope).verify();
    }
  }
}