/**
 * main.js - Sistema de Monitoreo Eléctrico WattVision
 * Lógica principal del dashboard técnico de monitoreo
 * Cumple con: Fetch asíncrono (async/await/try-catch-finally), manipulación del DOM,
 * funciones de orden superior (reduce, filter, map, find, forEach, some, sort),
 * operadores avanzados, Chart.js, SweetAlert2 y Toastify.
 */

// Estado global de la aplicación
let listaDispositivos = [];
let filtroAmbienteActivo = "todos";
let filtroEstadoActivo = "todos";
let graficoConsumo = null;
let tarifaKwhBs = obtenerTarifaStorage();

// Referencias del DOM
const kpiPotenciaWatts = document.getElementById("kpi-potencia-watts");
const kpiConsumoKwh = document.getElementById("kpi-consumo-kwh");
const kpiCostoBs = document.getElementById("kpi-costo-bs");
const badgeEstadoEnVivo = document.getElementById("badge-estado-envivo");

const contenedorAlertas = document.getElementById("contenedor-alertas");
const contadorAlertasBadge = document.getElementById("contador-alertas");
const contenedorTarjetas = document.getElementById("contenedor-dispositivos");
const spinnerCarga = document.getElementById("spinner-carga");

const botonesFiltroAmbiente = document.querySelectorAll(".btn-filtro-ambiente");
const selectFiltroEstado = document.getElementById("select-filtro-estado");
const inputBuscador = document.getElementById("input-buscador-disp");

const btnAgregarDispositivo = document.getElementById("btn-agregar-dispositivo");
const btnRestablecerDatos = document.getElementById("btn-restablecer-datos");
const modalDispositivo = document.getElementById("modal-dispositivo");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const formularioDispositivo = document.getElementById("formulario-dispositivo");

const btnSimularAhorro = document.getElementById("btn-simular-ahorro");
const cajaSimuladorAhorro = document.getElementById("caja-simulador-ahorro");

/**
 * Notificación Toastify con tema técnico oscuro
 * @param {string} texto - Mensaje a mostrar
 * @param {string} tipo - "cyan" | "alert" | "lime"
 */
const notificarTecnico = (texto, tipo = "cyan") => {
  const estilos = {
    cyan: { background: "#1E1E1E", border: "1px solid #00E5FF", color: "#00E5FF" },
    alert: { background: "#3A1C1C", border: "1px solid #FF453A", color: "#FF453A" },
    lime: { background: "#1E1E1E", border: "1px solid #32D74B", color: "#32D74B" }
  };

  const config = estilos[tipo] || estilos.cyan;

  Toastify({
    text: texto,
    duration: 2600,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: config.background,
      border: config.border,
      color: config.color,
      borderRadius: "10px",
      fontFamily: "'Inter', sans-serif",
      fontSize: "13px",
      fontWeight: "600",
      boxShadow: "0 8px 24px rgba(0,0,0,0.6)"
    }
  }).showToast();
};

/**
 * Carga de datos asíncrona mediante Fetch, Async/Await y Try/Catch/Finally
 */
const inicializarDatos = async () => {
  if (spinnerCarga) spinnerCarga.classList.remove("oculto");

  try {
    const dispositivosEnStorage = obtenerDispositivosStorage();

    // Operador ternario para priorizar almacenamiento local o cargar JSON inicial
    if (dispositivosEnStorage && dispositivosEnStorage.length > 0) {
      listaDispositivos = dispositivosEnStorage;
    } else {
      const respuesta = await fetch("./data/dispositivos.json");
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      const datos = await respuesta.json();
      listaDispositivos = datos;
      guardarDispositivosStorage(listaDispositivos);
    }

    renderizarDashboardCompleto();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error de Telemetría",
      text: "No se pudieron obtener los datos de telemetría de WattVision.",
      background: "#1E1E1E",
      color: "#FFFFFF",
      confirmButtonColor: "#00E5FF"
    });
  } finally {
    if (spinnerCarga) spinnerCarga.classList.add("oculto");
  }
};

/**
 * Calcula métricas clave (KPIs) usando funciones de orden superior (reduce, filter)
 */
