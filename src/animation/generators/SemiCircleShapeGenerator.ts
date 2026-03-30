import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 
 * 半圆图形生成器
 * 用于生成半圆排列的点集合
 * 可自定义起始角度和结束角度，默认生成上半圆（0到π弧度）
 */
export class SemiCircleShapeGenerator implements ShapeGeneratorInterface {
  /**
   * 构造函数
   * @param center 圆心坐标
   * @param radius 半圆半径
   * @param pointCount 点的数量
   * @param startAngle 起始角度（弧度），默认为0
   * @param endAngle 结束角度（弧度），默认为π（半圆）
   */
  constructor(
    private center: Point,
    private radius: number,
    private pointCount: number,
    private startAngle: number = 0,
    private endAngle: number = Math.PI
  ) {}

  /**
   * 生成半圆排列的点集合
   * @returns 半圆上均匀分布的点数组
   */
  public generatePoints(): Point[] {
    const points: Point[] = [];
    
    // 计算角度间隔
    const angleStep = (this.endAngle - this.startAngle) / (this.pointCount - 1);

    // 生成点
    for (let i = 0; i< this.pointCount; i++) {
      const angle = this.startAngle + i * angleStep;
      const x = this.center.x + this.radius * Math.cos(angle);
      const y = this.center.y + this.radius * Math.sin(angle);
      points.push(new Point(x, y));
    }

    return points;
  }

  /**
   * 获取半圆的边界矩形
   * @returns 包围半圆的最小矩形
   */
  public getBoundingBox(): Rectangle {
    const minX = this.center.x - this.radius;
    const maxX = this.center.x + this.radius;
    const minY = this.center.y - this.radius;
    const maxY = this.center.y + this.radius;
    
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }
}