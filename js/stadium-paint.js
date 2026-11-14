// Club FC art tool: repaints the Stadium's blue seats, roofs and trim in a school's main colour, keeping the drawn light and shade.
// One set of Stadium art then works for every school. Only strong, saturated blues change; grey-blue glass and dark shadow stay.
(function () {
  const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; };
  const hsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return [0, 0, l]; const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return [h, s, l]; };
  // weight 0..1: how surely this pixel is "club blue"
  const blueness = (h, s, l) => { if (l < .08 || l > .9) return 0; const dh = Math.abs(h - 222), wh = dh < 22 ? 1 : dh < 34 ? 1 - (dh - 22) / 12 : 0; const ws = s < .32 ? 0 : s < .45 ? (s - .32) / .13 : 1; return wh * ws; };
  window.paintStadium = function (src, c1) {
    const W = src.width || src.naturalWidth, H = src.height || src.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(src, 0, 0); const I = g.getImageData(0, 0, W, H), d = I.data, T0 = hex(c1), LT0 = hsl(...T0)[2], T = LT0 > .72 ? T0.map(v => v * .72 / LT0) : T0;   // very pale colours (white, sky blue) are toned down a little so the seats keep their shading
    const L0 = .42;   // typical lightness of the drawn blue
    for (let k = 0; k < d.length; k += 4) { if (d[k + 3] < 10) continue; const [h, s, l] = hsl(d[k], d[k + 1], d[k + 2]), w = blueness(h, s, l); if (!w) continue;
      // same relative brightness as the original blue, centred on the school colour; highlights lift towards white, shadows fall towards black
      const f = l / L0; let n;
      if (f <= 1) n = T.map(v => v * f); else { const u = Math.min(1, (f - 1) / ((1 - L0) / L0)); n = T.map(v => v + (255 - v) * u * .85); }
      for (let i = 0; i < 3; i++) d[k + i] = d[k + i] * (1 - w) + n[i] * w; }
    g.putImageData(I, 0, 0); return c; };
})();
