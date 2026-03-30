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
    canvas: document.getElementById('animationCanvas'),
    frameRange: document.getElementById('frameRange'),
    frameNumber: document.getElementById('frameNumber'),
    fpsRange: document.getElementById('fpsRange'),
    fpsNumber: document.getElementById('fpsNumber'),
    pointSize: document.getElementById('pointSize'),
    pointSizeNumber: document.getElementById('pointSizeNumber'),
    prevBtn: document.getElementById('prevBtn'),
    playBtn: document.getElementById('playBtn'),
    nextBtn: document.getElementById('nextBtn'),
    frameInfo: document.getElementById('frameInfo'),
    shapeInfo: document.getElementById('shapeInfo'),
    transformInfo: document.getElementById('transformInfo'),
    shapeSelect: document.getElementById('shapeSelect'),
    transformSelect: document.getElementById('transformSelect')
  };
}

/**
 * 填充下拉选择框
 * @param {HTMLElement} selectElement - 选择框元素
 * @param {Array} options - 选项数组
 * @param {string} selectedValue - 默认选中值
 */
export function populateSelect(selectElement, options, selectedValue) {
  // 清空现有选项
  selectElement.innerHTML = '';
  
  // 添加选项
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.id;
    optionElement.textContent = option.name;
    if (option.id === selectedValue) {
      optionElement.selected = true;
    }
    selectElement.appendChild(optionElement);
  });
}

/**
 * 更新信息显示
 * @param {HTMLElement} element - 显示元素
 * @param {string} text - 显示文本
 */
export function updateInfo(element, text) {
  element.textContent = text;
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
 * 设置按钮文本
 * @param {HTMLButtonElement} button - 按钮元素
 * @param {string} text - 按钮文本
 */
export function setButtonText(button, text) {
  button.textContent = text;
}

/**
 * 添加选项到选择框
 * @param {HTMLElement} selectElement - 选择框元素
 * @param {Object} option - 选项对象
 */
export function addOptionToSelect(selectElement, option) {
  const optionElement = document.createElement('option');
  optionElement.value = option.id;
  optionElement.textContent = option.name;
  selectElement.appendChild(optionElement);
}