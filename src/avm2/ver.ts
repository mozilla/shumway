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

module Shumway.AVMX {
  import assert = Shumway.Debug.assert;
  //import AbcFile = Shumway.AVM2.ABC.AbcFile;
  //import Multiname = Shumway.AVM2.ABC.Multiname;
  //import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  //import ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
  //import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
  //import Trait = Shumway.AVM2.ABC.Trait;
  //import Info = Shumway.AVM2.ABC.Info;
  //import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  //import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import popManyIntoVoid = Shumway.ArrayUtilities.popManyIntoVoid;
  //
  //import Scope = Shumway.AVM2.Runtime.Scope;

  var writer = 1 > 0 ? new IndentingWriter() : null;

  export class VerifierError {
    name: string;
    constructor(public message: string = "") {
      this.name = "VerifierError";
    }
  }

  export class TypeInformation {
    type: Type = null;
    baseClass: any = null;
    object: any = null;
    scopeDepth: number = -1;
    trait: TraitInfo = null;
    noCoercionNeeded: boolean = false;
    noCallSuperNeeded: boolean = false;
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
    static QName: TraitsType;
    static Namespace: TraitsType;
    static Dictionary: TraitsType;

    static byQN: { [s: string]: Type; } = Object.create(null);
    static byInfo: Map<Info, Type> = new Map<Info, Type>();

    static from(info: Info, domain: AXApplicationDomain): Type {
      var type = Type.byInfo.get(info);
      if (!type) {
        Type.byInfo.set(info, type = new TraitsType(info, domain));
      }
      return type;
    }

    static fromSimpleName(name: string, domain: AXApplicationDomain): TraitsType {
      var info = domain.findClassInfo(name);
      var type = info ? Type.from(info, domain) : Type.Any;
      return <TraitsType>type;
    }

    static fromName(mn: Multiname, domain: AXApplicationDomain): Type {
      if (mn === null) {
        return Type.Any;
      } else if (mn === undefined) {
        return Type.Undefined;
      } else {
        var qn = mn.isQName() ? mn.getMangledName() : undefined;
        if (qn) {
          var type = Type.byQN[qn];
          if (type) {
            return type;
          }
        }
        // REDUX
        //if (qn === Multiname.getPublicQualifiedName("void")) {
        //  return Type.Void;
        //}
        release || assert(domain, "An AXApplicationDomain is needed.");
        var info = domain.findClassInfo(mn.name);
        var type = info ? Type.from(info, domain) : Type.Any;
        if (mn.parameterType) {
          type = new ParameterizedType(<TraitsType>type, Type.fromName(mn.parameterType, domain));
        }
        return Type.byQN[qn] = type;
      }
      return null;
    }

    private static _typesInitialized = false;

    // TODO: We should differentiate between primitive types from different security
    // domains.
    public static initializeTypes(domain: AXApplicationDomain) {
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
      Type.QName        = Type.fromSimpleName("QName", domain).instanceType();
      Type.Namespace    = Type.fromSimpleName("Namespace", domain).instanceType();
      Type.Dictionary   = Type.fromSimpleName("flash.utils.Dictionary", domain).instanceType();
      Type._typesInitialized = true;
    }

    equals(other: Type): boolean {
      return this === other;
    }

    canBeXML() {
      return this === Type.Any || this === Type.Object ||
        this === Type.XML || this === Type.XMLList ||
        this === Type.QName || this === Type.QName;
    }

    isStrictComparableWith(other: Type) {
      return this === other && !this.canBeXML();
    }

    merge(other: Type): Type {
      return Type.Any;
    }

    instanceType(): Type {
      return Type.Any;
    }

    classType(): Type {
      return Type.Any;
    }

    super(): Type {
      release || Shumway.Debug.abstractMethod("super");
      return null;
    }

    applyType(parameter: Type) {
      return null;
    }

    getTrait(mn: Multiname | MultinameType, isSetter: boolean, followSuperType: boolean): TraitInfo {
      return null;
    }

