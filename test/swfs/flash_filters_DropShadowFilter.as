
package {
    import flash.display.Sprite;
    import flash.events.Event;
    import flash.events.MouseEvent;
    import flash.filters.BitmapFilter;
    import flash.filters.BitmapFilterQuality;
    import flash.filters.DropShadowFilter;

    public class A extends Sprite {
        private var bgColor:uint = 0xFFCC00;
        private var size:uint    = 80;
        private var offset:uint  = 50;

        public function A() {
            draw();
            var filter:BitmapFilter = getBitmapFilter();
            var myFilters:Array = new Array();
            myFilters[0] = filter;
            filters = myFilters;
        }

        private function getBitmapFilter():BitmapFilter {
            var color = 0x000000;
            var angle = 45;
            var alpha = 0.8;
            var blurX = 8;
            var blurY = 8;
            var distance = 15;
            var strength = 0.65;
            var inner:Boolean = false;
            var knockout:Boolean = false;
            var quality = BitmapFilterQuality.HIGH;
            return new DropShadowFilter(distance,
                                        angle,
                                        color,
                                        alpha,
                                        blurX,
                                        blurY,
                                        strength,
                                        quality,
                                        inner,
                                        knockout);
        }

        private function draw():void {
            graphics.beginFill(bgColor);
            graphics.drawRect(offset, offset, size, size);
            graphics.endFill();
        }
    }
}
