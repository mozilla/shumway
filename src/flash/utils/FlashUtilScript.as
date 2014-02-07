package flash.utils {
import avmplus.FLASH10_FLAGS;

public function describeType(value):XML {
  return avmplus.describeType(value, FLASH10_FLAGS);
}

[native("FlashUtilScript::getAliasName")]
public native function getAliasName(value):String;

public function getQualifiedClassName(value):String {
  return avmplus.getQualifiedClassName(value);
}

[native("FlashUtilScript::getDefinitionByName")]
public native function getDefinitionByName(name:String):Object;

public function getQualifiedSuperclassName(value):String {
  return avmplus.getQualifiedSuperclassName(value);
}

[native("FlashUtilScript::getTimer")]
public native function getTimer():int;

[native("FlashUtilScript::escapeMultiByte")]
public native function escapeMultiByte(value:String):String;

[native("FlashUtilScript::unescapeMultiByte")]
public native function unescapeMultiByte(value:String):String;
}
