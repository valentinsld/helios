uniform float uTime;
uniform float uSize;

attribute float aScale;
varying vec3 vColor;
varying vec4 vPosition;

void main()
{
  float time = mod(uTime * 10.0, 500.0);

  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  modelPosition.y += uTime * 100.0;
  modelPosition.y %= 500.0;

  modelPosition.x *= modelPosition.y / 500.0 * 5.0;
  modelPosition.z *= modelPosition.y / 500.0 * 5.0;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Size
  gl_PointSize = uSize * aScale;
  gl_PointSize *= ( 1.0 / - viewPosition.z );

  // pass color to fragment
  vColor = color;
  vPosition = modelPosition;
}