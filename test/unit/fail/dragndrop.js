(function mouseTests() {

    var Random = Shumway.Random;
    var Stage = flash.display.Stage;
    var Shape = flash.display.Shape;
    var Sprite = flash.display.Sprite;
    var MouseEventDispatcher = Shumway.AVMX.AS.flash.ui.MouseEventDispatcher;
    var MouseEvent = flash.events.MouseEvent;
    var Point = flash.geom.Point;
    var Rectangle = flash.geom.Rectangle;

    function createMouseDispatcher() {
        var s = new Stage();
        var m = new MouseEventDispatcher();
        s.setStageWidth(550);
        s.setStageHeight(400);
        m.stage = s;
        return m;
    }

    unitTests.push(function preserveDistance() {
        Random.seed(0x12343);

        var m = createMouseDispatcher();
        var fireMouseEvent = function (type, x, y) {
            r = '';
            m.handleMouseEvent({ type: type, point: new Point(x, y) });
        };

        var target = new Shape();
        target.graphics.beginFill(0xff0000);
        target.graphics.drawRect(0, 0, 100, 100);

        var draggable = new Sprite();
        draggable.graphics.beginFill(0x00ff00);
        draggable.graphics.drawRect(0, 0, 100, 100);
        draggable.x = 450;
        draggable.y = 300;

        m.stage.addChild(target);
        m.stage.addChild(draggable);

        draggable.addEventListener('mouseDown', function () {
            draggable.startDrag();
        });
        draggable.addEventListener('mouseUp', function () {
            draggable.stopDrag();
        });

        eq(draggable.x, 450);
        eq(draggable.y, 300);

        fireMouseEvent('mousedown', 500, 350);
        fireMouseEvent('mousemove', 450, 300);
        eq(draggable.x, 400);
        eq(draggable.y, 250);
        eq(draggable.dropTarget, null);

        fireMouseEvent('mousemove', 50, 50);
        eq(draggable.x, 0);
        eq(draggable.y, 0);
        eq(draggable.dropTarget, target);

        fireMouseEvent('mouseup', 50, 50);
        fireMouseEvent('mousemove', 500, 350);
        eq(draggable.x, 0);
        eq(draggable.y, 0);
        eq(draggable.dropTarget, target);
    });

    unitTests.push(function lockToPointer() {
        Random.seed(0x12343);

        var m = createMouseDispatcher();
        var fireMouseEvent = function (type, x, y) {
            r = '';
            m.handleMouseEvent({ type: type, point: new Point(x, y) });
        };

        var target = new Shape();
        target.graphics.beginFill(0xff0000);
        target.graphics.drawRect(0, 0, 100, 100);

        var draggable = new Sprite();
        draggable.graphics.beginFill(0x00ff00);
        draggable.graphics.drawRect(0, 0, 100, 100);
        draggable.x = 450;
        draggable.y = 300;

        m.stage.addChild(target);

        m.stage.addEventListener('mouseDown', function () {
            draggable.startDrag(true);
        });
        m.stage.addEventListener('mouseUp', function () {
            draggable.stopDrag();
        });

        eq(draggable.x, 450);
        eq(draggable.y, 300);

        fireMouseEvent('mousedown', 500, 350);
        fireMouseEvent('mousemove', 225, 200);
        eq(draggable.x, 225);
        eq(draggable.y, 200);
        eq(draggable.dropTarget, null);

        fireMouseEvent('mousemove', 50, 50);
        eq(draggable.x, 50);
        eq(draggable.y, 50);
        eq(draggable.dropTarget, target);

        fireMouseEvent('mouseup', 50, 50);
        fireMouseEvent('mousemove', 500, 350);
        eq(draggable.x, 50);
        eq(draggable.y, 50);
        eq(draggable.dropTarget, target);
    });

    unitTests.push(function constraintBounds() {
        Random.seed(0x12343);

        var m = createMouseDispatcher();
        var fireMouseEvent = function (type, x, y) {
            r = '';
            m.handleMouseEvent({ type: type, point: new Point(x, y) });
        };

        var target = new Shape();
        target.graphics.beginFill(0xff0000);
        target.graphics.drawRect(0, 0, 100, 100);

        var draggable = new Sprite();
        draggable.graphics.beginFill(0x00ff00);
        draggable.graphics.drawRect(0, 0, 100, 100);
        draggable.x = 450;
        draggable.y = 300;

        m.stage.addChild(draggable);
        m.stage.addChild(target);

        draggable.addEventListener('mouseDown', function () {
            draggable.startDrag(false, new Rectangle(225, 250, 225, 150));
        });
        draggable.addEventListener('mouseUp', function () {
            draggable.stopDrag();
        });

        eq(draggable.x, 450);
        eq(draggable.y, 300);

        fireMouseEvent('mousedown', 500, 350);
        fireMouseEvent('mousemove', 350, 200);
        eq(draggable.x, 300);
        eq(draggable.y, 250);
        eq(draggable.dropTarget, null);

        fireMouseEvent('mousemove', 50, 50);
        eq(draggable.x, 225);
        eq(draggable.y, 250);
        eq(draggable.dropTarget, target);

        fireMouseEvent('mouseup', 50, 50);
        fireMouseEvent('mousemove', 500, 350);
        eq(draggable.x, 450);
        eq(draggable.y, 300);
        eq(draggable.dropTarget, null);
    });

})();
