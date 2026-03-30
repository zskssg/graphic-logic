import { Point } from './Point';

/** 圆形类 */
export class Circle {
  public center: Point; // 圆心
  public radius: number; // 半径

  /**
   * 创建一个圆形
   * @param center 圆心
   * @param radius 半径
   * @throws 当半径小于等于0时抛出错误
   */
  constructor(center: Point, radius: number) {
    if (radius<= 0) {
      throw new Error('Radius must be positive');
    }
    this.center = center;
    this.radius = radius;
  }

  /** 获取周长 */
  public get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  /** 获取面积 */
  public get area(): number {
    return Math.PI * this.radius * this.radius;
  }

  /**
   * 判断点是否在圆内
   * @param point 要判断的点
   * @returns 是否在圆内
   */
  public contains(point: Point): boolean {
    return this.center.distanceToSquared(point)<= this.radius * this.radius;
  }

  /**
   * 判断是否与另一个圆相交
   * @param other 另一个圆
   * @returns 是否相交
   */
  public intersects(other: Circle): boolean {
    const distance = this.center.distanceTo(other.center);
    return distance<= this.radius + other.radius && distance >= Math.abs(this.radius - other.radius);
  }

  /**
   * 判断是否与线段相交
   * @param line 线段对象（包含start和end属性）
   * @returns 是否相交
   */
  public intersectsLine(line: { start: Point; end: Point }): boolean {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    
    const a = dx * dx + dy * dy;
    const b = 2 * (dx * (line.start.x - this.center.x) + dy * (line.start.y - this.center.y));
    const c = (line.start.x - this.center.x) ** 2 + (line.start.y - this.center.y) ** 2 - this.radius ** 2;
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant< 0) {
      return false;
    }
    
    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
    
    return (t1 >= 0 && t1<= 1) || (t2 >= 0 && t2 <= 1);
  }

  /**
   * 获取从外部点到圆的切线点
   * @param point 外部点
   * @returns 两个切点（如果点在圆外）或null（如果点在圆内或圆上）
   */
  public getTangentPoints(point: Point): [Point, Point] | null {
    const distance = this.center.distanceTo(point);
    
    if (distance<= this.radius) {
      return null;
    }
    
    const angle = Math.asin(this.radius / distance);
    const direction = Math.atan2(point.y - this.center.y, point.x - this.center.x);
    
    const angle1 = direction - angle;
    const angle2 = direction + angle;
    
    const x1 = this.center.x + this.radius * Math.cos(angle1);
    const y1 = this.center.y + this.radius * Math.sin(angle1);
    const x2 = this.center.x + this.radius * Math.cos(angle2);
    const y2 = this.center.y + this.radius * Math.sin(angle2);
    
    return [new Point(x1, y1), new Point(x2, y2)];
  }

  /**
   * 克隆圆形
   * @returns 新的Circle实例
   */
  public clone(): Circle {
    return new Circle(this.center.clone(), this.radius);
  }

  /**
   * 转换为字符串
   * @returns 字符串表示
   */
  public toString(): string {
    return `Circle(${this.center}, ${this.radius})`;
  }
}