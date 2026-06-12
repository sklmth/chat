// DOM操作工具函数
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const dom = {
  // 创建元素
  create(tag, className, innerHTML) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  },

  // 添加子元素
  append(parent, child) {
    if (typeof parent === 'string') parent = $(parent);
    if (child) parent.appendChild(child);
    return parent;
  },

  // 清空元素
  empty(selector) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (el) el.innerHTML = '';
    return el;
  },

  // 显示/隐藏
  show(selector) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (el) el.style.display = '';
  },

  hide(selector) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (el) el.style.display = 'none';
  },

  // 切换类名
  toggleClass(selector, className) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (el) el.classList.toggle(className);
  },

  addClass(selector, className) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (el) el.classList.add(className);
  },

  removeClass(selector, className) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (el) el.classList.remove(className);
  },

  // 设置文本
  setText(selector, text) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (el) el.textContent = text;
  },

  // 设置HTML
  setHTML(selector, html) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (el) el.innerHTML = html;
  },

  // 滚动到底部
  scrollToBottom(selector, smooth = true) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  },

  // 转义HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
