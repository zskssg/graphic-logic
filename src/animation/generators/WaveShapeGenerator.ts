import { Point } from '../../geometry/Point';
import { Rectangle } from '../../geometry/Rectangle';
import { ShapeGenerator as ShapeGeneratorInterface } from '../interfaces';

/** 
 * 波纹图形生成器
 * 用于生成具有波浪形状的点集合
 * 支持控制波纹幅度、波长、长度、弯曲度等参数
 */
export class WaveShapeGenerator implements ShapeGeneratorInterface {
  /**
   * 构造函数
   * @param startPoint 起始点坐标
   * @param length 波纹总长度
   * @param amplitude 波纹幅度（波峰到波谷的垂直距离）
   * @param wavelength 波长（相邻两个波峰之间的水平距离）
   * @param pointCount 点的数量
   * @param curvature 弯曲度（0表示直线，正值表示向上弯曲，负值表示向下弯曲）
   * @param offsetX X轴偏移量
   * @param offsetY Y轴偏移量
   */
  constructor(
    private startPoint: Point,
    private length: number,
    private amplitude: number = 20,
    private wavelength: number = 100,
    private pointCount: number = 100,
    private curvature: number = 0,
    private offsetX: number = 0,
    private offsetY: number = 0
  ) {}

  /**
   * 生成波纹形状的点集合
   * @returns 波纹上均匀分布的点数组
   */
  public generatePoints(): Point[] {
    const points: Point[] = [];
    
    // 计算每个点的间隔
    const step = this.length / (this.pointCount - 1);
    
    // 生成波纹点
    for (let i = 0; i< this.pointCount; i++) {
      // 计算当前点的X坐标
      const x = this.startPoint.x + i * step + this.offsetX;
      
      // 计算相对于起始点的距离
      const distance = i * step;
      
      // 计算波纹的Y坐标
      // 使用正弦函数创建波浪效果
      let y = this.startPoint.y + this.offsetY;
      
      // 添加波纹效果
      const wave = Math.sin((distance / this.wavelength) * 2 * Math.PI) * this.amplitude;
      y += wave;
      
      // 添加弯曲效果（二次曲线）
      if (this.curvature !== 0) {
        const normalizedDistance = distance / this.length;
        const curve = this.curvature * Math.pow(normalizedDistance - 0.5, 2) * this.length;
        y += curve;
      }
      
      points.push(new Point(x, y));
    }
    
    return points;
  }

  /**
   * 获取波纹的边界矩形
   * @returns 包围波纹的最小矩形
   */
  public getBoundingBox(): Rectangle {
    // 计算波纹的最大垂直范围
    const maxVerticalExtent = Math.abs(this.amplitude) + Math.abs(this.curvature) * this.length;
    
    const minX = this.startPoint.x + this.offsetX;
    const maxX = this.startPoint.x + this.length + this.offsetX;
    const minY = this.startPoint.y + this.offsetY - maxVerticalExtent;
    const maxY = this.startPoint.y + this.offsetY + maxVerticalExtent;
    
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }

  /**
   * 设置波纹幅度
   * @param amplitude 新的波纹幅度
   */
  public setAmplitude(amplitude: number): void {
    this.amplitude = amplitude;
  }

  /**
   * 设置波长
   * @param wavelength 新的波长
   */
  public setWavelength(wavelength: number): void {
    this.wavelength = wavelength;
  }

  /**
   * 设置弯曲度
   * @param curvature 新的弯曲度
   */
  public setCurvature(curvature: number): void {
    this.curvature = curvature;
  }

  /**
   * 设置偏移量
   * @param offsetX X轴偏移量
   * @param offsetY Y轴偏移量
   */
  public setOffset(offsetX: number, offsetY: number): void {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }
}