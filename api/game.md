# Game Library (`Game`) 🎮

Utilities for gameplay logic, physics, and color manipulation.

## Methods Index

- [intersectRect](#gameintersectrectx1-y1-w1-h1-x2-y2-w2-h2) | [pointInRect](#gamepointinrectpx-py-rx-ry-rw-rh)
- [moveTowards](#gamemovetowardscurrent-target-maxdelta) | [lerp](#gamelerpa-b-t) | [smoothstep](#gamesmoothstepedge0-edge1-x)
- [deltaAngle](#gamedeltaanglea-b) | [angleTo](#gameangletox1-y1-x2-y2)
- [chance](#gamechancep) | [shake](#gameshakemagnitude) | [choose](#gamechooseargs)
- [degToRad](#gamedegtoraddeg) | [radToDeg](#gameradtodegrad)
- [deadzone](#gamedeadzonevalue-threshold) | [repeat](#gamerepeatt-length) | [pingPong](#gamepingpongt-length)
- [lerpColor](#gamelerpcolorc1-c2-t)

## Collision Detection

### `Game.intersectRect(x1, y1, w1, h1, x2, y2, w2, h2)`

- **Example**: `let hit = Game.intersectRect(obj1.x, obj1.y, 20, 20, obj2.x, obj2.y, 20, 20);`

### `Game.pointInRect(px, py, rx, ry, rw, rh)`

- **Example**: `let hovered = Game.pointInRect(mx, my, button.x, button.y, 100, 50);`

---

## Movement & Math Helpers

### `Game.moveTowards(current, target, maxDelta)`

- **Example**: `pos.x = Game.moveTowards(pos.x, targetX, 5);`

### `Game.lerp(a, b, t)`

- **Example**: `let val = Game.lerp(0, 100, 0.1);`

### `Game.smoothstep(edge0, edge1, x)`

- **Example**: `let alpha = Game.smoothstep(0, 1, time);`

### `Game.deltaAngle(a, b)`

- **Example**: `let diff = Game.deltaAngle(currentRot, targetRot);`

### `Game.angleTo(x1, y1, x2, y2)`

- **Example**: `let angle = Game.angleTo(player.x, player.y, enemy.x, enemy.y);`

---

## Random Utilities

### `Game.chance(p)`

- **Example**: `if (Game.chance(0.5)) { print("Critical Hit!"); }`

### `Game.shake(magnitude)`

- **Example**: `let offset = Game.shake(10);`

### `Game.choose(args...)`

- **Example**: `let enemy = Game.choose("Zombie", "Skeleton", "Ghost");`

---

## Conversion

### `Game.degToRad(deg)`

- **Example**: `let rad = Game.degToRad(180); // 3.1415...`

### `Game.radToDeg(rad)`

- **Example**: `let deg = Game.radToDeg(Math.PI); // 180`

---

## Gameplay Logic Helpers

### `Game.deadzone(value, threshold)`

- **Example**: `let move = Game.deadzone(joystick.x, 0.2);`

### `Game.repeat(t, length)`

- **Example**: `let cyclic = Game.repeat(timing, 10);`

### `Game.pingPong(t, length)`

- **Example**: `let oscillate = Game.pingPong(time, 100);`

---

## Color Utilities

### `Game.lerpColor(c1, c2, t)`

- **Example**: `let color = Game.lerpColor("#FF0000", "#0000FF", 0.5);`
