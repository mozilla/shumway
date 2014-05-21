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

module Shumway.AVM2.Compiler {
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

  ASScope.prototype.nodeName = "ASMultiname";
}

/*
export class ASCallProperty extends CallProperty {
  constructor(control, store, object, name, args, flags, isLex) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
    visitArrayInputs(this.args, visitor);
  }
}

ASCallProperty.prototype.nodeName = "ASCallProperty";

export class ASCallSuper extends CallProperty {
  constructor(control, store, object, name, args, flags, scope) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
    visitArrayInputs(this.args, visitor);
    visitor(this.scope);
  }
}

ASCallSuper.prototype.nodeName = "ASCallSuper";

export class ASNew extends New {
  constructor(control, store, callee, args) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.callee);
    visitArrayInputs(this.args, visitor);
  }
}

ASNew.prototype.nodeName = "ASNew";



export class ASGetProperty extends GetProperty {
  constructor(control, store, object, name, flags) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
  }
}

ASGetProperty.prototype.nodeName = "ASGetProperty";

export class ASGetDescendants extends GetProperty {
  constructor(control, store, object, name) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
  }
}

ASGetDescendants.prototype.nodeName = "ASGetDescendants";

export class ASHasProperty extends GetProperty {
  constructor(control, store, object, name) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
  }
}

ASHasProperty.prototype.nodeName = "ASHasProperty";

export class ASGetSlot extends GetProperty {
  constructor(control, store, object, name) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
  }
}

ASGetSlot.prototype.nodeName = "ASGetSlot";

export class ASGetSuper extends GetProperty {
  constructor(control, store, object, name, scope) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
    visitor(this.scope);
  }
}

ASGetSuper.prototype.nodeName = "ASGetSuper";



export class ASSetProperty extends SetProperty {
  constructor(control, store, object, name, value, flags) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
    visitor(this.value);
  }
}

ASSetProperty.prototype.nodeName = "ASSetProperty";

export class ASSetSlot extends SetProperty {
  constructor(control, store, object, name, value) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
    visitor(this.value);
  }
}

ASSetSlot.prototype.nodeName = "ASSetSlot";

export class ASSetSuper extends SetProperty {
  constructor(control, store, object, name, value, scope) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
    visitor(this.value);
    visitor(this.scope);
  }
}

ASSetSuper.prototype.nodeName = "ASSetSuper";



export class ASDeleteProperty extends DeleteProperty {
  constructor(control, store, object, name) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.object);
    visitor(this.name);
  }
}

ASDeleteProperty.prototype.nodeName = "ASDeleteProperty";

export class ASFindProperty extends StoreDependent {
  constructor(control, store, scope, name, domain, strict) {
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
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    this.store && visitor(this.store);
    this.loads && visitArrayInputs(this.loads, visitor);
    visitor(this.scope);
    visitor(this.name);
    visitor(this.domain);
  }
}

ASFindProperty.prototype.nodeName = "ASFindProperty";




export class ASScope extends Value {
  constructor(parent, object, isWith) {
    release || assert (arguments.length >= 3, "ASScope not enough args.");
    this.parent = parent;
    this.object = object;
    this.isWith = isWith;
    this.id = nextID[nextID.length - 1] += 1;
  }
  visitInputs(visitor: NodeVisitor) {
    visitor(this.parent);
    visitor(this.object);
  }
}

ASScope.prototype.nodeName = "ASScope";

export class ASGlobal extends Value {
  constructor(control, scope) {
    release || assert (isControlOrNull(control), "control");
    release || assert (isScope(scope), "scope");
    release || assert (arguments.length >= 2, "ASGlobal not enough args.");
    this.control = control;
    this.scope = scope;
    this.id = nextID[nextID.length - 1] += 1;
  }
  visitInputs(visitor: NodeVisitor) {
    this.control && visitor(this.control);
    visitor(this.scope);
  }
}

ASGlobal.prototype.nodeName = "ASGlobal";

export class ASNewActivation extends Value {
  constructor(methodInfo) {
    release || assert (arguments.length >= 1, "ASNewActivation not enough args.");
    this.methodInfo = methodInfo;
    this.id = nextID[nextID.length - 1] += 1;
  }
  visitInputs(visitor: NodeVisitor) {
  }
}

ASNewActivation.prototype.nodeName = "ASNewActivation";

export class ASMultiname extends Value {
  constructor(namespaces, name, flags) {
    release || assert (arguments.length >= 3, "ASMultiname not enough args.");
    this.namespaces = namespaces;
    this.name = name;
    this.flags = flags;
    this.id = nextID[nextID.length - 1] += 1;
  }
  visitInputs(visitor: NodeVisitor) {
    visitor(this.namespaces);
    visitor(this.name);
  }
}

ASMultiname.prototype.nodeName = "ASMultiname";
*/