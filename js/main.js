/**
 * main.js
 * Lógica principal del simulador de tienda online TechZone
 * Integra carga asíncrona de datos con fetch (async/await/try-catch-finally),
 * manipulación dinámica del DOM, funciones de orden superior,
 * operadores avanzados, librerías externas (SweetAlert2 y Toastify) y checkout completo.
 */

// Estado global de la aplicación
let productosDisponibles = [];
let carritoCompras = obtenerCarritoStorage();
let categoriaActiva = "todas";
let busquedaActiva = "";
let ordenActivo = "defecto";

// Referencias a elementos del DOM
const contenedorProductos = document.getElementById("contenedor-productos");
const contenedorCarrito = document.getElementById("contenedor-carrito");
const contadorCarritoBadge = document.getElementById("contador-carrito");
const textoTotalCarrito = document.getElementById("total-carrito");
const textoCantidadItems = document.getElementById("cantidad-items-carrito");
const panelCarrito = document.getElementById("panel-carrito");
const overlayCarrito = document.getElementById("overlay-carrito");
const botonAbrirCarrito = document.getElementById("btn-abrir-carrito");
const botonCerrarCarrito = document.getElementById("btn-cerrar-carrito");
const botonVaciarCarrito = document.getElementById("btn-vaciar-carrito");
const botonIniciarCompra = document.getElementById("btn-iniciar-compra");
const inputBuscador = document.getElementById("input-buscador");
const selectOrden = document.getElementById("select-orden");
const botonesCategorias = document.querySelectorAll(".btn-categoria");
const modalCheckout = document.getElementById("modal-checkout");
const botonCerrarModal = document.getElementById("btn-cerrar-modal");
const formularioCheckout = document.getElementById("formulario-checkout");
const contenedorSpinner = document.getElementById("spinner-carga");
const totalModalCheckout = document.getElementById("total-modal-checkout");
const selectMetodoPago = document.getElementById("metodo-pago");
const textoDescuentoModal = document.getElementById("descuento-modal-checkout");

/**
 * Notificación rápida flotante mediante Toastify
 * @param {string} mensaje - Texto descriptivo
 * @param {string} tipo - "success" | "warning" | "danger"
 */
const mostrarNotificacion = (mensaje, tipo = "success") => {
  const colores = {
    success: "linear-gradient(to right, #00b09b, #96c93d)",
    warning: "linear-gradient(to right, #f7b733, #fc4a1a)",
    danger: "linear-gradient(to right, #ff416c, #ff4b2b)"
  };

  Toastify({
    text: mensaje,
    duration: 2500,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: colores[tipo] || colores.success,
      borderRadius: "10px",
      fontWeight: "500",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
    }
  }).showToast();
};

/**
 * Carga de datos asíncrona mediante Fetch, Async/Await y bloque Try/Catch/Finally
 */
