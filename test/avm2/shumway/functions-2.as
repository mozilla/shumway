package {

  public function MouseEvent(
      type:String,
      localX:Number=void 0,
      localY:Number=void 0) {
    trace(localX);
    trace(localY);
  }

  (function () {
    MouseEvent("TEST", undefined);
  })();

  trace("--");
}