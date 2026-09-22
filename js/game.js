// Simula las naves y la lluvia de piedras de cada jugador. Cada cliente es
// dueño de su lluvia y comparte sus posiciones con el otro jugador.
window.Game = (function () {
  const ACELERACION = 900; // px/s² del mundo
  const FRICCION = 3.5; // 1/s: qué tan rápido frena al soltar las teclas
  const VELOCIDAD_MAX = 260; // px/s
  const RADIO_NAVE = 16; // px, para colisión futura (choque y piedras)
  const RADIO_PIEDRA = 8;
  const VELOCIDAD_PIEDRA = 120;
  const INTERVALO_PIEDRA = 0.8;
  const DURACION_STUN = 3;
  const DISTANCIA_IMPACTO = RADIO_NAVE + RADIO_PIEDRA;
  const RADIO_AGUJERO = 22;
  const DISTANCIA_AGUJERO = RADIO_NAVE + RADIO_AGUJERO;
  const MARGEN_AGUJERO = RADIO_AGUJERO + 20; // px: no aparece pegado al borde
  const GOLES_PARA_GANAR = 10; // cuenta ascendente (1..10), al revés del contador regresivo del single-player
  const SUAVIZADO_REMOTO = 12; // 1/s: qué tan rápido sigue la nave remota al último dato

  const COLOR = { p1: "#4d9dff", p2: "#f15a5a" };

  const MAPA_TECLAS = {
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
  };

  let canvas, ctx;
  let ancho = 0, alto = 0;
  let soyP1 = true;
  let local, remoto, remotoObjetivo;
  let piedras = [];
  let piedrasRemotas = [];
  let siguientePiedra = 0;
  let stunHasta = 0;
  let stunRemotoHasta = 0;
  let agujero = null; // { id, x, y } — autoridad es siempre P1 (host)
  let puntajes = { p1: 0, p2: 0 };
  let ganador = null; // null | "p1" | "p2"
  let ultimoReclamoEnviado = null;
  let ultimoTs = null;

  const teclas = { up: false, down: false, left: false, right: false };

  function crearNave(x, y) {
    return { x, y, vx: 0, vy: 0 };
  }

  function crearPiedra() {
    return {
      id: `${Date.now()}-${Math.random()}`,
      x: RADIO_PIEDRA + Math.random() * (ancho - RADIO_PIEDRA * 2),
      y: -RADIO_PIEDRA,
      vx: 0,
      vy: VELOCIDAD_PIEDRA,
    };
  }

  function estaAturdida() {
    return performance.now() < stunHasta;
  }

  function aturdir() {
    stunHasta = performance.now() + DURACION_STUN * 1000;
    local.vx = 0;
    local.vy = 0;
    piedras = [];
    siguientePiedra = INTERVALO_PIEDRA;
  }

  function moverPiedras(dt) {
    if (estaAturdida()) return;

    siguientePiedra -= dt;
    if (siguientePiedra <= 0) {
      piedras.push(crearPiedra());
      siguientePiedra = INTERVALO_PIEDRA;
    }

    for (const piedra of piedras) {
      const diferenciaX = local.x - piedra.x;
      piedra.vx = Math.max(-90, Math.min(90, diferenciaX * 2.2));
      piedra.vy = VELOCIDAD_PIEDRA;
      piedra.x += piedra.vx * dt;
      piedra.y += piedra.vy * dt;
    }

    piedras = piedras.filter((piedra) => {
      const golpeaLocal = Math.hypot(piedra.x - local.x, piedra.y - local.y) <= DISTANCIA_IMPACTO;
      if (golpeaLocal) aturdir();
      return !golpeaLocal && piedra.y <= alto + RADIO_PIEDRA;
    });
  }

  function detectarImpactoRemoto() {
    if (estaAturdida()) return; // invulnerable mientras dura el propio stun
    if (performance.now() < stunRemotoHasta) return;
    for (const piedra of piedrasRemotas) {
      if (Math.hypot(piedra.x - local.x, piedra.y - local.y) <= DISTANCIA_IMPACTO) {
        aturdir();
        return;
      }
    }
  }

  // El agujero negro y el marcador los maneja siempre P1 (host): genera la
  // posición, decide quién llegó primero y lo reparte por red. P2 solo avisa
  // "lo toqué" y espera que el host confirme — así no hay que sincronizar
  // relojes entre los dos clientes para saber quién llegó antes.
  function generarAgujero() {
    return {
      id: `${Date.now()}-${Math.random()}`,
      x: MARGEN_AGUJERO + Math.random() * (ancho - MARGEN_AGUJERO * 2),
      y: MARGEN_AGUJERO + Math.random() * (alto - MARGEN_AGUJERO * 2),
    };
  }

  function resolverReclamo(jugador) {
    if (ganador || !agujero) return;
    puntajes[jugador] += 1;
    if (puntajes[jugador] >= GOLES_PARA_GANAR) {
      ganador = jugador;
      agujero = null;
    } else {
      agujero = generarAgujero();
    }
  }

  function recibirReclamo({ jugador, agujeroId }) {
    if (!soyP1) return; // solo el host resuelve
    if (!agujero || agujero.id !== agujeroId || ganador) return;
    resolverReclamo(jugador);
  }

  function detectarAgujero() {
    if (!agujero || ganador || estaAturdida()) return;
    if (Math.hypot(agujero.x - local.x, agujero.y - local.y) > DISTANCIA_AGUJERO) return;

    const miJugador = soyP1 ? "p1" : "p2";
    if (soyP1) {
      resolverReclamo(miJugador);
    } else if (ultimoReclamoEnviado !== agujero.id) {
      ultimoReclamoEnviado = agujero.id;
      Net.enviar({ tipo: "reclamo", jugador: miJugador, agujeroId: agujero.id });
    }
  }

  function init(canvasEl, esP1) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    soyP1 = esP1;

    ajustarTamano();
    window.addEventListener("resize", ajustarTamano);
    window.addEventListener("keydown", (ev) => cambiarTecla(ev, true));
    window.addEventListener("keyup", (ev) => cambiarTecla(ev, false));

    local = crearNave(ancho * (soyP1 ? 0.3 : 0.7), alto * 0.5);
    remoto = crearNave(ancho * (soyP1 ? 0.7 : 0.3), alto * 0.5);
    remotoObjetivo = { x: remoto.x, y: remoto.y };

    if (soyP1) agujero = generarAgujero();
  }

  function ajustarTamano() {
    ancho = canvas.clientWidth || window.innerWidth;
    alto = canvas.clientHeight || window.innerHeight;
    canvas.width = ancho;
    canvas.height = alto;
  }

  function cambiarTecla(ev, valor) {
    const accion = MAPA_TECLAS[ev.key];
    if (!accion) return;
    teclas[accion] = valor;
    ev.preventDefault();
  }

  function actualizar(dt) {
    if (ganador) return; // congela todo al terminar la partida

    let ax = 0, ay = 0;
    if (teclas.up) ay -= 1;
    if (teclas.down) ay += 1;
    if (teclas.left) ax -= 1;
    if (teclas.right) ax += 1;
    if (ax || ay) {
      const mag = Math.hypot(ax, ay);
      ax = (ax / mag) * ACELERACION;
      ay = (ay / mag) * ACELERACION;
    }

    if (estaAturdida()) {
      local.vx = 0;
      local.vy = 0;
    } else {
      local.vx += ax * dt;
      local.vy += ay * dt;
    }

    const frenado = Math.max(0, 1 - FRICCION * dt);
    local.vx *= frenado;
    local.vy *= frenado;

    const vel = Math.hypot(local.vx, local.vy);
    if (vel > VELOCIDAD_MAX) {
      local.vx = (local.vx / vel) * VELOCIDAD_MAX;
      local.vy = (local.vy / vel) * VELOCIDAD_MAX;
    }

    local.x += local.vx * dt;
    local.y += local.vy * dt;
    local.x = Math.max(RADIO_NAVE, Math.min(ancho - RADIO_NAVE, local.x));
    local.y = Math.max(RADIO_NAVE, Math.min(alto - RADIO_NAVE, local.y));

    const t = Math.min(1, SUAVIZADO_REMOTO * dt);
    remoto.x += (remotoObjetivo.x - remoto.x) * t;
    remoto.y += (remotoObjetivo.y - remoto.y) * t;

    moverPiedras(dt);
    detectarImpactoRemoto();
    detectarAgujero();
  }

  function recibirEstadoRemoto(estado) {
    remotoObjetivo.x = estado.x;
    remotoObjetivo.y = estado.y;
    piedrasRemotas = Array.isArray(estado.piedras) ? estado.piedras : [];
    if (estado.stunRestante > 0) {
      stunRemotoHasta = performance.now() + estado.stunRestante;
    } else {
      stunRemotoHasta = 0;
    }
    // El host manda el estado autoritativo del agujero/marcador; el que se
    // une solo lo recibe y lo pinta, nunca lo decide por su cuenta.
    if (!soyP1 && estado.agujero !== undefined) {
      agujero = estado.agujero;
      puntajes = estado.puntajes || puntajes;
      ganador = estado.ganador || null;
    }
  }

  function estadoLocal() {
    const ahora = performance.now();
    const estado = {
      tipo: "estado",
      x: local.x,
      y: local.y,
      t: ahora,
      piedras,
      stunRestante: Math.max(0, stunHasta - ahora),
    };
    if (soyP1) {
      estado.agujero = agujero;
      estado.puntajes = puntajes;
      estado.ganador = ganador;
    }
    return estado;
  }

  function dibujarNave(n, color) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, RADIO_NAVE, 0, Math.PI * 2);
    ctx.fillStyle = "#0d1b2e";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function dibujarPiedras(lista, color) {
    for (const piedra of lista) {
      ctx.beginPath();
      ctx.arc(piedra.x, piedra.y, RADIO_PIEDRA, 0, Math.PI * 2);
      ctx.fillStyle = "#05070b";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  function dibujarAgujero(a) {
    const brillo = ctx.createRadialGradient(a.x, a.y, 1, a.x, a.y, RADIO_AGUJERO);
    brillo.addColorStop(0, "#000000");
    brillo.addColorStop(1, "#1a2436");
    ctx.beginPath();
    ctx.arc(a.x, a.y, RADIO_AGUJERO, 0, Math.PI * 2);
    ctx.fillStyle = brillo;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#f19280";
    ctx.stroke();
  }

  function dibujarPuntaje() {
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = COLOR.p1;
    ctx.fillText(`P1: ${puntajes.p1}`, 12, 12);
    ctx.textAlign = "right";
    ctx.fillStyle = COLOR.p2;
    ctx.fillText(`P2: ${puntajes.p2}`, ancho - 12, 12);
  }

  function dibujarGanador() {
    ctx.fillStyle = "rgba(5, 10, 20, 0.75)";
    ctx.fillRect(0, 0, ancho, alto);
    ctx.textAlign = "center";
    ctx.fillStyle = ganador === "p1" ? COLOR.p1 : COLOR.p2;
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`Ganó ${ganador.toUpperCase()}`, ancho / 2, alto / 2 - 8);
    ctx.fillStyle = "#eaf0fb";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Recargá la página para jugar de nuevo", ancho / 2, alto / 2 + 20);
  }

  function dibujar() {
    ctx.fillStyle = "#0d1b2e";
    ctx.fillRect(0, 0, ancho, alto);

    if (agujero) dibujarAgujero(agujero);
    dibujarPiedras(piedras, soyP1 ? COLOR.p1 : COLOR.p2);
    dibujarPiedras(piedrasRemotas, soyP1 ? COLOR.p2 : COLOR.p1);
    if (!estaAturdida()) dibujarNave(local, soyP1 ? COLOR.p1 : COLOR.p2);
    if (performance.now() >= stunRemotoHasta) {
      dibujarNave(remoto, soyP1 ? COLOR.p2 : COLOR.p1);
    }
    dibujarPuntaje();
    if (ganador) dibujarGanador();
  }

  let alPrincipioDeFrame = null;

  function loop(ts) {
    if (ultimoTs === null) ultimoTs = ts;
    const dt = Math.min(0.05, (ts - ultimoTs) / 1000);
    ultimoTs = ts;

    // Hook para el modo práctica: el bot corre su propia simulación acá,
    // antes de que Game use sus piedras/agujero, y sin pasar por la red.
    if (alPrincipioDeFrame) alPrincipioDeFrame(dt);

    actualizar(dt);
    dibujar();

    requestAnimationFrame(loop);
  }

  function iniciarLoop(hook) {
    alPrincipioDeFrame = hook || null;
    requestAnimationFrame(loop);
  }

  function piedrasPropias() {
    return piedras;
  }

  function agujeroActual() {
    return agujero;
  }

  function puntajesActuales() {
    return puntajes;
  }

  return {
    init,
    iniciarLoop,
    estadoLocal,
    recibirEstadoRemoto,
    recibirReclamo,
    piedrasPropias,
    agujeroActual,
    puntajesActuales,
  };
})();
