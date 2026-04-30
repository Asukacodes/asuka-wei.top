/* ==============================================
   ASCII MATRIX — Perlin Noise, Both Sides
   Per-section themes + smooth transitions
   ============================================== */
(function initMatrix() {
  var leftEl = document.getElementById("matrix-left");
  var rightEl = document.getElementById("matrix-right");
  if (!leftEl || !rightEl) return;

  var animTimer = 0;
  var currentTheme = 0;
  var hardwareThreads = navigator.hardwareConcurrency || 4;
  var deviceMemory = navigator.deviceMemory || 4;
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lowPowerMode = prefersReducedMotion || hardwareThreads <= 4 || deviceMemory <= 4;
  var noiseOctaves = lowPowerMode ? 2 : 3;
  var opacityOctaves = lowPowerMode ? 2 : 3;
  var matrixDensity = lowPowerMode ? 1.14 : 1.0;
  var minFrameInterval = lowPowerMode ? 3 : 2;
  var matrixFrameInterval = minFrameInterval;

  // ---- Per-section themes ----
  // 0=HERO(machine/hex), 1=ABOUT(binary), 2=PROJECTS(symbols), 3=NOTES(data), 4=CONTACT(code)
  var themes = [
    {
      palette: [
        { r: 245/255, g: 230/255, b: 66/255 },   // yellow
        { r: 255/255, g: 255/255, b: 200/255 },  // cream
        { r: 255/255, g: 43/255, b: 94/255 },    // red
        { r: 0/255, g: 212/255, b: 255/255 },    // cyan
        { r: 80/255, g: 70/255, b: 5/255 },     // dark amber
        { r: 255/255, g: 160/255, b: 50/255 },  // orange
        { r: 180/255, g: 160/255, b: 10/255 },   // gold
        { r: 10/255, g: 8/255, b: 0/255 },     // near black
        { r: 0/255, g: 100/255, b: 140/255 },    // dark cyan
        { r: 150/255, g: 130/255, b: 20/255 },   // amber
      ],
      ascii: [
        "01", "0101010", "01 01", "0x0x0x", "oxOX",
        "0123456789abcdef", "x+y=z", "!@#$%^&*",
        "><", "<>", "|/-", "||", "[]{}()",
        " .:+*#%@", ".:-=+*#%@", "====", "----",
        " .. ", "(( ))", "[ ]", "< >",
        "000 111 000", "000111000", "0 1 0 1 0",
        "XxXxXxXx", "xXxXxX", "x X x X",
      ],
      dark: { r: 40, g: 35, b: 5 },
    },
    {
      palette: [
        { r: 0/255, g: 212/255, b: 255/255 },    // cyan
        { r: 0/255, g: 160/255, b: 200/255 },   // dark cyan
        { r: 100/255, g: 200/255, b: 255/255 }, // light cyan
        { r: 0/255, g: 100/255, b: 180/255 },   // deep cyan
        { r: 245/255, g: 230/255, b: 66/255 },  // yellow
        { r: 255/255, g: 43/255, b: 94/255 },   // red
        { r: 180/255, g: 220/255, b: 255/255 }, // pale blue
        { r: 0/255, g: 60/255, b: 100/255 },    // very dark cyan
        { r: 0/255, g: 140/255, b: 180/255 },   // mid cyan
        { r: 50/255, g: 100/255, b: 140/255 },  // dim blue
      ],
      ascii: [
        "0", "1", "01", "010", "0101",
        "0 1 0 1", "1 0 1 0", "010101",
        "0  0  0", "1  1  1",
        "000", "111", "000111000",
        "00000000", "11111111", "00001111",
        "10101010", "01010101", "1 0 1 0 1",
      ],
      dark: { r: 5, g: 25, b: 40 },
    },
    {
      palette: [
        { r: 255/255, g: 43/255, b: 94/255 },    // red/pink
        { r: 255/255, g: 20/255, b: 60/255 },    // deep red
        { r: 255/255, g: 100/255, b: 150/255 },  // pink
        { r: 245/255, g: 230/255, b: 66/255 },   // yellow
        { r: 255/255, g: 140/255, b: 50/255 },   // orange
        { r: 0/255, g: 212/255, b: 255/255 },     // cyan
        { r: 200/255, g: 40/255, b: 80/255 },    // crimson
        { r: 80/255, g: 10/255, b: 30/255 },    // very dark red
        { r: 150/255, g: 80/255, b: 100/255 },   // dim red
        { r: 255/255, g: 200/255, b: 220/255 },  // pale pink
      ],
      ascii: [
        "#", "##", "###", "####",
        "@", "@@", "@@@",
        "$", "$$", "$$$",
        "%", "%%", "%%%",
        "&", "&&", "&&&",
        "*", "**", "***",
        "#@#$", "@#$%", "#%$&",
        "!@#$", "%^&*", "(){}",
        "# # #", "@ @ @", "$ $ $",
        "#*@$#*@$", "@$%&@$%&",
      ],
      dark: { r: 40, g: 5, b: 15 },
    },
    {
      palette: [
        { r: 245/255, g: 230/255, b: 66/255 },   // yellow
        { r: 255/255, g: 200/255, b: 60/255 },   // amber
        { r: 255/255, g: 43/255, b: 94/255 },    // red
        { r: 0/255, g: 212/255, b: 255/255 },    // cyan
        { r: 140/255, g: 120/255, b: 15/255 },   // muted gold
        { r: 40/255, g: 35/255, b: 5/255 },      // dark amber
      ],
      ascii: [
        "log", "note", "memo", "ref", "data",
        "////", "::::", "====", "----",
        "id", "idx", "src", "tag",
        "note.log", "cache", "memo://",
      ],
      dark: { r: 40, g: 35, b: 5 },
    },
    {
      palette: [
        { r: 0/255, g: 255/255, b: 140/255 },    // neon green
        { r: 0/255, g: 200/255, b: 100/255 },   // green
        { r: 0/255, g: 160/255, b: 80/255 },    // dark green
        { r: 0/255, g: 212/255, b: 255/255 },   // cyan
        { r: 0/255, g: 100/255, b: 160/255 },   // teal
        { r: 255/255, g: 43/255, b: 94/255 },   // red
        { r: 100/255, g: 255/255, b: 180/255 },  // light green
        { r: 0/255, g: 60/255, b: 40/255 },    // very dark green
        { r: 0/255, g: 120/255, b: 80/255 },    // dim green
        { r: 200/255, g: 255/255, b: 220/255 }, // pale green
      ],
      ascii: [
        "->", "-->", "-->>", ">>>",
        "=>", "==>", "=>>",
        "&&", "||", "++", "--",
        "()", "[]", "{}", "<>",
        "( )", "[ ]", "{ }", "< >",
        "fn", "fn()", "Fn()",
        "++--", "&&||", "==!=",
        "-> ->", "=> =>", ">> >>",
        "func", "call", "null",
        "<>", "<->", "<-->",
      ],
      dark: { r: 5, g: 30, b: 15 },
    },
  ];

  var seedDataTarg = {};
  var seedDataCurr = {};
  var leftColors = [], leftChars = [];
  var rightColors = [], rightChars = [];

  function hashSeed(x) {
    var s1 = 1, s2 = 0;
    for (var n = 0; n < x.length; n++) {
      s1 = (s1 + x.charCodeAt(n)) % 65521;
      s2 = (s2 + s1) % 65521;
    }
    return (s2 << 16) | s1;
  }

  function hash(x) {
    return (((Math.sin(x * 91.3458) * 47453.5453) % 1.0) + 1.0) / 2.0;
  }

  function hashToRange(x, min, max) {
    return hash(x) * (max - min) + min;
  }

  function hashToChoice(x, arr) {
    var idx = Math.min(Math.floor(hashToRange(x, 0, arr.length)), arr.length - 1);
    return arr[idx];
  }

  function hash2D(x, y) {
    return (((Math.sin((x * 12.9898) + (y * 78.233)) * 43758.5453) % 1.0) + 1.0) / 2.0;
  }

  function lerp(x, y, a) { return (1 - a) * x + a * y; }

  function lerpColor(x, y, a) {
    return { r: lerp(x.r, y.r, a), g: lerp(x.g, y.g, a), b: lerp(x.b, y.b, a) };
  }

  function perlin(x, y, octaves) {
    var out = 0;
    for (var i = 0; i < octaves; i++) {
      var freq = Math.pow(2, i);
      var amp = Math.pow(0.5, octaves - i);
      var px = x * freq;
      var py = y * freq;
      var ox = Math.floor(px);
      var oy = Math.floor(py);
      var ax = px % 1.0;
      var ay = py % 1.0;
      var octx0 = (1 - ax) * hash2D(ox + 0, oy + 0) + ax * hash2D(ox + 1, oy + 0);
      var octx1 = (1 - ax) * hash2D(ox + 0, oy + 1) + ax * hash2D(ox + 1, oy + 1);
      out += amp * ((1 - ay) * octx0 + ay * octx1);
    }
    return Math.max(Math.min(out, 1), 0);
  }

  function updateSeedDataTarget(seed, themeIdx) {
    var t = themes[themeIdx];
    var seedHash = 0xd9861ecf ^ hashSeed(seed);
    seedDataTarg.scaleX = hashToRange(seedHash ^ 0x9d0489ea, 8, 150);
    seedDataTarg.scaleY = hashToRange(seedHash ^ 0x3ad66f4d, 8, 150);
    seedDataTarg.offsetX = hashToRange(seedHash ^ 0x9880bde6, -80, +80);
    seedDataTarg.offsetY = hashToRange(seedHash ^ 0x0fd07e82, -80, +80);
    seedDataTarg.firstSpeedX = hashToRange(seedHash ^ 0x3c1325de, -0.002, 0.002);
    seedDataTarg.firstSpeedY = hashToRange(seedHash ^ 0x8762159a, -0.002, 0.002);
    seedDataTarg.secondSpeedX = hashToRange(seedHash ^ 0xc8630314, -0.006, 0.006);
    seedDataTarg.secondSpeedY = hashToRange(seedHash ^ 0x46dfb0f6, -0.006, 0.006);
    seedDataTarg.secondFreqX = hashToRange(seedHash ^ 0x53266ad7, 1.75, 2.25);
    seedDataTarg.secondFreqY = hashToRange(seedHash ^ 0xfbd2cf22, 1.75, 2.25);
    seedDataTarg.firstMixX = hashToRange(seedHash ^ 0xbb2843fd, 2.5, 3.5);
    seedDataTarg.firstMixY = hashToRange(seedHash ^ 0xb382e56b, 2.5, 3.5);
    seedDataTarg.secondMixX = hashToRange(seedHash ^ 0xc74acae2, 2.5, 3.5);
    seedDataTarg.secondMixY = hashToRange(seedHash ^ 0x79498ba7, 2.5, 3.5);
    seedDataTarg.opacityMix0 = hashToRange(seedHash ^ 0xbbdd53b7, 0.75, 1.25);
    seedDataTarg.opacityMix1 = hashToRange(seedHash ^ 0x2ae7f245, 0.75, 1.25);
    seedDataTarg.opacityMix2 = hashToRange(seedHash ^ 0x8d5289ce, 0.75, 1.25);
    seedDataTarg.opacityMix3 = hashToRange(seedHash ^ 0x36eb3d00, 0.75, 1.25);
    seedDataTarg.color0 = hashToChoice(seedHash ^ 0x5e8a2d3a, t.palette);
    seedDataTarg.color1 = hashToChoice(seedHash ^ 0xd6e13f6d, t.palette);
    seedDataTarg.color2 = hashToChoice(seedHash ^ 0x851dd9e4, t.palette);
    seedDataTarg.color3 = hashToChoice(seedHash ^ 0xbc8c18fe, t.palette);
    seedDataTarg.color4 = hashToChoice(seedHash ^ 0x8f2bbe6e, t.palette);
    seedDataTarg.color5 = hashToChoice(seedHash ^ 0x50613aaa, t.palette);
    seedDataTarg.asciiRange = hashToChoice(seedHash ^ 0x0d741ccb, t.ascii);
    seedDataTarg.dark = t.dark;
  }

  function updateSeedDataCurrent() {
    var rate = 0.88;
    var s = seedDataCurr, t = seedDataTarg;
    s.scaleX = lerp(s.scaleX, t.scaleX, rate);
    s.scaleY = lerp(s.scaleY, t.scaleY, rate);
    s.offsetX = lerp(s.offsetX, t.offsetX, rate);
    s.offsetY = lerp(s.offsetY, t.offsetY, rate);
    s.firstSpeedX = lerp(s.firstSpeedX, t.firstSpeedX, rate);
    s.firstSpeedY = lerp(s.firstSpeedY, t.firstSpeedY, rate);
    s.secondSpeedX = lerp(s.secondSpeedX, t.secondSpeedX, rate);
    s.secondSpeedY = lerp(s.secondSpeedY, t.secondSpeedY, rate);
    s.secondFreqX = lerp(s.secondFreqX, t.secondFreqX, rate);
    s.secondFreqY = lerp(s.secondFreqY, t.secondFreqY, rate);
    s.firstMixX = lerp(s.firstMixX, t.firstMixX, rate);
    s.firstMixY = lerp(s.firstMixY, t.firstMixY, rate);
    s.secondMixX = lerp(s.secondMixX, t.secondMixX, rate);
    s.secondMixY = lerp(s.secondMixY, t.secondMixY, rate);
    s.opacityMix0 = lerp(s.opacityMix0, t.opacityMix0, rate);
    s.opacityMix1 = lerp(s.opacityMix1, t.opacityMix1, rate);
    s.opacityMix2 = lerp(s.opacityMix2, t.opacityMix2, rate);
    s.opacityMix3 = lerp(s.opacityMix3, t.opacityMix3, rate);
    s.color0 = lerpColor(s.color0, t.color0, rate);
    s.color1 = lerpColor(s.color1, t.color1, rate);
    s.color2 = lerpColor(s.color2, t.color2, rate);
    s.color3 = lerpColor(s.color3, t.color3, rate);
    s.color4 = lerpColor(s.color4, t.color4, rate);
    s.color5 = lerpColor(s.color5, t.color5, rate);
    s.dark = t.dark;
    s.asciiRange = t.asciiRange;
  }

  function animFunction(x, y) {
    var seed = seedDataCurr;
    var offsetX = seed.offsetX + (x / seed.scaleX);
    var offsetY = seed.offsetY + (y / seed.scaleY);

    var firstX = perlin(offsetX, offsetY, noiseOctaves);
    var firstY = perlin(offsetX + animTimer * seed.firstSpeedY, offsetY + animTimer * seed.firstSpeedY, noiseOctaves);

    var secondX = perlin(
      offsetX + seed.secondFreqX * firstX + animTimer * seed.secondSpeedX,
      offsetY + seed.secondFreqX * firstY + animTimer * seed.secondSpeedX, noiseOctaves);

    var secondY = perlin(
      offsetX + seed.secondFreqY * firstX + animTimer * seed.secondSpeedY,
      offsetY + seed.secondFreqY * firstY + animTimer * seed.secondSpeedY, noiseOctaves);

    var finalX = offsetX + firstX * seed.firstMixX + secondX * seed.secondMixX;
    var finalY = offsetY + firstY * seed.firstMixY + secondY * seed.secondMixY;

    var color = lerpColor(seed.color0, seed.color1, firstX);
    color = lerpColor(color, lerpColor(seed.color2, seed.color3, firstX * 0.5), secondY * 2.0);
    color = lerpColor(color, lerpColor(seed.color4, seed.color5, firstY), secondX * secondY);

    var character = perlin(finalX, firstX, 2) * 1.25;
    var cr = Math.min(Math.floor(color.r * 256), 255);
    var cg = Math.min(Math.floor(color.g * 256), 255);
    var cb = Math.min(Math.floor(color.b * 256), 255);

    var opacity = perlin(
      seed.opacityMix0 * finalX + seed.opacityMix1 * firstX,
      seed.opacityMix2 * finalY + seed.opacityMix3 * secondY, opacityOctaves);

    var dark = seed.dark || { r: 50, g: 45, b: 10 };
    cr = lerp(dark.r / 255, cr, opacity * 0.7);
    cg = lerp(dark.g / 255, cg, opacity * 0.7);
    cb = lerp(dark.b / 255, cb, opacity * 0.7);

    var charStr = seed.asciiRange[Math.min(Math.floor(character * seed.asciiRange.length), seed.asciiRange.length - 1)];

    return { color: { r: cr, g: cg, b: cb }, character: charStr };
  }

  function rgbToHex(rgb) {
    return "#" + (1 << 24 | rgb.r << 16 | rgb.g << 8 | rgb.b).toString(16).slice(1);
  }

  function buildBoard(el, charArray, colorArray, cols, rows) {
    var prefix = (el === leftEl ? 'L' : 'R');
    var content = "";
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        content += '<span id="m_' + prefix + '_' + y + '_' + x + '" style="color:#3a3205"> </span>';
      }
      content += "\n";
    }
    el.innerHTML = content;
    charArray.length = 0;
    colorArray.length = 0;
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var elem = document.getElementById('m_' + prefix + '_' + y + '_' + x);
        colorArray.push(elem.style);
        charArray.push(elem.firstChild);
      }
    }
  }

  function updateBoard(charArray, colorArray, cols, rows) {
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var i = y * cols + x;
        var f = animFunction(x, y);
        colorArray[i].color = rgbToHex(f.color);
        charArray[i].data = f.character;
      }
    }
  }

  function getCols(el) {
    return Math.floor(el.clientWidth / ((parseFloat(getComputedStyle(el).fontSize) * 0.65) * matrixDensity));
  }

  function getRows(el) {
    return Math.floor(el.clientHeight / ((parseFloat(getComputedStyle(el).fontSize) * 1.15) * matrixDensity));
  }

  var leftCols, leftRows, rightCols, rightRows;

  function init() {
    updateSeedDataTarget("asukawei-left", currentTheme);
    seedDataCurr = JSON.parse(JSON.stringify(seedDataTarg));
    leftCols = getCols(leftEl);
    leftRows = getRows(leftEl);
    buildBoard(leftEl, leftChars, leftColors, leftCols, leftRows);

    updateSeedDataTarget("asukawei-right", currentTheme);
    seedDataCurr = JSON.parse(JSON.stringify(seedDataTarg));
    rightCols = getCols(rightEl);
    rightRows = getRows(rightEl);
    buildBoard(rightEl, rightChars, rightColors, rightCols, rightRows);
  }

  init();

  var lastTime = 0;
  var frameCount = 0;
  function loop(ts) {
    // Pause animation when tab is hidden
    if (document.hidden) {
      lastTime = 0;
      requestAnimationFrame(loop);
      return;
    }
    var delta = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    animTimer += delta;

    // Adaptive update interval: automatically degrade on slow devices.
    if (++frameCount % matrixFrameInterval === 0) {
      var renderStart = performance.now();
      updateSeedDataTarget("asukawei-left", currentTheme);
      updateSeedDataCurrent();
      updateBoard(leftChars, leftColors, leftCols, leftRows);

      updateSeedDataTarget("asukawei-right", currentTheme);
      updateSeedDataCurrent();
      updateBoard(rightChars, rightColors, rightCols, rightRows);

      var renderCost = performance.now() - renderStart;
      if (renderCost > 15 && matrixFrameInterval < 4) {
        matrixFrameInterval += 1;
      } else if (renderCost < 9 && matrixFrameInterval > minFrameInterval) {
        matrixFrameInterval -= 1;
      }
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Expose theme setter
  window._setMatrixTheme = function(idx) {
    if (idx === currentTheme) return;
    currentTheme = Math.max(0, Math.min(idx, themes.length - 1));
    var t = themes[currentTheme];
    seedDataTarg.dark = t.dark;
    seedDataTarg.color0 = t.palette[0];
    seedDataTarg.color1 = t.palette[1];
    seedDataTarg.color2 = t.palette[2];
    seedDataTarg.color3 = t.palette[3];
    seedDataTarg.color4 = t.palette[4];
    seedDataTarg.color5 = t.palette[5];
    seedDataTarg.asciiRange = t.ascii[Math.floor(Math.random() * t.ascii.length)];
  };

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });
})();


