import * as THREE from 'three'
import Matter from 'matter-js'
import gsap from 'gsap'

import Cursor from './Cursor'
import easingsFunctions from '../utils/easingsFunctions'

// import vertexShader from '../../glsl/sun/vertex.glsl'
// import fragmentShader from '../../glsl/sun/fragment.glsl'

import fragmentShaderParticules from '../../glsl/sunParticules/fragment.glsl'
import vertexShaderParticules from '../../glsl/sunParticules/vertex.glsl'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}
const RADIUS = 18

export default class Fragment{
  constructor({canvas, engine, game, scene, camera, debug, position = POSITION, radius = RADIUS, distance = 330, multiplicatorSpeed = 1}) {
    this.game = game
    this.canvas = canvas
    this.world = engine.world
    this.scene = scene
    this.camera = camera
    this.cameraZoom = camera.zoom
    this.debug = debug

    this.params = {
      color: 0xebaf5b,
      colorHover: 0xe34f22,
      metalness: 0.3,
      roughness: 0.4,
      emissiveColor: 0xfaa961,
      emissiveIntensity: 1,
      intensity: 4,
      distance: distance,
      glowColor: 0xf7f77f,
      glowRadius: 0.7,
      glowPow: 4.5
    }

    this.position = position
    this.radius = radius
    this.multiplicatorSpeed = multiplicatorSpeed

    this.animation = true
    this.notStarted = true
    this.interactionElements = []
    this.interactionElement = null
    this.mouseDown = false

    this.cursor = {
      x: position.x,
      y: position.y,
      prevX: position.x,
      prevY: position.y
    }

    this.resize()
    this.addFragmentToWorld()
    this.addFragmentToScene()
    this.initCursor()
    // this.addPlaneToScene()
    this.createTargetObject()
    this.createTrail()

    if(this.debug) this.addDebug()

    this.initEvents()
  }

  addFragmentToWorld() {
    this.box = Matter.Bodies.circle(
      this.position.x,
      this.position.y,
      this.radius,

      {
        label: 'Fragment',
        // isStatic: true,
        inertia: 'Infinity',
        frictionAir: 1,
        mass: 0,
        collisionFilter: {
          mask: 0x0001 | 0x0002
        },
        render: {
          fillStyle: '#001Af2'
        }
      }
    );

    Matter.World.add(this.world, this.box);
  }

  addFragmentToScene() {
    this.mesh = new THREE.Group()
    this.scene.add(this.mesh)

    // SPHERE
    const SPHERE = new THREE.SphereBufferGeometry(
      this.radius,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: this.params.color,
      metalness: this.params.metalness,
      roughness: this.params.roughness,
      emissive: this.params.emissiveColor,
      emissiveIntensity: this.params.emissiveIntensity
    })

    MATERIAL.onBeforeCompile = (shader) => {
      let fragmentShader = shader.fragmentShader

      // update vertex to add position
      const startVertex = 'varying vec4 vPosition;\n'
      const endVertex = `\nvPosition = modelMatrix * vec4(position, 1.0);\n}`
      shader.vertexShader = startVertex + shader.vertexShader.replace('}', endVertex)
      
      // add uTime
      this.uniforms = shader.uniforms
      this.uniforms.uTime = {
        value: 0
      }

      // add noise
      const regexNoise = 'void main() {'
      const noise = `
        // Classic Perlin 3D Noise 
        // by Stefan Gustavson
        //
        vec4 permute(vec4 x)
        {
            return mod(((x*34.0)+1.0)*x, 289.0);
        }
        vec4 taylorInvSqrt(vec4 r)
        {
            return 1.79284291400159 - 0.85373472095314 * r;
        }
        vec3 fade(vec3 t)
        {
            return t*t*t*(t*(t*6.0-15.0)+10.0);
        }

        float cnoise(vec3 P)
        {
            vec3 Pi0 = floor(P); // Integer part for indexing
            vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P); // Fractional part for interpolation
            vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;

            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);

            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);

            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
            return 2.2 * n_xyz;
        }

        void main(){`
      fragmentShader = fragmentShader.replace(regexNoise, noise)


      // add noise
      const varying = `varying vec4 vPosition;
      uniform float uTime;
      `
      const regexFragColor = 'gl_FragColor = vec4( outgoingLight, diffuseColor.a );'
      const addNoise = `
      float noise = cnoise(vec3(vPosition.xy * 0.05, uTime * 1.5));
      outgoingLight += vec3(noise / 3.0);
      gl_FragColor = vec4( outgoingLight, diffuseColor.a );
      `
      fragmentShader = varying + fragmentShader.replace(regexFragColor, addNoise)

      shader.fragmentShader = fragmentShader
      // console.log(fragmentShader)
    }

    this.sphere = new THREE.Mesh(SPHERE, MATERIAL)

