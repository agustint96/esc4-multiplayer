// Conecta el lobby (crear/unirse a sala) con Net y Game, y arranca el envío
// periódico del estado local una vez que la conexión está abierta.
(function () {
  const lobby = document.getElementById("lobby");
  const canvas = document.getElementById("juego");
  const btnCrear = document.getElementById("btn-crear");
  const btnUnirse = document.getElementById("btn-unirse");
  const btnBot = document.getElementById("btn-bot");
  const inputCodigo = document.getElementById("input-codigo");
  const estadoEl = document.getElementById("estado");
  const codigoWrap = document.getElementById("codigo-wrap");
  const codigoPropio = document.getElementById("codigo-propio");

  const ENVIO_HZ = 20;

  function empezarJuego(esP1) {
    lobby.style.display = "none";
    canvas.style.display = "block";

    // Si el rival (no yo) anota, el host me tiene que avisar que me
    // teletransporta — yo no puedo mover su nave desde acá.
    Game.init(canvas, esP1, (x, y) => Net.enviar({ tipo: "teletransportar", x, y }));
    Game.iniciarLoop();

    Net.alRecibir((msg) => {
      if (msg.tipo === "reclamo") Game.recibirReclamo(msg);
      else if (msg.tipo === "teletransportar") Game.recibirTeletransporte(msg);
      else Game.recibirEstadoRemoto(msg);
    });
    setInterval(() => Net.enviar(Game.estadoLocal()), 1000 / ENVIO_HZ);
  }

  function empezarModoBot() {
    lobby.style.display = "none";
    canvas.style.display = "block";

    // El humano siempre es P1/host en modo práctica; si el bot (P2) anota,
    // lo teletransporto yo mismo en vez de mandarlo por red.
    Game.init(canvas, true, (x, y) => Bot.teletransportar(x, y));
    Bot.init(Game.mundo());

    Game.iniciarLoop((dt) => {
      Bot.actualizar(dt, Game.piedrasPropias(), Game.agujerosActuales(), (agujeroId) => {
        Game.recibirReclamo({ jugador: "p2", agujeroId });
      });
      Game.recibirEstadoRemoto(Bot.estado());
    });
  }

  btnCrear.addEventListener("click", () => {
    btnCrear.disabled = true;
    estadoEl.textContent = "Creando sala...";
    Net.crearSala(
      (id) => {
        codigoPropio.textContent = id;
        codigoWrap.classList.remove("oculto");
        estadoEl.textContent = "Esperando al otro jugador...";
      },
      () => {
        estadoEl.textContent = "¡Conectado!";
        empezarJuego(true); // quien crea la sala es P1 (naves azules)
      },
      (err) => {
        estadoEl.textContent = "Error: " + err;
        btnCrear.disabled = false;
      }
    );
  });

  btnUnirse.addEventListener("click", () => {
    const id = inputCodigo.value.trim();
    if (!id) return;
    btnUnirse.disabled = true;
    estadoEl.textContent = "Conectando...";
    Net.unirseASala(
      id,
      () => {
        estadoEl.textContent = "¡Conectado!";
        empezarJuego(false); // quien se une es P2 (naves rojas)
      },
      (err) => {
        estadoEl.textContent = "Error: " + err;
        btnUnirse.disabled = false;
      }
    );
  });

  btnBot.addEventListener("click", () => empezarModoBot());
})();