/* ==============================================
  STABLE WHEEL SCROLL — Section Transitions
  ============================================== */
(function initWheelScroll() {
  var sections = Array.from(document.querySelectorAll(".scroll-section"));
  var dots = Array.from(document.querySelectorAll(".dot"));
  if (!sections.length) return;

  var currentSection = 0;
  var isAnimating = false;
  var wheelAccum = 0;
  var WHEEL_THRESHOLD = 70;

  function applyTheme(idx) {
    var root = document.documentElement;
    var stableIdx = Math.max(0, Math.min(idx, sections.length - 1));
    var sectionThemes = [
      { primary: "var(--primary)", accent: "var(--accent)" },
      { primary: "var(--primary)", accent: "var(--accent)" },
      { primary: "var(--primary)", accent: "var(--accent)" },
      { primary: "var(--primary)", accent: "var(--accent)" },
      { primary: "var(--primary)", accent: "var(--accent)" },
    ];
    var t = sectionThemes[stableIdx] || sectionThemes[0];
    root.style.setProperty("--section-primary", t.primary);
    root.style.setProperty("--section-accent", t.accent);
  }

  function revealSection(section) {
    var items = section.querySelectorAll(".reveal-item");
    items.forEach(function (item) {
      item.classList.remove("revealed");
      void item.offsetWidth;
      setTimeout(function () {
        item.classList.add("revealed");
      }, 40);
    });
  }

  function updateUI() {
    dots.forEach(function (dot) {
      dot.classList.toggle("active", Number(dot.dataset.target) === currentSection);
    });
    document.querySelectorAll(".counter-current").forEach(function (el) {
      el.textContent = String(currentSection + 1).padStart(2, "0");
    });
    if (window._setMatrixTheme) {
      window._setMatrixTheme(Math.min(currentSection, 4));
    }
    applyTheme(currentSection);
  }

  function goToSection(index) {
    if (isAnimating) return;
    if (index < 0 || index >= sections.length || index === currentSection) return;

    var prev = sections[currentSection];
    var next = sections[index];
    isAnimating = true;

    prev.classList.remove("active");
    prev.classList.toggle("prev", index > currentSection);
    next.classList.remove("prev");
    next.classList.add("active");

    currentSection = index;
    updateUI();
    revealSection(next);

    setTimeout(function () {
      prev.classList.remove("prev");
      isAnimating = false;
    }, 700);
  }

  sections.forEach(function (section, idx) {
    section.classList.remove("active", "prev", "wiper-top", "wiper-under");
    if (idx === 0) section.classList.add("active");
  });
  revealSection(sections[0]);
  updateUI();

  document.addEventListener("wheel", function (e) {
    e.preventDefault();
    var delta = e.deltaY || e.detail || -e.wheelDelta || 0;
    wheelAccum += delta;
    if (wheelAccum >= WHEEL_THRESHOLD) {
      goToSection(currentSection + 1);
      wheelAccum = 0;
    } else if (wheelAccum <= -WHEEL_THRESHOLD) {
      goToSection(currentSection - 1);
      wheelAccum = 0;
    }
  }, { passive: false });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      goToSection(currentSection + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      goToSection(currentSection - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goToSection(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goToSection(sections.length - 1);
    }
  });

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var target = Number(dot.dataset.target);
      if (!Number.isNaN(target)) goToSection(target);
    });
  });

  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var href = link.getAttribute("href");
      var map = { "#about": 1, "#projects": 2, "#notes": 3, "#contact": 4 };
      goToSection(map[href] ?? 0);
    });
  });
})();


