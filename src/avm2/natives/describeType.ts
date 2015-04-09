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

module Shumway.AVMX.AS {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;

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

  export function describeTypeJSON(securityDomain: SecurityDomain, o: any, flags: number): any {
    // Class traits aren't returned for numeric primitives, undefined, null, bound methods, or
    // non-class-constructor functions.
    var isInt = (o|0) === o;
    if (flags & DescribeTypeFlags.USE_ITRAITS && (isNullOrUndefined(o) || isInt)) {
      return null;
    }
    // Use the object's own securityDomain if we're not dealing with a primitive to make sure
    // type checks are correct.
    if (o.securityDomain) {
      securityDomain = o.securityDomain;
    }
    o = securityDomain.box(o);

    if (securityDomain.AXFunction.axIsType(o)) {
      if (securityDomain.AXMethodClosure.axIsType(o)) {
        if (flags & DescribeTypeFlags.USE_ITRAITS) {
          return null;
        }
        // Non-bound functions with a `receiver` property are bare functions, not ctors.
      } else if ('receiver' in o) {
        return null;
      }
    }
    var cls: AXClass = o.hasOwnProperty('classInfo') ? o : o.axClass;
    release || assert(cls, "No class found for object " + o);
    var describeClass = cls === o && !(flags & DescribeTypeFlags.USE_ITRAITS);
    var info: ClassInfo = cls.classInfo;

    var description: any = securityDomain.createObject();
    // For numeric literals that fit into ints, special case the name.
    if (isInt) {
      description.$Bgname = 'int';
    } else {
      description.$Bgname = info.instanceInfo.getName().toFQNString(true);
    }
    // More special casing for bound methods. See bug 1057750.
    description.$BgisDynamic = describeClass || !(info.instanceInfo.flags & CONSTANT.ClassSealed);
    description.$BgisFinal = describeClass || !!(info.instanceInfo.flags & CONSTANT.ClassFinal);
    //TODO: verify that `isStatic` is false for all instances, true for classes
    description.$BgisStatic = describeClass;
    if (flags & DescribeTypeFlags.INCLUDE_TRAITS) {
      var traits = description.$Bgtraits = addTraits(cls, info, describeClass, flags);
    }
    return description;
  }

