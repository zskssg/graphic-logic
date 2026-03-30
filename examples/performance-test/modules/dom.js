/**
 * DOM操作模块
 * 负责所有DOM元素的获取和操作
 */

/**
 * 获取所有DOM元素
 * @returns {Object} DOM元素对象
 */
export function getDOMElements() {
  return {
    canvas: document.getElementById('testCanvas'),
    shapeCount: document.getElementById('shapeCount'),
    shapeCountNumber: document.getElementById('shapeCountNumber'),
    shapeSize: document.getElementById('shapeSize'),
    shapeSizeNumber: document.getElementById('shapeSizeNumber'),
    shapeType: document.getElementById('shapeType'),
    transformType: document.getElementById('transformType'),
    animationSpeed: document.getElementById('animationSpeed'),
    animationSpeedNumber: document.getElementById('animationSpeedNumber'),
    renderMode: document.getElementById('renderMode'),
    startBtn: document.getElementById('startBtn'),
    stopBtn: document.getElementById('stopBtn'),
    resetBtn: document.getElementById('resetBtn'),
    currentFps: document.getElementById('currentFps'),
    avgFps: document.getElementById('avgFps'),
    minFps: document.getElementById('minFps'),
    maxFps: document.getElementById('maxFps'),
    renderTime: document.getElementById('renderTime'),
    currentShapeCount: document.getElementById('currentShapeCount'),
    testLog: document.getElementById('testLog')
  };
}

/**
 * 更新性能指标显示
 * @param {Object} metrics - 性能指标对象
 */
export function updatePerformanceMetrics(metrics) {
  const elements = getDOMElements();
  
  elements.currentFps.textContent = metrics.currentFps.toFixed(1);
  elements.avgFps.textContent = metrics.avgFps.toFixed(1);
  elements.minFps.textContent = metrics.minFps.toFixed(1);
  elements.maxFps.textContent = metrics.maxFps.toFixed(1);
  elements.renderTime.textContent = metrics.renderTime.toFixed(2) + 'ms';
  elements.currentShapeCount.textContent = metrics.shapeCount;
}

/**
 * 添加日志条目
 * @param {string} message - 日志消息
 * @param {string} type - 日志类型 (info, warning, error, success)
 */
export function addLogEntry(message, type = 'info') {
  const logElement = document.getElementById('testLog');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `[${timestamp}] ${message}`;
  logElement.appendChild(entry);
  
  // 滚动到底部
  logElement.scrollTop = logElement.scrollHeight;
}

/**
 * 清空日志
 */
export function clearLog() {
  document.getElementById('testLog').innerHTML = '';
}

/**
 * 更新范围输入框的值
 * @param {HTMLInputElement} rangeInput - 范围输入框
 * @param {number} value - 值
 */
export function updateRangeValue(rangeInput, value) {
  rangeInput.value = value.toString();
}

/**
 * 更新数字输入框的值
 * @param {HTMLInputElement} numberInput - 数字输入框
 * @param {number} value - 值
 */
export function updateNumberValue(numberInput, value) {
  numberInput.value = value.toString();
}

/**
 * 设置按钮状态
 * @param {HTMLButtonElement} button - 按钮元素
 * @param {boolean} enabled - 是否启用
 */
export function setButtonEnabled(button, enabled) {
  button.disabled = !enabled;
}

/**
 * 设置按钮文本
 * @param {HTMLButtonElement} button - 按钮元素
 * @param {string} text - 按钮文本
 */
export function setButtonText(button, text) {
  button.textContent = text;
}