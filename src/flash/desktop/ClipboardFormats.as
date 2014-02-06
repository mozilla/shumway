package flash.desktop {
  import Object;
  import flash.utils.Dictionary;
  import flash.utils.ByteArray;
  import flash.utils.Dictionary;
  import SecurityError;
  import flash.errors.IllegalOperationError;
  import Error;
  import TypeError;
  import flash.utils.ByteArray;
  public class ClipboardFormats {
    public function ClipboardFormats() {}
    internal static const FLASH_PREFIX:String = "flash:";
    internal static const AIR_PREFIX:String = "air:";
    internal static const REFERENCE_PREFIX:String = "air:reference:";
    internal static const SERIALIZATION_PREFIX:String = "air:serialization:";
    public static const TEXT_FORMAT:String = "air:text";
    public static const HTML_FORMAT:String = "air:html";
    public static const RICH_TEXT_FORMAT:String = "air:rtf";
    public static const URL_FORMAT:String = "air:url";
    public static const FILE_LIST_FORMAT:String = "air:file list";
    public static const BITMAP_FORMAT:String = "air:bitmap";
    public static const FILE_PROMISE_LIST_FORMAT:String = "air:file promise list";
  }
}
