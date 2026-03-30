import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 
 * 扇形图形生成器
 * 用于生成扇形排列的点集合
 * 支持自定义角度范围和半径
 */
export class SectorShapeGenerator implements ShapeGeneratorInterface {
  /**
   * 构造函数
   * @param center 圆心坐标
   * @param radius 半径
   * @param startAngle 起始角度（弧度）
   * @param endAngle 结束角度（弧度）
   * @param pointCount 点的数量
   */
  constructor(
    private center: Point,
    private radius: number,
    private startAngle: number = 0,
    private endAngle: number = Math.PI / 2, // 默认90度扇形
    private pointCount: number = 32
  ) {}

  /**
   * 生成扇形排列的点集合
   * @returns 扇形上均匀分布的点数组
   */
  public generatePoints(): Point[] {
    const points: Point[] = [];
    
    // 确保点数至少为3
    const safePointCount = Math.max(3, this.pointCount);
    
    // 所有点都分布在边界上
    const totalBoundaryPoints = safePointCount;
    
    // 分配点数：弧线60%，两条半径各20%
    const arcPoints = Math.floor(totalBoundaryPoints * 0.6);
    const radiusPoints = Math.floor(totalBoundaryPoints * 0.2);
    
    // 确保至少有2个点用于弧线，每条半径至少有1个点
    const finalArcPoints = Math.max(2, arcPoints);
    const finalRadiusPoints = Math.max(1, radiusPoints);
    
    // 生成弧线上的点（边界）
    this.generateArcPoints(finalArcPoints, points);
    
    // 生成两条半径上的点（边界）
    this.generateRadiusPoints(finalRadiusPoints, points);
    
    return points;
  }

  /**
   * 生成弧线上的点
   * @param count 点数
   * @param points 点集合
   */
  private generateArcPoints(count: number, points: Point[]): void {
    const angleStep = (this.endAngle - this.startAngle) / (count - 1);
    
    for (let i = 0; i< count; i++) {
      const angle = this.startAngle + i * angleStep;
      const x = this.center.x + this.radius * Math.cos(angle);
      const y = this.center.y + this.radius * Math.sin(angle);
      points.push(new Point(x, y));
    }
  }

  /**
   * 生成半径上的点
   * @param count 每条半径的点数
   * @param points 点集合
   */
  private generateRadiusPoints(count: number, points: Point[]): void {
    // 第一条半径（起始角度）
    for (let i = 0; i< count; i++) {
      const t = i / (count - 1);
      const x = this.center.x + this.radius * Math.cos(this.startAngle) * t;
      const y = this.center.y + this.radius * Math.sin(this.startAngle) * t;
      points.push(new Point(x, y));
    }
    
    // 第二条半径（结束角度）
    for (let i = 0; i< count; i++) {
      const t = i / (count - 1);
      const x = this.center.x + this.radius * Math.cos(this.endAngle) * t;
      const y = this.center.y + this.radius * Math.sin(this.endAngle) * t;
      points.push(new Point(x, y));
    }
  }



  /**
   * 获取扇形的边界矩形
   * @returns 包围扇形的最小矩形
   */
  public getBoundingBox(): Rectangle {
    // 计算扇形的边界
    const angleRange = this.endAngle - this.startAngle;
    
    let minX = this.center.x;
    let maxX = this.center.x;
    let minY = this.center.y;
    let maxY = this.center.y;
    
    // 检查起始角度和结束角度的点
    const startX = this.center.x + this.radius * Math.cos(this.startAngle);
    const startY = this.center.y + this.radius * Math.sin(this.startAngle);
    const endX = this.center.x + this.radius * Math.cos(this.endAngle);
    const endY = this.center.y + this.radius * Math.sin(this.endAngle);
    
    minX = Math.min(minX, startX, endX);
    maxX = Math.max(maxX, startX, endX);
    minY = Math.min(minY, startY, endY);
    maxY = Math.max(maxY, startY, endY);
    
    // 如果扇形包含某些特殊角度，需要额外检查
    if (angleRange > Math.PI / 2) {
      // 检查0度方向
      if (this.startAngle <= 0 && this.endAngle >= 0) {
        maxX = Math.max(maxX, this.center.x + this.radius);
      }
      
      // 检查90度方向
      if (this.startAngle <= Math.PI / 2 && this.endAngle >= Math.PI / 2) {
        maxY = Math.max(maxY, this.center.y + this.radius);
      }
      
      // 检查180度方向
      if (this.startAngle <= Math.PI && this.endAngle >= Math.PI) {
        minX = Math.min(minX, this.center.x - this.radius);
      }
      
      // 检查270度方向
      if (this.startAngle <= 3 * Math.PI / 2 && this.endAngle >= 3 * Math.PI / 2) {
        minY = Math.min(minY, this.center.y - this.radius);
      }
    }
    
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }

  /**
   * 设置半径
   * @param radius 半径
   */
  public setRadius(radius: number): void {
    this.radius = radius;
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
    this.pointCount = Math.max(3, pointCount);
  }
}