// Envoltorio fino sobre PeerJS: solo lo necesario para tener 1 conexión P2P
// (crear sala / unirse, mandar y recibir datos). Sin salas de más de 2, sin
// reconexión: es el prototipo mínimo para validar la sincronización.
window.Net = (function () {
  let peer = null;
  let conn = null;
  let onDataCb = null;
  let onCloseCb = null;

  function configurarConexion(onConectado) {
    conn.on("open", () => onConectado && onConectado());
    conn.on("data", (data) => onDataCb && onDataCb(data));
    conn.on("close", () => onCloseCb && onCloseCb());
  }

  function crearSala(onId, onConectado, onError) {
    peer = new Peer();
    peer.on("open", (id) => onId(id));
    peer.on("connection", (c) => {
      conn = c;
      configurarConexion(onConectado);
    });
    peer.on("error", (err) => onError && onError(err));
  }

  function unirseASala(idRemoto, onConectado, onError) {
    peer = new Peer();
    peer.on("open", () => {
      conn = peer.connect(idRemoto, { reliable: false });
      configurarConexion(onConectado);
    });
    peer.on("error", (err) => onError && onError(err));
  }

  function enviar(data) {
    if (conn && conn.open) conn.send(data);
  }

  function alRecibir(cb) {
    onDataCb = cb;
  }

  function alCerrar(cb) {
    onCloseCb = cb;
  }

  return { crearSala, unirseASala, enviar, alRecibir, alCerrar };
})();
