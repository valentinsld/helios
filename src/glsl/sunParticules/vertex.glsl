attribute float aSize;
uniform float size;
uniform float uPixel;

void main()
{

  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Size
  gl_PointSize = size * aSize * uPixel;
}