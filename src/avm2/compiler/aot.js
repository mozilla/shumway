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

/**
 * Throw away code, just used to debug the compiler for now.
 */

var hasUsedConstants = false;
function objectConstantName2(object) {
  hasUsedConstants = true;
  release || assert(object);
  if (object.hasOwnProperty(OBJECT_NAME)) {
    return object[OBJECT_NAME];
  }
  if (object instanceof LazyInitializer) {
    // console.warn("LazyInitializer: " + object.getName() + " : " + object.target);
    return object.getName();
  }
  // console.warn("Object: " + object);
  var name, id = objectIDs++;
  if (object instanceof Scope) {
    name = "$X" + id;
  } else if (object instanceof Global) {
    name = "$G" + id;
  } else if (object instanceof Multiname) {
    name = "$M" + id;
  } else if (isClass(object)) {
    name = "$C" + id;
  } else {
    name = "$O" + id;
  }
  Object.defineProperty(object, OBJECT_NAME, {value: name, writable: false, enumerable: false});
  jsGlobal[name] = object;
  return name;
}

function compileScript(script, writer) {
  writer.enter("{");
  objectConstantName = objectConstantName2;
  // TODO: Create correct scope chains.
  var scope = new Scope(null, new Global(script));
  script.traits.forEach(function (trait) {
    if (trait.isClass()) {
      compileClass(trait.classInfo, writer, scope);
    } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
      compileTrait(trait, writer, scope);
    }
  });
  writer.leave("},");
}

function compileTrait(trait, writer, scope) {
  var traitName = Multiname.getQualifiedName(trait.name);
  if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
    var methodInfo = trait.methodInfo;
    if (shouldCompile(methodInfo)) {
      ensureFunctionIsInitialized(methodInfo);
      try {
        hasUsedConstants = false;
        var method = createCompiledFunction(methodInfo, scope, false, false, false);
        if (trait.isMethod()) {
          writer.writeLn(VM_MEMOIZER_PREFIX + traitName + ": " + "function () { return this." + VM_OPEN_METHOD_PREFIX + traitName + ".bind(this); },");
        }
        if (trait.isMethod()) {
          writer.enter(VM_OPEN_METHOD_PREFIX + traitName + ": ");
        } else if (trait.isGetter()) {
          writer.enter(VM_OPEN_GET_METHOD_PREFIX + traitName + ": ");
        } else if (trait.isSetter()) {
          writer.enter(VM_OPEN_SET_METHOD_PREFIX + traitName + ": ");
        } else {
          writer.enter(traitName + ": ");
        }
        if (!hasUsedConstants) {
          writer.writeLns(method.toSource());
        } else {
          writer.writeLns("undefined");
        }
        writer.leave(",");
      } catch (x) {

      }
    }
  }
}

function compileClass(classInfo, writer, scope) {
  function compileTraits(traits, scope) {
    traits.forEach(function (trait) {
      compileTrait(trait, writer, scope);
    });
  }

  function compileInitializer(methodInfo, scope) {
    if (canCompile(methodInfo)) {
      ensureFunctionIsInitialized(methodInfo);
      var method = createCompiledFunction(methodInfo, scope, false, false, false);
      writer.enter("ctor:");
      writer.writeLns(method.toSource());
      writer.leave(", ");
    }
  }

  writer.enter("class_" + Multiname.getQualifiedName(classInfo.instanceInfo.name) + ": {");
  writer.enter("s: {");
  compileInitializer(classInfo.init, scope);
  compileTraits(classInfo.traits, scope);
  writer.leave("}, ");
  writer.enter("i: {");
  compileInitializer(classInfo.instanceInfo.init, scope);
  compileTraits(classInfo.instanceInfo.traits, scope);
  writer.leave("}");
  writer.leave("},");
}