/**
 * 库文件引入和初始化模块
 * 负责导入所有需要的库类和创建基础对象
 */

// 导入库
import {
  Point,
  LineShapeGenerator,
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
  TranslateTransformation,
  ScaleTransformation,
  RadiusTransformation,
  LinearTransformation,
  WaveSpreadTransformation,
  StaggerTransformation,
  CompositeTransformation,
  FrameByFrameAnimationGenerator,
  EasingFunction
} from '../../../dist/index.mjs';

/**
 * 创建基础变换对象
 * @param {Point} center - 中心点
 * @returns {Object} 变换对象集合
 */
export function createTransforms(center) {
  // 创建基础变换
  const rotate = new RotateTransformation(center, Math.PI * 2, EasingFunction.EASE_IN_OUT);
  const wave = new WaveTransformation(30, 3, EasingFunction.LINEAR);
  const translate = new TranslateTransformation(50, 30, EasingFunction.BOUNCE);
  const scale = new ScaleTransformation(center, 2, 2, EasingFunction.EASE_OUT);
  const radius = new RadiusTransformation(center, 50, 150, EasingFunction.EASE_IN_OUT);
  const linear = new LinearTransformation(center, new Point(center.x + 100, center.y + 50), EasingFunction.EASE_IN_OUT);
  const waveSpread = new WaveSpreadTransformation(center, 80, 2, EasingFunction.EASE_OUT);

  // 创建错列变换（实现层次感效果）
  const staggerRotate = new StaggerTransformation(rotate, 0.3, EasingFunction.EASE_IN_OUT);
  const staggerTranslate = new StaggerTransformation(translate, 0.2, EasingFunction.BOUNCE);
  const staggerScale = new StaggerTransformation(scale, 0.4, EasingFunction.EASE_OUT);

  return {
    rotate,
    wave,
    translate,
    scale,
    radius,
    linear,
    waveSpread,
    staggerRotate,
    staggerTranslate,
    staggerScale
  };
}

/**
 * 创建变换配置
 * @param {Object} transforms - 变换对象集合
 * @returns {Array} 变换配置数组
 */
export function createTransformConfigs(transforms) {
  return [
    {
      id: 'standard',
      name: '标准变换',
      transformations: [new CompositeTransformation([transforms.rotate, transforms.wave, transforms.translate])],
      compatibleShapes: ['circle', 'rectangle', 'star', 'semicircle', 'line']
    },
    {
      id: 'scale',
      name: '缩放变换',
      transformations: [new CompositeTransformation([transforms.scale, transforms.rotate])],
      compatibleShapes: ['circle', 'rectangle', 'star', 'semicircle', 'line']
    },
    {
      id: 'radius',
      name: '半径变换',
      transformations: [new CompositeTransformation([transforms.radius, transforms.rotate])],
      compatibleShapes: ['circle']
    },
    {
      id: 'rotate-only',
      name: '仅旋转',
      transformations: [new CompositeTransformation([transforms.rotate])],
      compatibleShapes: ['circle', 'rectangle', 'star', 'semicircle', 'line']
    },
    {
      id: 'linear',
      name: '线性变换',
      transformations: [new CompositeTransformation([transforms.linear])],
      compatibleShapes: ['circle', 'rectangle', 'star', 'semicircle', 'line']
    },
    {
      id: 'wave-spread',
      name: '水波扩散',
      transformations: [new CompositeTransformation([transforms.waveSpread, transforms.rotate])],
      compatibleShapes: ['circle', 'rectangle', 'star', 'semicircle', 'line']
    },
    {
      id: 'stagger-rotate',
      name: '错列旋转',
      transformations: [new CompositeTransformation([transforms.staggerRotate])],
      compatibleShapes: ['circle', 'rectangle', 'star', 'semicircle', 'triangle', 'parallelogram', 'ellipse', 'truncatedCone', 'sector', 'ring', 'polygon', 'line']
    },
    {
      id: 'stagger-translate',
      name: '错列平移',
      transformations: [new CompositeTransformation([transforms.staggerTranslate])],
      compatibleShapes: ['circle', 'rectangle', 'star', 'semicircle', 'triangle', 'parallelogram', 'ellipse', 'truncatedCone', 'sector', 'ring', 'polygon', 'line']
    },
    {
      id: 'stagger-scale',
      name: '错列缩放',
      transformations: [new CompositeTransformation([transforms.staggerScale])],
      compatibleShapes: ['circle', 'rectangle', 'star', 'semicircle', 'triangle', 'parallelogram', 'ellipse', 'truncatedCone', 'sector', 'ring', 'polygon', 'line']
    },
    {
      id: 'stagger-combined',
      name: '错列组合',
      transformations: [new CompositeTransformation([transforms.staggerRotate, transforms.staggerScale])],
      compatibleShapes: ['circle', 'rectangle', 'star', 'semicircle', 'triangle', 'parallelogram', 'ellipse', 'truncatedCone', 'sector', 'ring', 'polygon', 'line']
    }
  ];
}

