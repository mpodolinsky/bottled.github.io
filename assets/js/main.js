// Animated logo and wordmark. The motion is a pure function of time, so index.html?t=3 freezes it at second 3
// (used to check single frames); no motion with prefers-reduced-motion. The page works without this script.
(() => {
  const svg = document.querySelector(".logo");
  const mark = document.querySelector(".wordmark");
  if (!svg || !mark) return;
  const water = svg.querySelector(".water");
  const ship = svg.querySelector(".ship");
  const bolt = svg.querySelector(".bolt");
  const cloud = svg.querySelector(".cloud");
  const letters = [...mark.querySelectorAll(".ch")];
  const CYCLE = 7;                     // calm, a storm builds inside the bottle, calm again
  const BASE = 206, K = 0.075;         // water level and wave number (per svg unit)
  const bump = (x) => { x = Math.min(1, Math.max(0, x)); return Math.sin(Math.PI * x) ** 2; };

  const draw = (time) => {
    const c = time % CYCLE;
    const storm = bump((c - 2.0) / 3.0);                 // 0 .. 1 .. 0
    const A = 2.4 + 5.5 * storm;                         // wave height
    const phase = time * (2.0 + 1.6 * storm);
    let d = `M 0 270 L 0 ${BASE + A * Math.sin(phase)}`;
    for (let x = 4; x <= 200; x += 4) d += ` L ${x} ${(BASE + A * Math.sin(K * x + phase)).toFixed(2)}`;
    water.setAttribute("d", d + " L 200 270 Z");
    // the ship rides the wave under its keel
    const arg = K * 100 + phase;
    const y = BASE + A * Math.sin(arg);
    const slope = Math.max(-24, Math.min(24, Math.atan(A * K * Math.cos(arg)) * 180 / Math.PI));
    ship.setAttribute("transform", `translate(100 ${(y + 3).toFixed(2)}) rotate(${(slope + storm * 4 * Math.sin(time * 3.1)).toFixed(2)})`);
    // clouds gather and lightning flashes twice in the middle of the storm
    cloud.style.opacity = (0.15 + 0.85 * Math.min(1, storm * 1.6)).toFixed(2);
    const flash = [3.4, 3.75].some((t0) => c > t0 && c < t0 + 0.1);
    bolt.style.opacity = flash ? 1 : 0;
    // the letters float on the same waves
    letters.forEach((el, i) => {
      el.style.transform = `translateY(${(-0.045 * (0.5 + storm * 1.4) * Math.sin(phase * 0.9 - i * 0.85)).toFixed(4)}em)`;
    });
  };

  const frozen = new URLSearchParams(location.search).get("t");
  if (frozen !== null) { draw(Number(frozen)); return; }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { draw(0); return; }
  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(svg);
  const start = performance.now();
  const frame = (now) => {
    if (visible && !document.hidden) draw((now - start) / 1000);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
