attribute vec2 a_position;
uniform vec2 u_resolution;
uniform float u_flipY;
uniform float u_time;
attribute vec2 a_textureCoordinate;
uniform mat3 u_transformMatrix;
varying vec2 v_texCoord;

void main() {
  vec2 position = ((u_transformMatrix * vec3(a_position, 1.0)).xy / u_resolution) * 2.0 - 1.0;
  position *= vec2(1.0, u_flipY);
  gl_Position = vec4(vec3(position, 1.0), 1.0);
  v_texCoord = a_textureCoordinate;
}