import ConvertTOMK_Object from "./BaseLibConverter";
import { requireNumber } from "./RequireFunctions";
import { lib as raylib, parseColor } from "./WindowLib";
import { ptr } from "bun:ffi";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}
interface Face {
  v: number[];
  ao?: number[]; // Occlusion factor per vertex (0 to 1)
} // Collection of vertex indices

interface Mesh {
  id: number;
  vertices: Vec3[];
  faces: Face[];
  pos: Vec3;
  rot: Vec3;
  scale: Vec3;
  color: number;
  isSolid: boolean;
  isGlow: boolean;
  isBillboard: boolean;
}

interface Camera {
  pos: Vec3;
  rot: Vec3;
  fov: number;
}

interface Scene {
  id: number;
  camera: Camera;
  meshes: Map<number, Mesh>;
  meshGrid: Map<string, Mesh>; // Spatial lookup: "x,y,z"
  nextMeshId: number;
  lightDir: Vec3;
  lightIntensity: number;
  lightColor: Vec3;
  ambientLight: number;
  useAO: boolean;
  aoIntensity: number;
}

// FFI Helper for Raylib Vector2 struct
// REMOVED packVec2

class _Engine3D {
  private scenes: Map<number, Scene> = new Map();
  private nextSceneId = 1;

  // ----- Vector Math Utility -----
  public dot(x1: any, y1: any, z1: any, x2: any, y2: any, z2: any): number {
    return (
      requireNumber(x1) * requireNumber(x2) +
      requireNumber(y1) * requireNumber(y2) +
      requireNumber(z1) * requireNumber(z2)
    );
  }

