import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 
 * 线段图形生成器
 * 用于生成直线上均匀分布的点集合
 * 支持自定义起点、终点和点数
 */
export class LineShapeGenerator implements ShapeGeneratorInterface {
  /**
   * 构造函数
   * @param startPoint 线段起点
   * @param endPoint 线段终点
   * @param pointCount 生成的点的数量（至少2个）
   */
  constructor(
    private startPoint: Point,
    private endPoint: Point,
    private pointCount: number = 10
  ) {
    this.pointCount = Math.max(2, this.pointCount);
  }

  /**
   * 生成线段上的点集合
   * 点均匀分布在起点和终点之间，包含两端点
   * @returns 点集合
   */
  public generatePoints(): Point[] {
    const points: Point[] = [];

    for (let i = 0; i < this.pointCount; i++) {
      const t = i / (this.pointCount - 1);
      const x = this.startPoint.x + (this.endPoint.x - this.startPoint.x) * t;
      const y = this.startPoint.y + (this.endPoint.y - this.startPoint.y) * t;
      points.push(new Point(x, y));
    }

    return points;
  }

  /**
   * 获取线段包围盒
   * 包围盒覆盖起点和终点所在的最小矩形区域
   * @returns 包围盒矩形
   */
  public getBoundingBox(): Rectangle {
    const minX = Math.min(this.startPoint.x, this.endPoint.x);
    const minY = Math.min(this.startPoint.y, this.endPoint.y);
    const maxX = Math.max(this.startPoint.x, this.endPoint.x);
    const maxY = Math.max(this.startPoint.y, this.endPoint.y);
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }
}
