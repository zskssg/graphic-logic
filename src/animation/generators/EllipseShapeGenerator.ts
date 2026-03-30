import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 
 * 椭圆形图形生成器
 * 用于生成椭圆形排列的点集合
 * 支持不同的长轴和短轴
 */
export class EllipseShapeGenerator implements ShapeGeneratorInterface {
  /**
   * 构造函数
   * @param center 中心点坐标
   * @param radiusX X轴半径（长轴）
   * @param radiusY Y轴半径（短轴）
   * @param pointCount 点的数量
   * @param startAngle 起始角度（弧度）
   * @param endAngle 结束角度（弧度）
   * @param rotationAngle 旋转角度（弧度）
   */
  constructor(
    private center: Point,
    private radiusX: number,
    private radiusY: number,
    private pointCount: number = 64,
    private startAngle: number = 0,
    private endAngle: number = 2 * Math.PI,
    private rotationAngle: number = 0
  ) {}

  /**
   * 生成椭圆形排列的点集合
   * @returns 椭圆形上均匀分布的点数组
   */
  public generatePoints(): Point[] {
    const points: Point[] = [];
    
    // 确保点数至少为2
    const safePointCount = Math.max(2, this.pointCount);
    
    // 计算角度间隔
    const angleStep = (this.endAngle - this.startAngle) / (safePointCount - 1);
    
    // 计算旋转矩阵
    const cosRotation = Math.cos(this.rotationAngle);
    const sinRotation = Math.sin(this.rotationAngle);
    
    // 生成椭圆上的点
    for (let i = 0; i< safePointCount; i++) {
      const angle = this.startAngle + i * angleStep;
      
      // 生成椭圆上的点
      let x = this.center.x + this.radiusX * Math.cos(angle);
      let y = this.center.y + this.radiusY * Math.sin(angle);
      
      // 应用旋转
      const rotatedX = this.center.x + (x - this.center.x) * cosRotation - (y - this.center.y) * sinRotation;
      const rotatedY = this.center.y + (x - this.center.x) * sinRotation + (y - this.center.y) * cosRotation;
      
      points.push(new Point(rotatedX, rotatedY));
    }
    
    return points;
  }

  /**
   * 获取椭圆形的边界矩形
   * @returns 包围椭圆形的最小矩形
   */
  public getBoundingBox(): Rectangle {
    // 计算旋转后的边界
    const cos = Math.cos(this.rotationAngle);
    const sin = Math.sin(this.rotationAngle);
    
    const width = Math.abs(this.radiusX * cos) + Math.abs(this.radiusY * sin);
    const height = Math.abs(this.radiusX * sin) + Math.abs(this.radiusY * cos);
    
    return new Rectangle(
      this.center.x - width,
      this.center.y - height,
      width * 2,
      height * 2
    );
  }

  /**
   * 设置X轴半径
   * @param radiusX X轴半径
   */
  public setRadiusX(radiusX: number): void {
    this.radiusX = radiusX;
  }

  /**
   * 设置Y轴半径
   * @param radiusY Y轴半径
   */
  public setRadiusY(radiusY: number): void {
    this.radiusY = radiusY;
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
   * 设置旋转角度
   * @param rotationAngle 旋转角度（弧度）
   */
  public setRotationAngle(rotationAngle: number): void {
    this.rotationAngle = rotationAngle;
  }

  /**
   * 设置点数
   * @param pointCount 点数
   */
  public setPointCount(pointCount: number): void {
    this.pointCount = Math.max(2, pointCount);
  }
}