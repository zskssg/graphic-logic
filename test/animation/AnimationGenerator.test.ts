import { describe, it, expect } from 'vitest';
import { FrameByFrameAnimationGenerator, LazyFrameAnimationGenerator } from '../../src/animation/AnimationGenerator';
import { CircleShapeGenerator } from '../../src/animation/generators/CircleShapeGenerator';
import { RotateTransformation } from '../../src/animation/transformations/RotateTransformation';
import { ScaleTransformation } from '../../src/animation/transformations/ScaleTransformation';
import { CompositeTransformation } from '../../src/animation/transformations/CompositeTransformation';
import { Point } from '../../src/geometry/Point';

describe('AnimationGenerator', () => {
  describe('FrameByFrameAnimationGenerator', () => {
    it('should generate animation frames correctly', () => {
      const center = new Point(100, 100);
      const shapeGenerator = new CircleShapeGenerator(center, 50, 4);
      const transformations = [new RotateTransformation(center, Math.PI * 2)];

      const generator = new FrameByFrameAnimationGenerator(shapeGenerator, transformations);
      const frames = generator.generateFrames(4);

      expect(frames).toHaveLength(4);
      frames.forEach(frame => {
        expect(frame).toHaveLength(4);
        frame.forEach(point => {
          expect(point).toBeInstanceOf(Point);
        });
      });
    });

    it('should apply transformations correctly', () => {
      const center = new Point(100, 100);
      const shapeGenerator = new CircleShapeGenerator(center, 50, 1);
      const transformations = [new RotateTransformation(center, Math.PI / 2)];

      const generator = new FrameByFrameAnimationGenerator(shapeGenerator, transformations);
      const frames = generator.generateFrames(2);

      const initialPoint = frames[0]?.[0] as any;
      const finalPoint = frames[1]?.[0] as any;

      // 初始点应该在圆上
      expect(initialPoint.distanceTo(center)).toBeCloseTo(50, 4);

      // 最终点也应该在圆上（旋转不改变距离）
      expect(finalPoint.distanceTo(center)).toBeCloseTo(50, 4);
    });

    it('should handle multiple transformations', () => {
      const center = new Point(100, 100);
      const shapeGenerator = new CircleShapeGenerator(center, 50, 1);
      const transformations = [
        new ScaleTransformation(center, 2, 2)
      ];

      const generator = new FrameByFrameAnimationGenerator(shapeGenerator, transformations);
      const frames = generator.generateFrames(4);

      expect(frames).toHaveLength(4);
      const finalPoint = frames[3]?.[0] as any;
      // 第4帧（索引3）的缩放比例大约是0.75
      expect(finalPoint.distanceTo(center)).toBeCloseTo(87.5, 4);
    });

    it('should handle composite transformations', () => {
      const center = new Point(100, 100);
      const shapeGenerator = new CircleShapeGenerator(center, 50, 1);
      const scale = new ScaleTransformation(center, 2, 2);
      const composite = new CompositeTransformation([scale]);

      const generator = new FrameByFrameAnimationGenerator(shapeGenerator, [composite]);
      const frames = generator.generateFrames(4);

      expect(frames).toHaveLength(4);
      const finalPoint = frames[3]?.[0] as any;
      // 第4帧（索引3）的缩放比例大约是0.75
      expect(finalPoint.distanceTo(center)).toBeCloseTo(87.5, 4);
    });
  });

  describe('LazyFrameAnimationGenerator', () => {
    it('should generate single frame on demand', () => {
      const center = new Point(100, 100);
      const shapeGenerator = new CircleShapeGenerator(center, 50, 4);
      const transformations = [new RotateTransformation(center, Math.PI * 2)];

      const generator = new LazyFrameAnimationGenerator(shapeGenerator, transformations);
      const frame = generator.generateFrame(2, 4);

      expect(frame).toHaveLength(4);
      frame.forEach(point => {
        expect(point).toBeInstanceOf(Point);
      });
    });

    it('should generate different frames correctly', () => {
      const center = new Point(100, 100);
      const shapeGenerator = new CircleShapeGenerator(center, 50, 1);
      const transformations = [new RotateTransformation(center, Math.PI)];

      const generator = new LazyFrameAnimationGenerator(shapeGenerator, transformations);
      const frame0 = generator.generateFrame(0, 4);
      const frame2 = generator.generateFrame(2, 4);
      const frame4 = generator.generateFrame(4, 4);

      expect(frame0[0]?.distanceTo(frame2[0]!)).toBeGreaterThan(0);
      expect(frame2[0]?.distanceTo(frame4[0]!)).toBeGreaterThan(0);
    });
  });
});
