/**
 * Graphic Logic 性能测试应用
 * 用于测试图形生成器的性能表现
 */

// 导入模块
import { 
  createShapeGenerator,
  createTransforms,
  createAnimationGenerator
} from './modules/library.js';

import { 
  getDOMElements,
  updatePerformanceMetrics,
  addLogEntry,
  clearLog,
  updateRangeValue,
  updateNumberValue,
  setButtonEnabled
} from './modules/dom.js';

import { PerformanceMonitor } from './modules/performance.js';
import { ShapeRenderer } from './modules/renderer.js';
import { EventManager } from './modules/events.js';

/**
 * 性能测试应用类
 */
class PerformanceTestApp {
  /**
   * 构造函数
   */
  constructor() {
    this.initialize();
  }

  /**
   * 初始化应用
   */
  initialize() {
    // 获取DOM元素
    this.elements = getDOMElements();
    
    // 创建性能监控器
    this.performanceMonitor = new PerformanceMonitor();
    
    // 创建渲染器
    this.renderer = new ShapeRenderer(this.elements.canvas);
    
    // 创建事件管理器
    this.eventManager = new EventManager(this.elements, this.createEventHandlers());
    
    // 测试配置
    this.config = {
      shapeCount: 100,
      shapeSize: 20,
      shapeType: 'circle',
      transformType: 'rotate',
      speed: 1,
      renderMode: 'points'
    };
    
    // 测试状态
    this.isTesting = false;
    this.testStartTime = 0;
    
    // 添加初始化日志
    addLogEntry('性能测试应用初始化完成', 'success');
    addLogEntry('准备开始性能测试...', 'info');
  }

  /**
   * 创建事件处理器
   * @returns {Object} 事件处理器对象
   */
  createEventHandlers() {
    return {
      onShapeCountChange: (count) => this.handleShapeCountChange(count),
      onShapeSizeChange: (size) => this.handleShapeSizeChange(size),
      onShapeTypeChange: (type) => this.handleShapeTypeChange(type),
      onTransformTypeChange: (type) => this.handleTransformTypeChange(type),
      onSpeedChange: (speed) => this.handleSpeedChange(speed),
      onRenderModeChange: (mode) => this.handleRenderModeChange(mode),
      onStartTest: () => this.startTest(),
      onStopTest: () => this.stopTest(),
      onResetTest: () => this.resetTest()
    };
  }

  /**
   * 处理图形数量变更
   * @param {number} count - 图形数量
   */
  handleShapeCountChange(count) {
    this.config.shapeCount = count;
    if (!this.isTesting) {
      this.updatePreview();
    }
  }

  /**
   * 处理图形大小变更
   * @param {number} size - 图形大小
   */
  handleShapeSizeChange(size) {
    this.config.shapeSize = size;
    if (!this.isTesting) {
      this.updatePreview();
    }
  }

  /**
   * 处理图形类型变更
   * @param {string} type - 图形类型
   */
  handleShapeTypeChange(type) {
    this.config.shapeType = type;
    if (!this.isTesting) {
      this.updatePreview();
    }
  }

  /**
   * 处理变换类型变更
   * @param {string} type - 变换类型
   */
  handleTransformTypeChange(type) {
    this.config.transformType = type;
    if (!this.isTesting) {
      this.updatePreview();
    }
  }

  /**
   * 处理速度变更
   * @param {number} speed - 动画速度
   */
  handleSpeedChange(speed) {
    this.config.speed = speed;
    if (!this.isTesting) {
      this.updatePreview();
    }
  }

  /**
   * 处理渲染模式变更
   * @param {string} mode - 渲染模式
   */
  handleRenderModeChange(mode) {
    this.config.renderMode = mode;
    this.renderer.setRenderMode(mode);
    if (!this.isTesting) {
      this.updatePreview();
    }
  }

  /**
   * 更新预览
   */
  updatePreview() {
    this.renderer.clear();
    this.renderer.createShapes(
      this.config.shapeCount,
      this.config.shapeSize,
      this.config.shapeType,
      this.config.transformType,
      this.config.speed,
      createShapeGenerator,
      createTransforms,
      createAnimationGenerator
    );
    this.renderer.render();
  }

  /**
   * 开始测试
   */
  startTest() {
    if (this.isTesting) return;
    
    this.isTesting = true;
    this.eventManager.updateButtonStates(true);
    
    // 重置性能监控器
    this.performanceMonitor.reset();
    
    // 清除日志
    clearLog();
    addLogEntry('开始性能测试...', 'info');
    addLogEntry(`配置: ${this.config.shapeCount}个${this.getShapeName(this.config.shapeType)}，${this.getTransformName(this.config.transformType)}变换`, 'info');
    
    // 创建图形
    this.renderer.clear();
    this.renderer.createShapes(
      this.config.shapeCount,
      this.config.shapeSize,
      this.config.shapeType,
      this.config.transformType,
      this.config.speed,
      createShapeGenerator,
      createTransforms,
      createAnimationGenerator
    );
    
    // 开始计时
    this.testStartTime = performance.now();
    
    // 开始动画和性能监控
    this.renderer.start();
    this.startPerformanceMonitoring();
    
    addLogEntry('测试已开始，正在收集性能数据...', 'success');
  }

