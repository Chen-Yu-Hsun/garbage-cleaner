import * as THREE from 'three';
import { WaterQuality } from '../types/game';

/**
 * ThreeRiverWater
 * Real-time 3D stereoscopic river water simulation powered by Three.js
 * Generates dynamic 3D vertex waves, perspective foreshortening, and reactive water quality shading.
 */
export class ThreeRiverWater {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private waterMesh: THREE.Mesh;
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  private width: number;
  private height: number;
  public isAvailable: boolean = false;

  constructor(width: number = 960, height: number = 115) {
    this.width = width;
    this.height = height;

    // 1. Offscreen WebGL Canvas for 3D Water Surface
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.isAvailable = true;
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to 2D water:', e);
      this.isAvailable = false;
    }

    this.scene = new THREE.Scene();

    // 2. 3D Perspective Camera tilted down toward the river surface
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 3.4, 4.8);
    this.camera.lookAt(0, 0.3, -0.6);

    // 3. Dense 3D Plane Geometry for Wave Vertices
    // Wide enough (54 units) to cover wide 8.35:1 aspect ratio without edge clipping
    this.geometry = new THREE.PlaneGeometry(54.0, 16.0, 110, 42);
    this.geometry.rotateX(-Math.PI * 0.44); // Tilted flat horizontal water surface

    // 4. Custom Stylized Colored-Pencil 3D Water Shader
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uWaterQuality: { value: 0.0 }, // 0: BLUE, 1: GREY, 2: BLACK
        uParallax: { value: 0.0 },
        uDeepColor: { value: new THREE.Color(0x025a8c) },
        uShallowColor: { value: new THREE.Color(0x38bdf8) },
        uFoamColor: { value: new THREE.Color(0xffffff) },
        uSunColor: { value: new THREE.Color(0xfef08a) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uParallax;
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormalVec;

        void main() {
          vUv = uv;

          vec3 pos = position;

          // Parallax horizontal sway
          pos.x += uParallax * 0.8 * (1.0 - uv.y);

          // 3D Wave Harmonics (Gerstner-inspired wave displacement)
          float wave1 = sin(pos.x * 0.85 + uTime * 2.2) * 0.18;
          float wave2 = cos(pos.y * 1.40 - uTime * 1.6 + pos.x * 0.45) * 0.13;
          float wave3 = sin((pos.x * 1.5 + pos.y * 1.8) + uTime * 3.0) * 0.07;
          float wave4 = cos(pos.x * 3.2 - uTime * 3.8) * 0.035;

          // Foreground wave amplification (waves closest to camera are larger and deeper)
          float depthFactor = mix(0.40, 1.40, 1.0 - uv.y);
          float elevation = (wave1 + wave2 + wave3 + wave4) * depthFactor;

          pos.z += elevation;
          vElevation = elevation;

          // Calculate surface normal
          vec3 n = normalize(vec3(
            -cos(pos.x * 0.85 + uTime * 2.2) * 0.26,
            -sin(pos.y * 1.40 - uTime * 1.6) * 0.20,
            1.0
          ));
          vNormalVec = n;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uWaterQuality;
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        uniform vec3 uFoamColor;
        uniform vec3 uSunColor;

        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormalVec;

        void main() {
          // Perspective depth gradient from back wall (vUv.y = 1.0) to camera (vUv.y = 0.0)
          float depthT = smoothstep(0.0, 1.0, 1.0 - vUv.y);

          // Wave crest foam threshold
          float foamThreshold = mix(0.10, 0.17, depthT);
          float isFoam = smoothstep(foamThreshold, foamThreshold + 0.05, vElevation);

          // Colored pencil hatched grain texture
          float hatch1 = mod(gl_FragCoord.x * 0.65 - gl_FragCoord.y * 0.35, 4.0);
          float pencilGrain = (hatch1 < 1.3) ? 0.06 : 0.0;

          // Base water color interpolation
          vec3 waterCol = mix(uDeepColor, uShallowColor, depthT * 0.85 + (vElevation * 1.8));

          // Ambient lighting & directional light
          vec3 lightDir = normalize(vec3(-0.4, 0.8, 0.5));
          float diffuse = max(dot(vNormalVec, lightDir), 0.0);
          waterCol += diffuse * 0.18 * uSunColor;

          // Sun sparkle specular glints
          float specular = pow(max(dot(vNormalVec, lightDir), 0.0), 30.0);
          waterCol += specular * 0.45 * uSunColor;

          // Seafoam crest blend
          waterCol = mix(waterCol, uFoamColor, isFoam * 0.88);

          // Pencil hatching texture modulation
          waterCol -= vec3(pencilGrain);

          // Soft opacity gradient: slightly transparent near wall, solid in front
          float alpha = mix(0.92, 0.98, depthT);

          // Black pollution toxic edge shimmer
          if (uWaterQuality > 1.5) {
            float toxicSheen = sin(gl_FragCoord.x * 0.05 + uTime * 3.0) * 0.15;
            waterCol += vec3(toxicSheen * 0.3, -toxicSheen * 0.1, toxicSheen * 0.4);
          }

          gl_FragColor = vec4(waterCol, alpha);
        }
      `,
    });

    this.waterMesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.waterMesh);
  }

  /**
   * Update 3D river wave simulation
   */
  public update(timeSec: number, waterQuality: WaterQuality, playerX: number = 480) {
    if (!this.isAvailable) return;

    this.material.uniforms.uTime.value = timeSec;

    // Parallax sway based on player position
    const pOffset = (playerX - 480) / 480;
    this.material.uniforms.uParallax.value = pOffset;

    // Water Quality color palette updates
    if (waterQuality === 'BLUE') {
      this.material.uniforms.uWaterQuality.value = 0.0;
      this.material.uniforms.uDeepColor.value.setHex(0x026194);
      this.material.uniforms.uShallowColor.value.setHex(0x38bdf8);
      this.material.uniforms.uFoamColor.value.setHex(0xffffff);
      this.material.uniforms.uSunColor.value.setHex(0xfef08a);
    } else if (waterQuality === 'GREY') {
      this.material.uniforms.uWaterQuality.value = 1.0;
      this.material.uniforms.uDeepColor.value.setHex(0x334155);
      this.material.uniforms.uShallowColor.value.setHex(0x64748b);
      this.material.uniforms.uFoamColor.value.setHex(0xe2e8f0);
      this.material.uniforms.uSunColor.value.setHex(0xd4d4d8);
    } else {
      // BLACK POLLUTED
      this.material.uniforms.uWaterQuality.value = 2.0;
      this.material.uniforms.uDeepColor.value.setHex(0x0f172a);
      this.material.uniforms.uShallowColor.value.setHex(0x27272a);
      this.material.uniforms.uFoamColor.value.setHex(0x71717a);
      this.material.uniforms.uSunColor.value.setHex(0x581c87);
    }
  }

  /**
   * Render 3D Water Frame onto internal WebGL Canvas
   */
  public render() {
    if (!this.isAvailable || !this.renderer) return;
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get the rendered Three.js canvas element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Dispose WebGL resources
   */
  public dispose() {
    if (!this.isAvailable) return;
    this.geometry.dispose();
    this.material.dispose();
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
