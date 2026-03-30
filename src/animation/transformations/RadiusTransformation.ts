import { Point } from '../../geometry/Point';
import { EasedTransformation, EasingFunction } from './base';

/** 
 * 半径变换类
 * 用于实现圆形的动态半径变化效果
 * 通过保持角度不变，只改变半径来实现平滑的放大缩小效果
 */
export class RadiusTransformation extends EasedTransformation {
  /**
   * 构造函数
   * @param center 圆心坐标
   * @param startRadius 起始半径
   * @param endRadius 结束半径
   * @param easing 缓动函数类型
   */
  constructor(
    private center: Point,
    private startRadius: number,
    private endRadius: number,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  /**
   * 应用变换到点
   * @param point 需要变换的点
   * @param frame 当前帧索引
   * @param totalFrames 总帧数
   * @returns 变换后的新点
   */
  public apply(point: Point, frame: number, totalFrames: number, _pointIndex?: number, _totalPoints?: number): Point {
    // 计算当前进度（0到1之间）
    const progress = this.getProgress(frame, totalFrames);
    
    // 根据进度计算当前半径
    const currentRadius = this.startRadius + (this.endRadius - this.startRadius) * progress;
    
    // 计算点相对于圆心的角度（保持角度不变）
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    const angle = Math.atan2(dy, dx);
    
    // 根据新半径和原角度计算新位置
    return new Point(
      this.center.x + currentRadius * Math.cos(angle),
      this.center.y + currentRadius * Math.sin(angle)
    );
  }
}