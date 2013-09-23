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

function compileScript(script, writer) {
  script.traits.forEach(function (trait) {
    if (trait.isClass()) {
      compileClass(trait.classInfo, writer);
    } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
      compileTrait(trait, writer);
    }
  });
}

function compileTrait(trait, writer) {
  var traitName = Multiname.getQualifiedName(trait.name);
  if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
    var methodInfo = trait.methodInfo;
    if (shouldCompile(methodInfo)) {
      ensureFunctionIsInitialized(methodInfo);
      try {
        var method = createCompiledFunction(methodInfo, new Scope(null, {}), false, false, false);
        if (trait.isMethod()) {
          writer.writeLn("get " + traitName + "() { return this." + VM_OPEN_METHOD_PREFIX + traitName + ".bind(this); },");
        }
        if (trait.isMethod()) {
          writer.enter(VM_OPEN_METHOD_PREFIX + traitName + ": ");
        } else if (trait.isGetter()) {
          writer.enter("get_" + traitName + ": ");
        } else if (trait.isSetter()) {
          writer.enter("set_" + traitName + ": ");
        }
        writer.writeLns(method.toSource());
        writer.leave(",");
      } catch (x) {

      }
    }
  }
}

function compileClass(classInfo, writer) {
  function compileTraits(traits) {
    traits.forEach(function (trait) {
      compileTrait(trait, writer);
    });
  }

  function compileInitializer(methodInfo) {
    if (canCompile(methodInfo)) {
      ensureFunctionIsInitialized(methodInfo);
      var method = createCompiledFunction(methodInfo, new Scope(null, {}), false, false, false);
      writer.enter("constructor:");
      writer.writeLns(method.toSource());
      writer.leave(", ");
    }
  }

  writer.enter(Multiname.getQualifiedName(classInfo.instanceInfo.name) + ": {");

  writer.enter("static: {");
  compileInitializer(classInfo.init);
  compileTraits(classInfo.traits);
  writer.leave("}, ");
  writer.enter("instance: {");
  compileInitializer(classInfo.instanceInfo.init);
  compileTraits(classInfo.instanceInfo.traits);
  writer.leave("}");
  writer.leave("},");
}