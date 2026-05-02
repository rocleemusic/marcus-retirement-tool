(function () {
  'use strict';

  var SCREEN_ORDER  = ['entry', 'a', 'b', 'c', 'd', 'e', 'result'];
  var PHASE_MAP     = {
    entry:  'phase-dawn',
    a:      'phase-dawn',
    b:      'phase-dawn',
    c:      'phase-midday',
    d:      'phase-dusk',
    e:      'phase-dusk',
    result: 'phase-night'
  };
  var PHASE_CLASSES = ['phase-dawn', 'phase-midday', 'phase-dusk', 'phase-night'];

  window.state = {
    party:         null,
    currentScreen: 'entry',
    visited:       new Set(['entry']),
    inputs: {
      age:           38,
      retirementAge: 67,
      savings:       25000,
      monthly:       500,
      income:        80000
    },
    outcome:          null,
    target:           0,
    projectedSavings: 0
  };

  function applyPhase(id) {
    var body = document.body;
    PHASE_CLASSES.forEach(function (c) { body.classList.remove(c); });
    body.classList.add(PHASE_MAP[id]);
  }

  window.showScreen = function (id) {
    var current = document.querySelector('.screen.active');
    var next    = document.getElementById('screen-' + id);
    if (!next) return;

    applyPhase(id);
    state.currentScreen = id;
    state.visited.add(id);

    if (current && current !== next) {
      current.style.transition = 'opacity 0.3s ease';
      current.style.opacity    = '0';
      setTimeout(function () {
        current.style.opacity    = '';
        current.style.transition = '';
        current.classList.remove('active');
        next.classList.add('active');
        updateProgress();
        if (id === 'result' && window.startReveal) {
          window.startReveal();
        }
      }, 280);
    } else {
      if (current) current.classList.remove('active');
      next.classList.add('active');
      updateProgress();
      if (id === 'result' && window.startReveal) {
        window.startReveal();
      }
    }
  };

  window.nextStage = function () {
    var idx = SCREEN_ORDER.indexOf(state.currentScreen);
    if (idx < SCREEN_ORDER.length - 1) {
      window.showScreen(SCREEN_ORDER[idx + 1]);
    }
  };

  window.updateProgress = function () {
    document.querySelectorAll('.progress-tracker').forEach(function (tracker) {
      tracker.innerHTML = '';

      SCREEN_ORDER.forEach(function (screen, i) {
        var isCurrent = screen === state.currentScreen;
        var isPast    = state.visited.has(screen) && !isCurrent;
        var dot       = document.createElement('button');

        dot.className = 'progress-dot ' + (isCurrent ? 'current' : isPast ? 'past' : 'future');
        dot.setAttribute('aria-label',
          'Stage ' + (i + 1) + ', ' +
          (isCurrent ? 'current' : isPast ? 'completed' : 'upcoming')
        );

        if (isPast) {
          dot.addEventListener('click', (function (s) {
            return function () { window.showScreen(s); };
          }(screen)));
        } else {
          dot.disabled = true;
        }

        tracker.appendChild(dot);

        if (i < SCREEN_ORDER.length - 1) {
          var line = document.createElement('div');
          line.className = 'progress-line' + (isPast || isCurrent ? ' filled' : '');
          tracker.appendChild(line);
        }
      });
    });
  };

  /** Inject hiker groups into every stage SVG placeholder. */
  window.initHikers = function () {
    ['a', 'b', 'c', 'd', 'e'].forEach(function (stage) {
      var el = document.getElementById('hikers-' + stage);
      if (el) {
        el.appendChild(window.createHikerGroup(state.party));
      }
    });
  };
}());
