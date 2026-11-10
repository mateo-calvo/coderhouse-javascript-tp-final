/**
 * storage.js
 * Módulo encargado de gestionar la persistencia de datos en LocalStorage
 * Cumple con operaciones de: guardar, modificar, borrar individual y vaciar.
 * Aplica operadores avanzados: operador OR, operador ternario y destructuring.
 */

const CLAVE_STORAGE_CARRITO = "carrito_techzone";

/**
 * Obtiene los productos guardados en LocalStorage.
 * Uso de operador OR (||) para fallback a arreglo vacío en caso de ser null.
 * @returns {Array} Listado de productos en el carrito
 */
const obtenerCarritoStorage = () => {
  const datosGuardados = localStorage.getItem(CLAVE_STORAGE_CARRITO);
  // Operador OR y operador ternario para retornar los datos parseados
  return datosGuardados ? JSON.parse(datosGuardados) : [];
};

/**
 * Guarda el array de productos del carrito en LocalStorage.
 * @param {Array} carrito - Listado actualizado de items
 */
const guardarCarritoStorage = (carrito) => {
  localStorage.setItem(CLAVE_STORAGE_CARRITO, JSON.stringify(carrito));
};

/**
 * Modifica la cantidad de unidades de un producto específico en el storage.
 * Uso de destructuring al evaluar el item.
 * @param {number} idProducto - ID del producto a modificar
 * @param {number} nuevaCantidad - Nueva cantidad de unidades
 * @returns {Array} Carrito actualizado
 */
const actualizarCantidadStorage = (idProducto, nuevaCantidad) => {
  const carritoActual = obtenerCarritoStorage();
  
  const carritoModificado = carritoActual.map((item) => {
    const { id } = item;
    // Operador ternario para actualizar la cantidad si coincide el id
    return id === idProducto ? { ...item, cantidad: nuevaCantidad } : item;
  });

  guardarCarritoStorage(carritoModificado);
  return carritoModificado;
};

/**
 * Elimina un producto específico del carrito en el storage.
 * @param {number} idProducto - ID del producto a remover
 * @returns {Array} Carrito resultante tras la eliminación
 */
const eliminarProductoStorage = (idProducto) => {
  const carritoActual = obtenerCarritoStorage();
  // Uso de filter para remover el item especificado
  const carritoFiltrado = carritoActual.filter((item) => item.id !== idProducto);
  guardarCarritoStorage(carritoFiltrado);
  return carritoFiltrado;
};

/**
 * Vacía por completo el carrito almacenado en LocalStorage.
 */
const vaciarCarritoStorage = () => {
  localStorage.removeItem(CLAVE_STORAGE_CARRITO);
};
