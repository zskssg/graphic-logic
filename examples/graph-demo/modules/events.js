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
    // 图形选择事件
    this.elements.shapeSelect.addEventListener('change', (e) => {
      this.handlers.onShapeChange(e.target.value);
    });

    // 变换选择事件
    this.elements.transformSelect.addEventListener('change', (e) => {
      this.handlers.onTransformChange(e.target.value);
    });

    // 帧控制事件
    this.elements.frameRange.addEventListener('input', (e) => {
      const frame = parseInt(e.target.value);
      this.handlers.onFrameChange(frame);
    });

    this.elements.frameNumber.addEventListener('input', (e) => {
      let frame = parseInt(e.target.value);
      frame = Math.max(0, Math.min(frame, this.handlers.getTotalFrames() - 1));
      this.handlers.onFrameChange(frame);
    });

    // FPS控制事件
    this.elements.fpsRange.addEventListener('input', (e) => {
      const fps = parseInt(e.target.value);
      this.handlers.onFPSChange(fps);
    });

    this.elements.fpsNumber.addEventListener('input', (e) => {
      let newFps = parseInt(e.target.value);
      newFps = Math.max(1, Math.min(newFps, 60));
      this.handlers.onFPSChange(newFps);
    });

    // 点大小控制事件
    this.elements.pointSize.addEventListener('input', (e) => {
      const size = parseInt(e.target.value);
      this.handlers.onPointSizeChange(size);
    });

    this.elements.pointSizeNumber.addEventListener('input', (e) => {
      let size = parseInt(e.target.value);
      size = Math.max(1, Math.min(size, 10));
      this.handlers.onPointSizeChange(size);
    });

    // 按钮事件
    this.elements.prevBtn.addEventListener('click', () => {
      this.handlers.onPreviousFrame();
    });

    this.elements.nextBtn.addEventListener('click', () => {
      this.handlers.onNextFrame();
    });

    this.elements.playBtn.addEventListener('click', () => {
      this.handlers.onTogglePlay();
    });

    // 键盘事件
    document.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });
  }

  /**
   * 处理键盘事件
   * @param {KeyboardEvent} e - 键盘事件
   */
  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        this.handlers.onPreviousFrame();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.handlers.onNextFrame();
        break;
      case ' ':
        e.preventDefault();
        this.handlers.onTogglePlay();
        break;
    }
  }
}