package flash.net {
  [native("FlashNetScript::navigateToURL")]
  public native function navigateToURL(request:URLRequest, window:String = null):void;
  [native("FlashNetScript::sendToURL")]
  public native function sendToURL(request:URLRequest):void;

}