/* ===========================
   HERO TITLE GLITCH — PERIODIC BIG BURST
   Screen shake + flash + title distortion
   =========================== */
(function initHeroGlitchBurst() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var heroTitle = document.querySelector(".hero-title");
  var titleLines = Array.from(document.querySelectorAll(".hero-title .title-line"));
  if (!heroTitle || !titleLines.length) return;

  // Create particle container inside hero-inner
  var heroInner = document.querySelector(".hero-inner");
  if (heroInner) {
    var particleContainer = document.createElement("div");
    particleContainer.className = "title-glitch-particles";
    particleContainer.id = "titleParticles";
    particleInner = heroInner.insertBefore(particleContainer, heroInner.firstChild);
  }

  var glitchChars = "01XYxX@#$%&*?!^+-<>/\\|~`";
  var lastBurstTime = 0;
  var burstInterval = 2200;
  var minBurstInterval = 1400;

  function getParticleGlyph() {
    return glitchChars[(Math.random() * glitchChars.length) | 0];
  }

  function spawnParticle() {
    if (!particleContainer) return;
    var p = document.createElement("span");
    p.className = "title-glitch-particle";
    p.textContent = getParticleGlyph();

    var dur = 250 + Math.random() * 350;
    var delay = Math.random() * 80;
    var xBase = Math.random() * 100;
    var yBase = Math.random() * 100;
    var isLeft = Math.random() < 0.5;
    var xOff = (isLeft ? -1 : 1) * (5 + Math.random() * 30);
    var yOff = (Math.random() - 0.5) * 40;
    var skew = (Math.random() - 0.5) * 30;

    p.style.cssText = [
      "left:" + xBase + "%;",
      "top:" + yBase + "%;",
      "--p-dur:" + dur + "ms;",
      "--p-delay:" + delay + "ms;",
      "--p-x1:" + xOff * 0.4 + "px;",
      "--p-y1:" + yOff * 0.3 + "px;",
      "--p-sk1:" + skew * 0.5 + "deg;",
      "--p-x2:" + (-xOff * 0.7) + "px;",
      "--p-y2:" + (-yOff * 0.4) + "px;",
      "--p-sk2:" + (-skew * 0.6) + "deg;",
      "--p-x3:" + xOff * 0.5 + "px;",
      "--p-y3:" + yOff * 0.5 + "px;",
      "--p-sk3:" + skew * 0.3 + "deg;",
      "--p-x4:" + (-xOff * 0.3) + "px;",
      "--p-y4:" + (-yOff * 0.2) + "px;",
      "--p-sk4:" + (-skew * 0.2) + "deg;",
      "--p-x5:" + 0 + "px;",
      "--p-y5:" + yOff * 0.8 + "px;"
    ].join("");

    particleContainer.appendChild(p);
    setTimeout(function () {
      if (p.parentNode) p.parentNode.removeChild(p);
    }, dur + delay + 50);
  }

  function burstParticles() {
    var count = 8 + Math.floor(Math.random() * 12);
    for (var i = 0; i < count; i++) {
      setTimeout(spawnParticle, Math.random() * 120);
    }
  }

  function flashGlitchOverlay() {
    var flash = document.createElement("div");
    flash.className = "hero-title-glitch-flash";
    document.body.appendChild(flash);
    setTimeout(function () {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 350);
  }

  function bigGlitch() {
    // Flash overlay
    flashGlitchOverlay();

    // Big burst on all title lines
    titleLines.forEach(function (line) {
      line.classList.remove("is-glitch-burst");
      void line.offsetWidth;
      line.classList.add("is-glitch-burst");
      setTimeout(function () {
        line.classList.remove("is-glitch-burst");
      }, 500);
    });

    // Particle explosion
    burstParticles();

    // Screen shake using CSS class
    var container = document.querySelector(".scroll-container");
    if (container) {
      container.classList.remove("screen-shake");
      void container.offsetWidth;
      container.classList.add("screen-shake");
      setTimeout(function () {
        container.classList.remove("screen-shake");
      }, 300);
    }
  }

  function scheduleNext() {
    var jitter = Math.random() * (burstInterval - minBurstInterval);
    var delay = minBurstInterval + jitter;
    setTimeout(function () {
      var now = performance.now();
      // Only burst if hero section is visible
      var heroSection = document.querySelector(".scroll-section.active");
      if (heroSection && heroSection.dataset.section === "0") {
        bigGlitch();
      }
      scheduleNext();
    }, delay);
  }

  scheduleNext();
})();