const cargarProductos = async () => {
  // Mostramos el spinner de carga al iniciar
  if (contenedorSpinner) {
    contenedorSpinner.classList.remove("oculto");
  }

  try {
    const respuesta = await fetch("./data/productos.json");

    if (!respuesta.ok) {
      throw new Error(`Error en la petición HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    productosDisponibles = datos;

    // Renderizado inicial con los datos obtenidos
    filtrarYRenderizarCatalogo();
  } catch (error) {
    contenedorProductos.innerHTML = `
      <div class="mensaje-error">
        <h3>Hubo un problema al cargar los productos</h3>
        <p>Por favor, recarga la página o intenta de nuevo más tarde.</p>
        <button id="btn-reintentar" class="btn btn-primario">Reintentar</button>
      </div>
    `;

    const botonReintentar = document.getElementById("btn-reintentar");
    if (botonReintentar) {
      botonReintentar.addEventListener("click", cargarProductos);
    }

    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudieron obtener los productos desde el servidor local.",
      confirmButtonColor: "#3b82f6"
    });
  } finally {
    // El bloque finally siempre se ejecuta, ocultando el spinner de carga
    if (contenedorSpinner) {
      contenedorSpinner.classList.add("oculto");
    }
  }
};

/**
 * Aplica filtros de categoría, búsqueda y ordenamiento usando funciones de orden superior
 * (filter, sort, forEach)
 */
const filtrarYRenderizarCatalogo = () => {
  // Filtro por categoría con operador ternario y filter
  let productosFiltrados = categoriaActiva === "todas"
    ? [...productosDisponibles]
    : productosDisponibles.filter((prod) => prod.categoria === categoriaActiva);

  // Filtro por término de búsqueda con filter
  if (busquedaActiva.trim() !== "") {
    const busquedaMinuscula = busquedaActiva.toLowerCase().trim();
    productosFiltrados = productosFiltrados.filter((prod) =>
      prod.nombre.toLowerCase().includes(busquedaMinuscula) ||
      prod.descripcion.toLowerCase().includes(busquedaMinuscula)
    );
  }

  // Ordenamiento con sort y operadores ternarios
  if (ordenActivo === "precio-menor") {
    productosFiltrados.sort((a, b) => a.precio - b.precio);
  } else if (ordenActivo === "precio-mayor") {
    productosFiltrados.sort((a, b) => b.precio - a.precio);
  } else if (ordenActivo === "nombre-az") {
    productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  renderizarTarjetasProductos(productosFiltrados);
};

/**
 * Renderiza dinámicamente las tarjetas de productos en el catálogo
 * Uso de forEach y Destructuring
 * @param {Array} lista - Array de objetos de productos a mostrar
 */
const renderizarTarjetasProductos = (lista) => {
  contenedorProductos.innerHTML = "";

  if (lista.length === 0) {
    contenedorProductos.innerHTML = `
      <div class="sin-resultados">
        <i class="fa-solid fa-box-open icono-sin-resultados"></i>
        <h3>No se encontraron productos</h3>
        <p>Intenta con otra palabra clave o selecciona otra categoría.</p>
      </div>
    `;
    return;
  }

  // Uso de forEach para recorrer y renderizar cada producto
  lista.forEach((producto) => {
    // Destructuring del objeto producto
    const { id, nombre, categoria, precio, stock, imagen, descripcion } = producto;

    // Verificamos cuántas unidades ya están en el carrito
    const itemEnCarrito = carritoCompras.find((item) => item.id === id);
    const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
    const stockDisponible = stock - cantidadEnCarrito;
    const hayStock = stockDisponible > 0;

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-producto";
    tarjeta.innerHTML = `
      <div class="tarjeta-imagen-contenedor">
        <img src="${imagen}" alt="${nombre}" loading="lazy" class="tarjeta-imagen" />
        <span class="badge-categoria">${categoria.toUpperCase()}</span>
      </div>
      <div class="tarjeta-cuerpo">
        <h3 class="tarjeta-titulo">${nombre}</h3>
        <p class="tarjeta-descripcion">${descripcion}</p>
        <div class="tarjeta-detalles">
          <span class="tarjeta-precio">$${precio.toLocaleString("es-AR")}</span>
          <span class="tarjeta-stock ${hayStock ? "stock-ok" : "stock-agotado"}">
            ${hayStock ? `Stock: ${stockDisponible}` : "Agotado"}
          </span>
        </div>
        <button 
          class="btn ${hayStock ? "btn-primario" : "btn-deshabilitado"} btn-agregar" 
          data-id="${id}"
          ${hayStock ? "" : "disabled"}
        >
          <i class="fa-solid fa-cart-plus"></i> ${hayStock ? "Agregar al Carrito" : "Sin Stock"}
        </button>
      </div>
    `;

    contenedorProductos.appendChild(tarjeta);
  });

  // Asignación de eventos a los botones de agregar
  const botonesAgregar = contenedorProductos.querySelectorAll(".btn-agregar");
  botonesAgregar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const idSeleccionado = Number(boton.getAttribute("data-id"));
      agregarProductoAlCarrito(idSeleccionado);
    });
  });
};

/**
 * Agrega un producto al carrito respetando el stock disponible
 * Uso de find, some, destructuring y persistencia en LocalStorage
 * @param {number} idProducto - ID del producto a agregar
 */
const agregarProductoAlCarrito = (idProducto) => {
  // Buscamos el producto en el catálogo mediante la función de orden superior find
  const productoSeleccionado = productosDisponibles.find((prod) => prod.id === idProducto);

  if (!productoSeleccionado) return;

  const { id, nombre, precio, stock, imagen } = productoSeleccionado;

  // Verificamos si ya existe en el carrito usando la función de orden superior some
  const yaExiste = carritoCompras.some((item) => item.id === id);

  if (yaExiste) {
    const itemExistente = carritoCompras.find((item) => item.id === id);

    if (itemExistente.cantidad >= stock) {
      Swal.fire({
        icon: "warning",
        title: "Límite de stock alcanzado",
        text: `No disponemos de más de ${stock} unidades de "${nombre}".`,
        confirmButtonColor: "#3b82f6"
      });
      return;
    }

    // Incrementamos la cantidad y actualizamos en storage
    carritoCompras = actualizarCantidadStorage(id, itemExistente.cantidad + 1);
    mostrarNotificacion(`Se añadió otra unidad de "${nombre}"`, "success");
  } else {
    // Si no existía, lo incorporamos al carrito
    const nuevoItem = {
      id,
      nombre,
      precio,
      stock,
      imagen,
      cantidad: 1
    };

    carritoCompras = [...carritoCompras, nuevoItem];
    guardarCarritoStorage(carritoCompras);
    mostrarNotificacion(`"${nombre}" añadido al carrito`, "success");
  }

  actualizarVistaCarrito();
  filtrarYRenderizarCatalogo();
};

/**
 * Modifica la cantidad de unidades de un producto dentro del carrito
 * @param {number} idProducto - ID del producto
 * @param {number} cambio - Cantidad a sumar o restar (+1 ó -1)
 */
const modificarCantidadProducto = (idProducto, cambio) => {
  const item = carritoCompras.find((prod) => prod.id === idProducto);
  if (!item) return;

  const nuevaCantidad = item.cantidad + cambio;

  if (nuevaCantidad > item.stock) {
    Swal.fire({
      icon: "info",
      title: "Stock máximo",
      text: `Has alcanzado el límite de existencias (${item.stock} unidades).`,
      confirmButtonColor: "#3b82f6"
    });
    return;
  }

  if (nuevaCantidad <= 0) {
    eliminarProductoDelCarrito(idProducto);
    return;
  }

  carritoCompras = actualizarCantidadStorage(idProducto, nuevaCantidad);
  actualizarVistaCarrito();
  filtrarYRenderizarCatalogo();
};

/**
 * Elimina un producto específico del carrito con confirmación previa visual o notificación
 * @param {number} idProducto - ID del producto a eliminar
 */
const eliminarProductoDelCarrito = (idProducto) => {
  const itemAEliminar = carritoCompras.find((item) => item.id === idProducto);
  const nombreProducto = itemAEliminar ? itemAEliminar.nombre : "Producto";

  carritoCompras = eliminarProductoStorage(idProducto);
  mostrarNotificacion(`"${nombreProducto}" eliminado del carrito`, "warning");

  actualizarVistaCarrito();
  filtrarYRenderizarCatalogo();
};

/**
 * Vacía la totalidad del carrito solicitando confirmación con SweetAlert2
 */
const vaciarCarritoCompleto = () => {
  if (carritoCompras.length === 0) {
    mostrarNotificacion("El carrito ya está vacío", "warning");
    return;
  }

  Swal.fire({
    title: "¿Vaciar el carrito?",
    text: "Esta acción quitará todos los productos seleccionados.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar"
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      vaciarCarritoStorage();
      carritoCompras = [];
      actualizarVistaCarrito();
      filtrarYRenderizarCatalogo();

      Swal.fire({
        title: "¡Carrito vaciado!",
        text: "Tu carrito se encuentra ahora sin productos.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
};

/**
 * Calcula los totales acumulados del carrito utilizando la función de orden superior reduce
 * @returns {Object} { totalDinero, totalUnidades }
 */
const calcularTotalesCarrito = () => {
  // Uso de reduce para acumular dinero total
  const totalDinero = carritoCompras.reduce(
    (acumulador, item) => acumulador + item.precio * item.cantidad,
    0
  );

  // Uso de reduce para sumar cantidad total de unidades
  const totalUnidades = carritoCompras.reduce(
    (acumulador, item) => acumulador + item.cantidad,
    0
  );

  return { totalDinero, totalUnidades };
};

/**
 * Actualiza el DOM del panel lateral del carrito, badges y totales
 * Uso de forEach y destructuring
 */
const actualizarVistaCarrito = () => {
  const { totalDinero, totalUnidades } = calcularTotalesCarrito();

  // Actualizar badge del header
  contadorCarritoBadge.textContent = totalUnidades;
  contadorCarritoBadge.classList.toggle("activo", totalUnidades > 0);

  // Actualizar totales en el pie del carrito
  textoTotalCarrito.textContent = `$${totalDinero.toLocaleString("es-AR")}`;
  textoCantidadItems.textContent = `${totalUnidades} ${totalUnidades === 1 ? "unidad" : "unidades"}`;

  contenedorCarrito.innerHTML = "";

  if (carritoCompras.length === 0) {
    contenedorCarrito.innerHTML = `
      <div class="carrito-vacio">
        <i class="fa-solid fa-cart-shopping icono-carrito-vacio"></i>
        <p>Tu carrito está vacío</p>
        <span class="subtexto-carrito">¡Explora nuestro catálogo y suma tecnología de primera!</span>
      </div>
    `;
    botonIniciarCompra.setAttribute("disabled", "true");
    botonIniciarCompra.classList.add("btn-deshabilitado");
    return;
  }

  botonIniciarCompra.removeAttribute("disabled");
  botonIniciarCompra.classList.remove("btn-deshabilitado");

  // Renderizar cada item del carrito usando forEach
  carritoCompras.forEach((item) => {
    const { id, nombre, precio, imagen, cantidad, stock } = item;
    const subtotal = precio * cantidad;

    const elementoItem = document.createElement("div");
    elementoItem.className = "item-carrito";
    elementoItem.innerHTML = `
      <img src="${imagen}" alt="${nombre}" class="item-carrito-img" />
      <div class="item-carrito-info">
        <h4 class="item-carrito-titulo">${nombre}</h4>
        <span class="item-carrito-precio">$${precio.toLocaleString("es-AR")} c/u</span>
        <span class="item-carrito-subtotal">Subtotal: $${subtotal.toLocaleString("es-AR")}</span>
        <div class="item-carrito-controles">
          <button class="btn-control btn-restar" data-id="${id}" title="Restar">-</button>
          <span class="item-carrito-cantidad">${cantidad}</span>
          <button class="btn-control btn-sumar" data-id="${id}" title="Sumar" ${cantidad >= stock ? "disabled" : ""}>+</button>
          <button class="btn-eliminar-item" data-id="${id}" title="Quitar item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;

    contenedorCarrito.appendChild(elementoItem);
  });

  // Eventos de botones dentro del carrito
  contenedorCarrito.querySelectorAll(".btn-sumar").forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.getAttribute("data-id"));
      modificarCantidadProducto(id, 1);
    });
  });

  contenedorCarrito.querySelectorAll(".btn-restar").forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.getAttribute("data-id"));
      modificarCantidadProducto(id, -1);
    });
  });

  contenedorCarrito.querySelectorAll(".btn-eliminar-item").forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.getAttribute("data-id"));
      eliminarProductoDelCarrito(id);
    });
  });
};

