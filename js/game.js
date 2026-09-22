// Motor del juego: mundo grande (no una cancha chica) con una cámara que
// hace zoom centrado en TU nave, como el escenario 4 real — ahí el "zoom"
// es un pivote de escala alrededor de la nave, sin ningún seguimiento
// explícito; acá centramos directamente la nave en pantalla, que es lo
// mismo pero sin necesitar el sistema de mouse-follow del sitio original.
//
// Lo que se porta del juego real: la fórmula exacta de puntería/compromiso
// de las piedras (polígonos negros, no sprites de asteroide — esos .webp no
// los usa el juego real para nada) y los agujeros de gusano de a pares con
// teletransporte al entrar. Lo que NO se porta (es narrativo, no motor):
// intro/final con navecitas, tutorial, colorimetría progresiva de la nave,
// audio, filtros SVG.
window.Game = (function () {
  const ZOOM = 1.5; // GAME_CAMERA_ZOOM del sitio original
  const MUNDO_ANCHO = 2600;
  const MUNDO_ALTO = 1900;

  const ACELERACION = 900; // px/s² del mundo
  const FRICCION = 3.5; // 1/s: qué tan rápido frena al soltar las teclas
  const VELOCIDAD_MAX = 260; // px/s
  const RADIO_NAVE = 16;

  const RADIO_PIEDRA = 10;
  const VELOCIDAD_PIEDRA = 120;
  const INTERVALO_PIEDRA = 0.8;
  const DISTANCIA_IMPACTO = RADIO_NAVE + RADIO_PIEDRA;
  // Puntería/compromiso — misma fórmula y mismos números que crearPoligono/
  // actualizar() en esc4-game.js (líneas ~328-339 y ~2118-2139).
  const PUNTERIA = 0.85; // fracción de piedras que nacen apuntadas
  const PUNTERIA_ANCHO = 200; // px del mundo, dispersión al nacer
  const COMPROMISO = 110; // px del mundo sobre la nave: deja de corregir
  const BUSQUEDA_BASE = 0.6;
  const BUSQUEDA_MAX = 0.5; // desvío horizontal máx., como fracción de vy
  const BUSQUEDA_AGIL = 1.5; // 1/s, qué tan rápido corrige rumbo

  const DURACION_STUN = 3;

  const RADIO_AGUJERO = 26; // CUMULO_RADIO del original
  const DISTANCIA_AGUJERO = RADIO_NAVE + RADIO_AGUJERO;
  const DISTANCIA_MIN_PAR = 260; // CUMULO_DISTANCIA_PAR
  const MARGEN_AGUJERO = RADIO_AGUJERO + 20;
  const GIRO_AGUJERO = 9; // rad/s, CUMULO_GIRO — el anillo interior gira al revés y 1.7x más rápido
  const GOLES_PARA_GANAR = 10;

  const SUAVIZADO_REMOTO = 12; // 1/s: qué tan rápido sigue la nave remota al último dato
  const SALTO_TELETRANSPORTE = 150; // px: si el rival salta más que esto, no desliza — aparece

  const COLOR = { p1: "#7eb8c9", p2: "#e2555f" };

  const imgNave = new Image();
  imgNave.src = "assets/cohete.webp";
  const imgFondo = new Image();
  imgFondo.src = "assets/fondo-estrellado.webp";

  const MAPA_TECLAS = {
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
  };

  let canvas, ctx;
  let dpr = 1;
  let viewportAncho = 0, viewportAlto = 0;
  let soyP1 = true;
  let local, remoto, remotoObjetivo;
  let piedras = [];
  let piedrasRemotas = [];
  let siguientePiedra = 0;
  let stunHasta = 0;
  let stunRemotoHasta = 0;
  let agujeros = []; // [] o [ {id,x,y}, {id,x,y} ] — par, autoridad P1
  let giroAgujeros = 0;
  let puntajes = { p1: 0, p2: 0 };
  let ganador = null; // null | "p1" | "p2"
  let ultimoReclamoEnviado = null;
  let ultimoTs = null;
  let onTeletransportarRival = null;

  const teclas = { up: false, down: false, left: false, right: false };

  function clampMundoX(v) {
    return Math.max(MARGEN_AGUJERO, Math.min(MUNDO_ANCHO - MARGEN_AGUJERO, v));
  }
  function clampMundoY(v) {
    return Math.max(MARGEN_AGUJERO, Math.min(MUNDO_ALTO - MARGEN_AGUJERO, v));
  }

  function crearNave(x, y) {
    return { x, y, vx: 0, vy: 0 };
  }

  // Polígono irregular (6-8 lados), como los que caen en el juego real —
  // no es un sprite, son puntos relativos al centro de la piedra.
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
    const anchoVista = viewportAncho / ZOOM;
    const puntada = Math.random() < PUNTERIA;
    const x = puntada
      ? local.x + (Math.random() - 0.5) * PUNTERIA_ANCHO
      : local.x + (Math.random() - 0.5) * anchoVista;
    return {
      id: `${Date.now()}-${Math.random()}`,
      x: Math.max(0, Math.min(MUNDO_ANCHO, x)),
      y: local.y - viewportAlto / ZOOM / 2 - RADIO_PIEDRA * 2,
      vx: 0,
      vy: VELOCIDAD_PIEDRA,
      pts: generarPuntosPoligono(),
      ang: Math.random() * Math.PI * 2,
      giro: (Math.random() - 0.5) * 1.5,
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
      let objetivoVx = piedra.vx;
      if (piedra.y < local.y - COMPROMISO) {
        const max = piedra.vy * BUSQUEDA_MAX * BUSQUEDA_BASE;
        objetivoVx = Math.max(-max, Math.min(max, (local.x - piedra.x) * 2));
      } else if (piedra.y >= local.y) {
        objetivoVx = 0;
      }
      // dentro de la ventana de COMPROMISO: objetivoVx queda en piedra.vx (no cambia)
      piedra.vx += (objetivoVx - piedra.vx) * Math.min(1, dt * BUSQUEDA_AGIL);
      piedra.x += piedra.vx * dt;
      piedra.y += piedra.vy * dt;
      piedra.ang += piedra.giro * dt;
    }

    const limiteInferior = local.y + viewportAlto / ZOOM / 2 + RADIO_PIEDRA * 2;
    piedras = piedras.filter((piedra) => {
      const golpeaLocal = Math.hypot(piedra.x - local.x, piedra.y - local.y) <= DISTANCIA_IMPACTO;
      if (golpeaLocal) aturdir();
      return !golpeaLocal && piedra.y <= limiteInferior;
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

  // Agujeros de gusano: nacen de a pares, autoridad siempre en P1 (host).
  // Entrar a cualquiera de los dos suma el gol y teletransporta a quien
  // entró hasta la posición del otro agujero del par, como en el juego real.
  function generarPar() {
    const anchoVista = viewportAncho / ZOOM;
    const altoVista = viewportAlto / ZOOM;
    const a = {
      id: `${Date.now()}-${Math.random()}-a`,
      x: clampMundoX(local.x + (Math.random() - 0.5) * anchoVista * 1.3),
      y: clampMundoY(local.y + (Math.random() - 0.5) * altoVista * 1.3),
    };
    let b = null;
    for (let intento = 0; intento < 12; intento++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = DISTANCIA_MIN_PAR + Math.random() * DISTANCIA_MIN_PAR * 0.6;
      const bx = clampMundoX(a.x + Math.cos(ang) * dist);
      const by = clampMundoY(a.y + Math.sin(ang) * dist);
      if (Math.hypot(bx - a.x, by - a.y) >= DISTANCIA_MIN_PAR * 0.8) {
        b = { id: `${Date.now()}-${Math.random()}-b`, x: bx, y: by };
        break;
      }
    }
    if (!b) {
      b = { id: `${Date.now()}-${Math.random()}-b`, x: clampMundoX(a.x + DISTANCIA_MIN_PAR), y: a.y };
    }
    return [a, b];
  }

  function resolverReclamo(jugador, agujeroId) {
    if (ganador || agujeros.length < 2) return;
    const tocado = agujeros.find((a) => a.id === agujeroId);
    if (!tocado) return; // ya viejo/resuelto
    const pareja = agujeros.find((a) => a.id !== agujeroId);

    puntajes[jugador] += 1;
    const destino = { x: pareja.x, y: pareja.y };

    if (puntajes[jugador] >= GOLES_PARA_GANAR) {
      ganador = jugador;
      agujeros = [];
    } else {
      agujeros = generarPar();
    }

    const miJugador = soyP1 ? "p1" : "p2";
    if (jugador === miJugador) {
      local.x = destino.x;
      local.y = destino.y;
    } else if (onTeletransportarRival) {
      onTeletransportarRival(destino.x, destino.y);
    }
  }

  function recibirReclamo({ jugador, agujeroId }) {
    if (!soyP1) return; // solo el host resuelve
    if (ganador || agujeros.length < 2) return;
    resolverReclamo(jugador, agujeroId);
  }

  function recibirTeletransporte({ x, y }) {
    local.x = x;
    local.y = y;
  }

  function detectarAgujero() {
    if (agujeros.length < 2 || ganador || estaAturdida()) return;
    const tocado = agujeros.find((a) => Math.hypot(a.x - local.x, a.y - local.y) <= DISTANCIA_AGUJERO);
    if (!tocado) return;

    const miJugador = soyP1 ? "p1" : "p2";
    if (soyP1) {
      resolverReclamo(miJugador, tocado.id);
    } else if (ultimoReclamoEnviado !== tocado.id) {
      ultimoReclamoEnviado = tocado.id;
      Net.enviar({ tipo: "reclamo", jugador: miJugador, agujeroId: tocado.id });
    }
  }

  function init(canvasEl, esP1, alTeletransportarRival) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    soyP1 = esP1;
    onTeletransportarRival = alTeletransportarRival || null;

    ajustarTamano();
    window.addEventListener("resize", ajustarTamano);
    window.addEventListener("keydown", (ev) => cambiarTecla(ev, true));
    window.addEventListener("keyup", (ev) => cambiarTecla(ev, false));

    local = crearNave(MUNDO_ANCHO * (soyP1 ? 0.4 : 0.6), MUNDO_ALTO * 0.5);
    remoto = crearNave(MUNDO_ANCHO * (soyP1 ? 0.6 : 0.4), MUNDO_ALTO * 0.5);
    remotoObjetivo = { x: remoto.x, y: remoto.y };

    if (soyP1) agujeros = generarPar();
  }

  function ajustarTamano() {
    dpr = window.devicePixelRatio || 1;
    viewportAncho = window.innerWidth;
    viewportAlto = window.innerHeight;
    canvas.width = viewportAncho * dpr;
    canvas.height = viewportAlto * dpr;
    canvas.style.width = viewportAncho + "px";
    canvas.style.height = viewportAlto + "px";
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
    local.x = Math.max(RADIO_NAVE, Math.min(MUNDO_ANCHO - RADIO_NAVE, local.x));
    local.y = Math.max(RADIO_NAVE, Math.min(MUNDO_ALTO - RADIO_NAVE, local.y));

    const t = Math.min(1, SUAVIZADO_REMOTO * dt);
    remoto.x += (remotoObjetivo.x - remoto.x) * t;
    remoto.y += (remotoObjetivo.y - remoto.y) * t;

    giroAgujeros += GIRO_AGUJERO * dt;

    moverPiedras(dt);
    detectarImpactoRemoto();
    detectarAgujero();
  }

  function recibirEstadoRemoto(estado) {
    const salto = Math.hypot(estado.x - remotoObjetivo.x, estado.y - remotoObjetivo.y);
    remotoObjetivo.x = estado.x;
    remotoObjetivo.y = estado.y;
    if (salto > SALTO_TELETRANSPORTE) {
      // Se teletransportó: no lo hacemos deslizar por el mapa, aparece.
      remoto.x = estado.x;
      remoto.y = estado.y;
    }
    piedrasRemotas = Array.isArray(estado.piedras) ? estado.piedras : [];
    if (estado.stunRestante > 0) {
      stunRemotoHasta = performance.now() + estado.stunRestante;
    } else {
      stunRemotoHasta = 0;
    }
    // El host manda el estado autoritativo del par de agujeros/marcador; el
    // que se une solo lo recibe y lo pinta, nunca lo decide por su cuenta.
    if (!soyP1 && estado.agujeros !== undefined) {
      agujeros = estado.agujeros;
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
      estado.agujeros = agujeros;
      estado.puntajes = puntajes;
      estado.ganador = ganador;
    }
    return estado;
  }

  function dibujarResplandor(x, y, radio, color) {
    const brillo = ctx.createRadialGradient(x, y, radio * 0.15, x, y, radio);
    brillo.addColorStop(0, color + "aa");
    brillo.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.fillStyle = brillo;
    ctx.fill();
  }

  function dibujarNave(n, color) {
    const alto = RADIO_NAVE * 3;
    const ancho = imgNave.naturalWidth
      ? alto * (imgNave.naturalWidth / imgNave.naturalHeight)
      : alto * 0.68;

    dibujarResplandor(n.x, n.y, alto * 0.85, color);

    if (imgNave.complete && imgNave.naturalWidth) {
      ctx.drawImage(imgNave, n.x - ancho / 2, n.y - alto / 2, ancho, alto);
    } else {
      ctx.beginPath();
      ctx.arc(n.x, n.y, RADIO_NAVE, 0, Math.PI * 2);
      ctx.fillStyle = "#0d1b2e";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  function dibujarPiedras(lista, color) {
    for (const piedra of lista) {
      dibujarResplandor(piedra.x, piedra.y, RADIO_PIEDRA * 2.6, color);

      const pts = piedra.pts;
      ctx.save();
      ctx.translate(piedra.x, piedra.y);
      ctx.rotate(piedra.ang || 0);
      ctx.beginPath();
      if (pts && pts.length) {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
      } else {
        ctx.arc(0, 0, RADIO_PIEDRA, 0, Math.PI * 2);
      }
      ctx.fillStyle = "#0d1b2e";
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.restore();
    }
  }

  // Doble anillo de puntitos girando en sentidos opuestos, como los
  // cúmulos del juego real (ahí son sprites cacheados con shadowBlur; acá
  // es una versión liviana con el mismo espíritu: disco negro + dos
  // anillos, uno rápido hacia adentro).
  function dibujarAnilloPuntos(cx, cy, radio, giro, cantidad, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < cantidad; i++) {
      const ang = giro + (i / cantidad) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * radio, cy + Math.sin(ang) * radio, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function dibujarAgujero(a) {
    dibujarResplandor(a.x, a.y, RADIO_AGUJERO * 2.4, "#f19280");

    const brillo = ctx.createRadialGradient(a.x, a.y, 1, a.x, a.y, RADIO_AGUJERO);
    brillo.addColorStop(0, "#000000");
    brillo.addColorStop(1, "#1a2436");
    ctx.beginPath();
    ctx.arc(a.x, a.y, RADIO_AGUJERO, 0, Math.PI * 2);
    ctx.fillStyle = brillo;
    ctx.fill();

    dibujarAnilloPuntos(a.x, a.y, RADIO_AGUJERO, giroAgujeros, 14, "#f19280");
    dibujarAnilloPuntos(a.x, a.y, RADIO_AGUJERO * 0.55, -giroAgujeros * 1.7, 8, "#ffd9cc");
  }

  function dibujarFondo() {
    ctx.fillStyle = "#0d1b2e";
    ctx.fillRect(0, 0, viewportAncho, viewportAlto);

    // Fondo fijo a pantalla (no se mueve con la cámara), igual que
    // .game-scene::before en el sitio original: es una foto tipo "cover",
    // no una capa de parallax que se desplaza con el mundo.
    if (imgFondo.complete && imgFondo.naturalWidth) {
      const escala = Math.max(viewportAncho / imgFondo.naturalWidth, viewportAlto / imgFondo.naturalHeight);
      const w = imgFondo.naturalWidth * escala;
      const h = imgFondo.naturalHeight * escala;
      ctx.drawImage(imgFondo, (viewportAncho - w) / 2, (viewportAlto - h) / 2, w, h);
    }
  }

  function dibujarPuntaje() {
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = COLOR.p1;
    ctx.fillText(`P1: ${puntajes.p1}`, 16, 16);
    ctx.textAlign = "right";
    ctx.fillStyle = COLOR.p2;
    ctx.fillText(`P2: ${puntajes.p2}`, viewportAncho - 16, 16);
  }

  function dibujarGanador() {
    ctx.fillStyle = "rgba(5, 10, 20, 0.75)";
    ctx.fillRect(0, 0, viewportAncho, viewportAlto);
    ctx.textAlign = "center";
    ctx.fillStyle = ganador === "p1" ? COLOR.p1 : COLOR.p2;
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`Ganó ${ganador.toUpperCase()}`, viewportAncho / 2, viewportAlto / 2 - 8);
    ctx.fillStyle = "#eaf0fb";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Recargá la página para jugar de nuevo", viewportAncho / 2, viewportAlto / 2 + 20);
  }

  function dibujar() {
    // Pantalla, sin cámara: fondo fijo.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewportAncho, viewportAlto);
    dibujarFondo();

    // Mundo, con cámara: zoom centrado en la nave local (equivalente al
    // pivote de esc4-game.js, pero siempre centrado en vez de "donde sea
    // que esté la nave en pantalla" — ahí no hace falta porque no hay
    // sistema de mouse-follow que la mueva por su cuenta).
    ctx.setTransform(
      dpr * ZOOM, 0, 0, dpr * ZOOM,
      dpr * (viewportAncho / 2 - local.x * ZOOM),
      dpr * (viewportAlto / 2 - local.y * ZOOM),
    );

    for (const a of agujeros) dibujarAgujero(a);
    dibujarPiedras(piedras, soyP1 ? COLOR.p1 : COLOR.p2);
    dibujarPiedras(piedrasRemotas, soyP1 ? COLOR.p2 : COLOR.p1);
    if (!estaAturdida()) dibujarNave(local, soyP1 ? COLOR.p1 : COLOR.p2);
    if (performance.now() >= stunRemotoHasta) {
      dibujarNave(remoto, soyP1 ? COLOR.p2 : COLOR.p1);
    }

    // Pantalla otra vez: marcador y pantalla de fin, sin zoom.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dibujarPuntaje();
    if (ganador) dibujarGanador();
  }

  let alPrincipioDeFrame = null;

  function loop(ts) {
    if (ultimoTs === null) ultimoTs = ts;
    const dt = Math.min(0.05, (ts - ultimoTs) / 1000);
    ultimoTs = ts;

    // Hook para el modo práctica: el bot corre su propia simulación acá,
    // antes de que Game use sus piedras/agujeros, y sin pasar por la red.
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

  function agujerosActuales() {
    return agujeros;
  }

  function puntajesActuales() {
    return puntajes;
  }

  function mundo() {
    return { ancho: MUNDO_ANCHO, alto: MUNDO_ALTO };
  }

  return {
    init,
    iniciarLoop,
    estadoLocal,
    recibirEstadoRemoto,
    recibirReclamo,
    recibirTeletransporte,
    piedrasPropias,
    agujerosActuales,
    puntajesActuales,
    mundo,
  };
})();
