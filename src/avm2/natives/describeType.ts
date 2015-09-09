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

  const enum DescribeTypeFlags {
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

  function createNullOrUndefinedDescription(sec: AXSecurityDomain, o: any): any {
    return {
      __proto__: sec.objectPrototype,
      $Bgname: o === undefined ? "void" : "null",
      $BgisDynamic: false,
      $BgisFinal: true,
      $BgisStatic: false,
      $Bgtraits: {
        __proto__: sec.objectPrototype,
        $Bgvariables: null,
        $Bgaccessors: null,
        $Bgmetadata: sec.createArray([]),
        $Bgconstructor: null,
        $Bginterfaces: sec.createArray([]),
        $Bgmethods: null,
        $Bgbases: sec.createArray([])
      }
    };
  }

  export function describeTypeJSON(sec: AXSecurityDomain, o: any, flags: number): any {
    // Class traits aren't returned for numeric primitives, undefined, null, bound methods, or
    // non-class-constructor functions.
    var isInt = (o|0) === o;
    var nullOrUndefined = isNullOrUndefined(o);
    if (flags & DescribeTypeFlags.USE_ITRAITS && (nullOrUndefined || isInt)) {
      return null;
    }
    if (nullOrUndefined) {
      return createNullOrUndefinedDescription(sec, o);
    }
    // Use the object's own sec if we're not dealing with a primitive to make sure
    // type checks are correct.
    if (o.sec) {
      sec = o.sec;
    }
    o = sec.box(o);

    if (sec.AXFunction.axIsType(o)) {
      if (sec.AXMethodClosure.axIsType(o)) {
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

    var description: any = sec.createObject();
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
      description.$Bgtraits = addTraits(cls, info, describeClass, flags);
    }
    return description;
  }

  var tmpName = new Multiname(null, 0, CONSTANT.QName, [Namespace.PUBLIC], null);
  var tmpAttr = new Multiname(null, 0, CONSTANT.QNameA, [Namespace.PUBLIC], null);

  export function describeType(sec: AXSecurityDomain, value: any, flags: number): ASXML {
    // Ensure that the XML classes have been initialized:
    tmpName.name = 'XML';
    var xmlClass = <AXXMLClass>sec.application.getClass(tmpName);
    var classDescription: any = describeTypeJSON(sec, value, flags);
    var x: ASXML = xmlClass.Create('<type/>');
    tmpAttr.name = 'name';
    x.setProperty(tmpAttr, classDescription.$Bgname);
    var bases = classDescription.$Bgtraits.$Bgbases.value;
    if (bases.length) {
      tmpAttr.name = 'base';
      x.setProperty(tmpAttr, bases[0]);
    }
    tmpAttr.name = 'isDynamic';
    x.setProperty(tmpAttr, classDescription.$BgisDynamic.toString());
    tmpAttr.name = 'isFinal';
    x.setProperty(tmpAttr, classDescription.$BgisFinal.toString());
    tmpAttr.name = 'isStatic';
    x.setProperty(tmpAttr, classDescription.$BgisStatic.toString());
    describeTraits(x, classDescription.$Bgtraits);

    var instanceDescription: any = describeTypeJSON(sec, value,
                                                    flags | DescribeTypeFlags.USE_ITRAITS);
    if (instanceDescription) {
      var e: ASXML = xmlClass.Create('<factory/>');
      tmpAttr.name = 'type';
      e.setProperty(tmpAttr, instanceDescription.$Bgname);
      if (describeTraits(e, instanceDescription.$Bgtraits)) {
        x.appendChild(e);
      }
    }
    return x;
  }

  function describeTraits(x: ASXML, traits: any): boolean {
    var traitsCount = 0;
    var bases = traits.$Bgbases && traits.$Bgbases.value;
    for (var i = 0; bases && i < bases.length; i++) {
      var base: string = bases[i];
      var e: ASXML = x.sec.AXXML.Create('<extendsClass type="' + escapeAttributeValue(base) + '"/>');
      x.appendChild(e);
      traitsCount++;
    }
    var interfaces = traits.$Bginterfaces && traits.$Bginterfaces.value;
    for (var i = 0; interfaces && i < interfaces.length; i++) {
      var e: ASXML = x.sec.AXXML.Create('<implementsInterface type="' +
                                        escapeAttributeValue(interfaces[i]) + '"/>');
      x.appendChild(e);
      traitsCount++;
    }
    if (traits.$Bgconstructor !== null) {
      var e: ASXML = x.sec.AXXML.Create('<constructor/>');
      describeParams(e, traits.$Bgconstructor);
      x.appendChild(e);
      traitsCount++;
    }
    var variables = traits.$Bgvariables && traits.$Bgvariables.value;
    for (var i = 0; variables && i < variables.length; i++) {
      var variable: any = variables[i];
      var nodeName = variable.$Bgaccess === 'readonly' ? 'constant' : 'variable';
      var e: ASXML = x.sec.AXXML.Create('<' + nodeName +
                                        ' name="' + escapeAttributeValue(variable.$Bgname) +
                                        '" type="' + variable.$Bgtype + '"/>');
      finishTraitDescription(variable, e, x);
      traitsCount++;
    }
    var accessors = traits.$Bgaccessors && traits.$Bgaccessors.value;
    for (var i = 0; accessors && i < accessors.length; i++) {
      var accessor: any = accessors[i];
      var e: ASXML = x.sec.AXXML.Create('<accessor ' +
                                        'name="' + escapeAttributeValue(accessor.$Bgname) +
                                        '" access="' + accessor.$Bgaccess +
                                        '" type="' + escapeAttributeValue(accessor.$Bgtype) +
                                        '" declaredBy="' +
                                        escapeAttributeValue(accessor.$BgdeclaredBy) + '"/>');
      finishTraitDescription(accessor, e, x);
      traitsCount++;
    }
    var methods = traits.$Bgmethods && traits.$Bgmethods.value;
    for (var i = 0; methods && i < methods.length; i++) {
      var method: any = methods[i];
      var e: ASXML = x.sec.AXXML.Create('<method ' + 'name="' +
                                        escapeAttributeValue(method.$Bgname) +
                                        '" declaredBy="' +
                                        escapeAttributeValue(method.$BgdeclaredBy) +
                                        '" returnType="' +
                                        escapeAttributeValue(method.$BgreturnType) + '"/>');
      describeParams(e, method.$Bgparameters.value);
      finishTraitDescription(method, e, x);
      traitsCount++;
    }
    describeMetadataXML(x, traits.$Bgmetadata);
    return traitsCount > 0;
  }

  function finishTraitDescription(trait, traitXML, traitsListXML) {
    if (trait.$Bguri !== null) {
      tmpAttr.name = 'uri';
      traitXML.setProperty(tmpAttr, trait.$Bguri);
    }
    if (trait.$Bgmetadata !== null) {
      describeMetadataXML(traitXML, trait.$Bgmetadata);
    }
    traitsListXML.appendChild(traitXML);
  }

  function describeParams(x: ASXML, parameters: any[]): void {
    if (!parameters) {
      return;
    }
    for (var i = 0; i < parameters.length; i++) {
      var p = parameters[i];
      var f: ASXML = x.sec.AXXML.Create('<parameter index="' + (i + 1) + '" type="' +
                                        escapeAttributeValue(p.$Bgtype) + '" optional="' +
                                        p.$Bgoptional + '"/>');
      x.appendChild(f);
    }
  }

  function describeMetadataXML(x: ASXML, metadata_: ASArray): void {
    if (!metadata_) {
      return;
    }
    var metadata: any[] = metadata_.value;
    for (var i = 0; i < metadata.length; i++) {
      var md = metadata[i];
      var m: ASXML = x.sec.AXXML.Create('<metadata name="' + escapeAttributeValue(md.$Bgname)
                                        + '"/>');
      var values = md.$Bgvalue.value;
      for (var j = 0; j < values.length; j++) {
        var value = values[j];
        var a: ASXML = x.sec.AXXML.Create('<arg key="' +
                                          escapeAttributeValue(value.$Bgkey) + '" value="' +
                                          escapeAttributeValue(value.$Bgvalue) + '"/>');
        m.appendChild(a);
      }
      x.appendChild(m);
    }
  }

  function describeMetadataList(sec: AXSecurityDomain, list: MetadataInfo[]) {
    if (!list) {
      return null;
    }
    var result = sec.createArray([]);

    for (var i = 0; i < list.length; i++) {
      var metadata = list[i];
      var key = metadata.getName();
      // Filter out the [native] metadata nodes. These are implementation details Flash doesn't
      // expose, so we don't, either.
      if (key === 'native') {
        continue;
      }
      result.push(describeMetadata(sec, metadata));
    }
    return result;
  }

  function describeMetadata(sec: AXSecurityDomain, metadata: MetadataInfo) {
    var result = sec.createObject();
    result.$Bgname = metadata.name;
    var values = [];
    result.$Bgvalue = sec.createArray(values);
    for (var i = 0; i < metadata.keys.length; i++) {
      var val = sec.createObject();
      val.$Bgvalue = metadata.getValueAt(i);
      val.$Bgkey = metadata.getKeyAt(i);
      values.push(val);
    }
    return result;
  }

  function addTraits(cls: AXClass, info: ClassInfo, describingClass: boolean,
                     flags: DescribeTypeFlags) {
    var sec = cls.sec;
    var includeBases = flags & DescribeTypeFlags.INCLUDE_BASES;
    var includeMethods = flags & DescribeTypeFlags.INCLUDE_METHODS && !describingClass;
    var obj = sec.createObject();

    var variablesVal = obj.$Bgvariables =
      flags & DescribeTypeFlags.INCLUDE_VARIABLES ? sec.createArray([]) : null;
    var accessorsVal = obj.$Bgaccessors =
      flags & DescribeTypeFlags.INCLUDE_ACCESSORS ? sec.createArray([]) : null;

    var metadataList: any[] = null;
    // Somewhat absurdly, class metadata is only included when describing instances.
    if (flags & DescribeTypeFlags.INCLUDE_METADATA && !describingClass) {
      var metadata: MetadataInfo[] = info.trait.getMetadata();
      if (metadata) {
        metadataList = describeMetadataList(sec, metadata);
      }
    }
      // This particular metadata list is always created, even if no metadata exists.
    obj.$Bgmetadata = metadataList || sec.createArray([]);

    // TODO: fill in.
    obj.$Bgconstructor = null;

    if (flags & DescribeTypeFlags.INCLUDE_INTERFACES) {
      obj.$Bginterfaces = sec.createArray([]);
      if (!describingClass) {
        var interfacesVal = obj.$Bginterfaces.value;
        var interfaces = cls.classInfo.instanceInfo.getInterfaces(cls);
        interfaces.forEach((iface) => interfacesVal.push(iface.name.toFQNString(true)));
      }
    } else {
      obj.$Bginterfaces = null;
    }

    var methodsVal = obj.$Bgmethods = includeMethods ? sec.createArray([]) : null;
    var basesVal = obj.$Bgbases = includeBases ? sec.createArray([]) : null;

    var encounteredKeys: any = Object.create(null);

    // Needed for accessor-merging.
    var encounteredGetters: any = Object.create(null);
    var encounteredSetters: any = Object.create(null);

    var addBase = false;
    var isInterface = info.instanceInfo.isInterface();
    while (cls) {
      var className = cls.classInfo.instanceInfo.getName().toFQNString(true);
      if (includeBases && addBase && !describingClass) {
        basesVal.push(className);
      } else {
        addBase = true;
      }
      if (flags & DescribeTypeFlags.HIDE_OBJECT && cls === sec.AXObject) {
        break;
      }
      if (!describingClass) {
        describeTraits(sec, cls.classInfo.instanceInfo.traits.traits, isInterface);
      } else {
        describeTraits(sec, cls.classInfo.traits.traits, isInterface);
      }
      cls = cls.superClass;
    }
    release || assert(cls === sec.AXObject || isInterface);
    // When describing Class objects, the bases to add are always Class and Object.
    if (describingClass) {
      // When describing Class objects, accessors are ignored. *Except* the `prototype` accessor.
      if (flags & DescribeTypeFlags.INCLUDE_ACCESSORS) {
        var val = sec.createObject();
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
        cls = sec.AXClass;
      }
    }

    // Having a hot function closed over isn't all that great, but moving this out would involve
    // passing lots and lots of arguments. We might do that if performance becomes an issue.
    function describeTraits(sec: AXSecurityDomain, traits: TraitInfo[], isInterface: boolean) {
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
        // For interfaces, include all traits. We should've made sure to only have
        // public methods in them during bytecode parsing/verification.
        if (!isInterface && (!ns.isPublic() && !ns.uri ||
                             (flags & DescribeTypeFlags.HIDE_NSURI_METHODS && ns.uri))) {
          continue;
        }
        // Strip the namespace off of interface methods. They're always treated as public.
        var name = isInterface ? mn.name : mn.toFQNString(true);
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

        var val = sec.createObject();
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
                              describeMetadataList(sec, metadata) :
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
                              describeMetadataList(sec, metadata) :
                              null;
            val.$Bgname = name;
            val.$Bguri = ns.reflectedURI;
            var parametersVal = val.$Bgparameters = sec.createArray([]);
            var parameters = (<MethodTraitInfo>t).getMethodInfo().parameters;
            for (var j = 0; j < parameters.length; j++) {
              var param = parameters[j];
              var paramVal = sec.createObject();
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
                              describeMetadataList(sec, metadata) :
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
