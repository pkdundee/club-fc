// Club FC art tool: paints a plain white water tower in a school's colours, with its initials wrapped round the tank.
// One image per tier, so no per-school art is needed. Positions are measured on the tower_1 to tower_5 images.
(function () {
  // tank sides, top and bottom of the tank at its side and centre, the roof's top, and the letters' height and size
  const T = {
    1: { l: 311, r: 709, ts: 265, tc: 318, bs: 400, bc: 470, roof: 150, ly: 385, fs: 92 },
    2: { l: 317, r: 706, ts: 268, tc: 340, bs: 450, bc: 518, roof: 175, ly: 432, fs: 104 },
    3: { l: 335, r: 687, ts: 245, tc: 303, bs: 455, bc: 515, roof: 170, ly: 412, fs: 96 },
    4: { l: 340, r: 684, ts: 380, tc: 430, bs: 525, bc: 583, roof: 300, ly: 505, fs: 96 },
    5: { l: 340, r: 684, ts: 365, tc: 412, bs: 510, bc: 570, roof: 290, ly: 490, fs: 96 }
  };
  const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; };
  const lum = c => .3 * c[0] + .59 * c[1] + .11 * c[2];
  // fit: { k, ox, oy } when the picture was cropped at (ox, oy) and scaled by k (the game's small copies, 9q)
  window.paintTower = function (img, tier, c1, c2, abbr, fit) {
    const P0 = T[tier], f = fit || { k: 1, ox: 0, oy: 0 }, X = v => (v - f.ox) * f.k, Y = v => (v - f.oy) * f.k;
    const P = { l: X(P0.l), r: X(P0.r), ts: Y(P0.ts), tc: Y(P0.tc), bs: Y(P0.bs), bc: Y(P0.bc), roof: Math.max(0, Math.floor(Y(P0.roof))), ly: Y(P0.ly), fs: P0.fs * f.k }, W = img.naturalWidth || img.width, H = img.naturalHeight || img.height, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    const I = g.getImageData(0, 0, W, H), d = I.data, A = hex(c1), B = hex(c2), cx = (P.l + P.r) / 2, hw = (P.r - P.l) / 2;
    const curve = (x, side, centre) => { const u = (x - cx) / hw; return side + (centre - side) * Math.sqrt(Math.max(0, 1 - u * u)); };
    for (let y = P.roof; y < Math.min(H, P.bc + 4); y++) for (let x = Math.max(0, Math.floor(P.l - 45 * f.k)); x < Math.min(W, P.r + 45 * f.k); x++) {
      const k = (y * W + x) * 4; if (d[k + 3] < 30) continue;
      const v = (d[k] + d[k + 1] + d[k + 2]) / 3, s = Math.max(d[k], d[k + 1], d[k + 2]) - Math.min(d[k], d[k + 1], d[k + 2]);
      const inX = x >= P.l && x <= P.r, top = inX ? curve(x, P.ts, P.tc) : 1e9, bot = inX ? curve(x, P.bs, P.bc) : -1;
      if (inX && y >= top + 3 * f.k && y <= bot) {            // the tank: only pale paint, so the dark railing in front stays as it is
        if (v > 118) { const f = Math.min(1, v / 205); for (let i = 0; i < 3; i++) d[k + i] = A[i] * f; }
      } else if (y < (inX ? top + 3 * f.k : P.ts + 22 * f.k)) {      // the roof, keeping its light and shade
        if (s < 110) { const f = Math.min(1.1, v / 150); for (let i = 0; i < 3; i++) d[k + i] = Math.min(255, B[i] * f); }
      }
    }
    g.putImageData(I, 0, 0);
    // letters, squeezed and placed as if on the curved tank, clipped to it
    const ink = Math.abs(lum(A) - lum(B)) < 90 ? '#ffffff' : c2, L = abbr.split(''), span = L.length > 2 ? 1.05 : .7, r = hw * .86;
    g.save(); g.font = `900 ${P.fs}px Graduate,Georgia,serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    L.forEach((ch, i) => { const a = (L.length > 1 ? i / (L.length - 1) - .5 : 0) * span, x = cx + Math.sin(a) * r, y = P.ly + (1 - Math.cos(a)) * (P.tc - P.ts) * .9; g.save(); g.translate(x, y); g.scale(Math.cos(a), 1); g.lineWidth = 6 * f.k; g.strokeStyle = 'rgba(0,0,0,.28)'; g.strokeText(ch, 0, 0); g.fillStyle = ink; g.fillText(ch, 0, 0); g.restore(); });
    g.restore(); return c;
  };
})();
