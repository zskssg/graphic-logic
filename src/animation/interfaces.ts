import { Point } from '../geometry/Point';
import { Rectangle } from '../geometry/Rectangle';

/** 点变换接口 */
export interface Transformation {
  apply(point: Point, frame: number, totalFrames: number, pointIndex?: number, totalPoints?: number): Point;
}

/** 图形生成器接口 */
export interface ShapeGenerator {
  generatePoints(): Point[];
  getBoundingBox(): Rectangle;
}

/** 动画生成器接口 */
export interface AnimationGenerator {
  generateFrames(totalFrames: number): Point[][];
}