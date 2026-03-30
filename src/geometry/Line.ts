import { Point } from './Point';

/** 线段类 */
export class Line {
  public start: Point; // 起点
  public end: Point; // 终点

  /**
   * 创建一条线段
   * @param start 起点
   * @param end 终点
   */
  constructor(start: Point, end: Point) {
    this.start = start;
    this.end = end;
  }

  /** 获取线段长度 */
  public get length(): number {
    return this.start.distanceTo(this.end);
  }

  /** 获取线段中点 */
  public get midpoint(): Point {
    return new Point(
      (this.start.x + this.end.x) / 2,
      (this.start.y + this.end.y) / 2
    );
  }

  /** 获取线段斜率（垂直时返回undefined） */
  public get slope(): number | undefined {
    const dx = this.end.x - this.start.x;
    if (dx === 0) {
      return undefined;
    }
    return (this.end.y - this.start.y) / dx;
  }

  /**
   * 判断是否与另一条线段相交
   * @param other 另一条线段
   * @returns 交点（如果相交）或null（如果不相交）
   */
  public intersects(other: Line): Point | null {
    const x1 = this.start.x;
    const y1 = this.start.y;
    const x2 = this.end.x;
    const y2 = this.end.y;
    const x3 = other.start.x;
    const y3 = other.start.y;
    const x4 = other.end.x;
    const y4 = other.end.y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    if (denominator === 0) {
      return null;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    if (t >= 0 && t<= 1 && u >= 0 && u<= 1) {
      return new Point(
        x1 + t * (x2 - x1),
        y1 + t * (y2 - y1)
      );
    }

    return null;
  }

  /**
   * 判断点是否在线段上
   * @param point 要判断的点
   * @returns 是否在线段上
   */
  public contains(point: Point): boolean {
    const crossProduct = (point.y - this.start.y) * (this.end.x - this.start.x) - (point.x - this.start.x) * (this.end.y - this.start.y);
    
    if (Math.abs(crossProduct) >1e-10) {
      return false;
    }

    const dotProduct = (point.x - this.start.x) * (this.end.x - this.start.x) + (point.y - this.start.y) * (this.end.y - this.start.y);
    if (dotProduct< 0) {
      return false;
    }

    const squaredLength = (this.end.x - this.start.x) * (this.end.x - this.start.x) + (this.end.y - this.start.y) * (this.end.y - this.start.y);
    if (dotProduct >squaredLength) {
      return false;
    }

    return true;
  }

  /**
   * 克隆线段
   * @returns 新的Line实例
   */
  public clone(): Line {
    return new Line(this.start.clone(), this.end.clone());
  }

  /**
   * 转换为字符串
   * @returns 字符串表示
   */
  public toString(): string {
    return `Line(${this.start}, ${this.end})`;
  }
}