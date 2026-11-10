import * as THREE from 'three';
import { WaterQuality } from '../types/game';

/**
 * ThreeSceneBackground
 * Full-screen (960x540) real-time 3D Game World Background powered by Three.js.
 * Renders:
 *  - 3D Atmospheric Sky Dome & Drifting 3D Volumetric Cloud Clusters
 *  - 3D Lush Horizon Foliage / Tree Clusters with directional lighting
 *  - 3D Extruded Stone Bridge Deck, Parapet, Coping Cornice, 11 Corbel Brackets, Bins & "傷心湯" Sign
 *  - 3D Monumental Vertical Arch Supports (4 Ashlar Stone Piers, Impost Capitals, 3D Cutwater Prows,
 *    3 Semicircular Arches with 3D Radial Voussoir Wedges, Protruding Keystones & Deep Barrel-Vault Tunnels)
 *  - 3D Trapezoidal Side Embankment Retaining Walls & Hanging 3D Moss Clusters
 *  - 3D Volumetric Sunbeam Shafts (God Rays)
 *  - 3D Dynamic Gerstner-Wave River Water Surface extending from deep arch tunnels to foreground
 */
export class ThreeSceneBackground {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  public isAvailable: boolean = false;

  // Dynamic Scene Elements & Materials for WaterQuality & Animation updates
  private skyMat!: THREE.ShaderMaterial;
  private waterMat!: THREE.ShaderMaterial;
  private godRayMat!: THREE.ShaderMaterial;
  private cloudGroups: THREE.Group[] = [];
  private foliageMaterials: THREE.MeshStandardMaterial[] = [];
  private stoneMaterials: THREE.MeshStandardMaterial[] = [];
  private darkStoneMaterials: THREE.MeshStandardMaterial[] = [];
  private mossMaterials: THREE.MeshStandardMaterial[] = [];
  private sunLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private signMesh!: THREE.Mesh;

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
   * Generate procedural hand-crafted stone / colored-pencil texture for 3D meshes
   */
  private createStoneTexture(baseHex: string, lineHex: string, grainHex: string): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;

    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 256, 256);

    // Subtle colored-pencil diagonal cross-hatching + stone grain
    ctx.strokeStyle = grainHex;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.28;
    for (let i = -256; i < 512; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 256, 256);
      ctx.stroke();
    }

    // Ashlar masonry mortar lines
    ctx.strokeStyle = lineHex;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.55;
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

    // Wood grain background
    const grad = ctx.createLinearGradient(0, 0, 0, 160);
    grad.addColorStop(0, '#9c622d');
    grad.addColorStop(0.5, '#7c4a1e');
    grad.addColorStop(1, '#5c3412');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 160);

    // Wood plank lines
    ctx.strokeStyle = 'rgba(40, 20, 5, 0.45)';
    ctx.lineWidth = 2;
    for (let y = 32; y < 160; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Outer frame border
    ctx.strokeStyle = '#3b200c';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 246, 150);

    ctx.strokeStyle = '#e6c295';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, 228, 132);

    // Calligraphic text "傷心湯"
    ctx.fillStyle = '#fffbeb';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.font = 'bold 64px "Noto Sans TC", "DotGothic16", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('傷心湯', 128, 84);

    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  private buildLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x6b533b, 1.15);
    this.hemiLight.position.set(0, 12, 6);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff7e6, 1.55);
    this.sunLight.position.set(-8, 11, 12);
    this.scene.add(this.sunLight);

    // Subtle warm fill light from the right water reflection
    const bounceLight = new THREE.DirectionalLight(0x7dd3fc, 0.45);
    bounceLight.position.set(6, -6, 8);
    this.scene.add(bounceLight);
  }

  private buildSkyAndClouds() {
    // 1. 3D Sky Backdrop Plane at Z = -8
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
          // Focus gradient in upper sky region
          float t = smoothstep(0.45, 0.98, vUv.y);
          vec3 col = mix(uBottomColor, uTopColor, t);
          // Subtle diagonal colored-pencil sky texture
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

    // 2. 3D Volumetric Fluffy Clouds at Z = -5.5
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
    // 3D Lush Tree & Bush Mounds along the Horizon behind the bridge (Y ≈ 3.6 .. 4.5, Z = -2.2)
    const foliageMatLight = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.78,
      metalness: 0.05,
    });
    const foliageMatMid = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.82,
      metalness: 0.05,
    });
    const foliageMatDark = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.85,
      metalness: 0.05,
    });
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
      this.scene.add(mesh);
    }
  }

  private buildMonumentalArchesAndPiers() {
    const stoneTex = this.createStoneTexture('#faeedd', '#4a2c14', '#c49f75');
    stoneTex.repeat.set(2, 2);

    const pierTex = this.createStoneTexture('#f5e5cf', '#3b210d', '#b88c5a');
    pierTex.repeat.set(1, 3);

    const mainStoneMat = new THREE.MeshStandardMaterial({
      color: 0xfbf2e3,
      map: stoneTex,
      roughness: 0.75,
      metalness: 0.05,
    });

    const pierStoneMat = new THREE.MeshStandardMaterial({
      color: 0xf5e5cf,
      map: pierTex,
      roughness: 0.72,
      metalness: 0.06,
    });

    const darkArchVaultMat = new THREE.MeshStandardMaterial({
      color: 0x3b2614,
      roughness: 0.9,
      metalness: 0.02,
    });

    const mossMat = new THREE.MeshStandardMaterial({
      color: 0x658a3b,
      roughness: 0.88,
      metalness: 0.02,
    });

    this.stoneMaterials.push(mainStoneMat, pierStoneMat);
    this.darkStoneMaterials.push(darkArchVaultMat);
    this.mossMaterials.push(mossMat);

    // World coordinates calibrated to screen pixels:
    // wallTop (135px) -> Y = +2.70
    // ySpring (248px) -> Y = +0.44
    // riverTop (430px) -> Y = -3.20
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
    // Arch 0 (left): cx = 226.5px -> X = -5.07, R = 101.5px -> 2.03
    // Arch 1 (center): cx = 480.0px -> X = 0.00, R = 102.0px -> 2.04
    // Arch 2 (right): cx = 733.5px -> X = +5.07, R = 101.5px -> 2.03
    const arches = [
      { cx: -5.07, r: 2.03 },
      { cx: 0.0, r: 2.04 },
      { cx: 5.07, r: 2.03 },
    ];

    for (const arch of arches) {
      // A. 3D Barrel Vault Ceiling Cylinder extending from Z = 0 to Z = -4.2
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
      // Orient cylinder along Z axis with arch curving into +Y
      vaultGeo.rotateZ(-Math.PI / 2);
      vaultGeo.rotateX(Math.PI / 2);
      const vaultMesh = new THREE.Mesh(vaultGeo, darkArchVaultMat);
      vaultMesh.position.set(arch.cx, ySpring, -vaultDepth / 2);
      this.scene.add(vaultMesh);

      // B. 3D Recessed Vault Ribs inside the tunnel (Z = -0.9, -1.9, -2.9)
      for (const ribZ of [-0.85, -1.75, -2.65, -3.55]) {
        const ribGeo = new THREE.TorusGeometry(arch.r - 0.04, 0.07, 10, 28, Math.PI);
        const ribMesh = new THREE.Mesh(ribGeo, darkArchVaultMat);
        ribMesh.position.set(arch.cx, ySpring, ribZ);
        this.scene.add(ribMesh);
      }

      // C. 3D Inner Tunnel Side Jamb Walls (extending Z = 0 .. -4.2, Y = riverTopY .. ySpring)
      const jambH = ySpring - riverTopY;
      const jambGeo = new THREE.BoxGeometry(0.18, jambH, vaultDepth);
      const leftJamb = new THREE.Mesh(jambGeo, darkArchVaultMat);
      leftJamb.position.set(arch.cx - arch.r + 0.05, riverTopY + jambH / 2, -vaultDepth / 2);
      this.scene.add(leftJamb);

      const rightJamb = new THREE.Mesh(jambGeo, darkArchVaultMat);
      rightJamb.position.set(arch.cx + arch.r - 0.05, riverTopY + jambH / 2, -vaultDepth / 2);
      this.scene.add(rightJamb);

      // D. 15 Radiating 3D Wedge Voussoirs around the Arch Ring
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
        this.scene.add(vMesh);
      }
    }

    // 3. 3D Spandrel Walls between Arches (y: ySpring .. wallTopY)
    // Built as solid 3D masonry triangles/blocks filling above the arches
    const spandrelPositions = [-7.6, -2.54, 2.54, 7.6];
    for (const sx of spandrelPositions) {
      const spGeo = new THREE.BoxGeometry(1.65, wallTopY - ySpring, 0.38);
      const spMesh = new THREE.Mesh(spGeo, mainStoneMat);
      spMesh.position.set(sx, (wallTopY + ySpring) / 2, -0.05);
      this.scene.add(spMesh);

      // Crown lintel band along top of arches
      const lintelGeo = new THREE.BoxGeometry(5.2, 0.32, 0.42);
      const lintelMesh = new THREE.Mesh(lintelGeo, mainStoneMat);
      lintelMesh.position.set(sx * 0.66, wallTopY - 0.14, -0.02);
      this.scene.add(lintelMesh);
    }

    // 4. Four Monumental Vertical 3D Stone Piers
    // Piers at X = -7.60, -2.54, +2.54, +7.60 (Width = 1.00 world unit = 50px)
    const pierCenters = [-7.60, -2.54, 2.54, 7.60];
    const pierW = 1.02;
    const shaftTopY = ySpring - 0.12;
    const shaftBotY = riverTopY + 0.28;
    const shaftH = shaftTopY - shaftBotY;

    for (let pIdx = 0; pIdx < pierCenters.length; pIdx++) {
      const px = pierCenters[pIdx];

      // A. Main Vertical 3D Pier Column (stacked 3D ashlar courses with bevels)
      const numCourses = 7;
      const courseH = shaftH / numCourses;
      for (let c = 0; c < numCourses; c++) {
        const cy = shaftBotY + (c + 0.5) * courseH;
        const cW = pierW - (c % 2 === 0 ? 0 : 0.03);
        const cGeo = new THREE.BoxGeometry(cW, courseH - 0.025, 0.95);
        const cMesh = new THREE.Mesh(cGeo, pierStoneMat);
        cMesh.position.set(px, cy, 0.22);
        this.scene.add(cMesh);
      }

      // B. Protruding 3D Impost Capital Molding at Arch Spring Line (Y = ySpring)
      const capGeo = new THREE.BoxGeometry(pierW + 0.22, 0.22, 1.18);
      const capMesh = new THREE.Mesh(capGeo, mainStoneMat);
      capMesh.position.set(px, ySpring - 0.02, 0.28);
      this.scene.add(capMesh);

      // Upper Capital Necking Ledge
      const neckGeo = new THREE.BoxGeometry(pierW + 0.12, 0.10, 1.06);
      const neckMesh = new THREE.Mesh(neckGeo, darkArchVaultMat);
      neckMesh.position.set(px, ySpring - 0.16, 0.24);
      this.scene.add(neckMesh);

      // C. 3D Triangular Cutwater Prow (分水墩) at River Waterline
      const cutH = 0.65;
      const cutGeo = new THREE.CylinderGeometry(pierW * 0.56, pierW * 0.68, cutH, 4);
      // Rotate so sharp 45-degree prow points straight toward camera (+Z)
      const cutMesh = new THREE.Mesh(cutGeo, mainStoneMat);
      cutMesh.position.set(px, riverTopY + 0.16, 0.45);
      this.scene.add(cutMesh);

      // Cutwater stone cap pyramid
      const capPyrGeo = new THREE.ConeGeometry(pierW * 0.56, 0.28, 4);
      const capPyrMesh = new THREE.Mesh(capPyrGeo, pierStoneMat);
      capPyrMesh.position.set(px, riverTopY + 0.16 + cutH / 2 + 0.14, 0.45);
      this.scene.add(capPyrMesh);

      // D. 3D Hanging Moss Clusters on Spandrels & Pier Tops
      const mossCluster = new THREE.Group();
      for (let m = 0; m < 4; m++) {
        const mGeo = new THREE.SphereGeometry(0.14 - m * 0.02, 8, 8);
        mGeo.scale(0.85, 1.6, 0.6);
        const mMesh = new THREE.Mesh(mGeo, mossMat);
        mMesh.position.set(
          px + (m % 2 === 0 ? -0.36 : 0.36),
          wallTopY - 0.22 - m * 0.16,
          0.32
        );
        mossCluster.add(mMesh);
      }
      this.scene.add(mossCluster);
    }

    // 5. Left & Right 3D Trapezoidal Embankment Retaining Walls (x: 0..75 and x: 885..960)
    // Left Wall: X = -9.8 .. -8.1, Y = -3.20 .. +3.12
    const sideWallH = 3.12 - riverTopY;
    const sideWallGeo = new THREE.BoxGeometry(1.9, sideWallH, 1.6);
    const leftWallMesh = new THREE.Mesh(sideWallGeo, pierStoneMat);
    leftWallMesh.position.set(-9.05, riverTopY + sideWallH / 2, 0.55);
    leftWallMesh.rotation.y = 0.18; // Angled inner slope perspective
    this.scene.add(leftWallMesh);

    const rightWallMesh = new THREE.Mesh(sideWallGeo, pierStoneMat);
    rightWallMesh.position.set(9.05, riverTopY + sideWallH / 2, 0.55);
    rightWallMesh.rotation.y = -0.18;
    this.scene.add(rightWallMesh);
  }

  private buildBridgeDeckAndProps() {
    // Bridge Parapet & Deck spans full width at Y = +2.70 .. +3.60 (y_px: 90..135)
    const bridgeMat = this.stoneMaterials[1];
    const corniceMat = this.stoneMaterials[0];
    const soffitMat = this.darkStoneMaterials[0];

    // 1. Main Bridge Parapet Wall (y_px: 90..116 -> Y: +3.08 .. +3.60)
    const parapetGeo = new THREE.BoxGeometry(21.5, 0.54, 1.25);
    const parapetMesh = new THREE.Mesh(parapetGeo, bridgeMat);
    parapetMesh.position.set(0, 3.34, 0.35);
    this.scene.add(parapetMesh);

    // Top Bridge Parapet Capstone Rail (Y = +3.60)
    const topRailGeo = new THREE.BoxGeometry(21.5, 0.10, 1.38);
    const topRailMesh = new THREE.Mesh(topRailGeo, corniceMat);
    topRailMesh.position.set(0, 3.60, 0.42);
    this.scene.add(topRailMesh);

    // 2. 3D Projecting Coping Cornice Ledge (y_px: 114..122 -> Y: +2.96 .. +3.12)
    const corniceGeo = new THREE.BoxGeometry(21.5, 0.16, 1.52);
    const corniceMesh = new THREE.Mesh(corniceGeo, corniceMat);
    corniceMesh.position.set(0, 3.04, 0.52);
    this.scene.add(corniceMesh);

    // 3. Recessed Underside Soffit Beam (y_px: 122..135 -> Y: +2.70 .. +2.96)
    const soffitGeo = new THREE.BoxGeometry(21.5, 0.28, 1.15);
    const soffitMesh = new THREE.Mesh(soffitGeo, soffitMat);
    soffitMesh.position.set(0, 2.83, 0.28);
    this.scene.add(soffitMesh);

    // 4. 11 Protruding 3D Structural Stone Corbel Brackets
    const corbelXList = [95, 175, 255, 335, 415, 495, 575, 655, 735, 815, 895];
    const corbelGeo = new THREE.BoxGeometry(0.34, 0.28, 0.45);
    for (const cxPx of corbelXList) {
      const cxWorld = (cxPx + 9 - 480) / 50;
      const corbelMesh = new THREE.Mesh(corbelGeo, corniceMat);
      corbelMesh.position.set(cxWorld, 2.84, 0.65);
      this.scene.add(corbelMesh);
    }

    // 5. Scenic 3D Wooden Sign "傷心湯" on Left Pier (x_px ≈ 32, y_px ≈ 126)
    const signTex = this.createSignTexture();
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.65,
      metalness: 0.08,
    });
    const signGeo = new THREE.BoxGeometry(1.08, 0.72, 0.12);
    this.signMesh = new THREE.Mesh(signGeo, signMat);
    this.signMesh.position.set((32 - 480) / 50, (270 - 126) / 50, 1.38);
    this.scene.add(this.signMesh);

    // Hanging chains for sign
    const chainMat = new THREE.MeshStandardMaterial({ color: 0x29180b, metalness: 0.6, roughness: 0.4 });
    const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6);
    const chainL = new THREE.Mesh(chainGeo, chainMat);
    chainL.position.set((18 - 480) / 50, (270 - 102) / 50, 1.38);
    this.scene.add(chainL);

    const chainR = new THREE.Mesh(chainGeo, chainMat);
    chainR.position.set((46 - 480) / 50, (270 - 102) / 50, 1.38);
    this.scene.add(chainR);

    // 6. 3D Bridge Recycling & Waste Bins at x_px = 180 and 740
    const create3DBin = (xPx: number, bodyHex: number, lidHex: number) => {
      const group = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(0.32, 0.48, 0.28);
      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      const lidGeo = new THREE.BoxGeometry(0.38, 0.10, 0.32);
      const lidMat = new THREE.MeshStandardMaterial({ color: lidHex, roughness: 0.4 });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.y = 0.28;
      group.add(lid);

      group.position.set((xPx + 8 - 480) / 50, 3.74, 0.45);
      this.scene.add(group);
    };

    create3DBin(180, 0x0284c7, 0x0369a1);
    create3DBin(740, 0x16a34a, 0x14532d);
  }

  private buildRiverWater() {
    // 3D River Water Surface Plane extending from deep inside arches (Z = -4.2) to foreground (Z = +6.6)
    // At Z = 0, Y = -3.20 (y_px = 430). Tilted slightly downward toward foreground so it fills y_px = 430..540
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

          // Gerstner-inspired 4-harmonic 3D wave displacement
          float w1 = sin(pos.x * 1.15 + uTime * 2.3) * 0.11;
          float w2 = cos(pos.y * 1.85 - uTime * 1.7 + pos.x * 0.55) * 0.08;
          float w3 = sin((pos.x * 1.9 + pos.y * 2.2) + uTime * 3.2) * 0.045;
          float w4 = cos(pos.x * 4.2 - uTime * 4.0) * 0.022;

          // Amplify waves in foreground (uv.y -> 0), calmer inside arch tunnels (uv.y -> 1)
          float fgFactor = mix(0.25, 1.35, 1.0 - uv.y);
          float elev = (w1 + w2 + w3 + w4) * fgFactor;

          pos.y += elev;
          vElevation = elev;

          vec3 n = normalize(vec3(
            -cos(pos.x * 1.15 + uTime * 2.3) * 0.25,
            1.0,
            -sin(pos.y * 1.85 - uTime * 1.7) * 0.20
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

          // Base water depth gradient
          vec3 waterCol = mix(uDeepColor, uShallowColor, depthT * 0.78 + vElevation * 2.2);

          // Pier reflection bands in water
          float pierDist1 = abs(vWorldPos.x - (-7.60));
          float pierDist2 = abs(vWorldPos.x - (-2.54));
          float pierDist3 = abs(vWorldPos.x - 2.54);
          float pierDist4 = abs(vWorldPos.x - 7.60);
          float minPierDist = min(min(pierDist1, pierDist2), min(pierDist3, pierDist4));
          float rippleShift = sin(vUv.y * 45.0 + uTime * 4.0) * 0.08;
          if (minPierDist + rippleShift < 0.55 && vUv.y > 0.35) {
            waterCol = mix(waterCol, vec3(0.85, 0.74, 0.58), 0.18 * vUv.y);
          }

          // Directional sunlight & specular sparkles
          vec3 lightDir = normalize(vec3(-0.4, 0.85, 0.45));
          float diff = max(dot(vNormalVec, lightDir), 0.0);
          waterCol += diff * 0.16 * uSunColor;

          float spec = pow(max(dot(vNormalVec, lightDir), 0.0), 32.0);
          waterCol += spec * 0.52 * uSunColor;

          // Wave crest seafoam & waterline lapping foam
          float foamThresh = mix(0.06, 0.12, depthT);
          float isFoam = smoothstep(foamThresh, foamThresh + 0.04, vElevation);
          // Continuous foam line near the bridge piers (vUv.y ≈ 0.62)
          float shoreLine = exp(-pow((vUv.y - 0.62) * 28.0 + sin(vWorldPos.x * 2.5 + uTime * 3.0) * 0.6, 2.0));
          waterCol = mix(waterCol, uFoamColor, clamp(isFoam * 0.85 + shoreLine * 0.65, 0.0, 0.92));

          // Colored-pencil cross-hatching grain
          float hatch = mod(gl_FragCoord.x * 0.65 - gl_FragCoord.y * 0.35, 4.0);
          if (hatch < 1.2) {
            waterCol -= vec3(0.045);
          }

          // Dark shadow deep inside arch tunnels (vUv.y > 0.66)
          float tunnelShadow = smoothstep(0.62, 0.85, vUv.y);
          waterCol = mix(waterCol, uDeepColor * 0.32, tunnelShadow);

          // Black pollution iridescent oil sheen
          if (uWaterQuality > 1.5) {
            float oil = sin(vWorldPos.x * 1.8 + vUv.y * 12.0 + uTime * 2.5) * 0.14;
            waterCol += vec3(oil * 0.35, -oil * 0.1, oil * 0.45);
          }

          gl_FragColor = vec4(waterCol, 1.0);
        }
      `,
    });

    const waterMesh = new THREE.Mesh(waterGeo, this.waterMat);
    // Position so that at Z = 0, Y = -3.20 (y_px = 430), and slopes toward camera to cover bottom of screen
    waterMesh.position.set(0, -3.55, 1.2);
    this.scene.add(waterMesh);
  }

  private buildVolumetricGodRays() {
    // 3 Slanted Translucent 3D Sunbeam Planes passing in front of the 3 Arches
    this.godRayMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          float edgeFade = sin(vUv.x * 3.14159);
          float vertFade = smoothstep(0.0, 0.85, vUv.y);
          float shimmer = 0.85 + 0.15 * sin(uTime * 2.0 + vUv.x * 6.0);
          float alpha = edgeFade * vertFade * 0.11 * shimmer * uIntensity;
          gl_FragColor = vec4(1.0, 0.97, 0.82, alpha);
        }
      `,
    });

    const rayConfigs = [
      { x: -4.6, y: -0.2, w: 1.8, h: 6.2 },
      { x: 0.3, y: -0.2, w: 2.3, h: 6.2 },
      { x: 5.2, y: -0.2, w: 1.9, h: 6.2 },
    ];

    for (const rc of rayConfigs) {
      const geo = new THREE.PlaneGeometry(rc.w, rc.h);
      const mesh = new THREE.Mesh(geo, this.godRayMat);
      mesh.position.set(rc.x, rc.y, 0.9);
      mesh.rotation.z = -0.22; // Slanted sunbeam angle
      this.scene.add(mesh);
    }
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

      this.foliageMaterials[0]?.color.setHex(0x84a98c);
      this.foliageMaterials[1]?.color.setHex(0x6b9080);
      this.foliageMaterials[2]?.color.setHex(0x52796f);

      this.stoneMaterials[0]?.color.setHex(0xe5e3df);
      this.stoneMaterials[1]?.color.setHex(0xd6d3d1);
      this.mossMaterials[0]?.color.setHex(0x6b7280);
    } else {
      // BLACK Polluted
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

      this.foliageMaterials[0]?.color.setHex(0x3f3f46);
      this.foliageMaterials[1]?.color.setHex(0x27272a);
      this.foliageMaterials[2]?.color.setHex(0x18181b);

      this.stoneMaterials[0]?.color.setHex(0x44403c);
      this.stoneMaterials[1]?.color.setHex(0x292524);
      this.mossMaterials[0]?.color.setHex(0x27272a);
    }
  }

  /**
   * Update 3D Scene animation, water waves, clouds, and interactive camera parallax
   */
  public update(timeSec: number, waterQuality: WaterQuality, playerX: number = 480) {
    if (!this.isAvailable) return;

    this.applyWaterQualityPalette(waterQuality);

    this.waterMat.uniforms.uTime.value = timeSec;
    this.godRayMat.uniforms.uTime.value = timeSec;

    // 3D Camera Parallax driven by player horizontal position
    const pNorm = (playerX - 480) / 480; // -1 .. +1
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
  }

  /**
   * Render the 3D scene to internal WebGL canvas
   */
  public render() {
    if (!this.isAvailable || !this.renderer) return;
    this.renderer.render(this.scene, this.camera);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public dispose() {
    if (!this.isAvailable) return;
    this.renderer?.dispose();
  }
}
