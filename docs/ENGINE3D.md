# 3D Engine Library (`Engine3D`) 🧊

High-performance software-based 3D rendering with native hardware acceleration.

## Methods

### `Engine3D.createScene()`

Initializes a new 3D scene and returns its ID.

### `Engine3D.setCamera(sceneId, x, y, z, rx, ry, rz, fov)`

Sets the camera position and rotation.

### `Engine3D.createCube(sceneId, size, color)`

Adds a cube to the scene and returns its Mesh ID.

### `Engine3D.setPosition(sceneId, meshId, x, y, z)`

Moves a mesh in 3D space.

### `Engine3D.render(sceneId, width, height)`

Renders the scene to the current window buffer.

### `Engine3D.raycast(sceneId, sx, sy, sz, dx, dy, dz, maxDist)`

Performs a raycast in the 3D world.

- **Example**: `const (hit, dist) = Engine3D.raycast(s, 0,0,0, 0,1,0, 100);`
