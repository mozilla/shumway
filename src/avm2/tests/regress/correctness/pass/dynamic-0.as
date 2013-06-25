package {

  // From Box2D

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

  /**
   * A 2D column vector.
   */

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

    public function Trace() {
      trace("{x: " + x + ", y: " + y + "}");
    }
  }

  var v0 = new b2Vec2(1, 2); v0.Trace();

  var m0 = b2Mat22.FromAngle(0.12); v0.MulM(m0); v0.Trace();
  v0.Normalize(); v0.Trace();

  var vec:Vector.<b2Vec2> = new Vector.<b2Vec2>();
  trace("length before: " + vec.length);
  for (var i = 0; i < 10; i++) {
    vec[i] = new b2Vec2(i, i);
  }
  trace("length after: " + vec.length);
  for (i = 0; i < vec.length; i++) {
    vec[i].Trace();
  }
  trace("for each vector:");
  var k;
  for each (k in vec) {
    k.Trace();
  }
  trace("for each array:");
  for each (k in [1, 2, 3]) {
    trace(k);
  }
  trace("for each object:");
  var values = [];
  for each (k in {a: 0, b: 1, c: 2}) {
    values.push(k);
  }
  values.sort();
  for (i = 0; i < values.length; i++) {
    trace(values[i]);
  }
  trace("-- DONE --");
}
