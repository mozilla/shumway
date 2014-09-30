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

module Shumway.AVM2.AS {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import Multiname = Shumway.AVM2.ABC.Multiname;
  import CONSTANT = Shumway.AVM2.ABC.CONSTANT;
  import TRAIT = Shumway.AVM2.ABC.TRAIT;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;


  enum DescribeTypeFlags {
    HIDE_NSURI_METHODS  = 0x0001,
    INCLUDE_BASES       = 0x0002,
    INCLUDE_INTERFACES  = 0x0004,
    INCLUDE_VARIABLES   = 0x0008,
    INCLUDE_ACCESSORS   = 0x0010,
    INCLUDE_METHODS     = 0x0020,
    INCLUDE_METADATA    = 0x0040,
    INCLUDE_CONSTRUCTOR = 0x0080,
    INCLUDE_TRAITS      = 0x0100,
    USE_ITRAITS         = 0x0200,
    HIDE_OBJECT         = 0x0400
  }

  // public keys used multiple times while creating the description
  var declaredByKey = publicName("declaredBy");
  var metadataKey = publicName("metadata");
  var accessKey = publicName("access");
  var uriKey = publicName("uri");
  var nameKey = publicName("name");
  var typeKey = publicName("type");
  var returnTypeKey = publicName("returnType");
  var valueKey = publicName("value");
  var keyKey = publicName("key");
  var parametersKey = publicName("parameters");
  var optionalKey = publicName("optional");

  export function describeTypeJSON(o: any, flags: number): any {
    if (!o || typeof o !== 'object') {
      return null;
    }
    var cls: ASClass = o.classInfo ? o : Object.getPrototypeOf(o).class;
    release || assert(cls, "No class found for object " + o);
    var isClass = cls === o;
    var info: ClassInfo = cls.classInfo;

    var description: any = {};
    description[nameKey] = unmangledQualifiedName(info.instanceInfo.name);
    description[publicName("isDynamic")] =
    isClass || !(info.instanceInfo.flags & CONSTANT.ClassSealed);
    description[publicName("isFinal")] =
    isClass || !!(info.instanceInfo.flags & CONSTANT.ClassFinal);
    //TODO: verify that `isStatic` is false for all instances, true for classes
    description[publicName("isStatic")] = isClass;
    if (flags & DescribeTypeFlags.INCLUDE_TRAITS) {
      var traits = description[publicName("traits")] = addTraits(cls, info, isClass, flags);
    }
    return description;
  }

  function publicName(str: string) {
    return Multiname.getPublicQualifiedName(str)
  }

  function unmangledQualifiedName(mn) {
    var name = mn.name;
    var namespace = mn.namespaces[0];
    if (namespace && namespace.uri) {
      return namespace.uri + '::' + name;
    }
    return name;
  }

  function describeMetadataMap(map) {
    if (!map) {
      return null;
    }
    var result = [];
    for (var key in map) {
      result.push(describeMetadata(map[key]));
    }
    return result;
  }

  function describeMetadata(metadata) {
    var result = {};
    result[nameKey] = metadata.name;
    result[valueKey] = metadata.value.map(function(value) {
      var val = {};
      val[valueKey] = value.value;
      val[keyKey] = value.key;
      return val;
    });
    return result;
  }