    // LIGHT
    this.sphereLight = new THREE.PointLight(this.params.color, this.params.intensity, this.params.distance)
    // this.sphereLight.castShadow = true
    this.sphereLight.shadow.mapSize.width = 512
    this.sphereLight.shadow.mapSize.height = 512
    this.sphereLight.shadow.bias = - 0.01
    this.sphereLight.shadow.camera.near = 50
    this.sphereLight.shadow.camera.far = 600

    // ADD ELEMENTS
    this.mesh.add(this.sphere, this.sphereLight)
    this.mesh.position.copy(this.position)

    this.mesh.add(this.sphere);
  }

  loopGlow (time) {
    // let viewVector = new THREE.Vector3().subVectors( this.camera.position, this.sphere.glow.getWorldPosition());
    let viewVector = new THREE.Vector3().subVectors( this.camera.position, this.sphere.glow.position);
    this.sphere.glow.material.uniforms.viewVector.value = viewVector;
  }

  addPlaneToScene() {
    const PLANE = new THREE.PlaneGeometry(
      this.viewport.width,
      this.viewport.height,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#cecece',
    })

    this.plane = new THREE.Mesh(PLANE, MATERIAL)
    this.plane.position.z = -55

    this.scene.add(this.plane)
  }

  createTrail () {
    this.countTrails = 10

    this.trailsPositions = new Float32Array(this.countTrails * 3)
    const sizes = new Float32Array(this.countTrails)

    for (let i = 0; i < this.countTrails; i++) {
      const i2 = i * 3

      // Position
      this.trailsPositions[i2    ] = this.position.x
      this.trailsPositions[i2 + 1] = this.position.y
      this.trailsPositions[i2 + 1] = this.position.z

      //sizes
      sizes[i] = easingsFunctions.easeOutQuad(i / this.countTrails)
    }

    const geometry = new THREE.BufferGeometry()
    const material = new THREE.ShaderMaterial({
      // size: parameters.size,
      // sizeAttenuation: true,
      side: THREE.FrontSide,
      // blending: THREE.AdditiveBlending,
      transparent: true,
      vertexShader: vertexShaderParticules,
      fragmentShader: fragmentShaderParticules,
      uniforms: {
        size: {
          value: 75
        },
        uColor: {
          value: new THREE.Color(this.params.color)
        },
        uPixel: {
          value: this.game.renderer.getPixelRatio()
        },
        uTime: {
          value: 0
        }
      }
    })

    geometry.setAttribute('position', new THREE.BufferAttribute(this.trailsPositions, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

    /**
     * Points
     */
    this.trails = new THREE.Points(geometry, material)

    this.scene.add(this.trails)
  }

  initCursor () {
    this.cursor.el = new Cursor()
  }

  createTargetObject() {
    this.targetObject = new THREE.Object3D();
    this.scene.add(this.targetObject);
  }


  addInteractionElements(element) {
    this.interactionElements.push(element)
    // console.log(this.interactionElements)
  }

  addDebug () {
    this.debugFolder = this.debug.addFolder('Fragment')

    this.debugFolder.addColor(this.params, 'color').onChange((color) => {
      this.sphere.material.color = new THREE.Color(color)
      this.sphereLight.color = new THREE.Color(color)
    })
    this.debugFolder.addColor(this.params, "colorHover")
    this.debugFolder.add(this.sphere.material, "metalness", 0, 1)
    this.debugFolder.add(this.sphere.material, "roughness", 0, 1)
    this.debugFolder.addColor(this.params, 'emissiveColor').onChange((color) => {
      this.sphere.material.emissive = new THREE.Color(color)
    })
    this.debugFolder.add(this.sphere.material, "emissiveIntensity", 0, 1)

    this.debugFolder.add(this.sphereLight, "intensity", 0, 15)
    this.debugFolder.add(this.sphereLight, "distance", 0, 1000)

    this.debugFolder.addColor(this.params, 'glowColor').onChange((color) => {
      const colorThree = new THREE.Color(color)
      this.sphere.glow.material.uniforms.color = new THREE.Uniform(colorThree)
      
    })
    this.debugFolder.add(this.params, "glowRadius", 0, 10).onChange((value) => {
      this.sphere.glow.material.uniforms.intensityMultiplicator.value = value;
    })
    this.debugFolder.add(this.params, "glowPow", 0, 10).onChange((value) => {
      this.sphere.glow.material.uniforms.intensityPow.value = value;
    })
  }

  hover (hov = 'in') {
    hov = hov === 'in'

    // DOM.style.cursor = hov ? 'pointer' : 'initial'
    this.cursor.el.hover(hov)
    gsap.to(
      this.mesh.scale,
      {
        x: hov ? 1.2 : 1,
        y: hov ? 1.2 : 1,
        z: hov ? 1.2 : 1,
        duration: 0.3,
        ease: 'Power3.out'
      }
    )

    const newColor = hov ? new THREE.Color(this.params.colorHover) : new THREE.Color(this.params.color)

    gsap.to(
      this.sphere.material.color,
      {
        r: newColor.r,
        g: newColor.g,
        b: newColor.b
      }
    )

    gsap.to(
      this.trails.material.uniforms.uColor.value,
      {
        r: newColor.r,
        g: newColor.g,
        b: newColor.b
      }
    )
  }

  //
  // Events
  //
  initEvents() {
    window.addEventListener('mousemove', this.cursorMove.bind(this))
    window.addEventListener('mousedown', this.interactWithElements.bind(this))
    window.addEventListener('mouseup', this.mouseUp.bind(this))

    window.addEventListener('resize', this.resize.bind(this))
  }

  resize () {
    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    this.viewport = {
      width: this.camera.right * 2 / this.cameraZoom,
      height: this.camera.top * 2 / this.cameraZoom
    }
  }

  cursorMove(e) {
    this.cursor.x = (e.clientX - this.screen.width / 2) * this.viewport.width / window.innerWidth
    this.cursor.y = (-e.clientY + this.screen.height/ 2) * this.viewport.height / window.innerHeight
  
    this.cursor.realX = e.clientX
    this.cursor.realY = e.clientY
  }
  mouseUp() {
    if (!this.interactionElement) return

    this.interactionElement.endInteract()
    this.interactionElement = null
  }

  interactWithElements() {
    this.interactionElements.forEach((element) => {     
      if (element.canUse) {
        this.interactionElement = element
        element.startInteract()
      }
    })
  }

  update(time) {
    this.cursor.el.update(this.cursor.realX, this.cursor.realY)

    // animation trails
    const oldTrails = this.trailsPositions.slice(3, this.countTrails * 3)
    const newPos = [this.mesh.position.x, this.mesh.position.y, this.mesh.position.z - this.radius]

    this.trailsPositions = new Float32Array(this.countTrails * 3)
    this.trailsPositions.set([...oldTrails, ...newPos])

    this.trails.geometry.setAttribute('position', new THREE.BufferAttribute(this.trailsPositions, 3))
    this.trails.geometry.attributes.position.needsUpdate = true

    this.trails.material.uniforms.uTime.value = time 

    // update time shader
    if(this.uniforms) this.uniforms.uTime.value = time

    let angle = 0
    let scale = 1

    if (this.notStarted) {
      Matter.Body.setPosition(
        this.box,
        Matter.Vector.create(this.position.x, this.position.y)
      )
      return
    }
    
    if (this.animation) {
      let forceX = (this.box.position.x - this.cursor.x) / -500 * this.cameraZoom
      let forceY = (this.box.position.y - this.cursor.y) / -500 * this.cameraZoom
      forceX = Math.max(Math.min(forceX, 0.4 * this.multiplicatorSpeed), -0.4 * this.multiplicatorSpeed)
      forceY = Math.max(Math.min(forceY, 0.4 * this.multiplicatorSpeed), -0.4 * this.multiplicatorSpeed)
      
      Matter.Body.applyForce(
        this.box,
        Matter.Vector.create(0,0),
        Matter.Vector.create(forceX, forceY)
      )

      angle = Math.atan2(forceY, forceX)
      if (this.box.positionPrev.x != this.box.position.x) scale = Math.min(Math.max(1.3 * this.box.speed / 60, 1), 1.4 * this.multiplicatorSpeed)

      this.mesh.rotation.z = angle
      this.mesh.scale.x = scale
      this.mesh.scale.y = 1/scale

      return
    }

    // interact with element
    if (this.interactionElement) {
      var direction = new THREE.Vector2()
      direction.subVectors(this.cursor, this.box.position)
      direction.normalize()
      // console.log(direction)

      const positionInteractement = this.interactionElement.box.position
      // update position mesh
      Matter.Body.setPosition(this.box, Matter.Vector.create(positionInteractement.x, positionInteractement.y))

      // update position mesh
      this.targetObject.position.x = positionInteractement.x + direction.x * 2000
      this.targetObject.position.y = positionInteractement.y + direction.y * 2000
      
      this.interactionElement.interact(this.targetObject.position)
    } else {
      // apply force body
      let forceX = (this.box.position.x - this.cursor.x) / -500 * this.cameraZoom
      let forceY = (this.box.position.y - this.cursor.y) / -500 * this.cameraZoom
      forceX = Math.max(Math.min(forceX, 0.4 * this.multiplicatorSpeed), -0.4 * this.multiplicatorSpeed)
      forceY = Math.max(Math.min(forceY, 0.4 * this.multiplicatorSpeed), -0.4 * this.multiplicatorSpeed)
      
      Matter.Body.applyForce(
        this.box,
        Matter.Vector.create(0,0),
        Matter.Vector.create(forceX, forceY)
      )

      angle = Math.atan2(forceY, forceX)
      if (this.box.positionPrev.x != this.box.position.x) scale = Math.min(Math.max(1.3 * this.box.speed / 60, 1), 1.4 * Math.max(this.multiplicatorSpeed, 1))
      // console.log({scale, angle, forceX, forceX})
    }

    // update position mesh
    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y

    this.mesh.rotation.z = angle
    this.mesh.scale.x = scale
    this.mesh.scale.y = 1/scale
  }
}