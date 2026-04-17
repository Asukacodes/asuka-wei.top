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
  // 0=HERO(machine/hex), 1=ABOUT(binary), 2=PROJECTS(symbols), 3=CONTACT(code)
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
    currentTheme = idx;
    var t = themes[idx];
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
   SMOOTH WHEEL SCROLL — Section Transitions
   ============================================== */
(function initWheelScroll() {
  var sections = document.querySelectorAll(".scroll-section");
  var dots = document.querySelectorAll(".dot");
  var counter = document.querySelector(".counter-current");
  if (!sections.length) return;

  var currentSection = 0;
  var isAnimating = false;
  var wheelAccum = 0;
  var wiperState = null;
  var hardwareThreads = navigator.hardwareConcurrency || 4;
  var deviceMemory = navigator.deviceMemory || 4;
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lowPowerFx = prefersReducedMotion || hardwareThreads <= 4 || deviceMemory <= 4;
  var fxResolutionScale = lowPowerFx ? 0.62 : 0.82;
  var fxIntensity = lowPowerFx ? 0.65 : 1.0;

  function createFxCanvas(container) {
    var cssW = window.innerWidth;
    var cssH = window.innerHeight;
    var renderW = Math.max(1, Math.floor(cssW * fxResolutionScale));
    var renderH = Math.max(1, Math.floor(cssH * fxResolutionScale));
    var canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%";
    canvas.width = renderW;
    canvas.height = renderH;
    container.appendChild(canvas);
    var ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return null;
    ctx.setTransform(renderW / cssW, 0, 0, renderH / cssH, 0, 0);
    return { canvas: canvas, ctx: ctx, width: cssW, height: cssH };
  }

  // Per-section CSS theme variables
  var sectionThemes = [
    // 0: Hero — yellow/dark
    { primary: "var(--primary)", accent: "var(--accent)", blue: "var(--blue)", text: "var(--primary)" },
    // 1: About — blue/cyan
    { primary: "var(--blue)", accent: "var(--accent)", blue: "var(--blue)", text: "var(--blue)" },
    // 2: Projects — red/pink
    { primary: "var(--accent)", accent: "var(--primary)", blue: "var(--blue)", text: "var(--accent)" },
    // 3: Notes — purple
    { primary: "#c864ff", accent: "var(--accent)", blue: "var(--blue)", text: "#c864ff" },
    // 4: Contact — green/cyan
    { primary: "#00ff8c", accent: "var(--accent)", blue: "var(--blue)", text: "#00ff8c" },
  ];

  function applyTheme(idx) {
    var root = document.documentElement;
    var t = sectionThemes[idx];
    // Update accent color variable for section-specific highlights
    root.style.setProperty("--section-primary", t.primary);
    root.style.setProperty("--section-accent", t.accent);
  }

  function updateUI() {
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === currentSection);
    });
    if (counter) {
      counter.textContent = String(currentSection + 1).padStart(2, "0");
    }
    // Sync matrix theme
    if (window._setMatrixTheme) {
      window._setMatrixTheme(currentSection);
    }
    // Apply section color theme
    applyTheme(currentSection);
  }

  function isSweepPair(fromIdx, toIdx) {
    // Projects (2) <-> Notes (3) and Notes (3) <-> Contact (4)
    return (fromIdx === 2 && toIdx === 3) || (fromIdx === 3 && toIdx === 2) ||
           (fromIdx === 3 && toIdx === 4) || (fromIdx === 4 && toIdx === 3);
  }

  function goToSection(index) {
    if (isAnimating || index < 0 || index >= sections.length || index === currentSection) return;

    var prevSection = sections[currentSection];
    var nextSection = sections[index];

    // Projects <-> Contact: full-screen left-to-right particle sweep
    if (isSweepPair(currentSection, index)) {
      startFullSweepTransition(currentSection, index);
      return;
    }

    // Normal sections: minimal edge particle effect
    triggerTransitionFX(index > currentSection ? 1 : -1);

    isAnimating = true;
    prevSection.classList.remove("active");
    if (index > currentSection) {
      prevSection.classList.add("prev");
    } else {
      prevSection.classList.remove("prev");
    }

    nextSection.classList.remove("prev");
    nextSection.classList.add("active");

    revealSection(nextSection);

    currentSection = index;
    updateUI();

    setTimeout(function () {
      isAnimating = false;
      prevSection.classList.remove("prev");
    }, 700);
  }

  /* ==============================================
     FULL-SCREEN SWEEP — Projects <-> Contact
     Left matrix sweeps left->right then fades out
     ============================================== */
  function startFullSweepTransition(fromIdx, toIdx) {
    try {
      isAnimating = true;
      var switched = false;
      var showSweepStripe = false;

    var themeColors = [
      { r: 245, g: 230, b: 66 },  // hero: yellow
      { r: 0,   g: 212, b: 255 }, // about: cyan
      { r: 255, g: 43,  b: 94  }, // projects: red
      { r: 200, g: 100, b: 255 }, // notes: purple
      { r: 0,   g: 255, b: 140 }, // contact: green
    ];

    var fromCol = themeColors[fromIdx];
    var toCol = themeColors[toIdx];

    var prevSec = sections[fromIdx];
    var nextSec = sections[toIdx];

    // Keep current section visible; switch when sweep covers full screen.
    var container = document.createElement("div");
    container.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;overflow:hidden";
    document.body.appendChild(container);

    var fxCanvas = createFxCanvas(container);
    if (!fxCanvas) {
      isAnimating = false;
      return;
    }
    var ctx = fxCanvas.ctx;
    var W = fxCanvas.width;
    var H = fxCanvas.height;

    var matrixLeft = document.getElementById("matrix-left");
    var matrixText = matrixLeft ? matrixLeft.textContent : "0101010101";
    var glyphPool = [];
    for (var gi = 0; gi < matrixText.length; gi++) {
      var ch = matrixText.charAt(gi);
      if (ch !== " " && ch !== "\n" && ch !== "\r" && ch !== "\t") {
        glyphPool.push(ch);
      }
    }
    if (!glyphPool.length) glyphPool = ["0", "1", "6", "*", "^"];

    var tileCanvas = document.createElement("canvas");
    var tileW = lowPowerFx ? 260 : 320;
    tileCanvas.width = tileW;
    tileCanvas.height = H;
    var tileCtx = tileCanvas.getContext("2d");
    var rowH = lowPowerFx ? 15 : 13;
    var colW = lowPowerFx ? 12 : 10;
    var rows = Math.ceil(H / rowH) + 2;
    var cols = Math.ceil(tileW / colW) + 2;

    function drawMachineTile(phase, tintColor) {
      tileCtx.clearRect(0, 0, tileW, H);
      tileCtx.font = (lowPowerFx ? "11px" : "12px") + " 'Share Tech Mono', monospace";
      tileCtx.textBaseline = "top";
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var idx = (x * 17 + y * 31 + Math.floor(phase * 90)) % glyphPool.length;
          var char = glyphPool[idx];
          var baseA = 0.08 + ((x + y) % 7) * 0.016;
          var pulse = 0.45 + 0.55 * Math.sin((x * 0.38 + y * 0.25 + phase * 8.5));
          var alpha = baseA * Math.max(0.15, pulse);
          var rr = Math.min(255, tintColor.r + ((x + y) % 8 === 0 ? 18 : 0));
          var gg = Math.min(255, tintColor.g + ((x + y) % 9 === 0 ? 14 : 0));
          var bb = Math.min(255, tintColor.b + ((x + y) % 10 === 0 ? 16 : 0));
          tileCtx.fillStyle = "rgba(" + rr + "," + gg + "," + bb + "," + alpha + ")";
          tileCtx.fillText(char, x * colW, y * rowH);
        }
      }
    }

    var startTime = performance.now();
    var duration = 1120;
    var coverRatio = 0.55;

    function frame(ts) {
      var elapsed = ts - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var coverProgress = Math.min(progress / coverRatio, 1);
      var dissolveProgress = progress <= coverRatio ? 0 : (progress - coverRatio) / (1 - coverRatio);

      ctx.clearRect(0, 0, W, H);

      var cr = Math.floor(fromCol.r + (toCol.r - fromCol.r) * progress);
      var cg = Math.floor(fromCol.g + (toCol.g - fromCol.g) * progress);
      var cb = Math.floor(fromCol.b + (toCol.b - fromCol.b) * progress);

      if (!switched && coverProgress >= 1) {
        switched = true;
        prevSec.classList.remove("active", "prev");
        nextSec.classList.remove("prev");
        nextSec.classList.add("active");
        currentSection = toIdx;
        updateUI();
        revealSection(nextSec);
      }

      var sweepFront = coverProgress * W;
      var clearFront = dissolveProgress * W;
      var visibleStart = progress < coverRatio ? 0 : clearFront;
      var visibleEnd = sweepFront;
      var visibleWidth = Math.max(0, visibleEnd - visibleStart);

      drawMachineTile(progress, { r: cr, g: cg, b: cb });

      if (visibleWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(visibleStart, 0, visibleWidth, H);
        ctx.clip();

        var pattern = ctx.createPattern(tileCanvas, "repeat");
        ctx.translate(-((progress * 120) % tileW), 0);
        ctx.fillStyle = pattern;
        ctx.fillRect(visibleStart - tileW, 0, visibleWidth + tileW * 2, H);

        var grainA = 0.05 + (1 - dissolveProgress) * 0.08;
        ctx.fillStyle = "rgba(0,0,0," + (0.35 - grainA) + ")";
        ctx.fillRect(visibleStart, 0, visibleWidth, H);
        ctx.restore();

        if (showSweepStripe) {
          var edgeX = progress < coverRatio ? sweepFront : clearFront;
          var edgeA = 0.58 * (1 - dissolveProgress * 0.7);
          var grad = ctx.createLinearGradient(edgeX - 38, 0, edgeX + 18, 0);
          grad.addColorStop(0, "rgba(" + cr + "," + cg + "," + cb + ",0)");
          grad.addColorStop(0.42, "rgba(" + Math.min(cr + 35, 255) + "," + Math.min(cg + 30, 255) + "," + Math.min(cb + 35, 255) + "," + (edgeA * 0.6) + ")");
          grad.addColorStop(0.6, "rgba(255,255,255," + edgeA + ")");
          grad.addColorStop(1, "rgba(" + cr + "," + cg + "," + cb + ",0)");
          ctx.fillStyle = grad;
          ctx.fillRect(edgeX - 38, 0, 56, H);
        }
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        if (!switched) {
          prevSec.classList.remove("active", "prev");
          nextSec.classList.remove("prev");
          nextSec.classList.add("active");
          currentSection = toIdx;
          updateUI();
          revealSection(nextSec);
        }
        if (container.parentNode) container.parentNode.removeChild(container);
        isAnimating = false;
      }
    }

    requestAnimationFrame(frame);
    } catch (err) {
      console.error("Sweep transition error:", err);
      isAnimating = false;
      // Fallback: just switch sections directly
      prevSec.classList.remove("active", "prev");
      nextSec.classList.remove("prev");
      nextSec.classList.add("active");
      currentSection = toIdx;
      updateUI();
      revealSection(nextSec);
    }
  }

  function isWiperPair(fromIdx, toIdx) {
    return (fromIdx === 1 && toIdx === 2) || (fromIdx === 2 && toIdx === 1);
  }

  function clearWiperMask(section) {
    section.style.webkitMaskImage = "";
    section.style.maskImage = "";
    section.style.webkitMaskRepeat = "";
    section.style.maskRepeat = "";
    section.style.webkitMaskMode = "";
    section.style.maskMode = "";
  }

  function applyWiperMask() {
    if (!wiperState) return;
    var sweepDeg = Math.max(0.5, wiperState.progress * wiperState.sweepRange);
    var edgeSoft = 2.2;
    var edgeMid = Math.min(360, sweepDeg + edgeSoft * 0.6);
    var edgeEnd = Math.min(360, sweepDeg + edgeSoft);
    var mask =
      "conic-gradient(from " + wiperState.startAngle + "deg at 0% 50%, " +
      "rgba(255,255,255,0) 0deg " + sweepDeg + "deg, " +
      "rgba(255,255,255,0.16) " + sweepDeg + "deg " + edgeMid + "deg, " +
      "rgba(255,255,255,1) " + edgeEnd + "deg 360deg)";
    wiperState.prevSection.style.webkitMaskImage = mask;
    wiperState.prevSection.style.maskImage = mask;
    wiperState.prevSection.style.webkitMaskRepeat = "no-repeat";
    wiperState.prevSection.style.maskRepeat = "no-repeat";
    wiperState.prevSection.style.webkitMaskMode = "alpha";
    wiperState.prevSection.style.maskMode = "alpha";

    var bladeAngle = wiperState.startAngle + sweepDeg;
    if (wiperState.blade) {
      wiperState.blade.style.transform = "rotate(" + bladeAngle + "deg)";
    }
  }

  function cleanupWiperTransition() {
    if (!wiperState) return;
    if (wiperState.rafId) {
      cancelAnimationFrame(wiperState.rafId);
      wiperState.rafId = 0;
    }
    clearWiperMask(wiperState.prevSection);
    wiperState.prevSection.classList.remove("wiper-top");
    wiperState.nextSection.classList.remove("wiper-under");
    if (wiperState.blade && wiperState.blade.parentNode) {
      wiperState.blade.parentNode.removeChild(wiperState.blade);
    }
    document.body.classList.remove("is-wiper-transition");
    wiperState = null;
  }

  function stepWiperTransition(ts) {
    if (!wiperState) return;

    var dt = wiperState.lastTs ? (ts - wiperState.lastTs) : 16;
    wiperState.lastTs = ts;

    var diff = wiperState.targetProgress - wiperState.progress;
    var alpha = Math.max(0.1, Math.min(0.42, dt / 55));
    wiperState.progress += diff * alpha;

    if (Math.abs(diff) < 0.0012) {
      wiperState.progress = wiperState.targetProgress;
    }

    wiperState.progress = Math.max(0, Math.min(1, wiperState.progress));
    applyWiperMask();

    if (wiperState.targetProgress >= 1 && wiperState.progress >= 0.999) {
      finishWiperTransition();
      return;
    }

    if (wiperState.targetProgress <= 0 && wiperState.progress <= 0.001) {
      cancelWiperTransition();
      return;
    }

    if (Math.abs(wiperState.targetProgress - wiperState.progress) > 0.0008) {
      wiperState.rafId = requestAnimationFrame(stepWiperTransition);
    } else {
      wiperState.rafId = 0;
      wiperState.lastTs = 0;
    }
  }

  function ensureWiperTransitionLoop() {
    if (!wiperState || wiperState.rafId) return;
    wiperState.rafId = requestAnimationFrame(stepWiperTransition);
  }

  function cancelWiperTransition() {
    if (!wiperState) return;
    wiperState.nextSection.classList.remove("active", "prev");
    wiperState.prevSection.classList.add("active");
    cleanupWiperTransition();
    isAnimating = false;
    wheelAccum = 0;
    lastWheelDir = 0;
  }

  function finishWiperTransition() {
    if (!wiperState) return;
    var prevSection = wiperState.prevSection;
    var nextSection = wiperState.nextSection;

    prevSection.classList.remove("active", "prev");
    nextSection.classList.add("active");

    currentSection = wiperState.toIndex;
    cleanupWiperTransition();
    updateUI();
    revealSection(nextSection);
    isAnimating = false;
    wheelAccum = 0;
    lastWheelDir = 0;
  }

  function startWiperTransition(targetIndex) {
    var prevSection = sections[currentSection];
    var nextSection = sections[targetIndex];

    isAnimating = true;
    wiperState = {
      fromIndex: currentSection,
      toIndex: targetIndex,
      progress: 0,
      targetProgress: 0,
      startAngle: -112,
      sweepRange: 284,
      prevSection: prevSection,
      nextSection: nextSection,
      blade: null,
      rafId: 0,
      lastTs: 0,
    };

    document.body.classList.add("is-wiper-transition");
    nextSection.classList.remove("prev");
    nextSection.classList.add("active", "wiper-under");
    prevSection.classList.add("wiper-top");
    applyWiperMask();
  }

  function updateWiperByWheelDelta(delta) {
    if (!wiperState) return;
    var towardTarget = wiperState.toIndex > wiperState.fromIndex ? 1 : -1;
    wiperState.targetProgress += (delta * towardTarget) / 520;
    wiperState.targetProgress = Math.max(0, Math.min(1, wiperState.targetProgress));
    ensureWiperTransitionLoop();
  }

  function revealSection(section) {
    var items = section.querySelectorAll(".reveal-item");
    items.forEach(function (item) {
      item.classList.remove("revealed");
      void item.offsetWidth;
      setTimeout(function () { item.classList.add("revealed"); }, 50);
    });
  }

  /* ==============================================
     CYBERPUNK TRANSITION FX
     Edge-only particles + color crossfade
     ============================================== */
  function triggerTransitionFX(direction) {
    var nextIdx = currentSection + direction;
    nextIdx = Math.max(0, Math.min(nextIdx, sections.length - 1));

    var themeColors = [
      { r: 245, g: 230, b: 66 },  // hero: yellow
      { r: 0,   g: 212, b: 255 }, // about: cyan
      { r: 255, g: 43,  b: 94  }, // projects: red
      { r: 200, g: 100, b: 255 }, // notes: purple
      { r: 0,   g: 255, b: 140 }, // contact: green
    ];

    var fromCol = themeColors[currentSection];
    var toCol = themeColors[nextIdx];
    // Minimal transition FX: no full-screen flash, only edge particles.
    var container = document.createElement("div");
    container.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;overflow:hidden";
    document.body.appendChild(container);

    var fxCanvas = createFxCanvas(container);
    if (!fxCanvas) return;
    var ctx = fxCanvas.ctx;
    var W = fxCanvas.width;
    var H = fxCanvas.height;
    var railW = Math.max(70, Math.floor(W * (lowPowerFx ? 0.1 : 0.12)));

    function spawnParticle(side) {
      var onLeft = side === "left";
      var baseX = onLeft ? Math.random() * railW : W - railW + Math.random() * railW;
      var speedY = (1.5 + Math.random() * 3.5) * (direction > 0 ? 1 : -1);
      return {
        x: baseX,
        y: Math.random() * H,
        vx: (onLeft ? 1 : -1) * (0.1 + Math.random() * 0.9),
        vy: speedY,
        size: 0.8 + Math.random() * 1.8,
        life: 0.35 + Math.random() * 0.65,
        decay: 0.01 + Math.random() * 0.02,
      };
    }

    var particles = [];
    var particleCount = Math.max(30, Math.floor((W / 24) * fxIntensity));
    for (var p = 0; p < particleCount; p++) {
      particles.push(spawnParticle(p % 2 === 0 ? "left" : "right"));
    }

    var streaks = [];
    for (var s = 0; s < Math.max(8, Math.floor(14 * fxIntensity)); s++) {
      var leftSide = s % 2 === 0;
      streaks.push({
        x: leftSide ? Math.random() * railW : W - railW + Math.random() * railW,
        y: Math.random() * H,
        len: 10 + Math.random() * 26,
        speed: (2 + Math.random() * 4) * (direction > 0 ? 1 : -1),
        life: 0.4 + Math.random() * 0.6,
      });
    }

    var startTime = performance.now();
    var duration = 420;

    function frame(ts) {
      var elapsed = ts - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var envelope = Math.sin(progress * Math.PI); // 0->1->0

      ctx.clearRect(0, 0, W, H);

      var cr = Math.floor(fromCol.r + (toCol.r - fromCol.r) * progress);
      var cg = Math.floor(fromCol.g + (toCol.g - fromCol.g) * progress);
      var cb = Math.floor(fromCol.b + (toCol.b - fromCol.b) * progress);

      for (var i = 0; i < particles.length; i++) {
        var pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= pt.decay;

        if (pt.life <= 0 || pt.y < -20 || pt.y > H + 20 || pt.x < -20 || pt.x > W + 20) {
          particles[i] = spawnParticle(i % 2 === 0 ? "left" : "right");
          pt = particles[i];
        }

        var pa = envelope * pt.life * 0.9;
        if (pa < 0.02) continue;

        ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + "," + pa + ")";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineWidth = 1.2;
      for (var j = 0; j < streaks.length; j++) {
        var st = streaks[j];
        st.y += st.speed;
        st.life -= 0.02;
        if (st.life <= 0 || st.y < -40 || st.y > H + 40) {
          var leftSide = j % 2 === 0;
          streaks[j] = {
            x: leftSide ? Math.random() * railW : W - railW + Math.random() * railW,
            y: Math.random() * H,
            len: 10 + Math.random() * 26,
            speed: (2 + Math.random() * 4) * (direction > 0 ? 1 : -1),
            life: 0.4 + Math.random() * 0.6,
          };
          st = streaks[j];
        }
        var sa = envelope * st.life * 0.65;
        if (sa < 0.02) continue;
        ctx.strokeStyle = "rgba(" + Math.min(cr + 35, 255) + "," + Math.min(cg + 35, 255) + "," + Math.min(cb + 35, 255) + "," + sa + ")";
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(st.x + (direction > 0 ? 4 : -4), st.y - st.len * direction);
        ctx.stroke();
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }

    requestAnimationFrame(frame);
  }

  sections[0].classList.add("active");
  revealSection(sections[0]);
  applyTheme(0);
  updateUI();

  // ---- Wheel ----
  var lastWheelDir = 0;
  var wheelDebounce = null;

  document.addEventListener("wheel", function (e) {
    e.preventDefault();

    var delta = e.deltaY || e.detail || -e.wheelDelta;
    var dir = delta > 0 ? 1 : delta < 0 ? -1 : 0;

    if (wiperState) {
      updateWiperByWheelDelta(delta);
      return;
    }

    var targetIndex = currentSection + dir;
    if (!isAnimating && dir !== 0 && isWiperPair(currentSection, targetIndex)) {
      startWiperTransition(targetIndex);
      updateWiperByWheelDelta(delta);
      return;
    }

    // Reset if direction changed
    if (dir !== 0 && dir !== lastWheelDir) {
      wheelAccum = 0;
      lastWheelDir = dir;
      clearTimeout(wheelDebounce);
      wheelDebounce = setTimeout(function () { lastWheelDir = 0; }, 400);
    }

    wheelAccum += delta;

    if (wheelAccum > 50) {
      goToSection(currentSection + 1);
      wheelAccum = 0;
      lastWheelDir = 0;
      clearTimeout(wheelDebounce);
    } else if (wheelAccum < -50) {
      goToSection(currentSection - 1);
      wheelAccum = 0;
      lastWheelDir = 0;
      clearTimeout(wheelDebounce);
    }
  }, { passive: false });

  // ---- Keyboard ----
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault(); goToSection(currentSection + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault(); goToSection(currentSection - 1);
    } else if (e.key === "Home") {
      e.preventDefault(); goToSection(0);
    } else if (e.key === "End") {
      e.preventDefault(); goToSection(sections.length - 1);
    }
  });

  // ---- Dots ----
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var target = parseInt(this.getAttribute("data-target"), 10);
      goToSection(target);
    });
  });

  // ---- Nav ----
  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var href = this.getAttribute("href");
      var sectionIndex = 0;
      if (href === "#about") sectionIndex = 1;
      else if (href === "#projects") sectionIndex = 2;
      else if (href === "#notes") sectionIndex = 3;
      else if (href === "#contact") sectionIndex = 4;
      goToSection(sectionIndex);
    });
  });

  // ---- Touch ----
  var touchStartY = 0, touchStartTime = 0;
  var touchStartSection = null;
  document.addEventListener("touchstart", function (e) {
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    touchStartSection = document.querySelector(".scroll-section.active");
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    var deltaY = touchStartY - e.changedTouches[0].clientY;
    var deltaTime = Date.now() - touchStartTime;
    if (Math.abs(deltaY) <= 40 || deltaTime >= 500) return;

    // On mobile, allow reading long content first.
    // Section switching happens only at top/bottom edges.
    if (touchStartSection) {
      var canScroll = touchStartSection.scrollHeight > touchStartSection.clientHeight + 2;
      if (canScroll) {
        var atTop = touchStartSection.scrollTop <= 4;
        var atBottom = touchStartSection.scrollTop + touchStartSection.clientHeight >= touchStartSection.scrollHeight - 4;
        if (deltaY > 0 && !atBottom) return;
        if (deltaY < 0 && !atTop) return;
      }
    }

    if (deltaY > 0) {
      goToSection(currentSection + 1);
    } else {
      goToSection(currentSection - 1);
    }
  }, { passive: true });

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
