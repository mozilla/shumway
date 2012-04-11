package flash.system {
  include "api-versions.as"
  [native(cls="CapabilitiesClass")]
  public final class Capabilities {
    public static native function get playerType():String;
  }
}
