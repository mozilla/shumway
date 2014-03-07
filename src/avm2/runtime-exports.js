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

var VM_LENGTH = Shumway.AVM2.Runtime.VM_LENGTH;
var VM_IS_PROXY = Shumway.AVM2.Runtime.VM_IS_PROXY;
var VM_CALL_PROXY = Shumway.AVM2.Runtime.VM_CALL_PROXY;
var VM_NATIVE_BUILTIN_ORIGINALS = Shumway.AVM2.Runtime.VM_NATIVE_BUILTIN_ORIGINALS;

var VM_OPEN_METHOD_PREFIX = "m";
var VM_OPEN_SET_METHOD_PREFIX = "s";
var VM_OPEN_GET_METHOD_PREFIX = "g";

var SAVED_SCOPE_NAME = "$SS";

/**
 * ActionScript uses a slightly different syntax for regular expressions. Many of these features
 * are handled by the XRegExp library. Here we override the native RegExp.prototype methods with
 * those implemented by XRegExp. This also updates some methods on the String.prototype such as:
 * match, replace and split.
 */

var originalStringReplace = String.prototype.replace;

XRegExp.install({ natives: true });

/* This is used to keep track if we're in a runtime context. For instance, proxies need to
 * know if a proxied operation is triggered by AS3 code or VM code.
*/

var callWriter = new IndentingWriter(false, function (str){
  print(str);
});

/*
 * We pollute the JS global object with object constants used in compiled code.
 */

var objectIDs = 0;
var OBJECT_NAME = "Object Name";

