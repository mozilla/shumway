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

  // Public keys used multiple times while creating the description.
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
    // Class traits aren't returned for numeric primitives, undefined, null, bound methods, or
    // non-class-constructor functions.
    var isInt = (o|0) === o;
    if (flags & DescribeTypeFlags.USE_ITRAITS && (isNullOrUndefined(o) || isInt)) {
      return null;
    }
    var isBoundMethod = false;
    if (o instanceof Function) {
      if ('boundTo' in o) {
        if (flags & DescribeTypeFlags.USE_ITRAITS) {
          return null;
        }
        isBoundMethod = true;
        // The check for non-class-constructor functions is very, very messy. :(
      } else if ('methodInfo' in o && o['methodInfo'] && 'lastBoundMethod' in o['methodInfo']) {
        return null;
      }
    }
    o = Object(o);
    var cls: ASClass = o.classInfo ? o : Object.getPrototypeOf(o).class;
    release || assert(cls, "No class found for object " + o);
    var isClass = cls === o && !(flags & DescribeTypeFlags.USE_ITRAITS);
    var info: ClassInfo = cls.classInfo;

    var description: any = {};
    // For numeric literals that fit into ints, special case the name.
    if (isInt) {
      description[nameKey] = 'int';
      // Bound methods should be instances of MethodClosure, see bug 1057750. They're not, so
      // we have to special case them here and below.
    } else if (isBoundMethod) {
      description[nameKey] = 'builtin.as$0::MethodClosure';
    } else {
      description[nameKey] = unmangledQualifiedName(info.instanceInfo.name);
    }
    // More special casing for bound methods. See bug 1057750.
    description[publicName("isDynamic")] = isClass ||
                                           !(info.instanceInfo.flags & CONSTANT.ClassSealed) &&
                                           !isBoundMethod;
    description[publicName("isFinal")] = isClass ||
                                         !!(info.instanceInfo.flags & CONSTANT.ClassFinal) ||
                                         isBoundMethod;
    //TODO: verify that `isStatic` is false for all instances, true for classes
    description[publicName("isStatic")] = isClass;
    if (flags & DescribeTypeFlags.INCLUDE_TRAITS) {
      var traits = description[publicName("traits")] = addTraits(cls, info, isClass, flags);
    }
    // And yet more, truly ugly, special casing for bound methods. See bug 1057750.
    if (isBoundMethod) {
      traits[publicName("bases")].unshift('Function');
      traits[publicName("accessors")][1][publicName("declaredBy")] = 'builtin.as$0::MethodClosure';
    }
    return description;
  }

  export function describeType(value: any, flags: number): ASXML {
    var classDescription: any = describeTypeJSON(value, flags);
    // Make sure all XML classes are fully initialized.
    var systemDomain = Runtime.AVM2.instance.systemDomain;
    systemDomain.getClass('XML');
    systemDomain.getClass('XMLList');
    systemDomain.getClass('QName');
    systemDomain.getClass('Namespace');
    var x: ASXML = new AS.ASXML('<type/>');
    x.setProperty("name", true, classDescription[publicName('name')]);
    var bases = classDescription[publicName('traits')][publicName('bases')];
    if (bases.length) {
      x.setProperty("base", true, bases[0]);
    }
    x.setProperty("isDynamic", true, classDescription[publicName('isDynamic')].toString());
    x.setProperty("isFinal", true, classDescription[publicName('isFinal')].toString());
    x.setProperty("isStatic", true, classDescription[publicName('isStatic')].toString());
    describeTraits(x, classDescription[publicName('traits')]);

    var instanceDescription: any = describeTypeJSON(value, flags | DescribeTypeFlags.USE_ITRAITS);
    if (instanceDescription) {
      var e: ASXML = new AS.ASXML('<factory/>');
      e.setProperty('type', true, instanceDescription[publicName('name')]);
      if (describeTraits(e, instanceDescription[publicName('traits')])) {
        x.appendChild(e);
      }
    }
    return x;
  }
  function describeTraits(x: ASXML, traits: any): boolean {
    var traitsCount = 0;
    var bases = traits[publicName('bases')];
    for (var i = 0; bases && i < bases.length; i++) {
      var base: string = bases[i];
      var e: ASXML = new AS.ASXML('<extendsClass type="' + escapeAttributeValue(base) + '"/>');
      x.appendChild(e);
      traitsCount++;
    }
    var interfaces = traits[publicName('interfaces')];
    for (var i = 0; interfaces && i < interfaces.length; i++) {
      var e: ASXML = new AS.ASXML('<implementsInterface type="' +
                                  escapeAttributeValue(interfaces[i]) + '"/>');
      x.appendChild(e);
      traitsCount++;
    }
    if (traits[publicName('constructor')] !== null) {
      var e: ASXML = new AS.ASXML('<constructor/>');
      describeParams(e, traits[publicName('constructor')]);
      x.appendChild(e);
      traitsCount++;
    }
    var variables = traits[publicName('variables')];
    for (var i = 0; variables && i < variables.length; i++) {
      var variable: any = variables[i];
      var nodeName = variable[publicName('access')] === 'readonly' ? 'constant' : 'variable';
      var e: ASXML = new AS.ASXML('<' + nodeName +
                                  ' name="' + escapeAttributeValue(variable[publicName('name')]) +
                                  '" type="' + variable[publicName('type')] + '"/>');
      if (variable[publicName('uri')] !== null) {
        e.setProperty('uri', true, variable[publicName('uri')]);
      }
      if (variable[publicName('metadata')] !== null) {
        describeMetadataXML(e, variable[publicName('metadata')]);
      }
      x.appendChild(e);
      traitsCount++;
    }
    var accessors = traits[publicName('accessors')];
    for (var i = 0; accessors && i < accessors.length; i++) {
      var accessor: any = accessors[i];
      var e: ASXML = new AS.ASXML('<accessor ' +
                                  'name="' + escapeAttributeValue(accessor[publicName('name')]) +
                                  '" access="' + accessor[publicName('access')] +
                                  '" type="' + escapeAttributeValue(accessor[publicName('type')]) +
                                  '" declaredBy="' +
                                  escapeAttributeValue(accessor[publicName('declaredBy')]) + '"/>');
      if (accessor[publicName('uri')] !== null) {
        e.setProperty('uri', true, accessor[publicName('uri')]);
      }
      if (accessor[publicName('metadata')] !== null) {
        describeMetadataXML(e, accessor[publicName('metadata')]);
      }
      x.appendChild(e);
      traitsCount++;
    }
    var methods = traits[publicName('methods')];
    for (var i = 0; methods && i < methods.length; i++) {
      var method: any = methods[i];
      var e: ASXML = new AS.ASXML('<method ' +
                                  'name="' + escapeAttributeValue(method[publicName('name')]) +
                                  '" declaredBy="' +
                                  escapeAttributeValue(method[publicName('declaredBy')]) +
                                  '" returnType="' +
                                  escapeAttributeValue(method[publicName('returnType')]) + '"/>');
      describeParams(e, method[publicName('parameters')]);
      if (method[publicName('uri')] !== null) {
        e.setProperty('uri', true, method[publicName('uri')]);
      }
      if (method[publicName('metadata')] !== null) {
        describeMetadataXML(e, method[publicName('metadata')]);
      }
      x.appendChild(e);
      traitsCount++;
    }
    describeMetadataXML(x, traits[publicName('metadata')]);
    return traitsCount > 0;
  }

  function describeParams(x: ASXML, parameters: any[]): void {
    if (!parameters) {
      return;
    }
    for (var i = 0; i < parameters.length; i++) {
      var p = parameters[i];
      var f: ASXML = new AS.ASXML('<parameter index="' + (i + 1) +
                                  '" type="' + escapeAttributeValue(p[publicName('type')]) +
                                  '" optional="' + p[publicName('optional')] + '"/>');
      x.appendChild(f);
    }
  }

  function describeMetadataXML(x: ASXML, metadata: any[]): void {
    if (!metadata) {
      return;
    }
    for (var i = 0; i < metadata.length; i++) {
      var md = metadata[i];
      var m: ASXML = new AS.ASXML('<metadata name="' +
                                  escapeAttributeValue(md[publicName('name')]) + '"/>');
      var values = md[publicName('value')];
      for (var j = 0; j < values.length; j++) {
        var value = values[j];
        var a: ASXML = new AS.ASXML('<arg key="' + escapeAttributeValue(value[publicName('key')]) +
                                    '" value="' +
                                    escapeAttributeValue(value[publicName('value')]) + '"/>');
        m.appendChild(a);
      }
      x.appendChild(m);
    }
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
      // Filter out the [native] metadata nodes. These are implementation details Flash doesn't
      // expose, so we don't, either.
      if (key === 'native') {
        continue;
      }
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

  function addTraits(cls: ASClass, info: ClassInfo, describingClass: boolean,
                     flags: DescribeTypeFlags) {
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
      if (!describingClass) {
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

    // Needed for accessor-merging.
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
      if (flags & DescribeTypeFlags.HIDE_OBJECT && cls === <any>ASObject) {
        break;
      }
      if (!describingClass) {
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
        var ns = t.name.getNamespace();
        // Hide all non-public members whose namespace doesn't have a URI specified.
        // Or, if HIDE_NSURI_METHODS is set, hide those, too, because bugs in Flash.
        if (!ns.isPublic() && !t.name.uri ||
            (flags & DescribeTypeFlags.HIDE_NSURI_METHODS && ns.uri)) {
          continue;
        }
        var name = unmangledQualifiedName(t.name);
        if (encounteredGetters[name] !== encounteredSetters[name]) {
          var val = encounteredKeys[name];
          val[accessKey] = 'readwrite';
          if (t.kind === TRAIT.Getter) {
            val[typeKey] = t.methodInfo.returnType ?
                              unmangledQualifiedName(t.methodInfo.returnType) : '*';
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
