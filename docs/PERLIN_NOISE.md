# Perlin Noise Library (`PerlinNoise`) 🌊

## Methods Index

- [seed](#perlinnoiseseedvalue) | [noise2D](#perlinnoisenoise2dx-y)

The `PerlinNoise` library generates smooth, coherent gradient noise, ideal for terrain, clouds, and procedural textures.

## Methods

### `PerlinNoise.seed(value)`

Initialize the noise generator with a specific seed to ensure repeatable results.

- **Parameters**: `value` (number).

### `PerlinNoise.noise2D(x, y)`

Calculates the 2D Perlin noise value at the given coordinates.

- **Parameters**: `x` (number), `y` (number).
- **Returns**: `number` - A value in the range `[0.0, 1.0]`.

---

## Procedural Terrain Example

```cursor
Window.create(800, 600, "Terrain Generator");
PerlinNoise.seed(time());

Window.onUpdate(() -> {
    for (let x = 0; x < 800; x = x + 10) {
        let noise = PerlinNoise.noise2D(x * 0.01, 0);
        let h = noise * 200;
        Window.setColor("green");
        Window.drawRect(x, 600 - h, 10, h);
    }
});
```
