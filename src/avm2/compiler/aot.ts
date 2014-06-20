/**
 * Examples:
 *
 * Compiling individual player globals abcs.
 *
 * find ~/Workspaces/Shumway/build/playerglobal/flash -name "*.abc" | xargs js avm.js -a -verify {} >> player.as.js
 */

module Shumway.AVM2.Compiler {
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import Trait = Shumway.AVM2.ABC.Trait;
  import Info = Shumway.AVM2.ABC.Info;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import Scope = Shumway.AVM2.Runtime.Scope;

  import canCompile = Shumway.AVM2.Runtime.canCompile;
  import shouldCompile = Shumway.AVM2.Runtime.shouldCompile;
  import forceCompile = Shumway.AVM2.Runtime.forceCompile;
  import ensureFunctionIsInitialized = Shumway.AVM2.Runtime.ensureFunctionIsInitialized;
  import createCompiledFunction = Shumway.AVM2.Runtime.createCompiledFunction;
  import LazyInitializer = Shumway.AVM2.Runtime.LazyInitializer;

  var hasUsedConstants = false;
  jsGlobal.objectConstantName = function (object) {
    if (object.hash) {
      return "$(" + object.hash + ")";
    } else if (object instanceof LazyInitializer) {
      return object.getName();
    } else {
      hasUsedConstants = true;
    }
  }

  export function compileAbc(abc: AbcFile, writer: IndentingWriter) {
    writer.enter("{");
    writer.enter("methods: {");
    for (var i = 0; i < abc.scripts.length; i++) {
      compileScript(abc.scripts[i], writer);
    }
    writer.leave("}");
    writer.leave("}");
  }

  function compileScript(script: ScriptInfo, writer: IndentingWriter) {
    var globalScope = new Scope(null, script);
    var domain = script.abc.applicationDomain;
    var closures = [];
    compileMethod(script.init, writer, globalScope, closures);
    script.traits.forEach(function (trait: Trait) {
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
    });
    closures.forEach(function(closure) {
      compileMethod(closure.methodInfo, writer, closure.scope, null, true);
    });
  }

  function compileMethod(methodInfo, writer, scope, closures, hasDynamicScope = false) {
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
        writer.writeLn("// " + x);
      }
    } else {
      writer.writeLn("// Can't compile method: " + methodInfo.index);
    }
  }
  function scanMethod(methodInfo, writer, scope, innerMethods) {
    // writer.enter("Scanning: " + methodInfo + " {");
    var bytecodes = methodInfo.analysis.bytecodes;
    var methods = methodInfo.abc.methods;
    for (var i = 0; i < bytecodes.length; i++) {
      var bc = bytecodes[i];
      // writer.writeLn(bc);
      if (bc.op === OP.newfunction) {
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
      if (trait.methodInfo.hasBody) {
        writer.writeLn("// " + trait);
        compileMethod(trait.methodInfo, writer, scope, closures);
      }
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
}