    isNumeric(): boolean {
      return this === Type.Int || this === Type.Uint || this === Type.Number;
    }

    isString(): boolean {
      return this === Type.String;
    }

    isScriptInfo(): boolean {
      return false;
    }

    isClassInfo(): boolean {
      return false;
    }

    isInstanceInfo(): boolean {
      return false;
    }

    isMethodInfo(): boolean {
      return false;
    }

    isTraitsType(): boolean {
      return this instanceof TraitsType;
    }

    isParameterizedType(): boolean {
      return this instanceof ParameterizedType;
    }

    isMethodType(): boolean {
      return this instanceof MethodType;
    }

    isMultinameType(): boolean {
      return this instanceof MultinameType;
    }

    isConstantType(): boolean {
      return this instanceof ConstantType;
    }

    isSubtypeOf(other: Type) {
      if (this === other || this.equals(other)) {
        return true;
      }
      return this.merge(other) === this;
    }

    asTraitsType(): TraitsType {
      release || assert (this.isTraitsType());
      return <TraitsType>this;
    }

    asMethodType(): MethodType {
      release || assert (this.isMethodType());
      return <MethodType>this;
    }

    asMultinameType(): MultinameType {
      release || assert (this.isMultinameType());
      return <MultinameType>this;
    }

    asConstantType(): ConstantType {
      release || assert (this.isConstantType());
      return <ConstantType>this;
    }

    getConstantValue(): any {
      release || assert (this.isConstantType());
      return (<ConstantType>this).value;
    }

    asParameterizedType(): ParameterizedType {
      release || assert (this.isParameterizedType());
      return <ParameterizedType>this;
    }
  }

  export class AtomType extends Type {
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
    _cachedType: Type;
    constructor(public info: Info, public domain: AXApplicationDomain) {
      super();
    }

    instanceType(): TraitsType {
      release || assert(this.info instanceof ClassInfo);
      var classInfo = <ClassInfo>this.info;
      return <TraitsType>(this._cachedType || (this._cachedType = <TraitsType>Type.from(classInfo.instanceInfo, this.domain)));
    }

    classType(): TraitsType {
      release || assert(this.info instanceof InstanceInfo);
      var instanceInfo = <InstanceInfo>this.info;
      return <TraitsType>(this._cachedType || (this._cachedType = <TraitsType>Type.from(instanceInfo.classInfo, this.domain)));
    }

    super(): TraitsType {
      // REDUX
      return;

      //if (this.info instanceof ClassInfo) {
      //  return Type.Class;
      //}
      //release || assert(this.info instanceof InstanceInfo);
      //var instanceInfo = <InstanceInfo>this.info;
      //if (instanceInfo.superName) {
      //  var result = <TraitsType>Type.fromName(instanceInfo.superName, this.domain).instanceType();
      //  release || assert(result instanceof TraitsType && result.info instanceof InstanceInfo);
      //  return result;
      //}
      //return null;
    }

    findTraitByName(traits: Traits, mn: Multiname, isSetter: boolean): TraitInfo {
      traits.resolve();
      var isGetter = !isSetter;
      // REDUX: Handle getters / setters correctly here.
      return traits.getTrait(mn);
      //var trait;
      //if (!Multiname.isQName(mn)) {
      //  release || assert(mn instanceof Multiname);
      //  var multiname = <Multiname>mn;
      //  var dy;
      //  for (var i = 0; i < multiname.namespaces.length; i++) {
      //    var qname = multiname.getQName(i);
      //    if (mn.namespaces[i].isDynamic()) {
      //      dy = qname;
      //    } else {
      //      if ((trait = this.findTraitByName(traits, qname, isSetter))) {
      //        return trait;
      //      }
      //    }
      //  }
      //  if (dy) {
      //    return this.findTraitByName(traits, dy, isSetter);
      //  }
      //} else {
      //  var qn = Multiname.getQualifiedName(mn);
      //  for (var i = 0; i < traits.length; i++) {
      //    trait = traits[i];
      //    if (Multiname.getQualifiedName(trait.name) === qn) {
      //      if (isSetter && trait.isGetter() || isGetter && trait.isSetter()) {
      //        continue;
      //      }
      //      return trait;
      //    }
      //  }
      //}
    }

