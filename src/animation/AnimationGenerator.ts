import { Point } from '../geometry/Point';
import { ShapeGenerator, Transformation, AnimationGenerator as AnimationGeneratorInterface } from './interfaces';

/** 帧动画生成器 */
export class FrameByFrameAnimationGenerator implements AnimationGeneratorInterface {
  constructor(
    private shapeGenerator: ShapeGenerator,
    private transformations: Transformation[]
  ) {}

  public generateFrames(totalFrames: number): Point[][] {
    const initialPoints = this.shapeGenerator.generatePoints();
    const totalPoints = initialPoints.length;
    const frames: Point[][] = [];

    for (let frame = 0; frame< totalFrames; frame++) {
      const framePoints = initialPoints.map((point, pointIndex) =>{
        let transformedPoint = point;
        
        for (const transformation of this.transformations) {
          // 检查变换是否支持点索引参数
          if ('apply' in transformation && transformation.apply.length >= 5) {
            transformedPoint = transformation.apply(
              transformedPoint, 
              frame, 
              totalFrames,
              pointIndex,
              totalPoints
            );
          } else {
            transformedPoint = transformation.apply(transformedPoint, frame, totalFrames);
          }
        }
        
        return transformedPoint;
      });
      
      frames.push(framePoints);
    }

    return frames;
  }
}

/** 按需帧生成器 */
export class LazyFrameAnimationGenerator {
  constructor(
    private shapeGenerator: ShapeGenerator,
    private transformations: Transformation[]
  ) {}

  public generateFrame(frame: number, totalFrames: number): Point[] {
    const initialPoints = this.shapeGenerator.generatePoints();
    const totalPoints = initialPoints.length;
    
    return initialPoints.map((point, pointIndex) => {
      let transformedPoint = point;
      
      for (const transformation of this.transformations) {
        // 检查变换是否支持点索引参数
        if ('apply' in transformation && transformation.apply.length >= 5) {
          transformedPoint = transformation.apply(
            transformedPoint, 
            frame, 
            totalFrames,
            pointIndex,
            totalPoints
          );
        } else {
          transformedPoint = transformation.apply(transformedPoint, frame, totalFrames);
        }
      }
      
      return transformedPoint;
    });
  }
}