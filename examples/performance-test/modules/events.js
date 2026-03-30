/**
 * 事件处理模块
 * 负责所有事件绑定和处理
 */

/**
 * 事件管理器类
 */
export class EventManager {
  /**
   * 构造函数
   * @param {Object} elements - DOM元素对象
   * @param {Object} handlers - 事件处理器对象
   */
  constructor(elements, handlers) {
    this.elements = elements;
    this.handlers = handlers;
    this.bindEvents();
  }

  /**
   * 绑定所有事件
   */
  bindEvents() {
    // 图形数量控制
    this.elements.shapeCount.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.elements.shapeCountNumber.value = value;
      this.handlers.onShapeCountChange(value);
    });

    this.elements.shapeCountNumber.addEventListener('input', (e) => {
      let value = parseInt(e.target.value);
      value = Math.max(1, Math.min(value, 1000));
      this.elements.shapeCount.value = value;
      this.handlers.onShapeCountChange(value);
    });

    // 图形大小控制
    this.elements.shapeSize.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.elements.shapeSizeNumber.value = value;
      this.handlers.onShapeSizeChange(value);
    });

    this.elements.shapeSizeNumber.addEventListener('input', (e) => {
      let value = parseInt(e.target.value);
      value = Math.max(5, Math.min(value, 50));
      this.elements.shapeSize.value = value;
      this.handlers.onShapeSizeChange(value);
    });

    // 动画速度控制
    this.elements.animationSpeed.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this.elements.animationSpeedNumber.value = value;
      this.handlers.onSpeedChange(value);
    });

    this.elements.animationSpeedNumber.addEventListener('input', (e) => {
      let value = parseFloat(e.target.value);
      value = Math.max(0.1, Math.min(value, 2));
      this.elements.animationSpeed.value = value;
      this.handlers.onSpeedChange(value);
    });

    // 选择框事件
    this.elements.shapeType.addEventListener('change', (e) => {
      this.handlers.onShapeTypeChange(e.target.value);
    });

    this.elements.transformType.addEventListener('change', (e) => {
      this.handlers.onTransformTypeChange(e.target.value);
    });

    this.elements.renderMode.addEventListener('change', (e) => {
      this.handlers.onRenderModeChange(e.target.value);
    });

    // 按钮事件
    this.elements.startBtn.addEventListener('click', () => {
      this.handlers.onStartTest();
    });

    this.elements.stopBtn.addEventListener('click', () => {
      this.handlers.onStopTest();
    });

    this.elements.resetBtn.addEventListener('click', () => {
      this.handlers.onResetTest();
    });
  }

  /**
   * 更新按钮状态
   * @param {boolean} isTesting - 是否正在测试
   */
  updateButtonStates(isTesting) {
    this.elements.startBtn.disabled = isTesting;
    this.elements.stopBtn.disabled = !isTesting;
    this.elements.resetBtn.disabled = isTesting;
    
    // 更新输入控件状态
    const controls = [
      this.elements.shapeCount,
      this.elements.shapeCountNumber,
      this.elements.shapeSize,
      this.elements.shapeSizeNumber,
      this.elements.shapeType,
      this.elements.transformType,
      this.elements.animationSpeed,
      this.elements.animationSpeedNumber,
      this.elements.renderMode
    ];
    
    controls.forEach(control => {
      control.disabled = isTesting;
    });
  }
}