  //export function describeType(securityDomain: SecurityDomain, value: any, flags: number): ASXML
  // {
  //  var classDescription: any = describeTypeJSON(value, flags);
  //  // Make sure all XML classes are fully initialized.
  //  var systemDomain = securityDomain.application;
  //  systemDomain.getClass('XML');
  //  systemDomain.getClass('XMLList');
  //  systemDomain.getClass('QName');
  //  systemDomain.getClass('Namespace');
  //  var x: ASXML = new AS.ASXML('<type/>');
  //  x.setProperty("name", true, classDescription[publicName('name')]);
  //  var bases = classDescription[publicName('traits')][publicName('bases')];
  //  if (bases.length) {
  //    x.setProperty("base", true, bases[0]);
  //  }
  //  x.setProperty("isDynamic", true, classDescription[publicName('isDynamic')].toString());
  //  x.setProperty("isFinal", true, classDescription[publicName('isFinal')].toString());
  //  x.setProperty("isStatic", true, classDescription[publicName('isStatic')].toString());
  //  describeTraits(x, classDescription[publicName('traits')]);
  //
  //  var instanceDescription: any = describeTypeJSON(value, flags |
  // DescribeTypeFlags.USE_ITRAITS);
  //  if (instanceDescription) {
  //    var e: ASXML = new AS.ASXML('<factory/>');
  //    e.setProperty('type', true, instanceDescription[publicName('name')]);
  //    if (describeTraits(e, instanceDescription[publicName('traits')])) {
  //      x.appendChild(e);
  //    }
  //  }
  //  return x;
  //}
  //function describeTraits(x: ASXML, traits: any): boolean {
  //  var traitsCount = 0;
  //  var bases = traits[publicName('bases')];
  //  for (var i = 0; bases && i < bases.length; i++) {
  //    var base: string = bases[i];
  //    var e: ASXML = new AS.ASXML('<extendsClass type="' + escapeAttributeValue(base) + '"/>');
  //    x.appendChild(e);
  //    traitsCount++;
  //  }
  //  var interfaces = traits[publicName('interfaces')];
  //  for (var i = 0; interfaces && i < interfaces.length; i++) {
  //    var e: ASXML = new AS.ASXML('<implementsInterface type="' +
  //                                escapeAttributeValue(interfaces[i]) + '"/>');
  //    x.appendChild(e);
  //    traitsCount++;
  //  }
  //  if (traits[publicName('constructor')] !== null) {
  //    var e: ASXML = new AS.ASXML('<constructor/>');
  //    describeParams(e, traits[publicName('constructor')]);
  //    x.appendChild(e);
  //    traitsCount++;
  //  }
  //  var variables = traits[publicName('variables')];
  //  for (var i = 0; variables && i < variables.length; i++) {
  //    var variable: any = variables[i];
  //    var nodeName = variable[publicName('access')] === 'readonly' ? 'constant' : 'variable';
  //    var e: ASXML = new AS.ASXML('<' + nodeName +
  //                                ' name="' + escapeAttributeValue(variable[publicName('name')])
  // +
  //                                '" type="' + variable[publicName('type')] + '"/>');
  //    if (variable[publicName('uri')] !== null) {
  //      e.setProperty('uri', true, variable[publicName('uri')]);
  //    }
  //    if (variable[publicName('metadata')] !== null) {
  //      describeMetadataXML(e, variable[publicName('metadata')]);
  //    }
  //    x.appendChild(e);
  //    traitsCount++;
  //  }
  //  var accessors = traits[publicName('accessors')];
  //  for (var i = 0; accessors && i < accessors.length; i++) {
  //    var accessor: any = accessors[i];
  //    var e: ASXML = new AS.ASXML('<accessor ' +
  //                                'name="' + escapeAttributeValue(accessor[publicName('name')]) +
  //                                '" access="' + accessor[publicName('access')] +
  //                                '" type="' + escapeAttributeValue(accessor[publicName('type')])
  // + '" declaredBy="' + escapeAttributeValue(accessor[publicName('declaredBy')]) + '"/>'); if
  // (accessor[publicName('uri')] !== null) { e.setProperty('uri', true,
  // accessor[publicName('uri')]); } if (accessor[publicName('metadata')] !== null) {
  // describeMetadataXML(e, accessor[publicName('metadata')]); } x.appendChild(e); traitsCount++; }
  // var methods = traits[publicName('methods')]; for (var i = 0; methods && i < methods.length;
  // i++) { var method: any = methods[i]; var e: ASXML = new AS.ASXML('<method ' + 'name="' +
  // escapeAttributeValue(method[publicName('name')]) + '" declaredBy="' +
  // escapeAttributeValue(method[publicName('declaredBy')]) + '" returnType="' +
  // escapeAttributeValue(method[publicName('returnType')]) + '"/>'); describeParams(e,
  // method[publicName('parameters')]); if (method[publicName('uri')] !== null) {
  // e.setProperty('uri', true, method[publicName('uri')]); } if (method[publicName('metadata')]
  // !== null) { describeMetadataXML(e, method[publicName('metadata')]); } x.appendChild(e);
  // traitsCount++; } describeMetadataXML(x, traits[publicName('metadata')]); return traitsCount >
  // 0; }  function describeParams(x: ASXML, parameters: any[]): void { if (!parameters) { return;
  // } for (var i = 0; i < parameters.length; i++) { var p = parameters[i]; var f: ASXML = new
  // AS.ASXML('<parameter index="' + (i + 1) + '" type="' +
  // escapeAttributeValue(p[publicName('type')]) + '" optional="' + p[publicName('optional')] +
  // '"/>'); x.appendChild(f); } }  function describeMetadataXML(x: ASXML, metadata: any[]): void {
  // if (!metadata) { return; } for (var i = 0; i < metadata.length; i++) { var md = metadata[i];
  // var m: ASXML = new AS.ASXML('<metadata name="' + escapeAttributeValue(md[publicName('name')])
  // + '"/>'); var values = md[publicName('value')]; for (var j = 0; j < values.length; j++) { var
  // value = values[j]; var a: ASXML = new AS.ASXML('<arg key="' +
  // escapeAttributeValue(value[publicName('key')]) + '" value="' +
  // escapeAttributeValue(value[publicName('value')]) + '"/>'); m.appendChild(a); }
  // x.appendChild(m); } }

  function describeMetadataList(securityDomain: SecurityDomain, list: MetadataInfo[]) {
    if (!list) {
      return null;
    }
    var result = securityDomain.createArray([]);

    for (var i = 0; i < list.length; i++) {
      var metadata = list[i];
      var key = metadata.getName();
      // Filter out the [native] metadata nodes. These are implementation details Flash doesn't
      // expose, so we don't, either.
      if (key === 'native') {
        continue;
      }
      result.push(describeMetadata(securityDomain, metadata));
    }
    return result;
  }