/**
 * 创建图形配置
 * @param {Point} center - 中心点
 * @returns {Array} 图形配置数组
 */
export function createShapeConfigs(center) {
  return [
    {
      id: 'line',
      name: '线段',
      generator: new LineShapeGenerator(
        new Point(center.x - 100, center.y), // 起点
        new Point(center.x + 100, center.y), 20)
    },
    {
      id: 'circle',
      name: '圆形',
      generator: new CircleShapeGenerator(center, 100, 64)
    },
    {
      id: 'rectangle',
      name: '矩形',
      generator: new RectangleShapeGenerator(new Point(100, 100), 200, 200, 64)
    },
    {
      id: 'star',
      name: '星形',
      generator: new StarShapeGenerator(center, 100, 50, 5)
    },
    {
      id: 'semicircle',
      name: '半圆',
      generator: new SemiCircleShapeGenerator(center, 100, 32)
    },
    {
      id: 'wave',
      name: '波纹',
      generator: new WaveShapeGenerator(
        new Point(100, 200), // 起始点
        300,                // 长度
        30,                 // 幅度
        80,                 // 波长
        100,                // 点数
        0.2                 // 弯曲度
      )
    },
    {
      id: 'triangle',
      name: '三角形',
      generator: new TriangleShapeGenerator(
        new Point(150, 100), // 第一个顶点
        new Point(250, 100), // 第二个顶点
        new Point(200, 200), // 第三个顶点
        15                  // 点数
      )
    },
    {
      id: 'parallelogram',
      name: '平行四边形',
      generator: new ParallelogramShapeGenerator(
        new Point(150, 100), // 左上角
        200,                // 宽度
        100,                // 高度
        Math.PI / 6,         // 倾斜角度（30度）
        20                  // 点数
      )
    },
    {
      id: 'ellipse',
      name: '椭圆形',
      generator: new EllipseShapeGenerator(
        center,              // 中心点
        150,                 // X轴半径
        80,                  // Y轴半径
        64,                  // 点数
        0,                   // 起始角度
        2 * Math.PI,         // 结束角度
        Math.PI / 4          // 旋转角度（45度）
      )
    },
    {
      id: 'truncatedCone',
      name: '圆台',
      generator: new TruncatedConeShapeGenerator(
        center,              // 中心点
        50,                  // 上底面半径
        100,                 // 下底面半径
        150,                 // 高度
        32                   // 点数
      )
    },
    {
      id: 'sector',
      name: '扇形',
      generator: new SectorShapeGenerator(
        center,              // 中心点
        100,                 // 半径
        0,                   // 起始角度
        Math.PI / 2,         // 结束角度（90度）
        32                   // 点数
      )
    },
    {
      id: 'ring',
      name: '圆环',
      generator: new RingShapeGenerator(
        center,              // 中心点
        50,                  // 内半径
        100,                 // 外半径
        64,                  // 点数
        0,                   // 起始角度
        2 * Math.PI          // 结束角度
      )
    },
    {
      id: 'polygon',
      name: '多边形',
      generator: new PolygonShapeGenerator(
        center,              // 中心点
        100,                 // 外接圆半径
        8,                   // 边数（正八边形）
        [],                  // 自定义顶点（空表示正多边形）
        64,                  // 点数
        0                    // 旋转角度
      )
    }
  ];
}

// 导出所有需要的类和函数
export {
  Point,
  LineShapeGenerator,
  CircleShapeGenerator,
  RectangleShapeGenerator,
  StarShapeGenerator,
  SemiCircleShapeGenerator,
  FrameByFrameAnimationGenerator,
  EasingFunction
};