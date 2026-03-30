import type { Point2D, Vector2D } from '../types';

/** 二维点类 */
export class Point {
  public x: number; // x坐标
  public y: number; // y坐标

  /**
   * 创建一个二维点
   * @param x x坐标
   * @param y y坐标
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * 从对象创建点
   * @param obj Point2D对象
   * @returns 新的Point实例
   */
  public static fromObject(obj: Point2D): Point {
    return new Point(obj.x, obj.y);
  }

  /**
   * 计算到另一个点的距离
   * @param other 另一个点
   * @returns 两点之间的距离
   */
  public distanceTo(other: Point): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算到另一个点距离的平方（避免开方运算，提高性能）
   * @param other 另一个点
   * @returns 距离的平方
   */
  public distanceToSquared(other: Point): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return dx * dx + dy * dy;
  }

  /**
   * 加上向量
   * @param vector 要加的向量
   * @returns 新的Point实例
   */
  public add(vector: Vector2D): Point {
    return new Point(this.x + vector.x, this.y + vector.y);
  }

  /**
   * 减去向量
   * @param vector 要减的向量
   * @returns 新的Point实例
   */
  public subtract(vector: Vector2D): Point {
    return new Point(this.x - vector.x, this.y - vector.y);
  }

  /**
   * 乘以标量
   * @param scalar 标量值
   * @returns 新的Point实例
   */
  public multiply(scalar: number): Point {
    return new Point(this.x * scalar, this.y * scalar);
  }

  /**
   * 除以标量
   * @param scalar 标量值
   * @returns 新的Point实例
   * @throws 当除数为0时抛出错误
   */
  public divide(scalar: number): Point {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    return new Point(this.x / scalar, this.y / scalar);
  }

  /**
   * 判断是否与另一个点相等
   * @param other 另一个点
   * @returns 是否相等
   */
  public equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * 克隆点
   * @returns 新的Point实例
   */
  public clone(): Point {
    return new Point(this.x, this.y);
  }

  /**
   * 转换为对象
   * @returns Point2D对象
   */
  public toObject(): Point2D {
    return { x: this.x, y: this.y };
  }

  /**
   * 转换为字符串
   * @returns 字符串表示
   */
  public toString(): string {
    return `Point(${this.x}, ${this.y})`;
  }
}