/**
 * Control del panel lateral (Offcanvas) del carrito
 */
const alternarCarrito = (abrir) => {
  if (abrir) {
    panelCarrito.classList.add("abierto");
    overlayCarrito.classList.add("visible");
    document.body.style.overflow = "hidden";
  } else {
    panelCarrito.classList.remove("abierto");
    overlayCarrito.classList.remove("visible");
    document.body.style.overflow = "auto";
  }
};

/**
 * Modal de Checkout y Proceso Final de Compra
 */
const abrirModalCheckout = () => {
  if (carritoCompras.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Carrito vacío",
      text: "Agrega al menos un producto para proceder al pago.",
      confirmButtonColor: "#3b82f6"
    });
    return;
  }

  actualizarResumenModal();
  modalCheckout.classList.add("activo");
  alternarCarrito(false);
};

const cerrarModalCheckout = () => {
  modalCheckout.classList.remove("activo");
};

/**
 * Calcula descuento o recargo según método de pago y actualiza el modal
 */
const actualizarResumenModal = () => {
  const { totalDinero } = calcularTotalesCarrito();
  const metodoSeleccionado = selectMetodoPago.value;

  // Operador ternario para aplicar 10% de descuento en transferencia
  const aplicaDescuento = metodoSeleccionado === "transferencia";
  const porcentajeDescuento = aplicaDescuento ? 0.10 : 0;
  const montoDescuento = totalDinero * porcentajeDescuento;
  const totalFinal = totalDinero - montoDescuento;

  if (aplicaDescuento) {
    textoDescuentoModal.innerHTML = `
      <span class="descuento-aplicado">
        ¡Descuento del 10% por transferencia aplicado! (-$${montoDescuento.toLocaleString("es-AR")})
      </span>
    `;
  } else {
    textoDescuentoModal.innerHTML = "";
  }

  totalModalCheckout.textContent = `$${totalFinal.toLocaleString("es-AR")}`;
};

