
/* The Great Computer Language Shootout
   http://shootout.alioth.debian.org/
   contributed by Isaac Gouy */

package {
        public class Body {
                public static var PI:Number = 3.141592653589793;
                public static var SOLAR_MASS:Number = 4 * PI * PI;
                public static var DAYS_PER_YEAR:Number = 365.24;
                public var x:Number, y:Number, z:Number, vx:Number, vy:Number, vz:Number, mass:Number;
                
                public function Body(x:Number, y:Number, z:Number, vx:Number, vy:Number, vz:Number, mass:Number):void{
                        this.x = x;
                        this.y = y;
                        this.z = z;
                        this.vx = vx;
                        this.vy = vy;
                        this.vz = vz;
                        this.mass = mass;
                }
                
                public static function Jupiter():Body {
                        return new Body(
                                4.84143144246472090e+00,
                                -1.16032004402742839e+00,
                                -1.03622044471123109e-01,
                                1.66007664274403694e-03 * DAYS_PER_YEAR,
                                7.69901118419740425e-03 * DAYS_PER_YEAR,
                                -6.90460016972063023e-05 * DAYS_PER_YEAR,
                                9.54791938424326609e-04 * SOLAR_MASS
                        );
                }

                public static function Saturn():Body {
                        return new Body(
                                8.34336671824457987e+00,
                                4.12479856412430479e+00,
                                -4.03523417114321381e-01,
                                -2.76742510726862411e-03 * DAYS_PER_YEAR,
                                4.99852801234917238e-03 * DAYS_PER_YEAR,
                                2.30417297573763929e-05 * DAYS_PER_YEAR,
                                2.85885980666130812e-04 * SOLAR_MASS
                        );
                }

                public static function Uranus():Body {
                        return new Body(
                                1.28943695621391310e+01,
                                -1.51111514016986312e+01,
                                -2.23307578892655734e-01,
                                2.96460137564761618e-03 * DAYS_PER_YEAR,
                                2.37847173959480950e-03 * DAYS_PER_YEAR,
                                -2.96589568540237556e-05 * DAYS_PER_YEAR,
                                4.36624404335156298e-05 * SOLAR_MASS
                        );
                }

                public static function Neptune():Body {
                        return new Body(
                                1.53796971148509165e+01,
                                -2.59193146099879641e+01,
                                1.79258772950371181e-01,
                                2.68067772490389322e-03 * DAYS_PER_YEAR,
                                1.62824170038242295e-03 * DAYS_PER_YEAR,
                                -9.51592254519715870e-05 * DAYS_PER_YEAR,
                                5.15138902046611451e-05 * SOLAR_MASS
                        );
                }

                public static function Sun():Body {
                        return new Body(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, SOLAR_MASS);
                }
                
                public function offsetMomentum (px:Number, py:Number, pz:Number):Body {
                        this.vx = -px / SOLAR_MASS;
                        this.vy = -py / SOLAR_MASS;
                        this.vz = -pz / SOLAR_MASS;
                        return this;
                }

        }


        public class NBodySystem {
                public var bodies:Array = new Array(5);
                
                public function NBodySystem():void {
                        bodies[0] = Body.Sun();
                        bodies[1] = Body.Jupiter();
                        bodies[2] = Body.Saturn();
                        bodies[3] = Body.Uranus();
                        bodies[4] = Body.Neptune();


                        var px:Number = 0.0;
                        var py:Number = 0.0;
                        var pz:Number = 0.0;
                        for(var i:int = 0; i < bodies.length; ++i) {
                                px += bodies[i].vx * bodies[i].mass;
                                py += bodies[i].vy * bodies[i].mass;
                                pz += bodies[i].vz * bodies[i].mass;
                        }
                        bodies[0].offsetMomentum(px,py,pz);
                }
           
                public function advance(dt:Number):void {
                   var dx:Number, dy:Number, dz:Number, distance:Number, mag:Number;
                   var size:Number = this.bodies.length;

                   for (var i:int=0; i<size; i++) {
                      var bodyi:Body = this.bodies[i];
                      for (var j:int=i+1; j<size; j++) {
                         var bodyj:Body = this.bodies[j];
                         dx = bodyi.x - bodyj.x;
                         dy = bodyi.y - bodyj.y;
                         dz = bodyi.z - bodyj.z;

                         distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                         mag = dt / (distance * distance * distance);

                         bodyi.vx -= dx * bodyj.mass * mag;
                         bodyi.vy -= dy * bodyj.mass * mag;
                         bodyi.vz -= dz * bodyj.mass * mag;

                         bodyj.vx += dx * bodyi.mass * mag;
                         bodyj.vy += dy * bodyi.mass * mag;
                         bodyj.vz += dz * bodyi.mass * mag;
                      }
                   }

                   for (var i:int=0; i<size; i++) {
                      var body:Body = this.bodies[i];
                      body.x += dt * body.vx;
                      body.y += dt * body.vy;
                      body.z += dt * body.vz;
                   }
                }

                public function energy():Number {
                        var dx:Number, dy:Number, dz:Number, distance:Number;
                        var e:Number = 0.0;
                        var size:Number = this.bodies.length;

                        for (var i:int=0; i<size; i++) {
                                var bodyi:Body = this.bodies[i];

                                e += 0.5 * bodyi.mass *
                                        ( bodyi.vx * bodyi.vx
                                        + bodyi.vy * bodyi.vy
                                        + bodyi.vz * bodyi.vz );

                                for (var j=i+1; j<size; j++) {
                                        var bodyj:Body = this.bodies[j];
                                        dx = bodyi.x - bodyj.x;
                                        dy = bodyi.y - bodyj.y;
                                        dz = bodyi.z - bodyj.z;

                                        distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                                        e -= (bodyi.mass * bodyj.mass) / distance;
                                }
                        }
                        return e;
                }

        }



        function runAccessNbody():Number {
                var res:Number;

                for ( var n:int = 3; n <= 24; n *= 2 ) {
                        var bodies:NBodySystem = new NBodySystem();
                        var max:Number = n * 100;

                        res = bodies.energy();
                        for (var i=0; i<max; i++){
                                bodies.advance(0.01);
                        }
                        res = bodies.energy();
                        print(""+n+"="+res);
                }
                return res;
        }
    
        var start:Number = new Date();
        var res:Number = runAccessNbody();
        var totaltime:Number = new Date() - start;
        
        if (res-(-0.1690693)<0.00001)
           print("PASSED res="+res);
        else
           print("FAILED nbody result expecting -0.1690693 got "+res);

/*    
        if (res-(-0.1690693)<0.00001)
           print("metric time "+totaltime);
        else
           print("error nbody result expecting -0.1690693 got "+res);
*/

}
