(function () {
  'use strict';

  /* ── Stage A: hiker position on trail ──────────────────────────── */
  function updateStageA(age) {
    var t   = (age - 18) / (65 - 18);
    var x   = 32 + t * 338;
    var y   = 256 - t * 16;
    var pos = document.getElementById('hiker-position');
    if (pos) pos.setAttribute('transform', 'translate(' + x + ',' + y + ')');
  }

  /* ── Stage B: sun moves right + sky warms by retirement age ────── */
  function updateStageB(retAge) {
    var t    = (retAge - 55) / (80 - 55);
    var sunX = 200 + t * 140;
    var sunY = 60  + t * 160;
    var grp  = document.getElementById('sun-group-b');
    if (grp) grp.setAttribute('transform', 'translate(' + sunX + ',' + sunY + ')');
    var skyEl = document.getElementById('sky-b');
    if (skyEl) {
      skyEl.style.fill = 'rgb(' +
        Math.round(156 + t * 84)  + ',' +
        Math.round(184 + t * 16)  + ',' +
        Math.round(190 - t * 78)  + ')';
    }
  }

  /* ── Stage C: pack fill by savings ────────────────────────────────*/
  function updateStageC(savings) {
    var t      = Math.min(savings / 400000, 1);
    var fillH  = Math.round(100 * t);
    var rect   = document.getElementById('pack-clip-rect');
    if (rect) {
      rect.setAttribute('y',      String(230 - fillH));
      rect.setAttribute('height', String(fillH));
    }
  }

  /* ── Stage D: sun + sky + hiker by monthly savings ─────────────── */
  function updateStageD(monthly) {
    // Sun: piecewise — low savings = behind mountains, high savings = high in sky
    var horizon = 235, skyH = 215, pct, t1, t2;
    if (monthly <= 500) {
      t1  = Math.max((monthly - 200) / 300, 0);
      pct = 0.05 + t1 * 0.28;
    } else {
      t2  = Math.min((monthly - 500) / 2500, 1);
      pct = 0.33 + t2 * 0.21;
    }
    var sunY = Math.round(horizon - pct * skyH);
    var grp  = document.getElementById('sun-group-d');
    if (grp) grp.setAttribute('transform', 'translate(300,' + sunY + ')');

    // Sky: golden yellow at high savings → warm orange at low savings
    var tSky  = Math.min(Math.max((monthly - 200) / 800, 0), 1);
    var skyEl = document.getElementById('sky-d');
    if (skyEl) {
      skyEl.style.fill = 'rgb(' +
        Math.round(238 + tSky * 15) + ',' +
        Math.round(148 + tSky * 71) + ',' +
        Math.round(78  + tSky * 76) + ')';
    }

    // Hiker moves left → right as savings increase
    var tH     = Math.min(Math.max((monthly - 200) / 2800, 0), 1);
    var hikerX = Math.round(20 + tH * 340);
    var hikerY = Math.round(272 - tH * 14);
    var hg     = document.getElementById('hikers-d-group');
    if (hg) hg.setAttribute('transform', 'translate(' + hikerX + ',' + hikerY + ')');
  }

  /* ── Stage E: camp scale by income ─────────────────────────────── */
  var TENT_CX = 220, TENT_CY = 210;
  function updateStageE(income) {
    // Tent scale
    var tTent = Math.min(Math.max((income - 60000) / (200000 - 60000), 0), 1);
    var scale = 0.7 + tTent * 0.3;
    var tent  = document.getElementById('camp-tent');
    if (tent) {
      tent.setAttribute('transform',
        'translate(' + TENT_CX + ',' + TENT_CY + ') ' +
        'scale(' + scale.toFixed(3) + ') ' +
        'translate(' + (-TENT_CX) + ',' + (-TENT_CY) + ')'
      );
    }

    // Gear opacity
    var gear = document.getElementById('camp-gear');
    if (gear) {
      var tGear = income >= 80000 ? Math.min((income - 80000) / 60000, 1) : 0;
      gear.setAttribute('opacity', tGear.toFixed(2));
    }

    // Fire pit opacity
    var pit = document.getElementById('camp-fire-pit');
    if (pit) {
      var tPit = income >= 100000 ? Math.min((income - 100000) / 40000, 1) : 0;
      pit.setAttribute('opacity', tPit.toFixed(2));
    }

    // Hiker shift toward fire
    var hikerGroup = document.getElementById('hikers-e-group');
    if (hikerGroup) {
      var shift = income >= 100000 ? Math.min((income - 100000) / 100000, 1) * 22 : 0;
      hikerGroup.setAttribute('transform', 'translate(' + (85 + shift) + ',252)');
    }
  }

  /* ── Campfire animation ─────────────────────────────────────────── */
  function animateCampfire() {
    var base = document.getElementById('fire-base');
    var mid  = document.getElementById('fire-mid');
    var tip  = document.getElementById('fire-tip');
    if (!base) return;

    function revealLayer(el, delay, dur) {
      setTimeout(function () {
        el.style.transition = 'opacity ' + dur + 's ease';
        el.style.opacity    = '1';
        el.classList.add('lit');
      }, delay);
    }
    revealLayer(base,   0, 0.6);
    revealLayer(mid,  300, 0.5);
    revealLayer(tip,  600, 0.4);
  }

  /* ── Campfire size update ───────────────────────────────────────── */
  window.updateCampfireSize = function (outcome) {
    var flames = document.getElementById('campfire-flames');
    if (!flames) return;
    flames.classList.remove('fire-full', 'fire-small');
    flames.classList.add(outcome === 'on-track' ? 'fire-full' : 'fire-small');
  };

  /* ── Reveal copy by outcome ─────────────────────────────────────── */
  var REVEAL = {
    'on-track': function (fv, target) {
      return [
        { text: 'You made camp before dark.',                                                              bold: true,  delay: 1000 },
        { text: 'At your current pace, you\'re on track to reach ' + formatCurrency(fv) + ' by age ' + state.inputs.retirementAge + '.', delay: 1800 },
        { text: 'Your target is ' + formatCurrency(target) + '. You\'re there.',                          delay: 2600 },
        { text: 'Camp is set. The fire\'s perfect.',                                                       bold: true,  delay: 3600 }
      ];
    },
    'slightly-behind': function (fv, target) {
      var gap = target - fv;
      return [
        { text: 'You\'re close — but the trail\'s a little longer than you\'d like.',  bold: true,  delay: 1000 },
        { text: 'You\'re ' + formatCurrency(gap) + ' short of your target right now.',              delay: 1800 },
        { text: 'But there\'s time to catch up.',                                                   delay: 2600 },
        { text: 'See what it takes.',                                                  bold: true,  delay: 3600 }
      ];
    },
    'significantly-behind': function (fv, target) {
      return [
        { text: 'You\'re behind. That\'s the honest answer.',                                                                                                bold: true,  delay: 1000 },
        { text: 'At your current pace, you\'ll reach ' + formatCurrency(fv) + ' by age ' + state.inputs.retirementAge + '. Your target is ' + formatCurrency(target) + '.',  delay: 1800 },
        { text: 'That\'s a real gap — but we can fix it.',                                                                                                               delay: 2600 },
        { text: 'Here\'s what closing it actually looks like.',                                                                                             bold: true,  delay: 3600 }
      ];
    }
  };

  /* ── Swap reveal lines with fade when outcome tier changes ─────── */
  var _revealTimer = null;
  function updateRevealLines(fv, target, outcome) {
    var els = [];
    for (var i = 1; i <= 4; i++) els.push(document.getElementById('reveal-' + i));

    if (_revealTimer) clearTimeout(_revealTimer);

    els.forEach(function (el) { if (el) el.classList.remove('revealed'); });

    _revealTimer = setTimeout(function () {
      var lines = REVEAL[outcome](fv, target);
      els.forEach(function (el, i) {
        if (!el || !lines[i]) return;
        el.textContent = lines[i].text;
        el.classList.toggle('line-bold', !!lines[i].bold);
      });
      els.forEach(function (el, i) {
        if (el) setTimeout(function () { el.classList.add('revealed'); }, i * 120);
      });
      updateCTA(outcome);
      _revealTimer = null;
    }, 650);
  }

  /* ── Swap CTA text by outcome ──────────────────────────────────── */
  function updateCTA(outcome) {
    var ctaText = document.querySelector('.cta-text');
    if (!ctaText) return;
    ctaText.textContent = outcome === 'on-track'
      ? 'You\'re on track. Let\'s talk about keeping it that way.'
      : 'Let\'s talk about how to get there.';
  }

  /* ── Start end-screen reveal ────────────────────────────────────── */
  window.startReveal = function () {
    // Sync state.inputs from slider DOM values — source of truth at reveal time
    var sliderSync = [
      ['slider-a', 'age'],
      ['slider-b', 'retirementAge'],
      ['slider-c', 'savings'],
      ['slider-d', 'monthly'],
      ['slider-e', 'income']
    ];
    sliderSync.forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (el) state.inputs[pair[1]] = Math.round(parseFloat(el.value));
    });

    // Reset reveal lines for clean re-entry
    for (var ri = 1; ri <= 4; ri++) {
      var rel = document.getElementById('reveal-' + ri);
      if (rel) { rel.classList.remove('revealed'); rel.textContent = ''; }
    }
    var pf = document.getElementById('path-forward');
    if (pf) pf.style.display = 'none';

    var inputs  = state.inputs;
    var n       = inputs.retirementAge - inputs.age;
    var target  = calcTarget(inputs.income);
    var fv      = calcFV(inputs.savings, inputs.monthly, n);
    var gap     = calcGapRatio(fv, target);

    state.target           = target;
    state.projectedSavings = fv;

    var outcome = gap <= 0 ? 'on-track' : gap <= 0.15 ? 'slightly-behind' : 'significantly-behind';
    state.outcome = outcome;

    updateCampfireSize(outcome);
    updateCTA(outcome);
    setTimeout(animateCampfire, 400);

    var lines = REVEAL[outcome](fv, target);
    lines.forEach(function (line, i) {
      var el = document.getElementById('reveal-' + (i + 1));
      if (!el) return;
      el.textContent = line.text;
      el.classList.toggle('line-bold', !!line.bold);
      setTimeout(function () { el.classList.add('revealed'); }, line.delay);
    });

    if (outcome !== 'on-track') {
      setTimeout(function () {
        setupPathForward(fv, target, n);
        var pf = document.getElementById('path-forward');
        if (pf) pf.style.display = 'flex';
      }, 4400);
    }
  };

  /* ── Setup path-forward sliders ─────────────────────────────────── */
  function setupPathForward(currentFV, target, n) {
    var inputs  = state.inputs;
    var extra   = calcExtraMonthlyNeeded(currentFV, target, n);
    var mo      = inputs.monthly;
    var retAge  = inputs.retirementAge;

    var msSlider = document.getElementById('slider-path-monthly');
    msSlider.min   = 0;
    msSlider.max   = 5000;
    msSlider.step  = 50;
    msSlider.value = mo;

    var ageSlider = document.getElementById('slider-path-age');
    ageSlider.min   = retAge;
    ageSlider.max   = retAge + 10;
    ageSlider.step  = 1;
    ageSlider.value = retAge + 2;

    recalcOutcome(true);
  }

  /* ── Live recalculation for path-forward sliders ────────────────── */
  window.recalcOutcome = function (suppressReveal) {
    var inputs   = state.inputs;
    var target   = state.target;
    var age      = inputs.age;
    var savings  = inputs.savings;
    var baseMo   = inputs.monthly;
    var baseAge  = inputs.retirementAge;

    var pathMo  = parseInt(document.getElementById('slider-path-monthly').value, 10) || baseMo;
    var pathAge = parseInt(document.getElementById('slider-path-age').value, 10)     || baseAge + 2;

    // Monthly slider: new monthly, original retirement age
    var fvMo  = calcFV(savings, pathMo, baseAge - age);
    var bufMo = fvMo - target;

    var valMoEl  = document.getElementById('val-path-monthly');
    var descMoEl = document.getElementById('desc-monthly');
    if (valMoEl)  valMoEl.textContent  = formatCurrency(pathMo) + '/mo';
    if (descMoEl) {
      descMoEl.textContent = bufMo >= 0
        ? 'At ' + formatCurrency(pathMo) + '/month you\'ll make camp with ' + formatCurrency(bufMo) + ' to spare.'
        : 'At ' + formatCurrency(pathMo) + '/month you\'re still ' + formatCurrency(-bufMo) + ' short.';
    }

    // Age slider: original monthly, new retirement age
    var fvAge  = calcFV(savings, baseMo, pathAge - age);
    var bufAge = fvAge - target;

    var valAgeEl  = document.getElementById('val-path-age');
    var descAgeEl = document.getElementById('desc-age');
    if (valAgeEl)  valAgeEl.textContent  = 'Age ' + pathAge;
    if (descAgeEl) {
      descAgeEl.textContent = bufAge >= 0
        ? 'Retire at ' + pathAge + ' and you arrive with ' + formatCurrency(bufAge) + ' to spare.'
        : 'Retire at ' + pathAge + ' and you\'re still ' + formatCurrency(-bufAge) + ' short.';
    }

    // Campfire + reveal lines reflect monthly slider outcome
    var gapMo      = calcGapRatio(fvMo, target);
    var newOutcome = gapMo <= 0 ? 'on-track' : gapMo <= 0.15 ? 'slightly-behind' : 'significantly-behind';
    updateCampfireSize(newOutcome);
    if (newOutcome !== state.outcome) {
      if (!suppressReveal) updateRevealLines(fvMo, target, newOutcome);
      state.outcome = newOutcome;
    }
  };

  /* ── Bind one input stage (choice buttons + slider + next) ──────── */
  function bindStage(stageId, sliderId, valId, format, onChange) {
    // Choice buttons
    document.querySelectorAll('#screen-' + stageId + ' .choice-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#screen-' + stageId + ' .choice-btn')
          .forEach(function (b) { b.classList.remove('selected'); });
        this.classList.add('selected');
        var val = parseFloat(this.dataset.default);
        var slider = document.getElementById(sliderId);
        if (slider) { slider.value = val; onChange(val); }
        var display = document.getElementById(valId);
        if (display) display.textContent = format(val);
      });
    });

    // Slider
    var slider = document.getElementById(sliderId);
    if (slider) {
      slider.addEventListener('input', function () {
        var v = parseFloat(this.value);
        onChange(v);
        var display = document.getElementById(valId);
        if (display) display.textContent = format(v);
      });
    }

    // Next button
    var nextBtn = document.querySelector('#screen-' + stageId + ' .next-btn');
    if (nextBtn) nextBtn.addEventListener('click', window.nextStage);
  }

  /* ── DOMContentLoaded init ──────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    // Initial state
    document.body.classList.add('phase-dawn');
    window.showScreen('entry');

    /* Stage 0 — party selection */
    document.querySelectorAll('.entry-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var party = this.dataset.party;
        state.party = party;

        document.body.classList.remove('party-solo', 'party-duo', 'party-family');
        document.body.classList.add('party-' + party);

        document.querySelectorAll('.entry-btn').forEach(function (b) { b.classList.remove('selected'); });
        this.classList.add('selected');

        document.getElementById('btn-letsgo').classList.remove('hidden');

        // Swap Stage 0 illustration (use style.display to override CSS)
        document.querySelectorAll('.stage0-variant').forEach(function (el) {
          el.style.display = 'none';
        });
        var illus = document.getElementById('illus-' + party);
        if (illus) illus.style.display = 'block';
      });
    });

    document.getElementById('btn-letsgo').addEventListener('click', function () {
      window.initHikers();
      window.showScreen('a');
      updateStageA(state.inputs.age);
    });

    /* Stage A — current age */
    document.querySelector('#screen-a .stage-svg').addEventListener('transitionend', function () {});
    bindStage('a', 'slider-a', 'val-a',
      function (v) { return String(Math.round(v)); },
      function (v) {
        state.inputs.age = Math.round(v);
        updateStageA(state.inputs.age);
      }
    );

    /* Stage B — target retirement age */
    bindStage('b', 'slider-b', 'val-b',
      function (v) { return String(Math.round(v)); },
      function (v) {
        state.inputs.retirementAge = Math.round(v);
        updateStageB(state.inputs.retirementAge);
      }
    );

    /* Stage C — current savings */
    bindStage('c', 'slider-c', 'val-c',
      formatCurrency,
      function (v) {
        state.inputs.savings = Math.round(v);
        updateStageC(state.inputs.savings);
      }
    );

    /* Stage D — monthly savings */
    bindStage('d', 'slider-d', 'val-d',
      formatCurrency,
      function (v) {
        state.inputs.monthly = Math.round(v);
        updateStageD(state.inputs.monthly);
      }
    );

    /* Stage E — annual income */
    bindStage('e', 'slider-e', 'val-e',
      formatCurrency,
      function (v) {
        state.inputs.income = Math.round(v);
        updateStageE(state.inputs.income);
      }
    );

    /* Path-forward sliders */
    var pfMo  = document.getElementById('slider-path-monthly');
    var pfAge = document.getElementById('slider-path-age');
    if (pfMo)  pfMo.addEventListener('input',  window.recalcOutcome);
    if (pfAge) pfAge.addEventListener('input', window.recalcOutcome);

    /* Trigger initial live updates when stages are shown */
    // Patch showScreen to seed live SVG state on first visit
    var _origShow = window.showScreen;
    window.showScreen = function (id) {
      _origShow(id);
      setTimeout(function () {
        if (id === 'a') updateStageA(state.inputs.age);
        if (id === 'b') updateStageB(state.inputs.retirementAge);
        if (id === 'c') updateStageC(state.inputs.savings);
        if (id === 'd') updateStageD(state.inputs.monthly);
        if (id === 'e') updateStageE(state.inputs.income);
      }, 50);
    };
  });
}());
