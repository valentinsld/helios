uniform float uTime;
uniform float uSize;
uniform vec3 uInitPosition;

uniform float uHeight;
uniform float uLarge;
uniform float uDisparition;
uniform float uTimeScaleY;

attribute float aScale;
varying vec3 vColor;
varying vec4 vPosition;

void main()
{
  float maxHeight = uHeight + uInitPosition.y;
  float time = mod(uTime, maxHeight);

  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  modelPosition.y += uTime * uTimeScaleY;
  modelPosition.y %= maxHeight;

  modelPosition.x *= (modelPosition.y / maxHeight) * uLarge ;
  modelPosition.z *= (modelPosition.y / maxHeight) * uLarge ;

  vec4 viewPosition = viewMatrix * modelPosition;
  viewPosition.xyz += uInitPosition.xyz;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Size
  gl_PointSize = uSize * aScale;
  gl_PointSize *= ( 1.0 / - viewPosition.z );

  // pass color to fragment
  vColor = color;
  vPosition = modelPosition;
}