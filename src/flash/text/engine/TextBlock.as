package flash.text.engine {
public final class TextBlock {
    public function TextBlock(content:ContentElement = null, tabStops:Vector = null, textJustifier:TextJustifier = null, lineRotation:String = "rotate0", baselineZero:String = "roman", bidiLevel:int = 0, applyNonLinearFontScaling:Boolean = true, baselineFontDescription:FontDescription = null, baselineFontSize:Number = 12) {}
    public var userData;
    public native function get applyNonLinearFontScaling():Boolean;
    public native function set applyNonLinearFontScaling(value:Boolean):void;
    public native function get baselineFontDescription():FontDescription;
    public native function set baselineFontDescription(value:FontDescription):void;
    public native function get baselineFontSize():Number;
    public native function set baselineFontSize(value:Number):void;
    public native function get baselineZero():String;
    public native function set baselineZero(value:String):void;
    public native function get content():ContentElement;
    public native function set content(value:ContentElement):void;
    public native function get bidiLevel():int;
    public native function set bidiLevel(value:int):void;
    public native function get firstInvalidLine():TextLine;
    public native function get firstLine():TextLine;
    public native function get lastLine():TextLine;
    public function get textJustifier():TextJustifier { notImplemented("textJustifier"); return null; }
    public function set textJustifier(value:TextJustifier):void { notImplemented("textJustifier"); }
    public native function get textLineCreationResult():String;
    public native function get lineRotation():String;
    public native function set lineRotation(value:String):void;
    public function get tabStops():Vector { notImplemented("tabStops"); return null; }
    public function set tabStops(value:Vector):void { notImplemented("tabStops"); }
    public native function findNextAtomBoundary(afterCharIndex:int):int;
    public native function findPreviousAtomBoundary(beforeCharIndex:int):int;
    public native function findNextWordBoundary(afterCharIndex:int):int;
    public native function findPreviousWordBoundary(beforeCharIndex:int):int;
    public native function getTextLineAtCharIndex(charIndex:int):TextLine;
    public function createTextLine(previousLine:TextLine = null, width:Number = 1000000, lineOffset:Number = 0, fitSomething:Boolean = false):TextLine { notImplemented("createTextLine"); return null; }
    public function recreateTextLine(textLine:TextLine, previousLine:TextLine = null, width:Number = 1000000, lineOffset:Number = 0, fitSomething:Boolean = false):TextLine { notImplemented("recreateTextLine"); return null; }
    public native function releaseLineCreationData():void;
    public native function releaseLines(firstLine:TextLine, lastLine:TextLine):void;
    public native function dump():String;
  }
}
