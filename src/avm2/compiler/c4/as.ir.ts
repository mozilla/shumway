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
///<reference path='../../references.ts' />

module Shumway.AVM2.Compiler.IR {
  export class ASScope extends Value {
    constructor(public parent: Node, public object: Node, public isWith: boolean) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.parent);
      visitor(this.object);
    }
  }
  ASScope.prototype.nodeName = "ASScope";

  export class ASMultiname extends Value {
    constructor(public namespaces: Value, public name: Value, public flags: number) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      visitor(this.namespaces);
      visitor(this.name);
    }
  }
  ASMultiname.prototype.mustFloat = true;
  ASMultiname.prototype.nodeName = "ASMultiname";

  export class ASCallProperty extends CallProperty {
    constructor(control: Control, store: Store, object: Value, name: Value, args: Value [], flags: number, public isLex: boolean) {
      super(control, store, object, name, args, flags);
    }
  }
  ASCallProperty.prototype.nodeName = "ASCallProperty";

  export class ASCallSuper extends CallProperty {
    constructor(control: Control, store: Store, object: Value, name: Value, args: Value [], public scope: ASScope) {
      super(control, store, object, name, args, 0);
    }
    visitInputs(visitor: NodeVisitor) {
      super.visitInputs(visitor);
      visitor(this.scope);
    }
  }
  ASCallSuper.prototype.nodeName = "ASCallSuper";

  export class ASNew extends New {
    constructor(control: Control, store: Store, callee: Value, args: Value []) {
      super(control, store, callee, args);
    }
  }
  ASNew.prototype.nodeName = "ASNew";

  export class ASGetProperty extends GetProperty {
    constructor(control: Control, store: Store, object: Value, name: Value, public flags: number) {
      super(control, store, object, name);
    }
  }

  ASGetProperty.prototype.nodeName = "ASGetProperty";

  export class ASGetDescendants extends GetProperty {
    constructor(control: Control, store: Store, object: Value, name: Value) {
      super(control, store, object, name);
    }
  }
  ASGetDescendants.prototype.nodeName = "ASGetDescendants";

  export class ASHasProperty extends GetProperty {
    constructor(control: Control, store: Store, object: Value, name: Value) {
      super(control, store, object, name);
    }
  }
  ASHasProperty.prototype.nodeName = "ASHasProperty";

  export class ASGetSlot extends GetProperty {
    constructor(control: Control, store: Store, object: Value, name: Value) {
      super(control, store, object, name);
    }
  }
  ASGetSlot.prototype.nodeName = "ASGetSlot";

  export class ASGetSuper extends GetProperty {
    constructor(control: Control, store: Store, object: Value, name: Value, public scope: ASScope) {
      super(control, store, object, name);
    }
    visitInputs(visitor: NodeVisitor) {
      super.visitInputs(visitor);
      visitor(this.scope);
    }
  }
  ASGetSuper.prototype.nodeName = "ASGetSuper";

  export class ASSetProperty extends SetProperty {
    constructor(control: Control, store: Store, object: Value, name: Value, value: Value, public flags: number) {
      super(control, store, object, name, value);
    }
  }
  ASSetProperty.prototype.nodeName = "ASSetProperty";

  export class ASSetSlot extends SetProperty {
    constructor(control: Control, store: Store, object: Value, name: Value, value: Value) {
      super(control, store, object, name, value);
    }
  }
  ASSetSlot.prototype.nodeName = "ASSetSlot";

  export class ASSetSuper extends SetProperty {
    constructor(control: Control, store: Store, object: Value, name: Value, value: Value, public scope: Value) {
      super(control, store, object, name, value);
    }
    visitInputs(visitor: NodeVisitor) {
      super.visitInputs(visitor);
      visitor(this.scope);
    }
  }
  ASSetSuper.prototype.nodeName = "ASSetSuper";


  export class ASDeleteProperty extends DeleteProperty {
    constructor(control: Control, store: Store, object: Value, name: Value) {
      super(control, store, object, name);
    }
  }
  ASDeleteProperty.prototype.nodeName = "ASDeleteProperty";

  export class ASFindProperty extends StoreDependent {
    constructor(control: Control, store: Store, public scope: ASScope, public name: Value, public domain: Value, public strict: boolean) {
      super(control, store);
    }
    visitInputs(visitor: NodeVisitor) {
      super.visitInputs(visitor);
      visitor(this.scope);
      visitor(this.name);
      visitor(this.domain);
    }
  }

  ASFindProperty.prototype.nodeName = "ASFindProperty";

  export class ASGlobal extends Value {
    constructor(public control: Control, public scope: Value) {
      super();
    }
    visitInputs(visitor: NodeVisitor) {
      this.control && visitor(this.control);
      visitor(this.scope);
    }
  }

  ASGlobal.prototype.nodeName = "ASGlobal";

  export class ASNewActivation extends Value {
    constructor(public methodInfo: MethodInfo) {
      super();
    }
  }

  ASNewActivation.prototype.nodeName = "ASNewActivation";
}