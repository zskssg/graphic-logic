/**
 * 动画逻辑模块
 * 负责动画的生成、绘制和播放控制
 */

import { FrameByFrameAnimationGenerator } from './library.js';

/**
 * 动画控制器类
 */
export class AnimationController {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   */
  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = options.canvas.getContext('2d');
    this.center = options.center;
    this.pointSize = options.pointSize || 3;

    // 动画状态
    this.frames = [];
    this.currentFrame = 0;
    this.isPlaying = false;
    this.animationId = null;
    this.lastTime = 0;
    this.fps = 30;
  }

  /**
   * 设置点大小
   * @param {number} size - 点大小
   */
  setPointSize(size) {
    this.pointSize = size;
    this.drawFrame(this.currentFrame);
  }

  /**
   * 设置帧率
   * @param {number} fps - 帧率
   */
  setFPS(fps) {
    this.fps = fps;
  }

  /**
   * 生成动画帧
   * @param {Object} shapeConfig - 图形配置
   * @param {Object} transformConfig - 变换配置
   * @returns {Promise<Array>} 生成的帧数组
   */
  generateAnimation(shapeConfig, transformConfig) {
    const animation = new FrameByFrameAnimationGenerator(
      shapeConfig.generator,
      transformConfig.transformations
    );

    this.frames = animation.generateFrames(64);
    this.currentFrame = 0;

    return this.frames;
  }

  /**
   * 绘制指定帧
   * @param {number} frameIndex - 帧索引
   * @returns {number} 当前帧索引
   */
  drawFrame(frameIndex) {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.frames.length === 0) return frameIndex;

    const frame = this.frames[frameIndex];
    console.log(frame);
    // 绘制背景网格
    this.drawGrid();

    // 绘制点
    this.ctx.fillStyle = '#007bff';
    frame.forEach(point => {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, this.pointSize, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.currentFrame = frameIndex;
    return frameIndex;
  }

  /**
   * 绘制背景网格
   */
  drawGrid() {
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 0.5;

    // 绘制水平线
    for (let y = 0; y <= this.canvas.height; y += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // 绘制垂直线
    for (let x = 0; x <= this.canvas.width; x += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // 绘制中心点
    this.ctx.fillStyle = '#ccc';
    this.ctx.beginPath();
    this.ctx.arc(this.center.x, this.center.y, 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * 动画循环
   * @param {number} currentTime - 当前时间
   */
  animate(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;

    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1000 / this.fps) {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.drawFrame(this.currentFrame);
      this.lastTime = currentTime;
    }

    if (this.isPlaying) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
  }

  /**
   * 播放/暂停动画
   * @returns {boolean} 当前播放状态
   */
  togglePlay() {
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.lastTime = 0;
      this.animationId = requestAnimationFrame((time) => this.animate(time));
    } else {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }

    return this.isPlaying;
  }

  /**
   * 上一帧
   * @returns {number} 当前帧索引
   */
  previousFrame() {
    let frame = this.currentFrame - 1;
    if (frame < 0) frame = this.frames.length - 1;
    return this.drawFrame(frame);
  }

  /**
   * 下一帧
   * @returns {number} 当前帧索引
   */
  nextFrame() {
    let frame = this.currentFrame + 1;
    if (frame >= this.frames.length) frame = 0;
    return this.drawFrame(frame);
  }

  /**
   * 获取当前帧索引
   * @returns {number} 当前帧索引
   */
  getCurrentFrame() {
    return this.currentFrame;
  }

  /**
   * 获取总帧数
   * @returns {number} 总帧数
   */
  getTotalFrames() {
    return this.frames.length;
  }
}