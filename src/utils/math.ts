/**
 * 将值限制在指定范围内
 * @param value 要限制的值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值
 * @param a 起始值
 * @param b 结束值
 * @param t 插值因子（0-1）
 * @returns 插值结果
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * 将值从一个范围映射到另一个范围
 * @param value 要映射的值
 * @param inMin 输入范围最小值
 * @param inMax 输入范围最大值
 * @param outMin 输出范围最小值
 * @param outMax 输出范围最大值
 * @returns 映射后的值
 */
export function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/**
 * 将角度从度数转换为弧度
 * @param degrees 角度值（度）
 * @returns 弧度值
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * 将角度从弧度转换为度数
 * @param radians 弧度值
 * @returns 角度值（度）
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * 计算两点之间的距离
 * @param x1 第一个点的x坐标
 * @param y1 第一个点的y坐标
 * @param x2 第二个点的x坐标
 * @param y2 第二个点的y坐标
 * @returns 两点之间的距离
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算两点之间距离的平方（避免开方运算，提高性能）
 * @param x1 第一个点的x坐标
 * @param y1 第一个点的y坐标
 * @param x2 第二个点的x坐标
 * @param y2 第二个点的y坐标
 * @returns 两点之间距离的平方
 */
export function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/**
 * 计算两点之间的角度（弧度）
 * @param x1 第一个点的x坐标
 * @param y1 第一个点的y坐标
 * @param x2 第二个点的x坐标
 * @param y2 第二个点的y坐标
 * @returns 角度值（弧度）
 */
export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * 将角度标准化到 [0, 2π) 范围
 * @param angle 角度值（弧度）
 * @returns 标准化后的角度值
 */
export function normalizeAngle(angle: number): number {
  angle = angle % (2 * Math.PI);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
}

/**
 * 生成指定范围内的随机浮点数
 * @param min 最小值（包含）
 * @param max 最大值（不包含）
 * @returns 随机浮点数
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * 生成指定范围内的随机整数
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 按指定精度四舍五入
 * @param value 要四舍五入的值
 * @param precision 小数位数
 * @returns 四舍五入后的值
 */
export function roundToPrecision(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * 判断点是否在圆内
 * @param px 点的x坐标
 * @param py 点的y坐标
 * @param cx 圆心x坐标
 * @param cy 圆心y坐标
 * @param radius 圆半径
 * @returns 是否在圆内
 */
export function isPointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
  return distanceSquared(px, py, cx, cy)<= radius * radius;
}

/**
 * 判断点是否在矩形内
 * @param px 点的x坐标
 * @param py 点的y坐标
 * @param rx 矩形左上角x坐标
 * @param ry 矩形左上角y坐标
 * @param rw 矩形宽度
 * @param rh 矩形高度
 * @returns 是否在矩形内
 */
export function isPointInRectangle(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}