  function describeMetadata(securityDomain: SecurityDomain, metadata: MetadataInfo) {
    var result = securityDomain.createObject();
    result.$Bgname = metadata.name;
    var values = [];
    result.$Bgvalue = securityDomain.createArray(values);
    for (var i = 0; i < metadata.keys.length; i++) {
      var val = securityDomain.createObject();
      val.$Bgvalue = metadata.getValueAt(i);
      val.$Bgkey = metadata.getKeyAt(i);
      values.push(val);
    }
    return result;
  }

  function addTraits(cls: AXClass, info: ClassInfo, describingClass: boolean,
                     flags: DescribeTypeFlags) {
    var securityDomain = cls.securityDomain;
    var includeBases = flags & DescribeTypeFlags.INCLUDE_BASES;
    var includeMethods = flags & DescribeTypeFlags.INCLUDE_METHODS && !describingClass;
    var obj = securityDomain.createObject();

    var variablesVal = obj.$Bgvariables =
      flags & DescribeTypeFlags.INCLUDE_VARIABLES ? securityDomain.createArray([]) : null;
    var accessorsVal = obj.$Bgaccessors =
      flags & DescribeTypeFlags.INCLUDE_ACCESSORS ? securityDomain.createArray([]) : null;

    var metadataList: any[] = null;
    // Somewhat absurdly, class metadata is only included when describing instances.
    if (flags & DescribeTypeFlags.INCLUDE_METADATA && !describingClass) {
      var metadata: MetadataInfo[] = info.trait.getMetadata();
      if (metadata) {
        metadataList = describeMetadataList(securityDomain, metadata);
      }
    }
      // This particular metadata list is always created, even if no metadata exists.
    obj.$Bgmetadata = metadataList || securityDomain.createArray([]);

    // TODO: fill in.
    obj.$Bgconstructor = null;

    if (flags & DescribeTypeFlags.INCLUDE_INTERFACES) {
      obj.$Bginterfaces = securityDomain.createArray([]);
      if (!describingClass) {
        var interfacesVal = obj.$Bginterfaces.value;
        var interfaces = cls.classInfo.instanceInfo.getInterfaces(cls);
        interfaces.forEach((iface) => interfacesVal.push(iface.name.toFQNString(true)));
      }
    } else {
      obj.$Bginterfaces = null;
    }

    var methodsVal = obj.$Bgmethods = includeMethods ? securityDomain.createArray([]) : null;
    var basesVal = obj.$Bgbases = includeBases ? securityDomain.createArray([]) : null;

    var encounteredKeys: any = Object.create(null);

    // Needed for accessor-merging.
    var encounteredGetters: any = Object.create(null);
    var encounteredSetters: any = Object.create(null);

    var addBase = false;
    while (cls) {
      var className = cls.classInfo.instanceInfo.getName().toFQNString(true);
      if (includeBases && addBase && !describingClass) {
        basesVal.push(className);
      } else {
        addBase = true;
      }
      if (flags & DescribeTypeFlags.HIDE_OBJECT && cls === securityDomain.AXObject) {
        break;
      }
      if (!describingClass) {
        describeTraits(securityDomain, cls.classInfo.instanceInfo.traits.traits);
      } else {
        describeTraits(securityDomain, cls.classInfo.traits.traits);
      }
      cls = cls.superClass;
    }
    release || assert(cls === securityDomain.AXObject);
    // When describing Class objects, the bases to add are always Class and Object.
    if (describingClass) {
      // When describing Class objects, accessors are ignored. *Except* the `prototype` accessor.
      if (flags & DescribeTypeFlags.INCLUDE_ACCESSORS) {
        var val = securityDomain.createObject();
        val.$Bgname = 'prototype';
        val.$Bgtype = '*';
        val.$Bgaccess = "readonly";
        val.$Bgmetadata = null;
        val.$Bguri = null;
        val.$BgdeclaredBy = 'Class';
        accessorsVal.push(val);
      }
      if (includeBases) {
        basesVal.pop();
        basesVal.push('Class', 'Object');
        cls = securityDomain.AXClass;
      }
    }

    // Having a hot function closed over isn't all that great, but moving this out would involve
    // passing lots and lots of arguments. We might do that if performance becomes an issue.
    function describeTraits(securityDomain: SecurityDomain, traits: TraitInfo[]) {
      release || assert(traits, "No traits array found on class" + cls.name);

      // All types share some fields, but setting them in one place changes the order in which
      // they're defined - and hence show up in iteration. While it is somewhat unlikely that
      // real content relies on that order, tests certainly do, so we duplicate the code.
      for (var i = 0; i < traits.length; i++) {
        var t = traits[i];
        var mn = t.getName();
        var ns = mn.namespace;
        // Hide all non-public members whose namespace doesn't have a URI specified.
        // Or, if HIDE_NSURI_METHODS is set, hide those, too, because bugs in Flash.
        if (!ns.isPublic() && !ns.uri || (flags & DescribeTypeFlags.HIDE_NSURI_METHODS && ns.uri)) {
          continue;
        }
        var name = mn.toFQNString(true);
        if (encounteredGetters[name] !== encounteredSetters[name]) {
          var val = encounteredKeys[name];
          val.$Bgaccess = 'readwrite';
          if (t.kind === TRAIT.Getter) {
            var type = (<MethodTraitInfo>t).getMethodInfo().getType();
            val.$Bgtype = type ? type.name.toFQNString(true) : '*';
          }
          continue;
        }
        if (encounteredKeys[name]) {
          continue;
        }
        //TODO: check why we have public$$_init in `Object`

        var val = securityDomain.createObject();
        encounteredKeys[name] = val;
        var metadata: MetadataInfo[] = t.getMetadata();
        switch (t.kind) {
          case TRAIT.Const:
          case TRAIT.Slot:
            if (!(flags & DescribeTypeFlags.INCLUDE_VARIABLES)) {
              continue;
            }
            val.$Bgname = name;
            val.$Bguri = ns.reflectedURI;
            var typeName = (<SlotTraitInfo>t).getTypeName();
            val.$Bgtype = typeName ? typeName.toFQNString(true) : '*';
            val.$Bgaccess = "readwrite";
            val.$Bgmetadata = flags & DescribeTypeFlags.INCLUDE_METADATA ?
                              describeMetadataList(securityDomain, metadata) :
                              null;
            variablesVal.push(val);
            break;
          case TRAIT.Method:
            if (!includeMethods) {
              continue;
            }
            var returnType = (<MethodTraitInfo>t).getMethodInfo().getType();
            val.$BgreturnType = returnType ? returnType.name.toFQNString(true) : '*';
            val.$Bgmetadata = flags & DescribeTypeFlags.INCLUDE_METADATA ?
                              describeMetadataList(securityDomain, metadata) :
                              null;
            val.$Bgname = name;
            val.$Bguri = ns.reflectedURI;
            var parametersVal = val.$Bgparameters = securityDomain.createArray([]);
            var parameters = (<MethodTraitInfo>t).getMethodInfo().parameters;
            for (var j = 0; j < parameters.length; j++) {
              var param = parameters[j];
              var paramVal = securityDomain.createObject();
              paramVal.$Bgtype = param.type ? param.getType().toFQNString(true) : '*';
              paramVal.$Bgoptional = 'value' in param;
              parametersVal.push(paramVal);
            }
            val.$BgdeclaredBy = className;
            methodsVal.push(val);
            break;
          case TRAIT.Getter:
          case TRAIT.Setter:
            if (!(flags & DescribeTypeFlags.INCLUDE_ACCESSORS) || describingClass) {
              continue;
            }
            val.$Bgname = name;
            if (t.kind === TRAIT.Getter) {
              var returnType = (<MethodTraitInfo>t).getMethodInfo().getType();
              val.$Bgtype = returnType ? returnType.name.toFQNString(true) : '*';
              encounteredGetters[name] = val;
            } else {
              var paramType = (<MethodTraitInfo>t).getMethodInfo().parameters[0].getType();
              val.$Bgtype = paramType ? paramType.toFQNString(true) : '*';
              encounteredSetters[name] = val;
            }
            val.$Bgaccess = t.kind === TRAIT.Getter ? "readonly" : "writeonly";
            val.$Bgmetadata = flags & DescribeTypeFlags.INCLUDE_METADATA ?
                              describeMetadataList(securityDomain, metadata) :
                              null;
            val.$Bguri = ns.reflectedURI;
            val.$BgdeclaredBy = className;
            accessorsVal.push(val);
            break;
          default:
            release || assert(false, "Unknown trait type: " + t.kind);
            break;
        }
      }
    }

    // `methods` and `variables` are the only list that are `null`-ed if empty.
    if (!methodsVal || methodsVal.value.length === 0) {
      obj.$Bgmethods = null;
    }
    if (!variablesVal || variablesVal.value.length === 0) {
      obj.$Bgvariables = null;
    }

      return obj;
  }
}