const calcularMetricasKPI = () => {
  // Dispositivos encendidos actualmente
  const dispositivosActivos = listaDispositivos.filter(
    (disp) => disp.estado === "activo" || disp.estado === "alerta" || disp.estado === "vampiro"
  );

  // Uso de reduce para potencia instantánea total en Watts
  const totalWatts = dispositivosActivos.reduce(
    (acum, disp) => acum + disp.potenciaWatts,
    0
  );

  // Uso de reduce para consumo acumulado en kWh
  const totalKwh = listaDispositivos.reduce(
    (acum, disp) => acum + disp.consumoKwh,
    0
  );

  // Uso de reduce para gasto total en Bolivianos (Bs.)
  const totalBs = listaDispositivos.reduce(
    (acum, disp) => acum + disp.costoBs,
    0
  );

  return { totalWatts, totalKwh, totalBs, cantidadActivos: dispositivosActivos.length };
};

/**
 * Actualiza los valores de los 3 KPIs superiores en el DOM
 */
const actualizarKpisDOM = () => {
  const { totalWatts, totalKwh, totalBs, cantidadActivos } = calcularMetricasKPI();

  kpiPotenciaWatts.textContent = `${totalWatts.toLocaleString("es-BO")} W`;
  kpiConsumoKwh.textContent = `${totalKwh.toFixed(1)} kWh`;
  kpiCostoBs.textContent = `Bs. ${totalBs.toFixed(2)}`;

  if (badgeEstadoEnVivo) {
    badgeEstadoEnVivo.textContent = `EN VIVO • ${cantidadActivos} ACTIVOS`;
  }
};

/**
 * Renderiza el Panel de Alertas en vivo
 * Identifica consumo vampiro y sobrecargas de potencia
 */
const renderizarPanelAlertas = () => {
  contenedorAlertas.innerHTML = "";

  // Filtramos dispositivos en estado 'alerta' o 'vampiro' mediante filter
  const dispositivosEnAlerta = listaDispositivos.filter(
    (disp) => disp.estado === "alerta" || disp.esVampiro === true
  );

  contadorAlertasBadge.textContent = dispositivosEnAlerta.length;

  if (dispositivosEnAlerta.length === 0) {
    contenedorAlertas.innerHTML = `
      <div class="caja-alerta-vacia">
        <i class="fa-solid fa-shield-check" style="color: #32D74B; font-size: 24px; margin-bottom: 8px;"></i>
        <p style="color: #98989D; font-size: 13px;">Sin anomalías eléctricas detectadas en el sistema.</p>
      </div>
    `;
    return;
  }

  dispositivosEnAlerta.forEach((disp) => {
    const { id, nombre, potenciaWatts, limiteWatts, ambiente, esVampiro } = disp;
    const tarjetaAlerta = document.createElement("div");
    tarjetaAlerta.className = "alerta-item";

    const esSobreLimite = potenciaWatts > limiteWatts;

    tarjetaAlerta.innerHTML = `
      <div class="alerta-icono">
        <i class="fa-solid ${esVampiro ? "fa-plug-circle-exclamation" : "fa-triangle-exclamation"}"></i>
      </div>
      <div class="alerta-info">
        <div class="alerta-titulo-fila">
          <strong class="alerta-titulo">${nombre}</strong>
          <span class="alerta-tag">${esVampiro ? "STANDBY VAMPIRO" : "PICO DE CONSUMO"}</span>
        </div>
        <p class="alerta-descripcion">
          ${esVampiro
            ? `Consume <strong>${potenciaWatts}W</strong> estando en reposo en <em>${ambiente}</em>.`
            : `Potencia actual de <strong>${potenciaWatts}W</strong> supera el umbral límite (${limiteWatts}W).`
          }
        </p>
        <button class="btn-desconectar-alerta" data-id="${id}">
          <i class="fa-solid fa-power-off"></i> Aislar / Desconectar
        </button>
      </div>
    `;

    contenedorAlertas.appendChild(tarjetaAlerta);
  });

  // Eventos de botones de desconexión en el panel de alertas
  contenedorAlertas.querySelectorAll(".btn-desconectar-alerta").forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.getAttribute("data-id"));
      conmutarEstadoDispositivo(id, "inactivo");
    });
  });
};

/**
 * Inicializa y renderiza el Gráfico de Área interactivo de 24 horas usando Chart.js
 * Cumple con el estilo de DESIGN.md: Líneas de grid #2C2C2E, datos en #00E5FF y gradiente #30D158.
 */
