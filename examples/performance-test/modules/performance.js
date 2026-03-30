/**
 * 性能监控模块
 * 负责性能指标的收集和计算
 */

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  /**
   * 构造函数
   */
  constructor() {
    this.reset();
  }

  /**
   * 重置性能数据
   */
  reset() {
    this.fpsValues = [];
    this.totalFrames = 0;
    this.totalTime = 0;
    this.minFps = Infinity;
    this.maxFps = 0;
    this.lastFrameTime = 0;
    this.currentFps = 0;
    this.renderTimes = [];
  }

  /**
   * 开始帧计时
   */
  startFrame() {
    this.frameStartTime = performance.now();
  }

  /**
   * 结束帧计时并更新性能数据
   */
  endFrame() {
    const now = performance.now();
    const renderTime = now - this.frameStartTime;
    
    // 更新渲染时间
    this.renderTimes.push(renderTime);
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift();
    }

    // 计算FPS
    if (this.lastFrameTime > 0) {
      const deltaTime = now - this.lastFrameTime;
      const fps = 1000 / deltaTime;
      
      this.currentFps = fps;
      this.fpsValues.push(fps);
      
      if (this.fpsValues.length > 100) {
        this.fpsValues.shift();
      }

      // 更新最小和最大FPS
      this.minFps = Math.min(this.minFps, fps);
      this.maxFps = Math.max(this.maxFps, fps);
    }

    this.lastFrameTime = now;
    this.totalFrames++;
  }

  /**
   * 获取性能指标
   * @returns {Object} 性能指标对象
   */
  getMetrics() {
    // 计算平均FPS
    const avgFps = this.fpsValues.length > 0 
      ? this.fpsValues.reduce((sum, fps) => sum + fps, 0) / this.fpsValues.length
      : 0;

    // 计算平均渲染时间
    const avgRenderTime = this.renderTimes.length > 0
      ? this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length
      : 0;

    return {
      currentFps: this.currentFps,
      avgFps: avgFps,
      minFps: this.minFps === Infinity ? 0 : this.minFps,
      maxFps: this.maxFps,
      renderTime: avgRenderTime,
      totalFrames: this.totalFrames
    };
  }

  /**
   * 获取性能评估结果
   * @returns {Object} 性能评估对象
   */
  getPerformanceReport() {
    const metrics = this.getMetrics();
    
    let grade = 'A';
    let feedback = '';
    
    if (metrics.avgFps< 30) {
      grade = 'F';
      feedback = '性能较差，建议减少图形数量或优化渲染方式';
    } else if (metrics.avgFps < 45) {
      grade = 'D';
      feedback = '性能一般，可以考虑优化';
    } else if (metrics.avgFps < 55) {
      grade = 'C';
      feedback = '性能良好';
    } else if (metrics.avgFps < 60) {
      grade = 'B';
      feedback = '性能优秀';
    } else {
      grade = 'A';
      feedback = '性能极佳';
    }

    return {
      grade,
      feedback,
      metrics
    };
  }
}