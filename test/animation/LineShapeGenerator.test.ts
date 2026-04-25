import { describe, it, expect } from 'vitest';
import { LineShapeGenerator } from '../../src/animation/generators/LineShapeGenerator';
import { FrameByFrameAnimationGenerator } from '../../src/animation/AnimationGenerator';
import { TranslateTransformation } from '../../src/animation/transformations/TranslateTransformation';
import { Point } from '../../src/geometry/Point';

describe('LineShapeGenerator', () => {
  describe('基本的水平线段', () => {
    it('应正确生成水平方向上的点', () => {
      const start = new Point(0, 10);
      const end = new Point(100, 10);
      const generator = new LineShapeGenerator(start, end, 5);

      const points = generator.generatePoints();

      expect(points).toHaveLength(5);
      // 所有点的y坐标应相同
      points.forEach(point => expect(point.y).toBe(10));
      // x坐标应均匀分布
      expect(points[0]!.x).toBe(0);
      expect(points[1]!.x).toBe(25);
      expect(points[2]!.x).toBe(50);
      expect(points[3]!.x).toBe(75);
      expect(points[4]!.x).toBe(100);
    });
  });

  describe('基本的垂直线段', () => {
    it('应正确生成垂直方向上的点', () => {
      const start = new Point(50, 0);
      const end = new Point(50, 200);
      const generator = new LineShapeGenerator(start, end, 5);

      const points = generator.generatePoints();

      expect(points).toHaveLength(5);
      // 所有点的x坐标应相同
      points.forEach(point => expect(point.x).toBe(50));
      // y坐标应均匀分布
      expect(points[0]!.y).toBe(0);
      expect(points[1]!.y).toBe(50);
      expect(points[2]!.y).toBe(100);
      expect(points[3]!.y).toBe(150);
      expect(points[4]!.y).toBe(200);
    });
  });

  describe('斜线段', () => {
    it('应正确生成对角线方向上的点', () => {
      const start = new Point(0, 0);
      const end = new Point(100, 100);
      const generator = new LineShapeGenerator(start, end, 5);

      const points = generator.generatePoints();

      expect(points).toHaveLength(5);
      // 对角线上的点应满足 x === y
      points.forEach(point => expect(point.x).toBe(point.y));
      // 均匀分布
      expect(points[0]!.x).toBe(0);
      expect(points[2]!.x).toBe(50);
      expect(points[4]!.x).toBe(100);
    });
  });

  describe('点数控制', () => {
    it('应使用默认点数（10）', () => {
      const start = new Point(0, 0);
      const end = new Point(100, 0);
      const generator = new LineShapeGenerator(start, end);

      const points = generator.generatePoints();

      expect(points).toHaveLength(10);
    });

    it('应使用自定义点数', () => {
      const start = new Point(0, 0);
      const end = new Point(100, 0);
      const generator = new LineShapeGenerator(start, end, 20);

      const points = generator.generatePoints();

      expect(points).toHaveLength(20);
    });

    it('点数至少为2，当传入1时应自动修正为2', () => {
      const start = new Point(0, 0);
      const end = new Point(100, 0);
      const generator = new LineShapeGenerator(start, end, 1);

      const points = generator.generatePoints();

      expect(points).toHaveLength(2);
      expect(points[0]!.x).toBe(0);
      expect(points[1]!.x).toBe(100);
    });

    it('点数为2时只生成起点和终点', () => {
      const start = new Point(10, 20);
      const end = new Point(90, 80);
      const generator = new LineShapeGenerator(start, end, 2);

      const points = generator.generatePoints();

      expect(points).toHaveLength(2);
      expect(points[0]!.x).toBe(10);
      expect(points[0]!.y).toBe(20);
      expect(points[1]!.x).toBe(90);
      expect(points[1]!.y).toBe(80);
    });
  });

  describe('端点验证', () => {
    it('生成的点集应包含起点和终点', () => {
      const start = new Point(30, 50);
      const end = new Point(200, 150);
      const generator = new LineShapeGenerator(start, end, 8);

      const points = generator.generatePoints();

      expect(points[0]!.x).toBe(start.x);
      expect(points[0]!.y).toBe(start.y);
      expect(points[points.length - 1]!.x).toBe(end.x);
      expect(points[points.length - 1]!.y).toBe(end.y);
    });
  });

  describe('均匀分布', () => {
    it('相邻点之间的距离应相等', () => {
      const start = new Point(0, 0);
      const end = new Point(100, 0);
      const generator = new LineShapeGenerator(start, end, 11);

      const points = generator.generatePoints();

      // 相邻点之间的间距应为10
      for (let i = 1; i < points.length; i++) {
        const distance = points[i]!.distanceTo(points[i - 1]!);
        expect(distance).toBeCloseTo(10, 5);
      }
    });
  });

  describe('零长度线段', () => {
    it('起点和终点相同时应生成重复的点', () => {
      const point = new Point(50, 50);
      const generator = new LineShapeGenerator(point, point, 5);

      const points = generator.generatePoints();

      expect(points).toHaveLength(5);
      points.forEach(p => {
        expect(p.x).toBe(50);
        expect(p.y).toBe(50);
      });
    });
  });

  describe('反向线段（负方向）', () => {
    it('起点x大于终点x时应正确处理', () => {
      const start = new Point(100, 0);
      const end = new Point(0, 0);
      const generator = new LineShapeGenerator(start, end, 5);

      const points = generator.generatePoints();

      expect(points[0]!.x).toBe(100);
      expect(points[1]!.x).toBe(75);
      expect(points[2]!.x).toBe(50);
      expect(points[3]!.x).toBe(25);
      expect(points[4]!.x).toBe(0);
    });

    it('起点y大于终点y时应正确处理', () => {
      const start = new Point(0, 100);
      const end = new Point(0, 0);
      const generator = new LineShapeGenerator(start, end, 3);

      const points = generator.generatePoints();

      expect(points[0]!.y).toBe(100);
      expect(points[1]!.y).toBe(50);
      expect(points[2]!.y).toBe(0);
    });

    it('x和y均为负方向时应正确处理', () => {
      const start = new Point(100, 100);
      const end = new Point(0, 0);
      const generator = new LineShapeGenerator(start, end, 3);

      const points = generator.generatePoints();

      expect(points[0]!.x).toBe(100);
      expect(points[0]!.y).toBe(100);
      expect(points[1]!.x).toBe(50);
      expect(points[1]!.y).toBe(50);
      expect(points[2]!.x).toBe(0);
      expect(points[2]!.y).toBe(0);
    });
  });

  describe('包围盒', () => {
    it('正方向线段的包围盒应正确', () => {
      const start = new Point(10, 20);
      const end = new Point(100, 200);
      const generator = new LineShapeGenerator(start, end, 5);

      const bbox = generator.getBoundingBox();

      expect(bbox.x).toBe(10);
      expect(bbox.y).toBe(20);
      expect(bbox.width).toBe(90);
      expect(bbox.height).toBe(180);
    });

    it('负方向线段的包围盒应正确', () => {
      const start = new Point(100, 200);
      const end = new Point(10, 20);
      const generator = new LineShapeGenerator(start, end, 5);

      const bbox = generator.getBoundingBox();

      expect(bbox.x).toBe(10);
      expect(bbox.y).toBe(20);
      expect(bbox.width).toBe(90);
      expect(bbox.height).toBe(180);
    });

    it('水平线段的包围盒高度应为0', () => {
      const start = new Point(0, 50);
      const end = new Point(100, 50);
      const generator = new LineShapeGenerator(start, end, 5);

      const bbox = generator.getBoundingBox();

      expect(bbox.height).toBe(0);
      expect(bbox.width).toBe(100);
    });

    it('垂直线段的包围盒宽度应为0', () => {
      const start = new Point(50, 0);
      const end = new Point(50, 100);
      const generator = new LineShapeGenerator(start, end, 5);

      const bbox = generator.getBoundingBox();

      expect(bbox.width).toBe(0);
      expect(bbox.height).toBe(100);
    });

    it('零长度线段的包围盒宽高均为0', () => {
      const point = new Point(50, 50);
      const generator = new LineShapeGenerator(point, point, 5);

      const bbox = generator.getBoundingBox();

      expect(bbox.x).toBe(50);
      expect(bbox.y).toBe(50);
      expect(bbox.width).toBe(0);
      expect(bbox.height).toBe(0);
    });
  });

  describe('与动画系统集成', () => {
    it('应能作为动画图形生成器使用', () => {
      const start = new Point(0, 0);
      const end = new Point(100, 0);
      const shapeGenerator = new LineShapeGenerator(start, end, 5);
      const transformations = [new TranslateTransformation(0, 50)];

      const animGenerator = new FrameByFrameAnimationGenerator(shapeGenerator, transformations);
      const frames = animGenerator.generateFrames(3);

      expect(frames).toHaveLength(3);
      expect(frames[0]).toHaveLength(5);
      // 第一帧progress=0，y不变；后续帧progress>0，y应大于0
      frames[0]!.forEach(point => expect(point.y).toBe(0));
      frames[1]!.forEach(point => expect(point.y).toBeGreaterThan(0));
      frames[2]!.forEach(point => expect(point.y).toBeGreaterThan(0));
    });
  });

  describe('边界情况', () => {
    it('大量点数时应能正确生成', () => {
      const start = new Point(0, 0);
      const end = new Point(1000, 0);
      const generator = new LineShapeGenerator(start, end, 1000);

      const points = generator.generatePoints();

      expect(points).toHaveLength(1000);
      expect(points[0]!.x).toBe(0);
      expect(points[999]!.x).toBe(1000);
    });

    it('坐标为负数时应正确处理', () => {
      const start = new Point(-100, -100);
      const end = new Point(100, 100);
      const generator = new LineShapeGenerator(start, end, 3);

      const points = generator.generatePoints();

      expect(points[0]!.x).toBe(-100);
      expect(points[0]!.y).toBe(-100);
      expect(points[1]!.x).toBe(0);
      expect(points[1]!.y).toBe(0);
      expect(points[2]!.x).toBe(100);
      expect(points[2]!.y).toBe(100);
    });

    it('所有坐标均为0时应正常生成', () => {
      const start = new Point(0, 0);
      const end = new Point(0, 0);
      const generator = new LineShapeGenerator(start, end, 10);

      const points = generator.generatePoints();

      expect(points).toHaveLength(10);
      points.forEach(p => {
        expect(p.x).toBe(0);
        expect(p.y).toBe(0);
      });
    });
  });
});