/**
 * Procesa la orden de compra y muestra comprobante con SweetAlert2
 */
const procesarOrdenCompra = (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById("nombre-comprador").value.trim();
  const email = document.getElementById("email-comprador").value.trim();
  const telefono = document.getElementById("telefono-comprador").value.trim();
  const direccion = document.getElementById("direccion-comprador").value.trim();
  const metodoPago = selectMetodoPago.value;

  if (!nombre || !email || !telefono || !direccion) {
    Swal.fire({
      icon: "error",
      title: "Campos incompletos",
      text: "Por favor, completa todos los datos obligatorios del formulario.",
      confirmButtonColor: "#3b82f6"
    });
    return;
  }

  // Generar número de orden aleatorio único
  const numeroOrden = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const { totalDinero } = calcularTotalesCarrito();
  const montoFinal = metodoPago === "transferencia" ? totalDinero * 0.90 : totalDinero;

  // Estructuramos el detalle de los productos adquiridos con map
  const listaComprada = carritoCompras
    .map((item) => `• ${item.cantidad}x ${item.nombre} ($${(item.precio * item.cantidad).toLocaleString("es-AR")})`)
    .join("<br>");

  // Simulación de procesamiento con loading de SweetAlert2
  Swal.fire({
    title: "Procesando tu compra...",
    html: "Por favor aguarda unos instantes mientras confirmamos la orden.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    timer: 1800
  }).then(() => {
    // Éxito: presentaremos el ticket y vaciaremos el carrito
    cerrarModalCheckout();
    formularioCheckout.reset();

    Swal.fire({
      icon: "success",
      title: "¡Compra confirmada con éxito!",
      html: `
        <div style="text-align: left; font-size: 0.95rem; margin-top: 10px;">
          <p><strong>N° de Orden:</strong> <span style="color:#3b82f6;">#${numeroOrden}</span></p>
          <p><strong>Comprador:</strong> ${nombre}</p>
          <p><strong>Email de confirmación:</strong> ${email}</p>
          <p><strong>Dirección de entrega:</strong> ${direccion}</p>
          <p><strong>Método de pago:</strong> ${metodoPago.toUpperCase()}</p>
          <hr style="margin: 10px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p><strong>Detalle de productos:</strong></p>
          <div style="background: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 0.88rem; max-height: 120px; overflow-y: auto;">
            ${listaComprada}
          </div>
          <hr style="margin: 10px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 1.1rem; text-align: right;"><strong>Total abonado: $${montoFinal.toLocaleString("es-AR")}</strong></p>
        </div>
      `,
      confirmButtonText: "Entendido, ¡muchas gracias!",
      confirmButtonColor: "#10b981"
    });

    // Vaciar el carrito y persistencia
    vaciarCarritoStorage();
    carritoCompras = [];
    actualizarVistaCarrito();
    filtrarYRenderizarCatalogo();
  });
};

