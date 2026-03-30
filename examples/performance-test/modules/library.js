/**
 * 库文件引入和初始化模块
 * 负责导入所有需要的库类和创建基础对象
 */

// 导入库
import { 
  Point,
  CircleShapeGenerator, 
  RectangleShapeGenerator,
  StarShapeGenerator,
  SemiCircleShapeGenerator,
  WaveShapeGenerator,
  TriangleShapeGenerator,
  ParallelogramShapeGenerator,
  EllipseShapeGenerator,
  TruncatedConeShapeGenerator,
  SectorShapeGenerator,
  RingShapeGenerator,
  PolygonShapeGenerator,
  RotateTransformation,
  WaveTransformation,
  ScaleTransformation,
  LinearTransformation,
  WaveSpreadTransformation,
  StaggerTransformation,
  CompositeTransformation,
  FrameByFrameAnimationGenerator,
  EasingFunction
} from '../../../dist/index.mjs';

/**
 * 创建图形生成器
 * @param {string} type - 图形类型
 * @param {Point} center - 中心点
 * @param {number} size - 图形大小
 * @param {number} pointCount - 点数量
 * @returns {Object} 图形生成器
 */
export function createShapeGenerator(type, center, size, pointCount = 16) {
  switch (type) {
    case 'circle':
      return new CircleShapeGenerator(center, size / 2, pointCount);
    case 'rectangle':
      return new RectangleShapeGenerator(
        new Point(center.x - size / 2, center.y - size / 2),
        size,
        size,
        pointCount
      );
    case 'star':
      return new StarShapeGenerator(center, size / 2, size / 4, 5);
    case 'semicircle':
      return new SemiCircleShapeGenerator(center, size / 2, pointCount);
    case 'wave':
      return new WaveShapeGenerator(
        new Point(center.x - size, center.y),
        size * 2,
        size / 3,
        size,
        pointCount,
        0.1
      );
    case 'triangle':
      return new TriangleShapeGenerator(
        new Point(center.x - size / 2, center.y - size / 3),
        new Point(center.x + size / 2, center.y - size / 3),
        new Point(center.x, center.y + size / 3),
        pointCount
      );
    case 'parallelogram':
      return new ParallelogramShapeGenerator(
        new Point(center.x - size / 2, center.y - size / 4),
        size,
        size / 2,
        Math.PI / 6,
        pointCount
      );
    case 'ellipse':
      return new EllipseShapeGenerator(
        center,
        size / 2,
        size / 4,
        pointCount,
        0,
        2 * Math.PI,
        Math.PI / 4
      );
    case 'truncatedCone':
      return new TruncatedConeShapeGenerator(
        center,
        size / 4,
        size / 2,
        size,
        pointCount
      );
    case 'sector':
      return new SectorShapeGenerator(
        center,
        size / 2,
        0,
        Math.PI / 2,
        pointCount
      );
    case 'ring':
      return new RingShapeGenerator(
        center,
        size / 4,
        size / 2,
        pointCount,
        0,
        2 * Math.PI
      );
    case 'polygon':
      return new PolygonShapeGenerator(
        center,
        size / 2,
        6, // 六边形
        [],
        pointCount,
        0
      );
    default:
      return new CircleShapeGenerator(center, size / 2, pointCount);
  }
}

/**
 * 创建变换对象
 * @param {string} type - 变换类型
 * @param {Point} center - 中心点
 * @param {number} speed - 动画速度
 * @returns {Array} 变换对象数组
 */
export function createTransforms(type, center, speed = 1) {
  const rotate = new RotateTransformation(center, Math.PI * 2 * speed, EasingFunction.LINEAR);
  const scale = new ScaleTransformation(center, 1.5, 1.5, EasingFunction.EASE_IN_OUT);
  const wave = new WaveTransformation(20 * speed, 2, EasingFunction.SINE);
  const linear = new LinearTransformation(center, new Point(center.x + 100, center.y + 50), EasingFunction.EASE_IN_OUT);
  const waveSpread = new WaveSpreadTransformation(center, 80, 2, EasingFunction.EASE_OUT);

  // 创建错列变换
  const staggerRotate = new StaggerTransformation(rotate, 0.3, EasingFunction.LINEAR);
  const staggerScale = new StaggerTransformation(scale, 0.2, EasingFunction.EASE_IN_OUT);
  const staggerWave = new StaggerTransformation(wave, 0.4, EasingFunction.SINE);

  switch (type) {
    case 'rotate':
      return [rotate];
    case 'scale':
      return [scale];
    case 'wave':
      return [wave];
    case 'linear':
      return [linear];
    case 'waveSpread':
      return [waveSpread];
    case 'combined':
      return [new CompositeTransformation([rotate, scale, wave])];
    case 'staggerRotate':
      return [staggerRotate];
    case 'staggerScale':
      return [staggerScale];
    case 'staggerWave':
      return [staggerWave];
    case 'staggerCombined':
      return [new CompositeTransformation([staggerRotate, staggerScale])];
    default:
      return [rotate];
  }
}

/**
 * 创建动画生成器
 * @param {Object} generator - 图形生成器
 * @param {Array} transformations - 变换对象数组
 * @param {number} frameCount - 帧数
 * @returns {Object} 动画生成器
 */
export function createAnimationGenerator(generator, transformations, frameCount = 64) {
  return new FrameByFrameAnimationGenerator(generator, transformations);
}

// 导出所有需要的类和函数
export {
  Point,
  CircleShapeGenerator,
  RectangleShapeGenerator,
  StarShapeGenerator,
  SemiCircleShapeGenerator,
  FrameByFrameAnimationGenerator,
  EasingFunction
};