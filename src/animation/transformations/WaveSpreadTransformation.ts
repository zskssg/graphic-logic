import { Point } from '../../geometry/Point';
import { EasedTransformation, EasingFunction } from './base';

/** 水波扩散变换 */
export class WaveSpreadTransformation extends EasedTransformation {
  constructor(
    private center: Point,
    private maxRadius: number,
    private frequency: number = 2,
    easing: EasingFunction = EasingFunction.EASE_OUT
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number, _pointIndex?: number, _totalPoints?: number): Point {
    const progress = this.getProgress(frame, totalFrames);
    
    // 计算点到中心的距离
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 如果点在中心，保持不动
    if (distance < 0.001) {
      return point;
    }
    
    // 计算单位向量
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    // 计算水波效果的偏移量
    // 使用正弦函数创建波动效果，离中心越远波动越大
    const waveIntensity = Math.sin(progress * Math.PI * this.frequency) * this.maxRadius;
    const spreadDistance = waveIntensity * (distance / this.maxRadius);
    
    // 计算新位置
    return new Point(
      point.x + unitX * spreadDistance,
      point.y + unitY * spreadDistance
    );
  }
}