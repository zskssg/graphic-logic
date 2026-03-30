import { describe, it, expect } from 'vitest';
import { RotateTransformation } from '../../src/animation/transformations/RotateTransformation';
import { ScaleTransformation } from '../../src/animation/transformations/ScaleTransformation';
import { CompositeTransformation } from '../../src/animation/transformations/CompositeTransformation';
import { StaggerTransformation } from '../../src/animation/transformations/StaggerTransformation';
import { Point } from '../../src/geometry/Point';
import { EasingFunction } from '../../src/animation/transformations/base';

describe('Transformations', () => {
  describe('RotateTransformation', () => {
    it('should rotate point around center', () => {
      const center = new Point(100, 100);
      const point = new Point(150, 100); // 右侧点
      const rotate = new RotateTransformation(center, Math.PI / 2);
      
      const result = rotate.apply(point, 1, 1);
      
      // 旋转不改变距离
      expect(result.distanceTo(center)).toBeCloseTo(50, 4);
    });

    it('should use easing function', () => {
      const center = new Point(100, 100);
      const point = new Point(150, 100);
      const rotate = new RotateTransformation(center, Math.PI / 2, EasingFunction.EASE_IN_OUT);
      
      const result = rotate.apply(point, 0.5, 1);
      
      // 使用缓动函数，中间帧应该有一定的旋转
      expect(result.distanceTo(center)).toBeCloseTo(50, 4);
    });
  });

  describe('ScaleTransformation', () => {
    it('should scale point around center', () => {
      const center = new Point(100, 100);
      const point = new Point(120, 120);
      const scale = new ScaleTransformation(center, 2, 2);
      
      const result = scale.apply(point, 1, 1);
      
      expect(result.x).toBe(140);
      expect(result.y).toBe(140);
    });

    it('should handle non-uniform scaling', () => {
      const center = new Point(100, 100);
      const point = new Point(120, 120);
      const scale = new ScaleTransformation(center, 2, 3);
      
      const result = scale.apply(point, 1, 1);
      
      expect(result.x).toBe(140);
      expect(result.y).toBe(160);
    });
  });

  describe('CompositeTransformation', () => {
    it('should apply multiple transformations in sequence', () => {
      const center = new Point(100, 100);
      const point = new Point(150, 100);
      const scale = new ScaleTransformation(center, 2, 2);
      const composite = new CompositeTransformation([scale]);
      
      const result = composite.apply(point, 1, 1);
      
      // 缩放后的距离应该是原来的2倍
      expect(result.distanceTo(center)).toBeCloseTo(100, 4);
    });
  });

  describe('StaggerTransformation', () => {
    it('should stagger transformations based on point index', () => {
      const center = new Point(100, 100);
      const point1 = new Point(150, 100);
      const point2 = new Point(100, 150);
      const rotate = new RotateTransformation(center, Math.PI);
      const stagger = new StaggerTransformation(rotate, 0.5);
      
      // 第一帧，第一个点应该开始旋转，第二个点应该延迟
      const result1 = stagger.apply(point1, 0.25, 1, 0, 2);
      const result2 = stagger.apply(point2, 0.25, 1, 1, 2);
      
      expect(result1.distanceTo(center)).toBeCloseTo(50, 4);
      expect(result2.distanceTo(center)).toBeCloseTo(50, 4);
    });

    it('should handle different stagger delays', () => {
      const center = new Point(100, 100);
      const point = new Point(150, 100);
      const rotate = new RotateTransformation(center, Math.PI);
      const stagger1 = new StaggerTransformation(rotate, 0.2);
      const stagger2 = new StaggerTransformation(rotate, 0.8);
      
      const result1 = stagger1.apply(point, 0.5, 1, 0, 2);
      const result2 = stagger2.apply(point, 0.5, 1, 0, 2);
      
      expect(result1.distanceTo(center)).toBeCloseTo(50, 4);
      expect(result2.distanceTo(center)).toBeCloseTo(50, 4);
    });
  });
});
