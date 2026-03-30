/**
 * Graphic Logic 图形演示应用
 * 采用模块化设计，支持动态添加图形和变换效果
 */

// 导入模块
import { 
  Point,
  createShapeConfigs,
  createTransforms,
  createTransformConfigs
} from './modules/library.js';

import { 
  getDOMElements,
  populateSelect,
  updateInfo,
  updateRangeValue,
  updateNumberValue,
  setButtonText,
  addOptionToSelect
} from './modules/dom.js';

import { AnimationController } from './modules/animation.js';
import { EventManager } from './modules/events.js';

/**
 * 图形演示应用类
 */
class GraphDemoApp {
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
    
    // 创建中心点
    this.center = new Point(200, 200);
    
    // 创建图形和变换配置
    this.initializeConfigurations();
    
    // 创建动画控制器
    this.animationController = new AnimationController({
      canvas: this.elements.canvas,
      center: this.center,
      pointSize: 3
    });
    
    // 创建事件管理器
    this.eventManager = new EventManager(this.elements, this.createEventHandlers());
    
    // 初始化UI
    this.populateSelects();
    
    // 生成初始动画
    this.generateAnimation();
  }

  /**
   * 初始化配置
   */
  initializeConfigurations() {
    // 创建图形配置
    this.shapes = createShapeConfigs(this.center);
    
    // 创建变换对象和配置
    const transforms = createTransforms(this.center);
    this.transforms = createTransformConfigs(transforms);
    
    // 当前选择
    this.currentShapeId = 'circle';
    this.currentTransformId = 'standard';
  }

  /**
   * 创建事件处理器
   * @returns {Object} 事件处理器对象
   */
  createEventHandlers() {
    return {
      onShapeChange: (shapeId) => this.handleShapeChange(shapeId),
      onTransformChange: (transformId) => this.handleTransformChange(transformId),
      onFrameChange: (frame) => this.handleFrameChange(frame),
      onFPSChange: (fps) => this.handleFPSChange(fps),
      onPointSizeChange: (size) => this.handlePointSizeChange(size),
      onPreviousFrame: () => this.handlePreviousFrame(),
      onNextFrame: () => this.handleNextFrame(),
      onTogglePlay: () => this.handleTogglePlay(),
      getTotalFrames: () => this.animationController.getTotalFrames()
    };
  }

  /**
   * 填充选择框
   */
  populateSelects() {
    // 填充图形选择
    populateSelect(this.elements.shapeSelect, this.shapes, this.currentShapeId);
    
    // 填充变换选择
    this.updateTransformOptions();
  }

  /**
   * 更新变换选项（根据当前图形过滤兼容的变换）
   */
  updateTransformOptions() {
    // 筛选兼容的变换
    const compatibleTransforms = this.transforms.filter(transform => 
      transform.compatibleShapes.includes(this.currentShapeId)
    );

    // 如果当前选择的变换不兼容，选择第一个兼容的变换
    if (!compatibleTransforms.some(t => t.id === this.currentTransformId)) {
      this.currentTransformId = compatibleTransforms[0]?.id || 'standard';
    }

    // 填充变换选择
    populateSelect(this.elements.transformSelect, compatibleTransforms, this.currentTransformId);
  }

  /**
   * 处理图形变更
   * @param {string} shapeId - 图形ID
   */
  handleShapeChange(shapeId) {
    this.currentShapeId = shapeId;
    this.updateTransformOptions();
    this.generateAnimation();
  }

  /**
   * 处理变换变更
   * @param {string} transformId - 变换ID
   */
  handleTransformChange(transformId) {
    this.currentTransformId = transformId;
    this.generateAnimation();
  }

  /**
   * 处理帧变更
   * @param {number} frame - 帧索引
   */
  handleFrameChange(frame) {
    const currentFrame = this.animationController.drawFrame(frame);
    this.updateFrameUI(currentFrame);
  }

  /**
   * 处理FPS变更
   * @param {number} fps - 帧率
   */
  handleFPSChange(fps) {
    this.animationController.setFPS(fps);
    updateRangeValue(this.elements.fpsRange, fps);
    updateNumberValue(this.elements.fpsNumber, fps);
  }

  /**
   * 处理点大小变更
   * @param {number} size - 点大小
   */
  handlePointSizeChange(size) {
    this.animationController.setPointSize(size);
    updateRangeValue(this.elements.pointSize, size);
    updateNumberValue(this.elements.pointSizeNumber, size);
  }

  /**
   * 处理上一帧
   */
  handlePreviousFrame() {
    const currentFrame = this.animationController.previousFrame();
    this.updateFrameUI(currentFrame);
  }

  /**
   * 处理下一帧
   */
  handleNextFrame() {
    const currentFrame = this.animationController.nextFrame();
    this.updateFrameUI(currentFrame);
  }

  /**
   * 处理播放/暂停
   */
  handleTogglePlay() {
    const isPlaying = this.animationController.togglePlay();
    setButtonText(this.elements.playBtn, isPlaying ? '暂停 (空格)' : '播放 (空格)');
  }

  /**
   * 生成动画
   */
  generateAnimation() {
    const shape = this.shapes.find(s => s.id === this.currentShapeId);
    const transform = this.transforms.find(t => t.id === this.currentTransformId);

    if (!shape || !transform) return;

    this.animationController.generateAnimation(shape, transform);

    // 更新UI
    const totalFrames = this.animationController.getTotalFrames();
    this.elements.frameRange.max = (totalFrames - 1).toString();
    this.elements.frameNumber.max = (totalFrames - 1).toString();
    
    // 更新信息显示
    updateInfo(this.elements.frameInfo, `帧: 0 / ${totalFrames}`);
    updateInfo(this.elements.shapeInfo, `图形: ${shape.name}`);
    updateInfo(this.elements.transformInfo, `变换: ${transform.name}`);

    // 绘制第一帧
    this.animationController.drawFrame(0);
    this.updateFrameUI(0);
  }

  /**
   * 更新帧UI
   * @param {number} currentFrame - 当前帧索引
   */
  updateFrameUI(currentFrame) {
    const totalFrames = this.animationController.getTotalFrames();
    updateRangeValue(this.elements.frameRange, currentFrame);
    updateNumberValue(this.elements.frameNumber, currentFrame);
    updateInfo(this.elements.frameInfo, `帧: ${currentFrame} / ${totalFrames}`);
  }

  /**
   * 添加新的图形生成器
   * @param {Object} shapeConfig - 图形配置对象
   */
  addShape(shapeConfig) {
    this.shapes.push(shapeConfig);
    addOptionToSelect(this.elements.shapeSelect, shapeConfig);
  }

  /**
   * 添加新的变换配置
   * @param {Object} transformConfig - 变换配置对象
   */
  addTransform(transformConfig) {
    this.transforms.push(transformConfig);
    this.updateTransformOptions();
  }
}

// 初始化应用
const app = new GraphDemoApp();

// 导出应用实例，方便外部扩展
window.GraphDemoApp = app;