import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 
 * 三角形图形生成器
 * 用于生成三角形排列的点集合
 * 支持等边、等腰、直角等多种三角形类型
 */
export class TriangleShapeGenerator implements ShapeGeneratorInterface {
  /**
   * 构造函数
   * @param point1 第一个顶点
   * @param point2 第二个顶点
   * @param point3 第三个顶点
   * @param pointCount 点的数量（每条边的点数）
   */
  constructor(
    private point1: Point,
    private point2: Point,
    private point3: Point,
    private pointCount: number = 10
  ) {}

  /**
   * 生成三角形排列的点集合
   * @returns 三角形上均匀分布的点数组
   */
  public generatePoints(): Point[] {
    const points: Point[] = [];
    
    // 确保点数至少为2
    const safePointCount = Math.max(2, this.pointCount);
    
    // 所有点都分布在三条边上
    const pointsPerEdge = Math.max(2, Math.floor(safePointCount / 3));
    
    // 生成三条边的点（边界）
    this.generateEdgePoints(this.point1, this.point2, pointsPerEdge, points);
    this.generateEdgePoints(this.point2, this.point3, pointsPerEdge, points);
    this.generateEdgePoints(this.point3, this.point1, pointsPerEdge, points);
    
    return points;
  }

  /**
   * 生成边上的点
   * @param start 起点
   * @param end 终点
   * @param count 点数
   * @param points 点集合
   */
  private generateEdgePoints(start: Point, end: Point, count: number, points: Point[]): void {
    for (let i = 0; i< count; i++) {
      const t = i / (count - 1);
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      points.push(new Point(x, y));
    }
  }



  /**
   * 获取三角形的边界矩形
   * @returns 包围三角形的最小矩形
   */
  public getBoundingBox(): Rectangle {
    const minX = Math.min(this.point1.x, this.point2.x, this.point3.x);
    const maxX = Math.max(this.point1.x, this.point2.x, this.point3.x);
    const minY = Math.min(this.point1.y, this.point2.y, this.point3.y);
    const maxY = Math.max(this.point1.y, this.point2.y, this.point3.y);
    
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }



  /**
   * 设置点数
   * @param pointCount 点数
   */
  public setPointCount(pointCount: number): void {
    this.pointCount = Math.max(2, pointCount);
  }
}