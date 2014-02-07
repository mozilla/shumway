package flash.system {
import flash.events.EventDispatcher;

public final class AuthorizedFeaturesLoader extends EventDispatcher {
    public function AuthorizedFeaturesLoader() {}
    public native function get authorizedFeatures():AuthorizedFeatures;
    public native function loadAuthorizedFeatures():void;
    internal native function makeGlobal():void;
  }
}
