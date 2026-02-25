import ConvertTOMK_Object from "./BaseLibConverter";
import { requireNumber } from "./RequireFunctions";

class _Engine3D {
  // Vector 3D dot product
  public dot(x1: any, y1: any, z1: any, x2: any, y2: any, z2: any): number {
    x1 = requireNumber(x1);
    y1 = requireNumber(y1);
    z1 = requireNumber(z1);
    x2 = requireNumber(x2);
    y2 = requireNumber(y2);
    z2 = requireNumber(z2);
    return x1 * x2 + y1 * y2 + z1 * z2;
  }

  // Cross product
  public cross(x1: any, y1: any, z1: any, x2: any, y2: any, z2: any): any {
    x1 = requireNumber(x1);
    y1 = requireNumber(y1);
    z1 = requireNumber(z1);
    x2 = requireNumber(x2);
    y2 = requireNumber(y2);
    z2 = requireNumber(z2);
    return {
      x: y1 * z2 - z1 * y2,
      y: z1 * x2 - x1 * z2,
      z: x1 * y2 - y1 * x2,
    };
  }

  // Normalize
  public normalize(x: any, y: any, z: any): any {
    x = requireNumber(x);
    y = requireNumber(y);
    z = requireNumber(z);
    let len = Math.sqrt(x * x + y * y + z * z);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: x / len, y: y / len, z: z / len };
  }

  // Project 3D point to 2D screen
  // fov: field of view
  // viewerDistance: distance of eye to screen
  public project(
    x: any,
    y: any,
    z: any,
    screenWidth: any,
    screenHeight: any,
    fov: any,
    viewerDistance: any,
  ): any {
    x = requireNumber(x);
    y = requireNumber(y);
    z = requireNumber(z);
    screenWidth = requireNumber(screenWidth);
    screenHeight = requireNumber(screenHeight);
    fov = requireNumber(fov);
    viewerDistance = requireNumber(viewerDistance);

    let factor = fov / (viewerDistance + z);
    let xProjected = x * factor + screenWidth / 2;
    let yProjected = -y * factor + screenHeight / 2;

    return { x: xProjected, y: yProjected, scale: factor };
  }

  // Rotate point
  public rotateX(x: any, y: any, z: any, angle: any): any {
    x = requireNumber(x);
    y = requireNumber(y);
    z = requireNumber(z);
    angle = requireNumber(angle);
    let rad = (angle * Math.PI) / 180;
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    let ny = y * cos - z * sin;
    let nz = y * sin + z * cos;
    return { x: x, y: ny, z: nz };
  }

  public rotateY(x: any, y: any, z: any, angle: any): any {
    x = requireNumber(x);
    y = requireNumber(y);
    z = requireNumber(z);
    angle = requireNumber(angle);
    let rad = (angle * Math.PI) / 180;
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    let nx = x * cos + z * sin;
    let nz = -x * sin + z * cos;
    return { x: nx, y: y, z: nz };
  }

  public rotateZ(x: any, y: any, z: any, angle: any): any {
    x = requireNumber(x);
    y = requireNumber(y);
    z = requireNumber(z);
    angle = requireNumber(angle);
    let rad = (angle * Math.PI) / 180;
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    let nx = x * cos - y * sin;
    let ny = x * sin + y * cos;
    return { x: nx, y: ny, z: z };
  }
}

export const Engine3DL = ConvertTOMK_Object(new _Engine3D());
