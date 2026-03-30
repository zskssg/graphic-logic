import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 
 * 圆环图形生成器
 * 用于生成圆环（环形）排列的点集合
 * 支持自定义内半径和外半径
 */
export class RingShapeGenerator implements ShapeGeneratorInterface {
  /**
   * 构造函数
   * @param center 圆心坐标
   * @param innerRadius 内半径
   * @param outerRadius 外半径
   * @param pointCount 点的数量
   * @param startAngle 起始角度（弧度）
   * @param endAngle 结束角度（弧度）
   */
  constructor(
    private center: Point,
    private innerRadius: number,
    private outerRadius: number,
    private pointCount: number = 64,
    private startAngle: number = 0,
    private endAngle: number = 2 * Math.PI
  ) {
    // 确保内半径小于外半径
    if (this.innerRadius >= this.outerRadius) {
      this.innerRadius = this.outerRadius * 0.5;
    }
  }

  /**
   * 生成圆环排列的点集合
   * @returns 圆环上均匀分布的点数组
   */
  public generatePoints(): Point[] {
    const points: Point[] = [];
    
    // 确保点数至少为4
    const safePointCount = Math.max(4, this.pointCount);
    
    // 所有点都分布在边界上
    const totalBoundaryPoints = safePointCount;
    
    // 分配点数：内外圆环各40%，连接线20%
    const circumferencePoints = Math.floor(totalBoundaryPoints * 0.4);
    const connectionLinesCount = Math.floor(totalBoundaryPoints * 0.2);
    
    // 确保至少有2个点用于内外圆环，至少有1条连接线
    const finalCircumferencePoints = Math.max(2, circumferencePoints);
    const finalConnectionLinesCount = Math.max(1, connectionLinesCount);
    
    // 生成内外圆环上的点（边界）
    this.generateCirclePoints(this.innerRadius, finalCircumferencePoints, points);
    this.generateCirclePoints(this.outerRadius, finalCircumferencePoints, points);
    
    // 生成连接内外圆环的线（边界）
    const remainingPoints = totalBoundaryPoints - points.length;
    const pointsPerLine = Math.max(1, Math.floor(remainingPoints / finalConnectionLinesCount));
    
    this.generateConnectionLines(finalConnectionLinesCount, pointsPerLine, points);
    
    return points;
  }

  /**
   * 生成圆形上的点
   * @param radius 半径
   * @param count 点数
   * @param points 点集合
   */
  private generateCirclePoints(radius: number, count: number, points: Point[]): void {
    const angleStep = (this.endAngle - this.startAngle) / (count - 1);
    
    for (let i = 0; i< count; i++) {
      const angle = this.startAngle + i * angleStep;
      const x = this.center.x + radius * Math.cos(angle);
      const y = this.center.y + radius * Math.sin(angle);
      points.push(new Point(x, y));
    }
  }

  /**
   * 生成连接内外圆环的线
   * @param linesCount 连接线数量
   * @param pointsPerLine 每条线上的点数
   * @param points 点集合
   */
  private generateConnectionLines(linesCount: number, pointsPerLine: number, points: Point[]): void {
    for (let i = 0; i< linesCount; i++) {
      const angle = this.startAngle + (i / linesCount) * (this.endAngle - this.startAngle);
      
      // 内圆上的点
      const innerX = this.center.x + this.innerRadius * Math.cos(angle);
      const innerY = this.center.y + this.innerRadius * Math.sin(angle);
      
      // 外圆上的点
      const outerX = this.center.x + this.outerRadius * Math.cos(angle);
      const outerY = this.center.y + this.outerRadius * Math.sin(angle);
      
      // 生成连接线上的点（不包括端点，避免重复）
      for (let j = 1; j < pointsPerLine; j++) {
        const t = j / pointsPerLine;
        const x = innerX + (outerX - innerX) * t;
        const y = innerY + (outerY - innerY) * t;
        points.push(new Point(x, y));
      }
    }
  }



  /**
   * 获取圆环的边界矩形
   * @returns 包围圆环的最小矩形
   */
  public getBoundingBox(): Rectangle {
    return new Rectangle(
      this.center.x - this.outerRadius,
      this.center.y - this.outerRadius,
      this.outerRadius * 2,
      this.outerRadius * 2
    );
  }

  /**
   * 设置内半径
   * @param innerRadius 内半径
   */
  public setInnerRadius(innerRadius: number): void {
    this.innerRadius = Math.min(innerRadius, this.outerRadius * 0.99);
  }

  /**
   * 设置外半径
   * @param outerRadius 外半径
   */
  public setOuterRadius(outerRadius: number): void {
    this.outerRadius = Math.max(outerRadius, this.innerRadius * 1.01);
  }

  /**
   * 设置角度范围
   * @param startAngle 起始角度（弧度）
   * @param endAngle 结束角度（弧度）
   */
  public setAngleRange(startAngle: number, endAngle: number): void {
    this.startAngle = startAngle;
    this.endAngle = endAngle;
  }



  /**
   * 设置点数
   * @param pointCount 点数
   */
  public setPointCount(pointCount: number): void {
    this.pointCount = Math.max(4, pointCount);
  }
}