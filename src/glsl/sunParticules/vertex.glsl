attribute float aSize;
uniform float size;
uniform float uPixel;
uniform float uTime;

void main()
{

  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Size
  float idle = sin(uTime * 1.5) / 6.0 + 1.1;
  gl_PointSize = size * aSize * uPixel * idle;
}