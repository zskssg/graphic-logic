import { Point } from '../../geometry/Point';
import { Transformation as TransformationInterface } from '../interfaces';
import { EasingFunction, EasedTransformation } from './base';

/**
 * 错列变换（Stagger Transformation）
 * 实现点按顺序依次变换的效果，产生层次感和带动效果
 * 每个点根据其索引值延迟开始变换，形成波浪式的动画效果
 */
export class StaggerTransformation extends EasedTransformation {
  /**
   * 构造函数
   * @param baseTransformation 基础变换（如平移、旋转、缩放等）
   * @param staggerDelay 错列延迟系数（0-1，控制点之间的延迟比例）
   * @param easing 缓动函数
   */
  constructor(
    private baseTransformation: TransformationInterface,
    private staggerDelay: number = 0.2,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
    // 确保延迟系数在合理范围内
    this.staggerDelay = Math.max(0, Math.min(1, staggerDelay));
  }

  /**
   * 应用变换
   * @param point 要变换的点
   * @param frame 当前帧索引
   * @param totalFrames 总帧数
   * @param pointIndex 点在点集合中的索引（用于计算延迟）
   * @param totalPoints 点集合的总数量
   * @returns 变换后的点
   */
  public apply(
    point: Point, 
    frame: number, 
    totalFrames: number,
    pointIndex: number = 0,
    totalPoints: number = 1
  ): Point {
    // 计算该点的延迟帧数
    const delayFrames = this.calculateDelayFrames(pointIndex, totalPoints, totalFrames);
    
    // 如果当前帧还没到该点的开始时间，返回原始点
    if (frame< delayFrames) {
      return new Point(point.x, point.y);
    }
    
    // 计算该点的有效帧和有效总帧数
    const effectiveFrame = frame - delayFrames;
    const effectiveTotalFrames = totalFrames - delayFrames;
    
    // 如果有效帧超过有效总帧数，返回完全变换后的点
    if (effectiveFrame >= effectiveTotalFrames) {
      return this.baseTransformation.apply(point, totalFrames, totalFrames);
    }
    
    // 应用基础变换
    return this.baseTransformation.apply(point, effectiveFrame, effectiveTotalFrames);
  }

  /**
   * 计算延迟帧数
   * @param pointIndex 点索引
   * @param totalPoints 总点数
   * @param totalFrames 总帧数
   * @returns 延迟帧数
   */
  private calculateDelayFrames(pointIndex: number, totalPoints: number, totalFrames: number): number {
    if (totalPoints<= 1) {
      return 0; // 只有一个点时不需要延迟
    }
    
    // 计算该点的延迟比例（0到staggerDelay之间）
    const delayRatio = (pointIndex / (totalPoints - 1)) * this.staggerDelay;
    
    // 计算延迟帧数
    return Math.floor(delayRatio * totalFrames);
  }

  /**
   * 设置错列延迟系数
   * @param staggerDelay 延迟系数（0-1）
   */
  public setStaggerDelay(staggerDelay: number): void {
    this.staggerDelay = Math.max(0, Math.min(1, staggerDelay));
  }

  /**
   * 获取错列延迟系数
   * @returns 延迟系数
   */
  public getStaggerDelay(): number {
    return this.staggerDelay;
  }
}
