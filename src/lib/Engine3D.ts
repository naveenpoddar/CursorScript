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
  nextMeshId: number;
  lightDir: Vec3;
  ambientLight: number;
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
      nextMeshId: 1,
      lightDir: { x: 0, y: 0, z: 1 }, // Default light pointing forward
      ambientLight: 0.3,
    });
    return id;
  }

  public setLight(sceneId: any, dirX: any, dirY: any, dirZ: any, ambient: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    let norm = this.normalize(dirX, dirY, dirZ);
    scene.lightDir = { x: norm.x, y: norm.y, z: norm.z };
    scene.ambientLight = requireNumber(ambient);
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
    scene.meshes.set(meshId, {
      id: meshId,
      vertices,
      faces,
      pos: { x: 0, y: 0, z: 0 },
      rot: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color,
      isSolid: true, // Default solid
      isGlow: false,
    });
    return meshId;
  }

  public deleteMesh(sceneId: any, meshId: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    scene.meshes.delete(requireNumber(meshId));
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

  public setPosition(sceneId: any, meshId: any, x: any, y: any, z: any) {
    const scene = this.scenes.get(requireNumber(sceneId));
    if (!scene) return;
    const mesh = scene.meshes.get(requireNumber(meshId));
    if (!mesh) return;
    mesh.pos = {
      x: requireNumber(x),
      y: requireNumber(y),
      z: requireNumber(z),
    };
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

    interface ProjectedFace {
      v: { x: number; y: number; z: number }[];
      zDepth: number;
      normal: Vec3;
      color: number;
      isSolid: boolean;
      isGlow: boolean;
    }
    const renderList: ProjectedFace[] = [];

    for (const mesh of scene.meshes.values()) {
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
        let radY = (-cam.rot.y * Math.PI) / 180;
        let cy = Math.cos(radY),
          sy = Math.sin(radY);
        let x2 = tv.x * cy + tv.z * sy;
        let z2 = -tv.x * sy + tv.z * cy;
        tv.x = x2;
        tv.z = z2;

        // Inverse Pitch (X)
        let radX = (-cam.rot.x * Math.PI) / 180;
        let cx = Math.cos(radX),
          sx = Math.sin(radX);
        let y2 = tv.y * cx - tv.z * sx;
        let z3 = tv.y * sx + tv.z * cx;
        tv.y = y2;
        tv.z = z3;

        // Inverse Roll (Z - usually 0 for FPS)
        let radZ = (-cam.rot.z * Math.PI) / 180;
        let cz = Math.cos(radZ),
          sz = Math.sin(radZ);
        let x4 = tv.x * cz - tv.y * sz;
        let y4 = tv.x * sz + tv.y * cz;
        tv.x = x4;
        tv.y = y4;
        transformedVerts.push(tv);
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
        if (mesh.isSolid) {
          // Better Lighting Engine: Ambient + Diffuse (Lambertian)
          let diffuse = Math.max(0, lightIntensity);
          const lum = scene.ambientLight + diffuse * (1.0 - scene.ambientLight);
          drawColor = this.shadeColor(mesh.color, lum);
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
        // Split polygons into triangles and draw
        let p0 = face.v[0]!;
        for (let i = 1; i < face.v.length - 1; i++) {
          let p1 = face.v[i]!;
          let p2 = face.v[i + 1]!;
          // Solid Fill with DrawTriangleFan
          if (raylib.symbols.DrawTriangleFan) {
            const pts = new Float32Array([p2.x, p2.y, p1.x, p1.y, p0.x, p0.y]);
            raylib.symbols.DrawTriangleFan(ptr(pts), 3, face.color);
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
