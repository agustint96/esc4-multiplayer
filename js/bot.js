// Simulación local de un "P2" para el modo práctica: no usa red, así que
// duplica a propósito las constantes y la física de Game (mismo look &
// feel) en vez de compartir estado con él. Cada frame, quien lo llama le
// pasa las piedras del rival, el par de agujeros y el mundo, y el bot le
// devuelve su estado con la misma forma que llegaría por PeerJS — así Game
// no necesita saber si el "otro jugador" es una persona real o esto.
window.Bot = (function () {
  const ACELERACION = 900;
  const FRICCION = 3.5;
  const VELOCIDAD_MAX = 260;
  const RADIO_NAVE = 16;
  const RADIO_PIEDRA = 10;
  const VELOCIDAD_PIEDRA = 120;
  const INTERVALO_PIEDRA = 0.8;
  const DURACION_STUN = 3;
  const DISTANCIA_IMPACTO = RADIO_NAVE + RADIO_PIEDRA;
  const DISTANCIA_AGUJERO = RADIO_NAVE + 26;
  const RADIO_PELIGRO = 140; // px: desde acá una piedra empieza a espantar al bot

  let mundoAncho = 0, mundoAlto = 0;
  let nave, piedras, siguientePiedra, stunHasta, ultimoReclamoEnviado;

  function generarPuntosPoligono() {
    const n = 6 + Math.floor(Math.random() * 3);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      const r = RADIO_PIEDRA * (0.75 + Math.random() * 0.5);
      pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
    }
    return pts;
  }

  function crearPiedra() {
    return {
      id: `${Date.now()}-${Math.random()}`,
      x: Math.max(0, Math.min(mundoAncho, nave.x + (Math.random() - 0.5) * 500)),
      y: nave.y - 500,
      vx: 0,
      vy: VELOCIDAD_PIEDRA,
      pts: generarPuntosPoligono(),
      ang: Math.random() * Math.PI * 2,
      giro: (Math.random() - 0.5) * 1.5,
    };
  }

  function init(mundo) {
    mundoAncho = mundo.ancho;
    mundoAlto = mundo.alto;
    nave = { x: mundoAncho * 0.6, y: mundoAlto * 0.5, vx: 0, vy: 0 };
    piedras = [];
    siguientePiedra = INTERVALO_PIEDRA;
    stunHasta = 0;
    ultimoReclamoEnviado = null;
  }

  function teletransportar(x, y) {
    nave.x = x;
    nave.y = y;
    nave.vx = 0;
    nave.vy = 0;
  }

  function estaAturdido() {
    return performance.now() < stunHasta;
  }

  function aturdir() {
    stunHasta = performance.now() + DURACION_STUN * 1000;
    nave.vx = 0;
    nave.vy = 0;
    piedras = [];
    siguientePiedra = INTERVALO_PIEDRA;
  }

  // Esquivar pesa más que ir al agujero: suma un vector de "huida" por cada
  // piedra cercana (propia o rival) y, si no hay peligro, va al agujero más
  // cercano de los dos del par.
  function decidirDireccion(piedrasRival, agujeros) {
    let dx = 0, dy = 0;

    for (const p of piedras) sumarHuida(p);
    for (const p of piedrasRival) sumarHuida(p);

    function sumarHuida(p) {
      const ddx = nave.x - p.x, ddy = nave.y - p.y;
      const dist = Math.hypot(ddx, ddy) || 1;
      if (dist >= RADIO_PELIGRO) return;
      const peso = (RADIO_PELIGRO - dist) / RADIO_PELIGRO;
      dx += (ddx / dist) * peso;
      dy += (ddy / dist) * peso;
    }

    if (Math.hypot(dx, dy) > 0.15) return { x: dx, y: dy };

    if (agujeros && agujeros.length) {
      let cercano = agujeros[0];
      let distMin = Math.hypot(cercano.x - nave.x, cercano.y - nave.y);
      for (const a of agujeros.slice(1)) {
        const d = Math.hypot(a.x - nave.x, a.y - nave.y);
        if (d < distMin) { cercano = a; distMin = d; }
      }
      return { x: cercano.x - nave.x, y: cercano.y - nave.y };
    }
    return { x: 0, y: 0 };
  }

  function actualizar(dt, piedrasRival, agujeros, reclamar) {
    if (estaAturdido()) {
      nave.vx = 0;
      nave.vy = 0;
    } else {
      const dir = decidirDireccion(piedrasRival, agujeros);
      const mag = Math.hypot(dir.x, dir.y);
      if (mag > 0.001) {
        nave.vx += (dir.x / mag) * ACELERACION * dt;
        nave.vy += (dir.y / mag) * ACELERACION * dt;
      }
    }

    const frenado = Math.max(0, 1 - FRICCION * dt);
    nave.vx *= frenado;
    nave.vy *= frenado;

    const vel = Math.hypot(nave.vx, nave.vy);
    if (vel > VELOCIDAD_MAX) {
      nave.vx = (nave.vx / vel) * VELOCIDAD_MAX;
      nave.vy = (nave.vy / vel) * VELOCIDAD_MAX;
    }

    nave.x += nave.vx * dt;
    nave.y += nave.vy * dt;
    nave.x = Math.max(RADIO_NAVE, Math.min(mundoAncho - RADIO_NAVE, nave.x));
    nave.y = Math.max(RADIO_NAVE, Math.min(mundoAlto - RADIO_NAVE, nave.y));

    if (!estaAturdido()) {
      siguientePiedra -= dt;
      if (siguientePiedra <= 0) {
        piedras.push(crearPiedra());
        siguientePiedra = INTERVALO_PIEDRA;
      }
      for (const piedra of piedras) {
        const diferenciaX = nave.x - piedra.x;
        piedra.vx = Math.max(-90, Math.min(90, diferenciaX * 2.2));
        piedra.vy = VELOCIDAD_PIEDRA;
        piedra.x += piedra.vx * dt;
        piedra.y += piedra.vy * dt;
        piedra.ang += piedra.giro * dt;
      }
      piedras = piedras.filter((p) => p.y <= nave.y + 600);

      for (const p of piedras.concat(piedrasRival)) {
        if (Math.hypot(p.x - nave.x, p.y - nave.y) <= DISTANCIA_IMPACTO) {
          aturdir();
          break;
        }
      }
    }

    if (!estaAturdido() && agujeros && agujeros.length) {
      const tocado = agujeros.find((a) => Math.hypot(a.x - nave.x, a.y - nave.y) <= DISTANCIA_AGUJERO);
      if (tocado && ultimoReclamoEnviado !== tocado.id) {
        ultimoReclamoEnviado = tocado.id;
        reclamar(tocado.id);
      }
    }
  }

  function estado() {
    const ahora = performance.now();
    return {
      tipo: "estado",
      x: nave.x,
      y: nave.y,
      t: ahora,
      piedras,
      stunRestante: Math.max(0, stunHasta - ahora),
    };
  }

  return { init, teletransportar, actualizar, estado };
})();
