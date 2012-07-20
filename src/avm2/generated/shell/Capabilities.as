package flash.system
{
    import avmplus.*;

    public final class Capabilities
    {
        public static function get playerType():String { return "AVMPlus"; }
        public static function get isDebugger():Boolean { return System.isDebugger(); }
    }
}