package flash.system {
  include "api-versions.as"
  [jsnative("CapabilitiesClass")]
  public final class Capabilities {
    public static native function get playerType():String;
  }
}
