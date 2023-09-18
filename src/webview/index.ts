import { createApp, h } from 'vue';
import WebView from './WebView.vue';
import color from './assets/color';

const setColor = () => {
  const colorStyle = document.querySelector('#color-style') as HTMLStyleElement;
  colorStyle.innerHTML = `.simple-code-operator {
    ${(() => {
      var str = ''
      for (const key in color) {
        if (!Object.prototype.hasOwnProperty.call(color, key)) continue;
        str += `--${key}-color: ${color[key]};\r\n`;
      }
      return str;
    })()}
  }`;
}

const init = () => {
  setColor();
  const root = document.createElement('div');
  root.id = 'app';
  document.body.appendChild(root);
  start(root);
};

const start = (root: HTMLElement) => {
  createApp({
    setup () {
      return {};
    },
    render () {
      return h(WebView);
    }
  }).mount(root);
};

init();