    getTrait(mn: Multiname | MultinameType, isSetter: boolean, followSuperType: boolean): TraitInfo {
      if (mn instanceof MultinameType) {
        return null;
      } else if (mn instanceof Multiname) {
        if (mn.isAttribute()) {
          return null;
        }
        if (followSuperType && (this.isInstanceInfo() || this.isClassInfo())) {
          var node = this;
          do {
            var trait = node.getTrait(mn, isSetter, false);
            if (!trait) {
              node = node.super();
            }
          } while (!trait && node);
          return trait;
        } else {
          return this.findTraitByName((<any>(this.info)).traits, mn, isSetter);
        }
      }
    }

    getTraitTypeNameAt(i: number): Multiname {
      // REDUX, we need to make sure the runtime traits are resolved here.
      var runtimeTrait = (<any>(this.info)).runtimeTraits.getSlot(i);
      if (runtimeTrait) {
        return runtimeTrait.typeName;
      }
      return null;
    }

    equals(other: Type): boolean {
      // REDUX
      return false; // return other.isTraitsType() && this.info.traits === (<TraitsType>other).info.traits;
    }

    merge(other: Type): Type {
      if (other.isTraitsType()) {
        if (this.equals(<TraitsType>other)) {
          return this;
        }
        if (this.isNumeric() && other.isNumeric()) {
          return Type.Number;
        }
        if (this.isInstanceInfo() && other.isInstanceInfo()) {
          var path = [];
          for (var curr = this; curr; curr = curr.super()) {
            path.push(curr);
          }
          for (var curr = <TraitsType>other; curr; curr = curr.super()) {
            for (var i = 0; i < path.length; i++) {
              if (path[i].equals(curr)) {
                return curr;
              }
            }
          }
          return Type.Object;
        }
      }
      return Type.Any;
    }

    isScriptInfo(): boolean {
      return this.info instanceof ScriptInfo;
    }

    isClassInfo(): boolean {
      return this.info instanceof ClassInfo;
    }

    isMethodInfo(): boolean {
      return this.info instanceof MethodInfo;
    }

    isInstanceInfo(): boolean {
      return this.info instanceof InstanceInfo;
    }

    isInstanceOrClassInfo(): boolean {
      return this.isInstanceInfo() || this.isClassInfo();
    }

    applyType(parameter: Type) {
      return new ParameterizedType(this, parameter);
    }

    private _getInfoName(): string {
      if (this.info instanceof ScriptInfo) {
        return "SI";
      } else if (this.info instanceof ClassInfo) {
        var classInfo = <ClassInfo>this.info;
        return "CI:" + classInfo.instanceInfo.getClassName();
      } else if (this.info instanceof InstanceInfo) {
        var instanceInfo = <InstanceInfo>this.info;
        return "II:" + instanceInfo.getClassName();
      } else if (this.info instanceof MethodInfo) {
        return "MI";
      }
//      else if (this.info instanceof ActivationInfo) {
//        return "AC";
//      }

      release || assert(false);
    }

