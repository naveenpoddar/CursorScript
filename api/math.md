# Math Library (`Math`)

The `Math` library provides standard mathematical constants and functions.

## Methods Index

- [abs](#mathabsn) | [sign](#mathsignn) | [round](#mathroundn) | [floor](#mathfloorn) | [ceil](#mathceiln) | [trunc](#mathtruncn)
- [pow](#mathpowbase-exp) | [sqrt](#mathsqrtn) | [cbrt](#mathcbrtn) | [root](#mathrootn-r)
- [sin](#mathsinn-cosn-tann) | [cos](#mathsinn-cosn-tann) | [tan](#mathsinn-cosn-tann)
- [asin](#mathasinn-acosn-atann) | [acos](#mathasinn-acosn-atann) | [atan](#mathasinn-acosn-atann) | [atan2](#mathatan2y-x)
- [sinDeg](#mathsindegdeg-cosdegdeg-tandegdeg) | [cosDeg](#mathsindegdeg-cosdegdeg-tandegdeg) | [tanDeg](#mathsindegdeg-cosdegdeg-tandegdeg)
- [clamp](#mathclampn-min-max) | [lerp](#mathlerpstart-end-t) | [remap](#mathremapn-s1-st1-s2-st2)
- [random](#mathrandom) | [randomInt](#mathrandomintmin-max) | [randomFloat](#mathrandomfloatmin-max)
- [factorial](#mathfactorialn) | [gcd](#mathgcda-b) | [lcm](#mathlcma-b)
- [min](#mathminargs-maxargs) | [max](#mathminargs-maxargs) | [sum](#mathsumargs) | [mean](#mathmeanargs) | [median](#mathmedianargs)
- [dist](#mathdistx1-y1-x2-y2) | [hypot](#mathhypotargs) | [toFixed](#mathtofixedn-digits)

## Constants

- **`Math.PI`**: Archimedes' constant, approximately `3.14159`.
- **`Math.E`**: Euler's number, approximately `2.71828`.
- **`Math.TAU`**: Two times PI, approximately `6.28318`.
- **`Math.PHI`**: The Golden Ratio, approximately `1.61803`.
- **`Math.SQRT2`**: The square root of 2, approximately `1.41421`.

---

## Basic Functions

### `Math.abs(n)`

Returns the absolute value of a number.

- **Example**: `Math.abs(-5); // 5`

### `Math.sign(n)`

Returns the sign of a number.

- **Example**: `Math.sign(-5); // -1`

### `Math.round(n)`

Rounds to nearest integer.

- **Example**: `Math.round(3.6); // 4`

### `Math.floor(n)`

Rounds down.

- **Example**: `Math.floor(3.9); // 3`

### `Math.ceil(n)`

Rounds up.

- **Example**: `Math.ceil(3.1); // 4`

### `Math.trunc(n)`

Removes decimals.

- **Example**: `Math.trunc(3.9); // 3`

---

## Power & Roots

### `Math.pow(base, exp)`

- **Example**: `Math.pow(2, 3); // 8`

### `Math.sqrt(n)`

- **Example**: `Math.sqrt(16); // 4`

### `Math.cbrt(n)`

- **Example**: `Math.cbrt(27); // 3`

### `Math.root(n, r)`

- **Example**: `Math.root(81, 4); // 3`

---

## Trigonometry (Radians)

### `Math.sin(n)` / `Math.cos(n)` / `Math.tan(n)`

- **Example**: `Math.sin(Math.PI / 2); // 1.0`

### `Math.asin(n)` / `Math.acos(n)` / `Math.atan(n)`

- **Example**: `Math.asin(1); // 1.5707...`

### `Math.atan2(y, x)`

- **Example**: `Math.atan2(1, 1); // 0.7853...`

---

## Trigonometry (Degrees)

### `Math.sinDeg(deg)` / `Math.cosDeg(deg)` / `Math.tanDeg(deg)`

- **Example**: `Math.sinDeg(90); // 1.0`

---

## Interpolation & Range

### `Math.clamp(n, min, max)`

- **Example**: `Math.clamp(20, 0, 10); // 10`

### `Math.lerp(start, end, t)`

- **Example**: `Math.lerp(0, 10, 0.5); // 5`

### `Math.remap(n, s1, st1, s2, st2)`

Maps a value from one range to another.

- **Example**: `Math.remap(5, 0, 10, 0, 100); // 50`

---

## Randomness

### `Math.random()`

- **Example**: `Math.random(); // e.g. 0.123`

### `Math.randomInt(min, max)`

- **Example**: `Math.randomInt(1, 6); // 1, 2, 3, 4, 5, or 6`

### `Math.randomFloat(min, max)`

- **Example**: `Math.randomFloat(1.0, 2.0); // e.g. 1.543`

---

## Advanced Math

### `Math.factorial(n)`

- **Example**: `Math.factorial(5); // 120`

### `Math.gcd(a, b)`

Greatest Common Divisor.

- **Example**: `Math.gcd(12, 18); // 6`

### `Math.lcm(a, b)`

Least Common Multiple.

- **Example**: `Math.lcm(4, 6); // 12`

---

## Statistics

### `Math.min(args...)` / `Math.max(args...)`

- **Example**: `Math.max(1, 5, 2); // 5`

### `Math.sum(args...)`

- **Example**: `Math.sum(1, 2, 3); // 6`

### `Math.mean(args...)`

- **Example**: `Math.mean(10, 20); // 15`

### `Math.median(args...)`

- **Example**: `Math.median(1, 3, 2); // 2`

---

## Geometry

### `Math.dist(x1, y1, x2, y2)`

- **Example**: `Math.dist(0, 0, 3, 4); // 5`

### `Math.hypot(args...)`

- **Example**: `Math.hypot(3, 4); // 5`

---

## Utilities

### `Math.toFixed(n, digits)`

- **Example**: `Math.toFixed(3.14159, 2); // 3.14`
