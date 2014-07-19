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
///<reference path='../references.ts' />

module Shumway.AVM2.AS {
  import assert = Shumway.Debug.assert;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;


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

  import CONSTANT = Shumway.AVM2.ABC.CONSTANT;
  import TRAIT = Shumway.AVM2.ABC.TRAIT;
  import ASClass = Shumway.AVM2.AS.ASClass;

  export function describeTypeJSON(o: any, flags: number): any {

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

    var cls: ASClass = o.classInfo ? o : Object.getPrototypeOf(o).class;
    release || assert(cls, "No class found for object " + o);
    var info = cls.classInfo;

    var description: any = {};
    description[nameKey] = unmangledQualifiedName(info.instanceInfo.name);
    description[publicName("isDynamic")] = cls === o ? true : !(info.instanceInfo.flags & CONSTANT.ClassSealed);
    //TODO: verify that `isStatic` is false for all instances, true for classes
    description[publicName("isStatic")] = cls === o;
    description[publicName("isFinal")] = cls === o ? true : !(info.instanceInfo.flags & CONSTANT.ClassFinal);
    if (flags & DescribeTypeFlags.INCLUDE_TRAITS) {
      description[publicName("traits")] = addTraits(cls, flags);
    }
    var metadata = null;
    if (info.metadata) {
      metadata = Object.keys(info.metadata).map(function(key) {
        return describeMetadata(info.metadata[key]);
      });
    }
    description[metadataKey] = metadata;
    return description;

    // privates

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

    function describeMetadata(metadata) {
      var result = {};
      result[nameKey] = metadata.name;
      result[valueKey] = metadata.value.map(function(value) {
        var val = {};
        val[keyKey] = value.key;
        val[valueKey] = value.value;
        return value;
      });
      return result;
    }

    function addTraits(cls: ASClass, flags: DescribeTypeFlags) {
      var includedMembers = [flags & DescribeTypeFlags.INCLUDE_VARIABLES,
        flags & DescribeTypeFlags.INCLUDE_METHODS,
        flags & DescribeTypeFlags.INCLUDE_ACCESSORS,
        flags & DescribeTypeFlags.INCLUDE_ACCESSORS];
      var includeBases = flags & DescribeTypeFlags.INCLUDE_BASES;
      var includeMetadata = flags & DescribeTypeFlags.INCLUDE_METADATA;

      var obj: any = {};

      var basesVal = obj[publicName("bases")] = includeBases ? [] : null;
      if (flags & DescribeTypeFlags.INCLUDE_INTERFACES) {
        var interfacesVal = obj[publicName("interfaces")] = [];
        if (flags & DescribeTypeFlags.USE_ITRAITS) {
          for (var key in cls.implementedInterfaces) {
            var ifaceName = (<ASClass> cls.implementedInterfaces[key]).getQualifiedClassName();
            interfacesVal.push(ifaceName);
          }
        }
      } else {
        obj[publicName("interfaces")] = null;
      }

      var variablesVal = obj[publicName("variables")] =
        flags & DescribeTypeFlags.INCLUDE_VARIABLES ? [] : null;
      var accessorsVal = obj[publicName("accessors")] =
        flags & DescribeTypeFlags.INCLUDE_ACCESSORS ? [] : null;
      var methodsVal = obj[publicName("methods")] =
        flags & DescribeTypeFlags.INCLUDE_METHODS ? [] : null;

      // Needed for accessor-merging
      var encounteredAccessors: any = {};

      var addBase = false;
      while (cls) {
        var className = unmangledQualifiedName(cls.classInfo.instanceInfo.name);
        if (includeBases && addBase) {
          basesVal.push(className);
        } else {
          addBase = true;
        }
        if (flags & DescribeTypeFlags.USE_ITRAITS) {
          describeTraits(cls.classInfo.instanceInfo.traits);
        } else {
          describeTraits(cls.classInfo.traits);
        }
        cls = cls.baseClass;
      }

      function describeTraits(traits) {
        release || assert(traits, "No traits array found on class" +
          cls.classInfo.instanceInfo.name);

        for (var i = 0; traits && i < traits.length; i++) {
          var t = traits[i];
          if (!includedMembers[t.kind] ||
            !t.name.getNamespace().isPublic() && !t.name.uri)
          {
            continue;
          }
          var name = unmangledQualifiedName(t.name);
          if (encounteredAccessors[name]) {
            var val = encounteredAccessors[name];
            val[accessKey] = 'readwrite';
            if (t.kind === TRAIT.Getter) {
              val[typeKey] = unmangledQualifiedName(t.methodInfo.returnType);
            }
            continue;
          }
          var val: any = {};
          if (includeMetadata && t.metadata) {
            var metadataVal = val[metadataKey] = [];
            Object.keys(t.metadata).forEach(function (key) {
              metadataVal.push(describeMetadata(t.metadata[key]));
            });
          } else {
            val[metadataKey] = null;
          }
          val[declaredByKey] = className;
          val[uriKey] = t.name.uri === undefined ? null : t.name.uri;
          val[nameKey] = name;
          //TODO: check why we have public$$_init in `Object`
          if (!t.typeName && !(t.methodInfo && t.methodInfo.returnType)) {
            continue;
          }
          val[t.kind === TRAIT.Method ? returnTypeKey : typeKey] =
            unmangledQualifiedName(t.kind === TRAIT.Slot
              ? t.typeName
              : t.methodInfo.returnType);
          switch (t.kind) {
            case TRAIT.Slot:
              val[accessKey] = "readwrite";
              variablesVal.push(val);
              break;
            case TRAIT.Method:
              var parametersVal = val[parametersKey] = [];
              var parameters = t.methodInfo.parameters;
              for (var j = 0; j < parameters.length; j++) {
                var param = parameters[j];
                var paramVal = {};
                paramVal[typeKey] = param.type
                  ? unmangledQualifiedName(param.type)
                  : '*';
                paramVal[optionalKey] = 'value' in param;
                parametersVal.push(paramVal);
              }
              methodsVal.push(val);
              break;
            case TRAIT.Getter:
            case TRAIT.Setter:
              val[accessKey] = t.kind === TRAIT.Getter ? "read" : "write";
              accessorsVal.push(val);
              encounteredAccessors[name] = val;
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
}