  public normalize(x: any, y: any, z: any): any {
    let nx = requireNumber(x),
      ny = requireNumber(y),
      nz = requireNumber(z);
    let len = Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: nx / len, y: ny / len, z: nz / len };
  }

  private dotVec(v1: Vec3, v2: Vec3) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  // ----- Scene Management -----
  public createScene(): number {
    const id = this.nextSceneId++;
    this.scenes.set(id, {
      id,
      camera: {
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0 },
        fov: 400,
      },
      meshes: new Map(),
      meshGrid: new Map(),
      nextMeshId: 1,
      lightDir: { x: 0, y: 0, z: 1 },
      lightIntensity: 1.0,
      lightColor: { x: 1, y: 1, z: 1 },
      ambientLight: 0.3,
      useAO: false,
      aoIntensity: 0.5,
    });
    return id;
  }

  public setLight(sceneId: any, dirX: any, dirY: any, dirZ: any, ambient: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    let dx = requireNumber(dirX),
      dy = requireNumber(dirY),
      dz = requireNumber(dirZ);
    let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len > 0) {
      scene.lightDir = { x: dx / len, y: dy / len, z: dz / len };
      scene.lightIntensity = Math.min(1.0, len / 10.0); // Simple scaling if vector is short
    } else {
      scene.lightIntensity = 0;
    }
    scene.ambientLight = requireNumber(ambient);
  }

  public setLightColor(sceneId: any, r: any, g: any, b: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    scene.lightColor = {
      x: requireNumber(r),
      y: requireNumber(g),
      z: requireNumber(b),
    };
  }

  public setCamera(
    sceneId: any,
    x: any,
    y: any,
    z: any,
    rx: any,
    ry: any,
    rz: any,
    fov: any,
  ) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    scene.camera.pos = {
      x: requireNumber(x),
      y: requireNumber(y),
      z: requireNumber(z),
    };
    scene.camera.rot = {
      x: requireNumber(rx),
      y: requireNumber(ry),
      z: requireNumber(rz),
    };
    scene.camera.fov = requireNumber(fov);
  }

  public setSceneAO(sceneId: any, enabled: any, intensity: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    scene.useAO = !!enabled;
    scene.aoIntensity = requireNumber(intensity);
  }

  // ----- Mesh Management -----
  public createCube(sceneId: any, size: any, colorStr: any): number {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return -1;

    const s = requireNumber(size) / 2;
    const color = parseColor(colorStr);

    const vertices = [
      { x: -s, y: -s, z: -s },
      { x: s, y: -s, z: -s },
      { x: s, y: s, z: -s },
      { x: -s, y: s, z: -s },
      { x: -s, y: -s, z: s },
      { x: s, y: -s, z: s },
      { x: s, y: s, z: s },
      { x: -s, y: s, z: s },
    ];

    // Define faces (Counter-Clockwise winding)
    const faces = [
      { v: [0, 3, 2, 1] }, // Front
      { v: [5, 6, 7, 4] }, // Back
      { v: [1, 2, 6, 5] }, // Right
      { v: [4, 7, 3, 0] }, // Left
      { v: [4, 0, 1, 5] }, // Bottom
      { v: [3, 7, 6, 2] }, // Top
    ];

    const meshId = scene.nextMeshId++;
    const mesh: Mesh = {
      id: meshId,
      vertices,
      faces,
      pos: { x: 0, y: -999, z: 0 }, // Start somewhere far away
      rot: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color,
      isSolid: true,
      isGlow: false,
      isBillboard: false,
    };
    scene.meshes.set(meshId, mesh);
    return meshId;
  }

  public deleteMesh(sceneId: any, meshId: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    const mid = requireNumber(meshId);
    const mesh = scene.meshes.get(mid);
    if (mesh) {
      const key = `${Math.round(mesh.pos.x)},${Math.round(mesh.pos.y)},${Math.round(mesh.pos.z)}`;
      if (scene.meshGrid.get(key) === mesh) scene.meshGrid.delete(key);
    }
    scene.meshes.delete(mid);
  }

  public setSolidMode(sceneId: any, meshId: any, isSolid: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    const mesh = scene.meshes.get(requireNumber(meshId));
    if (!mesh) return;
    mesh.isSolid = !!isSolid;
  }

  public setGlowMode(sceneId: any, meshId: any, isGlow: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    const mesh = scene.meshes.get(requireNumber(meshId));
    if (!mesh) return;
    mesh.isGlow = !!isGlow;
  }

  public setBillboard(sceneId: any, meshId: any, isBillboard: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    const mesh = scene.meshes.get(requireNumber(meshId));
    if (!mesh) return;
    mesh.isBillboard = !!isBillboard;
  }

  public setFaceAO(
    sceneId: any,
    meshId: any,
    faceIdx: any,
    ao0: any,
    ao1: any,
    ao2: any,
    ao3: any,
  ) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    const mesh = scene.meshes.get(requireNumber(meshId));
    if (!mesh) return;
    const face = mesh.faces[requireNumber(faceIdx)];
    if (!face) return;
    face.ao = [
      requireNumber(ao0),
      requireNumber(ao1),
      requireNumber(ao2),
      requireNumber(ao3),
    ];
  }

  public setPosition(sceneId: any, meshId: any, x: any, y: any, z: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    const mesh = scene.meshes.get(requireNumber(meshId));
    if (!mesh) return;

    // Update grid
    const oldKey = `${Math.round(mesh.pos.x)},${Math.round(mesh.pos.y)},${Math.round(mesh.pos.z)}`;
    if (scene.meshGrid.get(oldKey) === mesh) scene.meshGrid.delete(oldKey);

    mesh.pos = {
      x: requireNumber(x),
      y: requireNumber(y),
      z: requireNumber(z),
    };

    const newKey = `${Math.round(mesh.pos.x)},${Math.round(mesh.pos.y)},${Math.round(mesh.pos.z)}`;
    scene.meshGrid.set(newKey, mesh);
  }

  public setRotation(sceneId: any, meshId: any, x: any, y: any, z: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    const mesh = scene.meshes.get(requireNumber(meshId));
    if (!mesh) return;
    mesh.rot = {
      x: requireNumber(x),
      y: requireNumber(y),
      z: requireNumber(z),
    };
  }

  public setScale(sceneId: any, meshId: any, x: any, y: any, z: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    const mesh = scene.meshes.get(requireNumber(meshId));
    if (!mesh) return;
    mesh.scale = {
      x: requireNumber(x),
      y: requireNumber(y),
      z: requireNumber(z),
    };
  }

  public setColor(sceneId: any, meshId: any, colorStr: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    const mesh = scene.meshes.get(requireNumber(meshId));
    if (!mesh) return;
    mesh.color = parseColor(colorStr);
  }

  // --- Optimized Native Queries ---
  public checkSolid(sceneId: any, x: any, y: any, z: any): boolean {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return false;
    const px = Math.round(requireNumber(x));
    const py = Math.round(requireNumber(y));
    const pz = Math.round(requireNumber(z));

    const key = `${px},${py},${pz}`;
    const mesh = scene.meshGrid.get(key);
    return mesh ? mesh.isSolid : false;
  }

  public getTopBlockY(sceneId: any, x: any, z: any, maxY: any): number {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return -999;
    const ix = Math.round(requireNumber(x));
    const iz = Math.round(requireNumber(z));
    let my = Math.round(requireNumber(maxY));

    for (let y = my; y >= -64; y--) {
      const key = `${ix},${y},${iz}`;
      const mesh = scene.meshGrid.get(key);
      if (mesh && mesh.isSolid) return y;
    }
    return -999;
  }

  public raycast(
    sceneId: any,
    startX: any,
    startY: any,
    startZ: any,
    dirX: any,
    dirY: any,
    dirZ: any,
    maxDist: any,
  ): any {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return null;

    let rx = requireNumber(startX);
    let ry = requireNumber(startY);
    let rz = requireNumber(startZ);
    const dx = requireNumber(dirX);
    const dy = requireNumber(dirY);
    const dz = requireNumber(dirZ);
    const max = requireNumber(maxDist);

    const stepSize = 0.1; // Finer steps for accuracy
    const steps = max / stepSize;

    for (let i = 0; i < steps; i++) {
      const bx = Math.round(rx);
      const by = Math.round(ry);
      const bz = Math.round(rz);

      const key = `${bx},${by},${bz}`;
      const m = scene.meshGrid.get(key);

      if (m && m.isSolid) {
        return {
          hit: true,
          x: bx,
          y: by,
          z: bz,
          meshId: m.id,
          px: Math.round(rx - dx * stepSize * 2),
          py: Math.round(ry - dy * stepSize * 2),
          pz: Math.round(rz - dz * stepSize * 2),
        };
      }
      rx += dx * stepSize;
      ry += dy * stepSize;
      rz += dz * stepSize;
    }

    return { hit: false };
  }

  // ----- Rendering Math -----
  private rotate3D(v: Vec3, rot: Vec3): Vec3 {
    let rad = (rot.x * Math.PI) / 180;
    let c = Math.cos(rad);
    let s = Math.sin(rad);
    let y1 = v.y * c - v.z * s;
    let z1 = v.y * s + v.z * c;

    rad = (rot.y * Math.PI) / 180;
    c = Math.cos(rad);
    s = Math.sin(rad);
    let x2 = v.x * c + z1 * s;
    let z2 = -v.x * s + z1 * c;

    rad = (rot.z * Math.PI) / 180;
    c = Math.cos(rad);
    s = Math.sin(rad);
    let x3 = x2 * c - y1 * s;
    let y3 = x2 * s + y1 * c;
    return { x: x3, y: y3, z: z2 };
  }

  private shadeColor(color: number, percent: number): number {
    const r = color & 0x000000ff;
    const g = (color & 0x0000ff00) >> 8;
    const b = (color & 0x00ff0000) >> 16;
    const a = (color & 0xff000000) >>> 24;

    const resR = Math.min(255, Math.max(0, r * percent));
    const resG = Math.min(255, Math.max(0, g * percent));
    const resB = Math.min(255, Math.max(0, b * percent));

    return (resR | (resG << 8) | (resB << 16) | (a << 24)) >>> 0;
  }

  // Calculate face normal
  private calcNormal(v0: Vec3, v1: Vec3, v2: Vec3): Vec3 {
    const ax = v1.x - v0.x,
      ay = v1.y - v0.y,
      az = v1.z - v0.z;
    const bx = v2.x - v0.x,
      by = v2.y - v0.y,
      bz = v2.z - v0.z;
    const cx = ay * bz - az * by;
    const cy = az * bx - ax * bz;
    const cz = ax * by - ay * bx;

    let len = Math.sqrt(cx * cx + cy * cy + cz * cz);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: cx / len, y: cy / len, z: cz / len };
  }

  public render(sceneId: any, screenWidth: any, screenHeight: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;

    const sw = requireNumber(screenWidth);
    const sh = requireNumber(screenHeight);
    const cam = scene.camera;

    // Pre-calculate rotation matrices for the camera
    const radY = (-cam.rot.y * Math.PI) / 180;
    const cy_v = Math.cos(radY),
      sy_v = Math.sin(radY);
    const radX = (-cam.rot.x * Math.PI) / 180;
    const cx_v = Math.cos(radX),
      sx_v = Math.sin(radX);
    const radZ = (-cam.rot.z * Math.PI) / 180;
    const cz_v = Math.cos(radZ),
      sz_v = Math.sin(radZ);

    interface ProjectedFace {
      v: { x: number; y: number; z: number }[];
      zDepth: number;
      normal: Vec3;
      color: number;
      isSolid: boolean;
      isGlow: boolean;
      ao?: number[];
    }
    const renderList: ProjectedFace[] = [];

    for (const mesh of scene.meshes.values()) {
      // --- Fully Synchronized Frustum Culling (FOV-Aware) ---
      // Dist from camera
      let tx = mesh.pos.x - cam.pos.x;
      let ty = mesh.pos.y - cam.pos.y;
      let tz = mesh.pos.z - cam.pos.z;

      // 1. Synchronized Yaw
      let x2 = tx * cy_v + tz * sy_v;
      let z2 = -tx * sy_v + tz * cy_v;
      // 2. Synchronized Pitch
      let y3 = ty * cx_v - z2 * sx_v;
      let z3 = ty * sx_v + z2 * cx_v;

      // Camera-space coords: x2, y3, z3
      const camX = x2;
      const camY = y3;
      const camZ = z3;

      // 1. Z-Near and Z-Far Culling
      if (camZ < 0.01 || camZ > 2000) continue;

      // 2. FOV-based Horizontal and Vertical Culling
      // We use the exact perspective projection math to define the frustum
      const margin = 5.0;
      const hThreshold = (sw / 2) * (camZ / cam.fov) + margin;
      const vThreshold = (sh / 2) * (camZ / cam.fov) + margin;

      if (Math.abs(camX) > hThreshold || Math.abs(camY) > vThreshold) {
        continue;
      }

      const transformedVerts: Vec3[] = [];
      const worldVerts: Vec3[] = [];

      for (const v of mesh.vertices) {
        // 1. Scale
        let tv = {
          x: v.x * mesh.scale.x,
          y: v.y * mesh.scale.y,
          z: v.z * mesh.scale.z,
        };
        // 2. Rotate
        tv = this.rotate3D(tv, mesh.rot);
        // 3. Translate
        tv.x += mesh.pos.x;
        tv.y += mesh.pos.y;
        tv.z += mesh.pos.z;
        worldVerts.push({ x: tv.x, y: tv.y, z: tv.z });

        // 4. View Camera (Inverse Transform - Yaw then Pitch!)
        tv.x -= cam.pos.x;
        tv.y -= cam.pos.y;
        tv.z -= cam.pos.z;

        // Inverse Yaw (Y)
        let x2 = tv.x * cy_v + tv.z * sy_v;
        let z2 = -tv.x * sy_v + tv.z * cy_v;
        tv.x = x2;
        tv.z = z2;

        // Inverse Pitch (X)
        let y2 = tv.y * cx_v - tv.z * sx_v;
        let z3 = tv.y * sx_v + tv.z * cx_v;
        tv.y = y2;
        tv.z = z3;

        // Inverse Roll (Z)
        let x4 = tv.x * cz_v - tv.y * sz_v;
        let y4 = tv.x * sz_v + tv.y * cz_v;
        tv.x = x4;
        tv.y = y4;
        transformedVerts.push(tv);
      }

      // Apply billboarding if enabled
      if (mesh.isBillboard) {
        // We override the rotation part of the transformation
        // for each vertex relative to the mesh position
        // This is a simplified version: just make the object face the camera normal
        for (let i = 0; i < transformedVerts.length; i++) {
          let v = mesh.vertices[i]!;
          // In view space, the camera is at origin looking towards +Z
          // We just need the vertex offsets in screen space
          transformedVerts[i] = {
            x: (v.x * mesh.scale.x - cam.pos.x + mesh.pos.x) * 1, // Simplified billboard math
            y: (v.y * mesh.scale.y - cam.pos.y + mesh.pos.y) * 1,
            z: (v.z * mesh.scale.z - cam.pos.z + mesh.pos.z) * 1,
          };
          // Re-apply view transform logic is complex for billboard...
          // Let's use a simpler approach: billboard objects are rendered specifically.
        }
      }

      for (const face of mesh.faces) {
        // Verify at least 3 vertices
        if (face.v.length < 3) continue;

        const v0 = transformedVerts[face.v[0]!]!;
        const v1 = transformedVerts[face.v[1]!]!;
        const v2 = transformedVerts[face.v[2]!]!;

        // Simple culling/clipping check:
        const isVisible = v0.z > 0.1 && v1.z > 0.1 && v2.z > 0.1;
        if (!isVisible) continue;

        // Backface culling and Lighting
        const worldV0 = worldVerts[face.v[0]!]!;
        const worldV1 = worldVerts[face.v[1]!]!;
        const worldV2 = worldVerts[face.v[2]!]!;
        const normal = this.calcNormal(worldV0, worldV1, worldV2);

        // Compute direct lighting based on scene LightDir
        let lightIntensity = this.dotVec(normal, scene.lightDir);

        // Face visibility using dot product with camera look direction
        let cameraRay = {
          x: worldV0.x - cam.pos.x,
          y: worldV0.y - cam.pos.y,
          z: worldV0.z - cam.pos.z,
        };
        if (mesh.isSolid && this.dotVec(normal, cameraRay) >= 0) {
          continue; // Back face culled
        }

        let drawColor = mesh.color;
        if (mesh.isSolid && !mesh.isGlow) {
          // Better Lighting Engine: Ambient + Diffuse (Lambertian) with RGB Light Color
          let diffuse = Math.max(0, lightIntensity) * scene.lightIntensity;

          let r = mesh.color & 0xff;
          let g = (mesh.color >> 8) & 0xff;
          let b = (mesh.color >> 16) & 0xff;
          let a = (mesh.color >> 24) & 0xff;

          // Apply Ambient + Colored Diffuse
          let finalR = r * (scene.ambientLight + diffuse * scene.lightColor.x);
          let finalG = g * (scene.ambientLight + diffuse * scene.lightColor.y);
          let finalB = b * (scene.ambientLight + diffuse * scene.lightColor.z);

          // Clamp
          if (finalR > 255) finalR = 255;
          if (finalG > 255) finalG = 255;
          if (finalB > 255) finalB = 255;

          drawColor =
            (Math.floor(finalR) |
              (Math.floor(finalG) << 8) |
              (Math.floor(finalB) << 16) |
              (a << 24)) >>>
            0;
        }

        const projectedVerts = face.v.map((idx) => {
          const p = transformedVerts[idx]!;
          const f = cam.fov / p.z;
          return { x: p.x * f + sw / 2, y: -p.y * f + sh / 2, z: p.z };
        });

        const faceCx =
          face.v
            .map((idx) => transformedVerts[idx]!.x)
            .reduce((a, b) => a + b, 0) / face.v.length;
        const faceCy =
          face.v
            .map((idx) => transformedVerts[idx]!.y)
            .reduce((a, b) => a + b, 0) / face.v.length;
        const faceCz =
          face.v
            .map((idx) => transformedVerts[idx]!.z)
            .reduce((a, b) => a + b, 0) / face.v.length;

        // Exact Euclidean distance squared from camera origin
        const distSq = faceCx * faceCx + faceCy * faceCy + faceCz * faceCz;

        renderList.push({
          v: projectedVerts,
          zDepth: distSq,
          normal: normal,
          color: drawColor,
          isSolid: mesh.isSolid,
          isGlow: mesh.isGlow,
          ao: face.ao,
        });
      }
    }

    // Sort Painter's Algorithm (Furthest Distance first)
    renderList.sort((a, b) => b.zDepth - a.zDepth);

    // Render pass
    for (const face of renderList) {
      if (face.isGlow) {
        if (raylib.symbols.BeginBlendMode) raylib.symbols.BeginBlendMode(1); // 1 = BLEND_ADDITIVE
      }

      if (face.isSolid) {
        // --- Calculate Universal Face Shading (including AO) ---
        let drawColor = face.color;

        if (scene.useAO && face.ao && face.ao.length > 0) {
          // Average AO for the entire face to avoid visible triangle diagonals
          let totalAO = 0;
          for (let val of face.ao) totalAO += val;
          let avgAO = totalAO / face.ao.length;

          // Normalize neighbor count (0-3) to 0.0-1.0 and apply intensity
          // 0.33 maps the max 3 neighbors to a full intensity shadow
          let aoFactor = 1.0 - avgAO * scene.aoIntensity * 0.33;
          if (aoFactor < 0.05) aoFactor = 0.05; // Never go pitch black

          // Extract channels safely using unsigned shifts
          let r = (face.color & 0xff) * aoFactor;
          let g = ((face.color >> 8) & 0xff) * aoFactor;
          let b = ((face.color >> 16) & 0xff) * aoFactor;
          let a = (face.color >>> 24) & 0xff;

          // Clamp and re-pack
          if (r > 255) r = 255;
          if (g > 255) g = 255;
          if (b > 255) b = 255;

          drawColor =
            (Math.floor(r) |
              (Math.floor(g) << 8) |
              (Math.floor(b) << 16) |
              (a << 24)) >>>
            0;
        }

        // Split polygons into triangles and draw
        let p0 = face.v[0]!;
        for (let i = 1; i < face.v.length - 1; i++) {
          let p1 = face.v[i]!;
          let p2 = face.v[i + 1]!;

          if (raylib.symbols.DrawTriangleFan) {
            const pts = new Float32Array([p2.x, p2.y, p1.x, p1.y, p0.x, p0.y]);
            raylib.symbols.DrawTriangleFan(ptr(pts), 3, drawColor);
          }
        }
      } else {
        // Wireframe Outline
        for (let i = 0; i < face.v.length; i++) {
          let p1 = face.v[i]!;
          let p2 = face.v[(i + 1) % face.v.length]!;
          raylib.symbols.DrawLine(p1.x, p1.y, p2.x, p2.y, face.color);
        }
      }

      if (face.isGlow) {
        if (raylib.symbols.EndBlendMode) raylib.symbols.EndBlendMode();
      }
    }
  }
}

export const Engine3DL = ConvertTOMK_Object(new _Engine3D());
