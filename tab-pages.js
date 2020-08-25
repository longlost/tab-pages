
/**
  * `tab-pages`
  *
  *   Animated page transitions, best used with <paper-tabs> or similar.
  * 
  *
  * @customElement
  * @polymer
  * @demo demo/index.html
  *
  *
  **/

import {AppElement, html} from '@longlost/app-element/app-element.js';
import {schedule}         from '@longlost/utils/utils.js';
import htmlString         from './tab-pages.html';


class TabPages extends AppElement {
  static get is() { return 'tab-pages'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {

      attrForSelected: {
        type: String,
        value: 'page'
      },

      duration: {
        type: Number,
        value: 500
      },

      selected: String,

      _cancel: Object,

      _current: String,

      _nodes: Object

    };
  }


  static get observers() {
    return [
      '__selectedChanged(selected, _nodes)'
    ];
  }


  constructor() {
    super();

    this._current = this.selected;
  }


  async __selectedChanged(selected, nodes) {
    if (!selected || !nodes) { return; }

    if (!this._current) {
      this._current = selected;
      return;
    }

    if (this._cancel) {
      this._cancel();
    }

    const cancelPromise = new Promise(resolve => {
      this._cancel = resolve;
    });

    const {index, node} = nodes[selected];

    const {
      index: previousIndex, 
      node:  previousNode
    } = nodes[this._current];

    const direction  = index - previousIndex;
    const x          = direction > 0 ? 100 : -100;
    const transition = `transform ${this.duration}ms var(--custom-ease)`;

    previousNode.style['transition'] = transition;
    node.style['transform']          = `translateX(${x}%)`;
    node.style['z-index']            = '1';

    this._current = selected;

    await schedule();

    // NOT using `listenOnce` here since we do not want
    // to keep a long-life reference in memory.
    // The event won't fire if `this._cancel` is called
    // first, thus `listenOnce` doesn't get the chance 
    // to cleanup its cache.
    let resolver;

    const transitionPromise = new Promise(resolve => {
      resolver = resolve;
    });

    node.addEventListener('transitionend', resolver);

    previousNode.style['transform'] = `translateX(${x / -8}%)`;
    node.style['transition']        = transition;
    node.style['transform']         = 'unset';

    // Wait for transition to finish or to be canceled before resetting.
    await Promise.race([
      transitionPromise,
      cancelPromise,
    ]);

    node.removeEventListener('transitionend', resolver);

    node.style['transition']         = 'unset';
    node.style['z-index']            = '0';
    previousNode.style['transform']  = 'unset';
    previousNode.style['transition'] = 'unset';
    previousNode.style['z-index']    = '-1';

    this.fire('tab-pages-page-changed', {value: selected});
  }


  async __setup() {
    await schedule();

    const nodes = this.slotNodes('#slot');

    // Set height of parent to be at least as tall as tallest slotted child node.
    const heights = nodes.map(node => node.getBoundingClientRect().height);
    const tallest = Math.max(...heights);

    this.style['min-height'] = `${tallest}px`;

    const topIndex = this._current ? 
      nodes.findIndex(node => 
        node.getAttribute(this.attrForSelected) === this._current) :
      0;

    // Stack all nodes behind the one that is currently selected.
    nodes.forEach((node, index) => {
      if (index === topIndex) {
        node.style['z-index'] = '0';
      }
      else {
        node.style['z-index'] = '-1';
      }
    });

    this._nodes = nodes.reduce((accum, node, index) => {

      const id  = node.getAttribute(this.attrForSelected);
      accum[id] = {index, node};

      return accum;       
    }, {});

    await schedule();

    this.fire('tab-pages-ready');
  }

}

window.customElements.define(TabPages.is, TabPages);
