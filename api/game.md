# Game Library (`Game`) 🎮

The `Game` library provides essential utilities for game development, physics, and gameplay logic.

## Collision Detection

- `Game.intersectRect(x1, y1, w1, h1, x2, y2, w2, h2)` - Returns `true` if two rectangles overlap.
- `Game.pointInRect(px, py, rx, ry, rw, rh)` - Returns `true` if a point is inside a rectangle.

## Movement & Math

- `Game.moveTowards(current, target, maxDelta)` - Moves `current` towards `target` without overshooting.
- `Game.lerp(a, b, t)` - Linearly interpolates between `a` and `b`.
- `Game.smoothstep(edge0, edge1, x)` - Smooth interpolation between 0 and 1.
- `Game.angleTo(x1, y1, x2, y2)` - Returns the angle (radians) from point 1 to point 2.
- `Game.deltaAngle(a, b)` - Shortest distance between two angles (radians).

## Gameplay Utilities

- `Game.chance(p)` - Returns `true` with probability `p` (0.0 to 1.0).
- `Game.shake(mag)` - Returns a random value between `-mag` and `+mag`.
- `Game.choose(args...)` - Returns a random element from the provided arguments.
- `Game.deadzone(val, threshold)` - Returns 0 if `abs(val) < threshold`.
- `Game.repeat(t, length)` - Loops `t` so it is never larger than `length` and never smaller than 0.
- `Game.pingPong(t, length)` - Returns a value that oscillates between 0 and `length`.

## Conversion

- `Game.degToRad(deg)` - Converts degrees to radians.
- `Game.radToDeg(rad)` - Converts radians to degrees.
