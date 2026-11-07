/* 小三數學 · 學習站 — 前端引擎（無依賴） */
(function () {
  'use strict';

  var P3 = window.P3 = window.P3 || {};
  P3.books = [
    { id: 'A', name: '3上A', sub: '上學期 · 第一冊', lessons: [] },
    { id: 'B', name: '3上B', sub: '上學期 · 第二冊', lessons: [] },
    { id: 'C', name: '3下A', sub: '下學期 · 第一冊', lessons: [] }
  ];
  P3.lessons = [];
  P3.add = function (l) { P3.lessons.push(l); };

  /* ---------------- storage ---------------- */
  var KEY = 'p3math.progress.v1';
  P3.loadProgress = function () {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  };
  P3.saveResult = function (id, got, total, wrongIds) {
    var p = P3.loadProgress();
    var prev = p[id];
    if (!prev || got > prev.got) {
      p[id] = { got: got, total: total, at: Date.now(), wrong: wrongIds || [] };
    } else {
      p[id] = { got: prev.got, total: prev.total, at: prev.at, wrong: prev.wrong || [] };
    }
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
  };
  P3.clearProgress = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
  };

  /* ---------------- helpers ---------------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  P3.esc = esc;
  function qs(name) {
    var m = new RegExp('[?&]' + name + '=([^&]+)').exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
  }
  P3.qs = qs;

  // 答案正規化：全角→半角、去空白、統一負號、去逗號
  function norm(v) {
    if (v == null) return '';
    return String(v)
      .replace(/[\uFF01-\uFF5E]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/\u3000/g, '')
      .replace(/[,，\s]/g, '')
      .replace(/[−–—]/g, '-')
      .replace(/[。．.]$/g, '')
      .toLowerCase();
  }
  P3.norm = norm;

  function parseNum(v) {
    var s = norm(v).replace(/[^0-9.\-]/g, '');
    if (!s || s === '-' || s === '.') return null;
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  P3.parseNum = parseNum;

  P3.bookOf = function (id) {
    for (var i = 0; i < P3.books.length; i++) if (P3.books[i].id === id) return P3.books[i];
    return null;
  };
  P3.find = function (id) {
    for (var i = 0; i < P3.lessons.length; i++) if (P3.lessons[i].id === id) return P3.lessons[i];
    return null;
  };
  P3.index = function (id) {
    for (var i = 0; i < P3.lessons.length; i++) if (P3.lessons[i].id === id) return i;
    return -1;
  };

  /* ---------------- figure library ---------------- */
  var S = 'stroke="#5b6474" stroke-width="2" fill="none" stroke-linejoin="round"';
  var F = 'fill="#dce7ff" stroke="#5b6474" stroke-width="2" stroke-linejoin="round"';
  function svg(inner, w, h) {
    return '<svg viewBox="0 0 ' + (w || 120) + ' ' + (h || 90) + '" width="100%" preserveAspectRatio="xMidYMid meet" role="img">' + inner + '</svg>';
  }
  P3.fig = {
    tri_equi: function () { return svg('<polygon points="60,12 96,78 24,78" ' + F + '/>'); },
    tri_iso: function () { return svg('<polygon points="60,12 88,78 32,78" ' + F + '/>'); },
    tri_right: function () {
      return svg('<polygon points="30,78 30,20 96,78" ' + F + '/>' +
        '<rect x="30" y="66" width="12" height="12" fill="none" stroke="#5b6474" stroke-width="1.6"/>');
    },
    tri_rightiso: function () {
      return svg('<polygon points="30,78 30,18 96,78" ' + F + '/>' +
        '<rect x="30" y="66" width="12" height="12" fill="none" stroke="#5b6474" stroke-width="1.6"/>');
    },
    tri_scalene: function () { return svg('<polygon points="18,76 104,64 60,16" ' + F + '/>'); },
    tri_obtuse: function () { return svg('<polygon points="16,70 104,70 74,22" ' + F + '/>'); },
    tri_acute: function () { return svg('<polygon points="24,74 100,74 62,18" ' + F + '/>'); },
    para: function () { return svg('<polygon points="30,20 110,20 90,72 10,72" ' + F + '/>'); },
    rect: function () { return svg('<polygon points="18,22 104,22 104,70 18,70" ' + F + '/>'); },
    trap: function () { return svg('<polygon points="38,20 96,20 110,72 14,72" ' + F + '/>'); },
    trap_right: function () {
      return svg('<polygon points="24,20 84,20 100,72 24,72" ' + F + '/>' +
        '<rect x="24" y="60" width="12" height="12" fill="none" stroke="#5b6474" stroke-width="1.6"/>');
    },
    rhom: function () { return svg('<polygon points="62,12 108,46 62,80 16,46" ' + F + '/>'); },
    para_lines: function () {
      return svg('<line x1="14" y1="30" x2="108" y2="30" ' + S + '/><line x1="14" y1="62" x2="108" y2="62" ' + S + '/>' +
        '<line x1="40" y1="26" x2="40" y2="34" stroke="#3b6ef5" stroke-width="2"/><line x1="40" y1="58" x2="40" y2="66" stroke="#3b6ef5" stroke-width="2"/>');
    },
    cross_lines: function () {
      return svg('<line x1="14" y1="24" x2="108" y2="70" ' + S + '/><line x1="14" y1="70" x2="108" y2="24" ' + S + '/>');
    },
    quad_irregular: function () { return svg('<polygon points="20,26 92,16 104,74 34,80" ' + F + '/>'); },
    clock: function () {
      return svg('<circle cx="60" cy="45" r="34" stroke="#5b6474" stroke-width="2" fill="#fff"/>' +
        '<line x1="60" y1="45" x2="60" y2="22" stroke="#3b6ef5" stroke-width="3.4" stroke-linecap="round"/>' +
        '<line x1="60" y1="45" x2="82" y2="45" stroke="#5b6474" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="60" cy="45" r="3" fill="#5b6474"/>', 120, 90);
    },
    ruler: function () {
      var t = '<rect x="8" y="30" width="104" height="26" fill="#fff" stroke="#5b6474" stroke-width="2"/>';
      for (var i = 0; i <= 10; i++) {
        var x = 8 + i * 10.4;
        t += '<line x1="' + x + '" y1="30" x2="' + x + '" y2="' + (i % 5 === 0 ? 46 : 40) + '" stroke="#5b6474" stroke-width="1.4"/>';
      }
      return svg(t, 120, 90);
    }
  };

  /* ---------------- scoring ---------------- */
  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    var x = a.slice().sort(), y = b.slice().sort();
    for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
    return true;
  }

  var LABEL = { mc: '選擇題', multi: '多選題', pick: '圖形題', num: '計算題', fill: '填充題', tf: '判斷題', order: '排序題', match: '配對題' };
  var LETTER = 'ABCDEFGH';

  /* ---------------- hub ---------------- */
  P3.renderHub = function () {
    var host = document.getElementById('hub');
    if (!host) return;
    // group lessons by book
    P3.books.forEach(function (b) { b.lessons = []; });
    P3.lessons.forEach(function (l) { var b = P3.bookOf(l.book); if (b) b.lessons.push(l); });

    var prog = P3.loadProgress();
    var doneCount = 0, totalLessons = P3.lessons.length, gotSum = 0, allSum = 0;
    P3.lessons.forEach(function (l) {
      var p = prog[l.id];
      if (p) { doneCount++; gotSum += p.got; allSum += p.total; }
    });

    var ov = el('div', 'overall');
    ov.innerHTML =
      '<div class="row"><span class="big">' + doneCount + ' / ' + totalLessons + '</span>' +
      '<span class="sub">課已完成' + (allSum ? '　·　累計答對 ' + gotSum + ' / ' + allSum + ' 題' : '') + '</span></div>' +
      '<div class="bar"><i style="width:' + (totalLessons ? Math.round(doneCount / totalLessons * 100) : 0) + '%"></i></div>';
    host.appendChild(ov);

    P3.books.forEach(function (b) {
      var sec = el('div', 'book');
      var done = b.lessons.filter(function (l) { return prog[l.id]; }).length;
      sec.appendChild(el('div', 'bookhead',
        '<span class="booktag ' + b.id.toLowerCase() + '">' + b.name + '</span>' +
        '<h2>' + esc(b.sub) + '</h2>' +
        '<span class="meta">' + done + '/' + b.lessons.length + ' 課</span>'));
      var grid = el('div', 'lessons');
      b.lessons.forEach(function (l) {
        var p = prog[l.id];
        var a = el('a', 'lesson');
        a.href = 'lesson.html?id=' + encodeURIComponent(l.id);
        a.innerHTML =
          '<span class="num">' + l.no + '</span>' +
          '<span class="txt"><span class="t">' + esc(l.title) + '</span>' +
          '<span class="u">' + esc(l.unit) + '　·　' + l.quiz.length + ' 題</span></span>' +
          (p ? '<span class="score done">' + p.got + '/' + p.total + '</span>' : '<span class="dot"></span>');
        grid.appendChild(a);
      });
      sec.appendChild(grid);
      host.appendChild(sec);
    });

    var reset = document.getElementById('reset');
    if (reset) reset.onclick = function () {
      if (confirm('確定清除所有學習紀錄？')) { P3.clearProgress(); location.reload(); }
    };
  };

  /* ---------------- lesson page ---------------- */
  P3.renderLesson = function (id) {
    var l = P3.find(id);
    var host = document.getElementById('lesson');
    if (!host) return;
    if (!l) { host.innerHTML = '<div class="card"><p>找不到這一課。</p><p><a href="index.html">返回目錄</a></p></div>'; return; }
    document.title = l.title + '｜小三數學學習站';

    var b = P3.bookOf(l.book);
    var idx = P3.index(l.id);
    var next = P3.lessons[idx + 1], prev = P3.lessons[idx - 1];

    var head = el('div', 'lessonhead');
    head.innerHTML =
      '<div class="unit">' + esc(b.name + '　' + l.unit) + '</div>' +
      '<h1>' + l.no + '. ' + esc(l.title) + '</h1>' +
      '<ul class="goals">' + l.goals.map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ul>';
    host.appendChild(head);

    (l.teach || []).forEach(function (t, i) {
      var c = el('div', 'card');
      c.innerHTML = '<h3><span class="k">' + (i + 1) + '</span>' + t.h + '</h3>' +
        (t.p ? '<p>' + t.p + '</p>' : '') +
        (t.eg ? '<div class="eg">' + t.eg + '</div>' : '');
      host.appendChild(c);
    });

    if (l.tip) {
      var tb = el('div', 'tipbox');
      tb.innerHTML = '<b>小心！</b> ' + l.tip;
      host.appendChild(tb);
    }

    var qh = el('div', 'quizhead');
    qh.innerHTML = '<h2>測驗</h2><span class="cnt">共 ' + l.quiz.length + ' 題　·　可逐題檢查</span>';
    host.appendChild(qh);

    var quizHost = el('div');
    quizHost.id = 'quiz';
    host.appendChild(quizHost);

    var resultHost = el('div');
    resultHost.id = 'result';
    host.appendChild(resultHost);

    var wrongOnly = false;
    var wrongIds = [];

    function build(list, ids) {
      quizHost.innerHTML = '';
      resultHost.innerHTML = '';
      var graders = [];
      list.forEach(function (q, i) {
        var node = buildQuestion(q, i, l.quiz.indexOf(q));
        quizHost.appendChild(node.el);
        graders.push(node);
      });
      bar.update();

      var fb = el('div', 'floatbar');
      fb.innerHTML = '<span class="stat" id="fb-stat">未開始</span><span class="spacer"></span>' +
        '<button class="btn primary" id="submit">提交測驗</button>';
      host.appendChild(fb);
      fb.querySelector('#submit').onclick = function () {
        var got = 0, wrong = [];
        graders.forEach(function (g, i) {
          var r = g.check(true);
          if (r) got++; else wrong.push(l.quiz.indexOf(list[i]));
        });
        var total = list.length;
        P3.saveResult(l.id, got, l.quiz.length, wrong);
        wrongIds = wrong;
        showResult(got, total, wrong);
        fb.querySelector('#submit').disabled = true;
        document.getElementById('fb-stat').textContent = '已提交：' + got + ' / ' + total;
      };

      return function () { return graders; };
    }

    var bar = {
      update: function () {
        var stat = document.getElementById('fb-stat');
        if (!stat) return;
        var total = quizHost.querySelectorAll('.q').length;
        var done = quizHost.querySelectorAll('.q[data-checked="1"]').length;
        stat.textContent = done === 0 ? '共 ' + total + ' 題' : '已檢查 ' + done + ' / ' + total;
      }
    };

    P3._bar = bar;

    function showResult(got, total, wrong) {
      var pct = Math.round(got / total * 100);
      var msg, emoji;
      if (pct === 100) { msg = '全對！好犀利！你可以做下一課喇。'; emoji = '🏆'; }
      else if (pct >= 80) { msg = '表現好好！再睇一次錯題就完美。'; emoji = '🎉'; }
      else if (pct >= 60) { msg = '不錯，仲有幾題要小心。試下重做錯題。'; emoji = '💪'; }
      else { msg = '唔緊要，先返上去睇多次教學示例，再做一次。'; emoji = '📘'; }
      resultHost.innerHTML = '';
      var r = el('div', 'result');
      r.innerHTML = '<div class="big">' + got + ' / ' + total + '　<span style="font-size:16px;color:#5b6474">' + pct + '%</span></div>' +
        '<div class="msg">' + emoji + ' ' + msg + '</div>' +
        '<div class="acts">' +
        (wrong.length ? '<button class="btn primary" id="redo">重做錯題（' + wrong.length + '）</button>' : '') +
        '<button class="btn ghost" id="again">重新做全份</button>' +
        (next ? '<a class="btn ghost" href="lesson.html?id=' + encodeURIComponent(next.id) + '">下一課 →</a>' : '') +
        '</div>';
      resultHost.appendChild(r);
      r.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var redo = r.querySelector('#redo');
      if (redo) redo.onclick = function () {
        var list = wrong.map(function (i) { return l.quiz[i]; });
        // remove floatbar before rebuilding
        var old = host.querySelector('.floatbar'); if (old) old.remove();
        build(list);
        quizHost.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      r.querySelector('#again').onclick = function () {
        location.reload();
      };
    }

    var getGraders = build(l.quiz);

    var nav = el('div', 'navlesson');
    nav.innerHTML = (prev ? '<a href="lesson.html?id=' + encodeURIComponent(prev.id) + '">← ' + prev.no + '. ' + esc(prev.title) + '</a>' : '<span>這是第一課</span>') +
      (next ? '<a href="lesson.html?id=' + encodeURIComponent(next.id) + '">' + next.no + '. ' + esc(next.title) + ' →</a>' : '<span>已完成</span>');
    host.appendChild(nav);
  };

  /* ---------------- question builder ---------------- */
  function buildQuestion(q, i, qIndex) {
    var wrap = el('div', 'q');
    wrap.dataset.checked = '0';
    wrap.id = 'q' + qIndex;

    var top = el('div', 'qtop');
    top.innerHTML = '<span class="qno">第 ' + (i + 1) + ' 題</span><span class="qtype">' + (LABEL[q.t] || '題目') + '</span>';
    wrap.appendChild(top);

    var text = el('div', 'qtext', q.q);
    wrap.appendChild(text);

    var body = el('div', 'qbody');
    wrap.appendChild(body);

    var foot = el('div', 'qfoot');
    var btn = el('button', 'btn ghost sm', '檢查答案');
    var verdict = el('span', 'verdict');
    foot.appendChild(btn);
    foot.appendChild(verdict);
    wrap.appendChild(foot);

    var why = el('div', 'why hide', '<b>解說：</b> ' + (q.why || ''));
    wrap.appendChild(why);

    var grade = null; // returns true/false
    var lock = false;

    function finish(ok) {
      lock = true;
      wrap.dataset.checked = '1';
      verdict.className = 'verdict ' + (ok ? 'ok' : 'bad');
      verdict.textContent = ok ? '✓ 正確' : '✗ 再想想';
      why.classList.remove('hide');
      btn.textContent = '已檢查';
      btn.disabled = true;
      if (P3._bar) P3._bar.update();
      return ok;
    }

    /* ---- mc / pick ---- */
    if (q.t === 'mc' || q.t === 'multi' || q.t === 'pick') {
      var multi = q.t === 'multi' || q.multi === true;
      var isFig = q.t === 'pick' || q.o.some(function (o) { return o && o.fig; });
      var chosen = [];
      var box = el('div', isFig ? 'figrid' : 'opts');
      var nodes = [];
      q.o.forEach(function (o, oi) {
        var label = isFig ? '' : LETTER[oi];
        var b;
        if (isFig) {
          b = el('button', 'figopt');
          b.innerHTML = (o.fig && P3.fig[o.fig] ? P3.fig[o.fig]() : '') +
            '<div class="lab">' + (o.label || LETTER[oi]) + '</div>';
        } else {
          b = el('button', 'opt');
          b.innerHTML = '<span class="k">' + label + '</span><span>' + (o.fig && P3.fig[o.fig] ? P3.fig[o.fig]() : o) + '</span>';
        }
        b.onclick = function () {
          if (lock) return;
          var k = chosen.indexOf(oi);
          if (multi) {
            if (k >= 0) { chosen.splice(k, 1); b.classList.remove('sel'); }
            else { chosen.push(oi); b.classList.add('sel'); }
          } else {
            chosen = [oi];
            nodes.forEach(function (n) { n.classList.remove('sel'); });
            b.classList.add('sel');
          }
        };
        nodes.push(b);
        box.appendChild(b);
      });
      body.appendChild(box);

      var correct = Array.isArray(q.a) ? q.a.slice() : [q.a];
      grade = function (silent) {
        if (!chosen.length) return silent ? false : null;
        var ok = sameSet(chosen, correct);
        nodes.forEach(function (n, ni) {
          n.classList.remove('sel');
          if (correct.indexOf(ni) >= 0) n.classList.add(ok ? 'ok' : 'ok');
          else if (chosen.indexOf(ni) >= 0) n.classList.add('bad');
        });
        if (!silent) finish(ok);
        return ok;
      };
      if (!multi) {
        // 單選即時判斷（更適合小朋友）
        nodes.forEach(function (n, ni) {
          n.addEventListener('click', function () {
            if (lock) return;
            setTimeout(function () { if (!lock) btn.click(); }, 160);
          });
        });
      }
    }

    /* ---- tf ---- */
    if (q.t === 'tf') {
      var pick = null;
      var tbox = el('div', 'opts two');
      [{ v: true, t: '✓ 對' }, { v: false, t: '✗ 錯' }].forEach(function (o) {
        var b = el('button', 'opt', '<span class="k">' + (o.v ? '✓' : '✗') + '</span><span>' + o.t + '</span>');
        b.onclick = function () {
          if (lock) return;
          pick = o.v;
          Array.prototype.forEach.call(tbox.children, function (c) { c.classList.remove('sel'); });
          b.classList.add('sel');
          setTimeout(function () { if (!lock) btn.click(); }, 160);
        };
        tbox.appendChild(b);
      });
      body.appendChild(tbox);
      grade = function (silent) {
        if (pick === null) return silent ? false : null;
        var ok = pick === q.a;
        Array.prototype.forEach.call(tbox.children, function (c, ci) {
          c.classList.remove('sel');
          var val = ci === 0;
          if (val === q.a) c.classList.add('ok');
          else if (val === pick) c.classList.add('bad');
        });
        if (!silent) finish(ok);
        return ok;
      };
    }

    /* ---- num / fill ---- */
    if (q.t === 'num' || q.t === 'fill') {
      var row = el('div', 'inputrow');
      var input = document.createElement('input');
      input.className = 'ans';
      input.type = 'text';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('inputmode', q.t === 'num' ? 'decimal' : 'text');
      input.placeholder = q.ph || (q.t === 'num' ? '輸入答案' : '填寫答案');
      if (q.unit) input.style.width = '120px';
      row.appendChild(input);
      if (q.unit) row.appendChild(el('span', 'unit', q.unit));
      body.appendChild(row);

      var accept = q.a;
      grade = function (silent) {
        var v = input.value;
        if (!norm(v)) return silent ? false : null;
        var ok = false;
        if (q.t === 'num') {
          var n = parseNum(v);
          if (n !== null) {
            var list = Array.isArray(accept) ? accept : [accept];
            var tol = typeof q.tol === 'number' ? q.tol : 0;
            ok = list.some(function (t) { var tv = parseFloat(String(t).replace(/[^0-9.\-]/g, '')); return (n - tv) <= tol && (tv - n) <= tol; });
          }
        } else {
          var arr = Array.isArray(accept) ? accept : [accept];
          var nv = norm(v).replace(/[\s,，]/g, '');
          ok = arr.some(function (t) { return norm(t).replace(/[\s,，]/g, '') === nv; });
        }
        input.classList.remove('ok', 'bad');
        input.classList.add(ok ? 'ok' : 'bad');
        input.disabled = true;
        if (!silent) finish(ok);
        return ok;
      };
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !lock) btn.click(); });
    }

    /* ---- order ---- */
    if (q.t === 'order') {
      var seq = [];
      var tray = el('div', 'ordertray', '<span class="slot">按次序點下面的卡…</span>');
      var pool = el('div', 'opts');
      var poolWrap = el('div');
      poolWrap.style.display = 'flex';
      poolWrap.style.flexWrap = 'wrap';
      poolWrap.style.gap = '8px';
      poolWrap.style.marginTop = '8px';
      var chips = [];
      q.o.forEach(function (txt, oi) {
        var c = el('button', 'ochip', txt);
        c.onclick = function () {
          if (lock) return;
          var k = seq.indexOf(oi);
          if (k >= 0) { seq.splice(k, 1); }
          else { seq.push(oi); }
          render();
        };
        chips.push(c);
        poolWrap.appendChild(c);
      });
      body.appendChild(tray);
      body.appendChild(el('div', '', '<div style="font-size:12.5px;color:#5b6474;margin-top:10px">點選加入／再點移除：</div>'));
      body.appendChild(poolWrap);

      function render() {
        tray.innerHTML = '';
        tray.className = 'ordertray' + (seq.length ? ' filled' : '');
        if (!seq.length) tray.innerHTML = '<span class="slot">按次序點下面的卡…</span>';
        seq.forEach(function (oi) {
          var c = el('span', 'ochip sel', '<span class="pos">' + (seq.indexOf(oi) + 1) + '</span>' + q.o[oi]);
          tray.appendChild(c);
        });
        chips.forEach(function (c, ci) {
          c.style.display = seq.indexOf(ci) >= 0 ? 'none' : '';
        });
      }

      grade = function (silent) {
        if (seq.length !== q.o.length) return silent ? false : null;
        var ok = seq.join(',') === q.a.join(',');
        chips.forEach(function (c, ci) { c.style.display = ''; c.classList.remove('sel'); });
        tray.innerHTML = '';
        (q.a || []).forEach(function (oi, k) {
          var right = seq[k] === oi;
          tray.appendChild(el('span', 'ochip ' + (right ? 'ok' : 'bad'), '<span class="pos">' + (k + 1) + '</span>' + q.o[oi] +
            (right ? '' : ' <span style="font-size:11px;opacity:.7">（你排：' + q.o[seq[k]] + '）</span>')));
        });
        if (!silent) finish(ok);
        return ok;
      };
    }

    /* ---- match ---- */
    if (q.t === 'match') {
      var picks = q.l.map(function () { return -1; });
      var rows = [];
      q.l.forEach(function (txt, li) {
        var r = el('div', 'matchrow');
        r.appendChild(el('div', 'left', txt));
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">請選擇…</option>' + q.r.map(function (rt, ri) {
          return '<option value="' + ri + '">' + rt + '</option>';
        }).join('');
        sel.onchange = function () { if (!lock) picks[li] = parseInt(sel.value, 10); };
        r.appendChild(sel);
        rows.push(r);
        body.appendChild(r);
      });
      grade = function (silent) {
        if (picks.indexOf(-1) >= 0) return silent ? false : null;
        var ok = picks.join(',') === q.a.join(',');
        rows.forEach(function (r, ri) {
          r.classList.remove('ok', 'bad');
          r.classList.add(picks[ri] === q.a[ri] ? 'ok' : 'bad');
        });
        if (!silent) finish(ok);
        return ok;
      };
    }

    btn.onclick = function () {
      if (lock) return;
      var r = grade(false);
      if (r === null) {
        verdict.className = 'verdict bad';
        verdict.textContent = '請先作答';
        setTimeout(function () { if (!lock) { verdict.textContent = ''; } }, 1400);
      }
    };

    // click on answer area checks when 已選 mc 單選 handled above

    return {
      el: wrap,
      check: function (silent) { return grade ? grade(silent) : null; },
      isLocked: function () { return lock; }
    };
  }

  P3.buildQuestion = buildQuestion;

  /* ---------------- boot ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.page === 'hub') P3.renderHub();
    if (document.body.dataset.page === 'lesson') {
      var id = P3.qs('id') || (P3.lessons[0] && P3.lessons[0].id);
      P3.renderLesson(id);
    }
  });
})();
