# 3D Engine Library (`Engine3D`) 🧊

## Methods Index

- [createScene](#engine3dcreatescene) | [setLight](#engine3dsetlightsceneid-dx-dy-dz-ambient) | [setLightColor](#engine3dsetlightcolorsceneid-r-g-b) | [setCamera](#engine3dsetcamerasceneid-x-y-z-rx-ry-rz-fov) | [setSceneAO](#engine3dsetsceneaosceneid-enabled-intensity)
- [createCube](#engine3dcreatecubesceneid-size-color) | [deleteMesh](#engine3ddeletemeshsceneid-meshid) | [setPosition](#engine3dsetpositionsceneid-meshid-x-y-z) | [setRotation](#engine3dsetrotationsceneid-meshid-rx-ry-rz) | [setScale](#engine3dsetscalesceneid-meshid-sx-sy-sz)
- [setColor](#engine3dsetcolorsceneid-meshid-color) | [setSolidMode](#engine3dsetsolidmodesceneid-meshid-issolid) | [setGlowMode](#engine3dsetglowmodesceneid-meshid-isglow) | [setBillboard](#engine3dsetbillboardsceneid-meshid-isbillboard) | [setFaceAO](#engine3dsetfaceaosceneid-meshid-faceidx-ao0-ao1-ao2-ao3)
- [checkSolid](#engine3dchecksolidsceneid-x-y-z) | [getTopBlockY](#engine3dgettopblockysceneid-x-z-maxy) | [raycast](#engine3draycastsceneid-sx-sy-sz-dx-dy-dz-maxdist)
- [dot](#engine3ddotx1-y1-z1-x2-y2-z2) | [normalize](#engine3dnormalizex-y-z) | [render](#engine3drendersceneid-width-height)

High-performance software-based 3D rendering with native hardware acceleration via Raylib.

## Scene Management

### `Engine3D.createScene()`

- **Example**: `let scene = Engine3D.createScene();`

### `Engine3D.setLight(sceneId, dx, dy, dz, ambient)`

- **Example**: `Engine3D.setLight(scene, 0, -1, 0, 0.3);`

### `Engine3D.setLightColor(sceneId, r, g, b)`

- **Example**: `Engine3D.setLightColor(scene, 1, 0.9, 0.8); // Warm light`

### `Engine3D.setCamera(sceneId, x, y, z, rx, ry, rz, fov)`

- **Example**: `Engine3D.setCamera(scene, 0, 5, -10, 20, 0, 0, 400);`

### `Engine3D.setSceneAO(sceneId, enabled, intensity)`

- **Example**: `Engine3D.setSceneAO(scene, true, 0.5);`

---

## Mesh Management

### `Engine3D.createCube(sceneId, size, color)`

- **Example**: `let cube = Engine3D.createCube(scene, 1.0, "red");`

### `Engine3D.deleteMesh(sceneId, meshId)`

- **Example**: `Engine3D.deleteMesh(scene, cube);`

### `Engine3D.setPosition(sceneId, meshId, x, y, z)`

- **Example**: `Engine3D.setPosition(scene, cube, 0, 0, 5);`

### `Engine3D.setRotation(sceneId, meshId, rx, ry, rz)`

- **Example**: `Engine3D.setRotation(scene, cube, 0, 45, 0);`

### `Engine3D.setScale(sceneId, meshId, sx, sy, sz)`

- **Example**: `Engine3D.setScale(scene, cube, 2, 0.5, 1);`

### `Engine3D.setColor(sceneId, meshId, color)`

- **Example**: `Engine3D.setColor(scene, cube, "blue");`

### `Engine3D.setSolidMode(sceneId, meshId, isSolid)`

- **Example**: `Engine3D.setSolidMode(scene, cube, true);`

### `Engine3D.setGlowMode(sceneId, meshId, isGlow)`

- **Example**: `Engine3D.setGlowMode(scene, cube, true);`

### `Engine3D.setBillboard(sceneId, meshId, isBillboard)`

- **Example**: `Engine3D.setBillboard(scene, particle, true);`

### `Engine3D.setFaceAO(sceneId, meshId, faceIdx, ao0, ao1, ao2, ao3)`

- **Example**: `Engine3D.setFaceAO(scene, cube, 0, 1, 1, 0, 0);`

---

## Queries & World logic

### `Engine3D.checkSolid(sceneId, x, y, z)`

- **Example**: `if (Engine3D.checkSolid(scene, x, y, z)) { bounce(); }`

### `Engine3D.getTopBlockY(sceneId, x, z, maxY)`

- **Example**: `let ground = Engine3D.getTopBlockY(scene, x, z, 10);`

### `Engine3D.raycast(sceneId, sx, sy, sz, dx, dy, dz, maxDist)`

- **Example**: `let hit = Engine3D.raycast(scene, camX, camY, camZ, dx, dy, dz, 100);`

---

## Math Utilities

### `Engine3D.dot(x1, y1, z1, x2, y2, z2)`

- **Example**: `let d = Engine3D.dot(0, 1, 0, 0, 1, 0); // 1`

### `Engine3D.normalize(x, y, z)`

- **Example**: `let dir = Engine3D.normalize(5, 0, 0); // {x: 1, y: 0, z: 0}`

---

## Rendering

### `Engine3D.render(sceneId, width, height)`

- **Example**: `Engine3D.render(scene, 800, 600);`
