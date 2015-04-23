(function displayTests() {

  var Random = Shumway.Random;
  var Point = flash.geom.Point;
  var Rectangle = flash.geom.Rectangle;
  var Vector3D = flash.geom.Vector3D;
  var Matrix3D = flash.geom.Matrix3D;

  // Original at https://raw.github.com/richardlord/Coral/master/native/test/NativeMatrix3DUnitTest.as
  /*
   CORAL 3D-MATHEMATICS
   ....................

   Author: Richard Lord
   Copyright (c) Richard Lord 2008-2011
   http://www.richardlord.net/


   Licence Agreement

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   THE SOFTWARE.
   */

  function makeVector(array) {
    return sec.Float64Vector.axApply(null, [array]);
  }
  
  var e = 0.001;
  
  var matrix1;
  var determinant1;
  var inverse1;
  
  var matrix2;
  var determinant2;
  var inverse2;
  
  var pre1;
  var post1;
  var result1;
  
  var pre2;
  var post2;
  var result2;
  
  var pre3;
  var post3;
  var result3;
  
  var transform1;
  var point1;
  var vector1;
  var transformedPoint1;
  var transformedVector1;
  
  var transform2;
  var point2;
  var vector2;
  var transformedPoint2;
  var transformedVector2;
  
  var transform3;
  var point3;
  var transformedPoint3;

  Assert = {
    assertTrue: function (message, value) {
      eq(value, true, message);
    },
    assertFalse: function (message, value) {
      eq(value, false, message);
    },
    assertEquals: function (message, a, b) {
      eq(a, b, message);
    }
  };

  function createData() 
  {
    matrix1 = new Matrix3D( makeVector([ 1, 2, 1, 2, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 3 ] ) );
    determinant1 = 10;
    inverse1 = new Matrix3D( makeVector([ -0.8, 0.5, 0.3, -0.1, -0.2, 0.5, -0.3, 0.1, -1.4, 0.5, -0.1, 0.7, 1.8, -1, 0.2, -0.4 ] ) );
    
    matrix2 = new Matrix3D( makeVector([ 2, 1, -1, 0, -1, 3, -2, 0, 3, 2, -2, 0, 0, 1, 1, 1 ] ) );
    determinant2 = -1;
    inverse2 = new Matrix3D( makeVector([ 2, 0, -1, 0, 8, 1, -5, 0, 11, 1, -7, 0, -19, -2, 12, 1 ] ) );
    
    pre1 = new Matrix3D( makeVector([ 1, 2, 1, 4, 2, 3, 2, 1, 3, 3, 4, 2, 4, 2, 4, 1 ] ) );
    post1 = new Matrix3D( makeVector([ 3, 2, 4, 2, 1, 1, 1, 3, 2, 2, 2, 4, 3, 4, 1, 4 ] ) );
    result1 = new Matrix3D( makeVector([ 27, 28, 31, 24, 18, 14, 19, 10, 28, 24, 30, 18, 30, 29, 31, 22 ] ) );
    
    pre2 = new Matrix3D( makeVector([ 2, 1, 4, 1, 3, 5, 2, 2, 2, 4, 4, 1, 3, 3, 5, 1 ] ) );
    post2 = new Matrix3D( makeVector([ 3, 2, 4, 3, 2, 1, 2, 4, 4, 2, 3, 2, 3, 3, 1, 1 ] ) );
    result2 = new Matrix3D( makeVector([ 29, 38, 47, 14, 23, 27, 38, 10, 26, 32, 42, 13, 20, 25, 27, 11 ] ) );

    pre3 = new Matrix3D( makeVector([ 2, 1, 4, 0, 3, 5, 2, 0, 2, 4, 4, 0, 3, 3, 5, 1 ] ) );
    post3 = new Matrix3D( makeVector([ 3, 2, 4, 0, 2, 1, 2, 0, 4, 2, 3, 0, 3, 3, 1, 1 ] ) );
    result3 = new Matrix3D( makeVector([ 20, 29, 32, 0, 11, 15, 18, 0, 20, 26, 32, 0, 20, 25, 27, 1 ] ) );

    transform1 = new Matrix3D( makeVector([ 1, 4, 2, 0, 2, 3, 4, 0, 4, 2, 3, 0, 3, 1, 2, 1 ] ) );
    point1 = new Vector3D( 2, 3, 1 );
    transformedPoint1 = new Vector3D( 15, 20, 21 );
    vector1 = new Vector3D( 2, 3, 1 );
    transformedVector1 = new Vector3D( 12, 19, 19 );
    
    transform2 = new Matrix3D( makeVector([ 4, 1, 3, 3, 2, -2, 2, 2, 2, 4, 1, 2, 3, -1, 1, 4 ] ) );
    point2 = new Vector3D( -3, 2, 2 );
    transformedPoint2 = new Vector3D( -1, 0, -2 );
    transformedPoint2.w = 3;
    vector2 = new Vector3D( -3, 2, 2 );
    transformedVector2 = new Vector3D( -4, 1, -3 );
    transformedVector2.w = -1;
    
    transform3 = new Matrix3D( makeVector([ 1, -2, 4, 2, 3, 1, 1, -1, 2, -1, 3, 2, 1, 3, 3, 4 ] ) );
    point3 = new Vector3D( 2, -1, 3 );
    point3.w = 2;
    transformedPoint3 = new Vector3D( 7, -2, 22 );
    transformedPoint3.w = 19;
  }
  
  function constructIdentity() 
  {
    Assert.assertTrue( "Identity matrix correct", equalMatrices( new Matrix3D(), new Matrix3D( makeVector([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] ) ) ) );
    var random   = randomMatrix();
    var m = random.clone();
    m.append( new Matrix3D() );
    Assert.assertTrue( "Identity matrix has no effect", equalMatrices( m, random ) );
    m = random.clone();
    m.prepend( new Matrix3D() );
    Assert.assertTrue( "Identity matrix has no effect", equalMatrices( m, random ) );
  }

  function construct() 
  {
    var a  = randomVectorNumber( 16 );
    var matrix   = new Matrix3D( a );
    var r  = matrix.rawData;
    Assert.assertTrue( "Construct correct", nearEqualVectorNums( r, a, e ) );
  }

  function clone() 
  {
    var m1   = randomMatrix();
    var m2   = m1.clone();
    Assert.assertTrue( "Clone equals original", equalMatrices( m1, m2 ) );
    Assert.assertFalse( "Cloned matrices are not the same", m1 == m2 );
  }

  function newScale() 
  {
    var x = randomNumber();
    var y = randomNumber();
    var z = randomNumber();
    var m   = new Matrix3D();
    m.appendScale( x, y, z );
    
    var v  = randomVector();
    var w  = m.deltaTransformVector( v );
    var rv  = new Vector3D( v.x * x, v.y * y, v.z * z, 0 );
    Assert.assertTrue( "Scale vector correct", w.nearEquals( rv, e ) );
    
    var p  = randomPoint();
    var q  = m.transformVector( p );
    var rp  = new Vector3D( p.x * x, p.y * y, p.z * z, 1 );
    Assert.assertTrue( "Scale point correct", q.nearEquals( rp, e ) );
  }

  function newTranslation() 
  {
    var x = randomNumber();
    var y = randomNumber();
    var z = randomNumber();
    var m   = new Matrix3D();
    m.appendTranslation( x, y, z );
    
    var v  = randomVector();
    var w  = m.deltaTransformVector( v );
    Assert.assertTrue( "Scale vector correct", w.nearEquals( v, e ) );
    
    var p  = randomPoint();
    var q  = m.transformVector( p );
    var rp  = new Vector3D( p.x + x, p.y + y, p.z + z );
    Assert.assertTrue( "Scale point correct", q.nearEquals( rp, e ) );
  }

  function newRotationBasics() 
  {
    var deg = randomNumber();
    var v  = randomVector();
    var p  = randomPoint();
    var m   = new Matrix3D();
    m.appendRotation( deg, v, p );
    
    var w  = m.deltaTransformVector( v );
    Assert.assertTrue( "New rotation doesn't transform own axis", w.nearEquals( v, e ) );
    
    var q  = m.transformVector( p );
    Assert.assertTrue( "New rotation doesn't transform point on axis", q.nearEquals( p, e ) );
    p.incrementBy( v );
    q = m.transformVector( p );
    Assert.assertTrue( "New rotation doesn't transform point on axis", q.nearEquals( p, e ) );
    
    v.normalize();
    var m2   = new Matrix3D();
    m2.appendRotation( deg, v, p );
    Assert.assertTrue( "New rotation axis length is irrelevant", nearEqualMatrices( m, m2, e ) );
    
    p = randomPoint();
    m = new Matrix3D();
    m.appendRotation( 360, v, p );
    q = m.transformVector( p );
    Assert.assertTrue( "New rotation 360 degrees doesn't transform point", q.nearEquals( p, e ) );
  }

  function newRotation() 
  {
    var p  = randomPoint();
    var m  = new Matrix3D();
    var u  = new Vector3D( 1, 1, 1 );
    u.normalize();
    m.appendRotation( 120, u, p );
    
    var v  = m.deltaTransformVector( Vector3D.axClass.X_AXIS );
    Assert.assertTrue( "New rotation transform on x axis", v.nearEquals( Vector3D.axClass.Y_AXIS, e ) );
    
    v = m.deltaTransformVector( Vector3D.axClass.Y_AXIS );
    Assert.assertTrue( "New rotation transform on y axis", v.nearEquals( Vector3D.axClass.Z_AXIS, e ) );
    
    v = m.deltaTransformVector( Vector3D.axClass.Z_AXIS );
    Assert.assertTrue( "New rotation transform on z axis", v.nearEquals( Vector3D.axClass.X_AXIS, e ) );
    
    var q  = m.transformVector( p.add( Vector3D.axClass.X_AXIS ) );
    Assert.assertTrue( "New rotation transform on p + x axis", q.nearEquals( p.add( Vector3D.axClass.Y_AXIS ), e ) );
    
    q = m.transformVector( p.add( Vector3D.axClass.Y_AXIS ) );
    Assert.assertTrue( "New rotation transform on p + y axis", q.nearEquals( p.add( Vector3D.axClass.Z_AXIS ), e ) );
    
    q = m.transformVector( p.add( Vector3D.axClass.Z_AXIS ) );
    Assert.assertTrue( "New rotation transform on p + z axis", q.nearEquals( p.add( Vector3D.axClass.X_AXIS ), e ) );
  }

  function append() 
  {
    post1.append( pre1 );
    Assert.assertTrue( "Append 1 success", equalMatrices( post1, result1 ) );
    post2.append( pre2 );
    Assert.assertTrue( "Append 2 success", equalMatrices( post2, result2 ) );
  }

  function appendScale() 
  {
    var x = randomNumber();
    var y = randomNumber();
    var z = randomNumber();

    var m1   = randomMatrix();
    var m2   = m1.clone();
    var m3   = new Matrix3D();
    m3.appendScale( x, y, z );
    m1.append( m3 );
    m2.appendScale( x, y, z );
    Assert.assertTrue( "Append scale success", nearEqualMatrices( m1, m2, e ) );
  }

  // Fails: assumes bottom row of matrix is ( 0 0 0 1 )
  function appendTranslation() 
  {
    var x = randomNumber();
    var y = randomNumber();
    var z = randomNumber();

    var m1   = randomMatrix_fixed();
    var m2   = m1.clone();
    var m3   = new Matrix3D();
    m3.appendTranslation( x, y, z );
    m1.append( m3 );
    m2.appendTranslation( x, y, z );
    Assert.assertTrue( "Append translation success", nearEqualMatrices( m1, m2, e ) );
  }

  function appendRotation() 
  {
    var deg = randomNumber();
    var v  = randomVector();
    var p  = randomPoint();

    var m1   = randomMatrix();
    var m2   = m1.clone();
    var m3   = new Matrix3D();
    m3.appendRotation( deg, v, p );
    m1.append( m3 );
    m2.appendRotation( deg, v, p );
    Assert.assertTrue( "Append rotation success", nearEqualMatrices( m1, m2, e ) );
  }

  function prepend() 
  {
    pre1.prepend( post1 );
    Assert.assertTrue( "Prepend 1 success", nearEqualMatrices( pre1, result1, e ) );
    pre2.prepend( post2 );
    Assert.assertTrue( "Prepend 2 success", nearEqualMatrices( pre2, result2, e ) );
  }

  function prepend_fixed() 
  {
    pre3.prepend( post3 );
    Assert.assertTrue( "Prepend 3 success", nearEqualMatrices( pre3, result3, e ) );
  }

  function prependScale() 
  {
    var x = randomNumber();
    var y = randomNumber();
    var z = randomNumber();

    var m1   = randomMatrix();
    var m2   = m1.clone();
    var m3   = new Matrix3D();
    m3.appendScale( x, y, z );
    m1.prepend( m3 );
    m2.prependScale( x, y, z );
    Assert.assertTrue( "Prepend scale success", nearEqualMatrices( m1, m2, e ) );
  }

  function prependTranslation() 
  {
    var x = randomNumber();
    var y = randomNumber();
    var z = randomNumber();

    var m1   = randomMatrix();
    var m2   = m1.clone();
    var m3   = new Matrix3D();
    m3.appendTranslation( x, y, z );
    m1.prepend( m3 );
    m2.prependTranslation( x, y, z );
    Assert.assertTrue( "Prepend translation success", nearEqualMatrices( m1, m2, e ) );
  }

  // Sometimes fails: rounding errors exceed e
  function prependRotation() 
  {
    var deg = randomNumber();
    var v  = randomVector();
    var p  = randomPoint();

    var m1   = randomMatrix();
    var m2   = m1.clone();
    var m3   = new Matrix3D();
    m3.appendRotation( deg, v, p );
    m1.prepend( m3 );
    m2.prependRotation( deg, v, p );
    Assert.assertTrue( "Prepend rotation success", nearEqualMatrices( m1, m2, e ) );
  }

  // Fails: Just gets it wrong, for all matrices not just these two
  function determinant() 
  {
    Assert.assertEquals( "Matrix 1 determinant correct", matrix1.determinant, determinant1 );
    Assert.assertEquals( "Matrix 2 determinant correct", matrix2.determinant, determinant2 );
  }

  function invert() 
  {
    var m1   = randomMatrix();
    var m2   = m1.clone();
    m2.invert();
    m1.append( m2 );
    Assert.assertTrue( "Random inverse correct", nearEqualMatrices( m1, new Matrix3D(), e ) );

    matrix1.invert();
    Assert.assertTrue( "Matrix 1 inverse correct", nearEqualMatrices( matrix1, inverse1, e ) );
    matrix2.invert();
    Assert.assertTrue( "Matrix 2 inverse correct", nearEqualMatrices( matrix2, inverse2, e ) );
  }

  function deltaTransformVector() 
  {
    var v  = transform1.deltaTransformVector( vector1 );
    Assert.assertTrue( "Vector transform one correct", v.nearEquals( transformedVector1, e ) );
    v = transform2.deltaTransformVector( vector2 );
    Assert.assertTrue( "Vector transform two correct", v.nearEquals( transformedVector2, e ) );
  }

  // Fails: ignores w in source
  function transformVector() 
  {
    var p  = transform1.transformVector( point1 );
    Assert.assertTrue( "Point transform one correct", p.nearEquals( transformedPoint1, e ) );
    p = transform2.transformVector( point2 );
    Assert.assertTrue( "Point transform two correct", p.nearEquals( transformedPoint2, e ) );
    p = transform3.transformVector( point3 );
    Assert.assertTrue( "Point transform three correct", p.nearEquals( transformedPoint3, e ) );
  }

  function transformVector_fixed() 
  {
    var p  = transform1.transformVector( point1 );
    Assert.assertTrue( "Point transform one correct", p.nearEquals( transformedPoint1, e ) );
    p = transform2.transformVector( point2 );
    Assert.assertTrue( "Point transform two correct", p.nearEquals( transformedPoint2, e ) );
  }

  function transformVectors() 
  {
    var m   = randomMatrix();
    var v  = new Float64Vector();
    var p1  = randomPoint();
    var p2  = randomPoint();
    var p3  = randomPoint();
    v.push( p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z );
    var t  = new Float64Vector();
    var t1  = m.transformVector( p1 );
    var t2  = m.transformVector( p2 );
    var t3  = m.transformVector( p3 );
    t.push( t1.x, t1.y, t1.z, t2.x, t2.y, t2.z, t3.x, t3.y, t3.z );
    var r  = new Float64Vector();
    m.transformVectors( v, r );
    for( var i  = 0; i < 9; ++i )
    {
      eqFloat(r.axGetNumericProperty(i), t.axGetNumericProperty(i), "Points transform " + i, e);
    }
  }

  function getPosition() 
  {
    var m   = randomMatrix();
    var p  = m.position;
    var r  = m.rawData;
    eqFloat(p.x, r.axGetNumericProperty(12), "Position x get correct", e);
    eqFloat(p.y, r.axGetNumericProperty(13), "Position y get correct", e);
    eqFloat(p.z, r.axGetNumericProperty(14), "Position z get correct", e);
  }

  function setPosition() 
  {
    var m   = randomMatrix();
    var p  = randomPoint();
    m.position = p;
    var r  = m.rawData;

    eqFloat(p.x, r.axGetNumericProperty(12), "Position x set correct", e);
    eqFloat(p.y, r.axGetNumericProperty(13), "Position y set correct", e);
    eqFloat(p.z, r.axGetNumericProperty(14), "Position z set correct", e);
  }

  function getRawData16() 
  {
    var a  = randomVectorNumber( 16 );
    var matrix   = new Matrix3D( a );
    var rawData  = matrix.rawData;
    Assert.assertTrue( "Get raw data correct", nearEqualVectorNums( rawData, a, e ) );
  }

  function setRawData16() 
  {
    var a  = randomVectorNumber( 16 );
    var matrix   = randomMatrix();
    matrix.rawData = a;
    var correct   = new Matrix3D( a );
    Assert.assertTrue( "Set raw data with 12 parameters", nearEqualMatrices( matrix, correct, e ) );
  }

  function randomNumber()
  {
    return Math.random() * 200 - 100;
  }

  function randomVector() 
  {
    return new Vector3D( randomNumber(), randomNumber(), randomNumber(), 0 );
  }

  function randomPoint() 
  {
    return new Vector3D( randomNumber(), randomNumber(), randomNumber(), 1 );
  }

  function randomMatrix()  
  {
    return new Matrix3D( makeVector([
      randomNumber(), randomNumber(), randomNumber(), randomNumber(),
      randomNumber(), randomNumber(), randomNumber(), randomNumber(),
      randomNumber(), randomNumber(), randomNumber(), randomNumber(),
      randomNumber(), randomNumber(), randomNumber(), randomNumber()
    ] ) );
  }

  function randomMatrix_fixed()  
  {
    return new Matrix3D( makeVector([
      randomNumber(), randomNumber(), randomNumber(), 0,
      randomNumber(), randomNumber(), randomNumber(), 0,
      randomNumber(), randomNumber(), randomNumber(), 0,
      randomNumber(), randomNumber(), randomNumber(), 1
    ] ) );
  }

  function randomVectorNumber( length) 
  {
    var vector = new Float64Vector();
    while ( length-- > 0 )
    {
      vector.push( randomNumber() );
    }
    return vector;
  }
  
  function equalMatrices( m1  , m2   ) 
  {
    var r1  = m1.rawData;
    var r2  = m2.rawData;
    for( var i  = 0; i < 16; ++i )
    {
      if( r1.axGetNumericProperty(i) != r2.axGetNumericProperty(i) ) return false;
    }
    return true;
  }
  
  function nearEqualMatrices( m1  , m2  , e ) 
  {
    var r1  = m1.rawData;
    var r2  = m2.rawData;
    for( var i  = 0; i < 16; ++i )
    {
      if( Math.abs( r1.axGetNumericProperty(i) - r2.axGetNumericProperty(i) ) > e )
      {
        print( "Fails at " + i + " : " + r1.axGetNumericProperty(i) + " != " + r2.axGetNumericProperty(i) );
        return false;
      }
    }
    return true;
  }
  
  function nearEqualVectorNums( v1 , v2 , e ) 
  {
    if( v1.length != v2.length )
    {
      return false;
    }
    for( var i  = 0; i < v1.length; ++i )
    {
      if( Math.abs( v1.axGetNumericProperty(i) - v2.axGetNumericProperty(i) ) > e ) return false;
    }
    return true;
  }
  
  function nearNumbers( a, b, e ) 
  {
    return Math.abs( a - b ) < e;
  }

  unitTests.push(function () {
    createData(); constructIdentity();
    createData(); construct();
    createData(); clone();
    createData(); newScale();
    createData(); newTranslation();
    createData(); newRotationBasics();
    createData(); newRotation();
    createData(); append();
    createData(); appendScale();
    createData(); appendTranslation();
    createData(); appendRotation();
    createData(); prepend();
    createData(); prepend_fixed();
    createData(); prependScale();
    createData(); prependTranslation();
    createData(); prependRotation();
    createData(); determinant();
    createData(); invert();
    createData(); deltaTransformVector();

    createData(); transformVector_fixed();
    createData(); transformVectors();
    createData(); getPosition();
    createData(); setPosition();
    createData(); getRawData16();
    createData(); setRawData16();
    // createData(); transformVector();
  });

})();
