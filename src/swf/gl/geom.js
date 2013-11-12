function transformVertices(vertices, index, transform, transformIndex, length) {
  var m = transform;
  var o = transformIndex;
  for (var i = 0, j = length * 2; i < j; i += 2) {
    var x = vertices[index + i];
    var y = vertices[index + i + 1];
    vertices[index + i]     = m[o + 0] * x + m[o + 2] * y + m[o + 4];
    vertices[index + i + 1] = m[o + 1] * x + m[o + 3] * y + m[o + 5];
  }
}

function invertTransform(transform, index) {
  var m = transform;
  var i = index;
  var m11 = m[i + 0];
  var m12 = m[i + 1];
  var m21 = m[i + 2];
  var m22 = m[i + 3];
  var dx = m[i + 4];
  var dy = m[i + 5];
  if (m12 === 0.0 && m21 === 0.0) {
    m11 = 1.0 / m11;
    m22 = 1.0 / m22;
    m12 = m21 = 0.0;
    dx = -m11 * dx;
    dy = -m22 * dy;
  } else {
    var a = m11, b = m12, c = m21, d = m22;
    var determinant = a * d - b * c;
    if (determinant === 0.0) {
      assert(false);
      return;
    }
    determinant = 1.0 / determinant;
    m11 =  d * determinant;
    m12 = -b * determinant;
    m21 = -c * determinant;
    m22 =  a * determinant;
    var ty = -(m12 * dx + m22 * dy);
    dx = -(m11 * dx + m21 * dy);
    dy = ty;
  }
  m[i + 0] = m11;
  m[i + 1] = m12;
  m[i + 2] = m21;
  m[i + 3] = m22;
  m[i + 4] = dx;
  m[i + 5] = dy;
}

function fillBuffer(buffer, index, length, value) {
  value = value || 0;
  for (var i = 0; i < length; i++) {
    buffer[index + i] = value;
  }
}

function copyBuffer(dst, dstIndex, src, srcIndex, length) {
  for (var i = 0; i < length; i++) {
    dst[dstIndex] = src[srcIndex];
    dstIndex ++;
    srcIndex ++;
  }
}

function createRectangleVertices(vertices, index, x, y, w, h) {
  vertices[index +  0] = x;
  vertices[index +  1] = y;
  vertices[index +  2] = x + w;
  vertices[index +  3] = y;
  vertices[index +  4] = x;
  vertices[index +  5] = y + h;

  vertices[index +  6] = x;
  vertices[index +  7] = y + h;
  vertices[index +  8] = x + w;
  vertices[index +  9] = y;
  vertices[index + 10] = x + w;
  vertices[index + 11] = y + h;
}

var CURVE_RECURSION_LIMIT = 32;
var CURVE_COLLINEARITY_EPSILON = 1e-30;
var CURVE_DISTANCE_EPSILON = 1e-30;
var CURVE_ANGLE_TOLERANCE_EPSILON = 0.01;
var ANGLE_TOLERANCE = 0;
var DISTANCE_TOLERANCE_SQUARE = 0.5 * 0.5;

/**
 * De Casteljau Algorithm for Quadratic Curve Subdivision (Anti-Grain Geometry Implementation)
 */
function createQuadraticCurveVertices(vertices, index, x0, y0, x1, y1, x2, y2, level) {
  if (level > CURVE_RECURSION_LIMIT) {
    return 0;
  }
  // Find Mid-Points
  var x01 = (x0 + x1) / 2;
  var y01 = (y0 + y1) / 2;
  var x12 = (x1 + x2) / 2;
  var y12 = (y1 + y2) / 2;
  var x012 = (x01 + x12) / 2;
  var y012 = (y01 + y12) / 2;

  var dx = x2 - x0;
  var dy = y2 - y0;
  var d = Math.abs((x1 - x2) * dy - (y1 - y2) * dx);

  if (d > CURVE_COLLINEARITY_EPSILON) {
    // Regular Case
    if (d * d <= DISTANCE_TOLERANCE_SQUARE * (dx * dx + dy * dy)) {
      if (ANGLE_TOLERANCE < CURVE_ANGLE_TOLERANCE_EPSILON) {
        vertices[index + 0] = x012;
        vertices[index + 1] = y012;
        return index + 2;
      }
      // Angle & Cusp Condition
      var da = Math.abs(Math.atan2(y2 - y1, x2 - x1) - Math.atan2(y1 - y0, x1 - x0));
      if (da >= Math.PI) {
        da = 2 * Math.PI - da;
      }
      if (da < ANGLE_TOLERANCE) {
        vertices[index + 0] = x012;
        vertices[index + 1] = y012;
        return index + 2;
      }
    }
  } else {
    notImplemented("Collinear Case");
  }
  // Recursively Subdivide Curve
  index = createQuadraticCurveVertices(vertices, index, x0, y0, x01, y01, x012, y012, level + 1);
  index = createQuadraticCurveVertices(vertices, index, x012, y012, x12, y12, x2, y2, level + 1);
  return index;
}