/*
 * Copyright 2014 Mozilla Foundation
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

module Shumway.AVM2.Compiler.IR {
  import assert = Shumway.Debug.assert;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import unexpected = Shumway.Debug.unexpected;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;

  export interface NodeVisitor {
    (node: Node): void;
  }

  export interface BlockVisitor {
    (block: Block): void;
  }

  function visitArrayInputs(array: Node [], visitor: NodeVisitor) {
    for (var i = 0; i < array.length; i++) {
      visitor(array[i]);
    }
  }

  // Clean this up.
  export enum Flags {
    NumericProperty = 0x01,
    RESOLVED = 0x02,
    PRISTINE = 0x04,
    IS_METHOD = 0x08,
    AS_CALL = 0x10
  }

  export class Node {
    abstract: boolean; // TODO: No idea what this is for.

    private static _nextID: number [] = [];

    static getNextID(): number {
      return Node._nextID[Node._nextID.length - 1] += 1
    }

    id: number;
    control: Control;
    nodeName: string;
    variable: Variable;
    mustFloat: boolean;
    shouldFloat: boolean;
    shouldNotFloat: boolean;

    constructor() {
      this.id = Node.getNextID();
    }

    compile: (cx) => void;

    visitInputs(visitor: NodeVisitor) {
      //...
    }

    static startNumbering() {
      Node._nextID.push(0);
    }

    static stopNumbering() {
      Node._nextID.pop();
    }

    toString(brief?: boolean) {
      if (brief) {
        return nameOf(this);
      }
      var inputs = [];
      this.visitInputs(function (input) {
        inputs.push(nameOf(input));
      });
      var result = nameOf(this) + " = " + this.nodeName.toUpperCase();
      if (inputs.length) {
        result += " " + inputs.join(", ");
      }
      return result;
    }

    visitInputsNoConstants(visitor: NodeVisitor) {
      this.visitInputs(function (node) {
        if (isConstant(node)) {
          return;
        }
        visitor(node);
      });
    }

    replaceInput(oldInput: Node, newInput: Node) {
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
    }
  }

  Node.prototype.nodeName = "Node";

  export class Control extends Node {
    constructor() {
      super();
    }
  }
  Control.prototype.nodeName = "Control";

  export class Region extends Control {
    entryState: any;
    predecessors: Control [];
    constructor(control: Control) {
      super();
      this.predecessors = control ? [control] : [];
    }
    visitInputs(visitor: NodeVisitor) {
      visitArrayInputs(this.predecessors, visitor);
    }
  }
  Region.prototype.nodeName = "Region";

  export class Start extends Region {
    scope: Node;
    constructor() {
      super(null);
      this.control = this;
    }
    visitInputs(visitor: NodeVisitor) {
      visitArrayInputs(this.predecessors, visitor);
      visitor(this.scope);
    }
  }
  Start.prototype.nodeName = "Start";

  export class End extends Control {
    constructor(public control: Control) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
    }
  }
  End.prototype.nodeName = "End";

  export class Stop extends End {
    constructor(control: Control, public store: Store, public argument: Value) {
      super(control);
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
      visitor(this.store);
      visitor(this.argument);
    }
  }
  Stop.prototype.nodeName = "Stop";

  export class If extends End {
    constructor(control: Control, public predicate: Value) {
      super(control);
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
      visitor(this.predicate);
    }
  }
  If.prototype.nodeName = "If";

  export class Switch extends End {
    constructor(control, public determinant: Value) {
      super(control);
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
      visitor(this.determinant);
    }
  }
  Switch.prototype.nodeName = "Switch";

  export class Jump extends End {
    constructor(control) {
      super(control);
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
    }
  }
  Jump.prototype.nodeName = "Jump";

  export class Value extends Node {
    ty: Shumway.AVM2.Verifier.Type;
    constructor() {
      super();
    }
  }
  Value.prototype.nodeName = "Value";

  export class Store extends Value {
    constructor() {
      super();
    }
  }
  Store.prototype.nodeName = "Store";

  export class StoreDependent extends Value {
    loads: Node [];
    constructor(public control: Control, public store: Store) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
    }
  }

  StoreDependent.prototype.nodeName = "StoreDependent";

  export class Call extends StoreDependent {
    constructor(control: Control, store: Store, public callee: Value, public object: Value, public args: Value [], public flags: number) {
      super(control, store);
    }
    visitInputs(visitor: NodeVisitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.callee);
      this.object && visitor(this.object);
      visitArrayInputs(this.args, visitor);
    }
  }

  Call.prototype.nodeName = "Call";

  export class New extends StoreDependent {
    constructor(control: Control, store: Store, public callee: Value, public args: Value []) {
      super(control, store);
    }
    visitInputs(visitor: NodeVisitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.callee);
      visitArrayInputs(this.args, visitor);
    }
  }

  New.prototype.nodeName = "New";

  export class GetProperty extends StoreDependent {
    constructor(control: Control, store: Store, public object: Value, public name: Value) {
      super(control, store);
    }
    visitInputs(visitor: NodeVisitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
    }
  }

  GetProperty.prototype.nodeName = "GetProperty";

  export class SetProperty extends StoreDependent {
    constructor(control: Control, store: Store, public object: Value, public name: Value, public value: Value) {
      super(control, store);
    }
    visitInputs(visitor: NodeVisitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
      visitor(this.value);
    }
  }

  SetProperty.prototype.nodeName = "SetProperty";

  export class DeleteProperty extends StoreDependent {
    constructor(control, store, public object: Value, public name: Value) {
      super(control, store);
    }
    visitInputs(visitor: NodeVisitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
    }
  }

  DeleteProperty.prototype.nodeName = "DeleteProperty";

  export class CallProperty extends StoreDependent {
    constructor(control: Control, store: Store, public object: Value, public name: Value, public args: Value [], public flags: number) {
      super(control, store);
    }
    visitInputs(visitor: NodeVisitor) {
      this.control && visitor(this.control);
      this.store && visitor(this.store);
      this.loads && visitArrayInputs(this.loads, visitor);
      visitor(this.object);
      visitor(this.name);
      visitArrayInputs(this.args, visitor);
    }
  }

  CallProperty.prototype.nodeName = "CallProperty";

  export class Phi extends Value {
    isLoop: boolean;
    sealed: boolean;
    args: Value [];
    constructor(public control: Control, value: Value) {
      super();
      this.control = control;
      this.args = value ? [value] : [];
    }
    visitInputs(visitor: NodeVisitor) {
      this.control && visitor(this.control);
      visitArrayInputs(this.args, visitor);
    }
    seal() {
      this.sealed = true;
    }
    pushValue(x: Value) {
      release || assert (!this.sealed);
      this.args.push(x);
    }
  }

  Phi.prototype.nodeName = "Phi";

  export class Variable extends Value {
    constructor(public name: string) {
      super();
    }
  }

  Variable.prototype.nodeName = "Variable";

  export class Copy extends Value {
    constructor(public argument: Value) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.argument);
    }
  }

  Copy.prototype.nodeName = "Copy";

  export class Move extends Value {
    constructor(public to: Variable, public from: Value) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.to);
      visitor(this.from);
    }
  }

  Move.prototype.nodeName = "Move";

  export enum ProjectionType {
    CASE,
    TRUE,
    FALSE,
    STORE,
    SCOPE
  }

  export class Projection extends Value {
    constructor(public argument: Node, public type: ProjectionType, public selector?: Constant) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.argument);
    }
    project(): Node {
      return this.argument;
    }
  }

  Projection.prototype.nodeName = "Projection";

  export class Latch extends Value {
    constructor(public control: Control, public condition: Value, public left: Value, public right: Value) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      this.control && visitor(this.control);
      visitor(this.condition);
      visitor(this.left);
      visitor(this.right);
    }
  }

  Latch.prototype.nodeName = "Latch";

  export class Operator {
    not: Operator;
    static byName: Shumway.Map<Operator> = createEmptyObject();

    constructor(public name: string, public evaluate: Function, public isBinary: boolean) {
      Operator.byName[name] = this;
    }

    static ADD    = new Operator("+",   (l, r) => l + r,      true);
    static SUB    = new Operator("-",   (l, r) => l - r,      true);
    static MUL    = new Operator("*",   (l, r) => l * r,      true);
    static DIV    = new Operator("/",   (l, r) => l / r,      true);
    static MOD    = new Operator("%",   (l, r) => l % r,      true);
    static AND    = new Operator("&",   (l, r) => l & r,      true);
    static OR     = new Operator("|",   (l, r) => l | r,      true);
    static XOR    = new Operator("^",   (l, r) => l ^ r,      true);
    static LSH    = new Operator("<<",  (l, r) => l << r,     true);
    static RSH    = new Operator(">>",  (l, r) => l >> r,     true);
    static URSH   = new Operator(">>>", (l, r) => l >>> r,    true);
    static SEQ    = new Operator("===", (l, r) => l === r,    true);
    static SNE    = new Operator("!==", (l, r) => l !== r,    true);
    static EQ     = new Operator("==",  (l, r) => l == r,     true);
    static NE     = new Operator("!=",  (l, r) => l != r,     true);
    static LE     = new Operator("<=",  (l, r) => l <= r,     true);
    static GT     = new Operator(">",   (l, r) => l > r,      true);
    static LT     = new Operator("<",   (l, r) => l < r,      true);
    static GE     = new Operator(">=",  (l, r) => l >= r,     true);
    static PLUS   = new Operator("+",   (a) => +a,            false);
    static NEG    = new Operator("-",   (a) => -a,            false);
    static TRUE   = new Operator("!!",  (a) => !!a,           false);
    static FALSE  = new Operator("!",   (a) => !a,            false);

    static TYPE_OF     = new Operator("typeof", (a) => typeof a,  false);
    static BITWISE_NOT = new Operator("~", (a) => ~a,             false);
    static AS_ADD      = new Operator("+", function (l, r) {
      if (typeof l === "string" || typeof r === "string") {
        return String(l) + String(r);
      }
      return l + r;
    }, true);

    static linkOpposites(a: Operator, b: Operator) {
      a.not = b;
      b.not = a;
    }

    static fromName(name: string) {
      return Operator.byName[name];
    }
  }

  Operator.linkOpposites(Operator.SEQ, Operator.SNE);
  Operator.linkOpposites(Operator.EQ, Operator.NE);
  Operator.linkOpposites(Operator.TRUE, Operator.FALSE);

  export class Binary extends Value {
    constructor(public operator: Operator, public left: Value, public right: Value) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.left);
      visitor(this.right);
    }
  }

  Binary.prototype.nodeName = "Binary";

  export class Unary extends Value {
    constructor(public operator: Operator, public argument: Value) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.argument);
    }
  }

  Unary.prototype.nodeName = "Unary";

  export class Constant extends Value {
    constructor(public value: any) {
      super();
    }
  }

  Constant.prototype.nodeName = "Constant";

  export class GlobalProperty extends Value {
    constructor(public name: string) {
      super();
    }
  }

  GlobalProperty.prototype.nodeName = "GlobalProperty";

  export class This extends Value {
    constructor(public control: Control) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
    }
  }

  This.prototype.nodeName = "This";

  export class Throw extends Value {
    constructor(public control: Control, public argument: Value) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
      visitor(this.argument);
    }
  }

  Throw.prototype.nodeName = "Throw";

  export class Arguments extends Value {
    constructor(public control: Control) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
    }
  }

  Arguments.prototype.nodeName = "Arguments";

  export class Parameter extends Value {
    constructor(public control: Control, public index: number, public name: string) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
    }
  }

  Parameter.prototype.nodeName = "Parameter";

  export class NewArray extends Value {
    constructor(public control: Control, public elements: Value []) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
      visitArrayInputs(this.elements, visitor);
    }
  }

  NewArray.prototype.nodeName = "NewArray";

  export class NewObject extends Value {
    constructor(public control: Control, public properties: KeyValuePair []) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.control);
      visitArrayInputs(this.properties, visitor);
    }
  }

  NewObject.prototype.nodeName = "NewObject";

  export class KeyValuePair extends Value {
    constructor(public key: Value, public value: Value) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.key);
      visitor(this.value);
    }
  }

  KeyValuePair.prototype.mustFloat = true;
  KeyValuePair.prototype.nodeName = "KeyValuePair";

  export function nameOf(node) {
    var useColors = false;
    var result;
    if (node instanceof Constant) {
      if (node.value instanceof Multiname) {
        return node.value.name;
      }
      return node.value;
    } else if (node instanceof Variable) {
      return node.name;
    } else if (node instanceof Phi) {
      return result = "|" + node.id + "|", useColors ? IndentingWriter.PURPLE + result + IndentingWriter.ENDC : result;
    } else if (node instanceof Control) {
      return result = "{" + node.id + "}", useColors ? IndentingWriter.RED + result + IndentingWriter.ENDC : result;
    } else if (node instanceof Projection) {
      if (node.type === ProjectionType.STORE) {
        return result = "[" + node.id + "->" + node.argument.id + "]", useColors ? IndentingWriter.YELLOW + result + IndentingWriter.ENDC : result;
      }
      return result = "(" + node.id + ")", useColors ? IndentingWriter.GREEN + result + IndentingWriter.ENDC : result;
    } else if (node instanceof Value) {
      return result = "(" + node.id + ")", useColors ? IndentingWriter.GREEN + result + IndentingWriter.ENDC : result;
    } else if (node instanceof Node) {
      return node.id;
    }
    unexpected(node + " " + typeof node);
  }
}