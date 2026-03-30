import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 
 * 平行四边形图形生成器
 * 用于生成平行四边形排列的点集合
 * 支持自定义边长和角度
 */
export class ParallelogramShapeGenerator implements ShapeGeneratorInterface {
  /**
   * 构造函数
   * @param topLeft 左上角顶点
   * @param width 底边长度
   * @param height 高度
   * @param skewAngle 倾斜角度（弧度）
   * @param pointCount 点的数量
   */
  constructor(
    private topLeft: Point,
    private width: number,
    private height: number,
    private skewAngle: number = Math.PI / 6, // 30度倾斜
    private pointCount: number = 20
  ) {}

  /**
   * 生成平行四边形排列的点集合
   * @returns 平行四边形上均匀分布的点数组
   */
  public generatePoints(): Point[] {
    const points: Point[] = [];
    
    // 计算四个顶点
    const topRight = new Point(
      this.topLeft.x + this.width,
      this.topLeft.y
    );
    
    const bottomLeft = new Point(
      this.topLeft.x + Math.tan(this.skewAngle) * this.height,
      this.topLeft.y + this.height
    );
    
    const bottomRight = new Point(
      bottomLeft.x + this.width,
      bottomLeft.y
    );
    
    // 确保点数至少为4
    const safePointCount = Math.max(4, this.pointCount);
    
    // 所有点都分布在四条边上
    const pointsPerEdge = Math.max(2, Math.floor(safePointCount / 4));
    
    // 生成四条边的点（边界）
    this.generateEdgePoints(this.topLeft, topRight, pointsPerEdge, points);
    this.generateEdgePoints(topRight, bottomRight, pointsPerEdge, points);
    this.generateEdgePoints(bottomRight, bottomLeft, pointsPerEdge, points);
    this.generateEdgePoints(bottomLeft, this.topLeft, pointsPerEdge, points);
    
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
   * 获取平行四边形的边界矩形
   * @returns 包围平行四边形的最小矩形
   */
  public getBoundingBox(): Rectangle {
    const skewOffset = Math.tan(this.skewAngle) * this.height;
    
    const minX = Math.min(this.topLeft.x, this.topLeft.x + skewOffset);
    const maxX = Math.max(this.topLeft.x + this.width, this.topLeft.x + this.width + skewOffset);
    const minY = this.topLeft.y;
    const maxY = this.topLeft.y + this.height;
    
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }



  /**
   * 设置点数
   * @param pointCount 点数
   */
  public setPointCount(pointCount: number): void {
    this.pointCount = Math.max(4, pointCount);
  }

  /**
   * 设置倾斜角度
   * @param skewAngle 倾斜角度（弧度）
   */
  public setSkewAngle(skewAngle: number): void {
    this.skewAngle = skewAngle;
  }
}