/* ===========================
   HERO TITLE RANDOM SLICES — ENHANCED
   =========================== */
(function initHeroSliceRandom() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var lines = Array.from(document.querySelectorAll(".hero-title .title-line"));
  if (!lines.length) return;

  function randomizeSlice(line) {
    if (!line) return;
    if (Math.random() < 0.28) {
      line.style.setProperty("--slice-opacity", "0");
      line.classList.remove("is-slice-hit");
      return;
    }

    // More dramatic slice parameters
    var top = Math.random() * 85;
    var height = 10 + Math.random() * 38;
    if (top + height > 95) top = 95 - height;
    var bottom = 100 - (top + height);
    var shift = (Math.random() * 12 - 6).toFixed(2) + "px";
    var opacity = (0.22 + Math.random() * 0.55).toFixed(2);
    var dur = 80 + Math.floor(Math.random() * 160);
    var colors = [
      "rgba(0,212,255,0.7)",
      "rgba(255,43,94,0.65)",
      "rgba(245,230,66,0.6)",
      "rgba(255,200,100,0.5)",
      "rgba(0,255,140,0.45)"
    ];

    line.style.setProperty("--slice-top", top.toFixed(2) + "%");
    line.style.setProperty("--slice-bottom", bottom.toFixed(2) + "%");
    line.style.setProperty("--slice-shift", shift);
    line.style.setProperty("--slice-opacity", opacity);
    line.style.setProperty("--slice-color", colors[(Math.random() * colors.length) | 0]);
    line.style.setProperty("--slice-dur", dur + "ms");
    line.style.setProperty("--slice-j1", ((Math.random() * 6 - 3).toFixed(2)) + "px");
    line.style.setProperty("--slice-j2", ((Math.random() * 7 - 3.5).toFixed(2)) + "px");
    line.style.setProperty("--slice-j3", ((Math.random() * 5 - 2.5).toFixed(2)) + "px");
    line.style.setProperty("--slice-sk1", ((Math.random() * 12 - 6).toFixed(2)) + "deg");
    line.style.setProperty("--slice-sk2", ((Math.random() * 10 - 5).toFixed(2)) + "deg");
    line.style.setProperty("--slice-sk3", ((Math.random() * 8 - 4).toFixed(2)) + "deg");

    line.classList.remove("is-slice-hit");
    void line.offsetWidth;
    line.classList.add("is-slice-hit");
  }

  function pulse() {
    for (var i = 0; i < lines.length; i++) {
      if (Math.random() < 0.78) randomizeSlice(lines[i]);
    }
    setTimeout(pulse, 60 + Math.floor(Math.random() * 200));
  }

  pulse();
})();


