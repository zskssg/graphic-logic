import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 
 * 圆台图形生成器
 * 用于生成圆台（截头圆锥）的二维投影点集合
 * 支持自定义上下底面半径和高度
 */
export class TruncatedConeShapeGenerator implements ShapeGeneratorInterface {
  /**
   * 构造函数
   * @param center 中心点坐标
   * @param topRadius 上底面半径
   * @param bottomRadius 下底面半径
   * @param height 圆台高度
   * @param pointCount 点的数量
   */
  constructor(
    private center: Point,
    private topRadius: number,
    private bottomRadius: number,
    private height: number,
    private pointCount: number = 32
  ) {}

  /**
   * 生成圆台排列的点集合
   * @returns 圆台投影上均匀分布的点数组
   */
  public generatePoints(): Point[] {
    const points: Point[] = [];
    
    // 确保点数至少为4
    const safePointCount = Math.max(4, this.pointCount);
    
    // 计算上下底面中心的投影位置
    const topCenter = new Point(
      this.center.x,
      this.center.y - this.height / 2
    );
    
    const bottomCenter = new Point(
      this.center.x,
      this.center.y + this.height / 2
    );
    
    // 所有点都分布在边界上
    const totalBoundaryPoints = safePointCount;
    
    // 分配点数：上下底面各40%，侧面连接线20%
    const circumferencePoints = Math.floor(totalBoundaryPoints * 0.4);
    const sideLinesCount = Math.floor(totalBoundaryPoints * 0.2);
    
    // 确保至少有2个点用于上下底面
    const finalCircumferencePoints = Math.max(2, circumferencePoints);
    const finalSideLinesCount = Math.max(1, sideLinesCount);
    
    // 生成上底面的点（边界）
    this.generateCirclePoints(topCenter, this.topRadius, finalCircumferencePoints, points);
    
    // 生成下底面的点（边界）
    this.generateCirclePoints(bottomCenter, this.bottomRadius, finalCircumferencePoints, points);
    
    // 生成侧面的连接线（边界）
    const remainingPoints = totalBoundaryPoints - points.length;
    const pointsPerSide = Math.max(1, Math.floor(remainingPoints / finalSideLinesCount));
    
    this.generateSideLines(topCenter, bottomCenter, finalSideLinesCount, pointsPerSide, points);
    
    return points;
  }

  /**
   * 生成圆形上的点
   * @param center 圆心
   * @param radius 半径
   * @param count 点数
   * @param points 点集合
   */
  private generateCirclePoints(center: Point, radius: number, count: number, points: Point[]): void {
    for (let i = 0; i< count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      points.push(new Point(x, y));
    }
  }

  /**
   * 生成侧面连接线
   * @param topCenter 上底面中心
   * @param bottomCenter 下底面中心
   * @param linesCount 连接线数量
   * @param pointsPerLine 每条线上的点数
   * @param points 点集合
   */
  private generateSideLines(topCenter: Point, bottomCenter: Point, linesCount: number, pointsPerLine: number, points: Point[]): void {
    for (let i = 0; i< linesCount; i++) {
      const angle = (i / linesCount) * 2 * Math.PI;
      
      // 上底面点
      const topX = topCenter.x + this.topRadius * Math.cos(angle);
      const topY = topCenter.y + this.topRadius * Math.sin(angle);
      
      // 下底面点
      const bottomX = bottomCenter.x + this.bottomRadius * Math.cos(angle);
      const bottomY = bottomCenter.y + this.bottomRadius * Math.sin(angle);
      
      // 生成连接线上的点（不包括端点，避免重复）
      for (let j = 1; j < pointsPerLine; j++) {
        const t = j / pointsPerLine;
        const x = topX + (bottomX - topX) * t;
        const y = topY + (bottomY - topY) * t;
        points.push(new Point(x, y));
      }
    }
  }



  /**
   * 获取圆台的边界矩形
   * @returns 包围圆台的最小矩形
   */
  public getBoundingBox(): Rectangle {
    const maxRadius = Math.max(this.topRadius, this.bottomRadius);
    
    return new Rectangle(
      this.center.x - maxRadius,
      this.center.y - this.height / 2 - maxRadius,
      maxRadius * 2,
      this.height + maxRadius * 2
    );
  }

  /**
   * 设置上底面半径
   * @param topRadius 上底面半径
   */
  public setTopRadius(topRadius: number): void {
    this.topRadius = topRadius;
  }

  /**
   * 设置下底面半径
   * @param bottomRadius 下底面半径
   */
  public setBottomRadius(bottomRadius: number): void {
    this.bottomRadius = bottomRadius;
  }

  /**
   * 设置高度
   * @param height 高度
   */
  public setHeight(height: number): void {
    this.height = height;
  }



  /**
   * 设置点数
   * @param pointCount 点数
   */
  public setPointCount(pointCount: number): void {
    this.pointCount = Math.max(4, pointCount);
  }
}