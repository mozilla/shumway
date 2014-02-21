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
    // console.warn("LazyInitializer: " + object.getName() + " : " + object.target);
    return object.getName();
  }
  var name;
  if (object instanceof Scope) {
    var scope = object;
    if (scope.object instanceof ScriptInfo) {
      name = LazyInitializer.create(scope.object).getName();
    } else if (scope.object instanceof ClassInfo) {
      name = LazyInitializer.create(scope.object).getName();
    }
    name = "$SCOPE_" + name;
    return name;
  }
  hasUsedConstants = true;
  return "X";

  id = objectIDs++;
  if (object instanceof Global) {
    name = "$G" + id;
  } else if (object instanceof Multiname) {
    name = "$M" + id;
  } else if (isClass(object)) {
    name = "$C" + id;
  } else {
    name = "$O" + id;
    print("XXX");
  }
  console.warn("Object: " + object + " " + name);
  Object.defineProperty(object, OBJECT_NAME, {value: name, writable: false, enumerable: false});
  jsGlobal[name] = object;
  return name;
}

function compileAbc(abc, writer) {
  // console.time("Compile ABC: " + abc.name);
  writer.enter("{");
  writer.enter("methods: {");
  for (var i = 0; i < abc.scripts.length; i++) {
    compileScript(abc.scripts[i], writer);
  }
//  abc.methods.forEach(function (methodInfo) {
//    if (!methodInfo.isAOTCompiled && methodInfo.hasBody) {
//      // print("Closure: " + methodInfo);
//    }
////    print(">> LEFTOVER: " + methodInfo);
//    compileClosure(methodInfo, writer, new Scope(null, null));
////    print("<< LEFTOVER: " + methodInfo);
//  });
  writer.leave("}");
  writer.leave("}");
  //console.timeEnd("Compile ABC: " + abc.name);
}

function compileScript(script, writer) {
  objectConstantName = objectConstantName2;
  var globalScope = new Scope(null, script);
  var domain = script.abc.applicationDomain;
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
      compileClass(trait.classInfo, writer, classScope);
    } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
      compileTrait(trait, writer, globalScope);
    }
  });
}

function compileClosure(methodInfo, writer, scope) {
  if (shouldCompile(methodInfo)) {
    ensureFunctionIsInitialized(methodInfo);
    try {
      hasUsedConstants = false;
      var method = createCompiledFunction(methodInfo, scope, false, false, false);
      methodInfo.isAOTCompiled = true;
      writer.enter(methodInfo.index + ": ");
      if (!hasUsedConstants) {
        writer.writeLns(method.toSource());
      } else {
        writer.writeLn("undefined");
      }
      writer.leave(",");
    } catch (x) {

    }
  }
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
        methodInfo.isAOTCompiled = true;
        writer.enter(methodInfo.index + ": ");
        if (!hasUsedConstants) {
          writer.writeLns(method.toSource());
        } else {
          writer.writeLn("undefined");
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
      try {
        hasUsedConstants = false;
        var method = createCompiledFunction(methodInfo, scope, false, false, false);
        methodInfo.isAOTCompiled = true;
        writer.enter(methodInfo.index + ": ");
        if (!hasUsedConstants) {
          writer.writeLns(method.toSource());
        } else {
          writer.writeLn("undefined");
        }
        writer.leave(", ");
      } catch (x) {

      }
    }
  }

  // compileInitializer(classInfo.init, scope);
  compileTraits(classInfo.traits, scope);
  // compileInitializer(classInfo.instanceInfo.init, scope);
  compileTraits(classInfo.instanceInfo.traits, scope);
}