/* ===========================
   HERO TITLE LETTER MOTION — ENHANCED
   =========================== */
(function initHeroCharMotion() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var heroChars = Array.from(document.querySelectorAll(".hero-title .hero-char"));
  if (!heroChars.length) return;

  function joltChar(ch) {
    if (!ch) return;
    var dur = 80 + Math.floor(Math.random() * 150);
    ch.style.setProperty("--hero-jolt-dur", dur + "ms");
    ch.style.setProperty("--hero-jx1", ((Math.random() * 6 - 3).toFixed(2)) + "px");
    ch.style.setProperty("--hero-jx2", ((Math.random() * 6 - 3).toFixed(2)) + "px");
    ch.style.setProperty("--hero-sk1", ((Math.random() * 10 - 5).toFixed(2)) + "deg");
    ch.style.setProperty("--hero-sk2", ((Math.random() * 8 - 4).toFixed(2)) + "deg");

    ch.classList.remove("is-hero-jolt");
    void ch.offsetWidth;
    ch.classList.add("is-hero-jolt");
  }

  function pulse() {
    if (!heroChars.length) return;
    var count = 1 + Math.floor(Math.random() * 4);
    for (var i = 0; i < count; i++) {
      joltChar(heroChars[(Math.random() * heroChars.length) | 0]);
    }
    setTimeout(pulse, 100 + Math.floor(Math.random() * 240));
  }

  pulse();
})();


