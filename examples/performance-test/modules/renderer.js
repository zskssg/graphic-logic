/**
 * 渲染器模块
 * 负责图形的渲染和动画逻辑
 */

import { Point } from './library.js';

/**
 * 图形渲染器类
 */
export class ShapeRenderer {
  /**
   * 构造函数
   * @param {HTMLCanvasElement} canvas - Canvas元素
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.shapes = [];
    this.currentFrame = 0;
    this.isPlaying = false;
    this.animationId = null;
    this.renderMode = 'points';
  }

  /**
   * 设置渲染模式
   * @param {string} mode - 渲染模式 (points, lines, fill)
   */
  setRenderMode(mode) {
    this.renderMode = mode;
  }

  /**
   * 创建图形数组
   * @param {number} count - 图形数量
   * @param {number} size - 图形大小
   * @param {string} shapeType - 图形类型
   * @param {string} transformType - 变换类型
   * @param {number} speed - 动画速度
   * @param {Object} createShapeGenerator - 创建图形生成器函数
   * @param {Object} createTransforms - 创建变换函数
   * @param {Object} createAnimationGenerator - 创建动画生成器函数
   */
  createShapes(count, size, shapeType, transformType, speed, 
               createShapeGenerator, createTransforms, createAnimationGenerator) {
    this.shapes = [];
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    
    // 创建网格布局
    const gridSize = Math.ceil(Math.sqrt(count));
    const spacing = Math.max(size * 1.5, 50);
    
    for (let i = 0; i< count; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      // 计算位置，居中布局
      const x = (col + 0.5) * spacing + (canvasWidth - gridSize * spacing) / 2;
      const y = (row + 0.5) * spacing + (canvasHeight - gridSize * spacing) / 2;
      
      const center = new Point(x, y);
      const generator = createShapeGenerator(shapeType, center, size);
      const transformations = createTransforms(transformType, center, speed);
      const animation = createAnimationGenerator(generator, transformations);
      
      this.shapes.push({
        animation,
        center,
        frames: animation.generateFrames(64)
      });
    }
    
    this.currentFrame = 0;
  }

  /**
   * 渲染单个图形
   * @param {Object} shape - 图形对象
   */
  renderShape(shape) {
    const frame = shape.frames[this.currentFrame];
    if (!frame) return;

    switch (this.renderMode) {
      case 'points':
        this.renderPoints(frame);
        break;
      case 'lines':
        this.renderLines(frame);
        break;
      case 'fill':
        this.renderFill(frame);
        break;
    }
  }

  /**
   * 渲染点模式
   * @param {Array} points - 点数组
   */
  renderPoints(points) {
    this.ctx.fillStyle = '#007bff';
    points.forEach(point => {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /**
   * 渲染线模式
   * @param {Array} points - 点数组
   */
  renderLines(points) {
    if (points.length< 2) return;
    
    this.ctx.strokeStyle = '#007bff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    // 闭合路径
    this.ctx.lineTo(points[0].x, points[0].y);
    this.ctx.stroke();
  }

  /**
   * 渲染填充模式
   * @param {Array} points - 点数组
   */
  renderFill(points) {
    if (points.length< 3) return;
    
    this.ctx.fillStyle = 'rgba(0, 123, 255, 0.3)';
    this.ctx.strokeStyle = '#007bff';
    this.ctx.lineWidth = 1;
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  /**
   * 渲染所有图形
   */
  render() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制所有图形
    this.shapes.forEach(shape => {
      this.renderShape(shape);
    });
    
    // 更新当前帧
    this.currentFrame = (this.currentFrame + 1) % 64;
  }

  /**
   * 开始动画
   */
  start() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.animate();
  }

  /**
   * 停止动画
   */
  stop() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  /**
   * 动画循环
   */
  animate() {
    if (!this.isPlaying) return;
    
    this.render();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * 获取图形数量
   * @returns {number} 图形数量
   */
  getShapeCount() {
    return this.shapes.length;
  }

  /**
   * 清空所有图形
   */
  clear() {
    this.stop();
    this.shapes = [];
    this.currentFrame = 0;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}