  /**
   * 开始性能监控
   */
  startPerformanceMonitoring() {
    const monitor = () => {
      if (!this.isTesting) return;
      
      this.performanceMonitor.startFrame();
      this.performanceMonitor.endFrame();
      
      const metrics = this.performanceMonitor.getMetrics();
      metrics.shapeCount = this.config.shapeCount;
      
      updatePerformanceMetrics(metrics);
      
      // 每100帧记录一次日志
      if (metrics.totalFrames % 100 === 0) {
        addLogEntry(`已渲染 ${metrics.totalFrames} 帧，当前FPS: ${metrics.currentFps.toFixed(1)}`, 'info');
      }
      
      requestAnimationFrame(monitor);
    };
    
    monitor();
  }

  /**
   * 停止测试
   */
  stopTest() {
    if (!this.isTesting) return;
    
    this.isTesting = false;
    this.eventManager.updateButtonStates(false);
    
    // 停止渲染
    this.renderer.stop();
    
    // 获取性能报告
    const report = this.performanceMonitor.getPerformanceReport();
    const testDuration = (performance.now() - this.testStartTime) / 1000;
    
    addLogEntry('测试已停止', 'info');
    addLogEntry(`测试时长: ${testDuration.toFixed(2)}秒`, 'info');
    addLogEntry(`总帧数: ${report.metrics.totalFrames}`, 'info');
    addLogEntry(`平均FPS: ${report.metrics.avgFps.toFixed(1)}`, 'info');
    addLogEntry(`最低FPS: ${report.metrics.minFps.toFixed(1)}`, 'warning');
    addLogEntry(`最高FPS: ${report.metrics.maxFps.toFixed(1)}`, 'success');
    addLogEntry(`性能评级: ${report.grade} - ${report.feedback}`, 'info');
  }

  /**
   * 重置测试
   */
  resetTest() {
    this.stopTest();
    
    // 重置配置
    this.config = {
      shapeCount: 100,
      shapeSize: 20,
      shapeType: 'circle',
      transformType: 'rotate',
      speed: 1,
      renderMode: 'points'
    };
    
    // 重置UI
    updateRangeValue(this.elements.shapeCount, 100);
    updateNumberValue(this.elements.shapeCountNumber, 100);
    updateRangeValue(this.elements.shapeSize, 20);
    updateNumberValue(this.elements.shapeSizeNumber, 20);
    this.elements.shapeType.value = 'circle';
    this.elements.transformType.value = 'rotate';
    updateRangeValue(this.elements.animationSpeed, 1);
    updateNumberValue(this.elements.animationSpeedNumber, 1);
    this.elements.renderMode.value = 'points';
    
    // 重置性能指标
    updatePerformanceMetrics({
      currentFps: 0,
      avgFps: 0,
      minFps: 0,
      maxFps: 0,
      renderTime: 0,
      shapeCount: 0
    });
    
    // 清空渲染器
    this.renderer.clear();
    
    clearLog();
    addLogEntry('测试已重置', 'success');
    addLogEntry('准备开始新的测试...', 'info');
  }

  /**
   * 获取图形名称
   * @param {string} type - 图形类型
   * @returns {string} 图形名称
   */
  getShapeName(type) {
    const names = {
      circle: '圆形',
      rectangle: '矩形',
      star: '星形',
      semicircle: '半圆',
      wave: '波纹',
      triangle: '三角形',
      parallelogram: '平行四边形',
      ellipse: '椭圆形',
      truncatedCone: '圆台',
      sector: '扇形',
      ring: '圆环',
      polygon: '多边形'
    };
    return names[type] || type;
  }

  /**
   * 获取变换名称
   * @param {string} type - 变换类型
   * @returns {string} 变换名称
   */
  getTransformName(type) {
    const names = {
      rotate: '旋转',
      scale: '缩放',
      wave: '波浪',
      linear: '线性变换',
      waveSpread: '水波扩散',
      combined: '组合',
      staggerRotate: '错列旋转',
      staggerScale: '错列缩放',
      staggerWave: '错列波浪',
      staggerCombined: '错列组合'
    };
    return names[type] || type;
  }
}

// 初始化应用
const app = new PerformanceTestApp();

// 导出应用实例，方便外部扩展
window.PerformanceTestApp = app;