/* ===========================
   LIVE2D-LIKE HERO IDLE
   =========================== */
(function initLive2DIdle() {
  var stage = document.querySelector(".live2d-stage");
  if (!stage) return;

  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    stage.style.setProperty("--blink", "1");
    stage.style.setProperty("--blink-closure", "0");
    return;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  var blinkTrack = [];
  var nextBlinkAt = 0;
  var gaze = { fromX: 0, fromY: 0, toX: 0, toY: 0, start: 0, duration: 1 };

  function scheduleBlink(now, chained) {
    var closeDur = rand(70, 95);
    var holdDur = rand(20, 38);
    var openDur = rand(95, 135);
    blinkTrack.push(
      { start: now, end: now + closeDur, from: 1, to: 0 },
      { start: now + closeDur, end: now + closeDur + holdDur, from: 0, to: 0 },
      { start: now + closeDur + holdDur, end: now + closeDur + holdDur + openDur, from: 0, to: 1 }
    );

    if (chained) {
      nextBlinkAt = now + closeDur + holdDur + openDur + rand(80, 180);
    } else {
      nextBlinkAt = now + rand(2600, 6200);
      if (Math.random() < 0.18) {
        nextBlinkAt = now + closeDur + holdDur + openDur + rand(90, 180);
      }
    }
  }

  function scheduleGaze(now) {
    gaze.fromX = parseFloat(stage.style.getPropertyValue("--gaze-x")) || 0;
    gaze.fromY = parseFloat(stage.style.getPropertyValue("--gaze-y")) || 0;
    gaze.toX = rand(-5.5, 5.5);
    gaze.toY = rand(-3.5, 3.5);
    gaze.start = now;
    gaze.duration = rand(2200, 4200);
  }

  scheduleBlink(performance.now(), false);
  scheduleGaze(performance.now());

  function updateBlink(now) {
    while (blinkTrack.length && now > blinkTrack[0].end) {
      blinkTrack.shift();
    }

    if (now >= nextBlinkAt && blinkTrack.length === 0) {
      scheduleBlink(now, false);
    }

    if (!blinkTrack.length) return 1;

    var active = blinkTrack[0];
    var duration = Math.max(active.end - active.start, 1);
    var progress = clamp((now - active.start) / duration, 0, 1);
    return active.from + (active.to - active.from) * easeInOutSine(progress);
  }

  function updateGaze(now) {
    if (now >= gaze.start + gaze.duration) {
      scheduleGaze(now);
    }

    var progress = clamp((now - gaze.start) / gaze.duration, 0, 1);
    var eased = easeInOutSine(progress);
    return {
      x: gaze.fromX + (gaze.toX - gaze.fromX) * eased,
      y: gaze.fromY + (gaze.toY - gaze.fromY) * eased
    };
  }

  function frame(now) {
    var t = now / 1000;
    var breath = Math.sin((Math.PI * 2 * t) / 6);
    var breathSoft = Math.sin((Math.PI * 2 * t) / 6 + 0.8);
    var bob = Math.sin((Math.PI * 2 * t) / 3 + 1.1);
    var sway = Math.sin((Math.PI * 2 * t) / 8 - 0.7);
    var hairWave = Math.sin((Math.PI * 2 * t) / 4.8 + 0.35);
    var hairWaveB = Math.sin((Math.PI * 2 * t) / 4.8 + 1.45);
    var accessoryWave = Math.sin((Math.PI * 2 * t) / 4.2 + 2.1);
    var skirtWave = Math.sin((Math.PI * 2 * t) / 5.2 + 1.7);
    var blink = updateBlink(now);
    var closure = 1 - blink;
    var gazePoint = updateGaze(now);

    stage.style.setProperty("--breath-y", (breath * -5.8).toFixed(2) + "px");
    stage.style.setProperty("--float-y", (bob * -1.6).toFixed(2) + "px");
    stage.style.setProperty("--body-r", (sway * 0.8).toFixed(2) + "deg");
    stage.style.setProperty("--body-sx", (1 - breath * 0.0035 + bob * 0.0015).toFixed(4));
    stage.style.setProperty("--body-sy", (1 + breath * 0.0085).toFixed(4));
    stage.style.setProperty("--bounce-y", (Math.max(0, bob) * -1.8).toFixed(2) + "px");

    stage.style.setProperty("--torso-y", (breath * -2.6).toFixed(2) + "px");
    stage.style.setProperty("--torso-sy", (1 + breath * 0.014).toFixed(4));
    stage.style.setProperty("--skirt-x", (skirtWave * 1.8).toFixed(2) + "px");
    stage.style.setProperty("--skirt-y", (Math.abs(skirtWave) * 1.4).toFixed(2) + "px");
    stage.style.setProperty("--skirt-r", (skirtWave * 1.5).toFixed(2) + "deg");

    stage.style.setProperty("--head-x", (sway * 1.8 + breathSoft * 0.6).toFixed(2) + "px");
    stage.style.setProperty("--head-y", (breathSoft * -1.4).toFixed(2) + "px");
    stage.style.setProperty("--head-r", (sway * 0.95).toFixed(2) + "deg");

    stage.style.setProperty("--bang-left-x", (hairWave * -1.1).toFixed(2) + "px");
    stage.style.setProperty("--bang-left-y", (Math.abs(hairWave) * 0.8).toFixed(2) + "px");
    stage.style.setProperty("--bang-left-r", (hairWave * -1.8).toFixed(2) + "deg");
    stage.style.setProperty("--bang-center-x", (hairWaveB * 0.6).toFixed(2) + "px");
    stage.style.setProperty("--bang-center-y", (Math.abs(hairWaveB) * 0.55).toFixed(2) + "px");
    stage.style.setProperty("--bang-center-r", (hairWaveB * 1.05).toFixed(2) + "deg");
    stage.style.setProperty("--bang-right-x", (hairWave * 1.1).toFixed(2) + "px");
    stage.style.setProperty("--bang-right-y", (Math.abs(hairWave) * 0.8).toFixed(2) + "px");
    stage.style.setProperty("--bang-right-r", (hairWave * 1.8).toFixed(2) + "deg");

    stage.style.setProperty("--hair-left-x", (hairWaveB * -1.6).toFixed(2) + "px");
    stage.style.setProperty("--hair-left-y", (Math.abs(hairWaveB) * 1.4).toFixed(2) + "px");
    stage.style.setProperty("--hair-left-r", (hairWaveB * -2.8).toFixed(2) + "deg");
    stage.style.setProperty("--hair-right-x", (hairWave * 1.6).toFixed(2) + "px");
    stage.style.setProperty("--hair-right-y", (Math.abs(hairWave) * 1.4).toFixed(2) + "px");
    stage.style.setProperty("--hair-right-r", (hairWave * 2.8).toFixed(2) + "deg");

    stage.style.setProperty("--earring-left-y", (Math.abs(accessoryWave) * 1.8).toFixed(2) + "px");
    stage.style.setProperty("--earring-right-y", (Math.abs(accessoryWave) * 1.8).toFixed(2) + "px");
    stage.style.setProperty("--earring-left-r", (accessoryWave * -6.2).toFixed(2) + "deg");
    stage.style.setProperty("--earring-right-r", (accessoryWave * 6.2).toFixed(2) + "deg");

    stage.style.setProperty("--mouth-y", (breathSoft * 0.75 + closure * 0.6).toFixed(2) + "px");
    stage.style.setProperty("--mouth-sy", (1 + breath * 0.03 - closure * 0.04).toFixed(4));

    stage.style.setProperty("--gaze-x", gazePoint.x.toFixed(2) + "px");
    stage.style.setProperty("--gaze-y", gazePoint.y.toFixed(2) + "px");
    stage.style.setProperty("--blink", blink.toFixed(4));
    stage.style.setProperty("--blink-closure", closure.toFixed(4));

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();


/* ===========================
   RANDOM TEXT GLITCH WAVE
   =========================== */
(function initTextGlitchWave() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var selectors = [
    ".logo",
    ".nav-link",
    ".section-tag",
    ".section-title",
    ".about-card h3",
    ".project-card h3",
    ".btn span",
    ".card-action span"
  ];

  function shouldSkipNode(parentEl) {
    if (!parentEl) return true;
    var tag = parentEl.tagName;
    return tag === "SCRIPT" || tag === "STYLE" || tag === "SVG" || tag === "PATH";
  }

  function wrapTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    var text = node.nodeValue;
    if (!text || !text.trim()) return;
    var parent = node.parentNode;
    if (shouldSkipNode(parent)) return;

    var frag = document.createDocumentFragment();
    Array.from(text).forEach(function (ch) {
      if (ch === " ") {
        frag.appendChild(document.createTextNode(" "));
        return;
      }
      var span = document.createElement("span");
      span.className = "glitch-char";
      span.textContent = ch;
      span.setAttribute("data-char", ch);
      frag.appendChild(span);
    });
    parent.replaceChild(frag, node);
  }

  function processElement(el) {
    if (!el || el.dataset.glitchReady === "1") return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(wrapTextNode);
    el.dataset.glitchReady = "1";
  }

  var targets = document.querySelectorAll(selectors.join(","));
  targets.forEach(processElement);

  var chars = Array.from(document.querySelectorAll(".glitch-char"));
  if (!chars.length) return;

  function burstOnChar(ch) {
    if (!ch) return;
    var warpDuration = 60 + Math.floor(Math.random() * 140);
    ch.style.setProperty("--sx1", ((Math.random() * 3.5 - 2.2).toFixed(2)) + "px");
    ch.style.setProperty("--sy1", ((Math.random() * 2.5 - 1.25).toFixed(2)) + "px");
    ch.style.setProperty("--sx2", ((Math.random() * 3.5 + 0.3).toFixed(2)) + "px");
    ch.style.setProperty("--sy2", ((Math.random() * 2.5 - 1.25).toFixed(2)) + "px");
    ch.style.setProperty("--blur1", (3 + Math.random() * 6).toFixed(2) + "px");
    ch.style.setProperty("--blur2", (3 + Math.random() * 8).toFixed(2) + "px");
    ch.style.setProperty("--ghost-a", (0.5 + Math.random() * 0.45).toFixed(2));
    ch.style.setProperty("--ghost-b", (0.4 + Math.random() * 0.45).toFixed(2));
    ch.style.setProperty("--glow-size", (6 + Math.random() * 12).toFixed(2) + "px");
    ch.style.setProperty("--wx", ((Math.random() * 5 - 2.5).toFixed(2)) + "px");
    ch.style.setProperty("--wskew", ((Math.random() * 22 - 11).toFixed(2)) + "deg");
    ch.style.setProperty("--wscale", (0.88 + Math.random() * 0.26).toFixed(3));
    ch.style.setProperty("--cut-top-l", (Math.random() * 18).toFixed(2) + "%");
    ch.style.setProperty("--cut-top-r", (Math.random() * 18).toFixed(2) + "%");
    ch.style.setProperty("--cut-bottom-l", (Math.random() * 20).toFixed(2) + "%");
    ch.style.setProperty("--cut-bottom-r", (Math.random() * 20).toFixed(2) + "%");
    ch.style.setProperty("--warp-dur", warpDuration + "ms");
    ch.classList.add("is-glitch");
    setTimeout(function () {
      ch.classList.remove("is-glitch");
    }, warpDuration);
  }

  function pulse() {
    if (!chars.length) return;
    var burstCount = 1 + Math.floor(Math.random() * 5);
    for (var i = 0; i < burstCount; i++) {
      burstOnChar(chars[(Math.random() * chars.length) | 0]);
    }
    setTimeout(pulse, 50 + Math.floor(Math.random() * 200));
  }

  pulse();
})();


/* ===========================
   CARD HOVER GLITCH
   =========================== */
(function initGlitch() {
  document.querySelectorAll(".project-card").forEach(function (card) {
    var actionLink = card.querySelector(".card-action");
    var href = actionLink ? actionLink.getAttribute("href") : "";
    var target = actionLink ? (actionLink.getAttribute("target") || "_self") : "_self";

    // Make the full card reliably clickable as a fallback.
    if (href) {
      card.setAttribute("tabindex", "0");
      card.addEventListener("click", function (e) {
        if (e.target && e.target.closest("a")) return;
        if (target === "_blank") {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = href;
        }
      });
      card.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (target === "_blank") {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = href;
        }
      });
    }

    card.addEventListener("mouseenter", function () {
      var n = 0;
      var id = setInterval(function () {
        if (n >= 3) { clearInterval(id); this.style.transform = "translateY(-5px)"; return; }
        this.style.transform = "translateY(-5px) translateX(" + ((Math.random() - 0.5) * 5) + "px)";
        n++;
        var self = this;
        setTimeout(function () { self.style.transform = "translateY(-5px)"; }, 40);
      }.bind(this), 80);
    });
    card.addEventListener("mouseleave", function () { this.style.transform = ""; });
  });
})();
