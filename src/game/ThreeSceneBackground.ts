import * as THREE from 'three';
import {
  WaterQuality,
  Pedestrian,
  TrashObject,
  RaindropObject,
  VisibleRiverTrash,
  TrashType,
} from '../types/game';

/**
 * Articulated 3D Pedestrian Rig references for real-time gait animation
 */
interface Pedestrian3DRig {
  root: THREE.Group;
  type: Pedestrian['type'];
  bodyGroup: THREE.Group;
  headGroup?: THREE.Group;
  leftLegPivot?: THREE.Group;
  leftShinPivot?: THREE.Group;
  rightLegPivot?: THREE.Group;
  rightShinPivot?: THREE.Group;
  leftArmPivot?: THREE.Group;
  rightArmPivot?: THREE.Group;
  // Canine 4-leg & tail pivots
  dogFL?: THREE.Group;
  dogFR?: THREE.Group;
  dogBL?: THREE.Group;
  dogBR?: THREE.Group;
  dogTail?: THREE.Group;
  // Cart wheels & balloon
  wheelFront?: THREE.Group;
  wheelBack?: THREE.Group;
  balloonGroup?: THREE.Group;
}

/**
 * ThreeSceneBackground
 * Full-screen (960x540) real-time 3D Game World & Entities powered by Three.js.
 * Renders in one unified 3D scene:
 *  - 3D Sky Dome, Drifting 3D Clouds & Lush 3D Horizon Foliage
 *  - 3D Stone Bridge Deck, Parapet, Coping Cornice, 11 Corbels, 3D Bins & "傷心湯" Sign
 *  - 3D Monumental Vertical Arch Supports (4 Ashlar Piers, Impost Capitals, 3D Cutwaters,
 *    3 Semicircular Arches with 3D Voussoirs, Keystones & Deep Barrel-Vault Tunnels)
 *  - 3D Articulated Bridge Pedestrians / Crowd (人群: Adult, Teen, Child, Elder, Dog, Vendor & Cart)
 *  - 3D Falling Trash Items (掉落物: T01..T06), 3D Falling Raindrops & 3D Floating River Trash
 *  - 3D Dynamic Gerstner-Wave River Water Surface & Volumetric God Rays
 */
export class ThreeSceneBackground {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private trashForegroundScene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  public isAvailable: boolean = false;

  // Dynamic Scene Elements & Materials
  private skyMat!: THREE.ShaderMaterial;
  private waterMat!: THREE.ShaderMaterial;
  private godRayMat!: THREE.ShaderMaterial;
  private pencilCoatingTex: THREE.CanvasTexture | null = null;
  private pencilLineMat = new THREE.LineBasicMaterial({
    color: 0x382819,
    transparent: true,
    opacity: 0.56,
  });
  private cloudGroups: THREE.Group[] = [];
  private foliageMaterials: THREE.MeshStandardMaterial[] = [];
  private stoneMaterials: THREE.MeshStandardMaterial[] = [];
  private darkStoneMaterials: THREE.MeshStandardMaterial[] = [];
  private mossMaterials: THREE.MeshStandardMaterial[] = [];
  private sunLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private fgSunLight!: THREE.DirectionalLight;
  private fgHemiLight!: THREE.HemisphereLight;
  private signMesh!: THREE.Mesh;

  // 3D Crowd (人群) & 3D Falling/Floating Items (掉落物) Containers
  private pedestrianRigs: Map<string, Pedestrian3DRig> = new Map();
  private trashMeshes: Map<string, THREE.Group> = new Map();
  private raindropMeshes: Map<string, THREE.Group> = new Map();
  private riverTrashMeshes: Map<string, THREE.Group> = new Map();

  // Default ambient pedestrians for Start Screen preview when no engine state is passed
  private defaultPedestrians: Pedestrian[] = [
    { id: 'def-p1', type: 'child', x: 220, y: 104, direction: 1, speed: 42, walkFrame: 0, color: '#0284c7', balloonColor: '#ef4444' },
    { id: 'def-p2', type: 'cart', x: 480, y: 104, direction: 1, speed: 32, walkFrame: 0, color: '#ea580c', balloonColor: '#facc15' },
    { id: 'def-p3', type: 'dog', x: 170, y: 106, direction: 1, speed: 60, walkFrame: 1, color: '#b45309' },
    { id: 'def-p4', type: 'adult', x: 680, y: 104, direction: -1, speed: 46, walkFrame: 2, color: '#475569' },
    { id: 'def-p5', type: 'elder', x: 820, y: 104, direction: -1, speed: 28, walkFrame: 0, color: '#57534e' },
    { id: 'def-p6', type: 'teen', x: 360, y: 104, direction: -1, speed: 52, walkFrame: 3, color: '#9333ea' },
  ];

  private lastWaterQuality: WaterQuality | null = null;