function objectConstantName(object) {
  release || assert(object);
  if (object.hasOwnProperty(OBJECT_NAME)) {
    return object[OBJECT_NAME];
  }
  if (object instanceof LazyInitializer) {
    return object.getName();
  }
  var name, id = objectIDs++;
  if (object instanceof Global) {
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

var isClass = Shumway.AVM2.Runtime.isClass;
var isTrampoline = Shumway.AVM2.Runtime.isTrampoline;
var isMemoizer = Shumway.AVM2.Runtime.isMemoizer;


var LazyInitializer = Shumway.AVM2.Runtime.LazyInitializer;

var getNamespaceResolutionMap = Shumway.AVM2.Runtime.getNamespaceResolutionMap;
var resolveMultinameProperty = Shumway.AVM2.Runtime.resolveMultinameProperty;
var asGetPublicProperty = Shumway.AVM2.Runtime.asGetPublicProperty;
var asGetProperty = Shumway.AVM2.Runtime.asGetProperty;
var asGetPropertyLikelyNumeric = Shumway.AVM2.Runtime.asGetPropertyLikelyNumeric;

/**
 * Resolved string accessors.
 */

var asGetResolvedStringProperty = Shumway.AVM2.Runtime.asGetResolvedStringProperty;
var asCallResolvedStringProperty = Shumway.AVM2.Runtime.asCallResolvedStringProperty;
var asGetResolvedStringPropertyFallback = Shumway.AVM2.Runtime.asGetResolvedStringPropertyFallback;
var asSetPublicProperty = Shumway.AVM2.Runtime.asSetPublicProperty;
var asSetProperty = Shumway.AVM2.Runtime.asSetProperty;
var asSetPropertyLikelyNumeric = Shumway.AVM2.Runtime.asSetPropertyLikelyNumeric;
var asDefinePublicProperty = Shumway.AVM2.Runtime.asDefinePublicProperty;
var asDefineProperty = Shumway.AVM2.Runtime.asDefineProperty;
var asCallPublicProperty = Shumway.AVM2.Runtime.asCallPublicProperty;

var asCallProperty = Shumway.AVM2.Runtime.asCallProperty;
var asCallSuper = Shumway.AVM2.Runtime.asCallSuper;
var asSetSuper = Shumway.AVM2.Runtime.asSetSuper;
var asGetSuper = Shumway.AVM2.Runtime.asGetSuper;
var construct = Shumway.AVM2.Runtime.construct;
var asConstructProperty = Shumway.AVM2.Runtime.asConstructProperty;
var asHasProperty = Shumway.AVM2.Runtime.asHasProperty;
var asDeleteProperty = Shumway.AVM2.Runtime.asDeleteProperty;
var asGetNumericProperty = Shumway.AVM2.Runtime.asGetNumericProperty;
var asSetNumericProperty = Shumway.AVM2.Runtime.asSetNumericProperty;
var asGetDescendants = Shumway.AVM2.Runtime.asGetDescendants;
var asNextNameIndex = Shumway.AVM2.Runtime.asNextNameIndex;
var asNextName = Shumway.AVM2.Runtime.asNextName;
var asNextValue = Shumway.AVM2.Runtime.asNextValue;
var asGetEnumerableKeys = Shumway.AVM2.Runtime.asGetEnumerableKeys;

var initializeGlobalObject = Shumway.AVM2.Runtime.initializeGlobalObject;

initializeGlobalObject(jsGlobal);

var asTypeOf = Shumway.AVM2.Runtime.asTypeOf;
var publicizeProperties = Shumway.AVM2.Runtime.publicizeProperties;
var asGetSlot = Shumway.AVM2.Runtime.asGetSlot;
var asSetSlot = Shumway.AVM2.Runtime.asSetSlot;
var asHasNext2 = Shumway.AVM2.Runtime.asHasNext2;
var getDescendants = Shumway.AVM2.Runtime.getDescendants;
var checkFilter = Shumway.AVM2.Runtime.checkFilter;

var ActivationInfo = Shumway.AVM2.Runtime.ActivationInfo;

var ScopeStack = Shumway.AVM2.Runtime.ScopeStack;
var Scope = Shumway.AVM2.Runtime.Scope;
var bindFreeMethodScope = Shumway.AVM2.Runtime.bindFreeMethodScope;
var nameInTraits = Shumway.AVM2.Runtime.nameInTraits;

// TODO: Remove this and its uses.
function resolveMultiname(object, mn, traitsOnly) {
  return object.resolveMultinameProperty(mn.namespaces, mn.name, mn.flags);
}

var sliceArguments = Shumway.AVM2.Runtime.sliceArguments;

var nonProxyingHasProperty = Shumway.AVM2.Runtime.nonProxyingHasProperty;
var forEachPublicProperty = Shumway.AVM2.Runtime.forEachPublicProperty;
var wrapJSObject = Shumway.AVM2.Runtime.wrapJSObject;

var asCreateActivation = Shumway.AVM2.Runtime.asCreateActivation;

var CatchScopeObject = Shumway.AVM2.Runtime.CatchScopeObject;

var Global = Shumway.AVM2.Runtime.Global;

var canCompile = Shumway.AVM2.Runtime.canCompile;
var shouldCompile = Shumway.AVM2.Runtime.shouldCompile;
var forceCompile = Shumway.AVM2.Runtime.forceCompile;

var createInterpretedFunction = Shumway.AVM2.Runtime.createInterpretedFunction;

var debugName = Shumway.AVM2.Runtime.debugName;

var createCompiledFunction = Shumway.AVM2.Runtime.createCompiledFunction;
var getMethodOverrideKey = Shumway.AVM2.Runtime.getMethodOverrideKey;
var checkMethodOverrides = Shumway.AVM2.Runtime.checkMethodOverrides;
var makeTrampoline = Shumway.AVM2.Runtime.makeTrampoline;
var makeMemoizer = Shumway.AVM2.Runtime.makeMemoizer;

var createFunction = Shumway.AVM2.Runtime.createFunction;
var ensureFunctionIsInitialized = Shumway.AVM2.Runtime.ensureFunctionIsInitialized;
var getTraitFunction = Shumway.AVM2.Runtime.getTraitFunction;
var createClass = Shumway.AVM2.Runtime.createClass;
var sealConstantTraits = Shumway.AVM2.Runtime.sealConstantTraits;
var applyType = Shumway.AVM2.Runtime.applyType;

var throwError = Shumway.AVM2.Runtime.throwError;
var throwErrorFromVM = Shumway.AVM2.Runtime.throwErrorFromVM;
var translateError = Shumway.AVM2.Runtime.translateError;

var asIsInstanceOf = Shumway.AVM2.Runtime.asIsInstanceOf;
var asIsType = Shumway.AVM2.Runtime.asIsType;
var asAsType = Shumway.AVM2.Runtime.asAsType;
var asCoerceByMultiname = Shumway.AVM2.Runtime.asCoerceByMultiname;
var asCoerce = Shumway.AVM2.Runtime.asCoerce;
var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
var asCoerceInt = Shumway.AVM2.Runtime.asCoerceInt;
var asCoerceUint = Shumway.AVM2.Runtime.asCoerceUint;
var asCoerceNumber = Shumway.AVM2.Runtime.asCoerceNumber;
var asCoerceBoolean = Shumway.AVM2.Runtime.asCoerceBoolean;
var asCoerceObject = Shumway.AVM2.Runtime.asCoerceObject;
var asDefaultCompareFunction = Shumway.AVM2.Runtime.asDefaultCompareFunction;
var asCompare = Shumway.AVM2.Runtime.asCompare;
var asAdd = Shumway.AVM2.Runtime.asAdd;

/**
 * It's not possible to resolve the multiname {a, b, c}::x to {b}::x if no trait exists in any of the currently
 * loaded abc files that defines the {b}::x name. Of course, this can change if we load an abc file that defines it.
 */
var GlobalMultinameResolver = Shumway.AVM2.Runtime.GlobalMultinameResolver;