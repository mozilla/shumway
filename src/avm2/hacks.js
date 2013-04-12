/**
 * Random collection of Hacks to get demos work, this file should be empty.
 */

/**
 * This sets the static string fields of the |cls| to be equal to cls.name + "." + field.name.
 */
VM_METHOD_OVERRIDES[
  Multiname.getQualifiedName(Multiname.fromSimpleName("com.google.youtube.model.registerMessages"))
] = function (cls) {
  var className = cls.classInfo.instanceInfo.name.name;
  cls.classInfo.traits.forEach(function (trait) {
    if (trait.isSlot() && trait.typeName.name === "String") {
      cls[Multiname.getQualifiedName(trait.name)] = className + "." + trait.name.name;
    }
  });
  warning("HACK: registerMessages(" + className + ")");
};
VM_METHOD_OVERRIDES[
  Multiname.getQualifiedName(Multiname.fromSimpleName("com.google.youtube.event.registerEvents"))
] = function (cls) {
  var className = cls.classInfo.instanceInfo.name.name;
  cls.classInfo.traits.forEach(function (trait) {
    if (trait.isSlot() && trait.typeName.name === "String") {
      cls[Multiname.getQualifiedName(trait.name)] = className + "." + trait.name.name;
    }
  });
  warning("HACK: registerEvents(" + className + ")");
};