  constructor(width: number = 960, height: number = 540) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: false,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.08;
      this.isAvailable = true;
    } catch (e) {
      console.warn('ThreeSceneBackground WebGL init failed, falling back:', e);
      this.isAvailable = false;
    }

    this.scene = new THREE.Scene();
    this.trashForegroundScene = new THREE.Scene();

    // Exact 1:1 coordinate calibration at Z = 0:
    // Screen (960x540) -> World (19.2 x 10.8) at Z = 0, Camera at Z = 18
    // X_world = (x_px - 480) / 50   [-9.6 .. +9.6]
    // Y_world = (270 - y_px) / 50   [+5.4 .. -5.4]
    const fov = 2 * Math.atan(5.4 / 18) * (180 / Math.PI);
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.5, 60);
    this.camera.position.set(0, 0, 18);
    this.camera.lookAt(0, 0, 0);

    if (this.isAvailable) {
      this.buildLights();
      this.buildSkyAndClouds();
      this.buildHorizonFoliage();
      this.buildMonumentalArchesAndPiers();
      this.buildBridgeDeckAndProps();
      this.buildRiverWater();
      this.buildVolumetricGodRays();
      this.applyWaterQualityPalette('BLUE');
    }
  }

  /**
   * Shared Colored-Pencil Coating Texture (色鉛筆手繪筆觸與畫紙肌理塗層貼圖)
   */
  private getPencilCoatingTexture(): THREE.CanvasTexture {
    if (this.pencilCoatingTex) return this.pencilCoatingTex;

    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;

    // Warm white paper base (multiplies cleanly with any material.color)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Deterministic pseudo-random for consistent colored-pencil strokes
    let s = 4099;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    // Primary diagonal colored-pencil hatching (-34 deg)
    ctx.lineCap = 'round';
    for (let i = -256; i < 512; i += 4) {
      ctx.strokeStyle = rand() > 0.35 ? 'rgba(54, 40, 26, 0.22)' : 'rgba(92, 70, 48, 0.16)';
      ctx.lineWidth = 1.1 + rand() * 1.3;
      for (let seg = 0; seg < 256; seg += 36) {
        const jx = (rand() - 0.5) * 4;
        const jy = (rand() - 0.5) * 4;
        ctx.beginPath();
        ctx.moveTo(i + seg * 0.8 + jx, seg + jy);
        ctx.lineTo(i + (seg + 28) * 0.8 + jx, seg + 28 + jy);
        ctx.stroke();
      }
    }

    // Secondary cross-hatching strokes (+24 deg)
    for (let i = -256; i < 512; i += 9) {
      ctx.strokeStyle = 'rgba(64, 48, 32, 0.13)';
      ctx.lineWidth = 1.0 + rand();
      ctx.beginPath();
      ctx.moveTo(i, 256);
      ctx.lineTo(i + 160, 0);
      ctx.stroke();
    }

    // Sketchbook paper tooth grain speckles
    for (let g = 0; g < 900; g++) {
      const gx = rand() * 256;
      const gy = rand() * 256;
      ctx.fillStyle = rand() > 0.45 ? 'rgba(50, 36, 22, 0.16)' : 'rgba(255, 253, 245, 0.38)';
      ctx.fillRect(gx, gy, 1.6, 1.6);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    this.pencilCoatingTex = tex;
    return tex;
  }

  /**
   * Inject Colored-Pencil Coating Shader (色鉛筆輪廓描邊 + 陰影排線 + 紙張顆粒塗層) into a 3D Material
   */
  private applyPencilCoatingToMaterial(
    mat: THREE.MeshStandardMaterial,
    outlineStrength: number = 0.72
  ): THREE.MeshStandardMaterial {
    const coatingTex = this.getPencilCoatingTexture();
    if (!mat.map) {
      mat.map = coatingTex;
    }
    if (!mat.bumpMap) {
      mat.bumpMap = coatingTex;
      mat.bumpScale = 0.016;
    }

    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        vec3 cpViewDir = normalize(vViewPosition);
        float cpNdotV = abs(dot(normalize(normal), cpViewDir));
        float cpOutline = smoothstep(0.42, 0.14, cpNdotV);
        float cpLum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
        float cpStroke1 = sin((gl_FragCoord.x * 0.92 + gl_FragCoord.y * 0.58) * 1.45);
        float cpStroke2 = sin((gl_FragCoord.x * 0.58 - gl_FragCoord.y * 0.92) * 1.35);
        float cpPaper = fract(sin(dot(floor(gl_FragCoord.xy * 0.75), vec2(12.9898, 78.233))) * 43758.5453);
        float cpHatch = step(0.32, cpStroke1) * 0.085 + step(0.52, cpStroke2) * (1.0 - smoothstep(0.18, 0.78, cpLum)) * 0.11;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.74, cpHatch);
        gl_FragColor.rgb += (cpPaper - 0.5) * 0.055;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.20, 0.14, 0.09), cpOutline * ${outlineStrength.toFixed(2)});
        `
      );
    };
    mat.needsUpdate = true;
    return mat;
  }

  /**
   * Traverse a 3D Object/Group and apply Colored-Pencil Coating + optional Sketchy Edge Lines
   */
  private applyPencilCoatingToGroup(
    root: THREE.Object3D,
    addEdgeLines: boolean = false,
    thresholdAngle: number = 28,
    outlineStrength: number = 0.72
  ) {
    const meshes: THREE.Mesh[] = [];
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) {
            if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              this.applyPencilCoatingToMaterial(m as THREE.MeshStandardMaterial, outlineStrength);
            }
          }
        }
        if (addEdgeLines) {
          meshes.push(mesh);
        }
      }
    });

    for (const mesh of meshes) {
      const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
      const line = new THREE.LineSegments(edgesGeo, this.pencilLineMat);
      mesh.add(line);
    }
  }

  /**
   * Generate procedural hand-crafted stone / colored-pencil texture for 3D meshes
   */
  private createStoneTexture(baseHex: string, lineHex: string, grainHex: string): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;

    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 256, 256);

    // Dense colored-pencil diagonal hatching & cross-hatching over stone blocks
    ctx.lineCap = 'round';
    ctx.strokeStyle = grainHex;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.42;
    for (let i = -256; i < 512; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 256, 256);
      ctx.stroke();
    }

    ctx.strokeStyle = lineHex;
    ctx.lineWidth = 1.1;
    ctx.globalAlpha = 0.18;
    for (let i = -256; i < 512; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 256);
      ctx.lineTo(i + 200, 0);
      ctx.stroke();
    }

    // Hand-drawn ashlar masonry mortar lines
    ctx.strokeStyle = lineHex;
    ctx.lineWidth = 3.2;
    ctx.globalAlpha = 0.65;
    const rows = 4;
    const rowH = 256 / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();

      const offset = (r % 2) * 64;
      for (let x = offset; x < 256; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowH);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /**
   * Create the wooden sign texture with "傷心湯"
   */
  private createSignTexture(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 160;
    const ctx = c.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, 160);
    grad.addColorStop(0, '#9c622d');
    grad.addColorStop(0.5, '#7c4a1e');
    grad.addColorStop(1, '#5c3412');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 160);

    ctx.strokeStyle = 'rgba(40, 20, 5, 0.45)';
    ctx.lineWidth = 2;
    for (let y = 32; y < 160; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#3b200c';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 246, 150);

    ctx.strokeStyle = '#e6c295';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, 228, 132);

    ctx.fillStyle = '#fffbeb';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.font = 'bold 64px "Noto Sans TC", "DotGothic16", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('傷心湯', 128, 84);

    return new THREE.CanvasTexture(c);
  }

  private buildLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x6b533b, 1.15);
    this.hemiLight.position.set(0, 12, 6);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff7e6, 1.55);
    this.sunLight.position.set(-8, 11, 12);
    this.scene.add(this.sunLight);

    const bounceLight = new THREE.DirectionalLight(0x7dd3fc, 0.45);
    bounceLight.position.set(6, -6, 8);
    this.scene.add(bounceLight);

    // Matching lights for the dedicated foreground 3D trash/raindrop layer (rendered above bridge piers)
    this.fgHemiLight = new THREE.HemisphereLight(0xffffff, 0x6b533b, 1.15);
    this.fgHemiLight.position.set(0, 12, 6);
    this.trashForegroundScene.add(this.fgHemiLight);

    this.fgSunLight = new THREE.DirectionalLight(0xfff7e6, 1.55);
    this.fgSunLight.position.set(-8, 11, 12);
    this.trashForegroundScene.add(this.fgSunLight);

    const fgBounceLight = new THREE.DirectionalLight(0x7dd3fc, 0.45);
    fgBounceLight.position.set(6, -6, 8);
    this.trashForegroundScene.add(fgBounceLight);
  }

  private buildSkyAndClouds() {
    const skyGeo = new THREE.PlaneGeometry(34, 16);
    this.skyMat = new THREE.ShaderMaterial({
      depthWrite: false,
      uniforms: {
        uTopColor: { value: new THREE.Color(0x3b82f6) },
        uBottomColor: { value: new THREE.Color(0xdbeafe) },
        uPaperTint: { value: new THREE.Color(0xfcf9f2) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uBottomColor;
        uniform vec3 uPaperTint;
        varying vec2 vUv;
        void main() {
          float t = smoothstep(0.45, 0.98, vUv.y);
          vec3 col = mix(uBottomColor, uTopColor, t);
          float hatch = mod(gl_FragCoord.x * 0.55 - gl_FragCoord.y * 0.35, 5.0);
          if (hatch < 1.2) {
            col = mix(col, uPaperTint, 0.12);
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const skyMesh = new THREE.Mesh(skyGeo, this.skyMat);
    skyMesh.position.set(0, 2.5, -8);
    this.scene.add(skyMesh);

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
    });

    const createCloudCluster = (x: number, y: number, z: number, scale: number) => {
      const group = new THREE.Group();
      const puffs = [
        { ox: -0.7, oy: -0.08, oz: 0, r: 0.38 },
        { ox: -0.25, oy: 0.12, oz: 0.08, r: 0.52 },
        { ox: 0.3, oy: 0.06, oz: 0.04, r: 0.46 },
        { ox: 0.75, oy: -0.06, oz: 0, r: 0.34 },
      ];
      for (const p of puffs) {
        const geo = new THREE.SphereGeometry(p.r, 16, 14);
        geo.scale(1.25, 0.82, 0.6);
        const m = new THREE.Mesh(geo, cloudMat);
        m.position.set(p.ox, p.oy, p.oz);
        group.add(m);
      }
      group.position.set(x, y, z);
      group.scale.setScalar(scale);
      this.scene.add(group);
      this.cloudGroups.push(group);
    };

    createCloudCluster(-5.5, 5.8, -5.0, 1.15);
    createCloudCluster(1.5, 5.5, -5.5, 0.95);
    createCloudCluster(7.2, 5.9, -4.8, 1.1);
  }

  private buildHorizonFoliage() {
    const foliageGroup = new THREE.Group();
    const foliageMatLight = this.applyPencilCoatingToMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        roughness: 0.78,
        metalness: 0.05,
      }),
      0.65
    );
    const foliageMatMid = this.applyPencilCoatingToMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        roughness: 0.82,
        metalness: 0.05,
      }),
      0.65
    );
    const foliageMatDark = this.applyPencilCoatingToMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.85,
        metalness: 0.05,
      }),
      0.65
    );
    this.foliageMaterials.push(foliageMatLight, foliageMatMid, foliageMatDark);

    const bushCount = 28;
    for (let i = 0; i < bushCount; i++) {
      const t = i / (bushCount - 1);
      const bx = -11.2 + t * 22.4;
      const r = 0.52 + ((i * 7) % 5) * 0.08;
      const by = 3.72 + ((i * 3) % 3) * 0.08;
      const bz = -1.8 - (i % 3) * 0.45;

      const geo = new THREE.DodecahedronGeometry(r, 2);
      geo.scale(1.15, 0.92, 0.75);
      const mat = i % 3 === 0 ? foliageMatLight : i % 3 === 1 ? foliageMatMid : foliageMatDark;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(bx, by, bz);
      mesh.rotation.set(i * 0.3, i * 0.5, 0);
      foliageGroup.add(mesh);
    }
    this.scene.add(foliageGroup);
  }

  private buildMonumentalArchesAndPiers() {
    const archRootGroup = new THREE.Group();
    const stoneTex = this.createStoneTexture('#faeedd', '#4a2c14', '#c49f75');
    stoneTex.repeat.set(2, 2);

    const pierTex = this.createStoneTexture('#f5e5cf', '#3b210d', '#b88c5a');
    pierTex.repeat.set(1, 3);

    const mainStoneMat = this.applyPencilCoatingToMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xfbf2e3,
        map: stoneTex,
        roughness: 0.75,
        metalness: 0.05,
      }),
      0.78
    );

    const pierStoneMat = this.applyPencilCoatingToMaterial(
      new THREE.MeshStandardMaterial({
        color: 0xf5e5cf,
        map: pierTex,
        roughness: 0.72,
        metalness: 0.06,
      }),
      0.78
    );

    const darkArchVaultMat = this.applyPencilCoatingToMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x3b2614,
        roughness: 0.9,
        metalness: 0.02,
      }),
      0.65
    );

    const mossMat = this.applyPencilCoatingToMaterial(
      new THREE.MeshStandardMaterial({
        color: 0x658a3b,
        roughness: 0.88,
        metalness: 0.02,
      }),
      0.72
    );

    this.stoneMaterials.push(mainStoneMat, pierStoneMat);
    this.darkStoneMaterials.push(darkArchVaultMat);
    this.mossMaterials.push(mossMat);

    const wallTopY = 2.70;
    const ySpring = 0.44;
    const riverTopY = -3.20;

    // 1. Deep Cavernous Backdrop Behind All Arches (Z = -4.2)
    const cavernGeo = new THREE.PlaneGeometry(18.5, 6.8);
    const cavernMat = new THREE.MeshBasicMaterial({ color: 0x120b06 });
    const cavernMesh = new THREE.Mesh(cavernGeo, cavernMat);
    cavernMesh.position.set(0, -0.3, -4.2);
    this.scene.add(cavernMesh);

    // 2. Three Monumental Semicircular 3D Arches
    const arches = [
      { cx: -5.07, r: 2.03 },
      { cx: 0.0, r: 2.04 },
      { cx: 5.07, r: 2.03 },
    ];

    for (const arch of arches) {
      const vaultDepth = 4.2;
      const vaultGeo = new THREE.CylinderGeometry(
        arch.r,
        arch.r,
        vaultDepth,
        32,
        4,
        true,
        0,
        Math.PI
      );
      vaultGeo.rotateZ(-Math.PI / 2);
      vaultGeo.rotateX(Math.PI / 2);
      const vaultMesh = new THREE.Mesh(vaultGeo, darkArchVaultMat);
      vaultMesh.position.set(arch.cx, ySpring, -vaultDepth / 2);
      archRootGroup.add(vaultMesh);

      for (const ribZ of [-0.85, -1.75, -2.65, -3.55]) {
        const ribGeo = new THREE.TorusGeometry(arch.r - 0.04, 0.07, 10, 28, Math.PI);
        const ribMesh = new THREE.Mesh(ribGeo, darkArchVaultMat);
        ribMesh.position.set(arch.cx, ySpring, ribZ);
        archRootGroup.add(ribMesh);
      }

      const jambH = ySpring - riverTopY;
      const jambGeo = new THREE.BoxGeometry(0.18, jambH, vaultDepth);
      const leftJamb = new THREE.Mesh(jambGeo, darkArchVaultMat);
      leftJamb.position.set(arch.cx - arch.r + 0.05, riverTopY + jambH / 2, -vaultDepth / 2);
      archRootGroup.add(leftJamb);

      const rightJamb = new THREE.Mesh(jambGeo, darkArchVaultMat);
      rightJamb.position.set(arch.cx + arch.r - 0.05, riverTopY + jambH / 2, -vaultDepth / 2);
      archRootGroup.add(rightJamb);

      const numVoussoirs = 15;
      const rMid = arch.r + 0.18;
      const ringThickness = 0.36;
      for (let v = 0; v < numVoussoirs; v++) {
        const isKeystone = v === 7;
        const th = Math.PI * (1 - (v + 0.5) / numVoussoirs);
        const vx = arch.cx + Math.cos(th) * (isKeystone ? rMid + 0.04 : rMid);
        const vy = ySpring + Math.sin(th) * (isKeystone ? rMid + 0.04 : rMid);

        const arcW = (Math.PI * rMid) / numVoussoirs - 0.025;
        const radialH = isKeystone ? ringThickness + 0.24 : ringThickness;
        const depthZ = isKeystone ? 0.82 : 0.56;

        const vGeo = new THREE.BoxGeometry(arcW, radialH, depthZ);
        const vMesh = new THREE.Mesh(vGeo, isKeystone ? mainStoneMat : pierStoneMat);
        vMesh.position.set(vx, vy, isKeystone ? 0.18 : 0.06);
        vMesh.rotation.z = th - Math.PI / 2;
        archRootGroup.add(vMesh);
      }
    }

    // 3. 3D Spandrel Walls between Arches
    const spandrelPositions = [-7.6, -2.54, 2.54, 7.6];
    for (const sx of spandrelPositions) {
      const spGeo = new THREE.BoxGeometry(1.65, wallTopY - ySpring, 0.38);
      const spMesh = new THREE.Mesh(spGeo, mainStoneMat);
      spMesh.position.set(sx, (wallTopY + ySpring) / 2, -0.05);
      archRootGroup.add(spMesh);

      const lintelGeo = new THREE.BoxGeometry(5.2, 0.32, 0.42);
      const lintelMesh = new THREE.Mesh(lintelGeo, mainStoneMat);
      lintelMesh.position.set(sx * 0.66, wallTopY - 0.14, -0.02);
      archRootGroup.add(lintelMesh);
    }

    // 4. Four Monumental Vertical 3D Stone Piers
    const pierCenters = [-7.60, -2.54, 2.54, 7.60];
    const pierW = 1.02;
    const shaftTopY = ySpring - 0.12;
    const shaftBotY = riverTopY + 0.28;
    const shaftH = shaftTopY - shaftBotY;

    for (let pIdx = 0; pIdx < pierCenters.length; pIdx++) {
      const px = pierCenters[pIdx];

      const numCourses = 7;
      const courseH = shaftH / numCourses;
      for (let c = 0; c < numCourses; c++) {
        const cy = shaftBotY + (c + 0.5) * courseH;
        const cW = pierW - (c % 2 === 0 ? 0 : 0.03);
        const cGeo = new THREE.BoxGeometry(cW, courseH - 0.025, 0.95);
        const cMesh = new THREE.Mesh(cGeo, pierStoneMat);
        cMesh.position.set(px, cy, 0.22);
        archRootGroup.add(cMesh);
      }

      const capGeo = new THREE.BoxGeometry(pierW + 0.22, 0.22, 1.12);
      const capMesh = new THREE.Mesh(capGeo, mainStoneMat);
      capMesh.position.set(px, ySpring + 0.01, 0.26);
      archRootGroup.add(capMesh);

      const neckGeo = new THREE.BoxGeometry(pierW + 0.12, 0.09, 1.02);
      const neckMesh = new THREE.Mesh(neckGeo, darkArchVaultMat);
      neckMesh.position.set(px, ySpring - 0.155, 0.24);
      archRootGroup.add(neckMesh);

      const cutH = 0.56;
      const cutGeo = new THREE.BoxGeometry(pierW * 0.76, cutH, 0.34);
      const cutMesh = new THREE.Mesh(cutGeo, mainStoneMat);
      cutMesh.position.set(px, shaftBotY + cutH / 2, 0.875);
      archRootGroup.add(cutMesh);

      const capPyrGeo = new THREE.ConeGeometry(pierW * 0.48, 0.24, 4);
      capPyrGeo.rotateY(Math.PI / 4);
      const capPyrMesh = new THREE.Mesh(capPyrGeo, pierStoneMat);
      capPyrMesh.position.set(px, shaftBotY + cutH + 0.125, 0.875);
      archRootGroup.add(capPyrMesh);

      const mossCluster = new THREE.Group();
      for (let m = 0; m < 4; m++) {
        const mGeo = new THREE.SphereGeometry(0.11 - m * 0.015, 8, 8);
        mGeo.scale(0.85, 1.35, 0.45);
        const mMesh = new THREE.Mesh(mGeo, mossMat);
        mMesh.position.set(
          px + (m % 2 === 0 ? -0.32 : 0.32),
          shaftTopY - 0.24 - m * 0.22,
          0.74
        );
        mossCluster.add(mMesh);
      }
      archRootGroup.add(mossCluster);
    }

    // 5. Left & Right 3D Trapezoidal Embankment Retaining Walls
    const sideWallH = 3.12 - riverTopY;
    const sideWallGeo = new THREE.BoxGeometry(1.9, sideWallH, 1.6);
    const leftWallMesh = new THREE.Mesh(sideWallGeo, pierStoneMat);
    leftWallMesh.position.set(-9.05, riverTopY + sideWallH / 2, 0.55);
    leftWallMesh.rotation.y = 0.18;
    archRootGroup.add(leftWallMesh);

    const rightWallMesh = new THREE.Mesh(sideWallGeo, pierStoneMat);
    rightWallMesh.position.set(9.05, riverTopY + sideWallH / 2, 0.55);
    rightWallMesh.rotation.y = -0.18;
    archRootGroup.add(rightWallMesh);

    // Add colored-pencil coating & sketchy structural edge outlines to all arches & piers
    this.applyPencilCoatingToGroup(archRootGroup, true, 26, 0.76);
    this.scene.add(archRootGroup);
  }

  private buildBridgeDeckAndProps() {
    const deckRootGroup = new THREE.Group();
    const bridgeMat = this.stoneMaterials[1];
    const corniceMat = this.stoneMaterials[0];
    const soffitMat = this.darkStoneMaterials[0];

    // Rear parapet wall & coping rail positioned behind the pedestrian walkway (Z = -0.25) so pedestrians never clip
    const parapetGeo = new THREE.BoxGeometry(21.5, 0.54, 0.42);
    const parapetMesh = new THREE.Mesh(parapetGeo, bridgeMat);
    parapetMesh.position.set(0, 3.34, -0.25);
    deckRootGroup.add(parapetMesh);

    const topRailGeo = new THREE.BoxGeometry(21.5, 0.10, 0.52);
    const topRailMesh = new THREE.Mesh(topRailGeo, corniceMat);
    topRailMesh.position.set(0, 3.60, -0.22);
    deckRootGroup.add(topRailMesh);

    // Bridge walkway deck slab & front cornice ledge (Y = 3.04 .. 3.28, Z = -0.35 .. +0.95)
    const corniceGeo = new THREE.BoxGeometry(21.5, 0.24, 1.35);
    const corniceMesh = new THREE.Mesh(corniceGeo, corniceMat);
    corniceMesh.position.set(0, 3.12, 0.30);
    deckRootGroup.add(corniceMesh);

    const soffitGeo = new THREE.BoxGeometry(21.5, 0.28, 1.15);
    const soffitMesh = new THREE.Mesh(soffitGeo, soffitMat);
    soffitMesh.position.set(0, 2.83, 0.28);
    deckRootGroup.add(soffitMesh);

    const corbelXList = [95, 175, 255, 335, 415, 495, 575, 655, 735, 815, 895];
    const corbelGeo = new THREE.BoxGeometry(0.34, 0.28, 0.45);
    for (const cxPx of corbelXList) {
      const cxWorld = (cxPx + 9 - 480) / 50;
      const corbelMesh = new THREE.Mesh(corbelGeo, corniceMat);
      corbelMesh.position.set(cxWorld, 2.84, 0.65);
      deckRootGroup.add(corbelMesh);
    }

    const signTex = this.createSignTexture();
    const signMat = this.applyPencilCoatingToMaterial(
      new THREE.MeshStandardMaterial({
        map: signTex,
        roughness: 0.65,
        metalness: 0.08,
      }),
      0.72
    );
    const signGeo = new THREE.BoxGeometry(1.08, 0.72, 0.12);
    this.signMesh = new THREE.Mesh(signGeo, signMat);
    this.signMesh.position.set((32 - 480) / 50, (270 - 126) / 50, 1.38);
    deckRootGroup.add(this.signMesh);

    const chainMat = this.applyPencilCoatingToMaterial(
      new THREE.MeshStandardMaterial({ color: 0x29180b, metalness: 0.6, roughness: 0.4 }),
      0.65
    );
    const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6);
    const chainL = new THREE.Mesh(chainGeo, chainMat);
    chainL.position.set((18 - 480) / 50, (270 - 102) / 50, 1.38);
    deckRootGroup.add(chainL);

    const chainR = new THREE.Mesh(chainGeo, chainMat);
    chainR.position.set((46 - 480) / 50, (270 - 102) / 50, 1.38);
    deckRootGroup.add(chainR);

    const create3DBin = (worldX: number, bodyHex: number, lidHex: number) => {
      const group = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(0.32, 0.48, 0.28);
      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      const lidGeo = new THREE.BoxGeometry(0.38, 0.10, 0.32);
      const lidMat = new THREE.MeshStandardMaterial({ color: lidHex, roughness: 0.4 });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.y = 0.295; // clean gap above body top (+0.24)
      group.add(lid);

      // Place bins directly above the bridge pier columns on top of the rear coping ledge (Y = 3.65 + 0.245)
      group.position.set(worldX, 3.895, -0.22);
      deckRootGroup.add(group);
    };

    create3DBin(-2.54, 0x0284c7, 0x0369a1);
    create3DBin(2.54, 0x16a34a, 0x14532d);

    this.applyPencilCoatingToGroup(deckRootGroup, true, 26, 0.76);
    this.scene.add(deckRootGroup);
  }

  /* ============================================================================
   * 3D CROWD / PEDESTRIANS (人群 3D 元件)
   * ============================================================================ */

  private create3DBalloonGroup(balloonColorHex: string, heightOffset: number = 1.05): THREE.Group {
    const group = new THREE.Group();

    // String
    const strGeo = new THREE.CylinderGeometry(0.008, 0.008, heightOffset, 6);
    const strMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
    const strMesh = new THREE.Mesh(strGeo, strMat);
    strMesh.position.y = heightOffset / 2;
    group.add(strMesh);

    // Glossy 3D Balloon Sphere
    const bGeo = new THREE.SphereGeometry(0.22, 20, 18);
    bGeo.scale(0.92, 1.15, 0.92);
    const bMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(balloonColorHex),
      roughness: 0.15,
      metalness: 0.1,
    });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.y = heightOffset + 0.22;
    group.add(bMesh);

    // Knot
    const kGeo = new THREE.ConeGeometry(0.04, 0.05, 8);
    const kMesh = new THREE.Mesh(kGeo, bMat);
    kMesh.position.y = heightOffset - 0.02;
    group.add(kMesh);

    return group;
  }

  private createHumanoid3D(
    p: Pedestrian,
    scaleH: number,
    coatColor: string,
    pantsColor: string,
    shoeColor: string,
    hairColor: string,
    role: 'adult' | 'teen' | 'child' | 'elder' | 'vendor'
  ): Pedestrian3DRig {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.65 });
    const coatMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(coatColor), roughness: 0.7 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pantsColor), roughness: 0.8 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(shoeColor), roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hairColor), roughness: 0.75 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.3 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

    const hipHeight = 0.44 * scaleH;
    const torsoH = 0.42 * scaleH;

    // 1. Articulated 3D Legs (Hip -> Thigh -> Knee -> Shin -> Shoe)
    const makeLeg = (zOffset: number) => {
      const hipPivot = new THREE.Group();
      hipPivot.position.set(0, hipHeight, zOffset);

      const thighLen = 0.22 * scaleH;
      const thighGeo = new THREE.CylinderGeometry(0.055 * scaleH, 0.048 * scaleH, thighLen, 10);
      const thighMesh = new THREE.Mesh(thighGeo, pantsMat);
      thighMesh.position.y = -thighLen / 2;
      hipPivot.add(thighMesh);

      const shinPivot = new THREE.Group();
      shinPivot.position.set(0, -thighLen, 0);
      hipPivot.add(shinPivot);

      const shinLen = 0.20 * scaleH;
      const shinGeo = new THREE.CylinderGeometry(0.046 * scaleH, 0.038 * scaleH, shinLen, 10);
      const shinMesh = new THREE.Mesh(shinGeo, role === 'child' ? skinMat : pantsMat);
      shinMesh.position.y = -shinLen / 2;
      shinPivot.add(shinMesh);

      // 3D Shoe
      const shoeGeo = new THREE.BoxGeometry(0.14 * scaleH, 0.055 * scaleH, 0.075 * scaleH);
      const shoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
      shoeMesh.position.set(0.025 * scaleH, -shinLen, 0);
      shinPivot.add(shoeMesh);

      bodyGroup.add(hipPivot);
      return { hipPivot, shinPivot };
    };

    const leftLeg = makeLeg(0.06 * scaleH);
    const rightLeg = makeLeg(-0.06 * scaleH);

    // 2. Sculpted 3D Torso & Outfit Details
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, hipHeight + torsoH / 2, 0);
    if (role === 'elder') {
      torsoGroup.rotation.z = -0.10; // Natural gentle forward stoop
    }
    bodyGroup.add(torsoGroup);

    const torsoGeo = new THREE.CylinderGeometry(0.11 * scaleH, 0.095 * scaleH, torsoH, 14);
    torsoGeo.scale(1.0, 1.0, 0.72);
    const torsoMesh = new THREE.Mesh(torsoGeo, coatMat);
    torsoGroup.add(torsoMesh);

    if (role === 'adult') {
      // White Dress Shirt V-Neck & Red Silk Tie
      const shirtGeo = new THREE.BoxGeometry(0.06, 0.16, 0.12);
      const shirtMesh = new THREE.Mesh(shirtGeo, whiteMat);
      shirtMesh.position.set(0.07, 0.09, 0);
      torsoGroup.add(shirtMesh);

      const tieMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
      const tieGeo = new THREE.BoxGeometry(0.03, 0.15, 0.04);
      const tieMesh = new THREE.Mesh(tieGeo, tieMat);
      tieMesh.position.set(0.105, 0.06, 0);
      torsoGroup.add(tieMesh);
    } else if (role === 'child') {
      // 3D School Backpack on Back
      const packMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });
      const packGeo = new THREE.BoxGeometry(0.11, 0.24, 0.16);
      const packMesh = new THREE.Mesh(packGeo, packMat);
      packMesh.position.set(-0.11, 0.02, 0);
      torsoGroup.add(packMesh);
    } else if (role === 'teen') {
      // 3D Draped Hoodie Hood behind neck
      const hoodGeo = new THREE.TorusGeometry(0.08, 0.038, 8, 14);
      const hoodMesh = new THREE.Mesh(hoodGeo, coatMat);
      hoodMesh.position.set(-0.04, torsoH / 2, 0);
      hoodMesh.rotation.x = Math.PI / 2;
      torsoGroup.add(hoodMesh);
    } else if (role === 'vendor') {
      // Barista/Artisan Brown Apron
      const apronMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
      const apronGeo = new THREE.BoxGeometry(0.16, torsoH * 0.88, 0.165);
      const apronMesh = new THREE.Mesh(apronGeo, apronMat);
      apronMesh.position.set(0.03, -0.02, 0);
      torsoGroup.add(apronMesh);
    }

    // 3. 3D Head, Facial Features (Eyes, Nose, Ears) & Hair/Headgear
    const headGroup = new THREE.Group();
    headGroup.position.set(role === 'elder' ? 0.04 : 0, hipHeight + torsoH + 0.13 * scaleH, 0);
    bodyGroup.add(headGroup);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.042 * scaleH, 0.048 * scaleH, 0.09 * scaleH, 10);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.y = -0.09 * scaleH;
    headGroup.add(neckMesh);

    // Cranium Sphere
    const headR = 0.125 * scaleH;
    const headGeo = new THREE.SphereGeometry(headR, 18, 16);
    headGeo.scale(1.02, 1.08, 0.92);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(headMesh);

    // 3D Sculpted Nose
    const noseGeo = new THREE.ConeGeometry(0.024 * scaleH, 0.06 * scaleH, 8);
    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.rotation.z = -Math.PI / 2;
    noseMesh.position.set(headR * 1.02, 0, 0);
    headGroup.add(noseMesh);

    // 3D Eyes (Left & Right)
    for (const sideZ of [-0.045 * scaleH, 0.045 * scaleH]) {
      const eyeWGeo = new THREE.SphereGeometry(0.022 * scaleH, 8, 8);
      const eyeW = new THREE.Mesh(eyeWGeo, whiteMat);
      eyeW.position.set(headR * 0.86, 0.02 * scaleH, sideZ);
      headGroup.add(eyeW);

      const pupilGeo = new THREE.SphereGeometry(0.012 * scaleH, 8, 8);
      const pupil = new THREE.Mesh(pupilGeo, darkMat);
      pupil.position.set(headR * 0.96, 0.02 * scaleH, sideZ);
      headGroup.add(pupil);
    }

    // Hair & Headwear
    const capGeo = new THREE.SphereGeometry(headR * 1.06, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const hairDome = new THREE.Mesh(capGeo, hairMat);
    hairDome.position.y = 0.01 * scaleH;
    hairDome.rotation.z = 0.15;
    headGroup.add(hairDome);

    if (role === 'child') {
      // Red Baseball Cap Visor
      const visorMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.5 });
      hairDome.material = visorMat;
      const brimGeo = new THREE.BoxGeometry(0.14 * scaleH, 0.02 * scaleH, 0.16 * scaleH);
      const brimMesh = new THREE.Mesh(brimGeo, visorMat);
      brimMesh.position.set(headR * 0.85, 0.04 * scaleH, 0);
      headGroup.add(brimMesh);
    } else if (role === 'vendor') {
      // Vintage Tweed Flat Cap
      const flatCapMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.8 });
      hairDome.material = flatCapMat;
      const brimGeo = new THREE.BoxGeometry(0.12 * scaleH, 0.02 * scaleH, 0.15 * scaleH);
      const brimMesh = new THREE.Mesh(brimGeo, flatCapMat);
      brimMesh.position.set(headR * 0.8, 0.05 * scaleH, 0);
      headGroup.add(brimMesh);
    } else if (role === 'teen') {
      // 3D Over-Ear Studio Headphones
      const hpBandGeo = new THREE.TorusGeometry(headR * 1.08, 0.016, 8, 16, Math.PI);
      const hpBandMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.3 });
      const hpBand = new THREE.Mesh(hpBandGeo, hpBandMat);
      hpBand.rotation.y = Math.PI / 2;
      headGroup.add(hpBand);

      const cupGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12);
      cupGeo.rotateX(Math.PI / 2);
      const cupMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4, roughness: 0.3 });
      const cupL = new THREE.Mesh(cupGeo, cupMat);
      cupL.position.set(0, 0, headR * 0.98);
      headGroup.add(cupL);
      const cupR = new THREE.Mesh(cupGeo, cupMat);
      cupR.position.set(0, 0, -headR * 0.98);
      headGroup.add(cupR);
    } else if (role === 'elder') {
      // Gold-Rimmed Spectacles
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
      for (const sideZ of [-0.045 * scaleH, 0.045 * scaleH]) {
        const rimGeo = new THREE.TorusGeometry(0.028 * scaleH, 0.005, 6, 12);
        rimGeo.rotateY(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeo, glassMat);
        rim.position.set(headR * 0.98, 0.02 * scaleH, sideZ);
        headGroup.add(rim);
      }
    }

    // 4. Articulated 3D Arms & Props
    const makeArm = (zOffset: number, isFront: boolean) => {
      const armPivot = new THREE.Group();
      armPivot.position.set(0, hipHeight + torsoH - 0.05 * scaleH, zOffset);

      const armLen = 0.32 * scaleH;
      const armGeo = new THREE.CylinderGeometry(0.040 * scaleH, 0.032 * scaleH, armLen, 10);
      const armMesh = new THREE.Mesh(armGeo, coatMat);
      armMesh.position.y = -armLen / 2;
      armPivot.add(armMesh);

      const handGeo = new THREE.SphereGeometry(0.038 * scaleH, 8, 8);
      const handMesh = new THREE.Mesh(handGeo, skinMat);
      handMesh.position.y = -armLen;
      armPivot.add(handMesh);

      // Attach 3D Props to Hands
      if (isFront) {
        if (role === 'adult') {
          // Takeaway Coffee Cup
          const cupGeo = new THREE.CylinderGeometry(0.038, 0.028, 0.11, 10);
          const cupMesh = new THREE.Mesh(cupGeo, whiteMat);
          cupMesh.position.set(0.05, -armLen + 0.04, 0);
          armPivot.add(cupMesh);
        } else if (role === 'teen') {
          // Glowing Smartphone
          const phoneGeo = new THREE.BoxGeometry(0.06, 0.09, 0.015);
          const phoneMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            emissive: 0x38bdf8,
            emissiveIntensity: 0.6,
          });
          const phoneMesh = new THREE.Mesh(phoneGeo, phoneMat);
          phoneMesh.position.set(0.06, -armLen + 0.03, 0);
          armPivot.add(phoneMesh);
        } else if (role === 'elder') {
          // 3D Wooden Walking Cane
          const caneMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
          const caneGeo = new THREE.CylinderGeometry(0.016, 0.012, 0.52, 8);
          const caneMesh = new THREE.Mesh(caneGeo, caneMat);
          caneMesh.position.set(0.06, -armLen - 0.18, 0);
          armPivot.add(caneMesh);
        }
      } else if (role === 'adult') {
        // Leather Briefcase in Back Hand
        const bagMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
        const bagGeo = new THREE.BoxGeometry(0.22, 0.16, 0.06);
        const bagMesh = new THREE.Mesh(bagGeo, bagMat);
        bagMesh.position.set(0, -armLen - 0.08, 0);
        armPivot.add(bagMesh);
      }

      bodyGroup.add(armPivot);
      return armPivot;
    };

    const leftArmPivot = makeArm(0.13 * scaleH, true);
    const rightArmPivot = makeArm(-0.13 * scaleH, false);

    let balloonGroup: THREE.Group | undefined;
    if (role === 'child' && p.balloonColor) {
      balloonGroup = this.create3DBalloonGroup(p.balloonColor, 0.85);
      balloonGroup.position.set(0.08, 0.45, 0.12);
      bodyGroup.add(balloonGroup);
    }

    return {
      root,
      type: p.type,
      bodyGroup,
      headGroup,
      leftLegPivot: leftLeg.hipPivot,
      leftShinPivot: leftLeg.shinPivot,
      rightLegPivot: rightLeg.hipPivot,
      rightShinPivot: rightLeg.shinPivot,
      leftArmPivot,
      rightArmPivot,
      balloonGroup,
    };
  }

  private createDog3D(p: Pedestrian): Pedestrian3DRig {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    const furMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 });
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 });
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.10, 0.11, 0.42, 12);
    torsoGeo.rotateZ(Math.PI / 2);
    const torsoMesh = new THREE.Mesh(torsoGeo, furMat);
    torsoMesh.position.set(0, 0.24, 0);
    bodyGroup.add(torsoMesh);

    // Cream chest ruff
    const chestGeo = new THREE.SphereGeometry(0.105, 10, 10);
    const chestMesh = new THREE.Mesh(chestGeo, creamMat);
    chestMesh.position.set(0.18, 0.23, 0);
    bodyGroup.add(chestMesh);

    // Collar
    const colGeo = new THREE.TorusGeometry(0.105, 0.02, 8, 14);
    colGeo.rotateY(Math.PI / 2);
    const colMesh = new THREE.Mesh(colGeo, collarMat);
    colMesh.position.set(0.19, 0.28, 0);
    colMesh.rotation.z = -0.4;
    bodyGroup.add(colMesh);

    // Head, Snout & Perky Ears
    const headGroup = new THREE.Group();
    headGroup.position.set(0.26, 0.38, 0);
    bodyGroup.add(headGroup);

    const skullGeo = new THREE.SphereGeometry(0.11, 14, 12);
    const skull = new THREE.Mesh(skullGeo, furMat);
    headGroup.add(skull);

    const snoutGeo = new THREE.ConeGeometry(0.065, 0.14, 10);
    snoutGeo.rotateZ(-Math.PI / 2);
    const snout = new THREE.Mesh(snoutGeo, creamMat);
    snout.position.set(0.11, -0.02, 0);
    headGroup.add(snout);

    const noseGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const nose = new THREE.Mesh(noseGeo, darkMat);
    nose.position.set(0.18, 0, 0);
    headGroup.add(nose);

    for (const sideZ of [-0.05, 0.05]) {
      const earGeo = new THREE.ConeGeometry(0.04, 0.10, 6);
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.set(-0.02, 0.12, sideZ);
      headGroup.add(ear);

      const eyeGeo = new THREE.SphereGeometry(0.018, 8, 8);
      const eye = new THREE.Mesh(eyeGeo, darkMat);
      eye.position.set(0.08, 0.03, sideZ);
      headGroup.add(eye);
    }

    // Wagging Curled Tail
    const dogTail = new THREE.Group();
    dogTail.position.set(-0.21, 0.30, 0);
    const tailGeo = new THREE.TorusGeometry(0.07, 0.028, 8, 12, Math.PI * 1.2);
    const tailMesh = new THREE.Mesh(tailGeo, furMat);
    tailMesh.position.set(-0.04, 0.05, 0);
    dogTail.add(tailMesh);
    bodyGroup.add(dogTail);

    // 4 Articulated Legs
    const makeDogLeg = (lx: number, lz: number) => {
      const pivot = new THREE.Group();
      pivot.position.set(lx, 0.20, lz);
      const legGeo = new THREE.CylinderGeometry(0.032, 0.024, 0.20, 8);
      const leg = new THREE.Mesh(legGeo, furMat);
      leg.position.y = -0.10;
      pivot.add(leg);

      const pawGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const paw = new THREE.Mesh(pawGeo, creamMat);
      paw.position.set(0.015, -0.19, 0);
      pivot.add(paw);
      bodyGroup.add(pivot);
      return pivot;
    };

    const dogFL = makeDogLeg(0.14, 0.06);
    const dogFR = makeDogLeg(0.14, -0.06);
    const dogBL = makeDogLeg(-0.14, 0.06);
    const dogBR = makeDogLeg(-0.14, -0.06);

    return {
      root,
      type: 'dog',
      bodyGroup,
      headGroup,
      dogFL,
      dogFR,
      dogBL,
      dogBR,
      dogTail,
    };
  }

  private createVendorAndCart3D(p: Pedestrian): Pedestrian3DRig {
    // 1. Start with the 3D Vendor Humanoid walking behind the cart
    const vendorRig = this.createHumanoid3D(p, 0.95, '#f8fafc', '#334155', '#451a03', '#3b2818', 'vendor');
    vendorRig.bodyGroup.position.x = -0.44;

    // 2. Build 3D Vintage Wooden Street-Food Cart in front of Vendor (x = +0.26)
    const cartGroup = new THREE.Group();
    cartGroup.position.set(0.26, 0, 0);
    vendorRig.root.add(cartGroup);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.7, roughness: 0.3 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.5, roughness: 0.5 });

    // Wooden Cart Chest
    const chestGeo = new THREE.BoxGeometry(0.68, 0.34, 0.42);
    const chestMesh = new THREE.Mesh(chestGeo, woodMat);
    chestMesh.position.y = 0.34;
    cartGroup.add(chestMesh);

    // Glass Display Case on Countertop
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.55,
      roughness: 0.15,
    });
    const caseGeo = new THREE.BoxGeometry(0.50, 0.18, 0.34);
    const caseMesh = new THREE.Mesh(caseGeo, glassMat);
    caseMesh.position.y = 0.60;
    cartGroup.add(caseMesh);

    // Brass Canopy Poles & Striped Awning Roof
    for (const px of [-0.28, 0.28]) {
      for (const pz of [-0.16, 0.16]) {
        const poleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.48, 6);
        const pole = new THREE.Mesh(poleGeo, brassMat);
        pole.position.set(px, 0.74, pz);
        cartGroup.add(pole);
      }
    }

    const awningMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.6 });
    const awningGeo = new THREE.BoxGeometry(0.74, 0.12, 0.48);
    const awningMesh = new THREE.Mesh(awningGeo, awningMat);
    awningMesh.position.y = 0.98;
    cartGroup.add(awningMesh);

    // 2 Rotating 3D Spoked Wheels
    const makeWheel = (wx: number, r: number) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wx, r, 0.23);

      const rimGeo = new THREE.TorusGeometry(r, 0.025, 8, 20);
      const rim = new THREE.Mesh(rimGeo, ironMat);
      wGroup.add(rim);

      for (let s = 0; s < 4; s++) {
        const spkGeo = new THREE.CylinderGeometry(0.012, 0.012, r * 2, 6);
        const spk = new THREE.Mesh(spkGeo, woodMat);
        spk.rotation.z = (s * Math.PI) / 4;
        wGroup.add(spk);
      }

      const hubGeo = new THREE.SphereGeometry(0.038, 8, 8);
      const hub = new THREE.Mesh(hubGeo, brassMat);
      wGroup.add(hub);

      cartGroup.add(wGroup);
      return wGroup;
    };

    const wheelBack = makeWheel(-0.18, 0.17);
    const wheelFront = makeWheel(0.18, 0.17);

    if (p.balloonColor) {
      const bGroup = this.create3DBalloonGroup(p.balloonColor, 0.65);
      bGroup.position.set(0.28, 0.98, 0);
      cartGroup.add(bGroup);
      vendorRig.balloonGroup = bGroup;
    }

    vendorRig.wheelFront = wheelFront;
    vendorRig.wheelBack = wheelBack;
    return vendorRig;
  }

  private createPedestrian3DRig(p: Pedestrian): Pedestrian3DRig {
    let rig: Pedestrian3DRig;
    switch (p.type) {
      case 'dog':
        rig = this.createDog3D(p);
        break;
      case 'cart':
        rig = this.createVendorAndCart3D(p);
        break;
      case 'child':
        rig = this.createHumanoid3D(p, 0.76, p.color, '#2563eb', '#ef4444', '#451a03', 'child');
        break;
      case 'elder':
        rig = this.createHumanoid3D(p, 0.94, '#78716c', '#44403c', '#292524', '#e7e5e4', 'elder');
        break;
      case 'teen':
        rig = this.createHumanoid3D(p, 0.96, p.color, '#334155', '#f8fafc', '#ca8a04', 'teen');
        break;
      case 'adult':
      default:
        rig = this.createHumanoid3D(p, 1.0, p.color, '#1e293b', '#451a03', '#292018', 'adult');
        break;
    }

    // Apply Colored-Pencil Coating (色鉛筆手繪塗層 + 輪廓描邊) to all 3D pedestrian characters & props
    this.applyPencilCoatingToGroup(rig.root, p.type === 'cart', 30, 0.78);
    return rig;
  }

  private syncPedestrians3D(pedestrians: Pedestrian[], timeSec: number) {
    const activeIds = new Set<string>();

    for (let i = 0; i < pedestrians.length; i++) {
      const p = pedestrians[i];
      activeIds.add(p.id);

      let rig = this.pedestrianRigs.get(p.id);
      if (!rig) {
        rig = this.createPedestrian3DRig(p);
        this.pedestrianRigs.set(p.id, rig);
        this.scene.add(rig.root);
      }

      // Dedicated non-overlapping Z lane per pedestrian in front of the rear parapet wall
      const worldZ = 0.25 + i * 0.11;
      const persp = (18 - worldZ) / 18;
      const worldX = this.camera.position.x * (1 - persp) + ((p.x - 480) / 50) * persp;
      const worldY = ((270 - p.y) / 50) * persp;

      rig.root.position.set(worldX, worldY, worldZ);
      rig.root.scale.set(p.direction * persp, persp, persp);

      // Animate 3D Articulated Limbs & Gait
      const phase = p.walkFrame * 7.5;
      const stride = Math.sin(phase) * 0.52;
      const bob = Math.abs(Math.cos(phase)) * 0.035;

      if (rig.type === 'dog') {
        rig.bodyGroup.position.y = Math.abs(Math.sin(phase * 1.5)) * 0.04;
        const trot = Math.sin(phase * 1.5) * 0.6;
        if (rig.dogFL) rig.dogFL.rotation.z = trot;
        if (rig.dogBR) rig.dogBR.rotation.z = trot;
        if (rig.dogFR) rig.dogFR.rotation.z = -trot;
        if (rig.dogBL) rig.dogBL.rotation.z = -trot;
        if (rig.dogTail) rig.dogTail.rotation.z = Math.sin(timeSec * 14) * 0.35;
      } else {
        rig.bodyGroup.position.y = bob;
        if (rig.leftLegPivot) rig.leftLegPivot.rotation.z = stride;
        if (rig.rightLegPivot) rig.rightLegPivot.rotation.z = -stride;
        if (rig.leftShinPivot) rig.leftShinPivot.rotation.z = -Math.max(0, Math.cos(phase)) * 0.45;
        if (rig.rightShinPivot) rig.rightShinPivot.rotation.z = -Math.max(0, -Math.cos(phase)) * 0.45;

        if (rig.type === 'cart') {
          // Vendor hands reach forward to push cart handles
          if (rig.leftArmPivot) rig.leftArmPivot.rotation.z = 0.75;
          if (rig.rightArmPivot) rig.rightArmPivot.rotation.z = 0.70;
          if (rig.wheelFront) rig.wheelFront.rotation.z = -p.walkFrame * 4.5;
          if (rig.wheelBack) rig.wheelBack.rotation.z = -p.walkFrame * 4.5;
        } else {
          if (rig.leftArmPivot) {
            rig.leftArmPivot.rotation.z =
              rig.type === 'child' ? 0.55 : rig.type === 'elder' ? 0.42 : -stride * 0.75;
          }
          if (rig.rightArmPivot) {
            rig.rightArmPivot.rotation.z = stride * 0.75;
          }
        }

        if (rig.balloonGroup) {
          rig.balloonGroup.rotation.z = Math.sin(timeSec * 2.5 + i) * 0.08;
        }
      }
    }

    // Clean up any removed pedestrians
    for (const [id, rig] of this.pedestrianRigs.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(rig.root);
        this.pedestrianRigs.delete(id);
      }
    }
  }

  /* ============================================================================
   * 3D FALLING TRASH, RAINDROPS & FLOATING RIVER TRASH (掉落物 3D 元件 - 無穿模設計)
   * ============================================================================ */

  private createTrash3DGroup(type: TrashType): THREE.Group {
    const group = new THREE.Group();

    switch (type) {
      // T01: 3D Cigarette Butt (菸蒂 - 分段無重疊幾何防穿模)
      case 'T01': {
        const paperGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.30, 14);
        const paperMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.7 });
        const paper = new THREE.Mesh(paperGeo, paperMat);
        paper.position.y = 0.07; // spans -0.08 .. +0.22
        group.add(paper);

        const filterGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.20, 14);
        const filterMat = new THREE.MeshStandardMaterial({ color: 0xd9822b, roughness: 0.6 });
        const filter = new THREE.Mesh(filterGeo, filterMat);
        filter.position.y = -0.185; // spans -0.285 .. -0.085 (clean gap)
        group.add(filter);

        const emberGeo = new THREE.CylinderGeometry(0.085, 0.09, 0.06, 14);
        const emberMat = new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          emissive: 0xef4444,
          emissiveIntensity: 0.65,
        });
        const ember = new THREE.Mesh(emberGeo, emberMat);
        ember.position.y = 0.255; // spans +0.225 .. +0.285
        group.add(ember);
        break;
      }

      // T02: 3D PET Bottle (寶特瓶 - 三段式獨立圓柱拼接與色鉛筆塗層，徹底消除內外同心圓柱穿模)
      case 'T02': {
        const bottleMat = new THREE.MeshStandardMaterial({
          color: 0x7dd3fc,
          roughness: 0.28,
          metalness: 0.08,
        });
        const labelMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.45,
        });

        // Lower bottle segment (-0.26 .. -0.13)
        const botGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.13, 16);
        const bot = new THREE.Mesh(botGeo, bottleMat);
        bot.position.y = -0.195;
        group.add(bot);

        // Middle label segment (-0.125 .. +0.015)
        const labelGeo = new THREE.CylinderGeometry(0.158, 0.158, 0.14, 16);
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.y = -0.055;
        group.add(label);

        // Upper bottle body segment (+0.02 .. +0.10)
        const topBodyGeo = new THREE.CylinderGeometry(0.155, 0.155, 0.08, 16);
        const topBody = new THREE.Mesh(topBodyGeo, bottleMat);
        topBody.position.y = 0.06;
        group.add(topBody);

        // Tapered neck (+0.105 .. +0.265)
        const neckGeo = new THREE.CylinderGeometry(0.062, 0.155, 0.16, 16);
        const neck = new THREE.Mesh(neckGeo, bottleMat);
        neck.position.y = 0.185;
        group.add(neck);

        // Cap (+0.27 .. +0.35)
        const capGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.08, 12);
        const capMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.35 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.31;
        group.add(cap);
        break;
      }

      // T03: 3D Beverage Can (飲料罐 - 三段式無重疊圓柱與金屬邊環防穿模)
      case 'T03': {
        const canMat = new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          metalness: 0.45,
          roughness: 0.35,
        });
        const stripeMat = new THREE.MeshStandardMaterial({
          color: 0xfef3c7,
          roughness: 0.45,
        });

        // Lower red can segment (-0.20 .. -0.075)
        const canBotGeo = new THREE.CylinderGeometry(0.165, 0.165, 0.125, 18);
        const canBot = new THREE.Mesh(canBotGeo, canMat);
        canBot.position.y = -0.1375;
        group.add(canBot);

        // Middle cream stripe segment (-0.07 .. +0.07)
        const stripeGeo = new THREE.CylinderGeometry(0.167, 0.167, 0.14, 18);
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 0;
        group.add(stripe);

        // Upper red can segment (+0.075 .. +0.20)
        const canTopGeo = new THREE.CylinderGeometry(0.165, 0.165, 0.125, 18);
        const canTop = new THREE.Mesh(canTopGeo, canMat);
        canTop.position.y = 0.1375;
        group.add(canTop);

        const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.75, roughness: 0.25 });
        const rimTopGeo = new THREE.CylinderGeometry(0.15, 0.165, 0.04, 18);
        const rimTop = new THREE.Mesh(rimTopGeo, rimMat);
        rimTop.position.y = 0.225; // spans +0.205 .. +0.245
        group.add(rimTop);

        const rimBotGeo = new THREE.CylinderGeometry(0.165, 0.15, 0.04, 18);
        const rimBot = new THREE.Mesh(rimBotGeo, rimMat);
        rimBot.position.y = -0.225; // spans -0.245 .. -0.205
        group.add(rimBot);
        break;
      }

      // T04: 3D Foil Juice Carton with Straw (鋁箔飲料盒 - 外部浮雕與吸管零穿模)
      case 'T04': {
        const boxGeo = new THREE.BoxGeometry(0.32, 0.44, 0.22);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.48 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.y = -0.04; // spans Y: -0.26 .. +0.18, Z: -0.11 .. +0.11
        group.add(box);

        // Fruit emblem disc placed cleanly outside front & back faces (Z = ±0.118)
        const fruitGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.016, 14);
        fruitGeo.rotateX(Math.PI / 2);
        const fruitMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 });
        const fruitFront = new THREE.Mesh(fruitGeo, fruitMat);
        fruitFront.position.set(0, -0.04, 0.12);
        group.add(fruitFront);

        const fruitBack = new THREE.Mesh(fruitGeo, fruitMat);
        fruitBack.position.set(0, -0.04, -0.12);
        group.add(fruitBack);

        // 3D Bent Drinking Straw starting cleanly above box top (Y = +0.18)
        const strawMat = new THREE.MeshStandardMaterial({ color: 0xfef2f2, roughness: 0.35 });
        const straw1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.15, 8), strawMat);
        straw1.position.set(-0.05, 0.255, 0);
        group.add(straw1);

        const straw2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.11, 8), strawMat);
        straw2.position.set(0.0, 0.34, 0);
        straw2.rotation.z = -1.1;
        group.add(straw2);
        break;
      }

      // T05: 3D Plump Tied Trash Sack / Snack Bag (塑膠袋/垃圾袋)
      case 'T05': {
        const sackMat = new THREE.MeshStandardMaterial({
          color: 0xc27832,
          roughness: 0.58,
          metalness: 0.05,
        });
        const sackGeo = new THREE.SphereGeometry(0.21, 16, 14);
        sackGeo.scale(1.05, 0.88, 0.95);
        const sack = new THREE.Mesh(sackGeo, sackMat);
        sack.position.y = -0.09; // top at +0.095
        group.add(sack);

        // Tied cord knot ring
        const tieGeo = new THREE.TorusGeometry(0.078, 0.024, 8, 14);
        tieGeo.rotateX(Math.PI / 2);
        const tieMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
        const tie = new THREE.Mesh(tieGeo, tieMat);
        tie.position.y = 0.115;
        group.add(tie);

        // Flared ruffled top ears
        const earGeo = new THREE.ConeGeometry(0.13, 0.15, 7);
        earGeo.rotateX(Math.PI);
        const ear = new THREE.Mesh(earGeo, sackMat);
        ear.position.y = 0.21;
        group.add(ear);
        break;
      }

      // T06: 3D Coiled Poop (排泄物)
      case 'T06':
      default: {
        const poopMat = new THREE.MeshStandardMaterial({
          color: 0x783f12,
          roughness: 0.42,
          metalness: 0.06,
        });
        const coil1 = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.068, 10, 18), poopMat);
        coil1.rotation.x = Math.PI / 2;
        coil1.position.y = -0.14;
        group.add(coil1);

        const coil2 = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.058, 10, 18), poopMat);
        coil2.rotation.x = Math.PI / 2;
        coil2.position.y = -0.02;
        group.add(coil2);

        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.16, 12), poopMat);
        tip.position.y = 0.12;
        group.add(tip);
        break;
      }
    }

    // Apply colored-pencil coating to 3D trash items for unified visual style
    this.applyPencilCoatingToGroup(group, false, 30, 0.75);
    return group;
  }

  private createRaindrop3DGroup(): THREE.Group {
    const group = new THREE.Group();

    const dropMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.42,
      roughness: 0.12,
      metalness: 0.12,
    });

    // Bottom droplet hemisphere bulb
    const bulbGeo = new THREE.SphereGeometry(0.155, 18, 16, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.52);
    const bulb = new THREE.Mesh(bulbGeo, dropMat);
    bulb.position.y = -0.05;
    group.add(bulb);

    // Tapered droplet top cone (joins seamlessly at bulb equator without internal overlapping faces)
    const coneGeo = new THREE.ConeGeometry(0.155, 0.28, 18, 1, true);
    const cone = new THREE.Mesh(coneGeo, dropMat);
    cone.position.y = 0.09;
    group.add(cone);

    this.applyPencilCoatingToGroup(group, false, 30, 0.65);
    return group;
  }

  private syncFallingTrash3D(trashList: TrashObject[], timeSec: number) {
    const activeIds = new Set<string>();

    for (let i = 0; i < trashList.length; i++) {
      const t = trashList[i];
      if (t.isCaught || t.isSplashed) continue;
      activeIds.add(t.id);

      let meshGroup = this.trashMeshes.get(t.id);
      if (!meshGroup) {
        meshGroup = this.createTrash3DGroup(t.type);
        this.trashMeshes.set(t.id, meshGroup);
        this.trashForegroundScene.add(meshGroup);
      }

      // Rendered in trashForegroundScene (layer strictly above bridge piers & water after clearDepth)
      const zFg = 0.20 + (i % 7) * 0.08;
      const persp = (18 - zFg) / 18;
      const wx = this.camera.position.x * (1 - persp) + ((t.x - 480) / 50) * persp;
      const wy = ((270 - t.y) / 50) * persp;

      meshGroup.position.set(wx, wy, zFg);
      meshGroup.scale.setScalar(persp);

      // Dynamic 3-axis 3D tumbling while falling
      meshGroup.rotation.z = -t.rotation;
      meshGroup.rotation.x = timeSec * 2.4 + i * 1.1;
      meshGroup.rotation.y = timeSec * 1.9 + i * 0.7;
    }

    for (const [id, meshGroup] of this.trashMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.trashForegroundScene.remove(meshGroup);
        this.trashMeshes.delete(id);
      }
    }
  }

  private syncRaindrops3D(raindropList: RaindropObject[], timeSec: number) {
    const activeIds = new Set<string>();

    for (let i = 0; i < raindropList.length; i++) {
      const r = raindropList[i];
      if (r.isCaught) continue;
      activeIds.add(r.id);

      let meshGroup = this.raindropMeshes.get(r.id);
      if (!meshGroup) {
        meshGroup = this.createRaindrop3DGroup();
        this.raindropMeshes.set(r.id, meshGroup);
        this.trashForegroundScene.add(meshGroup);
      }

      const zFg = 0.85 + (i % 5) * 0.08;
      const persp = (18 - zFg) / 18;
      const wx = this.camera.position.x * (1 - persp) + ((r.x - 480) / 50) * persp;
      const wy = ((270 - r.y) / 50) * persp;

      meshGroup.position.set(wx, wy, zFg);
      meshGroup.rotation.y = timeSec * 3.5 + i;
      const pulse = 1 + Math.sin(timeSec * 8 + i) * 0.08;
      meshGroup.scale.setScalar(pulse * persp);
    }

    for (const [id, meshGroup] of this.raindropMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.trashForegroundScene.remove(meshGroup);
        this.raindropMeshes.delete(id);
      }
    }
  }

  private syncVisibleRiverTrash3D(visibleRiverTrash: VisibleRiverTrash[], timeSec: number) {
    const activeIds = new Set<string>();

    for (let i = 0; i < visibleRiverTrash.length; i++) {
      const vt = visibleRiverTrash[i];
      activeIds.add(vt.id);

      let meshGroup = this.riverTrashMeshes.get(vt.id);
      if (!meshGroup) {
        meshGroup = this.createTrash3DGroup(vt.type);
        this.riverTrashMeshes.set(vt.id, meshGroup);
        this.trashForegroundScene.add(meshGroup);
      }

      // Rendered in trashForegroundScene (layer strictly above river water & bridge piers)
      const bob = Math.sin(timeSec * vt.bobSpeed + vt.bobOffset) * 3.5;
      const zFloat = -0.35 + (i % 7) * 0.06;
      const persp = (18 - zFloat) / 18;
      const wx = this.camera.position.x * (1 - persp) + ((vt.x - 480) / 50) * persp;
      const wy = ((270 - (vt.y + bob)) / 50) * persp;

      meshGroup.position.set(wx, wy, zFloat);
      meshGroup.scale.setScalar(0.84 * persp);

      // Bobbing and pitching with the 3D river waves
      meshGroup.rotation.z = -vt.rotation + Math.sin(timeSec * 2.5 + vt.bobOffset) * 0.22;
      meshGroup.rotation.x = 0.65 + Math.cos(timeSec * 2.0 + vt.bobOffset) * 0.18;
      meshGroup.rotation.y = vt.bobOffset;
    }

    for (const [id, meshGroup] of this.riverTrashMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.trashForegroundScene.remove(meshGroup);
        this.riverTrashMeshes.delete(id);
      }
    }
  }

  private buildRiverWater() {
    const waterGeo = new THREE.PlaneGeometry(24.0, 11.2, 128, 48);
    waterGeo.rotateX(-Math.PI * 0.435);

    this.waterMat = new THREE.ShaderMaterial({
      transparent: false,
      uniforms: {
        uTime: { value: 0 },
        uWaterQuality: { value: 0.0 },
        uParallax: { value: 0.0 },
        uDeepColor: { value: new THREE.Color(0x035382) },
        uShallowColor: { value: new THREE.Color(0x22d3ee) },
        uFoamColor: { value: new THREE.Color(0xfefce8) },
        uSunColor: { value: new THREE.Color(0xfef08a) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uParallax;
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormalVec;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Pure horizontal & depth river waves without diagonal cross-stripes
          float w1 = sin(pos.x * 1.10 + uTime * 2.1) * 0.10;
          float w2 = cos(pos.y * 1.95 - uTime * 1.6) * 0.075;
          float w3 = sin(pos.x * 2.6 - uTime * 2.8) * 0.035;
          float w4 = cos(pos.y * 3.8 + uTime * 3.2) * 0.020;

          float fgFactor = mix(0.25, 1.30, 1.0 - uv.y);
          float elev = (w1 + w2 + w3 + w4) * fgFactor;

          pos.y += elev;
          vElevation = elev;

          vec3 n = normalize(vec3(
            -cos(pos.x * 1.10 + uTime * 2.1) * 0.22,
            1.0,
            -sin(pos.y * 1.95 - uTime * 1.6) * 0.18
          ));
          vNormalVec = n;

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
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
        varying vec3 vWorldPos;

        void main() {
          float depthT = smoothstep(0.0, 1.0, 1.0 - vUv.y);
          vec3 waterCol = mix(uDeepColor, uShallowColor, depthT * 0.78 + vElevation * 2.2);

          float pierDist1 = abs(vWorldPos.x - (-7.60));
          float pierDist2 = abs(vWorldPos.x - (-2.54));
          float pierDist3 = abs(vWorldPos.x - 2.54);
          float pierDist4 = abs(vWorldPos.x - 7.60);
          float minPierDist = min(min(pierDist1, pierDist2), min(pierDist3, pierDist4));
          float rippleShift = sin(vUv.y * 45.0 + uTime * 4.0) * 0.08;
          if (minPierDist + rippleShift < 0.55 && vUv.y > 0.35) {
            waterCol = mix(waterCol, vec3(0.85, 0.74, 0.58), 0.18 * vUv.y);
          }

          vec3 lightDir = normalize(vec3(-0.4, 0.85, 0.45));
          float diff = max(dot(vNormalVec, lightDir), 0.0);
          waterCol += diff * 0.16 * uSunColor;

          float spec = pow(max(dot(vNormalVec, lightDir), 0.0), 32.0);
          waterCol += spec * 0.52 * uSunColor;

          float foamThresh = mix(0.06, 0.12, depthT);
          float isFoam = smoothstep(foamThresh, foamThresh + 0.04, vElevation);
          float shoreLine = exp(-pow((vUv.y - 0.62) * 28.0 + sin(vWorldPos.x * 2.5 + uTime * 3.0) * 0.6, 2.0));
          waterCol = mix(waterCol, uFoamColor, clamp(isFoam * 0.85 + shoreLine * 0.65, 0.0, 0.92));

          float tunnelShadow = smoothstep(0.62, 0.85, vUv.y);
          waterCol = mix(waterCol, uDeepColor * 0.32, tunnelShadow);

          if (uWaterQuality > 1.5) {
            float oil = sin(vWorldPos.x * 1.8 + uTime * 2.5) * cos(vUv.y * 10.0) * 0.14;
            waterCol += vec3(oil * 0.35, -oil * 0.1, oil * 0.45);
          }

          gl_FragColor = vec4(waterCol, 1.0);
        }
      `,
    });

    const waterMesh = new THREE.Mesh(waterGeo, this.waterMat);
    waterMesh.position.set(0, -3.55, 1.2);
    this.scene.add(waterMesh);
  }

  private buildVolumetricGodRays() {
    // Keep shader reference for waterQuality uniform updates without adding diagonal ray planes over water
    this.godRayMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1.0 },
      },
      vertexShader: `void main() { gl_Position = vec4(0.0); }`,
      fragmentShader: `void main() { gl_FragColor = vec4(0.0); }`,
    });
  }

  private applyWaterQualityPalette(waterQuality: WaterQuality) {
    if (this.lastWaterQuality === waterQuality) return;
    this.lastWaterQuality = waterQuality;

    if (waterQuality === 'BLUE') {
      this.skyMat.uniforms.uTopColor.value.setHex(0x3b82f6);
      this.skyMat.uniforms.uBottomColor.value.setHex(0xdbeafe);
      this.waterMat.uniforms.uWaterQuality.value = 0.0;
      this.waterMat.uniforms.uDeepColor.value.setHex(0x025e8d);
      this.waterMat.uniforms.uShallowColor.value.setHex(0x22d3ee);
      this.waterMat.uniforms.uFoamColor.value.setHex(0xffffff);
      this.waterMat.uniforms.uSunColor.value.setHex(0xfef08a);
      this.godRayMat.uniforms.uIntensity.value = 1.0;

      this.sunLight.color.setHex(0xfff7e6);
      this.sunLight.intensity = 1.55;
      this.hemiLight.intensity = 1.15;
      this.fgSunLight.color.setHex(0xfff7e6);
      this.fgSunLight.intensity = 1.55;
      this.fgHemiLight.intensity = 1.15;

      this.foliageMaterials[0]?.color.setHex(0x4ade80);
      this.foliageMaterials[1]?.color.setHex(0x22c55e);
      this.foliageMaterials[2]?.color.setHex(0x15803d);

      this.stoneMaterials[0]?.color.setHex(0xfbf2e3);
      this.stoneMaterials[1]?.color.setHex(0xf2dfc8);
      this.mossMaterials[0]?.color.setHex(0x658a3b);
    } else if (waterQuality === 'GREY') {
      this.skyMat.uniforms.uTopColor.value.setHex(0x64748b);
      this.skyMat.uniforms.uBottomColor.value.setHex(0xcbd5e1);
      this.waterMat.uniforms.uWaterQuality.value = 1.0;
      this.waterMat.uniforms.uDeepColor.value.setHex(0x334155);
      this.waterMat.uniforms.uShallowColor.value.setHex(0x64748b);
      this.waterMat.uniforms.uFoamColor.value.setHex(0xe2e8f0);
      this.waterMat.uniforms.uSunColor.value.setHex(0xd4d4d8);
      this.godRayMat.uniforms.uIntensity.value = 0.45;

      this.sunLight.color.setHex(0xe2e8f0);
      this.sunLight.intensity = 1.1;
      this.hemiLight.intensity = 0.9;
      this.fgSunLight.color.setHex(0xe2e8f0);
      this.fgSunLight.intensity = 1.1;
      this.fgHemiLight.intensity = 0.9;

      this.foliageMaterials[0]?.color.setHex(0x84a98c);
      this.foliageMaterials[1]?.color.setHex(0x6b9080);
      this.foliageMaterials[2]?.color.setHex(0x52796f);

      this.stoneMaterials[0]?.color.setHex(0xe5e3df);
      this.stoneMaterials[1]?.color.setHex(0xd6d3d1);
      this.mossMaterials[0]?.color.setHex(0x6b7280);
    } else {
      this.skyMat.uniforms.uTopColor.value.setHex(0x1c1917);
      this.skyMat.uniforms.uBottomColor.value.setHex(0x44403c);
      this.waterMat.uniforms.uWaterQuality.value = 2.0;
      this.waterMat.uniforms.uDeepColor.value.setHex(0x090d16);
      this.waterMat.uniforms.uShallowColor.value.setHex(0x27272a);
      this.waterMat.uniforms.uFoamColor.value.setHex(0x71717a);
      this.waterMat.uniforms.uSunColor.value.setHex(0x581c87);
      this.godRayMat.uniforms.uIntensity.value = 0.0;

      this.sunLight.color.setHex(0x78716c);
      this.sunLight.intensity = 0.65;
      this.hemiLight.intensity = 0.55;
      this.fgSunLight.color.setHex(0x78716c);
      this.fgSunLight.intensity = 0.65;
      this.fgHemiLight.intensity = 0.55;

      this.foliageMaterials[0]?.color.setHex(0x3f3f46);
      this.foliageMaterials[1]?.color.setHex(0x27272a);
      this.foliageMaterials[2]?.color.setHex(0x18181b);

      this.stoneMaterials[0]?.color.setHex(0x44403c);
      this.stoneMaterials[1]?.color.setHex(0x292524);
      this.mossMaterials[0]?.color.setHex(0x27272a);
    }
  }

  /**
   * Update 3D Scene animation, water waves, clouds, camera parallax,
   * and 3D entities (pedestrians crowd, falling trash, falling raindrops, floating river trash)
   */
  public update(
    timeSec: number,
    waterQuality: WaterQuality,
    playerX: number = 480,
    entities?: {
      pedestrians: Pedestrian[];
      trashList: TrashObject[];
      raindropList: RaindropObject[];
      visibleRiverTrash: VisibleRiverTrash[];
    }
  ) {
    if (!this.isAvailable) return;

    this.applyWaterQualityPalette(waterQuality);

    this.waterMat.uniforms.uTime.value = timeSec;
    this.godRayMat.uniforms.uTime.value = timeSec;

    // 3D Camera Parallax driven by player horizontal position
    const pNorm = (playerX - 480) / 480;
    this.waterMat.uniforms.uParallax.value = pNorm;
    this.camera.position.x = pNorm * 0.42;
    this.camera.lookAt(pNorm * 0.14, 0, 0);

    // Gentle breeze sway on hanging wooden sign
    if (this.signMesh) {
      this.signMesh.rotation.z = Math.sin(timeSec * 2.2) * 0.035;
      this.signMesh.rotation.y = Math.cos(timeSec * 1.5) * 0.05;
    }

    // Drift 3D Clouds across sky
    for (let i = 0; i < this.cloudGroups.length; i++) {
      const cg = this.cloudGroups[i];
      cg.position.x -= 0.004 * (1 + i * 0.2);
      if (cg.position.x < -13.5) {
        cg.position.x = 13.5;
      }
    }

    // Synchronize 3D Pedestrians & 3D Falling/Floating Items
    if (entities) {
      this.syncPedestrians3D(entities.pedestrians, timeSec);
      this.syncFallingTrash3D(entities.trashList, timeSec);
      this.syncRaindrops3D(entities.raindropList, timeSec);
      this.syncVisibleRiverTrash3D(entities.visibleRiverTrash, timeSec);
    } else {
      // Autonomous 3D crowd patrol on Start Screen
      for (const p of this.defaultPedestrians) {
        p.x += p.direction * p.speed * 0.016;
        p.walkFrame += 0.016;
        if (p.x > 870) {
          p.x = 870;
          p.direction = -1;
        } else if (p.x < 90) {
          p.x = 90;
          p.direction = 1;
        }
      }
      this.syncPedestrians3D(this.defaultPedestrians, timeSec);
    }
  }

  /**
   * Render the 3D scene to internal WebGL canvas:
   * Pass 1: Background 3D world, bridge deck, pedestrians, bridge pier pillars & river water
   * Pass 2: Clear depth buffer and render 3D trash/raindrop layer strictly on top of bridge piers to prevent clipping
   */
  public render() {
    if (!this.isAvailable || !this.renderer) return;
    this.renderer.autoClear = true;
    this.renderer.render(this.scene, this.camera);
    this.renderer.autoClear = false;
    this.renderer.clearDepth();
    this.renderer.render(this.trashForegroundScene, this.camera);
    this.renderer.autoClear = true;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public dispose() {
    if (!this.isAvailable) return;
    this.renderer?.dispose();
  }
}
