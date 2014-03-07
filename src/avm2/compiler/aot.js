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
 * Examples:
 *
 * Compiling individual player globals abcs.
 *
 * find ~/Workspaces/Shumway/build/playerglobal/flash -name "*.abc" | xargs js avm.js -a -verify {} >> player.as.js
 */

var hasUsedConstants = false;
function objectConstantName2(object) {
  release || assert(object);
  if (object.hasOwnProperty(OBJECT_NAME)) {
    return object[OBJECT_NAME];
  }
  if (object instanceof LazyInitializer) {
    return object.getName();
  } else if (object instanceof MethodInfo) {
    return "$" + variableLengthEncodeInt32(object.abc.hash) + ".methods[" + object.index + "]";
  }
  hasUsedConstants = true;
  return "X";
}

function compileAbc(abc, writer) {
  // console.time("Compile ABC: " + abc.name);
  writer.enter("{");
  writer.enter("methods: {");
  for (var i = 0; i < abc.scripts.length; i++) {
    compileScript(abc.scripts[i], writer);
  }
  writer.leave("}");
  writer.leave("}");
  //console.timeEnd("Compile ABC: " + abc.name);
}

function compileScript(script, writer) {
  objectConstantName = objectConstantName2;
  var globalScope = new Scope(null, script);
  var domain = script.abc.applicationDomain;
  var closures = [];
  compileMethod(script.init, writer, globalScope, closures);
  script.traits.forEach(function (trait) {
    if (trait.isClass()) {
      var inheritance = [];
      var current = trait.classInfo;
      while (current) {
        inheritance.unshift(current);
        if (current.instanceInfo.superName) {
          current = domain.findClassInfo(current.instanceInfo.superName);
        } else {
          break;
        }
      }
      var classScope = globalScope;
      inheritance.forEach(function (classInfo) {
        classScope = new Scope(classScope, classInfo);
      });
      compileClass(trait.classInfo, writer, classScope, closures);
    } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
      compileTrait(trait, writer, globalScope, closures);
    }
    closures.forEach(function(closure) {
      compileMethod(closure.methodInfo, writer, closure.scope, null, true);
    });
  });
}

function compileMethod(methodInfo, writer, scope, closures, hasDynamicScope) {
  if (canCompile(methodInfo)) {
    ensureFunctionIsInitialized(methodInfo);
    try {
      hasUsedConstants = false;
      var method = createCompiledFunction(methodInfo, scope, hasDynamicScope, false, false);
      writer.enter(methodInfo.index + ": ");
      if (!hasUsedConstants) {
        writer.writeLns(method.toSource());
      } else {
        // writer.writeLns(method.toSource());
        // quit();
        writer.writeLn("undefined");
      }
      writer.leave(",");
      if (closures) {
        scanMethod(methodInfo, writer, scope, closures);
      }
    } catch (x) {

    }
  }
}
function scanMethod(methodInfo, writer, scope, innerMethods) {
  // writer.enter("Scanning: " + methodInfo + " {");
  var bytecodes = methodInfo.analysis.bytecodes;
  var methods = methodInfo.abc.methods;
  for (var i = 0; i < bytecodes.length; i++) {
    var bc = bytecodes[i];
    // writer.writeLn(bc);
    if (bc.op === OP_newfunction) {
      var innerMethodInfo = methods[bc.index];
      ensureFunctionIsInitialized(innerMethodInfo);
      var innerScope = new Scope(scope, methodInfo);
      innerMethods.push({
        scope: innerScope,
        methodInfo: innerMethodInfo
      });
      scanMethod(innerMethodInfo, writer, innerScope, innerMethods);
    }
  }
  // writer.leave("}");
}

function compileTrait(trait, writer, scope, closures) {
  if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
    compileMethod(trait.methodInfo, writer, scope, closures);
  }
}

function compileTraits(traits, writer, scope, closures) {
  traits.forEach(function (trait) {
    compileTrait(trait, writer, scope, closures);
  });
}

function compileClass(classInfo, writer, scope, closures) {
  compileMethod(classInfo.init, writer, scope, closures);
  compileTraits(classInfo.traits, writer, scope, closures);
  compileMethod(classInfo.instanceInfo.init, writer, scope, closures);
  compileTraits(classInfo.instanceInfo.traits, writer, scope, closures);
}