/**
 * Inicialización de listeners y eventos de la aplicación
 */
const inicializarEventos = () => {
  // Panel lateral de carrito
  botonAbrirCarrito.addEventListener("click", () => alternarCarrito(true));
  botonCerrarCarrito.addEventListener("click", () => alternarCarrito(false));
  overlayCarrito.addEventListener("click", () => alternarCarrito(false));
  botonVaciarCarrito.addEventListener("click", vaciarCarritoCompleto);

  // Modal checkout
  botonIniciarCompra.addEventListener("click", abrirModalCheckout);
  botonCerrarModal.addEventListener("click", cerrarModalCheckout);
  selectMetodoPago.addEventListener("change", actualizarResumenModal);
  formularioCheckout.addEventListener("submit", procesarOrdenCompra);

  // Cerrar modal al hacer click fuera
  modalCheckout.addEventListener("click", (e) => {
    if (e.target === modalCheckout) cerrarModalCheckout();
  });

  // Filtros por categorías
  botonesCategorias.forEach((boton) => {
    boton.addEventListener("click", () => {
      botonesCategorias.forEach((b) => b.classList.remove("activa"));
      boton.classList.add("activa");
      categoriaActiva = boton.getAttribute("data-categoria");
      filtrarYRenderizarCatalogo();
    });
  });

  // Buscador interactivo en vivo con evento input
  inputBuscador.addEventListener("input", (evento) => {
    busquedaActiva = evento.target.value;
    filtrarYRenderizarCatalogo();
  });

  // Selector de ordenamiento
  selectOrden.addEventListener("change", (evento) => {
    ordenActivo = evento.target.value;
    filtrarYRenderizarCatalogo();
  });
};

/**
 * Punto de entrada principal cuando el DOM está listo
 */
document.addEventListener("DOMContentLoaded", () => {
  inicializarEventos();
  actualizarVistaCarrito();
  cargarProductos();
});
