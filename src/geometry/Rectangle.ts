import { Point } from './Point';

/** 矩形类 */
export class Rectangle {
  public x: number; // 左上角x坐标
  public y: number; // 左上角y坐标
  public width: number; // 宽度
  public height: number; // 高度

  /**
   * 创建一个矩形
   * @param x 左上角x坐标
   * @param y 左上角y坐标
   * @param width 宽度
   * @param height 高度
   */
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /** 获取左边界 */
  public get left(): number {
    return this.x;
  }

  /** 获取上边界 */
  public get top(): number {
    return this.y;
  }

  /** 获取右边界 */
  public get right(): number {
    return this.x + this.width;
  }

  /** 获取下边界 */
  public get bottom(): number {
    return this.y + this.height;
  }

  /** 获取中心点 */
  public get center(): Point {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  }

  /** 获取面积 */
  public get area(): number {
    return this.width * this.height;
  }

  /**
   * 判断点是否在矩形内
   * @param point 要判断的点
   * @returns 是否在矩形内
   */
  public contains(point: Point): boolean {
    return (
      point.x >= this.left &&
      point.x<= this.right &&
      point.y >= this.top &&
      point.y <= this.bottom
    );
  }

  /**
   * 判断是否与另一个矩形相交
   * @param other 另一个矩形
   * @returns 是否相交
   */
  public intersects(other: Rectangle): boolean {
    return !(
      other.right< this.left ||
      other.left >this.right ||
      other.bottom< this.top ||
      other.top >this.bottom
    );
  }

  /**
   * 判断是否与圆相交
   * @param center 圆心
   * @param radius 圆半径
   * @returns 是否相交
   */
  public intersectsCircle(center: Point, radius: number): boolean {
    const closestX = Math.max(this.left, Math.min(center.x, this.right));
    const closestY = Math.max(this.top, Math.min(center.y, this.bottom));
    
    const distanceSquared = (center.x - closestX) ** 2 + (center.y - closestY) ** 2;
    return distanceSquared<= radius ** 2;
  }

  /**
   * 计算与另一个矩形的并集
   * @param other 另一个矩形
   * @returns 并集矩形
   */
  public union(other: Rectangle): Rectangle {
    const left = Math.min(this.left, other.left);
    const top = Math.min(this.top, other.top);
    const right = Math.max(this.right, other.right);
    const bottom = Math.max(this.bottom, other.bottom);
    
    return new Rectangle(left, top, right - left, bottom - top);
  }

  /**
   * 克隆矩形
   * @returns 新的Rectangle实例
   */
  public clone(): Rectangle {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  /**
   * 转换为字符串
   * @returns 字符串表示
   */
  public toString(): string {
    return `Rectangle(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
  }
}