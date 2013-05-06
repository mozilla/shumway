package {


  /**
   * A 2-by-2 matrix. Stored in column-major order.
   */
  public class b2Mat22
  {
    public function b2Mat22()
    {
      col1.x = col2.y = 1.0;
    }

    public static function FromAngle(angle:Number):b2Mat22
    {
      var mat:b2Mat22 = new b2Mat22();
      mat.Set(angle);
      return mat;
    }

    public static function FromVV(c1:b2Vec2, c2:b2Vec2):b2Mat22
    {
      var mat:b2Mat22 = new b2Mat22();
      mat.SetVV(c1, c2);
      return mat;
    }

    public function Set(angle:Number) : void
    {
      var c:Number = Math.cos(angle);
      var s:Number = Math.sin(angle);
      col1.x = c; col2.x = -s;
      col1.y = s; col2.y = c;
    }

    public function SetVV(c1:b2Vec2, c2:b2Vec2) : void
    {
      col1.SetV(c1);
      col2.SetV(c2);
    }

    public function Copy():b2Mat22{
      var mat:b2Mat22 = new b2Mat22();
      mat.SetM(this);
      return mat;
    }

    public function SetM(m:b2Mat22) : void
    {
      col1.SetV(m.col1);
      col2.SetV(m.col2);
    }

    public function AddM(m:b2Mat22) : void
    {
      col1.x += m.col1.x;
      col1.y += m.col1.y;
      col2.x += m.col2.x;
      col2.y += m.col2.y;
    }

    public function SetIdentity() : void
    {
      col1.x = 1.0; col2.x = 0.0;
      col1.y = 0.0; col2.y = 1.0;
    }

    public function SetZero() : void
    {
      col1.x = 0.0; col2.x = 0.0;
      col1.y = 0.0; col2.y = 0.0;
    }

    public function GetAngle() :Number
    {
      return Math.atan2(col1.y, col1.x);
    }

    /**
     * Compute the inverse of this matrix, such that inv(A) * A = identity.
     */
    public function GetInverse(out:b2Mat22):b2Mat22
    {
      var a:Number = col1.x;
      var b:Number = col2.x;
      var c:Number = col1.y;
      var d:Number = col2.y;
      //var B:b2Mat22 = new b2Mat22();
      var det:Number = a * d - b * c;
      if (det != 0.0)
      {
        det = 1.0 / det;
      }
      out.col1.x =  det * d;	out.col2.x = -det * b;
      out.col1.y = -det * c;	out.col2.y =  det * a;
      return out;
    }

    // Solve A * x = b
    public function Solve(out:b2Vec2, bX:Number, bY:Number):b2Vec2
    {
      //float32 a11 = col1.x, a12 = col2.x, a21 = col1.y, a22 = col2.y;
      var a11:Number = col1.x;
      var a12:Number = col2.x;
      var a21:Number = col1.y;
      var a22:Number = col2.y;
      //float32 det = a11 * a22 - a12 * a21;
      var det:Number = a11 * a22 - a12 * a21;
      if (det != 0.0)
      {
        det = 1.0 / det;
      }
      out.x = det * (a22 * bX - a12 * bY);
      out.y = det * (a11 * bY - a21 * bX);

      return out;
    }

    public function Abs() : void
    {
      col1.Abs();
      col2.Abs();
    }

    public var col1:b2Vec2 = new b2Vec2();
    public var col2:b2Vec2 = new b2Vec2();
  };

  public class b2Vec2
  {
    public function b2Vec2(x_:Number=0, y_:Number=0) : void {x=x_; y=y_;};

    public function SetZero() : void { x = 0.0; y = 0.0; }
    public function Set(x_:Number=0, y_:Number=0) : void {x=x_; y=y_;};
    public function SetV(v:b2Vec2) : void {x=v.x; y=v.y;};

    public function GetNegative():b2Vec2 { return new b2Vec2(-x, -y); }
    public function NegativeSelf():void { x = -x; y = -y; }

    static public function Make(x_:Number, y_:Number):b2Vec2
    {
      return new b2Vec2(x_, y_);
    }

    public function Copy():b2Vec2{
      return new b2Vec2(x,y);
    }

    public function Add(v:b2Vec2) : void
    {
      x += v.x; y += v.y;
    }

    public function Subtract(v:b2Vec2) : void
    {
      x -= v.x; y -= v.y;
    }

    public function Multiply(a:Number) : void
    {
      x *= a; y *= a;
    }

    public function MulM(A:b2Mat22) : void
    {
      var tX:Number = x;
      x = A.col1.x * tX + A.col2.x * y;
      y = A.col1.y * tX + A.col2.y * y;
    }

    public function MulTM(A:b2Mat22) : void
    {
      var tX:Number = b2Math.Dot(this, A.col1);
      y = b2Math.Dot(this, A.col2);
      x = tX;
    }

    public function CrossVF(s:Number) : void
    {
      var tX:Number = x;
      x = s * y;
      y = -s * tX;
    }

    public function CrossFV(s:Number) : void
    {
      var tX:Number = x;
      x = -s * y;
      y = s * tX;
    }

    public function MinV(b:b2Vec2) : void
    {
      x = x < b.x ? x : b.x;
      y = y < b.y ? y : b.y;
    }

    public function MaxV(b:b2Vec2) : void
    {
      x = x > b.x ? x : b.x;
      y = y > b.y ? y : b.y;
    }

    public function Abs() : void
    {
      if (x < 0) x = -x;
      if (y < 0) y = -y;
    }

    public function Length():Number
    {
      return Math.sqrt(x * x + y * y);
    }

    public function LengthSquared():Number
    {
      return (x * x + y * y);
    }

    public function Normalize():Number
    {
      var length:Number = Math.sqrt(x * x + y * y);
      if (length < Number.MIN_VALUE)
      {
        return 0.0;
      }
      var invLength:Number = 1.0 / length;
      x *= invLength;
      y *= invLength;

      return length;
    }

    public function IsValid():Boolean
    {
      return b2Math.IsValid(x) && b2Math.IsValid(y);
    }

    public var x:Number;
    public var y:Number;
  };

  public class b2Math {
    static public function NextPowerOfTwo(x:uint):uint
    {
      x |= (x >> 1) & 0x7FFFFFFF;
      x |= (x >> 2) & 0x3FFFFFFF;
      x |= (x >> 4) & 0x0FFFFFFF;
      x |= (x >> 8) & 0x00FFFFFF;
      x |= (x >> 16)& 0x0000FFFF;
      return x + 1;
    }
    static public function IsPowerOfTwo(x:uint):Boolean
    {
      var result:Boolean = x > 0 && (x & (x - 1)) == 0;
      return result;
    }
  }

  public class b2RayCastInput
  {
    function b2RayCastInput(p1:b2Vec2 = null, p2:b2Vec2 = null, maxFraction:Number = 1)
    {
      if (p1)
        this.p1.SetV(p1);
      if (p2)
        this.p2.SetV(p2);
      this.maxFraction = maxFraction;
    }
    /**
     * The start point of the ray
     */
    public var p1:b2Vec2 = new b2Vec2();
    /**
     * The end point of the ray
     */
    public var p2:b2Vec2 = new b2Vec2();
    /**
     * Truncate the ray to reach up to this fraction from p1 to p2
     */
    public var maxFraction:Number;
  }

  public class b2RayCastOutput
  {
    /**
     * The normal at the point of collision
     */
    public var normal:b2Vec2 = new b2Vec2();
    /**
     * The fraction between p1 and p2 that the collision occurs at
     */
    public var fraction:Number;
  }

  public class b2AABB
  {
    /**
     * Verify that the bounds are sorted.
     */
    public function IsValid():Boolean{
      //b2Vec2 d = upperBound - lowerBound;;
      var dX:Number = upperBound.x - lowerBound.x;
      var dY:Number = upperBound.y - lowerBound.y;
      var valid:Boolean = dX >= 0.0 && dY >= 0.0;
      valid = valid && lowerBound.IsValid() && upperBound.IsValid();
      return valid;
    }

    /** Get the center of the AABB. */
    public function GetCenter():b2Vec2
    {
      return new b2Vec2( (lowerBound.x + upperBound.x) / 2,
          (lowerBound.y + upperBound.y) / 2);
    }

    /** Get the extents of the AABB (half-widths). */
    public function GetExtents():b2Vec2
    {
      return new b2Vec2( (upperBound.x - lowerBound.x) / 2,
          (upperBound.y - lowerBound.y) / 2);
    }

    /**
     * Is an AABB contained within this one.
     */
    public function Contains(aabb:b2AABB):Boolean
    {
      var result:Boolean = true;
      result &&= lowerBound.x <= aabb.lowerBound.x;
      result &&= lowerBound.y <= aabb.lowerBound.y;
      result &&= aabb.upperBound.x <= upperBound.x;
      result &&= aabb.upperBound.y <= upperBound.y;
      return result;
    }

    // From Real-time Collision Detection, p179.
    /**
     * Perform a precise raycast against the AABB.
     */
    public function RayCast(output:b2RayCastOutput, input:b2RayCastInput):Boolean
    {
      var tmin:Number = -Number.MAX_VALUE;
      var tmax:Number = Number.MAX_VALUE;

      var pX:Number = input.p1.x;
      var pY:Number = input.p1.y;
      var dX:Number = input.p2.x - input.p1.x;
      var dY:Number = input.p2.y - input.p1.y;
      var absDX:Number = Math.abs(dX);
      var absDY:Number = Math.abs(dY);

      var normal:b2Vec2 = output.normal;

      var inv_d:Number;
      var t1:Number;
      var t2:Number;
      var t3:Number;
      var s:Number;


      //x
      {
        if (absDX < Number.MIN_VALUE)
        {
          // Parallel.
          if (pX < lowerBound.x || upperBound.x < pX)
            return false;
        }
        else
        {
          inv_d = 1.0 / dX;
          t1 = (lowerBound.x - pX) * inv_d;
          t2 = (upperBound.x - pX) * inv_d;

          // Sign of the normal vector
          s = -1.0;

          if (t1 > t2)
          {
            t3 = t1;
            t1 = t2;
            t2 = t3;
            s = 1.0;
          }

          // Push the min up
          if (t1 > tmin)
          {
            normal.x = s;
            normal.y = 0;
            tmin = t1;
          }

          // Pull the max down
          tmax = Math.min(tmax, t2);

          if (tmin > tmax)
            return false;
        }
      }
      //y
      {
        if (absDY < Number.MIN_VALUE)
        {
          // Parallel.
          if (pY < lowerBound.y || upperBound.y < pY)
            return false;
        }
        else
        {
          inv_d = 1.0 / dY;
          t1 = (lowerBound.y - pY) * inv_d;
          t2 = (upperBound.y - pY) * inv_d;

          // Sign of the normal vector
          s = -1.0;

          if (t1 > t2)
          {
            t3 = t1;
            t1 = t2;
            t2 = t3;
            s = 1.0;
          }

          // Push the min up
          if (t1 > tmin)
          {
            normal.y = s;
            normal.x = 0;
            tmin = t1;
          }

          // Pull the max down
          tmax = Math.min(tmax, t2);

          if (tmin > tmax)
            return false;
        }
      }

      output.fraction = tmin;
      return true;
    }

    /**
     * Tests if another AABB overlaps this one.
     */
    public function TestOverlap(other:b2AABB):Boolean
    {
      var d1X:Number = other.lowerBound.x - upperBound.x;
      var d1Y:Number = other.lowerBound.y - upperBound.y;
      var d2X:Number = lowerBound.x - other.upperBound.x;
      var d2Y:Number = lowerBound.y - other.upperBound.y;

      if (d1X > 0.0 || d1Y > 0.0)
        return false;

      if (d2X > 0.0 || d2Y > 0.0)
        return false;

      return true;
    }

    /** Combine two AABBs into one. */
    public static function Combine(aabb1:b2AABB, aabb2:b2AABB):b2AABB
    {
      var aabb:b2AABB = new b2AABB();
      aabb.Combine(aabb1, aabb2);
      return aabb;
    }

    /** Combine two AABBs into one. */
    public function Combine(aabb1:b2AABB, aabb2:b2AABB):void
    {
      lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x);
      lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y);
      upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x);
      upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y);
    }

    /** The lower vertex */
    public var lowerBound:b2Vec2 = new b2Vec2();
    /** The upper vertex */
    public var upperBound:b2Vec2 = new b2Vec2();
  };

  var last = new Date();
  var start = new Date();

  function clockUnder(max, name) {
    var elapsed = new Date() - last;
    // Keep this disabled when committing this file.
    var elapsedSuffix = false ? " (" + elapsed + ")" : "";
    var nameSuffix = name ? ": " + name : "";
    if (elapsed > max) {
      trace("FAIL: > " + max + " ms" + elapsedSuffix + nameSuffix);
    } else {
      trace("PASS: < " + max + " ms" + elapsedSuffix + nameSuffix);
    }
    last = new Date();
  }

  var K = 1024;

  (function () {
    var s = 0;
    var COUNT = 2 * K * K;
    for (var i = 0; i < COUNT; i++) {
      new b2Vec2(i, i + 1);
    }
  })();

  clockUnder(5000, "New Vector");

  (function () {
    var s = 0;
    var COUNT = 1 * K * K;
    var v = new b2Vec2(i, i + 1);
    for (var i = 0; i < COUNT; i++) {
      v.Normalize();
    }
  })();

  clockUnder(5000, "Vector Normalize");

  (function () {
    var s = 0;
    var COUNT = 10 * K * K;
    for (var i = 0; i < COUNT; i++) {
      s += Number.LOG10E;
    }
    return s;
  })();

  clockUnder(5000, "Access Static Constant");

  (function () {
    var m = b2Mat22.FromAngle(0.123);
    var o = new b2Mat22();
    for (var i = 0; i < 5000000; i++) {
      m.GetInverse(o);
    }
    clockUnder(5000, "GetInverse");
    return o;
  })();

  (function () {
    for (var i = 0; i < 5000000; i++) {
      b2Math.NextPowerOfTwo(i);
      b2Math.IsPowerOfTwo(i);
    }
    clockUnder(5000, "Static Calls");
  })();

  (function () {
    var x = new b2AABB();
    var y = new b2AABB();

    x.lowerBound.Set(0, 0); x.upperBound.Set(100, 100);
    y.lowerBound.Set(123, 234); y.upperBound.Set(245, 456);
    x.Contains(y);
    var input = new b2RayCastInput(new b2Vec2(0, 0), new b2Vec2(100, 100), 1);
    var output = new b2RayCastOutput();

    for (var i = 0; i < 10000000; i++) {
      x.RayCast(output, input);
    }
    clockUnder(5000, "b2AABB");
  })();

  class A {
    function foo() {
      var x = 0;
      for (var i = 0; i < 10000; i++) {
        function back() {
          x ++;
        }
        bar(back);
      }
      trace("X : " + x);
      clockUnder(5000, "Call Back");
    }

    function bar(callback: Function) {
      for (var i = 0; i < 500; i++) {
        callback();
      }
    }
  }

  (new A()).foo();

  trace("--- DONE --- Total: " + (new Date() - start));
}