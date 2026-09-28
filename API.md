# math — API reference

Complete reference for every export in `math`, grouped by module. For an
overview, installation, and examples, see the [README](./README.md).

## Modules

- [`math`](#api-math) — Vectors, quaternions, euler angles & matrices
- [`math/shapes`](#api-math-shapes) — Shape primitives & spatial queries
- [`math/geometry`](#api-math-geometry) — Geometric algorithms
- [`math/time`](#api-math-time) — Easing & spring animation
- [`math/random`](#api-math-random) — Seeded random number generators
- [`math/noise`](#api-math-noise) — Perlin, simplex & worley noise, plus fractal helpers
- [`math/color`](#api-math-color) — Color spaces (OKLab, OKLCH, Okhsl, Lab, HDR), CSS Color 4/5 parsing, gamut & tone mapping, GPU packing & shaders
- [`math/ik`](#api-math-ik) — Inverse kinematics

---

<a id="api-math"></a>

## `math`

**Types**

- `type MutableArrayLike<T> = { [index: number]: T; length: number; }`
- `type Vec2 = [ x: number, y: number ]` — A 2D vector
- `type Vec3 = [ x: number, y: number, z: number ]` — A 3D vector
- `type Vec4 = [ x: number, y: number, z: number, w: number ]` — A 4D vector
- `type Euler = [ x: number, y: number, z: number, order?: EulerOrder ]` — A Euler in 3D space, with an optional order (default is 'xyz')
- `type EulerOrder = 'xyz' | 'xzy' | 'yxz' | 'yzx' | 'zxy' | 'zyx'` — Euler orders
- `type Quat = [ x: number, y: number, z: number, w: number ]` — A quaternion that represents rotation
- `type Quat2 = [ x: number, y: number, z: number, w: number, x2: number, y2: number, z2: number, w2: number ]` — A dual quaternion that represents both rotation and translation
- `type Mat2 = [ e1: number, e2: number, e3: number, e4: number ]` — A 2x2 matrix
- `type Mat2d = [ e1: number, e2: number, e3: number, e4: number, e5: number, e6: number ]` — A 2D affine transform matrix
- `type Mat3 = [ e1: number, e2: number, e3: number, e4: number, e5: number, e6: number, e7: number, e8: number, e9: number ]` — A 3x3 matrix
- `type Mat4 = [ e1: number, e2: number, e3: number, e4: number, e5: number, e6: number, e7: number, e8: number, e9: number, e10: number, e11: number, e12: number, e13: number, e14: number, e15: number, e16: number ]` — A 4x4 matrix
- `type Spherical = [ r: number, theta: number, phi: number ]` — A point in spherical coordinates [r, theta, phi] (Three.js / OpenGL convention)
- `type Polar = [ r: number, theta: number ]` — A point in polar coordinates [r, theta]

**Operations**

- <a id="epsilon"></a>`EPSILON = 0.000001`
- <a id="round"></a>`round(a: number): number` — Symmetric round
- <a id="fade"></a>`fade(t: number)` — Ease-in-out, goes to -Infinite before 0 and Infinite after 1
- <a id="lerp"></a>`lerp(v0: number, v1: number, t: number)`
- <a id="lagrange"></a>`lagrange(v0: number, v1: number, v2: number, t: number)`
- <a id="binomial"></a>`binomial(n: number, k: number): number`
- <a id="clamp"></a>`clamp(value: number, min: number, max: number): number` — Clamp a value between min and max
- <a id="repeat"></a>`repeat(t: number, length: number): number` — Loops `t` so that it is never larger than `length` and never smaller than 0.
- <a id="remap"></a>`remap(number: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number` — Remaps a number from one range to another.
- <a id="remapclamp"></a>`remapClamp(value: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number` — Remaps a number from one range to another, clamping the result to the output range.
- <a id="degrees_to_radians"></a>`DEGREES_TO_RADIANS`
- <a id="radians_to_degrees"></a>`RADIANS_TO_DEGREES`
- <a id="degreestoradians"></a>`degreesToRadians(degrees: number): number` — Converts Degrees To Radians
- <a id="radianstodegrees"></a>`radiansToDegrees(radians: number): number` — Converts Radians To Degrees
- <a id="wrapangle"></a>`wrapAngle(a: number): number` — Wraps an angle (in radians) into the range (-π, π].
- <a id="deltaangle"></a>`deltaAngle(current: number, target: number): number` — Calculates the shortest signed difference between two angles (in radians).

**Query**

- <a id="equals"></a>`equals(a: number, b: number, epsilon = EPSILON): boolean` — Tests whether or not the arguments have approximately the same value, within an absolute

<a id="api-math-vec2"></a>

### `vec2`

```ts
import { vec2 } from 'math';
```

**Create**

- `vec2.create(): Vec2` — Creates a new, empty vec2
- `vec2.clone(a: Vec2): Vec2` — Creates a new vec2 initialized with values from an existing vector
- `vec2.fromValues(x: number, y: number): Vec2` — Creates a new vec2 initialized with the given values
- `vec2.copy(out: Vec2, a: Vec2): Vec2` — Copy the values from one vec2 to another
- `vec2.set(out: Vec2, x: number, y: number): Vec2` — Set the components of a vec2 to the given values
- `vec2.fromBuffer(out: Vec2, buffer: ArrayLike<number>, startIndex: number): Vec2` — Sets the components of a vec2 from a buffer
- `vec2.toBuffer(outBuffer: MutableArrayLike<number>, vec: Vec2, startIndex: number): MutableArrayLike<number>` — Writes the components of a vec2 to a buffer
- `vec2.zero(out: Vec2): Vec2` — Set the components of a vec2 to zero
- `vec2.str(a: Vec2): string` — Returns a string representation of a vector

**Operations**

- `vec2.add(out: Vec2, a: Vec2, b: Vec2): Vec2` — Adds two vec2's
- `vec2.addScalar(out: Vec2, a: Vec2, b: number): Vec2` — Adds a scalar value to all components of a vec2
- `vec2.subtract(out: Vec2, a: Vec2, b: Vec2): Vec2` — Subtracts vector b from vector a
- `vec2.subtractScalar(out: Vec2, a: Vec2, b: number): Vec2` — Subtracts a scalar value from all components of a vec2
- `vec2.multiply(out: Vec2, a: Vec2, b: Vec2): Vec2` — Multiplies two vec2's
- `vec2.divide(out: Vec2, a: Vec2, b: Vec2): Vec2` — Divides two vec2's
- `vec2.ceil(out: Vec2, a: Vec2): Vec2` — Math.ceil the components of a vec2
- `vec2.floor(out: Vec2, a: Vec2): Vec2` — Math.floor the components of a vec2
- `vec2.min(out: Vec2, a: Vec2, b: Vec2): Vec2` — Returns the minimum of two vec2's
- `vec2.max(out: Vec2, a: Vec2, b: Vec2): Vec2` — Returns the maximum of two vec2's
- `vec2.round(out: Vec2, a: Vec2): Vec2` — symmetric round the components of a vec2
- `vec2.scale(out: Vec2, a: Vec2, b: number): Vec2` — Scales a vec2 by a scalar number
- `vec2.scaleAndAdd(out: Vec2, a: Vec2, b: Vec2, scale: number): Vec2` — Adds two vec2's after scaling the second operand by a scalar value
- `vec2.distance(a: Vec2, b: Vec2): number` — Calculates the euclidian distance between two vec2's
- `vec2.squaredDistance(a: Vec2, b: Vec2): number` — Calculates the squared euclidian distance between two vec2's
- `vec2.length(a: Vec2): number` — Calculates the length of a vec2
- `vec2.squaredLength(a: Vec2): number` — Calculates the squared length of a vec2
- `vec2.negate(out: Vec2, a: Vec2): Vec2` — Negates the components of a vec2
- `vec2.inverse(out: Vec2, a: Vec2): Vec2` — Returns the inverse of the components of a vec2
- `vec2.normalize(out: Vec2, a: Vec2): Vec2` — Normalize a vec2
- `vec2.dot(a: Vec2, b: Vec2): number` — Calculates the dot product of two vec2's
- `vec2.cross(out: Vec3, a: Vec2, b: Vec2): Vec3` — Computes the cross product of two vec2's
- `vec2.lerp(out: Vec2, a: Vec2, b: Vec2, t: number): Vec2` — Performs a linear interpolation between two vec2's
- `vec2.lagrange(out: Vec2, a: Vec2, b: Vec2, c: Vec2, t: number): Vec2` — Quadratic interpolation through three vectors using Lagrange interpolation.
- `vec2.signedAngle(a: Vec2, b: Vec2): number` — Get the signed angle from `a` to `b`, in the range (-PI, PI].

**Transform**

- `vec2.transformMat2(out: Vec2, a: Vec2, m: Mat2): Vec2` — Transforms the vec2 with a mat2
- `vec2.transformMat2d(out: Vec2, a: Vec2, m: Mat2d): Vec2` — Transforms the vec2 with a mat2d
- `vec2.transformMat3(out: Vec2, a: Vec2, m: Mat3): Vec2` — Transforms the vec2 with a mat3
- `vec2.transformMat4(out: Vec2, a: Vec2, m: Mat4): Vec2` — Transforms the vec2 with a mat4
- `vec2.rotate(out: Vec2, a: Vec2, b: Vec2, rad: number): Vec2` — Rotate a 2D vector

**Query**

- `vec2.angle(a: Vec2, b: Vec2): number` — Get the angle between two 2D vectors
- `vec2.exactEquals(a: Vec2, b: Vec2): boolean` — Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
- `vec2.equals(a: Vec2, b: Vec2): boolean` — Returns whether or not the vectors have approximately the same elements in the same position.
- `vec2.finite(a: Vec2): boolean` — Returns whether or not the vector is finite

**Aliases**

- `vec2.len = length` — Alias for `length`
- `vec2.sub = subtract` — Alias for `subtract`
- `vec2.mul = multiply` — Alias for `multiply`
- `vec2.div = divide` — Alias for `divide`
- `vec2.dist = distance` — Alias for `distance`
- `vec2.sqrDist = squaredDistance` — Alias for `squaredDistance`
- `vec2.sqrLen = squaredLength` — Alias for `squaredLength`

<a id="api-math-vec3"></a>

### `vec3`

```ts
import { vec3 } from 'math';
```

**Create**

- `vec3.create(): Vec3` — Creates a new, empty vec3
- `vec3.clone(a: Vec3): Vec3` — Creates a new vec3 initialized with values from an existing vector
- `vec3.fromValues(x: number, y: number, z: number): Vec3` — Creates a new vec3 initialized with the given values
- `vec3.copy(out: Vec3, a: Vec3): Vec3` — Copy the values from one vec3 to another
- `vec3.set(out: Vec3, x: number, y: number, z: number): Vec3` — Set the components of a vec3 to the given values
- `vec3.setScalar(out: Vec3, s: number): Vec3` — Sets all components of a vec3 to the given scalar value
- `vec3.fromBuffer(out: Vec3, buffer: ArrayLike<number>, startIndex: number): Vec3` — Sets the components of a vec3 from a buffer
- `vec3.toBuffer(outBuffer: MutableArrayLike<number>, vec: Vec3, startIndex: number): MutableArrayLike<number>` — Writes the components of a vec3 to a buffer
- `vec3.zero(out: Vec3): Vec3` — Set the components of a vec3 to zero
- `vec3.str(a: Vec3): string` — Returns a string representation of a vector

**Operations**

- `vec3.length(a: Vec3): number` — Calculates the length of a vec3
- `vec3.add(out: Vec3, a: Vec3, b: Vec3): Vec3` — Adds two vec3's
- `vec3.addScalar(out: Vec3, a: Vec3, b: number): Vec3` — Adds a scalar value to all components of a vec3
- `vec3.subtract(out: Vec3, a: Vec3, b: Vec3): Vec3` — Subtracts vector b from vector a
- `vec3.subtractScalar(out: Vec3, a: Vec3, b: number): Vec3` — Subtracts a scalar value from all components of a vec3
- `vec3.multiply(out: Vec3, a: Vec3, b: Vec3): Vec3` — Multiplies two vec3's
- `vec3.divide(out: Vec3, a: Vec3, b: Vec3): Vec3` — Divides two vec3's
- `vec3.ceil(out: Vec3, a: Vec3): Vec3` — Math.ceil the components of a vec3
- `vec3.floor(out: Vec3, a: Vec3): Vec3` — Math.floor the components of a vec3
- `vec3.min(out: Vec3, a: Vec3, b: Vec3): Vec3` — Returns the minimum of two vec3's
- `vec3.max(out: Vec3, a: Vec3, b: Vec3): Vec3` — Returns the maximum of two vec3's
- `vec3.round(out: Vec3, a: Vec3): Vec3` — symmetric round the components of a vec3
- `vec3.scale(out: Vec3, a: Vec3, b: number): Vec3` — Scales a vec3 by a scalar number
- `vec3.scaleAndAdd(out: Vec3, a: Vec3, b: Vec3, scale: number): Vec3` — Adds two vec3's after scaling the second operand by a scalar value
- `vec3.distance(a: Vec3, b: Vec3): number` — Calculates the euclidian distance between two vec3's
- `vec3.squaredDistance(a: Vec3, b: Vec3): number` — Calculates the squared euclidian distance between two vec3's
- `vec3.squaredLength(a: Vec3): number` — Calculates the squared length of a vec3
- `vec3.negate(out: Vec3, a: Vec3): Vec3` — Negates the components of a vec3
- `vec3.inverse(out: Vec3, a: Vec3): Vec3` — Returns the inverse of the components of a vec3
- `vec3.normalize(out: Vec3, a: Vec3): Vec3` — Normalize a vec3
- `vec3.dot(a: Vec3, b: Vec3): number` — Calculates the dot product of two vec3's
- `vec3.cross(out: Vec3, a: Vec3, b: Vec3): Vec3` — Computes the cross product of two vec3's
- `vec3.perpendicular(out: Vec3, a: Vec3): Vec3` — Calculates a normalized perpendicular vector to the given vector.
- `vec3.lerp(out: Vec3, a: Vec3, b: Vec3, t: number): Vec3` — Performs a linear interpolation between two vec3's
- `vec3.lagrange(out: Vec3, a: Vec3, b: Vec3, c: Vec3, t: number): Vec3` — Quadratic interpolation through three vectors using Lagrange interpolation.
- `vec3.slerp(out: Vec3, a: Vec3, b: Vec3, t: number): Vec3` — Performs a spherical linear interpolation between two vec3's
- `vec3.hermite(out: Vec3, a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3` — Performs a hermite interpolation with two control points
- `vec3.bezier(out: Vec3, a: Vec3, b: Vec3, c: Vec3, d: Vec3, t: number): Vec3` — Performs a bezier interpolation with two control points
- `vec3.signedAngle(a: Vec3, b: Vec3, axis: Vec3): number` — Get the signed angle from `a` to `b` measured about `axis`, in the range (-PI, PI].

**Transform**

- `vec3.transformMat4(out: Vec3, a: Vec3, m: Mat4): Vec3` — Transforms the vec3 with a mat4.
- `vec3.transformMat3(out: Vec3, a: Vec3, m: Mat3): Vec3` — Transforms the vec3 with a mat3.
- `vec3.transformQuat(out: Vec3, a: Vec3, q: Quat): Vec3` — Transforms the vec3 with a quat
- `vec3.rotateX(out: Vec3, a: Vec3, b: Vec3, rad: number): Vec3` — Rotate a 3D vector around the x-axis
- `vec3.rotateY(out: Vec3, a: Vec3, b: Vec3, rad: number): Vec3` — Rotate a 3D vector around the y-axis
- `vec3.rotateZ(out: Vec3, a: Vec3, b: Vec3, rad: number): Vec3` — Rotate a 3D vector around the z-axis
- `vec3.rotateTowards(out: Vec3, from: Vec3, to: Vec3, maxAngle: number): Vec3` — Rotates the unit vector `from` toward the unit vector `to` by at most `maxAngle` radians.

**Query**

- `vec3.angle(a: Vec3, b: Vec3): number` — Get the angle between two 3D vectors
- `vec3.exactEquals(a: Vec3, b: Vec3): boolean` — Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
- `vec3.equals(a: Vec3, b: Vec3): boolean` — Returns whether or not the vectors have approximately the same elements in the same position.
- `vec3.finite(a: Vec3): boolean` — Returns whether or not the vector is finite
- `vec3.isScaleInsideOut(scale: Vec3): boolean` — Determines if a scale vector represents an inside-out transformation (reflection)

**Aliases**

- `vec3.sub = subtract` — Alias for `subtract`
- `vec3.mul = multiply` — Alias for `multiply`
- `vec3.div = divide` — Alias for `divide`
- `vec3.dist = distance` — Alias for `distance`
- `vec3.sqrDist = squaredDistance` — Alias for `squaredDistance`
- `vec3.len = length` — Alias for `length`
- `vec3.sqrLen = squaredLength` — Alias for `squaredLength`

<a id="api-math-vec4"></a>

### `vec4`

```ts
import { vec4 } from 'math';
```

**Create**

- `vec4.create(): Vec4` — Creates a new, empty vec4
- `vec4.clone(a: Vec4): Vec4` — Creates a new vec4 initialized with values from an existing vector
- `vec4.fromValues(x: number, y: number, z: number, w: number): Vec4` — Creates a new vec4 initialized with the given values
- `vec4.copy(out: Vec4, a: Vec4): Vec4` — Copy the values from one vec4 to another
- `vec4.set(out: Vec4, x: number, y: number, z: number, w: number): Vec4` — Set the components of a vec4 to the given values
- `vec4.fromBuffer(out: Vec4, buffer: ArrayLike<number>, startIndex: number): Vec4` — Sets the components of a vec4 from a buffer
- `vec4.toBuffer(outBuffer: MutableArrayLike<number>, vec: Vec4, startIndex: number): MutableArrayLike<number>` — Writes the components of a vec4 to a buffer
- `vec4.zero(out: Vec4): Vec4` — Set the components of a vec4 to zero
- `vec4.str(a: Vec4): string` — Returns a string representation of a vector

**Operations**

- `vec4.add(out: Vec4, a: Vec4, b: Vec4): Vec4` — Adds two vec4's
- `vec4.subtract(out: Vec4, a: Vec4, b: Vec4): Vec4` — Subtracts vector b from vector a
- `vec4.multiply(out: Vec4, a: Vec4, b: Vec4): Vec4` — Multiplies two vec4's
- `vec4.divide(out: Vec4, a: Vec4, b: Vec4): Vec4` — Divides two vec4's
- `vec4.ceil(out: Vec4, a: Vec4): Vec4` — Math.ceil the components of a vec4
- `vec4.floor(out: Vec4, a: Vec4): Vec4` — Math.floor the components of a vec4
- `vec4.min(out: Vec4, a: Vec4, b: Vec4): Vec4` — Returns the minimum of two vec4's
- `vec4.max(out: Vec4, a: Vec4, b: Vec4): Vec4` — Returns the maximum of two vec4's
- `vec4.round(out: Vec4, a: Vec4): Vec4` — symmetric round the components of a vec4
- `vec4.scale(out: Vec4, a: Vec4, b: number): Vec4` — Scales a vec4 by a scalar number
- `vec4.scaleAndAdd(out: Vec4, a: Vec4, b: Vec4, scale: number): Vec4` — Adds two vec4's after scaling the second operand by a scalar value
- `vec4.distance(a: Vec4, b: Vec4): number` — Calculates the euclidian distance between two vec4's
- `vec4.squaredDistance(a: Vec4, b: Vec4): number` — Calculates the squared euclidian distance between two vec4's
- `vec4.length(a: Vec4): number` — Calculates the length of a vec4
- `vec4.squaredLength(a: Vec4): number` — Calculates the squared length of a vec4
- `vec4.negate(out: Vec4, a: Vec4): Vec4` — Negates the components of a vec4
- `vec4.inverse(out: Vec4, a: Vec4): Vec4` — Returns the inverse of the components of a vec4
- `vec4.normalize(out: Vec4, a: Vec4): Vec4` — Normalize a vec4
- `vec4.dot(a: Vec4, b: Vec4): number` — Calculates the dot product of two vec4's
- `vec4.cross(out: Vec4, u: Vec4, v: Vec4, w: Vec4): Vec4` — Returns the cross-product of three vectors in a 4-dimensional space
- `vec4.lerp(out: Vec4, a: Vec4, b: Vec4, t: number): Vec4` — Performs a linear interpolation between two vec4's
- `vec4.lagrange(out: Vec4, a: Vec4, b: Vec4, c: Vec4, t: number): Vec4` — Quadratic interpolation through three vectors using Lagrange interpolation.

**Transform**

- `vec4.transformMat4(out: Vec4, a: Vec4, m: Mat4): Vec4` — Transforms the vec4 with a mat4.
- `vec4.transformQuat(out: Vec4, a: Vec4, q: Quat): Vec4` — Transforms the vec4 with a quat

**Query**

- `vec4.exactEquals(a: Vec4, b: Vec4): boolean` — Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
- `vec4.equals(a: Vec4, b: Vec4): boolean` — Returns whether or not the vectors have approximately the same elements in the same position.
- `vec4.finite(a: Vec4): boolean` — Returns whether or not the vector is finite

**Aliases**

- `vec4.sub = subtract` — Alias for `subtract`
- `vec4.mul = multiply` — Alias for `multiply`
- `vec4.div = divide` — Alias for `divide`
- `vec4.dist = distance` — Alias for `distance`
- `vec4.sqrDist = squaredDistance` — Alias for `squaredDistance`
- `vec4.len = length` — Alias for `length`
- `vec4.sqrLen = squaredLength` — Alias for `squaredLength`

<a id="api-math-euler"></a>

### `euler`

```ts
import { euler } from 'math';
```

**Create**

- `euler.create(): Euler` — Creates a new Euler with default values (0, 0, 0, 'xyz').
- `euler.fromValues(x: number, y: number, z: number, order: EulerOrder): Euler` — Creates a new Euler from the given values.
- `euler.set(out: Euler, x: number, y: number, z: number, order: EulerOrder): Euler` — Sets a given Euler from the given values.
- `euler.fromDegrees(out: Euler, x: number, y: number, z: number, order: EulerOrder): Euler` — Sets Euler angle radians from given degrees
- `euler.fromRotationMat4(out: Euler, rotationMatrix: Mat4, order: EulerOrder = out[3] || 'xyz'): Euler` — Sets the Euler angles from a rotation matrix.
- `euler.fromQuat(out: Euler, q: Quat, order: EulerOrder): Euler` — Sets the Euler angles from a quaternion.
- `euler.reorder(out: Euler, a: Euler, order: EulerOrder): Euler` — Reorders the Euler based on the specified order.

**Query**

- `euler.exactEquals(a: Euler, b: Euler): boolean` — Returns whether or not the euler angles have exactly the same elements in the same position (when compared with ===)
- `euler.equals(a: Euler, b: Euler): boolean` — Returns whether or not the euler angles have approximately the same elements in the same position.

<a id="api-math-quat"></a>

### `quat`

```ts
import { quat } from 'math';
```

**Create**

- `quat.create(): Quat` — Creates a new identity quat
- `quat.fromBuffer(out: Quat, buffer: ArrayLike<number>, startIndex: number): Quat` — Sets the components of a quat from a buffer
- `quat.toBuffer(outBuffer: MutableArrayLike<number>, q: Quat, startIndex: number): MutableArrayLike<number>` — Writes the components of a quat to a buffer
- `quat.identity(out: Quat): Quat` — Set a quat to the identity quaternion
- `quat.setAxisAngle(out: Quat, axis: Vec3, rad: number): Quat` — Sets a quat from the given angle and rotation axis
- `quat.calculateW(out: Quat, a: Quat): Quat` — Calculates the W component of a quat from the X, Y, and Z components.
- `quat.fromMat3(out: Quat, m: Mat3): Quat` — Creates a quaternion from the given 3x3 rotation matrix.
- `quat.fromMat4(out: Quat, m: Mat4): Quat` — Calculates a quaternion from a 4x4 rotation matrix
- `quat.fromEuler(out: Quat, euler: Euler): Quat` — Creates a quaternion from the given euler
- `quat.fromDegrees(out: Quat, x: number, y: number, z: number, order: EulerOrder): Quat` — Creates a quaternion from euler angles specified in degrees.
- `quat.str(a: Quat): string` — Returns a string representation of a quaternion
- `quat.clone` — Creates a new quat initialized with values from an existing quaternion
- `quat.fromValues` — Creates a new quat initialized with the given values
- `quat.copy` — Copy the values from one quat to another
- `quat.set` — Set the components of a quat to the given values
- `quat.setAxes` — Sets the specified quaternion with values corresponding to the given

**Operations**

- `quat.multiply(out: Quat, a: Quat, b: Quat): Quat` — Multiplies two quat's
- `quat.exp(out: Quat, a: Quat): Quat` — Calculate the exponential of a unit quaternion.
- `quat.ln(out: Quat, a: Quat): Quat` — Calculate the natural logarithm of a unit quaternion.
- `quat.pow(out: Quat, a: Quat, b: number): Quat` — Calculate the scalar power of a unit quaternion.
- `quat.slerp(out: Quat, a: Quat, b: Quat, t: number): Quat` — Performs a spherical linear interpolation between two quat
- `quat.invert(out: Quat, a: Quat): Quat` — Calculates the inverse of a quat
- `quat.conjugate(out: Quat, a: Quat): Quat` — Calculates the conjugate of a quat
- `quat.add` — Adds two quat's
- `quat.scale` — Scales a quat by a scalar number
- `quat.dot` — Calculates the dot product of two quat's
- `quat.lerp` — Performs a linear interpolation between two quat's
- `quat.length` — Calculates the length of a quat
- `quat.squaredLength` — Calculates the squared length of a quat
- `quat.normalize` — Normalize a quat
- `quat.rotationTo` — Sets a quaternion to represent the shortest rotation from one
- `quat.sqlerp` — Performs a spherical linear interpolation with two control points

**Transform**

- `quat.rotateX(out: Quat, a: Quat, rad: number): Quat` — Rotates a quaternion by the given angle about the X axis
- `quat.rotateY(out: Quat, a: Quat, rad: number): Quat` — Rotates a quaternion by the given angle about the Y axis
- `quat.rotateZ(out: Quat, a: Quat, rad: number): Quat` — Rotates a quaternion by the given angle about the Z axis

**Query**

- `quat.getAxisAngle(out_axis: Vec3, q: Quat): number` — Gets the rotation axis and angle for a given
- `quat.getAngle(a: Quat, b: Quat): number` — Gets the angular distance between two unit quaternions
- `quat.exactEquals` — Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
- `quat.equals(a: Quat, b: Quat): boolean` — Returns whether or not the quaternions have approximately the same elements in the same position.

**Aliases**

- `quat.len = length` — Alias for `length`
- `quat.sqrLen = squaredLength` — Alias for `squaredLength`
- `quat.mul = multiply` — Alias for `multiply`

<a id="api-math-quat2"></a>

### `quat2`

```ts
import { quat2 } from 'math';
```

**Create**

- `quat2.create(): Quat2` — Creates a new identity dual quat
- `quat2.clone(a: Quat2): Quat2` — Creates a new quat initialized with values from an existing quaternion
- `quat2.fromValues(x1: number, y1: number, z1: number, w1: number, x2: number, y2: number, z2: number, w2: number): Quat2` — Creates a new dual quat initialized with the given values
- `quat2.fromRotationTranslationValues(x1: number, y1: number, z1: number, w1: number, x2: number, y2: number, z2: number): Quat2` — Creates a new dual quat from the given values (quat and translation)
- `quat2.fromRotationTranslation(out: Quat2, q: Quat, t: Vec3): Quat2` — Creates a dual quat from a quaternion and a translation
- `quat2.fromTranslation(out: Quat2, t: Vec3): Quat2` — Creates a dual quat from a translation
- `quat2.fromRotation(out: Quat2, q: Quat): Quat2` — Creates a dual quat from a quaternion
- `quat2.fromMat4(out: Quat2, a: Mat4): Quat2` — Creates a new dual quat from a matrix (4x4)
- `quat2.copy(out: Quat2, a: Quat2): Quat2` — Copy the values from one dual quat to another
- `quat2.identity(out: Quat2): Quat2` — Set a dual quat to the identity dual quaternion
- `quat2.set(out: Quat2, x1: number, y1: number, z1: number, w1: number, x2: number, y2: number, z2: number, w2: number): Quat2` — Set the components of a dual quat to the given values
- `quat2.setReal(out: Quat2, q: Quat): Quat2` — Set the real component of a dual quat to the given quaternion
- `quat2.setDual(out: Quat2, q: Quat): Quat2` — Set the dual component of a dual quat to the given quaternion
- `quat2.str(a: Quat2): string` — Returns a string representation of a dual quaternion

**Operations**

- `quat2.add(out: Quat2, a: Quat2, b: Quat2): Quat2` — Adds two dual quat's
- `quat2.multiply(out: Quat2, a: Quat2, b: Quat2): Quat2` — Multiplies two dual quat's
- `quat2.scale(out: Quat2, a: Quat2, b: number): Quat2` — Scales a dual quat by a scalar number
- `quat2.dot(a: Quat2, b: Quat2): number` — Calculates the dot product of two dual quat's (The dot product of the real parts)
- `quat2.lerp(out: Quat2, a: Quat2, b: Quat2, t: number): Quat2` — Performs a linear interpolation between two dual quats's
- `quat2.invert(out: Quat2, a: Quat2): Quat2` — Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper
- `quat2.conjugate(out: Quat2, a: Quat2): Quat2` — Calculates the conjugate of a dual quat
- `quat2.length(a: Quat2): number` — Calculates the length of a dual quat (the length of its real/rotation part)
- `quat2.squaredLength(a: Quat2): number` — Calculates the squared length of a dual quat (the squared length of its real/rotation part)
- `quat2.normalize(out: Quat2, a: Quat2): Quat2` — Normalize a dual quat

**Transform**

- `quat2.translate(out: Quat2, a: Quat2, v: Vec3): Quat2` — Translates a dual quat by the given vector
- `quat2.rotateX(out: Quat2, a: Quat2, rad: number): Quat2` — Rotates a dual quat around the X axis
- `quat2.rotateY(out: Quat2, a: Quat2, rad: number): Quat2` — Rotates a dual quat around the Y axis
- `quat2.rotateZ(out: Quat2, a: Quat2, rad: number): Quat2` — Rotates a dual quat around the Z axis
- `quat2.rotateByQuatAppend(out: Quat2, a: Quat2, q: Quat): Quat2` — Rotates a dual quat by a given quaternion (a * q)
- `quat2.rotateByQuatPrepend(out: Quat2, q: Quat, a: Quat2): Quat2` — Rotates a dual quat by a given quaternion (q * a)
- `quat2.rotateAroundAxis(out: Quat2, a: Quat2, axis: Vec3, rad: number): Quat2` — Rotates a dual quat around a given axis. Does the normalisation automatically

**Query**

- `quat2.getReal(out: Quat, a: Quat2): Quat` — Gets the real part of a dual quat
- `quat2.getDual(out: Quat, a: Quat2): Quat` — Gets the dual part of a dual quat
- `quat2.getTranslation(out: Vec3, a: Quat2): Vec3` — Gets the translation of a normalized dual quat
- `quat2.exactEquals(a: Quat2, b: Quat2): boolean` — Returns whether or not the dual quaternions have exactly the same elements in the same position (when compared with ===)
- `quat2.equals(a: Quat2, b: Quat2): boolean` — Returns whether or not the dual quaternions have approximately the same elements in the same position.

**Aliases**

- `quat2.mul = multiply` — Alias for `multiply`
- `quat2.len = length` — Alias for `length`
- `quat2.sqrLen = squaredLength` — Alias for `squaredLength`

<a id="api-math-mat2"></a>

### `mat2`

```ts
import { mat2 } from 'math';
```

**Create**

- `mat2.create(): Mat2` — Creates a new identity mat2
- `mat2.clone(a: Mat2): Mat2` — Creates a new mat2 initialized with values from an existing matrix
- `mat2.copy(out: Mat2, a: Mat2): Mat2` — Copy the values from one mat2 to another
- `mat2.identity(out: Mat2): Mat2` — Set a mat2 to the identity matrix
- `mat2.fromValues(m00: number, m01: number, m10: number, m11: number): Mat2` — Create a new mat2 with the given values
- `mat2.set(out: Mat2, m00: number, m01: number, m10: number, m11: number): Mat2` — Set the components of a mat2 to the given values
- `mat2.fromRotation(out: Mat2, rad: number): Mat2` — Creates a matrix from a given angle
- `mat2.fromScaling(out: Mat2, v: Vec2): Mat2` — Creates a matrix from a vector scaling
- `mat2.str(a: Mat2): string` — Returns a string representation of a mat2

**Operations**

- `mat2.transpose(out: Mat2, a: Mat2): Mat2` — Transpose the values of a mat2
- `mat2.invert(out: Mat2, a: Mat2): Mat2 | null` — Inverts a mat2
- `mat2.adjoint(out: Mat2, a: Mat2): Mat2` — Calculates the adjugate of a mat2
- `mat2.determinant(a: Mat2): number` — Calculates the determinant of a mat2
- `mat2.multiply(out: Mat2, a: Mat2, b: Mat2): Mat2` — Multiplies two mat2's
- `mat2.frob(a: Mat2): number` — Returns Frobenius norm of a mat2
- `mat2.LDU(L: Mat2, D: Mat2, U: Mat2, a: Mat2): [ Mat2, Mat2, Mat2 ]` — Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
- `mat2.add(out: Mat2, a: Mat2, b: Mat2): Mat2` — Adds two mat2's
- `mat2.subtract(out: Mat2, a: Mat2, b: Mat2): Mat2` — Subtracts matrix b from matrix a
- `mat2.multiplyScalar(out: Mat2, a: Mat2, b: number): Mat2` — Multiply each element of the matrix by a scalar.
- `mat2.multiplyScalarAndAdd(out: Mat2, a: Mat2, b: Mat2, scale: number): Mat2` — Adds two mat2's after multiplying each element of the second operand by a scalar value.

**Transform**

- `mat2.rotate(out: Mat2, a: Mat2, rad: number): Mat2` — Rotates a mat2 by the given angle
- `mat2.scale(out: Mat2, a: Mat2, v: Vec2): Mat2` — Scales the mat2 by the dimensions in the given vec2

**Query**

- `mat2.exactEquals(a: Mat2, b: Mat2): boolean` — Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
- `mat2.equals(a: Mat2, b: Mat2): boolean` — Returns whether or not the matrices have approximately the same elements in the same position.

**Aliases**

- `mat2.mul = multiply` — Alias for `multiply`
- `mat2.sub = subtract` — Alias for `subtract`

<a id="api-math-mat2d"></a>

### `mat2d`

```ts
import { mat2d } from 'math';
```

**Create**

- `mat2d.create(): Mat2d` — Creates a new identity mat2d
- `mat2d.clone(a: Mat2d): Mat2d` — Creates a new mat2d initialized with values from an existing matrix
- `mat2d.copy(out: Mat2d, a: Mat2d): Mat2d` — Copy the values from one mat2d to another
- `mat2d.identity(out: Mat2d): Mat2d` — Set a mat2d to the identity matrix
- `mat2d.fromValues(a: number, b: number, c: number, d: number, tx: number, ty: number): Mat2d` — Create a new mat2d with the given values
- `mat2d.set(out: Mat2d, a: number, b: number, c: number, d: number, tx: number, ty: number): Mat2d` — Set the components of a mat2d to the given values
- `mat2d.fromRotation(out: Mat2d, rad: number): Mat2d` — Creates a matrix from a given angle
- `mat2d.fromScaling(out: Mat2d, v: Vec2): Mat2d` — Creates a matrix from a vector scaling
- `mat2d.fromTranslation(out: Mat2d, v: Vec2): Mat2d` — Creates a matrix from a vector translation
- `mat2d.str(a: Mat2d): string` — Returns a string representation of a mat2d

**Operations**

- `mat2d.invert(out: Mat2d, a: Mat2d): Mat2d | null` — Inverts a mat2d
- `mat2d.determinant(a: Mat2d): number` — Calculates the determinant of a mat2d
- `mat2d.multiply(out: Mat2d, a: Mat2d, b: Mat2d): Mat2d` — Multiplies two mat2d's
- `mat2d.frob(a: Mat2d): number` — Returns Frobenius norm of a mat2d
- `mat2d.add(out: Mat2d, a: Mat2d, b: Mat2d): Mat2d` — Adds two mat2d's
- `mat2d.subtract(out: Mat2d, a: Mat2d, b: Mat2d): Mat2d` — Subtracts matrix b from matrix a
- `mat2d.multiplyScalar(out: Mat2d, a: Mat2d, b: number): Mat2d` — Multiply each element of the matrix by a scalar.
- `mat2d.multiplyScalarAndAdd(out: Mat2d, a: Mat2d, b: Mat2d, scale: number): Mat2d` — Adds two mat2d's after multiplying each element of the second operand by a scalar value.

**Transform**

- `mat2d.rotate(out: Mat2d, a: Mat2d, rad: number): Mat2d` — Rotates a mat2d by the given angle
- `mat2d.scale(out: Mat2d, a: Mat2d, v: Vec2): Mat2d` — Scales the mat2d by the dimensions in the given vec2
- `mat2d.translate(out: Mat2d, a: Mat2d, v: Vec2): Mat2d` — Translates the mat2d by the dimensions in the given vec2

**Query**

- `mat2d.exactEquals(a: Mat2d, b: Mat2d): boolean` — Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
- `mat2d.equals(a: Mat2d, b: Mat2d): boolean` — Returns whether or not the matrices have approximately the same elements in the same position.

**Aliases**

- `mat2d.mul = multiply` — Alias for `multiply`
- `mat2d.sub = subtract` — Alias for `subtract`

<a id="api-math-mat3"></a>

### `mat3`

```ts
import { mat3 } from 'math';
```

**Create**

- `mat3.create(): Mat3` — Creates a new identity mat3
- `mat3.fromMat4(out: Mat3, a: Mat4): Mat3` — Copies the upper-left 3x3 values into the given mat3.
- `mat3.clone(a: Mat3): Mat3` — Creates a new mat3 initialized with values from an existing matrix
- `mat3.copy(out: Mat3, a: Mat3): Mat3` — Copy the values from one mat3 to another
- `mat3.fromValues(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): Mat3` — Create a new mat3 with the given values
- `mat3.set(out: Mat3, m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): Mat3` — Set the components of a mat3 to the given values
- `mat3.identity(out: Mat3): Mat3` — Set a mat3 to the identity matrix
- `mat3.zero(out: Mat3): Mat3` — Set a mat3 to the zero matrix
- `mat3.fromTranslation(out: Mat3, v: Vec2): Mat3` — Creates a matrix from a vector translation
- `mat3.fromRotation(out: Mat3, rad: number): Mat3` — Creates a matrix from a given angle
- `mat3.fromScaling(out: Mat3, v: Vec2): Mat3` — Creates a matrix from a vector scaling
- `mat3.fromMat2d(out: Mat3, a: Mat2d): Mat3` — Copies the values from a mat2d into a mat3
- `mat3.fromQuat(out: Mat3, q: Quat): Mat3` — Calculates a 3x3 matrix from the given quaternion
- `mat3.projection(out: Mat3, width: number, height: number): Mat3` — Generates a 2D projection matrix with the given bounds
- `mat3.str(a: Mat3): string` — Returns a string representation of a mat3

**Operations**

- `mat3.transpose(out: Mat3, a: Mat3): Mat3` — Transpose the values of a mat3
- `mat3.invert(out: Mat3, a: Mat3): Mat3 | null` — Inverts a mat3
- `mat3.adjoint(out: Mat3, a: Mat3): Mat3` — Calculates the adjugate of a mat3
- `mat3.determinant(a: Mat3): number` — Calculates the determinant of a mat3
- `mat3.multiply(out: Mat3, a: Mat3, b: Mat3): Mat3` — Multiplies two mat3's
- `mat3.normalFromMat4(out: Mat3, a: Mat4): Mat3 | null` — Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
- `mat3.frob(a: Mat3): number` — Returns Frobenius norm of a mat3
- `mat3.add(out: Mat3, a: Mat3, b: Mat3): Mat3` — Adds two mat3's
- `mat3.subtract(out: Mat3, a: Mat3, b: Mat3): Mat3` — Subtracts matrix b from matrix a
- `mat3.multiplyScalar(out: Mat3, a: Mat3, b: number): Mat3` — Multiply each element of the matrix by a scalar.
- `mat3.multiplyScalarAndAdd(out: Mat3, a: Mat3, b: Mat3, scale: number): Mat3` — Adds two mat3's after multiplying each element of the second operand by a scalar value.

**Transform**

- `mat3.translate(out: Mat3, a: Mat3, v: Vec2): Mat3` — Translate a mat3 by the given vector
- `mat3.rotate(out: Mat3, a: Mat3, rad: number): Mat3` — Rotates a mat3 by the given angle
- `mat3.scale(out: Mat3, a: Mat3, v: Vec2): Mat3` — Scales the mat3 by the dimensions in the given vec2

**Query**

- `mat3.exactEquals(a: Mat3, b: Mat3): boolean` — Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
- `mat3.equals(a: Mat3, b: Mat3): boolean` — Returns whether or not the matrices have approximately the same elements in the same position.

**Aliases**

- `mat3.mul = multiply` — Alias for `multiply`
- `mat3.sub = subtract` — Alias for `subtract`

<a id="api-math-mat4"></a>

### `mat4`

```ts
import { mat4 } from 'math';
```

**Create**

- `mat4.create(): Mat4` — Creates a new identity mat4
- `mat4.clone(a: Mat4): Mat4` — Creates a new mat4 initialized with values from an existing matrix
- `mat4.copy(out: Mat4, a: Mat4): Mat4` — Copy the values from one mat4 to another
- `mat4.fromValues(m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): Mat4` — Create a new mat4 with the given values
- `mat4.set(out: Mat4, m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): Mat4` — Set the components of a mat4 to the given values
- `mat4.identity(out: Mat4): Mat4` — Set a mat4 to the identity matrix
- `mat4.zero(out: Mat4): Mat4` — Set a mat4 to the zero matrix
- `mat4.fromTranslation(out: Mat4, v: Vec3): Mat4` — Creates a matrix from a vector translation
- `mat4.fromScaling(out: Mat4, v: Vec3): Mat4` — Creates a matrix from a vector scaling
- `mat4.fromRotation(out: Mat4, rad: number, axis: Vec3): Mat4 | null` — Creates a matrix from a given angle around a given axis
- `mat4.fromXRotation(out: Mat4, rad: number): Mat4` — Creates a matrix from the given angle around the X axis
- `mat4.fromYRotation(out: Mat4, rad: number): Mat4` — Creates a matrix from the given angle around the Y axis
- `mat4.fromZRotation(out: Mat4, rad: number): Mat4` — Creates a matrix from the given angle around the Z axis
- `mat4.fromRotationTranslation(out: Mat4, q: Quat | Quat2, v: Vec3): Mat4` — Creates a matrix from a quaternion rotation and vector translation
- `mat4.fromQuat2(out: Mat4, a: Quat2): Mat4` — Creates a new mat4 from a dual quat.
- `mat4.fromRotationTranslationScale(out: Mat4, q: Quat, v: Vec3, s: Vec3): Mat4` — Creates a matrix from a quaternion rotation, vector translation and vector scale
- `mat4.fromRotationTranslationScaleOrigin(out: Mat4, q: Quat, v: Vec3, s: Vec3, o: Vec3): Mat4` — Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
- `mat4.fromQuat(out: Mat4, q: Quat): Mat4` — Calculates a 4x4 matrix from the given quaternion
- `mat4.frustumNO(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4` — Generates a frustum matrix with the given bounds.
- `mat4.frustumZO(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4` — Generates a frustum matrix with the given bounds, suitable for WebGPU.
- `mat4.perspectiveNO(out: Mat4, fovy: number, aspect: number, near: number, far: number): Mat4` — Generates a perspective projection matrix with the given bounds.
- `mat4.perspectiveZO(out: Mat4, fovy: number, aspect: number, near: number, far: number): Mat4` — Generates a perspective projection matrix suitable for WebGPU with the given bounds.
- `mat4.perspectiveFromFieldOfViewNO(out: Mat4, fov: { upDegrees: number; downDegrees: number; leftDegrees: number; rightDegrees: number; }, near: number, far: number): Mat4` — Generates a perspective projection matrix with the given field of view.
- `mat4.perspectiveFromFieldOfViewZO(out: Mat4, fov: { upDegrees: number; downDegrees: number; leftDegrees: number; rightDegrees: number; }, near: number, far: number): Mat4` — Generates a perspective projection matrix with the given field of view, suitable for WebGPU.
- `mat4.orthoNO(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4` — Generates a orthogonal projection matrix with the given bounds.
- `mat4.orthoZO(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4` — Generates a orthogonal projection matrix with the given bounds.
- `mat4.lookAt(out: Mat4, eye: Vec3, center: Vec3, up: Vec3): Mat4` — Generates a look-at matrix with the given eye position, focal point, and up axis.
- `mat4.targetTo(out: Mat4, eye: Vec3, target: Vec3, up: Vec3): Mat4` — Generates a matrix that makes something look at something else.
- `mat4.str(a: Mat4): string` — Returns a string representation of a mat4

**Operations**

- `mat4.transpose(out: Mat4, a: Mat4): Mat4` — Transpose the values of a mat4
- `mat4.invert(out: Mat4, a: Mat4): Mat4 | null` — Inverts a mat4
- `mat4.invert3x3(out: Mat4, a: Mat4): Mat4 | null` — Inverts only the 3x3 rotation part of a mat4.
- `mat4.adjoint(out: Mat4, a: Mat4): Mat4` — Calculates the adjugate of a mat4
- `mat4.determinant(a: Mat4): number` — Calculates the determinant of a mat4
- `mat4.multiply(out: Mat4, a: Mat4, b: Mat4): Mat4` — Multiplies two mat4s
- `mat4.multiply3x3(out: Mat4, a: Mat4, b: Mat4): Mat4` — Multiplies two mat4s treating them as 3x3 rotation matrices.
- `mat4.multiply3x3RightTransposed(out: Mat4, a: Mat4, b: Mat4): Mat4` — Multiplies a mat4 by the transpose of another mat4
- `mat4.multiply3x3TransposedVec(out: Vec3, mat: Mat4, vec: Vec3): Vec3` — Transform a Vec3 by the transpose of the 3x3 rotation part.
- `mat4.multiply3x3Vec(out: Vec3, mat: Mat4, vec: Vec3): Vec3` — Transform a Vec3 by only the 3x3 rotation part of a Mat4.
- `mat4.decompose(out_r: Quat, out_t: Vec3, out_s: Vec3, mat: Mat4): Quat` — Decomposes a transformation matrix into its rotation, translation
- `mat4.frob(a: Mat4): number` — Returns Frobenius norm of a mat4
- `mat4.add(out: Mat4, a: Mat4, b: Mat4): Mat4` — Adds two mat4's
- `mat4.subtract(out: Mat4, a: Mat4, b: Mat4): Mat4` — Subtracts matrix b from matrix a
- `mat4.multiplyScalar(out: Mat4, a: Mat4, b: number): Mat4` — Multiply each element of the matrix by a scalar.
- `mat4.multiplyScalarAndAdd(out: Mat4, a: Mat4, b: Mat4, scale: number): Mat4` — Adds two mat4's after multiplying each element of the second operand by a scalar value.

**Transform**

- `mat4.crossProductMatrix(out: Mat4, v: Vec3): Mat4` — Cross product matrix (skew-symmetric matrix).
- `mat4.translate(out: Mat4, a: Mat4, v: Vec3): Mat4` — Translate a mat4 by the given vector
- `mat4.scale(out: Mat4, a: Mat4, v: Vec3): Mat4` — Scales the mat4 by the dimensions in the given vec3 not using vectorization
- `mat4.rotate(out: Mat4, a: Mat4, rad: number, axis: Vec3): Mat4 | null` — Rotates a mat4 by the given angle around the given axis
- `mat4.rotateX(out: Mat4, a: Mat4, rad: number): Mat4` — Rotates a matrix by the given angle around the X axis
- `mat4.rotateY(out: Mat4, a: Mat4, rad: number): Mat4` — Rotates a matrix by the given angle around the Y axis
- `mat4.rotateZ(out: Mat4, a: Mat4, rad: number): Mat4` — Rotates a matrix by the given angle around the Z axis

**Query**

- `mat4.getTranslation(out: Vec3, mat: Mat4): Vec3` — Returns the translation vector component of a transformation
- `mat4.getScaling(out: Vec3, mat: Mat4): Vec3` — Returns the scaling factor component of a transformation
- `mat4.getRotation(out: Quat, mat: Mat4): Quat` — Returns a quaternion representing the rotational component
- `mat4.exactEquals(a: Mat4, b: Mat4): boolean` — Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
- `mat4.equals(a: Mat4, b: Mat4): boolean` — Returns whether or not the matrices have approximately the same elements in the same position.

**Aliases**

- `mat4.mul = multiply` — Alias for `multiply`
- `mat4.sub = subtract` — Alias for `subtract`

<a id="api-math-spherical"></a>

### `spherical`

```ts
import { spherical } from 'math';
```

**Create**

- `spherical.create(): Spherical` — Creates a new spherical coordinate at r=1, theta=0, phi=0
- `spherical.fromValues(r: number, theta: number, phi: number): Spherical` — Creates a new Spherical initialized with the given values
- `spherical.clone(a: Spherical): Spherical` — Creates a new Spherical initialized with values from an existing one
- `spherical.copy(out: Spherical, a: Spherical): Spherical` — Copies values from one Spherical to another
- `spherical.set(out: Spherical, r: number, theta: number, phi: number): Spherical` — Sets the components of a Spherical
- `spherical.setFromVec3(out: Spherical, v: Vec3): Spherical` — Sets a Spherical from Cartesian Vec3 coordinates (Three.js / OpenGL convention)
- `spherical.makeSafe(out: Spherical, a: Spherical): Spherical` — Clamps phi to the range [EPSILON, π - EPSILON] to avoid coordinate
- `spherical.toVec3(out: Vec3, a: Spherical): Vec3` — Converts spherical coordinates to a Cartesian Vec3 (Three.js / OpenGL convention)
- `spherical.fromVec2(out: Spherical, v: Vec2): Spherical` — Converts a Vec2 (x, z) in the horizontal XZ plane to spherical coordinates.
- `spherical.toVec2(out: Vec2, a: Spherical): Vec2` — Projects spherical coordinates onto the XZ plane, returning a Vec2 (x, z).
- `spherical.str(a: Spherical): string` — Returns a string representation of a Spherical

**Operations**

- `spherical.normalize(out: Spherical, a: Spherical): Spherical` — Sets r=1, preserving the angles. No-op if r is already zero.
- `spherical.scale(out: Spherical, a: Spherical, s: number): Spherical` — Scales the radial distance r by a scalar
- `spherical.lerp(out: Spherical, a: Spherical, b: Spherical, t: number): Spherical` — Linearly interpolates between two Spherical coordinates taking the shortest

**Query**

- `spherical.equals(a: Spherical, b: Spherical): boolean` — Returns true if two Spherical coordinates are approximately equal
- `spherical.exactEquals(a: Spherical, b: Spherical): boolean` — Returns true if two Spherical coordinates are exactly equal (===).
- `spherical.angleTo(a: Spherical, b: Spherical): number` — Returns the great-circle angle (in radians) between two spherical coordinates

**Aliases**

- `spherical.fromVec3 = setFromVec3` — Alias for `setFromVec3`

<a id="api-math-polar"></a>

### `polar`

```ts
import { polar } from 'math';
```

**Create**

- `polar.create(): Polar` — Creates a new polar coordinate at r=1, theta=0
- `polar.fromValues(r: number, theta: number): Polar` — Creates a new Polar initialized with the given values
- `polar.clone(a: Polar): Polar` — Creates a new Polar initialized with values from an existing one
- `polar.copy(out: Polar, a: Polar): Polar` — Copies values from one Polar to another
- `polar.set(out: Polar, r: number, theta: number): Polar` — Sets the components of a Polar
- `polar.setFromVec2(out: Polar, v: Vec2): Polar` — Sets a Polar from Cartesian Vec2 coordinates
- `polar.toVec2(out: Vec2, a: Polar): Vec2` — Converts polar coordinates to a Cartesian Vec2
- `polar.str(a: Polar): string` — Returns a string representation of a Polar

**Operations**

- `polar.normalize(out: Polar, a: Polar): Polar` — Sets r=1, preserving the angle. No-op on the angle if r is already zero.
- `polar.scale(out: Polar, a: Polar, s: number): Polar` — Scales the radial distance r by a scalar
- `polar.lerp(out: Polar, a: Polar, b: Polar, t: number): Polar` — Linearly interpolates between two Polar coordinates, taking the shortest
- `polar.distance(a: Polar, b: Polar): number` — Returns the straight-line (chord) distance between two polar coordinates

**Transform**

- `polar.rotate(out: Polar, a: Polar, rad: number): Polar` — Rotates a Polar by an angle (in radians), wrapping theta into (-pi, pi].

**Query**

- `polar.angleTo(a: Polar, b: Polar): number` — Returns the smallest angle (in radians) between two polar directions
- `polar.equals(a: Polar, b: Polar): boolean` — Returns true if two Polar coordinates are approximately equal
- `polar.exactEquals(a: Polar, b: Polar): boolean` — Returns true if two Polar coordinates are exactly equal (===).

**Aliases**

- `polar.fromVec2 = setFromVec2` — Alias for `setFromVec2`

<a id="api-math-shapes"></a>

## `math/shapes`

- `type Box2 = [ minX: number, minY: number, maxX: number, maxY: number ]` — An axis-aligned box in 2D space, as [minX, minY, maxX, maxY]
- `type Box3 = [ minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number ]` — A box in 3D space
- `type OBB3 = { center: Vec3; halfExtents: Vec3; rotation: Mat3; }` — An oriented bounding box in 3D space
- `type Plane3 = { normal: Vec3; constant: number; }` — A plane in 3D space
- `type Sphere = { center: Vec3; radius: number; }` — A sphere in 3D space
- `type Circle = { center: Vec2; radius: number; }` — A circle in 2D space
- `type Frustum = [ Plane3, Plane3, Plane3, Plane3, Plane3, Plane3 ]` — A view frustum, represented as the six bounding planes of a camera's view volume.
- `type FrustumCorners = [ Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3 ]` — The eight corners of a frustum, as returned by corners.

<a id="api-math-shapes-box2"></a>

### `box2`

```ts
import { box2 } from 'math/shapes';
```

**Create**

- `box2.create(): Box2` — Create a new empty Box2 with "min" set to positive infinity and "max" set to negative infinity
- `box2.clone(box: Box2): Box2` — Clones a Box2
- `box2.copy(out: Box2, box: Box2): Box2` — Copies a Box2 to another Box2
- `box2.set(out: Box2, minX: number, minY: number, maxX: number, maxY: number): Box2` — Sets the min and max values of a Box2
- `box2.setFromVectors(out: Box2, min: Vec2, max: Vec2): Box2` — Sets the min and max values of a Box2 from Vec2 vectors
- `box2.setFromCenterAndSize(out: Box2, center: Vec2, size: Vec2): Box2` — Sets the box from a center point and size

**Operations**

- `box2.min(out: Vec2, box: Box2): Vec2` — Extracts the minimum corner of a Box2
- `box2.max(out: Vec2, box: Box2): Vec2` — Extracts the maximum corner of a Box2
- `box2.empty(out: Box2): Box2` — Set a Box2 to empty (min to positive infinity, max to negative infinity)
- `box2.expandByPoint(out: Box2, box: Box2, point: Vec2): Box2` — Expands a Box2 to include a point
- `box2.expandByExtents(out: Box2, box: Box2, vector: Vec2): Box2` — Widens a Box2 by a vector on both sides
- `box2.expandByMargin(out: Box2, box: Box2, margin: number): Box2` — Expands a Box2 uniformly by a scalar margin on all sides
- `box2.union(out: Box2, boxA: Box2, boxB: Box2): Box2` — Computes the union of two bounding boxes
- `box2.center(out: Vec2, box: Box2): Vec2` — Calculate the center point of a bounding box
- `box2.extents(out: Vec2, box: Box2): Vec2` — Calculate the extents (half-size) of a bounding box
- `box2.size(out: Vec2, box: Box2): Vec2` — Calculate the size (dimensions) of a bounding box
- `box2.area(box: Box2): number` — Calculate the area of a bounding box
- `box2.scale(out: Box2, box: Box2, scale: Vec2): Box2` — Scale a bounding box by a vector, handling non-uniform and negative scaling

**Query**

- `box2.exactEquals(a: Box2, b: Box2): boolean` — Returns whether or not the boxes have exactly the same elements in the same position (when compared with ===)
- `box2.equals(a: Box2, b: Box2): boolean` — Returns whether or not the boxes have approximately the same elements in the same position
- `box2.containsPoint(box: Box2, point: Vec2): boolean` — Test if a point is contained within the bounding box
- `box2.containsBox2(container: Box2, contained: Box2): boolean` — Test if one Box2 completely contains another Box2
- `box2.intersectsBox2(boxA: Box2, boxB: Box2): boolean` — Check whether two bounding boxes intersect
- `box2.intersectsCircle(box: Box2, circle: Circle): boolean` — Test intersection between an axis-aligned bounding box and a circle.

<a id="api-math-shapes-box3"></a>

### `box3`

```ts
import { box3 } from 'math/shapes';
```

**Create**

- `box3.create(): Box3` — Create a new empty Box3 with "min" set to positive infinity and "max" set to negative infinity
- `box3.clone(box: Box3): Box3` — Clones a Box3
- `box3.copy(out: Box3, box: Box3): Box3` — Copies a Box3 to another Box3
- `box3.set(out: Box3, minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): Box3` — Sets the min and max values of a Box3
- `box3.setFromVectors(out: Box3, min: Vec3, max: Vec3): Box3` — Sets the min and max values of a Box3 from Vec3 vectors
- `box3.setFromCenterAndSize(out: Box3, center: Vec3, size: Vec3): Box3` — Sets the box from a center point and size

**Operations**

- `box3.min(out: Vec3, box: Box3): Vec3` — Extracts the minimum corner of a Box3
- `box3.max(out: Vec3, box: Box3): Vec3` — Extracts the maximum corner of a Box3
- `box3.empty(out: Box3): Box3` — Set a Box3 to empty (min to positive infinity, max to negative infinity)
- `box3.expandByPoint(out: Box3, box: Box3, point: Vec3): Box3` — Expands a Box3 to include a point
- `box3.expandByExtents(out: Box3, box: Box3, vector: Vec3): Box3` — Widens a Box3 by a vector on both sides
- `box3.expandByMargin(out: Box3, box: Box3, margin: number): Box3` — Expands a Box3 uniformly by a scalar margin on all sides
- `box3.union(out: Box3, boxA: Box3, boxB: Box3): Box3` — Computes the union of two bounding boxes
- `box3.center(out: Vec3, box: Box3): Vec3` — Calculate the center point of a bounding box
- `box3.extents(out: Vec3, box: Box3): Vec3` — Calculate the extents (half-size) of a bounding box
- `box3.size(out: Vec3, box: Box3): Vec3` — Calculate the size (dimensions) of a bounding box
- `box3.surfaceArea(box: Box3): number` — Calculate the surface area of a bounding box
- `box3.scale(out: Box3, box: Box3, scale: Vec3): Box3` — Scale a bounding box by a vector, handling non-uniform and negative scaling

**Transform**

- `box3.transformMat4(out: Box3, box: Box3, mat: Mat4): Box3` — Transform a bounding box by a 4x4 matrix.

**Query**

- `box3.exactEquals(a: Box3, b: Box3): boolean` — Returns whether or not the boxes have exactly the same elements in the same position (when compared with ===)
- `box3.equals(a: Box3, b: Box3): boolean` — Returns whether or not the boxes have approximately the same elements in the same position
- `box3.containsPoint(box: Box3, point: Vec3): boolean` — Test if a point is contained within the bounding box
- `box3.containsBox3(container: Box3, contained: Box3): boolean` — Test if one Box3 completely contains another Box3
- `box3.intersectsBox3(boxA: Box3, boxB: Box3): boolean` — Check whether two bounding boxes intersect
- `box3.intersectsTriangle3(box: Box3, a: Vec3, b: Vec3, c: Vec3): boolean` — Test whether an axis-aligned bounding box intersects a triangle, via the
- `box3.intersectsSphere(box: Box3, sphere: Sphere): boolean` — Test intersection between axis-aligned bounding box and a sphere.
- `box3.intersectsPlane3(box: Box3, plane: Plane3): boolean` — Test intersection between axis-aligned bounding box and plane.

<a id="api-math-shapes-obb3"></a>

### `obb3`

```ts
import { obb3 } from 'math/shapes';
```

**Create**

- `obb3.create(): OBB3`
- `obb3.clone(a: OBB3): OBB3`
- `obb3.copy(out: OBB3, a: OBB3): OBB3`
- `obb3.set(out: OBB3, center: Vec3, halfExtents: Vec3, rotation: Mat3): OBB3` — Sets an OBB from center, half extents, and a rotation matrix.
- `obb3.setFromCenterHalfExtentsQuaternion(out: OBB3, center: Vec3, halfExtents: Vec3, q: Quat): OBB3` — Sets an OBB from center, half extents, and a quaternion.
- `obb3.setFromBox3(out: OBB3, aabb: Box3): OBB3` — Creates an OBB from an axis-aligned bounding box (AABB).

**Operations**

- `obb3.clampPoint(out: Vec3, obb: OBB3, point: Vec3): Vec3` — Clamps a point to the surface or interior of an OBB.

**Transform**

- `obb3.applyMatrix4(out: OBB3, obb: OBB3, matrix: Mat4): OBB3` — Applies a 4x4 transformation matrix to an OBB.

**Query**

- `obb3.containsPoint(obb: OBB3, point: Vec3): boolean` — Tests whether a point is contained within an OBB.
- `obb3.intersectsOBB3(a: OBB3, b: OBB3, epsilon = EPSILON): boolean` — Tests whether an OBB intersects with another OBB using the Separating Axis Theorem.
- `obb3.intersectsBox3(obb: OBB3, aabb: Box3): boolean` — Tests whether an OBB intersects with an AABB.

<a id="api-math-shapes-plane3"></a>

### `plane3`

```ts
import { plane3 } from 'math/shapes';
```

**Create**

- `plane3.create(): Plane3` — Creates a new plane with normal (0, 1, 0) and constant 0
- `plane3.fromNormalAndConstant(out: Plane3, normal: Vec3, constant: number): Plane3` — Creates a plane from a normal and constant
- `plane3.fromNormalAndPoint(out: Plane3, normal: Vec3, point: Vec3): Plane3` — Creates a plane from a normal and a point on the plane
- `plane3.fromCoplanarPoints(out: Plane3, a: Vec3, b: Vec3, c: Vec3): Plane3` — Creates a plane from three coplanar points
- `plane3.clone(plane: Plane3): Plane3` — Clones a plane
- `plane3.copy(out: Plane3, plane: Plane3): Plane3` — Copies one plane to another

**Operations**

- `plane3.normalize(out: Plane3, plane: Plane3): Plane3` — Normalizes a plane (ensures the normal vector is unit length)
- `plane3.negate(out: Plane3, plane: Plane3): Plane3` — Negates a plane (flips the normal and constant)
- `plane3.offset(out: Plane3, plane: Plane3, distance: number): Plane3` — Offsets a plane by a distance along its normal
- `plane3.distanceToPoint(plane: Plane3, point: Vec3): number` — Calculates the signed distance from a point to the plane
- `plane3.projectPoint(out: Vec3, plane: Plane3, point: Vec3): Vec3` — Projects a point onto the plane
- `plane3.intersect(out: Vec3, p1: Plane3, p2: Plane3, p3: Plane3): boolean` — Finds the intersection point of three planes

**Transform**

- `plane3.transform(out: Plane3, plane: Plane3, matrix: Mat4): Plane3` — Transforms a plane by a 4x4 matrix

**Query**

- `plane3.intersectsSphere(plane: Plane3, sphere: Sphere): boolean` — Tests if a sphere intersects the plane
- `plane3.exactEquals(a: Plane3, b: Plane3): boolean` — Tests if two planes are exactly equal
- `plane3.equals(a: Plane3, b: Plane3): boolean` — Tests if two planes are equal

<a id="api-math-shapes-sphere"></a>

### `sphere`

```ts
import { sphere } from 'math/shapes';
```

**Create**

- `sphere.create(): Sphere` — Creates a new sphere with a default center 0,0,0 and radius 1

**Query**

- `sphere.containsPoint(sphere: Sphere, point: Vec3): boolean` — Returns true if a point lies inside (or on the surface of) the sphere.

<a id="api-math-shapes-circle"></a>

### `circle`

```ts
import { circle } from 'math/shapes';
```

- `circle.create(): Circle`

<a id="api-math-shapes-segment2"></a>

### `segment2`

```ts
import { segment2 } from 'math/shapes';
```

- `segment2.closestPoint(out: Vec2, point: Vec2, a: Vec2, b: Vec2): Vec2` — Calculates the closest point on a line segment to a given point
- `segment2.intersects(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean` — Tests whether the two closed segments a-b and c-d intersect. Collinear
- `segment2.intersection(out: Vec2, a: Vec2, b: Vec2, c: Vec2, d: Vec2): Vec2 | null` — Computes the intersection point of the two closed segments a-b and c-d

<a id="api-math-shapes-polygon2"></a>

### `polygon2`

```ts
import { polygon2 } from 'math/shapes';
```

**Operations**

- `polygon2.signedArea(vertices: number[], n: number): number` — Returns the signed area of the polygon using the shoelace formula.
- `polygon2.area(vertices: number[], n: number): number` — Returns the (non-negative) area of the polygon.
- `polygon2.centroid(out: Vec2, vertices: number[], n: number): Vec2` — Computes the area-weighted centroid (center of mass) of the polygon.
- `polygon2.perimeter(vertices: number[], n: number): number` — Returns the perimeter (sum of edge lengths) of the polygon.
- `polygon2.winding(vertices: number[], n: number): number` — Returns the winding order of the polygon from the sign of its signed area
- `polygon2.reverse(out: number[], vertices: number[], n: number): number[]` — Reverses the winding order of the polygon, writing the result into `out`.
- `polygon2.bounds(out: Box2, vertices: number[], n: number): Box2` — Writes the axis-aligned bounding box of the polygon into `out` as a Box2
- `polygon2.closestPoint(out: Vec2, vertices: number[], n: number, point: Vec2): Vec2` — Finds the point on the polygon's boundary closest to `point` and writes it to
- `polygon2.signedDistance(vertices: number[], n: number, point: Vec2): number` — Returns the distance from `point` to the polygon's boundary, signed so that
- `polygon2.overlapConvex(verticesA: number[], numA: number, verticesB: number[], numB: number): boolean` — Tests whether two convex polygons overlap, using the separating axis theorem.

**Query**

- `polygon2.containsPoint(vertices: number[], n: number, point: Vec2): boolean` — Tests whether a point lies inside the polygon. Works for both convex and
- `polygon2.isConvex(vertices: number[], n: number): boolean` — Tests whether the polygon is convex. Works for both winding orders. Assumes a
- `polygon2.isReflexVertex(vertices: number[], n: number, i: number): boolean` — Tests whether vertex `i` is a reflex (concave) vertex of the polygon — the
- `polygon2.intersectsSegment(vertices: number[], n: number, a: Vec2, b: Vec2): boolean` — Tests whether the segment `a`-`b` intersects the polygon, i.e. it has an

<a id="api-math-shapes-triangle2"></a>

### `triangle2`

```ts
import { triangle2 } from 'math/shapes';
```

**Operations**

- `triangle2.signedArea(a: Vec2, b: Vec2, c: Vec2): number` — Returns the signed area of the triangle (a, b, c). The result is positive when
- `triangle2.area(a: Vec2, b: Vec2, c: Vec2): number` — Returns the (non-negative) area of the triangle (a, b, c).
- `triangle2.centroid(out: Vec2, a: Vec2, b: Vec2, c: Vec2): Vec2` — Computes the centroid of the triangle (a, b, c).
- `triangle2.bounds(out: Box2, a: Vec2, b: Vec2, c: Vec2): Box2` — Computes the axis-aligned bounding box of the triangle (a, b, c).

**Query**

- `triangle2.containsPoint(a: Vec2, b: Vec2, c: Vec2, point: Vec2): boolean` — Tests whether a point lies inside the triangle (a, b, c). Works for either

<a id="api-math-shapes-triangle3"></a>

### `triangle3`

```ts
import { triangle3 } from 'math/shapes';
```

- `triangle3.bounds(out: Box3, a: Vec3, b: Vec3, c: Vec3): Box3` — Computes the axis-aligned bounding box of a triangle defined by three vertices.
- `triangle3.normal(out: Vec3, a: Vec3, b: Vec3, c: Vec3): Vec3` — Computes the normal vector of a triangle defined by three vertices.
- `triangle3.centroid(out: Vec3, a: Vec3, b: Vec3, c: Vec3): Vec3` — Computes the centroid of a triangle defined by three vertices.

<a id="api-math-shapes-raycast3"></a>

### `raycast3`

```ts
import { raycast3 } from 'math/shapes';
```

**Types**

- `type IntersectsTriangleResult = { fraction: number; hit: boolean; frontFacing: boolean; }` — Result of a ray-triangle intersection test

**Operations**

- `raycast3.createIntersectsTriangleResult(): IntersectsTriangleResult` — Creates a new IntersectsTriangleResult with default values.

**Query**

- `raycast3.intersectsTriangle(out: IntersectsTriangleResult, origin: Vec3, direction: Vec3, length: number, a: Vec3, b: Vec3, c: Vec3, backfaceCulling: boolean): void` — Ray-triangle intersection test.
- `raycast3.intersectsBox3(origin: Vec3, direction: Vec3, length: number, aabb: Box3): boolean` — Test if a ray intersects an axis-aligned bounding box.

<a id="api-math-shapes-frustum"></a>

### `frustum`

```ts
import { frustum } from 'math/shapes';
```

**Create**

- `frustum.create(): Frustum` — Creates a new frustum of zeroed planes.
- `frustum.clone(f: Frustum): Frustum` — Clones a frustum.
- `frustum.copy(out: Frustum, f: Frustum): Frustum` — Copies one frustum to another.
- `frustum.setFromViewProjectionMatrixNO(out: Frustum, proj: Mat4, view: Mat4): Frustum` — Extracts the six planes of a view frustum from a projection and view matrix, using the
- `frustum.setFromViewProjectionMatrixZO(out: Frustum, proj: Mat4, view: Mat4): Frustum` — Extracts the six planes of a view frustum from a projection and view matrix, using the
- `frustum.setFromViewProjectionMatrixSides(out: Frustum, proj: Mat4, view: Mat4): Frustum` — Extracts only the four lateral planes (left, right, bottom, top) of a view frustum from a

**Operations**

- `frustum.sidesIntersectsSphere(f: Frustum, s: Sphere): boolean` — Tests if a sphere intersects the lateral planes of a sides-only frustum, skipping near and far.
- `frustum.sidesIntersectsBox3(f: Frustum, box: Box3): boolean` — Tests if an axis-aligned box intersects the lateral planes of a sides-only frustum, using the
- `frustum.sidesContainsPoint(f: Frustum, p: Vec3): boolean` — Tests if a point is inside the lateral planes of a sides-only frustum, skipping near and far.
- `frustum.sidesIntersectsRay(f: Frustum, origin: Vec3, direction: Vec3): boolean` — Tests if a ray intersects the lateral planes of a sides-only frustum, using a slab test over the
- `frustum.corners(out: FrustumCorners, f: Frustum): FrustumCorners` — Computes the eight corners of the frustum by intersecting three planes each.

**Query**

- `frustum.intersectsSphere(f: Frustum, s: Sphere): boolean` — Tests if a sphere intersects the frustum.
- `frustum.intersectsBox3(f: Frustum, box: Box3): boolean` — Tests if an axis-aligned box intersects the frustum, using the p-vertex test.
- `frustum.containsPoint(f: Frustum, p: Vec3): boolean` — Tests if a point is inside the frustum.
- `frustum.intersectsRay(f: Frustum, origin: Vec3, direction: Vec3): boolean` — Tests if a ray intersects the frustum, using a slab test over the planes.

<a id="api-math-geometry"></a>

## `math/geometry`

- <a id="circumcircle"></a>`circumcircle(out: Circle, a: Vec2, b: Vec2, c: Vec2): Circle` — Calculates the circumcircle of three points and stores the center in the output parameter.
- <a id="decomposepolygon2quick"></a>`decomposePolygon2Quick(vertices: number[], n: number): number[][]` — Decomposes a simple polygon into convex sub-polygons using Bayazit's fast
- <a id="decomposepolygon2quality"></a>`decomposePolygon2Quality(vertices: number[], n: number): number[][]` — Decomposes a simple polygon into the (near-)minimum number of convex
- <a id="triangulatepolygon2"></a>`triangulatePolygon2(out: number[], vertices: number[], n: number): number` — Triangulates a simple polygon by ear clipping, writing triangle indices into
- <a id="quickhull2"></a>`quickhull2(points: number[]): number[]` — Computes the convex hull of a set of 2D points using the QuickHull algorithm.
- <a id="quickhull3"></a>`quickhull3(points: number[]): number[]` — Computes the convex hull of a set of 3D points using an incremental QuickHull algorithm.

<a id="api-math-time"></a>

## `math/time`

- `type Spring<T> = { value: T; velocity: T; }` — Spring state: a `value` and its `velocity`, of matching rank

<a id="api-math-time-easing"></a>

### `easing`

```ts
import { easing } from 'math/time';
```

- `easing.exp(t: number)`
- `easing.linear(t: number)`
- `easing.sineIn(x: number)`
- `easing.sineOut(x: number)`
- `easing.sineInOut(x: number)`
- `easing.cubicIn(x: number)`
- `easing.cubicOut(x: number)`
- `easing.cubicInOut(x: number)`
- `easing.quintIn(x: number)`
- `easing.quintOut(x: number)`
- `easing.quintInOut(x: number)`
- `easing.circIn(x: number)`
- `easing.circOut(x: number)`
- `easing.circInOut(x: number)`
- `easing.quartIn(t: number)`
- `easing.quartOut(t: number)`
- `easing.quartInOut(t: number)`
- `easing.expoIn(x: number)`
- `easing.expoOut(x: number)`
- `easing.expoInOut(x: number)`
- `easing.rsqw(t: number, delta = 0.01, a = 1, f = 1 / (2 * Math.PI))`

<a id="api-math-time-spring"></a>

### `spring`

```ts
import { spring } from 'math/time';
```

**Create**

- `spring.create(value = 0): Spring<number>` — Creates a scalar spring at `value`, at rest.
- `spring.fromResponse(response: number): number` — Converts a SwiftUI-style `response` — the spring's natural period, in seconds

**Operations**

- `spring.update(state: Spring<number>, target: number, smoothTime: number, dampingRatio: number, delta: number): Spring<number>` — Springs `state.value` toward `target`, mutating `state` in place. Returns it.
- `spring.damp(state: Spring<number>, target: number, smoothTime: number, delta: number): Spring<number>` — Critically-damped update (dampingRatio = 1): moves toward `target` as
- `spring.dampAngle(state: Spring<number>, target: number, smoothTime: number, delta: number): Spring<number>` — Like damp, but takes the shortest angular path to `target` (radians)

<a id="api-math-time-spring2"></a>

### `spring2`

```ts
import { spring2 } from 'math/time';
```

**Create**

- `spring2.create(value: Vec2 = [0, 0]): Spring<Vec2>` — Creates a Vec2 spring at `value` (copied), at rest.

**Operations**

- `spring2.update(state: Spring<Vec2>, target: Vec2, smoothTime: number, dampingRatio: number, delta: number): Spring<Vec2>` — Springs `state.value` toward `target`, mutating `state` in place. Returns it.
- `spring2.damp(state: Spring<Vec2>, target: Vec2, smoothTime: number, delta: number): Spring<Vec2>` — Critically-damped Vec2 spring (dampingRatio = 1). See update.

<a id="api-math-time-spring3"></a>

### `spring3`

```ts
import { spring3 } from 'math/time';
```

**Create**

- `spring3.create(value: Vec3 = [0, 0, 0]): Spring<Vec3>` — Creates a Vec3 spring at `value` (copied), at rest.

**Operations**

- `spring3.update(state: Spring<Vec3>, target: Vec3, smoothTime: number, dampingRatio: number, delta: number): Spring<Vec3>` — Springs `state.value` toward `target`, mutating `state` in place. Returns it.
- `spring3.damp(state: Spring<Vec3>, target: Vec3, smoothTime: number, delta: number): Spring<Vec3>` — Critically-damped Vec3 spring (dampingRatio = 1). See update.

<a id="api-math-time-spring4"></a>

### `spring4`

```ts
import { spring4 } from 'math/time';
```

**Create**

- `spring4.create(value: Vec4 = [0, 0, 0, 0]): Spring<Vec4>` — Creates a Vec4 spring at `value` (copied), at rest.

**Operations**

- `spring4.update(state: Spring<Vec4>, target: Vec4, smoothTime: number, dampingRatio: number, delta: number): Spring<Vec4>` — Springs `state.value` toward `target`, mutating `state` in place. Returns it.
- `spring4.damp(state: Spring<Vec4>, target: Vec4, smoothTime: number, delta: number): Spring<Vec4>` — Critically-damped Vec4 spring (dampingRatio = 1). See update.

<a id="api-math-random"></a>

## `math/random`

- `type Isaac32 = { m: Uint32Array; r: Uint32Array; a: number; b: number; c: number; i: number; }` — State of an ISAAC-32 PRNG: two 256-word arrays plus three accumulators and a
- `type Isaac64 = { mHi: Uint32Array; mLo: Uint32Array; rHi: Uint32Array; rLo: Uint32Array; aHi: number; aLo: number; bHi: number; bLo: number; cHi: number; cLo: number; i: number; }` — State of an ISAAC64 PRNG. Create one with create.
- `type Mulberry32 = { a: number; }` — State of a Mulberry32 PRNG: a single 32-bit accumulator that sample
- `type RandomGenerator = () => number` — A function that returns a random number in the range [0, 1).

<a id="api-math-random-isaac32"></a>

### `isaac32`

```ts
import { isaac32 } from 'math/random';
```

**Create**

- `isaac32.create(seed = 0): Isaac32` — Creates ISAAC-32 PRNG state seeded with `seed`.

**Operations**

- `isaac32.next(state: Isaac32): number` — Advances `state` and returns the next raw 32-bit unsigned integer.
- `isaac32.sample(state: Isaac32): number` — Advances `state` and returns the next number in the range [0, 1).
- `isaac32.seed(): number` — Generates a random 32-bit unsigned integer seed, suitable for use with

<a id="api-math-random-isaac64"></a>

### `isaac64`

```ts
import { isaac64 } from 'math/random';
```

**Create**

- `isaac64.create(seed: bigint = 0n): Isaac64` — Creates ISAAC64 PRNG state seeded with `seed`.

**Operations**

- `isaac64.next(state: Isaac64): bigint` — Advances `state` and returns the next raw 64-bit unsigned integer.
- `isaac64.sample(state: Isaac64): number` — Advances `state` and returns the next number in the range [0, 1).
- `isaac64.seed(): bigint` — Generates a random 64-bit unsigned integer seed, suitable for use with

<a id="api-math-random-mulberry32"></a>

### `mulberry32`

```ts
import { mulberry32 } from 'math/random';
```

**Create**

- `mulberry32.create(seed: number): Mulberry32` — Creates Mulberry32 PRNG state seeded with `seed`.

**Operations**

- `mulberry32.next(state: Mulberry32): number` — Advances `state` and returns the next raw 32-bit unsigned integer.
- `mulberry32.sample(state: Mulberry32): number` — Advances `state` and returns the next number in the range [0, 1).
- `mulberry32.seed(): number` — Generates a random 32-bit unsigned integer seed, suitable for use with

<a id="api-math-random-random"></a>

### `random`

```ts
import { random } from 'math/random';
```

- `random.float(random: RandomGenerator, min: number, max: number): number` — Returns a random float in the range [min, max).
- `random.int(random: RandomGenerator, min: number, max: number): number` — Returns a random integer in the range [min, max] (inclusive).
- `random.bool(random: RandomGenerator, chance = 0.5): boolean` — Returns a random boolean.
- `random.sign(random: RandomGenerator, plusChance = 0.5): number` — Returns a random sign, either 1 or -1.
- `random.choice<T>(random: RandomGenerator, items: T[]): T` — Returns a random item from an array.
- `random.vec2(out: Vec2, random: RandomGenerator): Vec2` — Writes a random unit-length Vec2 into out.
- `random.vec3(out: Vec3, random: RandomGenerator): Vec3` — Writes a random unit-length Vec3 into out.
- `random.vec4(out: Vec4, random: RandomGenerator): Vec4` — Writes a random unit-length Vec4 into out.
- `random.quat(out: Quat, random: RandomGenerator): Quat` — Writes a random unit quaternion into out.

<a id="api-math-noise"></a>

## `math/noise`

**Types**

- `type Permutation = { perm: Uint8Array; grad3: Float64Array; grad4: Float64Array; }` — Seeded permutation and gradient tables that back a noise generator.

**Operations**

- <a id="fbm"></a>`fbm(sample: (frequency: number) => number, octaves: number, lacunarity: number, gain: number): number` — Fractional Brownian motion: sums octaves of a noise source at increasing
- <a id="ridged"></a>`ridged(sample: (frequency: number) => number, octaves: number, lacunarity: number, gain: number): number` — Ridged multifractal: like fbm, but each octave is folded to
- <a id="billow"></a>`billow(sample: (frequency: number) => number, octaves: number, lacunarity: number, gain: number): number` — Billow noise: like fbm, but each octave is folded to `2*abs(noise) - 1`
- <a id="domainwarp2"></a>`domainWarp2(out: Vec2, sample: (x: number, y: number) => number, x: number, y: number, amount = 1): Vec2` — Domain warping (2D): offsets a point by a noise-derived vector, so feeding the
- <a id="domainwarp3"></a>`domainWarp3(out: Vec3, sample: (x: number, y: number, z: number) => number, x: number, y: number, z: number, amount = 1): Vec3` — Domain warping (3D): offsets a point by a noise-derived vector so a noise
- <a id="curl2"></a>`curl2(out: Vec2, sample: (x: number, y: number) => number, x: number, y: number, eps = 1e-4): Vec2` — Curl of a 2D scalar noise potential - a divergence-free (incompressible) flow
- <a id="curl3"></a>`curl3(out: Vec3, sample: (x: number, y: number, z: number) => number, x: number, y: number, z: number, eps = 1e-4): Vec3` — Curl of a 3D noise vector potential - a divergence-free 3D flow field for

<a id="api-math-noise-perlin2d"></a>

### `perlin2d`

```ts
import { perlin2d } from 'math/noise';
```

**Types**

- `type Perlin2DGenerator = Permutation` — A seeded 2D Perlin noise generator. Create one with create.

**Create**

- `perlin2d.create(seed: number): Perlin2DGenerator` — Creates a 2D Perlin noise generator with the given seed.

**Operations**

- `perlin2d.sample({ perm, grad3 }: Perlin2DGenerator, x: number, y: number): number` — Samples 2D Perlin noise.

<a id="api-math-noise-perlin3d"></a>

### `perlin3d`

```ts
import { perlin3d } from 'math/noise';
```

**Types**

- `type Perlin3DGenerator = Permutation` — A seeded 3D Perlin noise generator. Create one with create.

**Create**

- `perlin3d.create(seed: number): Perlin3DGenerator` — Creates a 3D Perlin noise generator with the given seed.

**Operations**

- `perlin3d.sample({ perm, grad3 }: Perlin3DGenerator, x: number, y: number, z: number): number` — Samples 3D Perlin noise.

<a id="api-math-noise-simplex2d"></a>

### `simplex2d`

```ts
import { simplex2d } from 'math/noise';
```

**Types**

- `type Simplex2DGenerator = Permutation` — A seeded 2D simplex noise generator. Create one with create.

**Create**

- `simplex2d.create(seed: number): Simplex2DGenerator` — Creates a 2D simplex noise generator with the given seed.

**Operations**

- `simplex2d.sample({ perm, grad3 }: Simplex2DGenerator, x: number, y: number): number` — Samples 2D simplex noise, returning a value in the interval [-1, 1].

<a id="api-math-noise-simplex3d"></a>

### `simplex3d`

```ts
import { simplex3d } from 'math/noise';
```

**Types**

- `type Simplex3DGenerator = Permutation` — A seeded 3D simplex noise generator. Create one with create.

**Create**

- `simplex3d.create(seed: number): Simplex3DGenerator` — Creates a 3D simplex noise generator with the given seed.

**Operations**

- `simplex3d.sample({ perm, grad3 }: Simplex3DGenerator, x: number, y: number, z: number): number` — Samples 3D simplex noise, returning a value in the interval [-1, 1].

<a id="api-math-noise-simplex4d"></a>

### `simplex4d`

```ts
import { simplex4d } from 'math/noise';
```

**Types**

- `type Simplex4DGenerator = Permutation` — A seeded 4D simplex noise generator. Create one with create.

**Create**

- `simplex4d.create(seed: number): Simplex4DGenerator` — Creates a 4D simplex noise generator with the given seed.

**Operations**

- `simplex4d.sample({ perm, grad4 }: Simplex4DGenerator, x: number, y: number, z: number, w: number): number` — Samples 4D simplex noise, returning a value in the interval [-1, 1].

<a id="api-math-noise-worley2d"></a>

### `worley2d`

```ts
import { worley2d } from 'math/noise';
```

**Types**

- `type Worley2DGenerator = Permutation` — A seeded 2D Worley (cellular) noise generator. Create one with create.

**Create**

- `worley2d.create(seed: number): Worley2DGenerator` — Creates a 2D Worley noise generator with the given seed.

**Operations**

- `worley2d.sample({ perm }: Worley2DGenerator, x: number, y: number): number` — Samples 2D Worley (cellular) noise: the Euclidean distance to the nearest of a

<a id="api-math-noise-worley3d"></a>

### `worley3d`

```ts
import { worley3d } from 'math/noise';
```

**Types**

- `type Worley3DGenerator = Permutation` — A seeded 3D Worley (cellular) noise generator. Create one with create.

**Create**

- `worley3d.create(seed: number): Worley3DGenerator` — Creates a 3D Worley noise generator with the given seed.

**Operations**

- `worley3d.sample({ perm }: Worley3DGenerator, x: number, y: number, z: number): number` — Samples 3D Worley (cellular) noise: the Euclidean distance to the nearest of a

<a id="api-math-color"></a>

## `math/color`

- `type Color = [ r: number, g: number, b: number, a?: number ]` — A linear-sRGB color: [r, g, b] floats with an optional straight (unpremultiplied) alpha.
- `type ColorInput = string | number | Const<Color>` — Accepted input types for creating or parsing a Color.
- `type CSSColorSpace = 'srgb' | 'srgb-linear' | 'display-p3' | 'display-p3-linear' | 'a98-rgb' | 'prophoto-rgb' | 'rec2020' | 'rec2100-pq' | 'rec2100-hlg' | 'rec2100-linear' | 'xyz' | 'xyz-d50' | 'xyz-d65'` — A predefined color space of the CSS color() function (CSS Color 4 and CSS Color HDR).
- `type HSL = [ hue: number, saturation: number, lightness: number ]` — A hue-saturation-lightness color: [h, s, l], all in [0, 1] (hue wraps).
- `type HueInterpolation = 'shorter' | 'longer' | 'increasing' | 'decreasing'` — A CSS Color 4 hue interpolation method, choosing which way around the hue circle to go.
- `type ICtCp = [ i: number, ct: number, cp: number ]` — An ICtCp color: [I, Ct, Cp]. I is PQ intensity in [0, 1] (reference white is about 0.58), Ct and Cp in about [-0.5, 0.5].
- `type Jzazbz = [ jz: number, az: number, bz: number ]` — A Jzazbz color: [Jz, az, bz]. Jz is lightness (reference white is about 0.22), az and bz in about [-0.21, 0.21].
- `type Jzczhz = [ jz: number, cz: number, hz: number ]` — A JzCzhz color: [Jz, Cz, hz]. Jz is lightness, Cz is chroma (0 is gray), hz is hue in degrees.
- `type Lab = [ l: number, a: number, b: number ]` — A CIE Lab (D50) color: [L, a, b]. L is lightness in [0, 100], a and b are opponent axes.
- `type Lch = [ l: number, c: number, h: number ]` — A CIE LCH (D50) color: [L, C, h]. L in [0, 100], chroma C from 0 (gray) to about 150, hue in degrees.
- `type Okhsl = [ h: number, s: number, l: number ]` — An Okhsl color: [h, s, l]. Hue in degrees, saturation and lightness in [0, 1].
- `type Okhsv = [ h: number, s: number, v: number ]` — An Okhsv color: [h, s, v]. Hue in degrees, saturation and value in [0, 1].
- `type Oklab = [ l: number, a: number, b: number ]` — An OKLab color: [L, a, b]. L is lightness (0 black, 1 reference white), a and b are opponent axes in about [-0.4, 0.4].
- `type Oklch = [ l: number, c: number, h: number ]` — An OKLCH color: [L, C, h]. L is lightness in [0, 1], C is chroma (0 is gray, about 0.37 is the most vivid P3), h is hue in degrees.

<a id="api-math-color-color"></a>

### `color`

```ts
import { color } from 'math/color';
```

**Create**

- `color.setFromColorInput(out: Color, input: ColorInput): Color` — Parse any supported color input into linear `out`, or leave `out` unchanged if unrecognised. Returns `out`.
- `color.fromColorInput(input: ColorInput): Color | null` — Parse any supported color input into a new linear Color (with alpha only when it is not 1), or null if unrecognised.
- `color.create(): Color` — Create a new Color initialized to black [0, 0, 0].
- `color.fromValues(r: number, g: number, b: number, a?: number): Color` — Create a new Color with the given linear r, g, b values and an optional alpha.
- `color.clone(c: Const<Color>): Color` — Create a new Color that is a copy of `c`, keeping its alpha if it has one.
- `color.copy(out: Color, src: Const<Color>): Color` — Copy the values from `src` into `out`, including alpha when either has one. Returns `out`.
- `color.set(out: Color, r: number, g: number, b: number, a?: number): Color` — Set the linear r, g, b components of `out` directly, and alpha when given. Returns `out`.
- `color.setScalar(out: Color, s: number): Color` — Set all three channels of `out` to the same linear value `s` (a gray). Returns `out`.
- `color.setFromSRGB(out: Color, srgb: readonly [ number, number, number ]): Color` — Set `out` from an sRGB gamma-encoded [r, g, b] array with values in [0, 1].
- `color.fromSRGB(srgb: readonly [ number, number, number ]): Color` — Create a new Color from an sRGB gamma-encoded [r, g, b] array with values in [0, 1].
- `color.toSRGB(out: [ number, number, number ], c: Const<Color>): [ number, number, number ]` — Write the sRGB gamma-encoded [r, g, b] of a linear Color into `out` (values [0, 1]).
- `color.fromBuffer(out: Color, buffer: ArrayLike<number>, startIndex: number): Color` — Read the r, g, b of a Color from `buffer` at `startIndex` into `out`. Returns `out`.
- `color.toBuffer(outBuffer: MutableArrayLike<number>, c: Const<Color>, startIndex: number): MutableArrayLike<number>` — Write the r, g, b of `c` into `outBuffer` at `startIndex`. Returns `outBuffer`.
- `color.toCSS(c: Const<Color>): string` — Create a CSS `rgb(...)` string (or `rgba(...)` with alpha) in sRGB gamma space, clamped to the sRGB gamut.
- `color.toHex(c: Const<Color>): number` — Convert to a 0xRRGGBB integer in sRGB gamma space.
- `color.toHexString(c: Const<Color>): string` — Convert to a 6-digit sRGB hex string without a leading '#', e.g. 'ff8800'.

**Operations**

- `color.convertBuffer(outBuffer: MutableArrayLike<number>, buffer: ArrayLike<number>, convert: (out: [ number, number, number ], c: readonly [ number, number, number ]) => unknown, stride = 3): MutableArrayLike<number>` — Run a color function over every color packed in `buffer`, writing the results to `outBuffer`. Returns `outBuffer`.
- `color.add(out: Color, a: Const<Color>, b: Const<Color>): Color` — Add `a + b` component-wise into `out`. Returns `out`.
- `color.addScalar(out: Color, a: Const<Color>, s: number): Color` — Add scalar `s` to each channel of `a` into `out`. Returns `out`.
- `color.sub(out: Color, a: Const<Color>, b: Const<Color>): Color` — Subtract `a - b` component-wise into `out`. Returns `out`.
- `color.multiply(out: Color, a: Const<Color>, b: Const<Color>): Color` — Multiply `a * b` component-wise into `out` (tinting). Returns `out`.
- `color.multiplyScalar(out: Color, a: Const<Color>, s: number): Color` — Scale each channel of `a` by `s` into `out` (brightness). Returns `out`.
- `color.lerp(out: Color, a: Const<Color>, b: Const<Color>, t: number): Color` — Linearly interpolate from `a` to `b` by `t` into `out` (physically-correct blend). Returns `out`.
- `color.premultiply(out: Color, c: Const<Color>): Color` — Multiply r, g, b by alpha into `out` (premultiplied alpha), keeping alpha. Returns `out`.
- `color.unpremultiply(out: Color, c: Const<Color>): Color` — Divide premultiplied r, g, b by alpha into `out` (straight alpha), keeping alpha. Transparent stays black. Returns `out`.
- `color.over(out: Color, src: Const<Color>, dst: Const<Color>): Color` — Composite `src` over `dst` into `out` (Porter-Duff source-over, straight alpha, in linear light).
- `color.clamp(out: Color, c: Const<Color>): Color` — Clamp each channel of `c` to [0, 1] into `out`. Returns `out`.
- `color.contrastColor(out: Color, background: Const<Color>): Color` — Write white or black into `out`, whichever contrasts more with `background` (CSS contrast-color()). Returns `out`.

**Query**

- `color.equals(a: Const<Color>, b: Const<Color>, epsilon = 0): boolean` — Whether `a` and `b` are equal (alpha included, missing alpha is 1), within an optional per-channel `epsilon`.
- `color.luminance(c: Const<Color>): number` — Relative luminance in [0, 1] (Rec. 709 weights, on linear light).
- `color.contrastRatio(a: Const<Color>, b: Const<Color>): number` — WCAG 2 contrast ratio between two colors, from 1 (none) to 21 (black on white). Order does not matter.

<a id="api-math-color-colorspace"></a>

### `colorspace`

```ts
import { colorspace } from 'math/color';
```

**Create**

- `colorspace.toCSS(space: CSSColorSpace, values: Const<Color>, alpha = 1): string` — Create a CSS `color(<space> ...)` string from channel values already in `space`, with an optional alpha.

**Operations**

- `colorspace.srgbToLinear(c: number): number` — Convert a single sRGB gamma-encoded channel to linear light, sign-mirrored for extended range.
- `colorspace.linearToSrgb(c: number): number` — Convert a single linear light channel to sRGB gamma-encoded, sign-mirrored for extended range.
- `colorspace.a98RgbToLinear(c: number): number` — Convert a single A98 RGB (Adobe RGB 1998) encoded channel to linear light.
- `colorspace.linearToA98Rgb(c: number): number` — Convert a single linear light channel to A98 RGB (Adobe RGB 1998) encoded.
- `colorspace.prophotoRgbToLinear(c: number): number` — Convert a single ProPhoto RGB encoded channel to linear light (gamma 1.8 with a linear toe).
- `colorspace.linearToProphotoRgb(c: number): number` — Convert a single linear light channel to ProPhoto RGB encoded (gamma 1.8 with a linear toe).
- `colorspace.rec2020ToLinear(c: number): number` — Convert a single Rec.2020 encoded channel to linear light (BT.1886 gamma 2.4, as CSS Color 4 uses).
- `colorspace.linearToRec2020(c: number): number` — Convert a single linear light channel to Rec.2020 encoded (BT.1886 gamma 2.4, as CSS Color 4 uses).
- `colorspace.nitsToPq(nits: number): number` — Encode an absolute luminance in cd/m² (nits) with the SMPTE ST 2084 PQ curve, into [0, 1].
- `colorspace.pqToNits(pq: number): number` — Decode a SMPTE ST 2084 PQ signal in [0, 1] to absolute luminance in cd/m² (nits).
- `colorspace.linearToHlg(e: number): number` — Encode a scene-linear channel with the BT.2100 HLG OETF. 1 maps to 1, 1/12 maps to 0.5.
- `colorspace.hlgToLinear(e: number): number` — Decode a BT.2100 HLG signal to scene-linear light (the inverse OETF).
- `colorspace.linearSrgbToXyzD65(out: Color, c: Const<Color>): Color` — Convert linear sRGB to CIE XYZ relative to D65, into `out`. Returns `out`.
- `colorspace.xyzD65ToLinearSrgb(out: Color, c: Const<Color>): Color` — Convert CIE XYZ relative to D65 to linear sRGB, into `out`. Returns `out`.
- `colorspace.linearSrgbToXyzD50(out: Color, c: Const<Color>): Color` — Convert linear sRGB to CIE XYZ relative to D50 (Bradford adapted), into `out`. Returns `out`.
- `colorspace.xyzD50ToLinearSrgb(out: Color, c: Const<Color>): Color` — Convert CIE XYZ relative to D50 to linear sRGB (Bradford adapted), into `out`. Returns `out`.
- `colorspace.xyzD65ToXyzD50(out: Color, c: Const<Color>): Color` — Adapt CIE XYZ from the D65 white point to D50 (Bradford), into `out`. Returns `out`.
- `colorspace.xyzD50ToXyzD65(out: Color, c: Const<Color>): Color` — Adapt CIE XYZ from the D50 white point to D65 (Bradford), into `out`. Returns `out`.
- `colorspace.linearSrgbToLinearDisplayP3(out: Color, c: Const<Color>): Color` — Convert a linear-sRGB Color to linear Display P3 primaries, into `out`. Returns `out`.
- `colorspace.linearDisplayP3ToLinearSrgb(out: Color, c: Const<Color>): Color` — Convert a linear Display P3 Color to linear-sRGB primaries, into `out`. Returns `out`.
- `colorspace.linearSrgbToLinearRec2020(out: Color, c: Const<Color>): Color` — Convert linear sRGB to linear Rec.2020 (and Rec.2100) primaries, into `out`. Returns `out`.
- `colorspace.linearRec2020ToLinearSrgb(out: Color, c: Const<Color>): Color` — Convert linear Rec.2020 (and Rec.2100) primaries to linear sRGB, into `out`. Returns `out`.
- `colorspace.linearSrgbToLinearA98Rgb(out: Color, c: Const<Color>): Color` — Convert linear sRGB to linear A98 RGB (Adobe RGB 1998) primaries, into `out`. Returns `out`.
- `colorspace.linearA98RgbToLinearSrgb(out: Color, c: Const<Color>): Color` — Convert linear A98 RGB (Adobe RGB 1998) primaries to linear sRGB, into `out`. Returns `out`.
- `colorspace.linearSrgbToLinearProphotoRgb(out: Color, c: Const<Color>): Color` — Convert linear sRGB to linear ProPhoto RGB primaries (D50, Bradford adapted), into `out`. Returns `out`.
- `colorspace.linearProphotoRgbToLinearSrgb(out: Color, c: Const<Color>): Color` — Convert linear ProPhoto RGB primaries (D50) to linear sRGB, Bradford adapted, into `out`. Returns `out`.
- `colorspace.linearSrgbToDisplayP3(out: Color, c: Const<Color>): Color` — Convert linear sRGB to gamma-encoded Display P3 (as used by CSS `color(display-p3 ...)`), into `out`. Returns `out`.
- `colorspace.displayP3ToLinearSrgb(out: Color, c: Const<Color>): Color` — Convert gamma-encoded Display P3 to linear sRGB, into `out`. Returns `out`.
- `colorspace.linearSrgbToRec2100Pq(out: Color, c: Const<Color>): Color` — Convert linear sRGB to a Rec.2100 PQ signal (HDR10), into `out`. Returns `out`.
- `colorspace.rec2100PqToLinearSrgb(out: Color, c: Const<Color>): Color` — Convert a Rec.2100 PQ signal (HDR10) to linear sRGB with 203 cd/m² as 1.0, into `out`. Returns `out`.
- `colorspace.linearSrgbToRec2100Hlg(out: Color, c: Const<Color>): Color` — Convert linear sRGB to a Rec.2100 HLG signal, into `out`. Returns `out`.
- `colorspace.rec2100HlgToLinearSrgb(out: Color, c: Const<Color>): Color` — Convert a Rec.2100 HLG signal to linear sRGB with reference white as 1.0, into `out`. Returns `out`.

<a id="api-math-color-gamut"></a>

### `gamut`

```ts
import { gamut } from 'math/color';
```

**Operations**

- `gamut.clipToSrgb(out: Color, c: Const<Color>, peak = 1): Color` — Clamp linear Color `c` into the sRGB gamut [0, peak] into `out`, per channel. Returns `out`.
- `gamut.clipToDisplayP3(out: Color, c: Const<Color>, peak = 1): Color` — Clamp linear Color `c` into the Display P3 gamut [0, peak] into `out`, per P3 channel. Returns `out`.
- `gamut.clipToRec2020(out: Color, c: Const<Color>, peak = 1): Color` — Clamp linear Color `c` into the Rec.2020 gamut [0, peak] into `out`, per Rec.2020 channel. Returns `out`.
- `gamut.mapToSrgb(out: Color, c: Const<Color>, peak = 1): Color` — Map linear Color `c` into the sRGB gamut [0, peak] into `out`, keeping its OKLCH lightness and hue. Returns `out`.
- `gamut.mapToDisplayP3(out: Color, c: Const<Color>, peak = 1): Color` — Map linear Color `c` into the Display P3 gamut [0, peak] into `out`, keeping its OKLCH lightness and hue. Returns `out`.
- `gamut.mapToRec2020(out: Color, c: Const<Color>, peak = 1): Color` — Map linear Color `c` into the Rec.2020 (Rec.2100) gamut [0, peak] into `out`, keeping its OKLCH lightness and hue. Returns `out`.

**Query**

- `gamut.isInSrgb(c: Const<Color>, peak = 1, epsilon = 0.000075): boolean` — Whether linear Color `c` is inside the sRGB gamut, with channels in [0, peak] within `epsilon`.
- `gamut.isInDisplayP3(c: Const<Color>, peak = 1, epsilon = 0.000075): boolean` — Whether linear Color `c` is inside the Display P3 gamut, with channels in [0, peak] within `epsilon`.
- `gamut.isInRec2020(c: Const<Color>, peak = 1, epsilon = 0.000075): boolean` — Whether linear Color `c` is inside the Rec.2020 (Rec.2100) gamut, with channels in [0, peak] within `epsilon`.

<a id="api-math-color-glsl"></a>

### `glsl`

```ts
import { glsl } from 'math/color';
```

- `glsl.srgb: string` — GLSL `srgbToLinear` and `linearToSrgb`, the sRGB transfer functions sign-mirrored for extended range.
- `glsl.oklab: string` — GLSL `linearSrgbToOklab`, `oklabToLinearSrgb` and `mixOklab(a, b, t)`, which interpolates two linear sRGB colors through OKLab.
- `glsl.oklch: string` — GLSL `oklabToOklch`, `oklchToOklab` and `mixOklch(a, b, t)` (shorter hue arc), which need the `oklab` snippet included first.
- `glsl.displayP3: string` — GLSL `linearSrgbToLinearDisplayP3` and `linearDisplayP3ToLinearSrgb`, which convert between linear sRGB and Display P3 primaries.
- `glsl.rec2020: string` — GLSL `linearSrgbToLinearRec2020` and `linearRec2020ToLinearSrgb`, which convert between linear sRGB and Rec.2020 primaries.
- `glsl.pq: string` — GLSL `nitsToPq`, `pqToNits` (SMPTE ST 2084 in cd/m²) and `linearSrgbToRec2100Pq` for HDR10 output with 1.0 at 203 cd/m².
- `glsl.hlg: string` — GLSL `linearToHlg` and `hlgToLinear`, the BT.2100 HLG OETF and its inverse, sign-mirrored.
- `glsl.tonemapReinhard: string` — GLSL `tonemapReinhard` and `tonemapReinhardExtended(c, white)`, which saturates to 1 at `white`.
- `glsl.tonemapAces: string` — GLSL `tonemapAcesFilmic`, ACES filmic tone mapping with the three.js 1 / 0.6 pre-exposure.
- `glsl.tonemapAgx: string` — GLSL `tonemapAgx` and its helper `tonemapAgxContrast`, AgX tone mapping matching three.js AgXToneMapping.
- `glsl.tonemapNeutral: string` — GLSL `tonemapNeutral`, Khronos PBR Neutral tone mapping matching three.js NeutralToneMapping.

<a id="api-math-color-hsl"></a>

### `hsl`

```ts
import { hsl } from 'math/color';
```

**Create**

- `hsl.create(): HSL` — Create a new HSL initialized to [0, 0, 0] (black).
- `hsl.fromValues(h: number, s: number, l: number): HSL` — Create a new HSL with the given h, s, l values (all in [0, 1]).
- `hsl.clone(a: Const<HSL>): HSL` — Create a new HSL that is a copy of `a`.
- `hsl.copy(out: HSL, src: Const<HSL>): HSL` — Copy the values from `src` into `out`. Returns `out`.
- `hsl.set(out: HSL, h: number, s: number, l: number): HSL` — Set the h, s, l components of `out` directly. Returns `out`.
- `hsl.fromColor(out: HSL, c: Const<Color>): HSL` — Write the HSL of a linear Color into `out`. Returns `out`.
- `hsl.toColor(out: Color, a: Const<HSL>): Color` — Write the linear Color of an HSL into `out`. Returns `out`.

**Operations**

- `hsl.lerp(out: HSL, a: Const<HSL>, b: Const<HSL>, t: number): HSL` — Interpolate from `a` to `b` by `t` into `out`, taking the shortest path around
- `hsl.offset(out: HSL, a: Const<HSL>, dh: number, ds: number, dl: number): HSL` — Offset `a` by (dh, ds, dl) into `out`: hue wraps into [0, 1), saturation and

<a id="api-math-color-ictcp"></a>

### `ictcp`

```ts
import { ictcp } from 'math/color';
```

**Create**

- `ictcp.create(): ICtCp` — Create a new ICtCp initialized to [0, 0, 0].
- `ictcp.fromValues(i: number, ct: number, cp: number): ICtCp` — Create a new ICtCp with the given I, Ct, Cp values.
- `ictcp.clone(a: Const<ICtCp>): ICtCp` — Create a new ICtCp that is a copy of `a`.
- `ictcp.copy(out: ICtCp, src: Const<ICtCp>): ICtCp` — Copy the values from `src` into `out`. Returns `out`.
- `ictcp.set(out: ICtCp, i: number, ct: number, cp: number): ICtCp` — Set the I, Ct, Cp components of `out` directly. Returns `out`.
- `ictcp.fromColor(out: ICtCp, c: Const<Color>): ICtCp` — Write the ICtCp of a linear Color (1.0 = 203 cd/m²) into `out`. Returns `out`.
- `ictcp.toColor(out: Color, a: Const<ICtCp>): Color` — Write the linear Color (1.0 = 203 cd/m²) of an ICtCp into `out`. Alpha in `out` is left untouched. Returns `out`.
- `ictcp.toCSS(a: Const<ICtCp>, alpha = 1): string` — Create a CSS `ictcp(...)` string (CSS Color HDR), with an optional alpha.

**Operations**

- `ictcp.lerp(out: ICtCp, a: Const<ICtCp>, b: Const<ICtCp>, t: number): ICtCp` — Linearly interpolate from `a` to `b` by `t` into `out`. Returns `out`.

**Query**

- `ictcp.deltaEITP(a: Const<ICtCp>, b: Const<ICtCp>): number` — ΔE ITP (ITU-R BT.2124) HDR color difference. 1 is a just-noticeable difference.

<a id="api-math-color-jzazbz"></a>

### `jzazbz`

```ts
import { jzazbz } from 'math/color';
```

**Create**

- `jzazbz.create(): Jzazbz` — Create a new Jzazbz initialized to [0, 0, 0].
- `jzazbz.fromValues(jz: number, az: number, bz: number): Jzazbz` — Create a new Jzazbz with the given Jz, az, bz values.
- `jzazbz.clone(a: Const<Jzazbz>): Jzazbz` — Create a new Jzazbz that is a copy of `a`.
- `jzazbz.copy(out: Jzazbz, src: Const<Jzazbz>): Jzazbz` — Copy the values from `src` into `out`. Returns `out`.
- `jzazbz.set(out: Jzazbz, jz: number, az: number, bz: number): Jzazbz` — Set the Jz, az, bz components of `out` directly. Returns `out`.
- `jzazbz.fromColor(out: Jzazbz, c: Const<Color>): Jzazbz` — Write the Jzazbz of a linear Color (1.0 = 203 cd/m²) into `out`. Returns `out`.
- `jzazbz.toColor(out: Color, a: Const<Jzazbz>): Color` — Write the linear Color (1.0 = 203 cd/m²) of a Jzazbz into `out`. Alpha in `out` is left untouched. Returns `out`.
- `jzazbz.toCSS(a: Const<Jzazbz>, alpha = 1): string` — Create a CSS `jzazbz(...)` string (CSS Color HDR), with an optional alpha.

**Operations**

- `jzazbz.lerp(out: Jzazbz, a: Const<Jzazbz>, b: Const<Jzazbz>, t: number): Jzazbz` — Linearly interpolate from `a` to `b` by `t` into `out`. Returns `out`.

<a id="api-math-color-jzczhz"></a>

### `jzczhz`

```ts
import { jzczhz } from 'math/color';
```

**Create**

- `jzczhz.create(): Jzczhz` — Create a new Jzczhz initialized to [0, 0, 0].
- `jzczhz.fromValues(jz: number, cz: number, hz: number): Jzczhz` — Create a new Jzczhz with the given Jz, Cz, hz (degrees) values.
- `jzczhz.clone(a: Const<Jzczhz>): Jzczhz` — Create a new Jzczhz that is a copy of `a`.
- `jzczhz.copy(out: Jzczhz, src: Const<Jzczhz>): Jzczhz` — Copy the values from `src` into `out`. Returns `out`.
- `jzczhz.set(out: Jzczhz, jz: number, cz: number, hz: number): Jzczhz` — Set the Jz, Cz, hz (degrees) components of `out` directly. Returns `out`.
- `jzczhz.fromJzazbz(out: Jzczhz, a: Const<Jzazbz>): Jzczhz` — Write the JzCzhz of a Jzazbz color into `out`. Gray colors get hue 0. Returns `out`.
- `jzczhz.toJzazbz(out: Jzazbz, a: Const<Jzczhz>): Jzazbz` — Write the Jzazbz of a JzCzhz color into `out`. Returns `out`.
- `jzczhz.fromColor(out: Jzczhz, c: Const<Color>): Jzczhz` — Write the JzCzhz of a linear Color (1.0 = 203 cd/m²) into `out`. Returns `out`.
- `jzczhz.toColor(out: Color, a: Const<Jzczhz>): Color` — Write the linear Color (1.0 = 203 cd/m²) of a JzCzhz into `out`. Alpha in `out` is left untouched. Returns `out`.
- `jzczhz.toCSS(a: Const<Jzczhz>, alpha = 1): string` — Create a CSS `jzczhz(...)` string (CSS Color HDR), with an optional alpha.

**Operations**

- `jzczhz.lerp(out: Jzczhz, a: Const<Jzczhz>, b: Const<Jzczhz>, t: number, hue: HueInterpolation = 'shorter'): Jzczhz` — Interpolate from `a` to `b` by `t` into `out`, around the hue circle by a CSS `hue` method (default 'shorter'). Returns `out`.

**Query**

- `jzczhz.deltaEJz(a: Const<Jzczhz>, b: Const<Jzczhz>): number` — ΔEz color difference in JzCzhz (Safdar et al. 2017), for HDR and wide gamut colors.

<a id="api-math-color-lab"></a>

### `lab`

```ts
import { lab } from 'math/color';
```

**Create**

- `lab.create(): Lab` — Create a new Lab initialized to [0, 0, 0] (black).
- `lab.fromValues(l: number, a: number, b: number): Lab` — Create a new Lab with the given L, a, b values.
- `lab.clone(a: Const<Lab>): Lab` — Create a new Lab that is a copy of `a`.
- `lab.copy(out: Lab, src: Const<Lab>): Lab` — Copy the values from `src` into `out`. Returns `out`.
- `lab.set(out: Lab, l: number, a: number, b: number): Lab` — Set the L, a, b components of `out` directly. Returns `out`.
- `lab.fromColor(out: Lab, c: Const<Color>): Lab` — Write the CIE Lab (D50) of a linear Color into `out`. Returns `out`.
- `lab.toColor(out: Color, a: Const<Lab>): Color` — Write the linear Color of a CIE Lab (D50) into `out`. Alpha in `out` is left untouched. Returns `out`.
- `lab.toCSS(a: Const<Lab>, alpha = 1): string` — Create a CSS `lab(...)` string, with an optional alpha.

**Operations**

- `lab.lerp(out: Lab, a: Const<Lab>, b: Const<Lab>, t: number): Lab` — Linearly interpolate from `a` to `b` by `t` into `out`. Returns `out`.

**Query**

- `lab.deltaE76(a: Const<Lab>, b: Const<Lab>): number` — CIE76 color difference: Euclidean distance in Lab. About 2.3 is a just-noticeable difference.
- `lab.deltaE2000(a: Const<Lab>, b: Const<Lab>): number` — CIEDE2000 color difference (Sharma, Wu and Dalal 2005 formulation, kL = kC = kH = 1).

<a id="api-math-color-lch"></a>

### `lch`

```ts
import { lch } from 'math/color';
```

**Create**

- `lch.create(): Lch` — Create a new Lch initialized to [0, 0, 0] (black).
- `lch.fromValues(l: number, c: number, h: number): Lch` — Create a new Lch with the given L, C, h (degrees) values.
- `lch.clone(a: Const<Lch>): Lch` — Create a new Lch that is a copy of `a`.
- `lch.copy(out: Lch, src: Const<Lch>): Lch` — Copy the values from `src` into `out`. Returns `out`.
- `lch.set(out: Lch, l: number, c: number, h: number): Lch` — Set the L, C, h (degrees) components of `out` directly. Returns `out`.
- `lch.fromLab(out: Lch, a: Const<Lab>): Lch` — Write the LCH of a CIE Lab color into `out`. Gray colors get hue 0. Returns `out`.
- `lch.toLab(out: Lab, a: Const<Lch>): Lab` — Write the CIE Lab of an LCH color into `out`. Returns `out`.
- `lch.fromColor(out: Lch, c: Const<Color>): Lch` — Write the CIE LCH of a linear Color into `out`. Returns `out`.
- `lch.toColor(out: Color, a: Const<Lch>): Color` — Write the linear Color of a CIE LCH into `out`. Alpha in `out` is left untouched. Returns `out`.
- `lch.toCSS(a: Const<Lch>, alpha = 1): string` — Create a CSS `lch(...)` string, with an optional alpha.

**Operations**

- `lch.lerp(out: Lch, a: Const<Lch>, b: Const<Lch>, t: number, hue: HueInterpolation = 'shorter'): Lch` — Interpolate from `a` to `b` by `t` into `out`, around the hue circle by a CSS `hue` method (default 'shorter'). Returns `out`.

<a id="api-math-color-okhsl"></a>

### `okhsl`

```ts
import { okhsl } from 'math/color';
```

**Create**

- `okhsl.create(): Okhsl` — Create a new Okhsl initialized to [0, 0, 0] (black).
- `okhsl.fromValues(h: number, s: number, l: number): Okhsl` — Create a new Okhsl with the given h (degrees), s, l values.
- `okhsl.clone(a: Const<Okhsl>): Okhsl` — Create a new Okhsl that is a copy of `a`.
- `okhsl.copy(out: Okhsl, src: Const<Okhsl>): Okhsl` — Copy the values from `src` into `out`. Returns `out`.
- `okhsl.set(out: Okhsl, h: number, s: number, l: number): Okhsl` — Set the h (degrees), s, l components of `out` directly. Returns `out`.
- `okhsl.fromOklab(out: Okhsl, lab: Const<Oklab>): Okhsl` — Write the Okhsl of an OKLab color into `out`. Gray colors get hue 0. Returns `out`.
- `okhsl.toOklab(out: Oklab, a: Const<Okhsl>): Oklab` — Write the OKLab of an Okhsl color into `out`. Returns `out`.
- `okhsl.fromColor(out: Okhsl, c: Const<Color>): Okhsl` — Write the Okhsl of a linear Color into `out`. Returns `out`.
- `okhsl.toColor(out: Color, a: Const<Okhsl>): Color` — Write the linear Color of an Okhsl into `out`. Alpha in `out` is left untouched. Returns `out`.

**Operations**

- `okhsl.lerp(out: Okhsl, a: Const<Okhsl>, b: Const<Okhsl>, t: number, hue: HueInterpolation = 'shorter'): Okhsl` — Interpolate from `a` to `b` by `t` into `out`, around the hue circle by a CSS `hue` method (default 'shorter'). Returns `out`.

<a id="api-math-color-okhsv"></a>

### `okhsv`

```ts
import { okhsv } from 'math/color';
```

**Create**

- `okhsv.create(): Okhsv` — Create a new Okhsv initialized to [0, 0, 0] (black).
- `okhsv.fromValues(h: number, s: number, v: number): Okhsv` — Create a new Okhsv with the given h (degrees), s, v values.
- `okhsv.clone(a: Const<Okhsv>): Okhsv` — Create a new Okhsv that is a copy of `a`.
- `okhsv.copy(out: Okhsv, src: Const<Okhsv>): Okhsv` — Copy the values from `src` into `out`. Returns `out`.
- `okhsv.set(out: Okhsv, h: number, s: number, v: number): Okhsv` — Set the h (degrees), s, v components of `out` directly. Returns `out`.
- `okhsv.fromOklab(out: Okhsv, lab: Const<Oklab>): Okhsv` — Write the Okhsv of an OKLab color into `out`. Gray colors get hue 0. Returns `out`.
- `okhsv.toOklab(out: Oklab, a: Const<Okhsv>): Oklab` — Write the OKLab of an Okhsv color into `out`. Returns `out`.
- `okhsv.fromColor(out: Okhsv, c: Const<Color>): Okhsv` — Write the Okhsv of a linear Color into `out`. Returns `out`.
- `okhsv.toColor(out: Color, a: Const<Okhsv>): Color` — Write the linear Color of an Okhsv into `out`. Alpha in `out` is left untouched. Returns `out`.

**Operations**

- `okhsv.lerp(out: Okhsv, a: Const<Okhsv>, b: Const<Okhsv>, t: number, hue: HueInterpolation = 'shorter'): Okhsv` — Interpolate from `a` to `b` by `t` into `out`, around the hue circle by a CSS `hue` method (default 'shorter'). Returns `out`.

<a id="api-math-color-oklab"></a>

### `oklab`

```ts
import { oklab } from 'math/color';
```

**Create**

- `oklab.create(): Oklab` — Create a new Oklab initialized to [0, 0, 0] (black).
- `oklab.fromValues(l: number, a: number, b: number): Oklab` — Create a new Oklab with the given L, a, b values.
- `oklab.clone(a: Const<Oklab>): Oklab` — Create a new Oklab that is a copy of `a`.
- `oklab.copy(out: Oklab, src: Const<Oklab>): Oklab` — Copy the values from `src` into `out`. Returns `out`.
- `oklab.set(out: Oklab, l: number, a: number, b: number): Oklab` — Set the L, a, b components of `out` directly. Returns `out`.
- `oklab.fromColor(out: Oklab, c: Const<Color>): Oklab` — Write the OKLab of a linear Color into `out`. Returns `out`.
- `oklab.toColor(out: Color, a: Const<Oklab>): Color` — Write the linear Color of an OKLab into `out`. Alpha in `out` is left untouched. Returns `out`.
- `oklab.toCSS(a: Const<Oklab>, alpha = 1): string` — Create a CSS `oklab(...)` string, with an optional alpha.

**Operations**

- `oklab.lerp(out: Oklab, a: Const<Oklab>, b: Const<Oklab>, t: number): Oklab` — Linearly interpolate from `a` to `b` by `t` into `out`. Returns `out`.
- `oklab.mix(out: Color, a: Const<Color>, b: Const<Color>, t: number): Color` — Interpolate two linear Colors through OKLab by `t` into `out`, like CSS `color-mix(in oklab, ...)`. Returns `out`.

**Query**

- `oklab.deltaEOK(a: Const<Oklab>, b: Const<Oklab>): number` — Euclidean distance between two OKLab colors (ΔEOK). About 0.02 is a just-noticeable difference.

<a id="api-math-color-oklch"></a>

### `oklch`

```ts
import { oklch } from 'math/color';
```

**Create**

- `oklch.create(): Oklch` — Create a new Oklch initialized to [0, 0, 0] (black).
- `oklch.fromValues(l: number, c: number, h: number): Oklch` — Create a new Oklch with the given L, C, h (degrees) values.
- `oklch.clone(a: Const<Oklch>): Oklch` — Create a new Oklch that is a copy of `a`.
- `oklch.copy(out: Oklch, src: Const<Oklch>): Oklch` — Copy the values from `src` into `out`. Returns `out`.
- `oklch.set(out: Oklch, l: number, c: number, h: number): Oklch` — Set the L, C, h (degrees) components of `out` directly. Returns `out`.
- `oklch.fromOklab(out: Oklch, a: Const<Oklab>): Oklch` — Write the OKLCH of an OKLab color into `out`. Gray colors get hue 0. Returns `out`.
- `oklch.toOklab(out: Oklab, a: Const<Oklch>): Oklab` — Write the OKLab of an OKLCH color into `out`. Returns `out`.
- `oklch.fromColor(out: Oklch, c: Const<Color>): Oklch` — Write the OKLCH of a linear Color into `out`. Returns `out`.
- `oklch.toColor(out: Color, a: Const<Oklch>): Color` — Write the linear Color of an OKLCH into `out`. Alpha in `out` is left untouched. Returns `out`.
- `oklch.toCSS(a: Const<Oklch>, alpha = 1): string` — Create a CSS `oklch(...)` string, with an optional alpha.

**Operations**

- `oklch.lerp(out: Oklch, a: Const<Oklch>, b: Const<Oklch>, t: number, hue: HueInterpolation = 'shorter'): Oklch` — Interpolate from `a` to `b` by `t` into `out`, around the hue circle by a CSS `hue` method (default 'shorter'). Returns `out`.
- `oklch.mix(out: Color, a: Const<Color>, b: Const<Color>, t: number, hue: HueInterpolation = 'shorter'): Color` — Interpolate two linear Colors through OKLCH by `t` into `out`, like CSS `color-mix(in oklch, ...)`. Returns `out`.

<a id="api-math-color-packing"></a>

### `packing`

```ts
import { packing } from 'math/color';
```

- `packing.packRgba8unorm(c: Const<Color>): number` — Pack a Color into an 'rgba8unorm' texel, clamping to [0, 1] and using alpha 1 when absent.
- `packing.unpackRgba8unorm(out: Color, v: number): Color` — Unpack an 'rgba8unorm' texel into `out`, including alpha. Returns `out`.
- `packing.packRgba8unormSrgb(c: Const<Color>): number` — Pack a linear Color into an 'rgba8unorm-srgb' texel, sRGB encoding rgb and keeping alpha linear.
- `packing.unpackRgba8unormSrgb(out: Color, v: number): Color` — Unpack an 'rgba8unorm-srgb' texel into a linear Color `out`, including alpha. Returns `out`.
- `packing.packRgb10a2unorm(c: Const<Color>): number` — Pack a Color into an 'rgb10a2unorm' texel: 10 bits for r, g, b and 2 bits of alpha, clamped to [0, 1].
- `packing.unpackRgb10a2unorm(out: Color, v: number): Color` — Unpack an 'rgb10a2unorm' texel into `out`, including alpha. Returns `out`.
- `packing.packRgb9e5ufloat(c: Const<Color>): number` — Pack a Color into an 'rgb9e5ufloat' texel: three 9 bit mantissas sharing one 5 bit exponent.
- `packing.unpackRgb9e5ufloat(out: Color, v: number): Color` — Unpack an 'rgb9e5ufloat' texel into `out`, leaving alpha untouched. Returns `out`.
- `packing.packRg11b10ufloat(c: Const<Color>): number` — Pack a Color into an 'rg11b10ufloat' texel: unsigned 11 bit floats for r and g, 10 bit for b.
- `packing.unpackRg11b10ufloat(out: Color, v: number): Color` — Unpack an 'rg11b10ufloat' texel into `out`, leaving alpha untouched. Returns `out`.
- `packing.packRgbe(c: Const<Color>): number` — Pack a Color into a Radiance .hdr RGBE texel: 8 bit mantissas with a shared exponent byte.
- `packing.unpackRgbe(out: Color, v: number): Color` — Unpack a Radiance .hdr RGBE texel into `out` as rgbe.c does, leaving alpha untouched. Returns `out`.
- `packing.packHalf(x: number): number` — Pack a number into IEEE 754 binary16 (half float) bits, rounding to nearest even.
- `packing.unpackHalf(h: number): number` — Unpack IEEE 754 binary16 (half float) bits into a number.

<a id="api-math-color-tonemap"></a>

### `tonemap`

```ts
import { tonemap } from 'math/color';
```

- `tonemap.reinhard(out: Color, c: Const<Color>): Color` — Reinhard tone mapping, c / (1 + c) per channel, mapping [0, inf) to [0, 1) with negatives at 0. Returns `out`.
- `tonemap.reinhardExtended(out: Color, c: Const<Color>, white: number): Color` — Extended Reinhard tone mapping, c (1 + c / white²) / (1 + c) per channel, saturating to 1 at and above `white`.
- `tonemap.acesFilmic(out: Color, c: Const<Color>): Color` — ACES filmic tone mapping using Stephen Hill's RRT and ODT fit, matching three.js ACESFilmicToneMapping.
- `tonemap.agx(out: Color, c: Const<Color>): Color` — AgX tone mapping, matching three.js AgXToneMapping (Filament's port of Blender's AgX in Rec.2020 primaries).
- `tonemap.neutral(out: Color, c: Const<Color>): Color` — Khronos PBR Neutral tone mapping, which keeps colors nearly unchanged below 0.76 and then compresses highlights.
- `tonemap.mixHeadroom(out: Color, a: Const<Color>, headroomA: number, b: Const<Color>, headroomB: number, headroom: number): Color` — Interpolate between `a` graded for `headroomA` and `b` graded for `headroomB` at display `headroom`, into `out`.

<a id="api-math-color-wgsl"></a>

### `wgsl`

```ts
import { wgsl } from 'math/color';
```

- `wgsl.srgb: string` — WGSL `srgbToLinear` and `linearToSrgb`, the sRGB transfer functions sign-mirrored for extended range.
- `wgsl.oklab: string` — WGSL `linearSrgbToOklab`, `oklabToLinearSrgb` and `mixOklab(a, b, t)`, which interpolates two linear sRGB colors through OKLab.
- `wgsl.oklch: string` — WGSL `oklabToOklch`, `oklchToOklab` and `mixOklch(a, b, t)` (shorter hue arc), which need the `oklab` snippet.
- `wgsl.displayP3: string` — WGSL `linearSrgbToLinearDisplayP3` and `linearDisplayP3ToLinearSrgb`, which convert between linear sRGB and Display P3 primaries.
- `wgsl.rec2020: string` — WGSL `linearSrgbToLinearRec2020` and `linearRec2020ToLinearSrgb`, which convert between linear sRGB and Rec.2020 primaries.
- `wgsl.pq: string` — WGSL `nitsToPq`, `pqToNits` (SMPTE ST 2084 in cd/m²) and `linearSrgbToRec2100Pq` for HDR10 output with 1.0 at 203 cd/m².
- `wgsl.hlg: string` — WGSL `linearToHlg` and `hlgToLinear`, the BT.2100 HLG OETF and its inverse, sign-mirrored.
- `wgsl.tonemapReinhard: string` — WGSL `tonemapReinhard` and `tonemapReinhardExtended(c, white)`, which saturates to 1 at `white`.
- `wgsl.tonemapAces: string` — WGSL `tonemapAcesFilmic`, ACES filmic tone mapping with the three.js 1 / 0.6 pre-exposure.
- `wgsl.tonemapAgx: string` — WGSL `tonemapAgx` and its helper `tonemapAgxContrast`, AgX tone mapping matching three.js AgXToneMapping.
- `wgsl.tonemapNeutral: string` — WGSL `tonemapNeutral`, Khronos PBR Neutral tone mapping matching three.js NeutralToneMapping.

<a id="api-math-ik"></a>

## `math/ik`

<a id="api-math-ik-fabrik2"></a>

### `fabrik2`

```ts
import { fabrik2 } from 'math/ik';
```

**Types**

- `enum ConstraintCoordinateSystem = LOCAL | GLOBAL` — What a joint's clockwise and anticlockwise limits are measured from.
- `enum BaseboneConstraintType = NONE | GLOBAL_ABSOLUTE | LOCAL_RELATIVE | LOCAL_ABSOLUTE` — How the first bone in a chain is constrained.
- `enum BoneConnectionPoint = START | END` — Which end of a host bone a connected chain hangs off.
- `type Joint2 = { clockwise: number; anticlockwise: number; coordinateSystem: ConstraintCoordinateSystem; globalAxis: Vec2; }` — A joint's rotational limits: a wedge about a baseline.
- `type Bone2 = { start: Vec2; end: Vec2; length: number; joint: Joint2; }` — A single bone: two points, the fixed distance between them, and how it may rotate.
- `type Chain2 = { bones: Bone2[]; length: number; base: Vec2; fixedBase: boolean; baseboneConstraintType: BaseboneConstraintType; baseboneAxis: Vec2; baseboneWorldAxis: Vec2; baseboneClockwise: number; baseboneAnticlockwise: number; embeddedTarget: Vec2; useEmbeddedTarget: boolean; maxIterations: number; solveDistanceThreshold: number; minIterationChange: number; solveDistance: number; bestSolution: number[]; }` — A chain of bones, from the base (index 0) to the end effector (the last bone's `end`).
- `type Connection = { hostChain: number; hostBone: number; point: BoneConnectionPoint; }` — A chain's attachment to a bone in another chain of the same structure.
- `type Structure2 = { chains: Chain2[]; connections: Connection[]; }` — A set of chains, each optionally hanging off a bone of another.

**Create**

- `fabrik2.setLocalJoint(joint: Joint2, clockwise: number, anticlockwise: number): Joint2` — Sets a joint's limits relative to the previous bone's direction, which is the usual case.
- `fabrik2.setGlobalJoint(joint: Joint2, axis: Vec2, clockwise: number, anticlockwise: number): Joint2` — Sets a joint's limits relative to a fixed world direction, pinning the bone's absolute heading
- `fabrik2.setBaseboneConstraint(chain: Chain2, type: BaseboneConstraintType, axis: Vec2, clockwise: number, anticlockwise: number): Chain2` — Constrains the first bone to a wedge about `axis`.
- `fabrik2.setBaseLocation(chain: Chain2, base: Vec2): Chain2` — Moves the chain's pinned base, without moving the bones.

**Operations**

- `fabrik2.createJoint2(): Joint2` — Creates an unconstrained joint.
- `fabrik2.createChain2(): Chain2` — Creates an empty chain with a fixed base at the origin and no basebone constraint.
- `fabrik2.addBone(chain: Chain2, start: Vec2, end: Vec2, joint: Joint2 = createJoint2()): Bone2` — Appends a bone spanning `start` to `end`, copying both.
- `fabrik2.addConsecutiveBone(chain: Chain2, direction: Vec2, length: number, joint: Joint2 = createJoint2()): Bone2` — Appends a bone starting where the chain currently ends, running `length` along `direction`.
- `fabrik2.addBoneAtBase(chain: Chain2, direction: Vec2, length: number, joint: Joint2 = createJoint2()): Bone2` — Prepends a bone at the base end, extending the chain backward.
- `fabrik2.straighten(chain: Chain2, direction: Vec2): Chain2` — Lays the chain out straight from its base along `direction`, discarding the current pose.
- `fabrik2.forward(chain: Chain2, target: Vec2): Chain2` — The forward pass: snaps the end effector onto `target` and drags the rest of the chain after it.
- `fabrik2.backward(chain: Chain2, base: Vec2): Chain2` — The backward pass: pins the base and pushes each bone outward from it. The basebone constraint
- `fabrik2.iterate(chain: Chain2, target: Vec2): number` — One full FABRIK iteration - forward then backward.
- `fabrik2.solve(chain: Chain2, target: Vec2): number` — Solves the chain for `target`, iterating until it is close enough, stops improving, or runs out
- `fabrik2.createStructure2(): Structure2` — Creates an empty structure.
- `fabrik2.addChain(structure: Structure2, chain: Chain2): number` — Adds a chain that hangs off nothing, solving directly for the structure's target.
- `fabrik2.connectChain(structure: Structure2, chain: Chain2, hostChain: number, hostBone: number, point: BoneConnectionPoint): number` — Adds a chain whose base is pinned to one end of a bone in a chain already in the structure.
- `fabrik2.solveStructure(structure: Structure2, target: Vec2): void` — Solves every chain in the structure.

**Query**

- `fabrik2.getEffector(out: Vec2, chain: Chain2): Vec2` — Writes the end effector's position - the last bone's end - into `out`.
- `fabrik2.getBoneDirection(out: Vec2, chain: Chain2, index: number): Vec2` — Writes the unit direction of bone `index`, from its start toward its end, into `out`.
- `fabrik2.getBoneAngle(chain: Chain2, index: number): number` — The angle of bone `index`, in radians, measured counter-clockwise from the +X axis.
- `fabrik2.isReachable(chain: Chain2, target: Vec2): boolean` — Whether `target` is within reach of the chain's base, so a solve can place the effector exactly on it.

<a id="api-math-ik-fabrik3"></a>

### `fabrik3`

```ts
import { fabrik3 } from 'math/ik';
```

**Types**

- `enum JointType = BALL | GLOBAL_HINGE | LOCAL_HINGE` — How a joint may rotate relative to the bone before it.
- `enum BaseboneConstraintType = NONE | GLOBAL_ROTOR | LOCAL_ROTOR | GLOBAL_HINGE | LOCAL_HINGE` — How the first bone in a chain is constrained.
- `enum BoneConnectionPoint = START | END` — Which end of a host bone a connected chain hangs off.
- `type Joint3 = { type: JointType; rotor: number; clockwise: number; anticlockwise: number; rotationAxis: Vec3; referenceAxis: Vec3; }` — A joint's rotational limits.
- `type Bone3 = { start: Vec3; end: Vec3; length: number; joint: Joint3; }` — A single bone: two points, the fixed distance between them, and how it may rotate.
- `type Chain3 = { bones: Bone3[]; length: number; base: Vec3; fixedBase: boolean; baseboneConstraintType: BaseboneConstraintType; baseboneAxis: Vec3; baseboneReferenceAxis: Vec3; baseboneWorldAxis: Vec3; baseboneWorldReferenceAxis: Vec3; baseboneRotor: number; baseboneClockwise: number; baseboneAnticlockwise: number; embeddedTarget: Vec3; useEmbeddedTarget: boolean; maxIterations: number; solveDistanceThreshold: number; minIterationChange: number; solveDistance: number; bestSolution: number[]; }` — A chain of bones, from the base (index 0) to the end effector (the last bone's `end`).
- `type Connection = { hostChain: number; hostBone: number; point: BoneConnectionPoint; }` — A chain's attachment to a bone in another chain of the same structure.
- `type Structure3 = { chains: Chain3[]; connections: Connection[]; }` — A set of chains, each optionally hanging off a bone of another.

**Create**

- `fabrik3.setBallJoint(joint: Joint3, rotor: number): Joint3` — Sets a ball-joint constraint: the bone may rotate within a cone of `rotor` radians about the
- `fabrik3.setHingeJoint(joint: Joint3, type: JointType.GLOBAL_HINGE | JointType.LOCAL_HINGE, rotationAxis: Vec3, clockwise: number, anticlockwise: number, referenceAxis: Vec3): Joint3` — Sets a hinge constraint: the bone may only rotate in the plane perpendicular to `rotationAxis`
- `fabrik3.setBaseboneRotorConstraint(chain: Chain3, type: BaseboneConstraintType.GLOBAL_ROTOR | BaseboneConstraintType.LOCAL_ROTOR, axis: Vec3, rotor: number): Chain3` — Confines the first bone to a cone of `rotor` radians about `axis`.
- `fabrik3.setBaseboneHingeConstraint(chain: Chain3, type: BaseboneConstraintType.GLOBAL_HINGE | BaseboneConstraintType.LOCAL_HINGE, rotationAxis: Vec3, clockwise: number, anticlockwise: number, referenceAxis: Vec3): Chain3` — Confines the first bone to the plane perpendicular to `rotationAxis`, within `clockwise` /
- `fabrik3.setBaseLocation(chain: Chain3, base: Vec3): Chain3` — Moves the chain's pinned base, without moving the bones.

**Operations**

- `fabrik3.createJoint3(): Joint3` — Creates an unconstrained joint.
- `fabrik3.createChain3(): Chain3` — Creates an empty chain with a fixed base at the origin and no basebone constraint.
- `fabrik3.addBone(chain: Chain3, start: Vec3, end: Vec3, joint: Joint3 = createJoint3()): Bone3` — Appends a bone spanning `start` to `end`, copying both.
- `fabrik3.addConsecutiveBone(chain: Chain3, direction: Vec3, length: number, joint: Joint3 = createJoint3()): Bone3` — Appends a bone starting where the chain currently ends, running `length` along `direction`.
- `fabrik3.addBoneAtBase(chain: Chain3, direction: Vec3, length: number, joint: Joint3 = createJoint3()): Bone3` — Prepends a bone at the base end, extending the chain backward.
- `fabrik3.straighten(chain: Chain3, direction: Vec3): Chain3` — Lays the chain out straight from its base along `direction`, discarding the current pose.
- `fabrik3.forward(chain: Chain3, target: Vec3): Chain3` — The forward pass: snaps the end effector onto `target` and drags the rest of the chain after it.
- `fabrik3.backward(chain: Chain3, base: Vec3): Chain3` — The backward pass: pins the base and pushes each bone outward from it.
- `fabrik3.iterate(chain: Chain3, target: Vec3): number` — One full FABRIK iteration - forward then backward. Often enough on its own for an
- `fabrik3.solve(chain: Chain3, target: Vec3): number` — Solves the chain for `target`, iterating until it is close enough, stops improving, or runs out
- `fabrik3.createStructure3(): Structure3` — Creates an empty structure.
- `fabrik3.addChain(structure: Structure3, chain: Chain3): number` — Adds a chain that hangs off nothing, solving directly for the structure's target.
- `fabrik3.connectChain(structure: Structure3, chain: Chain3, hostChain: number, hostBone: number, point: BoneConnectionPoint): number` — Adds a chain whose base is pinned to one end of a bone in a chain already in the structure.
- `fabrik3.solveStructure(structure: Structure3, target: Vec3): void` — Solves every chain in the structure.

**Query**

- `fabrik3.getEffector(out: Vec3, chain: Chain3): Vec3` — Writes the end effector's position - the last bone's end - into `out`.
- `fabrik3.getBoneDirection(out: Vec3, chain: Chain3, index: number): Vec3` — Writes the unit direction of bone `index`, from its start toward its end, into `out`.
- `fabrik3.getBoneRotation(out: Quat, chain: Chain3, index: number, up: Vec3): Quat` — Writes the rotation taking `up` onto the direction of bone `index` into `out`.
- `fabrik3.isReachable(chain: Chain3, target: Vec3): boolean` — Whether `target` is within reach of the chain's base, so a solve can place the effector exactly on it.
