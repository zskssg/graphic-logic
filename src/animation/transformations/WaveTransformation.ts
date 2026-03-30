import { Point } from '../../geometry/Point';
import { EasedTransformation, EasingFunction } from './base';

/** 波浪变换 */
export class WaveTransformation extends EasedTransformation {
  constructor(
    private amplitude: number,
    private frequency: number,
    easing: EasingFunction = EasingFunction.LINEAR
  ) {
    super(easing);
  }

  public apply(point: Point, frame: number, totalFrames: number, _pointIndex?: number, _totalPoints?: number): Point {
    const progress = this.getProgress(frame, totalFrames);
    const wave = Math.sin(progress * 2 * Math.PI * this.frequency) * this.amplitude;
    
    return new Point(point.x, point.y + wave);
  }
}