  function addTraits(cls: ASClass, info: ClassInfo, describingClass: boolean, flags: DescribeTypeFlags) {
    var includeBases = flags & DescribeTypeFlags.INCLUDE_BASES;
    var includeMethods = flags & DescribeTypeFlags.INCLUDE_METHODS && !describingClass;
    var obj: any = {};

    var variablesVal = obj[publicName("variables")] =
      flags & DescribeTypeFlags.INCLUDE_VARIABLES ? [] : null;
    var accessorsVal = obj[publicName("accessors")] =
      flags & DescribeTypeFlags.INCLUDE_ACCESSORS ? [] : null;

    var metadata: any[] = null;
    if (flags & DescribeTypeFlags.INCLUDE_METADATA) {
      // Somewhat absurdly, class metadata is only included when describing instances.
      if (!describingClass) {
        // This particular metadata list is always created, even if no metadata exists.
        metadata = describeMetadataMap(info.metadata) || [];
      } else {
        metadata = [];
      }
    }
    obj[metadataKey] = metadata;

    // TODO: fill in.
    obj[publicName("constructor")] = null;

    if (flags & DescribeTypeFlags.INCLUDE_INTERFACES) {
      var interfacesVal = obj[publicName("interfaces")] = [];
      if (flags & DescribeTypeFlags.USE_ITRAITS || !describingClass) {
        for (var key in cls.implementedInterfaces) {
          var ifaceName = (<ASClass> cls.implementedInterfaces[key]).getQualifiedClassName();
          interfacesVal.push(ifaceName);
        }
      }
    } else {
      obj[publicName("interfaces")] = null;
    }

    var methodsVal = obj[publicName("methods")] = includeMethods ? [] : null;
    var basesVal = obj[publicName("bases")] = includeBases ? [] : null;

    var encounteredKeys: any = {};

    // Needed for accessor-merging
    var encounteredGetters: any = {};
    var encounteredSetters: any = {};

    var addBase = false;
    while (cls) {
      var className = unmangledQualifiedName(cls.classInfo.instanceInfo.name);
      if (includeBases && addBase && !describingClass) {
        basesVal.push(className);
      } else {
        addBase = true;
      }
      if (flags & DescribeTypeFlags.HIDE_OBJECT && cls === ASObject) {
        break;
      }
      if (flags & DescribeTypeFlags.USE_ITRAITS || !describingClass) {
        describeTraits(cls.classInfo.instanceInfo.traits);
      } else {
        describeTraits(cls.classInfo.traits);
      }
      cls = cls.baseClass;
    }
    // When describing Class objects, the bases to add are always Class and Object.
    if (describingClass) {
      // When describing Class objects, accessors are ignored. *Except* the `prototype` accessor.
      if (flags & DescribeTypeFlags.INCLUDE_ACCESSORS) {
        var val: any = {};
        val[nameKey] = 'prototype';
        val[typeKey] = '*';
        val[accessKey] = "readonly";
        val[metadataKey] = null;
        val[uriKey] = null;
        val[declaredByKey] = 'Class';
        accessorsVal.push(val);
      }
      if (includeBases) {
        basesVal.pop();
        basesVal.push('Class', 'Object');
        cls = ASClass;
      }
    }

    // Having a hot function closed over isn't all that great, but moving this out would involve
    // passing lots and lots of arguments. We might do that if performance becomes an issue.
    function describeTraits(traits) {
      release || assert(traits, "No traits array found on class" + cls.classInfo.instanceInfo.name);

      // All types share some fields, but setting them in one place changes the order in which
      // they're defined - and hence show up in iteration. While it is somewhat unlikely that
      // real content relies on that order, tests certainly do, so we duplicate the code.
      for (var i = traits.length; i--;) {
        var t = traits[i];
        if (!t.name.getNamespace().isPublic() && !t.name.uri) {
          continue;
        }
        var name = unmangledQualifiedName(t.name);
        if (encounteredGetters[name] !== encounteredSetters[name]) {
          var val = encounteredKeys[name];
          val[accessKey] = 'readwrite';
          if (t.kind === TRAIT.Getter) {
            val[typeKey] = unmangledQualifiedName(t.methodInfo.returnType);
          }
          continue;
        }
        if (encounteredKeys[name]) {
          continue;
        }
        //TODO: check why we have public$$_init in `Object`

        var val: any = {};
        encounteredKeys[name] = val;
        switch (t.kind) {
          case TRAIT.Const:
          case TRAIT.Slot:
            if (!(flags & DescribeTypeFlags.INCLUDE_VARIABLES)) {
              continue;
            }
            val[nameKey] = name;
            val[uriKey] = t.name.uri === undefined ? null : t.name.uri;
            val[typeKey] = t.typeName ? unmangledQualifiedName(t.typeName) : '*';
            val[accessKey] = "readwrite";
            val[metadataKey] = flags & DescribeTypeFlags.INCLUDE_METADATA ?
                                   describeMetadataMap(t.metadata) : null;
            variablesVal.push(val);
            break;
          case TRAIT.Method:
            if (!includeMethods) {
              continue;
            }
            val[returnTypeKey] = t.methodInfo.returnType ?
                                     unmangledQualifiedName(t.methodInfo.returnType) : '*';
            val[metadataKey] = flags & DescribeTypeFlags.INCLUDE_METADATA ?
                                   describeMetadataMap(t.metadata) : null;
            val[nameKey] = name;
            val[uriKey] = t.name.uri === undefined ? null : t.name.uri;
            var parametersVal = val[parametersKey] = [];
            var parameters = t.methodInfo.parameters;
            for (var j = 0; j < parameters.length; j++) {
              var param = parameters[j];
              var paramVal = {};
              paramVal[typeKey] = param.type ? unmangledQualifiedName(param.type) : '*';
              paramVal[optionalKey] = 'value' in param;
              parametersVal.push(paramVal);
            }
            val[declaredByKey] = className;
            methodsVal.push(val);
            break;
          case TRAIT.Getter:
          case TRAIT.Setter:
            if (!(flags & DescribeTypeFlags.INCLUDE_ACCESSORS) || describingClass) {
              continue;
            }
            val[nameKey] = name;
            if (t.kind === TRAIT.Getter) {
              val[typeKey] = t.methodInfo.returnType ?
                                 unmangledQualifiedName(t.methodInfo.returnType) : '*';
              encounteredGetters[name] = val;
            } else {
              var paramType = t.methodInfo.parameters[0].type;
              val[typeKey] = paramType ? unmangledQualifiedName(paramType) : '*';
              encounteredSetters[name] = val;
            }
            val[accessKey] = t.kind === TRAIT.Getter ? "readonly" : "writeonly";
            val[metadataKey] = flags & DescribeTypeFlags.INCLUDE_METADATA ?
                                   describeMetadataMap(t.metadata) : null;
            val[uriKey] = t.name.uri === undefined ? null : t.name.uri;
            val[declaredByKey] = className;
            accessorsVal.push(val);
            break;
          default:
            release || assert(false, "Unknown trait type: " + t.kind);
            break;
        }
      }
    }

      return obj;
  }
}
