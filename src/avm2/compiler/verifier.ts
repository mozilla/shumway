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

  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
  import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
  import Trait = Shumway.AVM2.ABC.Trait;
  import Info = Shumway.AVM2.ABC.Info;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import popManyIntoVoid = Shumway.ArrayUtilities.popManyIntoVoid;

  import Scope = Shumway.AVM2.Runtime.Scope;

  /**
   * Insertion sort SortedList backed by a linked list.
   */
  class SortedListNode<T> {
    value: T;
    next: SortedListNode<T>;
    constructor(value: T, next: SortedListNode<T>) {
      this.value = value;
      this.next = next;
    }
  }

  export class SortedList<T>  {
    public static RETURN = 1;
    public static DELETE = 2;
    private _compare: (l: T, r: T) => number;
    private _head: SortedListNode<T>;
    private _length: number;

    constructor (compare: (l: T, r: T) => number) {
      release || Debug.assert(compare);
      this._compare = compare;
      this._head = null;
      this._length = 0;
    }

    public push(value: T) {
      release || Debug.assert(value !== undefined);
      this._length ++;
      if (!this._head) {
        this._head = new SortedListNode<T>(value, null);
        return;
      }

      var curr = this._head;
      var prev = null;
      var node = new SortedListNode<T>(value, null);
      var compare = this._compare;
      while (curr) {
        if (compare(curr.value, node.value) > 0) {
          if (prev) {
            node.next = curr;
            prev.next = node;
          } else {
            node.next = this._head;
            this._head = node;
          }
          return;
        }
        prev = curr;
        curr = curr.next;
      }
      prev.next = node;
    }

    /**
     * Visitors can return RETURN if they wish to stop the iteration or DELETE if they need to delete the current node.
     * NOTE: DELETE most likley doesn't work if there are multiple active iterations going on.
     */
    public forEach(visitor: (value: T) => any) {
      var curr = this._head;
      var last = null;
      while (curr) {
        var result = visitor(curr.value);
        if (result === SortedList.RETURN) {
          return;
        } else if (result === SortedList.DELETE) {
          if (!last) {
            curr = this._head = this._head.next;
          } else {
            curr = last.next = curr.next;
          }
        } else {
          last = curr;
          curr = curr.next;
        }
      }
    }

    public isEmpty(): boolean {
      return !this._head;
    }

    public pop(): T {
      if (!this._head) {
        return undefined;
      }
      this._length --;
      var ret = this._head;
      this._head = this._head.next;
      return ret.value;
    }

    public contains(value: T): boolean {
      var curr = this._head;
      while (curr) {
        if (curr.value === value) {
          return true;
        }
        curr = curr.next;
      }
      return false;
    }

    public toString(): string {
      var str = "[";
      var curr = this._head;
      while (curr) {
        str += curr.value.toString();
        curr = curr.next;
        if (curr) {
          str += ",";
        }
      }
      str += "]";
      return str;
    }
  }
  
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
    trait: Trait = null;
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

    static _cache = {
      byQN: <Shumway.MapObject<Type>>Object.create(null),
      byHash: <Shumway.MapObject<Type>>Object.create(null)
    };

    static from(info: Info, domain: ApplicationDomain): Type {
      release || assert (info.hash);
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

    getTrait(mn: Type, isSetter: boolean, followSuperType: boolean): Trait {
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
    constructor(public info: Info, public domain: ApplicationDomain) {
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

    findTraitByName(traits: Trait [], mn: any, isSetter: boolean) {
      var isGetter = !isSetter;
      var trait;
      if (!Multiname.isQName(mn)) {
        release || assert(mn instanceof Multiname);
        var multiname = <Multiname>mn;
        var dy;
        for (var i = 0; i < multiname.namespaces.length; i++) {
          var qname = multiname.getQName(i);
          if (mn.namespaces[i].isDynamic()) {
            dy = qname;
          } else {
            if ((trait = this.findTraitByName(traits, qname, isSetter))) {
              return trait;
            }
          }
        }
        if (dy) {
          return this.findTraitByName(traits, dy, isSetter);
        }
      } else {
        var qn = Multiname.getQualifiedName(mn);
        for (var i = 0; i < traits.length; i++) {
          trait = traits[i];
          if (Multiname.getQualifiedName(trait.name) === qn) {
            if (isSetter && trait.isGetter() || isGetter && trait.isSetter()) {
              continue;
            }
            return trait;
          }
        }
      }
    }

    getTrait(mn: Type, isSetter: boolean, followSuperType: boolean): Trait {
      if (mn.isMultinameType()) {
        return null;
      }
      var mnValue = mn.getConstantValue();
      if (mnValue.isAttribute()) {
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
        return this.findTraitByName(this.info.traits, mnValue, isSetter);
      }
    }

    getTraitAt(slotId: number) {
      var traits = this.info.traits;
      for (var i = traits.length - 1; i >= 0; i--) {
        if (traits[i].slotId === slotId) {
          return traits[i];
        }
      }
      Shumway.Debug.unexpected("Cannot find trait with slotId: " + slotId + " in " + traits);
    }

    equals(other: Type): boolean {
      return other.isTraitsType() && this.info.traits === (<TraitsType>other).info.traits;
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

  export class MethodType extends TraitsType {
    constructor(public methodInfo: MethodInfo, domain: ApplicationDomain) {
      super(Type.Function.info, domain);
    }
    toString(): string {
      return "MT " + this.methodInfo;
    }
    returnType(): Type {
      return this._cachedType || (this._cachedType = Type.fromName(this.methodInfo.returnType, this.domain));
    }
  }

  export class MultinameType extends Type {
    constructor(public namespaces: Type [], public name: Type, public flags: number) {
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

  class Verification {
    writer: IndentingWriter = null;
    thisType: Type = null;
    returnType: Type;
    multinames: Multiname [];
    pushCount: number = 0;
    pushAnyCount: number = 0;
    constructor (
      public methodInfo: MethodInfo,
      public domain: ApplicationDomain,
      public savedScope: Type []
    ) {
      // ...
      Type.initializeTypes(domain);

      if (Shumway.AVM2.Verifier.traceLevel.value) {
        this.writer = new IndentingWriter();
      }
      this.multinames = methodInfo.abc.constantPool.multinames;
      this.returnType = Type.Undefined;
    }

    verify() {
      var methodInfo = this.methodInfo;
      if (this.writer) {
        this.methodInfo.trace(this.writer);
      }
      release || assert(methodInfo.localCount >= methodInfo.parameters.length + 1);
      this._verifyBlocks(this._prepareEntryState());
    }

    private _prepareEntryState(): State {
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

      release || assert(entryState.local.length === methodInfo.localCount);

      return entryState;
    }

    private _verifyBlocks(entryState: State) {
      var writer = this.writer;

      var blocks: Bytecode [] = this.methodInfo.analysis.blocks;

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
      var worklist = new Shumway.SortedList<Bytecode>(function compare(a: Bytecode, b: Bytecode) {
        return a.bdo - b.bdo;
      });


      blocks[0].verifierEntryState = entryState;
      worklist.push(blocks[0]);

      while (!worklist.isEmpty()) {

        var block = worklist.pop();
        var exitState = block.verifierEntryState.clone();

        this._verifyBlock(block, exitState);

        block.succs.forEach(function (successor: Bytecode) {
          if (worklist.contains(successor)) {
            if (writer) {
              writer.writeLn("Forward Merged Block: " + successor.bid + " " +
                exitState.toString() + " with " + successor.verifierEntryState.toString());
            }
            // merge existing item entry state with current block exit state
            successor.verifierEntryState.merge(exitState);
            if (writer) {
              writer.writeLn("Merged State: " + successor.verifierEntryState);
            }
            return;
          }

          if (successor.verifierEntryState) {
            if (!successor.verifierEntryState.isSubset(exitState)) {
              if (writer) {
                writer.writeLn("Backward Merged Block: " + block.bid + " with " + successor.bid + " " +
                  exitState.toString() + " with " + successor.verifierEntryState.toString());
              }
              successor.verifierEntryState.merge(exitState);
              worklist.push(successor);
              if (writer) {
                writer.writeLn("Merged State: " + successor.verifierEntryState);
              }
            }
            return;
          }

          successor.verifierEntryState = exitState;
          worklist.push(successor);
          if (writer) {
            writer.writeLn("Added Block: " + successor.bid +
              " to worklist: " + successor.verifierEntryState.toString());
          }
        });
      }

      if (writer) {
        writer.writeLn("Inferred return type: " + this.returnType);
        writer.writeLn("Quality pushCount: " + this.pushCount + ", pushAnyCount: " + this.pushAnyCount);
      }
      (<any>this.methodInfo).inferredReturnType = this.returnType;
    }

    private _verifyBlock(block: Bytecode, state: State) {
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
        self.pushCount ++;
        if (x === Type.Any) {
          self.pushAnyCount ++;
        }
      }

      function pop(expectedType?: Type) {
        return stack.pop();
      }

      function notImplementedBC() {
        notImplemented('Bytecode not implemented in verifier: ' + bc);
      }

      function popMultiname(): Type {
        var mn = self.multinames[bc.index];
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
          return new MultinameType(namespaces, name, mn.flags);
        }
        return ConstantType.from(mn);
      }

      function isNumericMultiname(mn: Type) {
        if (mn.isMultinameType() && mn.asMultinameType().name.isNumeric()) {
          return true;
        }
        if (mn.isConstantType() && Multiname.isNumeric(mn.getConstantValue())) {
          return true;
        }
        return false;
      }

      function getProperty(object: Type, mn: Type): Type {
        if (object.isTraitsType() || object.isParameterizedType()) {
          var traitsType = <TraitsType>object;
          var trait = traitsType.getTrait(mn, false, true);
          if (trait) {
            writer && writer.debugLn("getProperty(" + mn + ") -> " + trait);
            ti().trait = trait;
            if (trait.isSlot() || trait.isConst()) {
              return Type.fromName(trait.typeName, self.domain).instanceType();
            } else if (trait.isGetter()) {
              return Type.fromName(trait.methodInfo.returnType, self.domain).instanceType();
            } else if (trait.isClass()) {
              return Type.from(trait.classInfo, self.domain);
            } else if (trait.isMethod()) {
              return new MethodType(trait.methodInfo, self.domain);
            }
          } else if (isNumericMultiname(mn) && traitsType.isParameterizedType()) {
            var parameter = traitsType.asParameterizedType().parameter;
            writer && writer.debugLn("getProperty(" + mn + ") -> " + parameter);
            return parameter;
          } else if (traitsType === Type.Array) {
            // Can't do much about Arrays unfortunately.
          } else {
            writer && writer.warnLn("getProperty(" + mn + ")");
          }
        }
        return Type.Any;
      }

      function setProperty(object: Type, mn: Type, value: Type) {
        if (object.isTraitsType() || object.isParameterizedType()) {
          var traitsType = <TraitsType>object;
          var trait = traitsType.getTrait(mn, true, true);
          if (trait) {
            writer && writer.debugLn("setProperty(" + mn + ") -> " + trait);
            ti().trait = trait;
          } else if (isNumericMultiname(mn) && traitsType.isParameterizedType()) {
            // We can optimize these.
          } else if (traitsType === Type.Array) {
            // We can optimize these.
          } else {
            writer && writer.warnLn("setProperty(" + mn + ")");
          }
        }
      }

      function findProperty(mn: Type, strict: boolean): Type {
        if (mn.isMultinameType()) {
          return Type.Any;
        }

        var savedScope = self.savedScope;

        /**
         * Try to find the property in the scope stack. For instance methods the scope
         * stack should already have the instance object.
         */
        for (var i = scope.length - 1; i >= -savedScope.length; i--) {
          var type = i >= 0 ? scope[i] : savedScope[savedScope.length + i];
          if (type.isTraitsType()) {
            var traitsType = <TraitsType>type;
            // TODO: Should we be looking for getter / setter traits?
            var trait = traitsType.getTrait(mn, false, true);
            if (trait) {
              ti().scopeDepth = scope.length - i - 1;
              if (traitsType.isClassInfo() || traitsType.isScriptInfo()) {
                ti().object = Runtime.LazyInitializer.create(traitsType.info);
              }
              writer && writer.debugLn("findProperty(" + mn + ") -> " + traitsType);
              return traitsType;
            }
          } else {
            writer && writer.warnLn("findProperty(" + mn + ")");
            return Type.Any;
          }
        }

        var resolved = self.domain.findDefiningScript(mn.getConstantValue(), false);
        if (resolved) {
          ti().object = Runtime.LazyInitializer.create(resolved.script);
          var type = Type.from(resolved.script, self.domain);
          writer && writer.debugLn("findProperty(" + mn + ") -> " + type);
          return type;
        }

        writer && writer.warnLn("findProperty(" + mn + ")");
        return Type.Any;
      }

      function accessSlot(object: Type): Type {
        if (object instanceof TraitsType) {
          var traitsType = <TraitsType>object;
          var trait = traitsType.getTraitAt(bc.index);
          writer && writer.debugLn("accessSlot() -> " + trait);
          if (trait) {
            ti().trait = trait;
            if (trait.isSlot()) {
              return Type.fromName(trait.typeName, self.domain).instanceType();
            } else if (trait.isClass()) {
              return Type.from(trait.classInfo, self.domain);
            }
          }
        }
        return Type.Any;
      }

      function construct(object: Type): Type {
        if (object.isTraitsType() || object.isParameterizedType()) {
          if (object === Type.Function || object === Type.Class || object === Type.Object) {
            return Type.Object;
          }
          return object.instanceType();
        } else {
          writer && writer.warnLn("construct(" + object + ")");
          return Type.Any;
        }
      }

      var globalScope = this.savedScope[0];
      var value: Type, object: Type, a: Type, b: Type, object: Type, mn: Type, type: Type, returnType: Type;
      
      for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
        bc = bytecodes[bci];
        var op = bc.op;

        /**
         * Skip debug ops.
         */
        if (op === OP.debugline || op === OP.debugfile) {
          continue;
        }

        if (writer && Shumway.AVM2.Verifier.traceLevel.value > 1) {
          writer.writeLn(("stateBefore: " + state.toString() + " $$[" + this.savedScope.join(", ") + "]").padRight(' ', 100) + " : " + bci + ", " + bc.toString(methodInfo.abc));
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
            ti().baseClass = Runtime.LazyInitializer.create(this.thisType.asTraitsType().super().classType().info);
            push(getProperty(object.super(), mn));
            break;
          case OP.setsuper:
            value = pop();
            mn = popMultiname();
            object = pop();
            release || assert(object.super());
            ti().baseClass = Runtime.LazyInitializer.create(this.thisType.asTraitsType().super().classType().info);
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
            popManyIntoVoid(stack, bc.argCount);
            object = pop();
            pop();
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
            popManyIntoVoid(stack, bc.argCount);
            mn = popMultiname();
            object = pop();
            if (op === OP.callsuper || op === OP.callsupervoid) {
              object = this.thisType.super();
              ti().baseClass = Runtime.LazyInitializer.create(this.thisType.asTraitsType().super().classType().info);
            }
            type = getProperty(object, mn);
            if (op === OP.callpropvoid || op === OP.callsupervoid) {
              break;
            }
            if (type.isMethodType()) {
              returnType = type.asMethodType().returnType().instanceType();
            } else if (type.isTraitsType() && type.isClassInfo()) {
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
            popManyIntoVoid(stack, bc.argCount);
            stack.pop();
            if (this.thisType.isInstanceInfo() && this.thisType.super() === Type.Object) {
              ti().noCallSuperNeeded = true;
            } else {
              ti().baseClass = Runtime.LazyInitializer.create(this.thisType.asTraitsType().super().classType().info);
            }
            break;
          case OP.construct:
            popManyIntoVoid(stack, bc.argCount);
            push(construct(pop()));
            break;
          case OP.constructprop:
            popManyIntoVoid(stack, bc.argCount);
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
            popManyIntoVoid(stack, bc.argCount * 2);
            push(Type.Object);
            break;
          case OP.newarray:
            popManyIntoVoid(stack, bc.argCount);
            push(Type.Array);
            break;
          case OP.newactivation:
            push(Type.from(this.methodInfo, this.domain));
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
            setProperty(object, mn, value);
            break;
          case OP.getlocal:
            push(local[bc.index]);
            break;
          case OP.setlocal:
            local[bc.index] = pop();
            break;
          case OP.getglobalscope:
            push(globalScope);
            ti().object = Runtime.LazyInitializer.create(globalScope.asTraitsType().info);
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
            var coerceType = Type.fromName(this.multinames[bc.index], this.domain).instanceType();
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
            type = pop();
            var asType = Type.fromName(this.multinames[bc.index], this.domain).instanceType();
            if (asType.isSubtypeOf(type)) {
              ti().noCoercionNeeded = true;
            }
            push(asType);
            break;
          case OP.astypelate:
            type = pop();
            pop();
            if (type === Type.Class) {
              push(type);
            } else if (type.isTraitsType()) {
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
          case OP.bkptline:
            // Nop.
            break;
          case OP.timestamp:
            // Nop.
            break;
          default:
            notImplemented(bc);
            break;
        }
      }
    }
  }

  export class Verifier {
    private _prepareScopeObjects(methodInfo: MethodInfo, scope: Scope): Type [] {
      var domain = methodInfo.abc.applicationDomain;
      var scopeObjects = scope.getScopeObjects();
      return scopeObjects.map(function (object) {
        if (object instanceof Info) {
          return Type.from(object, domain);
        }
        if (object instanceof Shumway.AVM2.Runtime.Global) {
          return Type.from(object.scriptInfo, domain);
        }
        if (object instanceof Shumway.AVM2.AS.ASClass) {
          return Type.from((<Shumway.AVM2.AS.ASClass>object).classInfo, domain);
        }
        if (object instanceof Shumway.AVM2.Runtime.ActivationInfo) {
          return Type.from(object.methodInfo, domain);
        }
        if (object.class) {
          return Type.from(object.class.classInfo.instanceInfo, domain);
        }
        release || assert (false, object.toString());
        return Type.Any;
      });
    }
    verifyMethod(methodInfo: MethodInfo, scope: Scope) {
      var scopeTypes = this._prepareScopeObjects(methodInfo, scope);
      new Verification(methodInfo, methodInfo.abc.applicationDomain, scopeTypes).verify();
    }
  }
}
