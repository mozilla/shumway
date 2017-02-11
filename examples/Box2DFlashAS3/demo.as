package 
{
    import flash.display.*;
    import flash.events.*;
    import flash.utils.*;

    // Box2D from http://sourceforge.net/projects/box2dflash/files/box2dflash/Box2DFlashAS3_2.0.2/Box2DFlashAS3_2.0.2_.zip/download
    import Box2D.Collision.*;
    import Box2D.Collision.Shapes.*;
    import Box2D.Common.Math.*;
    import Box2D.Dynamics.*;
    
    public class demo extends flash.display.Sprite
    {
		private var prandom: Function;

        public function demo()
        {
            var loc5:*=null;
            var loc6:*=null;
            var loc7:*=null;

			super();
            var loc1:*=new Box2D.Collision.b2AABB();
            loc1.lowerBound.Set(-100, -100);
            loc1.upperBound.Set(100, 100);
            var loc2:*=new Box2D.Common.Math.b2Vec2(0, 10);
            this.the_world = new Box2D.Dynamics.b2World(loc1, loc2, true);
            var loc3:*=new Box2D.Dynamics.b2DebugDraw();
            var loc4:*=new flash.display.Sprite();
            addChild(loc4);
            loc3.m_sprite = loc4;
            loc3.m_drawScale = 30;
            loc3.m_fillAlpha = 0.5;
            loc3.m_lineThickness = 1;
            loc3.m_drawFlags = Box2D.Dynamics.b2DebugDraw.e_shapeBit;
            this.the_world.SetDebugDraw(loc3);
            (loc6 = new Box2D.Dynamics.b2BodyDef()).position.Set(8.5, 13);
            (loc7 = new Box2D.Collision.Shapes.b2PolygonDef()).SetAsBox(8.5, 0.5);
            loc7.friction = 0.3;
            loc7.density = 0;
            (loc5 = this.the_world.CreateBody(loc6)).CreateShape(loc7);
            loc5.SetMassFromShapes();
			
            this.addEventListener("enterFrame", this.on_enter_frame);

			(function seedRandom() {
			  // Pseudo-random generator
			  function Marsaglia(i1, i2) {
				// from http://www.math.uni-bielefeld.de/~sillke/ALGORITHMS/random/marsaglia-c
				var z=i1 || 362436069, w= i2 || 521288629;
				var nextInt = function() {
				  z=(36969*(z&65535)+(z>>>16)) & 0xFFFFFFFF;
				  w=(18000*(w&65535)+(w>>>16)) & 0xFFFFFFFF;
				  return (((z&0xFFFF)<<16) | (w&0xFFFF)) & 0xFFFFFFFF;
				};
			 
				this.nextDouble = function() {
				  var i = nextInt() / 4294967296;
				  return i < 0 ? 1 + i : i;
				};
				this.nextInt = nextInt;
			  }
			 
			  var seed = 0;
			  prandom = (new Marsaglia(seed)).nextDouble;
			})();

            return;
        }

        public function on_time(arg1:flash.events.Event):*
        {
            var loc1:*=null;
            var loc2:*=null;
            var loc3:*=null;
            trace("on_time");
            loc2 = new Box2D.Dynamics.b2BodyDef();
            loc2.position.Set(prandom() * 10 + 2, 0);
            (loc3 = new Box2D.Collision.Shapes.b2PolygonDef()).SetAsBox(prandom() + 0.1, prandom() + 0.1);
            loc3.friction = 0.3;
            loc3.density = 1;
            loc1 = this.the_world.CreateBody(loc2);
            loc1.CreateShape(loc3);
            loc1.SetMassFromShapes();
            return;
        }

        var ticks:int = 0;

        public function on_enter_frame(arg1:flash.events.Event):*
        {
            this.the_world.Step(1 / 30, 10);

            ticks++;
			if (ticks >= 33) {
				ticks = 0;
				this.on_time(arg1);
			}
            return;
        }
		
        public var the_world:Box2D.Dynamics.b2World;

    }
}
