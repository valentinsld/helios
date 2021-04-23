uniform float uTime;

varying vec4 vPosition;

void main()
{
  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // pass color to fragment
  vPosition = modelPosition;
}