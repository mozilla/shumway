package flash.text.engine {
import flash.display.DisplayObject;
import flash.display.DisplayObjectContainer;
import flash.events.EventDispatcher;
import flash.geom.Rectangle;
import flash.ui.ContextMenu;

public final class TextLine extends DisplayObjectContainer {
    public function TextLine() {}
    public static const MAX_LINE_WIDTH:int = 1000000;
    public override function set focusRect(focusRect:Object):void { notImplemented("focusRect"); }
    public override function set tabChildren(enable:Boolean):void { notImplemented("tabChildren"); }
    public override function set tabEnabled(enabled:Boolean):void { notImplemented("tabEnabled"); }
    public override function set tabIndex(index:int):void { notImplemented("tabIndex"); }
    public var userData;
    public native function get textBlock():TextBlock;
    public native function get hasGraphicElement():Boolean;
    public native function get hasTabs():Boolean;
    public native function get nextLine():TextLine;
    public native function get previousLine():TextLine;
    public native function get ascent():Number;
    public native function get descent():Number;
    public native function get textHeight():Number;
    public native function get textWidth():Number;
    public native function get totalAscent():Number;
    public native function get totalDescent():Number;
    public native function get totalHeight():Number;
    public native function get textBlockBeginIndex():int;
    public native function get rawTextLength():int;
    public native function get specifiedWidth():Number;
    public native function get unjustifiedTextWidth():Number;
    public native function get validity():String;
    public native function set validity(value:String):void;
    public native function get atomCount():int;
    public native function get mirrorRegions():Vector;
    public function getMirrorRegion(mirror:EventDispatcher):TextLineMirrorRegion { notImplemented("getMirrorRegion"); return null; }
    public function flushAtomData():void { notImplemented("flushAtomData"); }
    public native function getAtomIndexAtPoint(stageX:Number, stageY:Number):int;
    public native function getAtomIndexAtCharIndex(charIndex:int):int;
    public native function getAtomBounds(atomIndex:int):Rectangle;
    public native function getAtomBidiLevel(atomIndex:int):int;
    public native function getAtomTextRotation(atomIndex:int):String;
    public native function getAtomTextBlockBeginIndex(atomIndex:int):int;
    public native function getAtomTextBlockEndIndex(atomIndex:int):int;
    public native function getAtomCenter(atomIndex:int):Number;
    public native function getAtomWordBoundaryOnLeft(atomIndex:int):Boolean;
    public native function getAtomGraphic(atomIndex:int):DisplayObject;
    public native function getBaselinePosition(baseline:String):Number;
    public native function dump():String;
    public override function set contextMenu(value:ContextMenu):void { notImplemented("contextMenu"); }
  }
}
