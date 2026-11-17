/* AceTech appliance quiz
   3 random questions from QUESTIONS -> instant feedback -> result -> lead form (bonus claim).
   Tracking: GA4 (gtag events) + Yandex.Metrika (reachGoal + params). Everything is guarded,
   analytics must never break the page. */
(function () {
  'use strict';

  // ---------- settings ----------
  var CFG = {
    perRound: 3,
    terms: 'One bonus code per repair. Valid for 60 days.',
    validDays: 60,
    autoOpenDelay: 30000,     // desktop: open the invitation after 30 s on the site
    snoozeDays: 3,            // after "close", don't auto-open again for N days
    ym: 114115058
  };

  // ---------- bonuses: a perfect round wins one at random (never the same twice); w = relative chance ----------
  var BONUSES = [
    { id: 'free_diagnostic', tag: 'DX', w: 1, title: 'Free Diagnostic',
      text: 'We waive the diagnostic fee on your service call.' },
    { id: 'labor_20', tag: 'L20', w: 1, title: '20% Off Labor',
      text: '20% off the labor on your repair. Parts not included.' },
    { id: 'extra_units', tag: 'MU', w: 1, title: 'Free Diagnostics on Extra Appliances',
      text: 'More than one appliance acting up? We diagnose the 2nd, 3rd and every other one on the same visit for free.' },
    { id: 'year_diagnostics', tag: 'YR', w: 1, title: 'A Year of Free Diagnostics',
      text: 'Repair one appliance with us and get free diagnostics on any other appliance in your home for 12 months.' },
    { id: 'warranty_1y', tag: 'WX', w: 1, title: '1-Year Repair Warranty',
      text: 'Your warranty on parts and labor goes from 180 days to a full year.' }
  ];

  // c = index of the correct option (or array of indexes); fixed = keep option order (e.g. "All three")
  // cat: tech | brand | fun  (a round = 2 tech + 1 from brand/fun, in random order)
  var QUESTIONS = [
    { id: 'bosch-e24', cat: 'tech', q: 'A Bosch dishwasher shows error E24. What’s the problem?',
      a: ['Not filling with water', 'Not washing', 'Not draining', 'Not heating', 'Not drying'], c: 2,
      why: 'E24 means water isn’t draining, usually because of a clogged filter, a kinked drain hose or a blocked pump.' },
    { id: 'whirlpool-f9e1', cat: 'tech', q: 'A Whirlpool washer shows F9 E1. What’s the problem?',
      a: ['Not spinning', 'Not washing', 'Not filling with water', 'Not draining', 'Door latch not working'], c: 3,
      why: 'F9 E1 is a “long drain” code: the washer took too long to pump the water out.' },
    { id: 'ge-88', cat: 'tech', q: 'A GE washer display shows 88 or 88:88. What’s the problem?',
      a: ['Control board issue', 'Drain pump issue', 'Motor issue', 'Door latch issue', 'Touch panel issue'], c: 0,
      why: 'A display stuck on 88 usually points to the main control board not starting up properly.' },
    { id: 'washer-drain-first', cat: 'fun', q: 'Your washer won’t drain. What should you check first?',
      a: ['The drain filter', 'The drain pump', 'Reset the washer', 'Turn it off for 5 minutes', 'Make a cup of coffee and think it over'], c: [0, 4],
      why: 'Start with the drain filter: it’s the most common culprit and easy to reach. (And yes, a cup of coffee never hurts.)' },
    { id: 'factory-warranty', cat: 'brand', q: 'How long is the standard manufacturer’s warranty on most major appliances?',
      a: ['6 months', '1 year', '2 years', '3 years', '5 years'], c: 1, fixed: true,
      why: 'Most brands cover parts and labor for 1 year. After that, repairs are on you, which is where we come in.' },
    { id: 'acetech-warranty', cat: 'brand', q: 'What warranty does AceTech Appliance Repair give on its repairs?',
      a: ['6 months on parts and labor', '3 months on parts and labor', '1 month on parts and labor', '6 months on labor, 3 months on parts', '3 months on labor, 1 month on parts'], c: 0,
      why: 'Every AceTech repair comes with a 180-day guarantee on both parts and labor.' },
    { id: 'lg-ff', cat: 'tech', q: 'An LG refrigerator shows FF or FF1. What’s the problem?',
      a: ['Fridge fan issue', 'Freezer fan issue', 'Fridge temperature issue', 'Freezer temperature issue', 'Water dispenser issue'], c: 1,
      why: 'FF stands for “freezer fan”: the fan isn’t spinning, often because of ice build-up or a failed motor.' },
    { id: 'water-filter', cat: 'brand', q: 'How often do manufacturers recommend replacing a refrigerator water filter?',
      a: ['Every month', 'Every 3 months', 'Every 6 months', 'Every 12 months', 'It’s not really necessary'], c: 2, fixed: true,
      why: 'Every 6 months. An old filter slows the water flow and stops filtering properly.' },
    { id: 'lg-oe', cat: 'tech', q: 'An LG washer shows OE. What’s the problem?',
      a: ['Control board issue', 'Drain pump issue', 'Motor issue', 'Door latch issue', 'Touch panel issue'], c: 1,
      why: 'OE is a drain error: the drain pump, its filter or the drain hose is blocked or has failed.' },
    { id: 'cl-display', cat: 'tech', q: 'What does “CL” on the display mean on most appliances?',
      a: ['Control panel locked', 'Circulation pump issue', 'Control panel not responding', 'Control board issue', 'Door lock issue'], c: 0,
      why: 'CL means the control lock (child lock) is on. Hold the lock button for 3 seconds to turn it off.' },
    { id: 'dryer-no-heat', cat: 'tech', q: 'An electric dryer runs but doesn’t heat. What’s the cause?',
      a: ['Heating element', 'Thermal fuse', 'Control board', 'All three are possible', 'None of these'], c: 3, fixed: true,
      why: 'All three can stop the heat. A technician tests each one before replacing anything.' },
    { id: 'ge-dw-3-beeps', cat: 'tech', q: 'A GE dishwasher beeps three times and won’t start. What’s the problem?',
      a: ['Control panel issue', 'Control board issue', 'Door lock issue', 'Drain pump issue'], c: 1,
      why: 'Three beeps and no start usually point to the control board.' },
    { id: 'samsung-ub', cat: 'tech', q: 'A Samsung washer shows Ub. What’s the problem?',
      a: ['Unbalanced load', 'Not draining', 'Not starting', 'Not spinning'], c: 0,
      why: 'Ub (or UE) means the load is unbalanced. Redistribute the clothes and restart the spin.' },
    { id: 'who-to-call', cat: 'fun', q: 'Your appliance stopped working. What should you do?',
      a: ['Call AceTech Appliance Repair', 'Call your spouse', 'Call 911', 'Call Santa Claus', 'Call PG&E'], c: 0,
      why: 'Correct! Same-day service across Sacramento and the East Bay. (Santa is busy until December.)' },
    { id: 'lg-fridge-not-cooling', cat: 'tech', q: 'What’s the most common reason an LG refrigerator stops cooling?',
      a: ['Freon leak', 'Compressor', 'Control board', 'Inverter board', 'Cooling fan'], c: 1,
      why: 'The compressor. Many LG models use a linear compressor that is known to wear out.' },
    { id: 'microwave-no-heat', cat: 'tech', q: 'What’s the most common reason a microwave stops heating?',
      a: ['Transformer', 'High-voltage diode', 'Magnetron', 'Fuse', 'Door switch'], c: 2,
      why: 'The magnetron, the part that actually produces the microwaves. Never open a microwave yourself: it stores high voltage.' },
    { id: 'top-producer', cat: 'fun', q: 'Which country makes the most home appliances?',
      a: ['USA', 'Mexico', 'China', 'Canada', 'Germany'], c: 2,
      why: 'China produces more home appliances than any other country.' },
    { id: 'ge-owner', cat: 'fun', q: 'GE Appliances is owned by a company from which country?',
      a: ['USA', 'Mexico', 'China', 'Canada', 'Germany'], c: 2,
      why: 'China: Haier bought GE Appliances in 2016. The company is still based in Louisville, Kentucky.' },
    { id: 'samsung-fridge', cat: 'tech', q: 'What’s the most common problem with Samsung refrigerators?',
      a: ['Compressor', 'Ice maker', 'Control board', 'Cooling fan', 'Water valve'], c: 1,
      why: 'The ice maker: it freezes up or leaks on many Samsung models.' }
    // left out until the client confirms (brand-specific product question):
    // { id: 'cleaning-pods', q: 'Which cleaning pods are recommended for washers and dishwashers?', a: ['CLR','LRC','LCR','RCL','RLC'], c: 0 }
  ];

  // ---------- small helpers ----------
  var store = {
    get: function (k) { try { return window.localStorage.getItem('acq_' + k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem('acq_' + k, v); } catch (e) { /* private mode */ } }
  };
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function isCorrect(q, i) { return Array.isArray(q.c) ? q.c.indexOf(i) > -1 : q.c === i; }
  function secs(ms) { return Math.round(ms / 100) / 10; }

  // ---------- tracking ----------
  function track(name, params) {
    params = params || {};
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params); } catch (e) { /* ignore */ }
    try { if (window.dataLayer) window.dataLayer.push(Object.assign({ event: name }, params)); } catch (e) { /* ignore */ }
    try { if (typeof window.ym === 'function') window.ym(CFG.ym, 'reachGoal', name, params); } catch (e) { /* ignore */ }
  }
  function ymParams(obj) {
    try { if (typeof window.ym === 'function') window.ym(CFG.ym, 'params', { quiz: obj }); } catch (e) { /* ignore */ }
  }

  // ---------- round ----------
  function pickRound() {
    var seen = (store.get('seen') || '').split(',');
    var fresh = function (list) { var f = list.filter(function (q) { return seen.indexOf(q.id) < 0; }); return f.length ? f : list; };
    var tech = shuffle(fresh(QUESTIONS.filter(function (q) { return q.cat === 'tech'; })));
    var light = shuffle(fresh(QUESTIONS.filter(function (q) { return q.cat !== 'tech'; })));
    var round = shuffle(tech.slice(0, CFG.perRound - 1).concat(light.slice(0, 1)));
    store.set('seen', seen.concat(round.map(function (q) { return q.id; })).filter(Boolean).slice(-12).join(','));
    return round;
  }

  // ---------- DOM ----------
  var GIFT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 7h-2.2A3 3 0 0 0 12 3.8 3 3 0 0 0 6.2 7H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8h1a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Zm-6.5-2a1 1 0 1 1 1 1h-1V5Zm-4 0a1 1 0 0 1 1 1v0H9.5a1 1 0 0 1 0-2ZM5 9h6v1H5V9Zm2 3h4v7H7v-7Zm10 7h-4v-7h4v7Zm2-9h-6V9h6v1Z"/></svg>';
  var launcher = el('button', 'acq-launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.innerHTML = '<span class="acq-launcher-ico">' + GIFT + '</span><span class="acq-launcher-text"><b>Win a bonus</b><small>3-question appliance quiz</small></span>';

  var overlay = el('div', 'acq-overlay');
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="acq-dialog" role="dialog" aria-modal="true" aria-labelledby="acq-title">' +
    '  <button type="button" class="acq-close" aria-label="Close quiz">&times;</button>' +
    '  <div class="acq-progress" aria-hidden="true"><span></span><span></span><span></span></div>' +
    '  <div class="acq-stage" aria-live="polite"></div>' +
    '</div>';
  var dialog = overlay.querySelector('.acq-dialog');
  var stage = overlay.querySelector('.acq-stage');
  var bars = overlay.querySelectorAll('.acq-progress span');

  // ---------- state ----------
  var S = { round: [], i: 0, score: 0, shownAt: 0, startedAt: 0, step: 'intro', trigger: '', answers: [] };

  function setProgress(n, done) {
    bars.forEach(function (b, k) { b.className = k < n ? 'is-done' : (k === n && !done ? 'is-now' : ''); });
    overlay.querySelector('.acq-progress').style.visibility = S.step === 'question' || S.step === 'answered' ? 'visible' : 'hidden';
  }
  function swap(html) {
    stage.classList.remove('acq-in');
    stage.innerHTML = html;
    void stage.offsetWidth;
    stage.classList.add('acq-in');
  }

  function showIntro() {
    S.step = 'intro'; setProgress(0);
    swap(
      '<span class="acq-eyebrow">' + GIFT + ' 30-second challenge</span>' +
      '<h2 id="acq-title">Think you know <span class="accent">appliances?</span></h2>' +
      '<p class="acq-lead">Answer 3 quick questions from our technicians. Get them all right and win a bonus on your repair.</p>' +
      '<ul class="acq-perks"><li>Win 1 of ' + BONUSES.length + ' repair bonuses, like 20% off labor</li><li>Play again to unlock a different one</li><li>Instant answers from pros, no sign-up</li></ul>' +
      '<button type="button" class="btn btn-primary btn-lg btn-block acq-start">Start the quiz</button>' +
      '<p class="acq-fine">Takes about 30 seconds.</p>');
    stage.querySelector('.acq-start').addEventListener('click', startRound);
  }

  function startRound() {
    S.round = pickRound(); S.i = 0; S.score = 0; S.answers = []; S.startedAt = Date.now();
    track('quiz_start', { trigger: S.trigger, attempt: Number(store.get('attempts') || 0) + 1 });
    store.set('attempts', String(Number(store.get('attempts') || 0) + 1));
    showQuestion();
  }

  function showQuestion() {
    var q = S.round[S.i];
    S.step = 'question'; setProgress(S.i);
    var order = q.fixed ? q.a.map(function (_, k) { return k; }) : shuffle(q.a.map(function (_, k) { return k; }));
    swap(
      '<p class="acq-count">Question ' + (S.i + 1) + ' of ' + S.round.length + '</p>' +
      '<h2 id="acq-title" class="acq-q">' + esc(q.q) + '</h2>' +
      '<div class="acq-options" role="group" aria-label="Answers">' +
      order.map(function (k, n) {
        return '<button type="button" class="acq-opt" data-k="' + k + '"><span class="acq-key">' + 'ABCDE'.charAt(n) + '</span><span>' + esc(q.a[k]) + '</span></button>';
      }).join('') +
      '</div>' +
      '<div class="acq-why" hidden></div>' +
      '<button type="button" class="btn btn-primary btn-lg btn-block acq-next" hidden></button>');
    S.shownAt = Date.now();
    stage.querySelectorAll('.acq-opt').forEach(function (b) { b.addEventListener('click', function () { answer(q, Number(b.getAttribute('data-k'))); }); });
    var first = stage.querySelector('.acq-opt'); if (first) first.focus({ preventScroll: true });
  }

  function answer(q, k) {
    if (S.step !== 'question') return;
    S.step = 'answered';
    var ok = isCorrect(q, k), ms = Date.now() - S.shownAt;
    if (ok) S.score++;
    S.answers.push({ id: q.id, ok: ok, t: secs(ms) });
    stage.querySelectorAll('.acq-opt').forEach(function (b) {
      var bk = Number(b.getAttribute('data-k'));
      b.disabled = true;
      if (isCorrect(q, bk)) b.classList.add('is-right');
      else if (bk === k) b.classList.add('is-wrong');
      else b.classList.add('is-dim');
    });
    var why = stage.querySelector('.acq-why');
    why.innerHTML = '<strong>' + (ok ? 'Correct!' : 'Not quite.') + '</strong> ' + esc(q.why);
    why.className = 'acq-why ' + (ok ? 'is-ok' : 'is-no');
    why.hidden = false;
    var next = stage.querySelector('.acq-next');
    var last = S.i === S.round.length - 1;
    next.textContent = last ? 'See my result' : 'Next question';
    next.hidden = false;
    next.addEventListener('click', function () { if (last) showResult(); else { S.i++; showQuestion(); } });
    setProgress(S.i + 1, true);
    track('quiz_answer', { question_id: q.id, question_number: S.i + 1, correct: ok, time_on_question_sec: secs(ms) });
    setTimeout(function () { next.focus({ preventScroll: true }); }, 50);
  }

  // ---------- bonus wallet (kept in localStorage: [{id, code}]) ----------
  // expired codes drop out of the wallet, so that bonus can be won again
  function wallet() {
    var w; try { w = JSON.parse(store.get('wallet') || '[]'); } catch (e) { w = []; }
    return w.filter(function (x) { return !x.exp || x.exp > Date.now(); });
  }
  function until(item) { return new Date(item.exp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function bonus(id) { return BONUSES.filter(function (b) { return b.id === id; })[0]; }
  function winBonus() {
    var have = wallet(), owned = have.map(function (x) { return x.id; });
    var pool = BONUSES.filter(function (b) { return owned.indexOf(b.id) < 0; });
    if (!pool.length) return null;
    var total = pool.reduce(function (n, b) { return n + b.w; }, 0), r = Math.random() * total, pick = pool[0];
    for (var i = 0; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) { pick = pool[i]; break; } }
    var item = { id: pick.id, code: 'ACE-' + pick.tag + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(), exp: Date.now() + CFG.validDays * 864e5 };
    have.push(item);
    store.set('wallet', JSON.stringify(have));
    return item;
  }
  function collection(highlight) {
    var owned = wallet().map(function (x) { return x.id; });
    return '<div class="acq-collect" aria-label="Bonuses collected"><span class="acq-collect-label">Bonuses collected: <b>' + owned.length + ' of ' + BONUSES.length + '</b></span><div class="acq-collect-dots">' +
      BONUSES.slice().sort(function (x, y) { return (owned.indexOf(x.id) < 0) - (owned.indexOf(y.id) < 0); }).map(function (b) {
        var got = owned.indexOf(b.id) > -1;
        return '<span class="acq-dot' + (got ? ' is-got' : '') + (b.id === highlight ? ' is-new' : '') + '" title="' + (got ? esc(b.title) : 'Locked bonus') + '">' + (got ? GIFT : '?') + '</span>';
      }).join('') + '</div></div>';
  }
  function prizeCard(item, fresh) {
    var b = bonus(item.id);
    return '<div class="acq-prize' + (fresh ? ' is-fresh' : '') + '"><span class="acq-prize-ico">' + GIFT + '</span>' +
      '<span class="acq-prize-body"><b>' + esc(b.title) + '</b><span>' + esc(b.text) + '</span></span>' +
      '<span class="acq-prize-code"><small>Your code \u00b7 valid until ' + until(item) + '</small>' + item.code + '</span></div>';
  }

  function showResult() {
    var total = S.round.length, perfect = S.score === total, sec = secs(Date.now() - S.startedAt);
    S.step = 'result'; setProgress(total, true);
    track('quiz_complete', { score: S.score, total: total, perfect: perfect, total_time_sec: sec });
    ymParams({ score: S.score + '/' + total, time_sec: sec, answers: S.answers });
    if (perfect) {
      track('quiz_perfect', { total_time_sec: sec });
      var item = winBonus();
      if (!item) { showWallet('all'); return; }
      S.newBonus = item.id;
      track('quiz_bonus_won', { bonus_id: item.id, bonuses_collected: wallet().length });
      showWallet('won', S.score + ' / ' + total + ' correct · ' + sec + ' s');
      confetti();
    } else {
      swap(
        '<p class="acq-count">' + S.score + ' / ' + total + ' correct</p>' +
        '<h2 id="acq-title">' + (S.score === total - 1 ? 'So close!' : S.score ? 'Good try!' : 'Tough round!') + ' <span class="accent">Try again?</span></h2>' +
        '<p class="acq-lead">Get all 3 right to win one of ' + BONUSES.length + ' repair bonuses. Every round has new questions.</p>' +
        '<button type="button" class="btn btn-primary btn-lg btn-block acq-retry">Play another round</button>' +
        '<button type="button" class="btn btn-outline btn-lg btn-block acq-book">Just book a repair</button>');
      stage.querySelector('.acq-retry').addEventListener('click', function () { track('quiz_retry', { previous_score: S.score }); startRound(); });
      stage.querySelector('.acq-book').addEventListener('click', function () {
        track('quiz_book_click', { score: S.score }); close('book'); var a = document.querySelector('a[href="#book"], a[data-book]'); if (a) a.click();
      });
    }
  }

  // mode: won (just won S.newBonus) | back (reopened with bonuses) | all (collected everything)
  function showWallet(mode, sub) {
    var have = wallet(), left = BONUSES.length - have.length;
    var item = mode === 'won' ? have[have.length - 1] : have[have.length - 1];
    S.step = 'result'; setProgress(3, true);
    var head = mode === 'won'
      ? '<p class="acq-count">' + esc(sub || '') + '</p><h2 id="acq-title">You won a <span class="accent">bonus!</span></h2>'
      : mode === 'all'
        ? '<h2 id="acq-title">You unlocked <span class="accent">every bonus!</span></h2>'
        : '<h2 id="acq-title">Your bonuses are <span class="accent">waiting</span></h2>';
    var pitch = left
      ? '<p class="acq-lead">' + (mode === 'won' ? 'Feeling lucky? ' : '') + 'Play another round to unlock a different bonus, ' + left + ' more to collect. Then pick the one you like best.</p>'
      : '<p class="acq-lead">You\u2019ve collected all ' + BONUSES.length + '. Pick the one that helps you most.</p>';
    swap(
      '<div class="acq-medal">' + GIFT + '</div>' + head +
      prizeCard(item, mode === 'won') +
      collection(mode === 'won' ? item.id : '') +
      pitch +
      '<button type="button" class="btn btn-primary btn-lg btn-block acq-claim">' + (have.length > 1 ? 'Choose and claim my bonus' : 'Claim this bonus') + '</button>' +
      (left ? '<button type="button" class="btn btn-outline btn-lg btn-block acq-again">Play again for another bonus</button>' : '') +
      '<p class="acq-terms">' + esc(CFG.terms) + '</p>');
    stage.querySelector('.acq-claim').addEventListener('click', showForm);
    var again = stage.querySelector('.acq-again');
    if (again) again.addEventListener('click', function () { track('quiz_play_again', { bonuses_collected: have.length }); startRound(); });
  }

  function showForm() {
    S.step = 'form';
    var have = wallet();
    track('quiz_form_view', { bonuses_collected: have.length });
    var choose = have.slice().reverse().map(function (x, n) {
      var b = bonus(x.id);
      return '<label class="acq-pick"><input type="radio" name="bonus" value="' + x.id + '"' + (n === 0 ? ' checked' : '') + '>' +
        '<span><b>' + esc(b.title) + '</b><small>' + x.code + ' \u00b7 valid until ' + until(x) + '</small></span></label>';
    }).join('');
    swap(
      '<span class="acq-eyebrow">' + GIFT + ' ' + (have.length > 1 ? 'Pick one bonus' : 'Bonus ' + have[0].code) + '</span>' +
      '<h2 id="acq-title">Where should we <span class="accent">send it?</span></h2>' +
      '<p class="acq-lead">We\u2019ll call you to confirm your bonus and book a time that works for you.</p>' +
      '<form class="acq-form" novalidate>' +
      (have.length > 1 ? '<fieldset class="acq-picks"><legend>Your bonus for this repair <small>(' + esc(CFG.terms.replace(/\.$/, '')) + ')</small></legend>' + choose + '</fieldset>' : '') +
      '  <div class="hp-field" aria-hidden="true" style="position:absolute;left:-9999px;height:0;overflow:hidden"><label>Company<input type="text" name="company" tabindex="-1" autocomplete="off"></label></div>' +
      '  <div class="field"><label for="acq-name">Name</label><input id="acq-name" name="name" autocomplete="name" placeholder="Your Name" required></div>' +
      '  <div class="field"><label for="acq-phone">Phone Number</label><input id="acq-phone" name="phone" type="tel" autocomplete="tel" placeholder="Your Number" required></div>' +
      '  <div class="acq-row">' +
      '    <div class="field"><label for="acq-zip">Zip Code</label><input id="acq-zip" name="zip" inputmode="numeric" autocomplete="postal-code" placeholder="Zip" required></div>' +
      '    <div class="field"><label for="acq-app">Appliance</label><select id="acq-app" name="appliance" required><option value="" selected disabled>Select</option>' +
      ['Refrigerator', 'Washer', 'Dryer', 'Dishwasher', 'Range / Oven / Cooktop', 'Microwave', 'Not sure yet'].map(function (o) { return '<option>' + o + '</option>'; }).join('') +
      '</select></div>' +
      '  </div>' +
      '  <p class="acq-error" hidden>Please fill in your name, phone, zip and appliance.</p>' +
      '  <button type="submit" class="btn btn-primary btn-lg btn-block">Claim my bonus</button>' +
      '  <p class="form-note">By clicking, you agree to our <a href="/acetech-preview/privacy-policy/">Privacy Policy</a>.</p>' +
      '</form>');
    var form = stage.querySelector('.acq-form');
    form.querySelector('input[name=name]').focus({ preventScroll: true });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = false;
      form.querySelectorAll('[required]').forEach(function (f) {
        var v = (f.value || '').trim(), miss = !v || (f.name === 'phone' && (v.match(/\d/g) || []).length < 7);
        f.closest('.field').classList.toggle('is-invalid', miss); if (miss) bad = true;
      });
      form.querySelector('.acq-error').hidden = !bad;
      if (bad) return;
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Sending…';
      var have = wallet(), picked = (form.querySelector('input[name=bonus]:checked') || {}).value || have[0].id;
      var chosen = have.filter(function (x) { return x.id === picked; })[0], b = bonus(chosen.id);
      var data = new FormData(form);
      data.delete('bonus');
      data.append('form_type', 'quiz');
      data.append('issue', 'Quiz bonus: ' + b.title + ' \u2014 code ' + chosen.code + ' (valid until ' + until(chosen) + ')' + (have.length > 1 ? ' (also won: ' + have.filter(function (x) { return x.id !== chosen.id; }).map(function (x) { return bonus(x.id).title; }).join(', ') + ')' : ''));
      data.append('page', document.title + ' — ' + location.href);
      Promise.resolve({ json: function () { return Promise.resolve({ ok: true }); } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (!res || !res.ok) throw new Error('send');
          track('quiz_lead_submit', { bonus_id: chosen.id, bonuses_collected: have.length });
          try { if (window.gtag) window.gtag('event', 'form_get_quote_success', { app_name: 'AceTech', form: 'quiz' }); } catch (err) { /* ignore */ }
          store.set('claimed', '1');
          S.step = 'done';
          swap(
            '<div class="acq-medal is-ok"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.2 4.2L19 7"/></svg></div>' +
            '<h2 id="acq-title">Bonus <span class="accent">saved!</span></h2>' +
            '<p class="acq-lead">We\u2019ll call you shortly to confirm your <b>' + esc(b.title) + '</b> (code <b>' + chosen.code + '</b>). Need help right now? Call <a href="tel:+19259409905">(925) 940-9905</a>.</p>' +
            '<button type="button" class="btn btn-primary btn-lg btn-block acq-done">Back to the site</button>');
          stage.querySelector('.acq-done').addEventListener('click', function () { close('done'); });
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = 'Claim my bonus';
          var err = form.querySelector('.acq-error'); err.textContent = 'Something went wrong. Please call (925) 940-9905.'; err.hidden = false;
        });
    });
  }

  function confetti() {
    var box = el('div', 'acq-confetti');
    var colors = ['#30347D', '#4570B3', '#7FA6DE', '#1FA9E1', '#FFC94D'];
    for (var i = 0; i < 46; i++) {
      var p = el('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.35) + 's';
      p.style.setProperty('--x', (Math.random() * 160 - 80) + 'px');
      p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      box.appendChild(p);
    }
    dialog.appendChild(box);
    setTimeout(function () { box.remove(); }, 2200);
  }

  // ---------- open / close ----------
  var lastFocus = null;
  function open(trigger) {
    if (!overlay.hidden) return;
    S.trigger = trigger;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.classList.add('no-scroll');
    launcher.classList.add('is-hidden');
    track('quiz_open', { trigger: trigger });
    if (wallet().length && !store.get('claimed')) showWallet('back'); else showIntro();
    setTimeout(function () { var b = dialog.querySelector('.acq-start, .acq-claim, .acq-opt'); if (b) b.focus({ preventScroll: true }); }, 60);
  }
  function close(how) {
    if (overlay.hidden) return;
    track('quiz_close', { step: S.step, how: how || 'close', question_number: S.step === 'question' || S.step === 'answered' ? S.i + 1 : 0 });
    overlay.hidden = true;
    document.documentElement.classList.remove('no-scroll');
    launcher.classList.remove('is-hidden');
    store.set('snooze', String(Date.now()));
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  launcher.addEventListener('click', function () { open('button'); });
  overlay.querySelector('.acq-close').addEventListener('click', function () { close('x'); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close('backdrop'); });
  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close('esc');
    if (e.key === 'Tab') {  // keep focus inside the dialog
      var f = dialog.querySelectorAll('button:not([disabled]), input, select, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (S.step === 'question' && /^[1-5a-e]$/i.test(e.key)) {
      var n = /\d/.test(e.key) ? Number(e.key) - 1 : 'abcde'.indexOf(e.key.toLowerCase());
      var b = stage.querySelectorAll('.acq-opt')[n]; if (b) b.click();
    }
  });
  // any link to #quiz opens it (e.g. a banner or a button in the text)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#quiz"]');
    if (a) { e.preventDefault(); open('link'); }
  });

  function mount() {
    document.body.appendChild(launcher);
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { launcher.classList.add('is-in'); });
    if (location.hash === '#quiz') open('url');
    // auto invitation: desktop only (no intrusive pop-ups on phones), not after a claim, snoozed after a close
    var snoozed = Number(store.get('snooze') || 0) > Date.now() - CFG.snoozeDays * 864e5;
    var desktop = window.matchMedia('(min-width: 900px) and (hover: hover)').matches;
    if (desktop && !snoozed && !store.get('claimed')) {
      var fired = false;
      var auto = function (how) { if (fired) return; fired = true; clearTimeout(t); open(how); };
      var t = setTimeout(function () { auto('auto_timer'); }, CFG.autoOpenDelay);
      document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) auto('exit_intent'); });
      launcher.addEventListener('click', function () { fired = true; clearTimeout(t); });
      // never interrupt someone who is already filling in a form
      document.addEventListener('focusin', function (e) { if (e.target.closest && e.target.closest('form') && !e.target.closest('.acq-form')) { fired = true; clearTimeout(t); } });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