const renderizarGraficoArea = () => {
  const canvas = document.getElementById("grafico-consumo");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Destruir gráfico previo si ya existía para evitar solapamientos
  if (graficoConsumo) {
    graficoConsumo.destroy();
  }

  // Gradiente de área acorde al DESIGN.md (#00E5FF a #32D74B semitransparente)
  const gradiente = ctx.createLinearGradient(0, 0, 0, 300);
  gradiente.addColorStop(0, "rgba(0, 229, 255, 0.45)");
  gradiente.addColorStop(0.7, "rgba(50, 215, 75, 0.15)");
  gradiente.addColorStop(1, "rgba(30, 30, 30, 0.0)");

  // Generamos datos horarios de las últimas 24 horas simulados de la carga
  const horas = [
    "00:00", "02:00", "04:00", "06:00", "08:00", "10:00",
    "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "Ahora"
  ];

  const potenciaBase = listaDispositivos
    .filter((d) => d.estado !== "inactivo")
    .reduce((acc, d) => acc + d.potenciaWatts, 0);

  // Mapeo dinámico de datos de potencia usando función map
  const valoresWatts = [
    potenciaBase * 0.4,
    potenciaBase * 0.35,
    potenciaBase * 0.32,
    potenciaBase * 0.55,
    potenciaBase * 0.85,
    potenciaBase * 0.9,
    potenciaBase * 1.15,
    potenciaBase * 1.05,
    potenciaBase * 0.95,
    potenciaBase * 1.25,
    potenciaBase * 1.35,
    potenciaBase * 1.1,
    potenciaBase
  ].map((v) => Math.round(v));

  graficoConsumo = new Chart(ctx, {
    type: "line",
    data: {
      labels: horas,
      datasets: [
        {
          label: "Demanda en Watts (W)",
          data: valoresWatts,
          borderColor: "#00E5FF",
          borderWidth: 2,
          backgroundColor: gradiente,
          fill: true,
          tension: 0.38,
          pointBackgroundColor: "#00E5FF",
          pointBorderColor: "#121212",
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1E1E1E",
          borderColor: "#2C2C2E",
          borderWidth: 1,
          titleColor: "#FFFFFF",
          bodyColor: "#00E5FF",
          titleFont: { family: "Inter", size: 12 },
          bodyFont: { family: "JetBrains Mono", size: 13, weight: "bold" },
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (contexto) => {
              const watts = contexto.parsed.y;
              const kwhEstimado = (watts / 1000).toFixed(2);
              const bolivianos = (kwhEstimado * tarifaKwhBs).toFixed(2);
              return `${watts} W (${kwhEstimado} kW • Bs. ${bolivianos}/h)`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: "#2C2C2E", drawBorder: false },
          ticks: { color: "#98989D", font: { family: "Inter", size: 11 } }
        },
        y: {
          grid: { color: "#2C2C2E", drawBorder: false },
          ticks: {
            color: "#98989D",
            font: { family: "JetBrains Mono", size: 11 },
            callback: (val) => `${val} W`
          }
        }
      }
    }
  });
};

/**
 * Filtra y renderiza la lista y tarjetas de dispositivos
 * Usa filter, sort, forEach y destructuring
 */
