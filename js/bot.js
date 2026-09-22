// Simulación local de un "P2" para el modo práctica: no usa red, así que
// duplica a propósito las constantes y la física de Game (mismo look &
// feel) en vez de compartir estado con él. Cada frame, quien lo llama le
// pasa las piedras del rival y el agujero actual, y el bot le devuelve su
// estado con la misma forma que llegaría por PeerJS — así Game no necesita
// saber si el "otro jugador" es una persona real o esto.
window.Bot = (function () {
  const ACELERACION = 900;
  const FRICCION = 3.5;
  const VELOCIDAD_MAX = 260;
  const RADIO_NAVE = 16;
  const RADIO_PIEDRA = 8;
  const VELOCIDAD_PIEDRA = 120;
  const INTERVALO_PIEDRA = 0.8;
  const DURACION_STUN = 3;
  const DISTANCIA_IMPACTO = RADIO_NAVE + RADIO_PIEDRA;
  const DISTANCIA_AGUJERO = RADIO_NAVE + 22;
  const RADIO_PELIGRO = 140; // px: desde acá una piedra empieza a espantar al bot

  let ancho = 0, alto = 0;
  let nave, piedras, siguientePiedra, stunHasta, ultimoReclamoEnviado;

  function crearPiedra() {
    return {
      id: `${Date.now()}-${Math.random()}`,
      x: RADIO_PIEDRA + Math.random() * (ancho - RADIO_PIEDRA * 2),
      y: -RADIO_PIEDRA,
      vx: 0,
      vy: VELOCIDAD_PIEDRA,
      sprite: Math.random() < 0.5 ? 0 : 1,
    };
  }

  function init(anchoCanvas, altoCanvas) {
    ancho = anchoCanvas;
    alto = altoCanvas;
    nave = { x: ancho * 0.7, y: alto * 0.5, vx: 0, vy: 0 };
    piedras = [];
    siguientePiedra = INTERVALO_PIEDRA;
    stunHasta = 0;
    ultimoReclamoEnviado = null;
  }

  function ajustarTamano(anchoCanvas, altoCanvas) {
    ancho = anchoCanvas;
    alto = altoCanvas;
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
  // piedra cercana (propia o rival) y, si no hay peligro, va al agujero.
  function decidirDireccion(piedrasRival, agujero) {
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

    if (agujero) return { x: agujero.x - nave.x, y: agujero.y - nave.y };
    return { x: 0, y: 0 };
  }

  function actualizar(dt, piedrasRival, agujero, reclamar) {
    if (estaAturdido()) {
      nave.vx = 0;
      nave.vy = 0;
    } else {
      const dir = decidirDireccion(piedrasRival, agujero);
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
    nave.x = Math.max(RADIO_NAVE, Math.min(ancho - RADIO_NAVE, nave.x));
    nave.y = Math.max(RADIO_NAVE, Math.min(alto - RADIO_NAVE, nave.y));

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
      }
      piedras = piedras.filter((p) => p.y <= alto + RADIO_PIEDRA);

      for (const p of piedras.concat(piedrasRival)) {
        if (Math.hypot(p.x - nave.x, p.y - nave.y) <= DISTANCIA_IMPACTO) {
          aturdir();
          break;
        }
      }
    }

    if (!estaAturdido() && agujero && ultimoReclamoEnviado !== agujero.id) {
      if (Math.hypot(agujero.x - nave.x, agujero.y - nave.y) <= DISTANCIA_AGUJERO) {
        ultimoReclamoEnviado = agujero.id;
        reclamar(agujero.id);
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

  return { init, ajustarTamano, actualizar, estado };
})();