    toString (): string {
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

  export class MethodType extends TraitsType {
    constructor(public methodInfo: MethodInfo, domain: AXApplicationDomain) {
      super(Type.Function.info, domain);
    }
    toString(): string {
      return "MT " + this.methodInfo;
    }
    returnType(): Type {
      // REDUX
      return null;
      // return this._cachedType || (this._cachedType = Type.fromName(this.methodInfo.returnType, this.domain));
    }
  }

  export class ActivationType extends TraitsType {
    constructor(public methodInfo: MethodInfo, domain: AXApplicationDomain) {
      super(Type.Function.info, domain);
    }
    toString(): string {
      return "AC";
    }
  }

  export class MultinameType extends Type {
    constructor(public namespaces: Type [], public name: Type, public mn: Multiname) {
      super();
    }
    toString(): string {
      return "MN";
    }
  }

  export class ParameterizedType extends TraitsType {
    constructor(public type: TraitsType, public parameter: Type) {
      super(type.info, type.domain);
    }
  }

  export class ConstantType extends Type {
    constructor(public value: any) {
      super();
    }
    toString(): string {
      return String(this.value);
    }
    static from(value: any): ConstantType {
      return new ConstantType(value);
    }
    static fromArray(array: any []): ConstantType [] {
      return array.map(value => new ConstantType(value));
    }
  }

  /**
   * Abstract Program State
   */
  export class State {
    static id = 0;
    id: number;
    originalId: number;
    stack: Type [];
    scope: Type [];
    local: Type [];
    constructor() {
      this.id = State.id += 1;
      this.originalId = this.id;
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
        ", $[" + this.scope.join(", ") + "]" +
        ", S[" + this.stack.join(", ") + "]>";
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
      State._mergeArrays(this.local, other.local, "Local");
      State._mergeArrays(this.stack, other.stack, "Stack");
      State._mergeArrays(this.scope, other.scope, "Scope");
    }
    private static _mergeArrays(a: Type [], b: Type [], name: string) {
      release || assert(a.length === b.length, name + " Array, a: " + a + " b: " + b);
      for (var i = a.length - 1; i >= 0; i--) {
        release || assert((a[i] !== undefined) && (b[i] !== undefined));
        if (a[i] === b[i]) {
          continue;
        }
        a[i] = a[i].merge(b[i]);
      }
    }
  }

  export class Verifier {
    domain: AXApplicationDomain;
    stateMap: { [s: number]: State; } = [];
    thisType: Type;
    activationType: ActivationType;
    savedScope: Type [];
    constructor(private methodInfo: MethodInfo) {
      if (methodInfo.trait) {
        methodInfo.trait.resolve();
      }
      writer && writer.writeLn("Verifying: " + methodInfo + ": " + methodInfo.trait);

      Type.initializeTypes(methodInfo.abc.applicationDomain);
      this.domain = methodInfo.abc.applicationDomain;
      this.savedScope = [];

      // REDUX IMPRECISE
      // this.thisType = methodInfo.holder ? Type.from(methodInfo.holder, this.domain) : Type.Any;
      //this.thisType = Type.Any;
      //this.thisType =
      if (methodInfo.trait) {
        this.thisType = Type.from(methodInfo.trait.holder, this.domain);
      } else {
        this.thisType = Type.Any;
      }

      this.activationType = new ActivationType(methodInfo, this.domain);
    }

    private prepareEntryState(): State {
      var entryState = new State();
      var methodInfo = this.methodInfo;

      entryState.local.push(this.thisType);

      // Initialize entry state with parameter types.
      var parameters = methodInfo.parameters;
      for (var i = 0; i < parameters.length; i++) {
        entryState.local.push(Type.fromName(parameters[i].getType(), this.domain).instanceType());
      }

      // Push the |rest| or |arguments| array type in the locals.
      var remainingLocals = methodInfo.getBody().localCount - methodInfo.parameters.length - 1;

      if (methodInfo.needsRest() || methodInfo.needsArguments()) {
        entryState.local.push(Type.Array);
        remainingLocals -= 1;
      }

      // Initialize locals with Type.Atom.Undefined.
      for (var i = 0; i < remainingLocals; i++) {
        entryState.local.push(Type.Undefined);
      }

      release || assert(entryState.local.length === methodInfo.getBody().localCount);

      return entryState;
    }

    verify() {
      var blockMap = new BlockMap(this.methodInfo.getBody());
      blockMap.build();
      blockMap.trace(writer, false);

      /**
       * Keep the blocks sorted in dominator order. The SortedList structure is based on a linked
       * list and uses a linear search to find the right insertion position and keep the list
       * sorted. The push operation takes O(n), the pull operations takes O(1).
       */
      var worklist = new Shumway.SortedList<Block>(function compare(a: Block, b: Block) {
        return a.blockID - b.blockID;
      });

      var entry = blockMap.blocks[0];
      var entryState = this.prepareEntryState();
      var stateMap = this.stateMap;

      stateMap[entry.blockID] = entryState;

      worklist.push(entry);

      /**
       * Iterative, fixed point alogorithm.
       */
      while (!worklist.isEmpty()) {
        var block = worklist.pop();
        if (writer) {
          writer.writeLn("Processing: " + BlockMap.blockToString(block));
        }

        // Use the entry state of the block.
        var state = stateMap[block.blockID].clone();

        // Run the abstract interpretation on the block. This mutates the passed
        // in |state| object.
        this.processBlock(block, state);
        if (writer) {
          writer.writeLn(state.toString());
        }
        for (var i = 0; i < block.successors.length; i++) {
          var successor = block.successors[i];
          if (worklist.contains(successor)) {
            // If the successor is already in the worklist then just merge the current
            // state into its entry state.
            if (writer) {
              writer.writeLn("Merging: " + stateMap[successor.blockID] + " with " + state);
            }
            stateMap[successor.blockID].merge(state);
            continue;
          } else if (stateMap[successor.blockID]) {
            // If the successor's entry state is not null then we must have processed it already.
            if (!stateMap[successor.blockID].isSubset(state)) {
              // If the entry state is not a subset of the current state, then reprocess the block
              // by adding it to the worklist.
              if (writer) {
                writer.writeLn("Recalculating: " + BlockMap.blockToString(successor) + " " + stateMap[successor.blockID] + " with " + state);
              }
              stateMap[successor.blockID].merge(state);
              worklist.push(successor);
            }
            continue;
          }
          // Propagate current state to successor blocks.
          if (writer) {
            writer.writeLn("Propagating: " + BlockMap.blockToString(successor) + " with " + state);
          }
          stateMap[successor.blockID] = state.clone();
          worklist.push(successor);
        }
      }
    }

    processBlock(block: Block, state: State) {
      var local = state.local;
      var stack = state.stack;
      var scope = state.scope;
      var abc = this.methodInfo.abc;
      var self = this;

      var a, b, i, argCount;
      var mn: Multiname | MultinameType;
      var receiver: Type, value: Type, object: Type;

      function push(x: Type) {
        release || assert(x);
        // ti().type = x;
        stack.push(x);
      }

      function pop(expectedType?: Type) {
        return stack.pop();
      }

      function popMultiname(i: number): Multiname | MultinameType {
        var mn = abc.getMultiname(i);
        if (mn.isRuntime()) {
          var name: Type;
          if (mn.isRuntimeName()) {
            name = pop();
          } else {
            name = ConstantType.from(mn.name);
          }
          var namespaces: Type [];
          if (mn.isRuntimeNamespace()) {
            namespaces = [pop()];
          } else {
            namespaces = ConstantType.fromArray(mn.namespaces);
          }
          return new MultinameType(namespaces, name, mn);
        }
        return mn;
      }

      function writeResult(type: Type, message: string) {
        writer.colorLn(type === Type.Any ? IndentingWriter.YELLOW : IndentingWriter.GREEN, message);
      }

      function getProperty(object: Type, mn: Multiname | MultinameType): Type {
        var type: Type = Type.Any;
        if (object.isTraitsType() && mn instanceof Multiname) {
          var trait = object.asTraitsType().getTrait(mn, false, false);
          if (trait) {
            if (trait instanceof SlotTraitInfo) {
              type = Type.fromName(trait.getTypeName(), self.domain).instanceType();
            }
          }
        }
        writer && writeResult(type, "getProperty(" + object + ", " + mn + ") => " + type);
        return type;
      }

      function findProperty(mn: Multiname | MultinameType, strict: boolean): Type {
        var type: Type = Type.Any;
        if (mn instanceof Multiname) {
          for (var i = scope.length - 1; i >= -self.savedScope.length; i--) {
            var scopeType = i >= 0 ? scope[i] : self.savedScope[self.savedScope.length + i];
            if (scopeType.isTraitsType()) {
              var trait = scopeType.asTraitsType().getTrait(mn, false, false);
              if (trait) {
                writer && writeResult(scopeType, "findProperty(" + mn + ") => " + scopeType);
                return scopeType;
              }
            } else {
              writer && writeResult(Type.Any, "findProperty(" + mn + ") => " + Type.Any + ", because of untyped scope object.");
              return Type.Any;
            }
          }
          // Search application domain.
          var script = self.domain.findDefiningScript(mn, false);
          if (script) {
            type = Type.from(script, self.domain);
          }
        }
        writer && writeResult(type, "findProperty(" + mn + ") => " + type);
        return type;
      }

      function getSlot(object: Type, i: number): Type {
        var type: Type = Type.Any;
        if (object.isTraitsType()) {
          var typeName = object.asTraitsType().getTraitTypeNameAt(i);
          if (typeName) {
            type = Type.fromName(typeName, self.domain).instanceType();
          }
        }
        writer && writeResult(type, "getSlot(" + object + ", " + i + ") => " + type);
        return type;
      }

      if (writer) {
        writer.indent();
      }
      var code = this.methodInfo.getBody().code;
      var bci = block.startBci;

      function u30(): number {
        var result = Bytes.u32(code, bci);
        bci += Bytes.s32Length(code, bci);
        return result;
      }

      while (bci <= block.endBci) {
        var bcs = bci;
        var bc: Bytecode = Bytes.u8(code, bci++);
        if (writer) {
          writer.writeLn(Bytecode[bc].padRight(" ", 20) + ": " + state);
        }
        switch (bc) {
          case Bytecode.THROW:
            pop();
            break;
          case Bytecode.PUSHNULL:
            push(Type.Null);
            break;
          case Bytecode.PUSHUNDEFINED:
            push(Type.Undefined);
            break;
          case Bytecode.PUSHBYTE:
          case Bytecode.PUSHSHORT:
            push(Type.Int);
            break;
          case Bytecode.PUSHSTRING:
            push(Type.String);
            break;
          case Bytecode.PUSHINT:
            push(Type.Int);
            break;
          case Bytecode.PUSHUINT:
            push(Type.Uint);
            break;
          case Bytecode.PUSHDOUBLE:
            push(Type.Number);
            break;
          case Bytecode.PUSHTRUE:
            push(Type.Boolean);
            break;
          case Bytecode.PUSHFALSE:
            push(Type.Boolean);
            break;
          case Bytecode.PUSHNAN:
            push(Type.Number);
            break;
          case Bytecode.POP:
            pop();
            break;
          case Bytecode.DUP:
            a = pop();
            push(a);
            push(a);
            break;
          case Bytecode.SWAP:
            a = pop();
            b = pop();
            push(a);
            push(b);
            break;
          case Bytecode.PUSHSCOPE:
            scope.push(pop());
            break;
          case Bytecode.PUSHWITH:
            pop()
            scope.push(Type.Any);
            break;
          case Bytecode.NEWARRAY:
            popManyIntoVoid(stack, u30());
            push(Type.Array);
            break;
          case Bytecode.NEWACTIVATION:
            push(self.activationType);
            break;
          case Bytecode.NEWOBJECT:
            popManyIntoVoid(stack, u30() * 2);
            push(Type.Object);
            break;
          case Bytecode.NEWCLASS:
            push(Type.Any);
            break;
          case Bytecode.NEWFUNCTION:
            push(Type.Function);
            break;
          case Bytecode.SETLOCAL0:
          case Bytecode.SETLOCAL1:
          case Bytecode.SETLOCAL2:
          case Bytecode.SETLOCAL3:
            local[bc - Bytecode.SETLOCAL0] = pop();
            break;
          case Bytecode.SETLOCAL:
            local[u30()] = pop();
            break;
          case Bytecode.GETGLOBALSCOPE:
            // REDUX
            push(Type.Any);
            break;
          case Bytecode.GETSCOPEOBJECT:
            push(scope[u30()]);
            break;
          case Bytecode.COERCE_S:
          case Bytecode.CONVERT_S:
            pop();
            push(Type.String);
            break;
          case Bytecode.COERCE_I:
          case Bytecode.CONVERT_I:
            pop();
            push(Type.Int);
            break;
          case Bytecode.COERCE_U:
          case Bytecode.CONVERT_U:
            pop();
            push(Type.Uint);
            break;
          case Bytecode.COERCE_D:
          case Bytecode.CONVERT_D:
            pop();
            push(Type.Number);
            break;
          case Bytecode.COERCE_B:
          case Bytecode.CONVERT_B:
            pop();
            push(Type.Boolean);
            break;
          case Bytecode.GETLOCAL:
            push(local[u30()]);
            break;
          case Bytecode.GETLOCAL0:
          case Bytecode.GETLOCAL1:
          case Bytecode.GETLOCAL2:
          case Bytecode.GETLOCAL3:
            push(local[bc - Bytecode.GETLOCAL0]);
            break;
          case Bytecode.IFNLT:
          case Bytecode.IFGE:
          case Bytecode.IFNLE:
          case Bytecode.IFGT:
          case Bytecode.IFNGT:
          case Bytecode.IFLE:
          case Bytecode.IFNGE:
          case Bytecode.IFLT:
          case Bytecode.IFEQ:
          case Bytecode.IFNE:
          case Bytecode.IFSTRICTEQ:
          case Bytecode.IFSTRICTNE:
            pop();
            pop();
            break;
          case Bytecode.IFTRUE:
          case Bytecode.IFFALSE:
          case Bytecode.LOOKUPSWITCH:
            pop();
            break;
          case Bytecode.POPSCOPE:
            scope.pop();
            break;
          case Bytecode.NEXTNAME:
          case Bytecode.NEXTVALUE:
            pop(Type.Int);
            pop();
            push(Type.Any);
            break;
          case Bytecode.HASNEXT:
            push(Type.Boolean);
            break;
          case Bytecode.HASNEXT2:
            push(Type.Boolean);
            break;
          case Bytecode.JUMP:
            break;
          case Bytecode.GETPROPERTY:
            mn = popMultiname(u30());
            object = pop();
            push(getProperty(object, mn));
            break;
          case Bytecode.GETSLOT:
            push(getSlot(pop(), u30()));
            break;
          case Bytecode.SETSLOT:
            // REDUX IMPRECISE
            pop();
            pop();
            break;
          case Bytecode.INITPROPERTY:
          case Bytecode.SETPROPERTY:
            // REDUX IMPRECISE
            value = pop();
            popMultiname(u30());
            receiver = pop();
            break;
          case Bytecode.NEGATE:
          case Bytecode.INCREMENT:
          case Bytecode.DECREMENT:
            pop();
            push(Type.Number);
            break;
          case Bytecode.INCLOCAL:
          case Bytecode.DECLOCAL:
            local[u30()] = Type.Number;
            break;
          case Bytecode.TYPEOF:
            pop();
            push(Type.String);
            break;
          case Bytecode.DECREMENT_I:
          case Bytecode.INCREMENT_I:
          case Bytecode.NEGATE_I:
            pop();
            push(Type.Int);
            break;
          case Bytecode.ADD_I:
          case Bytecode.SUBTRACT_I:
          case Bytecode.MULTIPLY_I:
            pop();
            pop();
            push(Type.Int); // REDUX: or maybe this should be Number?
            break;
          case Bytecode.NOT:
            pop();
            push(Type.Boolean);
            break;
          case Bytecode.ADD:
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
          case Bytecode.SUBTRACT:
          case Bytecode.MULTIPLY:
          case Bytecode.DIVIDE:
          case Bytecode.MODULO:
            pop();
            pop();
            push(Type.Number);
            break;
          case Bytecode.BITAND:
          case Bytecode.BITOR:
          case Bytecode.BITXOR:
          case Bytecode.LSHIFT:
          case Bytecode.RSHIFT:
          case Bytecode.URSHIFT:
            pop();
            pop();
            push(Type.Int);
            break;
          case Bytecode.BITNOT:
            pop();
            push(Type.Int);
            break;
          case Bytecode.EQUALS:
          case Bytecode.STRICTEQUALS:
          case Bytecode.LESSTHAN:
          case Bytecode.LESSEQUALS:
          case Bytecode.GREATERTHAN:
          case Bytecode.GREATEREQUALS:
          case Bytecode.INSTANCEOF:
          case Bytecode.IN:
            pop();
            pop();
            push(Type.Boolean);
            break;
          case Bytecode.ISTYPE:
            pop();
            push(Type.Boolean);
            break;
          case Bytecode.ISTYPELATE:
            pop();
            pop();
            push(Type.Boolean);
            break;
          case Bytecode.RETURNVOID:
            // REDUX NOT DONE;
            break;
          case Bytecode.RETURNVALUE:
            pop();
            break;
          case Bytecode.LABEL:
            break;
          case Bytecode.KILL:
            local[u30()] = Type.Undefined;
            break;
          case Bytecode.CONSTRUCTSUPER:
            // REDUX IMPRECISE
            popManyIntoVoid(stack, u30());
            receiver = pop();
            break;
          case Bytecode.CONSTRUCT:
            // REDUX IMPRECISE
            popManyIntoVoid(stack, u30());
            stack[stack.length - 1] = Type.Any;
            break;
          case Bytecode.CONSTRUCTPROP:
            // REDUX IMPRECISE
            i = u30();
            popManyIntoVoid(stack, u30());
            mn = popMultiname(i);
            stack[stack.length - 1] = Type.Any;
            break;
          case Bytecode.CALL:
            popManyIntoVoid(stack, u30());
            object = pop();
            pop();
            push(Type.Any);
            break;
          case Bytecode.CALLSUPER:
          case Bytecode.CALLSUPERVOID:
          case Bytecode.CALLPROPVOID:
          case Bytecode.CALLPROPERTY:
          case Bytecode.CALLPROPLEX:
            // REDUX IMPRECISE
            i = u30();
            popManyIntoVoid(stack, u30());
            mn = popMultiname(i);
            receiver = pop();
            if (bc === Bytecode.CALLPROPVOID || bc === Bytecode.CALLSUPERVOID) {
              break;
            }
            push(Type.Any);
            break;
          case Bytecode.FINDPROPSTRICT:
          case Bytecode.FINDPROPERTY:
            push(findProperty(popMultiname(u30()), bc === Bytecode.FINDPROPSTRICT))
            break;
          case Bytecode.COERCE:
            stack[stack.length - 1] = Type.fromName(<Multiname>popMultiname(u30()), self.domain).instanceType();
            break;
          case Bytecode.COERCE_A:
            break;
          case Bytecode.DEBUG:
          case Bytecode.DEBUGFILE:
          case Bytecode.DEBUGLINE:
          case Bytecode.BKPTLINE:
          case Bytecode.TIMESTAMP:
            break;
          default:
            notImplemented(Bytecode[bc]);
        }
        // release || assert(bci === (bcs + lengthAt(code, bcs)), "Current BCI: " + bci + ", expected: " + (bcs + lengthAt(code, bcs)));
        bci = bcs + lengthAt(code, bcs);
      }
      if (writer) {
        writer.outdent();
      }
    }
  }
}