const renderizarDispositivosDOM = () => {
  contenedorTarjetas.innerHTML = "";

  // Filtro por ambiente con operador ternario y filter
  let lista = filtroAmbienteActivo === "todos"
    ? [...listaDispositivos]
    : listaDispositivos.filter((d) => d.ambiente === filtroAmbienteActivo);

  // Filtro por estado
  if (filtroEstadoActivo !== "todos") {
    lista = lista.filter((d) => d.estado === filtroEstadoActivo);
  }

  // Filtro por búsqueda de texto
  const busqueda = inputBuscador.value.trim().toLowerCase();
  if (busqueda !== "") {
    lista = lista.filter((d) =>
      d.nombre.toLowerCase().includes(busqueda) ||
      d.ambiente.toLowerCase().includes(busqueda)
    );
  }

  // Ordenamiento: dispositivos con alertas o vampiros primero
  lista.sort((a, b) => (b.estado === "alerta" ? 1 : 0) - (a.estado === "alerta" ? 1 : 0));

  if (lista.length === 0) {
    contenedorTarjetas.innerHTML = `
      <div class="caja-sin-dispositivos">
        <i class="fa-solid fa-gauge-high" style="font-size: 32px; color: #98989D; margin-bottom: 8px;"></i>
        <p style="color: #98989D; font-size: 14px;">No se encontraron dispositivos con los filtros seleccionados.</p>
      </div>
    `;
    return;
  }

  // Uso de forEach para construir cada fila/tarjeta de dispositivo
  lista.forEach((disp) => {
    const { id, nombre, ambiente, potenciaWatts, consumoKwh, costoBs, estado, esVampiro, limiteWatts } = disp;
    const fila = document.createElement("div");
    fila.className = `dispositivo-fila ${estado === "alerta" ? "fila-alerta" : ""}`;

    const estaEncendido = estado !== "inactivo";
    const estadoEtiqueta = esVampiro
      ? "STANDBY VAMPIRO"
      : estado === "alerta"
      ? "SOBRECARGA"
      : estado === "activo"
      ? "NORMAL"
      : "APAGADO";

    fila.innerHTML = `
      <div class="dispositivo-col-ident">
        <div class="dispositivo-icono ${estaEncendido ? "icono-activo" : "icono-inactivo"}">
          <i class="fa-solid ${esVampiro ? "fa-plug" : "fa-bolt"}"></i>
        </div>
        <div class="dispositivo-textos">
          <span class="dispositivo-nombre">${nombre}</span>
          <span class="dispositivo-ambiente"><i class="fa-solid fa-location-dot"></i> ${ambiente}</span>
        </div>
      </div>

      <div class="dispositivo-col-potencia">
        <span class="metrica-mono ${estaEncendido ? "texto-cian" : "texto-apagado"}">${estaEncendido ? `${potenciaWatts} W` : "0 W"}</span>
        <span class="metrica-sub">Límite: ${limiteWatts}W</span>
      </div>

      <div class="dispositivo-col-consumo">
        <span class="metrica-mono">${consumoKwh.toFixed(1)} kWh</span>
        <span class="metrica-sub bolivianos">Bs. ${costoBs.toFixed(2)}</span>
      </div>

      <div class="dispositivo-col-estado">
        <span class="tag-estado tag-${estado}">${estadoEtiqueta}</span>
      </div>

      <div class="dispositivo-col-acciones">
        <!-- Switch interruptor inteligente -->
        <label class="switch-interruptor" title="${estaEncendido ? "Apagar dispositivo" : "Encender dispositivo"}">
          <input type="checkbox" class="check-interruptor" data-id="${id}" ${estaEncendido ? "checked" : ""}>
          <span class="slider-switch"></span>
        </label>
        
        <button class="btn-icono-accion btn-eliminar-disp" data-id="${id}" title="Eliminar del monitoreo">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;

    contenedorTarjetas.appendChild(fila);
  });

  // Listeners para switches de encendido/apagado
  contenedorTarjetas.querySelectorAll(".check-interruptor").forEach((chk) => {
    chk.addEventListener("change", (e) => {
      const id = Number(chk.getAttribute("data-id"));
      const nuevoEstado = e.target.checked ? "activo" : "inactivo";
      conmutarEstadoDispositivo(id, nuevoEstado);
    });
  });

  // Listeners para eliminar dispositivo
  contenedorTarjetas.querySelectorAll(".btn-eliminar-disp").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      confirmarEliminarDispositivo(id);
    });
  });
};

/**
 * Conmuta el estado de un dispositivo (activo/inactivo) y actualiza el storage
 * @param {number} idDispositivo - ID del dispositivo
 * @param {string} nuevoEstado - "activo" | "inactivo"
 */
const conmutarEstadoDispositivo = (idDispositivo, nuevoEstado) => {
  const dispositivo = listaDispositivos.find((d) => d.id === idDispositivo);
  if (!dispositivo) return;

  const { nombre } = dispositivo;
  const esApagado = nuevoEstado === "inactivo";

  // Actualizamos el storage usando la función de storage.js
  listaDispositivos = actualizarDispositivoStorage(idDispositivo, {
    estado: nuevoEstado,
    esVampiro: esApagado ? false : dispositivo.esVampiro
  });

  notificarTecnico(
    `Dispositivo "${nombre}" ${esApagado ? "desconectado" : "conectado en red"}.`,
    esApagado ? "alert" : "lime"
  );

  renderizarDashboardCompleto();
};

/**
 * Elimina un dispositivo con confirmación mediante SweetAlert2
 * @param {number} idDispositivo - ID del dispositivo
 */
const confirmarEliminarDispositivo = (idDispositivo) => {
  const dispositivo = listaDispositivos.find((d) => d.id === idDispositivo);
  const nombre = dispositivo ? dispositivo.nombre : "Dispositivo";

  Swal.fire({
    title: "¿Eliminar del monitoreo?",
    text: `Dejarás de recibir telemetría de "${nombre}".`,
    icon: "warning",
    showCancelButton: true,
    background: "#1E1E1E",
    color: "#FFFFFF",
    confirmButtonColor: "#FF453A",
    cancelButtonColor: "#2C2C2E",
    confirmButtonText: "Sí, desconectar sensor",
    cancelButtonText: "Cancelar"
  }).then((res) => {
    if (res.isConfirmed) {
      listaDispositivos = eliminarDispositivoStorage(idDispositivo);
      notificarTecnico(`"${nombre}" removido de WattVision.`, "cyan");
      renderizarDashboardCompleto();
    }
  });
};

/**
 * Registra un nuevo dispositivo/medidor inteligente mediante modal
 */
const agregarNuevoDispositivo = (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById("nuevo-disp-nombre").value.trim();
  const ambiente = document.getElementById("nuevo-disp-ambiente").value.trim();
  const potenciaWatts = Number(document.getElementById("nuevo-disp-potencia").value);
  const limiteWatts = Number(document.getElementById("nuevo-disp-limite").value) || potenciaWatts * 1.2;
  const esVampiro = document.getElementById("nuevo-disp-vampiro").checked;

  if (!nombre || !ambiente || isNaN(potenciaWatts) || potenciaWatts <= 0) {
    Swal.fire({
      icon: "error",
      title: "Parámetros incompletos",
      text: "Ingresa nombre, ambiente y potencia válida en Watts.",
      background: "#1E1E1E",
      color: "#FFFFFF",
      confirmButtonColor: "#00E5FF"
    });
    return;
  }

  // Estimación mensual aproximada (4h diarias = 120h al mes)
  const horasMes = esVampiro ? 720 : 120;
  const consumoKwhEstimado = (potenciaWatts * horasMes) / 1000;
  const costoBsEstimado = consumoKwhEstimado * tarifaKwhBs;

  const nuevoId = Date.now();
  const nuevoItem = {
    id: nuevoId,
    nombre,
    ambiente,
    potenciaWatts,
    consumoKwh: Number(consumoKwhEstimado.toFixed(1)),
    costoBs: Number(costoBsEstimado.toFixed(2)),
    estado: esVampiro ? "vampiro" : potenciaWatts > limiteWatts ? "alerta" : "activo",
    esVampiro,
    limiteWatts
  };

  listaDispositivos = [...listaDispositivos, nuevoItem];
  guardarDispositivosStorage(listaDispositivos);

  formularioDispositivo.reset();
  modalDispositivo.classList.remove("activo");

  notificarTecnico(`Sensor de telemetría "${nombre}" calibrado y conectado.`, "lime");
  renderizarDashboardCompleto();
};

/**
 * Simulador de Ahorro desconectando consumos Vampiro
 * Uso de reduce para cuantificar el ahorro en kWh y Bolivianos
 */
const calcularSimulacionAhorro = () => {
  const vampiros = listaDispositivos.filter((d) => d.esVampiro === true);

  if (vampiros.length === 0) {
    cajaSimuladorAhorro.innerHTML = `
      <div class="caja-ahorro-resultado">
        <p style="color: #32D74B; font-weight: 600;">
          <i class="fa-solid fa-circle-check"></i> ¡Excelente! No tienes cargas vampiro activas en este momento.
        </p>
      </div>
    `;
    return;
  }

  // Uso de reduce para acumular ahorro en Watts, kWh y Bs
  const potenciaVampiroTotal = vampiros.reduce((acc, d) => acc + d.potenciaWatts, 0);
  const kwhAhorroMensual = vampiros.reduce((acc, d) => acc + d.consumoKwh, 0);
  const bsAhorroMensual = vampiros.reduce((acc, d) => acc + d.costoBs, 0);
  const bsAhorroAnual = bsAhorroMensual * 12;

  cajaSimuladorAhorro.innerHTML = `
    <div class="caja-ahorro-resultado">
      <div class="ahorro-fila-stats">
        <div class="ahorro-stat">
          <span class="ahorro-etiqueta">Cargas Vampiro</span>
          <strong class="ahorro-valor" style="color: #FF453A;">${vampiros.length} equipos</strong>
        </div>
        <div class="ahorro-stat">
          <span class="ahorro-etiqueta">Potencia en Reposo</span>
          <strong class="ahorro-valor">${potenciaVampiroTotal} W</strong>
        </div>
        <div class="ahorro-stat">
          <span class="ahorro-etiqueta">Ahorro Mensual</span>
          <strong class="ahorro-valor texto-verde">Bs. ${bsAhorroMensual.toFixed(2)} (${kwhAhorroMensual.toFixed(1)} kWh)</strong>
        </div>
        <div class="ahorro-stat">
          <span class="ahorro-etiqueta">Ahorro Anual Proyectado</span>
          <strong class="ahorro-valor texto-cian">Bs. ${bsAhorroAnual.toFixed(2)}</strong>
        </div>
      </div>
      <button id="btn-aislar-todos-vampiros" class="btn-accion-cian" style="margin-top: 12px; width: 100%;">
        <i class="fa-solid fa-power-off"></i> Aislar Todos los Equipos Vampiro Ahora
      </button>
    </div>
  `;

  document.getElementById("btn-aislar-todos-vampiros").addEventListener("click", () => {
    vampiros.forEach((v) => {
      actualizarDispositivoStorage(v.id, { estado: "inactivo", esVampiro: false });
    });
    listaDispositivos = obtenerDispositivosStorage();
    notificarTecnico(`Se aislaron ${vampiros.length} consumos vampiro con éxito.`, "lime");
    renderizarDashboardCompleto();
    calcularSimulacionAhorro();
  });
};

/**
 * Restablece los datos de fábrica de WattVision
 */
const restablecerSistema = () => {
  Swal.fire({
    title: "¿Restablecer telemetría?",
    text: "Se volverán a cargar los datos originales de monitoreo de WattVision.",
    icon: "question",
    showCancelButton: true,
    background: "#1E1E1E",
    color: "#FFFFFF",
    confirmButtonColor: "#00E5FF",
    cancelButtonColor: "#2C2C2E",
    confirmButtonText: "Sí, reiniciar",
    cancelButtonText: "Cancelar"
  }).then(async (res) => {
    if (res.isConfirmed) {
      reiniciarDispositivosStorage();
      await inicializarDatos();
      notificarTecnico("Sistema restablecido a valores por defecto.", "cyan");
    }
  });
};

/**
 * Renderiza el dashboard completo actualizando KPIs, Alertas, Gráfico y Tarjetas
 */
const renderizarDashboardCompleto = () => {
  actualizarKpisDOM();
  renderizarPanelAlertas();
  renderizarGraficoArea();
  renderizarDispositivosDOM();
};

/**
 * Configuración de eventos y listeners de la interfaz
 */
const inicializarEventos = () => {
  // Filtros por ambiente
  botonesFiltroAmbiente.forEach((boton) => {
    boton.addEventListener("click", () => {
      botonesFiltroAmbiente.forEach((b) => b.classList.remove("activa"));
      boton.classList.add("activa");
      filtroAmbienteActivo = boton.getAttribute("data-ambiente");
      renderizarDispositivosDOM();
    });
  });

  // Filtro por estado
  selectFiltroEstado.addEventListener("change", (e) => {
    filtroEstadoActivo = e.target.value;
    renderizarDispositivosDOM();
  });

  // Buscador de dispositivos
  inputBuscador.addEventListener("input", renderizarDispositivosDOM);

  // Modal para agregar dispositivo
  btnAgregarDispositivo.addEventListener("click", () => modalDispositivo.classList.add("activo"));
  btnCerrarModal.addEventListener("click", () => modalDispositivo.classList.remove("activo"));
  modalDispositivo.addEventListener("click", (e) => {
    if (e.target === modalDispositivo) modalDispositivo.classList.remove("activo");
  });
  formularioDispositivo.addEventListener("submit", agregarNuevoDispositivo);

  // Botón restablecer
  btnRestablecerDatos.addEventListener("click", restablecerSistema);

  // Simulador de ahorro
  btnSimularAhorro.addEventListener("click", calcularSimulacionAhorro);
};

// Inicialización de la aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  inicializarEventos();
  inicializarDatos();
});
