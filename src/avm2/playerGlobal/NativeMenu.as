package flash.display {

  import flash.events.EventDispatcher;

  [native(cls="MenuClass")]
  // [API("661", "667")]
  [Event(name="select", type="flash.events.Event")]
  public class NativeMenu extends EventDispatcher {
    public function NativeMenu() {}
  }

}
