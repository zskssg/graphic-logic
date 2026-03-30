import { Point } from '../../geometry/Point';
import { Transformation as TransformationInterface } from '../interfaces';

/** 组合变换 */
export class CompositeTransformation implements TransformationInterface {
  constructor(private transformations: TransformationInterface[]) {}

  public apply(point: Point, frame: number, totalFrames: number, _pointIndex?: number, _totalPoints?: number): Point {
    let result = point;
    
    for (const transformation of this.transformations) {
      result = transformation.apply(result, frame, totalFrames, _pointIndex, _totalPoints);
    }
    
    return result;
  }
}