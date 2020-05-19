
/**
  * `tab-pages`
  *
  * 	Animated page transitions, best used with <paper-tabs> or similar.
  * 
  *
  * @customElement
  * @polymer
  * @demo demo/index.html
  *
  *
  **/

import {AppElement, html} from '@longlost/app-element/app-element.js';
import htmlString 				from './tab-pages.html';


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

      selected: String,

      _measurements: Array,

      _start: Number

    };
  }


  static get observers() {
  	return [
  		'__selectedChanged(selected, _measurements, _start)'
  	];
  }


  __selectedChanged(selected, measurements, start) {
  	if (!selected || !measurements) { return; }

  	const {left} = measurements[selected];
  	const x 		 = left - start;

  	this.$.slide.style['transform'] = `translateX(${-x}px)`;
  }


  __done() {
  	this.fire('tab-pages-page-changed', {value: this.selected});
  }


  __slotChanged() {
  	const nodes = this.slotNodes('#slot');

  	this._start = nodes[0].getBoundingClientRect().left;

  	this._measurements = nodes.reduce((accum, node) => {

  		const page = node.getAttribute(this.attrForSelected);

  		accum[page] = node.getBoundingClientRect();

  		return accum;  			
  	}, {});
  }

}

window.customElements.define(TabPages.is, TabPages);
