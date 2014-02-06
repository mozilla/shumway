package flash.utils {
  public function describeType(value):XML { notImplemented("describeType"); }
  [native("FlashUtilScript::getAliasName")]
  public native function getAliasName(value):String;
  public function getQualifiedClassName(value):String { notImplemented("getQualifiedClassName"); }
  [native("FlashUtilScript::getDefinitionByName")]
  public native function getDefinitionByName(name:String):Object;
  public function getQualifiedSuperclassName(value):String { notImplemented("getQualifiedSuperclassName"); }

  [native("FlashUtilScript::getTimer")]
  public native function getTimer():int;

  [native("FlashUtilScript::escapeMultiByte")]
  public native function escapeMultiByte(value:String):String;
  [native("FlashUtilScript::unescapeMultiByte")]
  public native function unescapeMultiByte(value:String):String;
}
