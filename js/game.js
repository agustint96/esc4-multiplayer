// Prototipo de movimiento: una nave local controlada por teclado y una nave
// remota que se suaviza hacia la última posición recibida por red. Sin
// piedras, sin agujeros, sin choque todavía — solo para validar que la
// sincronización se sienta bien antes de sumarle el resto de las mecánicas.
window.Game = (function () {
  const ACELERACION = 900; // px/s² del mundo
  const FRICCION = 3.5; // 1/s: qué tan rápido frena al soltar las teclas
  const VELOCIDAD_MAX = 260; // px/s
  const RADIO_NAVE = 16; // px, para colisión futura (choque y piedras)
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
  let ultimoTs = null;

  const teclas = { up: false, down: false, left: false, right: false };

  function crearNave(x, y) {
    return { x, y, vx: 0, vy: 0 };
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
  }

  function ajustarTamano() {
    ancho = canvas.width = window.innerWidth;
    alto = canvas.height = window.innerHeight;
  }

  function cambiarTecla(ev, valor) {
    const accion = MAPA_TECLAS[ev.key];
    if (!accion) return;
    teclas[accion] = valor;
    ev.preventDefault();
  }

  function actualizar(dt) {
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

    local.vx += ax * dt;
    local.vy += ay * dt;

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
  }

  function recibirEstadoRemoto(estado) {
    remotoObjetivo.x = estado.x;
    remotoObjetivo.y = estado.y;
  }

  function estadoLocal() {
    return { x: local.x, y: local.y, t: performance.now() };
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

  function dibujar() {
    ctx.fillStyle = "#0d1b2e";
    ctx.fillRect(0, 0, ancho, alto);

    dibujarNave(local, soyP1 ? COLOR.p1 : COLOR.p2);
    dibujarNave(remoto, soyP1 ? COLOR.p2 : COLOR.p1);
  }

  function loop(ts) {
    if (ultimoTs === null) ultimoTs = ts;
    const dt = Math.min(0.05, (ts - ultimoTs) / 1000);
    ultimoTs = ts;

    actualizar(dt);
    dibujar();

    requestAnimationFrame(loop);
  }

  function iniciarLoop() {
    requestAnimationFrame(loop);
  }

  return { init, iniciarLoop, estadoLocal, recibirEstadoRemoto };
})();
