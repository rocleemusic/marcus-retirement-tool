(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) {
        el.setAttribute(k, String(attrs[k]));
      }
    }
    return el;
  }

  function addAdult(parent, cx) {
    var sw = { stroke: 'currentColor', 'stroke-linecap': 'round', fill: 'none' };
    // Head
    parent.appendChild(svgEl('circle', { cx: cx, cy: -120, r: 10, fill: 'currentColor' }));
    // Body
    parent.appendChild(svgEl('line', Object.assign({ x1: cx, y1: -100, x2: cx, y2: -60, 'stroke-width': 3 }, sw)));
    // Arms
    parent.appendChild(svgEl('line', Object.assign({ x1: cx, y1: -88, x2: cx - 18, y2: -72, 'stroke-width': 2.5 }, sw)));
    parent.appendChild(svgEl('line', Object.assign({ x1: cx, y1: -88, x2: cx + 18, y2: -72, 'stroke-width': 2.5 }, sw)));
    // Legs
    parent.appendChild(svgEl('line', Object.assign({ x1: cx, y1: -60, x2: cx - 14, y2: 0, 'stroke-width': 2.5 }, sw)));
    parent.appendChild(svgEl('line', Object.assign({ x1: cx, y1: -60, x2: cx + 14, y2: 0, 'stroke-width': 2.5 }, sw)));
  }

  function addChild(parent, cx) {
    var sw = { stroke: 'currentColor', 'stroke-linecap': 'round', fill: 'none' };
    // Head
    parent.appendChild(svgEl('circle', { cx: cx, cy: -78, r: 7, fill: 'currentColor' }));
    // Body
    parent.appendChild(svgEl('line', Object.assign({ x1: cx, y1: -64, x2: cx, y2: -40, 'stroke-width': 2.5 }, sw)));
    // Arms
    parent.appendChild(svgEl('line', Object.assign({ x1: cx, y1: -56, x2: cx - 12, y2: -44, 'stroke-width': 2 }, sw)));
    parent.appendChild(svgEl('line', Object.assign({ x1: cx, y1: -56, x2: cx + 12, y2: -44, 'stroke-width': 2 }, sw)));
    // Legs
    parent.appendChild(svgEl('line', Object.assign({ x1: cx, y1: -40, x2: cx - 10, y2: 0, 'stroke-width': 2 }, sw)));
    parent.appendChild(svgEl('line', Object.assign({ x1: cx, y1: -40, x2: cx + 10, y2: 0, 'stroke-width': 2 }, sw)));
  }

  /**
   * Returns a <g class="hikers"> containing all three party variants.
   * CSS .party-* body classes show/hide the appropriate sub-group.
   * Feet are at (0, 0) relative to this group — position via parent transform.
   */
  window.createHikerGroup = function (party) { // eslint-disable-line no-unused-vars
    var outer = svgEl('g', { class: 'hikers' });

    var solo = svgEl('g', { class: 'hiker-solo' });
    addAdult(solo, 0);

    var duo = svgEl('g', { class: 'hiker-duo' });
    addAdult(duo, -26);
    addAdult(duo, 26);

    var fam = svgEl('g', { class: 'hiker-family' });
    addAdult(fam, -34);
    addChild(fam, 0);
    addAdult(fam, 34);

    outer.appendChild(solo);
    outer.appendChild(duo);
    outer.appendChild(fam);

    return outer;
  };
}());
